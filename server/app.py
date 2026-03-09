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

# --- NLTK SETUP ---
# Create a specific directory for NLTK so it doesn't fail on permissions
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
nltk_path = os.path.join(BASE_DIR, 'nltk_data')
if not os.path.exists(nltk_path):
    os.makedirs(nltk_path)

# Tell NLTK to look in your local folder first
nltk.data.path.append(nltk_path)

try:
    # Try to find the new punkt_tab resource
    nltk.data.find('tokenizers/punkt_tab', paths=[nltk_path])
except LookupError:
    # If not found, download both the old and new versions to be safe
    nltk.download('punkt', download_dir=nltk_path)
    nltk.download('punkt_tab', download_dir=nltk_path)
    nltk.download('stopwords', download_dir=nltk_path)

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# --- SERVER CONFIGURATION ---

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
    """Deep cleaning for search queries and titles."""
    if not isinstance(text, str): return ""
    text = text.lower()
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text)

stop_words = set(stopwords.words("english"))

def clean_genres_text(text):
    # here i will remove any speacial character or any number
    text=re.sub(r"[^a-zA-Z\s]", "", text)
    text=text.lower()
    tokens=word_tokenize(text)
    tokens=[word for word in tokens if word not in stop_words]
    return " ".join(tokens)

# Prepare all columns needed for the logic
# df["genres"] = df["genres"].fillna("")
# df["Cleaned_genres"] = df["genres"].apply(clean_genres_text)
# df["keywords"] = df["keywords"].fillna("")
# df["Cleaned_keywords"] = df["keywords"].apply(lambda x: clean_genres_text(x) if pd.notna(x) else "")

# Prepare Metadata for recommendation logic
if "genres" in df.columns:
    df["genres"] = df["genres"].fillna("")
    df["Cleaned_genres"] = df["genres"].apply(clean_genres_text)
else:
    df["Cleaned_genres"] = ""

# Prepare cleaned keywords - with explicit NaN handling
if "keywords" in df.columns:
    df["keywords"] = df["keywords"].fillna("")
    # Safe cleaning that handles NaN values properly
    df["Cleaned_keywords"] = df["keywords"].apply(lambda x: clean_genres_text(x) if pd.notna(x) else "")
else:
    df["Cleaned_keywords"] = ""

# Build genre_set as actual Python sets (not string representations)
# Always regenerate to ensure consistency
df["genre_set"] = df["Cleaned_genres"].apply(
    lambda x: set(x.split()) if isinstance(x, str) and x.strip() else set()
)

def create_stage2_text(row):
    overview = str(row.get("overview", "")) if pd.notna(row.get("overview")) else ""
    genres = str(row.get("Cleaned_genres", "")) if pd.notna(row.get("Cleaned_genres")) else ""
    keywords = str(row.get("Cleaned_keywords", "")) if pd.notna(row.get("Cleaned_keywords")) else ""

    # Weighted combination: overview (1x) + genres (2x) + keywords (2x)
    stage2_text = (overview + " ") * 1 + (genres + " ") * 2 + (keywords + " ") * 2
    return stage2_text.strip()

df["stage2_text"] = df.apply(create_stage2_text, axis=1)

# Prepare norm_title for the search function
df["norm_title"] = df["title"].apply(normalize_for_search)

# Global Vectorizer for Reranking
stage2_vectorizer = TfidfVectorizer(max_features=2000)
stage2_matrix = stage2_vectorizer.fit_transform(df["stage2_text"])

def rerank_by_overlap(top_movies, top_series, keyword_weight=0.6, genre_weight=0.4):
    """
    Re-rank movies and series by a balanced combination of common keywords and genres.

    Items should be tuples of (idx, score, G_overlap, K_overlap)
    Returns re-ranked movies and series sorted by a weighted score:
    - Combined Score = (K_overlap * keyword_weight) + (G_overlap * genre_weight)

    Parameters:
    - keyword_weight: Weight for keywords (default 0.6) - 60% importance
    - genre_weight: Weight for genres (default 0.4) - 40% importance
    """
    def rerank_list(items):
        # Compute weighted score for each item
        scored_items = [
            (idx, score, G_overlap, K_overlap, K_overlap * keyword_weight + G_overlap * genre_weight)
            for idx, score, G_overlap, K_overlap in items
        ]
        # Sort by combined weighted score (descending)
        return sorted(scored_items, key=lambda x: x[4], reverse=True)

    reranked_movies = rerank_list(top_movies)
    reranked_series = rerank_list(top_series)

    # Remove the score column before returning
    return (
        [(idx, score, G_overlap, K_overlap) for idx, score, G_overlap, K_overlap, _ in reranked_movies],
        [(idx, score, G_overlap, K_overlap) for idx, score, G_overlap, K_overlap, _ in reranked_series]
    )

# Masks for Movie vs Series separation
if "is_movie" in df.columns:
    movie_mask = (df["is_movie"] == 1).values
    series_mask = (df["is_movie"] == 0).values
    movie_indices = np.where(movie_mask)[0].tolist()
    series_indices = np.where(series_mask)[0].tolist()
    movie_matrix = tf_idf_matrix[movie_indices]
    series_matrix = tf_idf_matrix[series_indices]
