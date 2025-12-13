from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import linear_kernel
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from scipy.sparse import load_npz
# Load data
print(os.getcwd())
df = pd.read_csv("data/final_movies.csv", engine="python")
# similarity = np.load("data/similarity.npy")
tf_idf_matrix = load_npz("data/tfidf_matrix1.npz")


app = Flask(__name__)
# enable CORS if needed
from flask_cors import CORS
CORS(app)

def normalize(text):
    # reomving & and replacing it with and
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text.lower())

def create_round2_text(row):
    overview = str(row["overview"]) if pd.notna(row["overview"]) else ""
    genres = str(row["genres"]) if pd.notna(row["genres"]) else ""
    return (overview + " ") * 3 + (genres + " ") * 5

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text


df["norm_title"] = df["title"].apply(normalize)
df["stage2_text"] = df.apply(create_round2_text, axis=1)
df["stage2_text"]=df["stage2_text"].apply(clean_text)


# @njit
def similarity_score(a, b):
    score = 0
    for i in range(len(a)):
        for j in range(i+1, len(a)+1):
            sub = a[i:j]
            if sub in b:  # Numba will optimize this
                score += len(sub)
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

    for title,norm_title, release_date, image, genre, description in (zip(titles, norm_titles, release_dates, images, genres, descriptions)):
        # norm_title = normalize(title)
        if not norm_title:
            continue

        score = similarity_score(norm_name, norm_title)

        if score < len(norm_name) * 0.4:
            continue

        scores.append((title, score, release_date, image, genre, description))
    scores.sort(key=lambda x: (x[1], -len(x[0])), reverse=True)

    top_matches = scores[:10]

    # return ONLY list of dicts
    return [
        {"title": t, "score": s, "release_date": d, "poster_url": image, "genre": genre, "description": description}
        for (t, s, d, image, genre, description) in top_matches
    ]


def recommendation_funtion(movie_name,data=df,top_n=5):
    idx = data[data["title"].str.lower() == movie_name.lower()].index
    if len(idx) == 0:
        print("ERROR: Movie not found.")
        return None
    idx = idx[0]
    
    # this will compute similarity for this ONE movie (1 x N)
    sim_scores = linear_kernel(tf_idf_matrix[idx:idx+1], tf_idf_matrix).flatten()
    # pair each movie with its score
    scores = list(enumerate(sim_scores))
    # sort descending by similarity
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:top_n+1]
    # sort based on popularity
    # scores = sorted(scores, key=lambda x: data.iloc[x[0]]["popularity"], reverse=True)

    movie_idxs = [i[0] for i in scores]

    # print(f"\nTop {top_n} recommendations for '{movie_name}':")
    return idx,movie_idxs

def stage2_rerank(main_idx, candidate_indices, df):

    indices = [main_idx] + candidate_indices
    texts = df.loc[indices, "stage2_text"].tolist()
    vectorizer = TfidfVectorizer(max_features=2000)
    mat = vectorizer.fit_transform(texts)
    sim = cosine_similarity(mat[0:1], mat).flatten()
    reranked = sorted(list(zip(indices[1:], sim[1:])),key=lambda x: x[1],reverse=True)
    # id,title,vote_average,vote_count,status,release_date,revenue,runtime,backdrop_path,budget,homepage,imdb_id,original_language,original_title,overview,popularity,poster_path,tagline,genres,production_companies,production_countries,spoken_languages,keywords
    reranked = [
        {
            "index": int(idx),
            "title": df.iloc[idx]["title"] if pd.notna(df.iloc[idx].get("title")) else None,
            "release_date": df.iloc[idx]["release_date"] if pd.notna(df.iloc[idx].get("release_date")) else None,
            "genres": df.iloc[idx].get("genres", "") if pd.notna(df.iloc[idx].get("genres")) else None,
            "overview": df.iloc[idx].get("overview", "") if pd.notna(df.iloc[idx].get("overview")) else None,
            "poster_url": df.iloc[idx].get("poster_path", "") if pd.notna(df.iloc[idx].get("poster_path")) else None,
            "rating": float(df.iloc[idx].get("vote_average", 0)) if pd.notna(df.iloc[idx].get("vote_average")) else None,
            "vote_count": int(df.iloc[idx].get("vote_count", 0)) if pd.notna(df.iloc[idx].get("vote_count")) else None,
            "vote_average": float(df.iloc[idx].get("vote_average", 0)) if pd.notna(df.iloc[idx].get("vote_average")) else None,
            "status": df.iloc[idx].get("status", "") if pd.notna(df.iloc[idx].get("status")) else None,
            "revenue": int(df.iloc[idx].get("revenue", 0)) if pd.notna(df.iloc[idx].get("revenue")) else None,
            "backdrop_path": df.iloc[idx].get("backdrop_path", "") if pd.notna(df.iloc[idx].get("backdrop_path")) else None,
            "budget": int(df.iloc[idx].get("budget", 0)) if pd.notna(df.iloc[idx].get("budget")) else None,
            "homepage": df.iloc[idx].get("homepage", "") if pd.notna(df.iloc[idx].get("homepage")) else None,
            "imdb_id": df.iloc[idx].get("imdb_id", "") if pd.notna(df.iloc[idx].get("imdb_id")) else None,
            "original_language": df.iloc[idx].get("original_language", "") if pd.notna(df.iloc[idx].get("original_language")) else None,
            "original_title": df.iloc[idx].get("original_title", "") if pd.notna(df.iloc[idx].get("original_title")) else None,
            "popularity": float(df.iloc[idx].get("popularity", 0)) if pd.notna(df.iloc[idx].get("popularity")) else None,
            "tagline": df.iloc[idx].get("tagline", "") if pd.notna(df.iloc[idx].get("tagline")) else None,
            # Add any other columns from your CSV
        }
        for (idx, score) in reranked
    ]
    return reranked





