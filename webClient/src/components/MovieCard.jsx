import './MovieCard.css'
import { useNavigate } from 'react-router-dom'

export default function MovieCard({ movie, featured = false, compact = false , setMovieData}) {
  // console.log('MovieCard movie:', movie);
  const navigate = useNavigate()
  if (compact) {
    return (
      <div className="movie-card-compact" onClick={()=> navigate(`/movie/${movie.id || movie.index}`)}>
        <div className="movie-poster-compact">
          <img src={movie.image || movie.poster_url} alt={movie.title} />
        </div>
        <div className="movie-info-compact">
          <h3 className="movie-title-compact">{movie.title}</h3>
          <p className="movie-genre-compact">{movie.genre || movie.genres}</p>
        </div>
      </div>
    )
  }


  if (featured) {
    return (
      <div className="movie-card featured">
        <div className="movie-featured-content">
          <div className="movie-poster-featured" style={{ backgroundImage: `url(${movie.image})` }}>
            <img src={movie.image} alt={movie.title} />
          </div>
          <div className="movie-info-featured">
            <p className="movie-meta">{movie?.release_date?.slice(0,4)} • {movie.genre}</p>
            <h2 className="movie-title-featured">{movie.title}</h2>
            <p className="movie-description">{movie.description}</p>
            <div style={{ marginTop: '1rem' }}>
              {/* <button className="btn-view-details" onClick={() => navigate(`/movie/${movie.id}`, { state: { movie } })}>View Details</button> */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-card" onClick={setMovieData(movie.id)}>
      <div className="movie-poster" style={{ backgroundImage: `url(${movie.image || movie.poster || movie.poster_url})` }}>
        <img src={movie.image || movie.poster || movie.poster_url} alt={movie.title} />
      </div>
      <div className="movie-info">
        <p className="movie-meta">{movie.year || movie?.release_date?.slice(0,4)} • {movie.genre || movie.genres}</p>
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-description">{movie?.description || movie?.overview}</p>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn-view-details" onClick={() => navigate(`/movie/${movie.id || movie.index}`)}>View Details</button>
        </div>
      </div>
    </div>
  )
}