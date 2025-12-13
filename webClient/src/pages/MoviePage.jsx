import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../components/MovieCard.css'
import './MoviePage.css'

function MetaRow({ label, value }) {
  return (
    <div className="meta-row imdb">
      <div className="meta-label">{label}</div>
      <div className="meta-value">{value ?? '—'}</div>
    </div>
  )
}

export default function MoviePage({  }) {
    useEffect(()=>{
        // scroll to top when page loads
        window.scrollTo(0, 0);
    })
  const location = useLocation()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
//   console.log('MoviePage movie:', location.state.movie)

//   If no movie object provided, try to fetch using title from query param or state 
  useEffect(() => {
    const movieId = location.state?.movie?.id || location.pathname.split('/movie/')[1]
    // console.log('MoviePage movieId from params:', movieId);

    if (!movie && movieId) {
      setLoading(true)
      fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/movie/${movieId}`)
        .then((r) => r.json())
        .then((data) => {
          // take first returned movie if available
          if (Array.isArray(data) && data.length > 0) {
            setMovie(data[0])
          } else if (data && data.title) {
            setMovie(data)
          } else {
            setError('No movie data returned')
          }
        })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false))
    }
  }, [location, movie])

  if (loading) return <div className="movie-page"><div className="loader">Loading…</div></div>
  if (error) return <div className="movie-page"><div className="error">{error}</div></div>
  if (!movie) return (
    <div className="movie-page">
      <div className="container">
        <button className="back" onClick={() => navigate(-1)}>← Back</button>
        <div className="empty">No movie selected.</div>
      </div>
    </div>
  )

  const backdrop = movie.backdrop_path ?? movie.backdrop ?? ''
  const poster = movie.poster_url ?? movie.poster_path ?? movie.poster ?? ''

  return (
    <div className="movie-page">
      <div
        className="backdrop"
        style={{ backgroundImage: backdrop ? `url(${backdrop})` : undefined }}
      />

      <div className="container">
        <button className="back btn secondary" onClick={() => navigate(-1)}>← Back</button>

        <div className="movie-hero">
          <div className="poster-wrap" style={{ backgroundImage: poster ? `url(${poster})` : undefined }}>
            {poster ? <img src={poster} alt={movie.title ?? 'poster'} /> : <div className="no-poster">No Image</div>}
          </div>

          <div className="movie-info">
            <h1 className="movie-title">{movie.title ?? movie.original_title ?? '—'}</h1>
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}

            <div className="meta-grid">
              <MetaRow label="Released" value={movie.release_date ?? '—'} />
              <MetaRow label="Runtime" value={movie.runtime ? `${movie.runtime} min` : '—'} />
              <MetaRow label="Genres" value={movie.genres ?? '—'} />
              <MetaRow label="Rating" value={movie.vote_average ?? movie.rating ?? '—'} />
            </div>

            <p className="overview">{movie.overview ?? movie.description ?? '—'}</p>

            <div className="actions">
              {movie.homepage ? (
                <a className="btn primary" href={movie.homepage} target="_blank" rel="noreferrer">Visit Homepage</a>
              ) : null}
              <button className="btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share</button>
            </div>

            <div className="more">
              <h3>Details</h3>
              <MetaRow label="Budget" value={movie.budget ? `$${Number(movie.budget).toLocaleString()}` : '—'} />
              <MetaRow label="Revenue" value={movie.revenue ? `$${Number(movie.revenue).toLocaleString()}` : '—'} />
              <MetaRow label="Production" value={movie.production_companies ?? '—'} />
              <MetaRow label="Languages" value={movie.spoken_languages ?? '—'} />
              <MetaRow label="Status" value={movie.status ?? '—'} />
              <MetaRow label="IMDB" value={movie.imdb_id ? <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noreferrer">Home Page</a> : '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