else:
    # Fallback if is_movie column is missing
    movie_indices = df.index.tolist()
    series_indices = []
    movie_matrix = tf_idf_matrix
    series_matrix = None

def normalize(text):
    # reomving & and replacing it with and
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text.lower())

def possible_titles(movie_name, data=df):
    norm_name = normalize(movie_name)
    scores = []

    titles = data["title"].tolist()
    norm_titles = data["norm_title"].tolist()
    release_dates = data["release_date"].tolist()
    images = data["poster_path"].tolist()
    genres = data["genres"].tolist()
    descriptions = data["overview"].tolist()
    is_movie_flags = data["is_movie"].tolist()

    for idx, (title,norm_title, release_date, image, genre, description, is_movie) in enumerate(zip(titles, norm_titles, release_dates, images, genres, descriptions, is_movie_flags)):
        # norm_title = normalize(title)
        if not norm_title:
            continue

        score = similarity_score(norm_name, norm_title)

        # if score < len(norm_name) * 0.4:
        #     continue

        scores.append((idx, title, score, release_date, image, genre, description, is_movie))
    scores.sort(key=lambda x: (x[2], -len(x[1])), reverse=True)

    top_matches = scores[:10]

    # return ONLY list of dicts
    return [
        {"index": idx, "title": t, "score": s, "release_date": d, "poster_url": image, "genre": genre, "description": description, "is_movie": is_movie}
        for (idx, t, s, d, image, genre, description, is_movie) in top_matches
    ]
# --- RECOMMENDATION CORE ---

def similarity_score(a, b):
    score = 0
    for i in range(len(a)):
        for j in range(i+1, len(a)+1):
            sub = a[i:j]
            if sub in b: score += len(sub)
    return score / (len(b) + 1)

def recommendation_function(data=df, top_n=70, title=None, movie_idx=None, penalty_no_overlap=0.1):
    # Accept either a single integer index or an index-like (list/array) selection
    if movie_idx is None:
        print("ERROR: Movie not found.")
        return None
    # normalize movie_idx to a single integer index
    if isinstance(movie_idx, (list, tuple)) or hasattr(movie_idx, 'tolist') and not isinstance(movie_idx, (int,)):
        try:
            if len(movie_idx) == 0:
                print("ERROR: Movie not found.")
                return None
            idx = int(movie_idx[0])
        except Exception:
            print("ERROR: Invalid movie_idx provided.")
            return None
    else:
        idx = int(movie_idx)

    main_genres = data.loc[idx, "genre_set"]

    # --- Helper for F1 score ---
    def f1_score(overlap, candidate_count, main_count):
        if candidate_count == 0 or main_count == 0 or overlap == 0:
            return 0
        precision = overlap / candidate_count
        recall = overlap / main_count
        return 2 * precision * recall / (precision + recall)

    # -------- MOVIES --------
    sim_movie = linear_kernel(
        tf_idf_matrix[idx:idx+1],
        movie_matrix
    ).flatten()

    movie_scores = []

    for i, score in zip(movie_indices, sim_movie):
        if i == idx:
            continue

        candidate_genres = data.loc[i, "genre_set"]
        genre_overlap = len(main_genres & candidate_genres)
        candidate_count = len(candidate_genres)
        main_count = len(main_genres)

        # F1-based genre score
        genre_f1 = f1_score(genre_overlap, candidate_count, main_count)

        if candidate_count == 1 and "Comedy" in candidate_genres:
            genre_overlap = 0
            genre_f1 = 0

        # Penalize if no common genres
        if genre_overlap == 0:
            final_score = score - penalty_no_overlap
        else:
            final_score = score + genre_f1 * 0.2  # tune weight

        movie_scores.append((i, final_score, genre_overlap, genre_f1))

    movie_scores = sorted(movie_scores, key=lambda x: x[1], reverse=True)[:top_n]
    movie_idxs = [i[0] for i in movie_scores]

    # -------- SERIES --------
    sim_series = linear_kernel(
        tf_idf_matrix[idx:idx+1],
        series_matrix
    ).flatten()

    series_scores = []

    for i, score in zip(series_indices, sim_series):
        if i == idx:
            continue

        candidate_genres = data.loc[i, "genre_set"]
        genre_overlap = len(main_genres & candidate_genres)
        candidate_count = len(candidate_genres)
        main_count = len(main_genres)

        genre_f1 = f1_score(genre_overlap, candidate_count, main_count)

        if candidate_count == 1 and "Comedy" in candidate_genres:
            genre_overlap = 0
            genre_f1 = 0

        if genre_overlap == 0:
            final_score = score - penalty_no_overlap
        else:
            final_score = score + genre_f1 * 0.15  # tune weight

        series_scores.append((i, final_score, genre_overlap, genre_f1))

    series_scores = sorted(series_scores, key=lambda x: x[1], reverse=True)[:top_n]
    series_idxs = [i[0] for i in series_scores]

    return idx, movie_idxs, series_idxs

