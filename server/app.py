import os
import re
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import linear_kernel
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import load_npz
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# --- SERVER CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Critical for PythonAnywhere: NLTK requires local data downloads
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Load data using absolute paths to prevent "File Not Found" on the server
# Note: Ensure your file names match your actual files on PythonAnywhere
df = pd.read_csv(os.path.join(BASE_DIR, "data/dataset.csv"), engine="python")
tf_idf_matrix = load_npz(os.path.join(BASE_DIR, "data/tfidf_matrixf.npz"))

app = Flask(__name__)
CORS(app)

# --- UTILITY & PREPROCESSING ---

def normalize_for_search(text):
    if not isinstance(text, str): return ""
    text = text.lower().replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text)

stop_words = set(stopwords.words("english"))

def clean_genres_text(text):
    if not isinstance(text, str): return ""
    text = re.sub(r"[^a-zA-Z\s]", "", text).lower()
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words]
    return " ".join(tokens)

# Prepare all columns needed for the logic
df["genres"] = df["genres"].fillna("")
df["Cleaned_genres"] = df["genres"].apply(clean_genres_text)
df["keywords"] = df["keywords"].fillna("")
df["Cleaned_keywords"] = df["keywords"].apply(lambda x: clean_genres_text(x) if pd.notna(x) else "")
df["norm_title"] = df["title"].apply(normalize_for_search)
df["genre_set"] = df["Cleaned_genres"].apply(lambda x: set(x.split()) if x.strip() else set())

def create_stage2_text(row):
    overview = str(row.get("overview", "")) if pd.notna(row.get("overview")) else ""
    genres = str(row.get("Cleaned_genres", ""))
    keywords = str(row.get("Cleaned_keywords", ""))
    return ((overview + " ") * 1 + (genres + " ") * 2 + (keywords + " ") * 2).strip()

df["stage2_text"] = df.apply(create_stage2_text, axis=1)

# Global Vectorizer for Reranking
stage2_vectorizer = TfidfVectorizer(max_features=2000)
stage2_matrix = stage2_vectorizer.fit_transform(df["stage2_text"])

# Masks for Movie vs Series separation
if "is_movie" in df.columns:
    movie_indices = np.where(df["is_movie"] == 1)[0].tolist()
    series_indices = np.where(df["is_movie"] == 0)[0].tolist()
    movie_matrix = tf_idf_matrix[movie_indices]
    series_matrix = tf_idf_matrix[series_indices]
else:
    movie_indices = df.index.tolist()
    series_indices = []
    movie_matrix = tf_idf_matrix
    series_matrix = None

# --- RECOMMENDATION CORE ---

def similarity_score(a, b):
    score = 0
    for i in range(len(a)):
        for j in range(i+1, len(a)+1):
            sub = a[i:j]
            if sub in b: score += len(sub)
    return score / (len(b) + 1)

def recommendation_function(idx, top_n=225, penalty_no_overlap=0.1):
    main_genres = df.loc[idx, "genre_set"]
    
    def f1_score(overlap, candidate_count, main_count):
        if candidate_count == 0 or main_count == 0 or overlap == 0: return 0
        p, r = overlap/candidate_count, overlap/main_count
        return 2 * p * r / (p + r)

    # Score Movies
    sim_movie = linear_kernel(tf_idf_matrix[idx:idx+1], movie_matrix).flatten()
    movie_scores = []
    for i, score in zip(movie_indices, sim_movie):
        if i == idx: continue
        cand_genres = df.loc[i, "genre_set"]
        overlap = len(main_genres & cand_genres)
        f1 = f1_score(overlap, len(cand_genres), len(main_genres))
        final = (score - penalty_no_overlap) if overlap == 0 else (score + f1 * 0.2)
        movie_scores.append((i, final, overlap, f1))
    
    # Score Series
    series_scores = []
    if series_matrix is not None:
        sim_series = linear_kernel(tf_idf_matrix[idx:idx+1], series_matrix).flatten()
        for i, score in zip(series_indices, sim_series):
            if i == idx: continue
            cand_genres = df.loc[i, "genre_set"]
            overlap = len(main_genres & cand_genres)
            f1 = f1_score(overlap, len(cand_genres), len(main_genres))
            final = (score - penalty_no_overlap) if overlap == 0 else (score + f1 * 0.15)
            series_scores.append((i, final, overlap, f1))

    return idx, sorted(movie_scores, key=lambda x: x[1], reverse=True)[:top_n], \
                sorted(series_scores, key=lambda x: x[1], reverse=True)[:top_n]

def stage2_rerank(main_idx, movie_candidates, series_candidates):
    def rerank_list(candidates):
        if not candidates: return []
        c_idxs = [x[0] for x in candidates]
        sims = linear_kernel(stage2_matrix[main_idx:main_idx+1], stage2_matrix[c_idxs]).flatten()
        main_keywords = set(str(df.loc[main_idx, "Cleaned_keywords"]).split())
        
        results = []
        for (idx, _, _, _), sim in zip(candidates, sims):
            c_keywords = set(str(df.loc[idx, "Cleaned_keywords"]).split())
            g_overlap = len(df.loc[main_idx, "genre_set"] & df.loc[idx, "genre_set"])
            k_overlap = len(main_keywords & c_keywords)
            # Final logic weight from your new code
            score = sim + (g_overlap * 0.2) + (k_overlap * 0.1)
            results.append((idx, score, g_overlap, k_overlap))
        return sorted(results, key=lambda x: x[1], reverse=True)

    return rerank_list(movie_candidates), rerank_list(series_candidates)

