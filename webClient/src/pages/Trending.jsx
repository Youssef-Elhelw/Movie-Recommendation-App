import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import MovieCard from '../components/MovieCard'
import csvData from '../assets/final_movies.csv?raw'
import './Trending.css'

function Trending({ setMovieData }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popularity')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Parse CSV file
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        const moviesData = results.data
          .map((movie, idx) => ({...movie, csvIndex: idx}))
          .filter(movie => movie.title && movie.popularity)
          .map(movie => ({
            id: movie.id,
            title: movie.title,
            poster_url: movie.poster_path,
            poster: movie.poster_path,
            genres: movie.genres,
            overview: movie.overview,
            vote_average: parseFloat(movie.vote_average) || 0,
            rating: parseFloat(movie.vote_average) || 0,
            popularity: parseFloat(movie.popularity) || 0,
            release_date: movie.release_date,
            vote_count: parseInt(movie.vote_count) || 0,
            csvIndex: movie.csvIndex
          }))
          // console.log('Parsed movies data:', moviesData)
        // Sort by popularity by default
        const sorted = moviesData.sort((a, b) => b.popularity - a.popularity)
        setMovies(sorted.slice(0, 20)) // Get top 20 trending
        setLoading(false)
      },
    })
  }, [])

  const getSortedMovies = () => {
    const moviesCopy = [...movies]
    
    switch (sortBy) {
      case 'popularity':
        return moviesCopy.sort((a, b) => b.popularity - a.popularity)
      case 'rating':
        return moviesCopy.sort((a, b) => b.vote_average - a.vote_average)
      case 'latest':
        return moviesCopy.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
      case 'votes':
        return moviesCopy.sort((a, b) => b.vote_count - a.vote_count)
      default:
        return moviesCopy
    }
  }

  if (loading) {
    return (
      <div className="trending-page">
        <div className="container">
          <p>Loading trending movies...</p>
        </div>
      </div>
    )
  }

  const sortedMovies = getSortedMovies()

  return (
    <div className="trending-page">
      <div className="container">
        <section className="trending-header">
          <h1>🔥 Trending Now</h1>
          <p>The most popular and highest-rated movies right now</p>
        </section>

        <section className="trending-filters">
          <h2>Sort By</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${sortBy === 'popularity' ? 'active' : ''}`}
              onClick={() => setSortBy('popularity')}
            >
              Most Popular
            </button>
            <button
              className={`filter-btn ${sortBy === 'rating' ? 'active' : ''}`}
              onClick={() => setSortBy('rating')}
            >
              Highest Rated
            </button>
            <button
              className={`filter-btn ${sortBy === 'latest' ? 'active' : ''}`}
              onClick={() => setSortBy('latest')}
            >
              Latest Release
            </button>
            <button
              className={`filter-btn ${sortBy === 'votes' ? 'active' : ''}`}
              onClick={() => setSortBy('votes')}
            >
              Most Voted
            </button>
          </div>
        </section>

        <section className="trending-movies">
          {sortedMovies.length > 0 ? (
            <div className="trending-grid">
              {sortedMovies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} className="trending-item">
                  <div className="trend-rank">#{index + 1}</div>
                  <MovieCard
                    movie={{ ...movie, id: movie.csvIndex, index: movie.csvIndex }}
                    setMovieData={setMovieData}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No trending movies found.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Trending