def stage2_rerank(main_idx, movie_candidates, series_candidates, data=df):

    main_genres = data.loc[main_idx, "genre_set"]
    main_keywords = set(data.loc[main_idx, "Cleaned_keywords"].split())

    # --- Helper to compute precision & recall score ---
    def f1_score(overlap, candidate_count, main_count):
        if candidate_count == 0 or main_count == 0:
            return 0
        precision = overlap / candidate_count
        recall = overlap / main_count
        if precision + recall == 0:
            return 0
        return 2 * precision * recall / (precision + recall)

    # -------- MOVIES --------
    movie_sim = linear_kernel(
        stage2_matrix[main_idx:main_idx+1],
        stage2_matrix[movie_candidates]
    ).flatten()

    movie_reranked = []

    for i, sim in zip(movie_candidates, movie_sim):

        candidate_genres = data.loc[i, "genre_set"]
        candidate_keywords = set(data.loc[i, "Cleaned_keywords"].split())

        # --- Genre F1 ---
        genre_overlap = len(main_genres & candidate_genres)
        genre_f1 = f1_score(genre_overlap, len(candidate_genres), len(main_genres))

        # --- Keyword F1 ---
        keywords_overlap = len(main_keywords & candidate_keywords)
        keyword_f1 = f1_score(keywords_overlap, len(candidate_keywords), len(main_keywords))

        # --- Final score ---
        final_score = (
            sim
            + genre_f1 * 0.2    # tune weight
            + keyword_f1 * 0.1  # tune weight
        )

        movie_reranked.append(
            (i, final_score, genre_overlap, keywords_overlap)
        )

    movie_reranked = sorted(movie_reranked, key=lambda x: x[1], reverse=True)

    # -------- SERIES --------
    series_sim = linear_kernel(
        stage2_matrix[main_idx:main_idx+1],
        stage2_matrix[series_candidates]
    ).flatten()

    series_reranked = []

    for i, sim in zip(series_candidates, series_sim):

        candidate_genres = data.loc[i, "genre_set"]
        candidate_keywords = set(data.loc[i, "Cleaned_keywords"].split())

        # --- Genre F1 ---
        genre_overlap = len(main_genres & candidate_genres)
        genre_f1 = f1_score(genre_overlap, len(candidate_genres), len(main_genres))

        # --- Keyword F1 ---
        keywords_overlap = len(main_keywords & candidate_keywords)
        keyword_f1 = f1_score(keywords_overlap, len(candidate_keywords), len(main_keywords))

        # --- Final score ---
        final_score = (
            sim
            + genre_f1 * 0.2   # tune weight
            + keyword_f1 * 0.1 # tune weight
        )

        series_reranked.append(
            (i, final_score, genre_overlap, keywords_overlap)
        )

    series_reranked = sorted(series_reranked, key=lambda x: x[1], reverse=True)

    return movie_reranked, series_reranked

def build_movie_dict(idx,df):
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
    results = possible_titles(q, df)
    return jsonify(results)


@app.get("/recommend")
def recommend():
    title = request.args.get("title", None)
    idx = request.args.get("idx", None)

    if idx is not None:
        try:
            idx = int(idx)
        except ValueError:
            return jsonify({"error": "Invalid idx parameter"}), 400

    if not title and idx is None:
        return jsonify({"error": "Either title or idx must be provided"}), 400

    try:
        # Step 1: Initial Recommendation (Notebook logic)
        result = recommendation_function(data=df, top_n=225, title=title, movie_idx=idx)

        if result is None:
            return jsonify({"error": "Movie/Series not found in database"}), 404

        main_idx, movie_candidates, series_candidates = result

        # Step 2: Rerank using combined scores (genre F1 + keyword F1)
        movie_reranked, series_reranked = stage2_rerank(main_idx, movie_candidates, series_candidates, df)
        reranked = sorted(
            movie_reranked + series_reranked,
            key=lambda x: x[1],
            reverse=True
        )

        top_movies = []
        top_series = []

        # Keep overlaps!
        for idx, score, G_overlap, K_overlap in reranked:
            is_movie = df.loc[idx, 'is_movie']

            if is_movie and len(top_movies) < 20:
                top_movies.append((idx, score, G_overlap, K_overlap))

            elif not is_movie and len(top_series) < 20:
                top_series.append((idx, score, G_overlap, K_overlap))

            if len(top_movies) == 20 and len(top_series) == 20:
                break

        # Step 3: Final rerank by overlap (keywords have higher weight)
        movie_reranked, series_reranked = rerank_by_overlap(top_movies, top_series)

        # Step 4: Format top 20 for frontend
        return jsonify({
            "movies": [build_movie_dict(idx, df) for idx, _, _, _ in movie_reranked[:20]],
            "series": [build_movie_dict(idx, df) for idx, _, _, _ in series_reranked[:20]]
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@app.get("/movie/<int:index>")
def get_movie_by_index(index):
    if index < 0 or index >= len(df):
        return jsonify({"error": "Index out of range"}), 404
    try:
        return jsonify(build_movie_dict(index,df))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
