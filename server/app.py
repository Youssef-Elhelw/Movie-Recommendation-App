from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import re
import os
# Load data
print(os.getcwd())
df = pd.read_csv("data/mymoviedb.csv", engine="python")
similarity = np.load("data/similarity.npy")

app = Flask(__name__)

def normalize(text):
    print(f"Normalizing text: {text}")
    return re.sub(r'[^a-z0-9]', '', text.lower())

def similarity_score(a, b):
    score = 0
    for i in range(len(a)):
        for j in range(i+1, len(a)+1):
            sub = a[i:j]
            if re.search(sub, b):
                score += len(sub)
    return score

def possible_titles(movie_name, data=df):
    norm_name = normalize(movie_name)
    scores = []

    for title, release_date in zip(data["Title"], data["Release_Date"]):
        norm_title = normalize(title)
        if not norm_title:
            continue

        score = similarity_score(norm_name, norm_title)

        if score < len(norm_name) * 0.4:
            continue

        scores.append((title, score, release_date))

    scores.sort(key=lambda x: (x[1], -len(x[0])), reverse=True)

    top_matches = scores[:10]

    # return ONLY list of dicts
    return [
        {"title": t, "score": s, "release_date": d}
        for (t, s, d) in top_matches
    ]

def recommend_movies(movie_name, cosineSimilarity, data=df, top_n=5):
    # find exact movie
    idx_list = data[data["Title"].str.lower() == movie_name.lower()].index
    if len(idx_list) == 0:
        return []  # not found
    idx = idx_list[0]

    # similarity row
    scores = list(enumerate(cosineSimilarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:top_n+1]  # skip the same movie

    movie_idxs = [i[0] for i in scores]

    return data["Title"].iloc[movie_idxs].tolist()


@app.get("/")
def home():
    return jsonify({"message": "Movie Recommendation API is running."})


@app.get("/search")
def search():
    q = request.args.get("q", "")
    print('sdfisjfojdsopfjodijfoijdfjdoifjidjfidjfidjfidjfidjfijfjdijfdijidjidjf')
    print(type(q))
    results = possible_titles(q, df)
    return jsonify(results)

@app.get("/recommend")
def recommend():
    title = request.args.get("title", "")
    results = recommend_movies(title, similarity, df, top_n=10)
    return jsonify(results)

app.run(port=5000, debug=True)
