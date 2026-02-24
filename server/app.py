from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import linear_kernel
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd
import numpy as np
import re
import os
from scipy.sparse import load_npz
from flask_cors import CORS

# Load data
print(f"Current Working Directory: {os.getcwd()}")
# Adjust paths as per your server structure
df = pd.read_csv("data/processed_movies.csv", engine="python")
tf_idf_matrix = load_npz("data/tfidf_matrix55.npz")

# --- CRITICAL ALIGNMENT FIX ---
# Ensures the dataframe rows match the matrix rows perfectly
# if len(df) > tf_idf_matrix.shape[0]:
#     print(f"Truncating DF from {len(df)} to {tf_idf_matrix.shape[0]} to match matrix.")
#     df = df.iloc[:tf_idf_matrix.shape[0]].reset_index(drop=True)
# ------------------------------

app = Flask(__name__)
CORS(app)

# --- UTILITY FUNCTIONS ---

def normalize_for_search(text):
    """Deep cleaning for search queries and titles."""
    if not isinstance(text, str): return ""
    text = text.lower()
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text)

def clean_genres_text(text):
    """Standardizes genres for overlap calculation as seen in your notebook."""
    if not isinstance(text, str) or text.lower() == "nan":
        return ""
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    return text.lower()

# --- PRE-PROCESSING DATA ---
def normalize(text):
    # reomving & and replacing it with and
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text.lower())

def similarity_score(a, b):
    score = 0
    for i in range(len(a)):
        for j in range(i+1, len(a)+1):
            sub = a[i:j]
            if sub in b:  # Numba will optimize this
                score += len(sub)
    score=score/(len(b)+1) # Normalize by length of input
    return score

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

# Prepare Metadata for recommendation logic
if "genres" in df.columns:
    df["genres"] = df["genres"].fillna("")
    df["Cleaned_genres"] = df["genres"].apply(clean_genres_text)

# Prepare norm_title for the search function
df["norm_title"] = df["title"].apply(normalize_for_search)

# Create masks for Movie vs Series separation
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

# --- RECOMMENDATION LOGIC ---

def recommendation_function(data=df, top_n=70, title=None, idx=None):
    """
    Implements the Notebook Recommendation Logic:
    Linear Kernel Similarity + Genre Overlap Bonus.
    Accepts either title or idx parameter.
    """
    if idx is not None:
        # Use provided index directly
        if idx < 0 or idx >= len(data):
            return None
    elif title is not None:
        # Look up title to get index
        idx_list = data[data["title"].str.lower() == title.lower()].index
        if len(idx_list) == 0:
            return None
        idx = idx_list[0]
    else:
        return None  # Neither title nor idx provided
    source_genres = set(data.loc[idx, "Cleaned_genres"].split())

    # 1. MOVIE SIMILARITY
    sim_movie = linear_kernel(tf_idf_matrix[idx:idx+1], movie_matrix).flatten()
    movie_scores_raw = list(zip(movie_indices, sim_movie))
    
    final_movie_scores = []
    for i, score in movie_scores_raw:
        if i == idx: continue
        target_genres = set(data.loc[i, "Cleaned_genres"].split())
        genre_overlap = len(source_genres.intersection(target_genres))
        # Logic from notebook: score + 0.1 per genre overlap
        final_score = score + (genre_overlap * 0.1)
        final_movie_scores.append((i, final_score))

    movie_results = sorted(final_movie_scores, key=lambda x: x[1], reverse=True)[:top_n]
    movie_idxs = [i[0] for i in movie_results]

    # 2. SERIES SIMILARITY
    series_idxs = []
    if series_matrix is not None and len(series_indices) > 0:
        sim_series = linear_kernel(tf_idf_matrix[idx:idx+1], series_matrix).flatten()
        series_scores_raw = list(zip(series_indices, sim_series))
        
        final_series_scores = []
        for i, score in series_scores_raw:
            if i == idx: continue
            target_genres = set(data.loc[i, "Cleaned_genres"].split())
            genre_overlap = len(source_genres.intersection(target_genres))
            final_score = score + (genre_overlap * 0.1)
            final_series_scores.append((i, final_score))

        series_results = sorted(final_series_scores, key=lambda x: x[1], reverse=True)[:top_n]
        series_idxs = [i[0] for i in series_results]

    return idx, movie_idxs, series_idxs

stage2_vectorizer = TfidfVectorizer(
    max_features=2000
)

stage2_matrix = stage2_vectorizer.fit_transform(df["stage2_text"])

def stage2_rerank(main_idx,movie_candidates , series_candidates):
    movie_sim = linear_kernel(
        stage2_matrix[main_idx:main_idx+1],
        stage2_matrix[movie_candidates]
    ).flatten()

    movie_reranked = sorted(
        list(zip(movie_candidates, movie_sim)),
        key=lambda x: x[1],
        reverse=True
    )

    series_sim = linear_kernel(
        stage2_matrix[main_idx:main_idx+1],
        stage2_matrix[series_candidates]
    ).flatten()

    series_reranked = sorted(
        list(zip(series_candidates, series_sim)),
        key=lambda x: x[1],
        reverse=True
    )

    return movie_reranked, series_reranked

def build_movie_dict(idx, df):
    """Maps dataframe row to JSON response."""
    row = df.iloc[idx]
    return {
        "index": int(idx),
        "title": row.get("title") if pd.notna(row.get("title")) else "Unknown",
        "release_date": row.get("release_date") if pd.notna(row.get("release_date")) else "",
        "genres": row.get("genres") if pd.notna(row.get("genres")) else "",
        "overview": row.get("overview") if pd.notna(row.get("overview")) else "",
        "poster_url": row.get("poster_path") if pd.notna(row.get("poster_path")) else None,
        "rating": float(row.get("vote_average", 0)) if pd.notna(row.get("vote_average")) else 0.0,
        "popularity": float(row.get("popularity", 0)) if pd.notna(row.get("popularity")) else 0.0
    }

