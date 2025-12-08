from flask import Flask, request, jsonify
# from numba import njit
import pandas as pd
import numpy as np
import re
import os
# Load data
print(os.getcwd())
df = pd.read_csv("data/updated_movies.csv", engine="python")
similarity = np.load("../Model/server_artifacts/similarity.npy")

app = Flask(__name__)
# enable CORS if needed
from flask_cors import CORS
CORS(app)

def normalize(text):
    # reomving & and replacing it with and
    text = text.replace('&', 'and')
    return re.sub(r'[^a-z0-9]', '', text.lower())

df["norm_title"] = df["title"].apply(normalize)

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

def recommend_movies(movie_name, cosineSimilarity, data=df, top_n=5):
    # find exact movie
    idx_list = data[data["title"].str.lower() == movie_name.lower()].index
    if len(idx_list) == 0:
        return []  # not found
    idx = idx_list[0]

    # similarity row
    scores = list(enumerate(cosineSimilarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:top_n+1]  # skip the same movie

    movie_idxs = [i[0] for i in scores]

    # Return all movie info as dictionaries
    recommendations = []
    for movie_idx in movie_idxs:
        movie_row = data.iloc[movie_idx]
        recommendations.append({
            "index": int(movie_idx),
            "title": movie_row["title"],
            "release_date": movie_row["release date"],
            "genres": movie_row.get("genres", ""),
            "overview": movie_row.get("overview", ""),
            "poster_url": movie_row.get("poster_path", ""),
            "rating": float(movie_row.get("vote_average", 0)) if pd.notna(movie_row.get("vote_average")) else None,
            # Add any other columns from your CSV
        })
    
    return recommendations


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
    results = recommend_movies(title, similarity, df, top_n=10)
    return jsonify(results)

app.run(host="0.0.0.0", port=5000, debug=True)