def build_movie_dict(idx):
    """Restores the massive dictionary from your new code to ensure frontend compatibility."""
    row = df.iloc[idx]
    # Handle the 'is_movie' logic carefully
    is_movie_val = int(row.get("is_movie", 1)) if pd.notna(row.get("is_movie")) else 1
    
    data = {
        "index": int(idx),
        "id": row.get("id") if pd.notna(row.get("id")) else 0,
        "title": row.get("title") if pd.notna(row.get("title")) else "Unknown",
        "original_title": row.get("original_title") if pd.notna(row.get("original_title")) else "",
        "release_date": row.get("release_date") if pd.notna(row.get("release_date")) else "",
        "genres": row.get("genres") if pd.notna(row.get("genres")) else "",
        "overview": row.get("overview") if pd.notna(row.get("overview")) else "",
        "poster_url": row.get("poster_path") if pd.notna(row.get("poster_path")) else None,
        "backdrop_path": row.get("backdrop_path") if pd.notna(row.get("backdrop_path")) else "",
        "rating": float(row.get("vote_average", 0)) if pd.notna(row.get("vote_average")) else 0.0,
        "vote_average": float(row.get("vote_average", 0)) if pd.notna(row.get("vote_average")) else 0.0,
        "vote_count": int(row.get("vote_count", 0)) if pd.notna(row.get("vote_count")) else 0,
        "popularity": float(row.get("popularity", 0)) if pd.notna(row.get("popularity")) else 0.0,
        "runtime": int(row.get("runtime", 0)) if pd.notna(row.get("runtime")) else 0,
        "status": row.get("status") if pd.notna(row.get("status")) else "",
        "revenue": int(row.get("revenue", 0)) if pd.notna(row.get("revenue")) else 0,
        "budget": int(row.get("budget", 0)) if pd.notna(row.get("budget")) else 0,
        "tagline": row.get("tagline") if pd.notna(row.get("tagline")) else "",
        "homepage": row.get("homepage") if pd.notna(row.get("homepage")) else "",
        "imdb_id": row.get("imdb_id") if pd.notna(row.get("imdb_id")) else "",
        "original_language": row.get("original_language") if pd.notna(row.get("original_language")) else "",
        "production_companies": row.get("production_companies") if pd.notna(row.get("production_companies")) else "",
        "production_countries": row.get("production_countries") if pd.notna(row.get("production_countries")) else "",
        "spoken_languages": row.get("spoken_languages") if pd.notna(row.get("spoken_languages")) else "",
        "keywords": row.get("keywords") if pd.notna(row.get("keywords")) else "",
        "is_movie": is_movie_val
    }
    
    # Add Series-specific fields if they exist
    extra_fields = ["number_of_seasons", "number_of_episodes", "last_air_date", "in_production", "type", "created_by", "languages", "networks", "origin_country"]
    for field in extra_fields:
        if field in row:
            val = row.get(field)
            data[field] = val if pd.notna(val) else ""

    # Ensure JSON serializable (fixes NumPy float/int issues)
    for key in data:
        if isinstance(data[key], (np.integer, np.int64)):
            data[key] = int(data[key])
        elif isinstance(data[key], (np.floating, np.float64)):
            data[key] = float(data[key])
            
    return data

# --- ROUTES ---

@app.get("/")
def home():
    return jsonify({"status": "online", "message": "Movie Recommendation API is running."})

@app.get("/search")
def search():
    q = request.args.get("q", "")
    norm_name = normalize_for_search(q)
    results = []
    # Vectorized search loop
    for idx, row in df.iterrows():
        if not row["norm_title"]: continue
        score = similarity_score(norm_name, row["norm_title"])
        if score > 0.1: # Threshold to keep it fast
            results.append({
                "index": idx, "title": row["title"], "score": score,
                "release_date": row["release_date"], "poster_url": row["poster_path"],
                "genre": row["genres"], "description": row["overview"],
                "is_movie": row.get("is_movie", 1)
            })
    results.sort(key=lambda x: (x["score"], -len(x["title"])), reverse=True)
    return jsonify(results[:10])

@app.get("/recommend")
def recommend():
    title = request.args.get("title", None)
    idx_req = request.args.get("idx", None)
    
    try:
        if idx_req is not None:
            main_idx = int(idx_req)
        elif title:
            matches = df[df["title"].str.lower() == title.lower()]
            if matches.empty: return jsonify({"error": "Not found"}), 404
            main_idx = matches.index[0]
        else:
            return jsonify({"error": "Provide title or idx"}), 400

        _, m_cand, s_cand = recommendation_function(main_idx)
        m_reranked, s_reranked = stage2_rerank(main_idx, m_cand, s_cand)

        return jsonify({
            "movies": [build_movie_dict(i) for i, _, _, _ in m_reranked[:20]],
            "series": [build_movie_dict(i) for i, _, _, _ in s_reranked[:20]]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/movie/<int:index>")
def get_movie_by_index(index):
    if index < 0 or index >= len(df):
        return jsonify({"error": "Index out of range"}), 404
    try:
        return jsonify(build_movie_dict(index))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)