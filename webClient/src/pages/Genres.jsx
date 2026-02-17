import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import MovieCard from '../components/MovieCard'
import csvData from '../assets/final_movies.csv?raw'
import './Genres.css'

function Genres({ setMovieData }) {
  const [movies, setMovies] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredMovies, setFilteredMovies] = useState([])
  const [displayCount, setDisplayCount] = useState(8)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setDisplayCount(8)
  }, [selectedGenre])

  useEffect(() => {
    // Parse CSV file
    Papa.parse(csvData, {
      header: true,
      complete: (results) => {
        const moviesData = results.data
          .map((movie, idx) => ({...movie, csvIndex: idx}))
          .filter(movie => movie.title && movie.genres)
        setMovies(moviesData)

        // Extract unique genres
        const genreSet = new Set()
        moviesData.forEach(movie => {
          if (movie.genres) {
            const genreList = movie.genres.split(',').map(g => g.trim())
            genreList.forEach(genre => genreSet.add(genre))
          }
        })
        const uniqueGenres = Array.from(genreSet).sort()
        setGenres(uniqueGenres)
        setLoading(false)
      },
    })
  }, [])

  useEffect(() => {
    if (selectedGenre) {
      const filtered = movies.filter(movie =>
        movie.genres && movie.genres.includes(selectedGenre)
      )
      setFilteredMovies(filtered.slice(0, displayCount))
    } else {
      setFilteredMovies([])
    }
  }, [selectedGenre, movies, displayCount])

  if (loading) {
    return (
      <div className="genres-page">
        <div className="container">
          <p>Loading genres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="genres-page">
      <div className="container">
        <section className="genres-header">
          <h1>Explore by Genre</h1>
          <p>Browse movies by your favorite genres</p>
        </section>

        <section className="genres-selector">
          <h2>Select a Genre</h2>
          <div className="genres-grid">
            {genres.map(genre => (
              <button
                key={genre}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {selectedGenre && (
          <section className="genre-results">
            <h2>{selectedGenre} Movies</h2>
            {filteredMovies.length > 0 ? (
              <>
                <div className="movies-grid">
                  {filteredMovies.map((movie, index) => (
                    <MovieCard
                      key={`${movie.id}-${index}`}
                      movie={{
                        id: movie.csvIndex,
                        index: movie.csvIndex,
                        title: movie.title,
                        poster_url: movie.poster_path,
                        poster: movie.poster_path,
                        genres: movie.genres,
                        overview: movie.overview,
                        vote_average: movie.vote_average,
                        rating: movie.vote_average,
                        release_date: movie.release_date,
                      }}
                      setMovieData={setMovieData}
                    />
                  ))}
                </div>
                {movies.filter(movie => movie.genres && movie.genres.includes(selectedGenre)).length > displayCount && (
                  <button className="see-more-btn" onClick={() => setDisplayCount(displayCount + 8)}>
                    See More
                  </button>
                )}
              </>
            ) : (
              <p>No movies found in this genre.</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default Genres