# --- ROUTES ---

@app.get("/")
def home():
    return jsonify({"status": "online", "message": "Recommendation Engine is Running"})

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
        result = recommendation_function(data=df, top_n=225, title=title, idx=idx)
        
        if result is None:
            return jsonify({"error": "Movie/Series not found in database"}), 404
        
        main_idx, movie_candidates, series_candidates = result
        
        # Step 2: Rerank using combined scores
        movie_reranked, series_reranked = stage2_rerank(main_idx, movie_candidates, series_candidates)
        
        # Step 3: Format top 10 for frontend
        return jsonify({
            "movies": [build_movie_dict(idx, df) for idx, _ in movie_reranked[:20]],
            "series": [build_movie_dict(idx, df) for idx, _ in series_reranked[:20]]
        })
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@app.get("/search")
def search():
    q = request.args.get("q", "")
    # print('sdfisjfojdsopfjodijfoijdfjdoifjidjfidjfidjfidjfidjfijfjdijfdijidjidjf')
    # print(type(q))
    results = possible_titles(q, df)
    return jsonify(results)

@app.get("/movie/<int:index>")
def get_movie_by_index(index):
    """Fetches full details for a movie/series based on its CSV row index."""
    if index < 0 or index >= len(df):
        return jsonify({"error": "Index out of range"}), 404
    
    try:
        # get all the movie details for the given index and return as JSON
        movie_data = build_movie_dict(index, df)
        # add the remaining details that are not included in the build_movie_dict function
        # id,title,vote_average,vote_count,status,release_date,revenue,runtime,backdrop_path,budget,homepage,imdb_id,original_language,original_title,overview,popularity,poster_path,tagline,genres,production_companies,production_countries,spoken_languages,keywords,is_movie,index,number_of_seasons,number_of_episodes,adult,last_air_date,in_production,type,created_by,languages,networks,origin_country

        row = df.iloc[index]
        movie_data["original_title"] = row.get("original_title") if pd.notna(row.get("original_title")) else ""
        movie_data["original_language"] = row.get("original_language") if pd.notna(row.get("original_language")) else ""
        movie_data["runtime"] = row.get("runtime") if pd.notna(row.get("runtime")) else 0
        movie_data["status"] = row.get("status") if pd.notna(row.get("status")) else ""
        movie_data["revenue"] = row.get("revenue") if pd.notna(row.get("revenue")) else 0
        movie_data["budget"] = row.get("budget") if pd.notna(row.get("budget")) else 0
        movie_data["vote_count"] = row.get("vote_count") if pd.notna(row.get("vote_count")) else 0
        movie_data["tagline"] = row.get("tagline") if pd.notna(row.get("tagline")) else ""
        movie_data["production_companies"] = row.get("production_companies") if pd.notna(row.get("production_companies")) else ""
        movie_data["production_countries"] = row.get("production_countries") if pd.notna(row.get("production_countries")) else ""
        movie_data["spoken_languages"] = row.get("spoken_languages") if pd.notna(row.get("spoken_languages")) else ""
        movie_data["keywords"] = row.get("keywords") if pd.notna(row.get("keywords")) else ""
        movie_data["number_of_seasons"] = row.get("number_of_seasons") if pd.notna(row.get("number_of_seasons")) else 0
        movie_data["number_of_episodes"] = row.get("number_of_episodes") if pd.notna(row.get("number_of_episodes")) else 0
        movie_data["last_air_date"] = row.get("last_air_date") if pd.notna(row.get("last_air_date")) else ""
        movie_data["in_production"] = row.get("in_production") if pd.notna(row.get("in_production")) else False
        movie_data["type"] = row.get("type") if pd.notna(row.get("type")) else ""
        movie_data["created_by"] = row.get("created_by") if pd.notna(row.get("created_by")) else ""
        movie_data["languages"] = row.get("languages") if pd.notna(row.get("languages")) else ""
        movie_data["networks"] = row.get("networks") if pd.notna(row.get("networks")) else ""
        movie_data["origin_country"] = row.get("origin_country") if pd.notna(row.get("origin_country")) else ""
        movie_data["id"] = row.get("id") if pd.notna(row.get("id")) else 0
        movie_data["backdrop_path"] = row.get("backdrop_path") if pd.notna(row.get("backdrop_path")) else ""
        movie_data["homepage"] = row.get("homepage") if pd.notna(row.get("homepage")) else ""
        movie_data["imdb_id"] = row.get("imdb_id") if pd.notna(row.get("imdb_id")) else ""
        movie_data["popularity"] = float(movie_data["popularity"]) if pd.notna(movie_data["popularity"]) else 0.0
        movie_data["rating"] = float(movie_data["rating"]) if pd.notna(movie_data["rating"]) else 0.0
        movie_data["runtime"] = int(movie_data["runtime"]) if pd.notna(movie_data["runtime"]) else 0
        movie_data["index"] = int(movie_data["index"]) if pd.notna(movie_data["index"]) else 0
        movie_data["is_movie"] = int(row.get("is_movie", 1)) if pd.notna(row.get("is_movie")) else 1
        # make it json serializable        for key in movie_data:
        for key in movie_data:
            if isinstance(movie_data[key], (np.integer, np.floating)):
                movie_data[key] = float(movie_data[key])

        return jsonify(movie_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)