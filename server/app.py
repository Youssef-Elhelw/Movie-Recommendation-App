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

# def recommend_movies(movie_name, data=df, top_n=5):
#     # find exact movie
#     idx_list = data[data["title"].str.lower() == movie_name.lower()].index
#     if len(idx_list) == 0:
#         return []  # not found
#     idx = idx_list[0]

#     # similarity row
#     scores = list(enumerate(cosineSimilarity[idx]))
#     scores = sorted(scores, key=lambda x: x[1], reverse=True)
#     scores = scores[1:top_n+1]  # skip the same movie

#     movie_idxs = [i[0] for i in scores]

#     # Return all movie info as dictionaries
#     recommendations = []
#     for movie_idx in movie_idxs:
#         movie_row = data.iloc[movie_idx]
#         recommendations.append({
#             "index": int(movie_idx),
#             "title": movie_row["title"],
#             "release_date": movie_row["release_date"],
#             "genres": movie_row.get("genres", ""),
#             "overview": movie_row.get("overview", ""),
#             "poster_url": movie_row.get("poster_path", ""),
#             "rating": float(movie_row.get("vote_average", 0)) if pd.notna(movie_row.get("vote_average")) else None,
#             # Add any other columns from your CSV
#         })
    
#     return recommendations

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
            "title": df.iloc[idx]["title"],
            "release_date": df.iloc[idx]["release_date"],
            "genres": df.iloc[idx].get("genres", ""),
            "overview": df.iloc[idx].get("overview", ""),
            "poster_url": df.iloc[idx].get("poster_path", ""),
            "rating": float(df.iloc[idx].get("vote_average", 0)) if pd.notna(df.iloc[idx].get("vote_average")) else None,
            "vote_count": int(df.iloc[idx].get("vote_count", 0)) if pd.notna(df.iloc[idx].get("vote_count")) else None,
            "vote_average": float(df.iloc[idx].get("vote_average", 0)) if pd.notna(df.iloc[idx].get("vote_average")) else None,
            "status": df.iloc[idx].get("status", ""),
            "revenue": int(df.iloc[idx].get("revenue", 0)) if pd.notna(df.iloc[idx].get("revenue")) else None,
            "backdrop_path": df.iloc[idx].get("backdrop_path", ""),
            "budget": int(df.iloc[idx].get("budget", 0)) if pd.notna(df.iloc[idx].get("budget")) else None,
            "homepage": df.iloc[idx].get("homepage", ""),
            "imdb_id": df.iloc[idx].get("imdb_id", ""),
            "original_language": df.iloc[idx].get("original_language", ""),
            "original_title": df.iloc[idx].get("original_title", ""),
            "popularity": float(df.iloc[idx].get("popularity", 0)) if pd.notna(df.iloc[idx].get("popularity")) else None,
            "tagline": df.iloc[idx].get("tagline", ""),
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
    

app.run(host="0.0.0.0", port=5000, debug=True)