@app.get("/")
def home():
    return jsonify({"message": "Movie Recommendation API is running."})


@app.get("/search")
def search():
    q = request.args.get("q", "")
    # print('sdfisjfojdsopfjodijfoijdfjdoifjidjfidjfidjfidjfidjfijfjdijfdijidjidjf')
    # print(type(q))
    results = possible_titles(q, df)
    return jsonify(results)

@app.get("/recommend")
def recommend():
    title = request.args.get("title", "")
    # results = recommend_movies(title, similarity, df, top_n=10)
    try:
        main_idx, candidate_indices = recommendation_funtion(title, df, top_n=10)
        reranked = stage2_rerank(main_idx, candidate_indices, df)
        return jsonify(reranked)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/movie/<int:movie_id>")
def get_movie(movie_id):
    movie = df[df.index == movie_id]
    if movie.empty:
        return jsonify({"error": "Movie not found."}), 404

    movie_data = {
        "id": int(movie.index[0]),
        "title": movie.iloc[0]["title"] if pd.notna(movie.iloc[0].get("title")) else None,
        "release_date": movie.iloc[0]["release_date"] if pd.notna(movie.iloc[0].get("release_date")) else None,
        "genres": movie.iloc[0].get("genres", "") if pd.notna(movie.iloc[0].get("genres")) else None,
        "overview": movie.iloc[0].get("overview", "") if pd.notna(movie.iloc[0].get("overview")) else None,
        "poster_url": movie.iloc[0].get("poster_path", "") if pd.notna(movie.iloc[0].get("poster_path")) else None,
        "rating": float(movie.iloc[0].get("vote_average", 0)) if pd.notna(movie.iloc[0].get("vote_average")) else None,
        "vote_count": int(movie.iloc[0].get("vote_count", 0)) if pd.notna(movie.iloc[0].get("vote_count")) else None,
        "vote_average": float(movie.iloc[0].get("vote_average", 0)) if pd.notna(movie.iloc[0].get("vote_average")) else None,
        "status": movie.iloc[0].get("status", "") if pd.notna(movie.iloc[0].get("status")) else None,
        "revenue": int(movie.iloc[0].get("revenue", 0)) if pd.notna(movie.iloc[0].get("revenue")) else None,
        "backdrop_path": movie.iloc[0].get("backdrop_path", "") if pd.notna(movie.iloc[0].get("backdrop_path")) else None,
        "budget": int(movie.iloc[0].get("budget", 0)) if pd.notna(movie.iloc[0].get("budget")) else None,
        "homepage": movie.iloc[0].get("homepage", "") if pd.notna(movie.iloc[0].get("homepage")) else None,
        "imdb_id": movie.iloc[0].get("imdb_id", "") if pd.notna(movie.iloc[0].get("imdb_id")) else None,
        "original_language": movie.iloc[0].get("original_language", "") if pd.notna(movie.iloc[0].get("original_language")) else None,
        "original_title": movie.iloc[0].get("original_title", "") if pd.notna(movie.iloc[0].get("original_title")) else None,
        "popularity": float(movie.iloc[0].get("popularity", 0)) if pd.notna(movie.iloc[0].get("popularity")) else None,
        "tagline": movie.iloc[0].get("tagline", "") if pd.notna(movie.iloc[0].get("tagline")) else None,
        "runtime": int(movie.iloc[0].get("runtime", 0)) if pd.notna(movie.iloc[0].get("runtime")) else None,
        "production_companies": movie.iloc[0].get("production_companies", "") if pd.notna(movie.iloc[0].get("production_companies")) else None,
        "spoken_languages": movie.iloc[0].get("spoken_languages", "") if pd.notna(movie.iloc[0].get("spoken_languages")) else None,
        "production_countries": movie.iloc[0].get("production_countries", "") if pd.notna(movie.iloc[0].get("production_countries")) else None,
        # Add any other columns from your CSV
    }
    return jsonify(movie_data)


app.run(host="0.0.0.0", port=5000, debug=True)
