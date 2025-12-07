import './MovieCard.css'

export default function MovieCard({ movie, featured = false, compact = false }) {
  if (compact) {
    return (
      <div className="movie-card-compact">
        <div className="movie-poster-compact">
          <img src={movie.image} alt={movie.title} />
        </div>
        <div className="movie-info-compact">
          <h3 className="movie-title-compact">{movie.title}</h3>
          <p className="movie-genre-compact">{movie.genre}</p>
        </div>
      </div>
    )
  }

  if (featured) {
    return (
      <div className="movie-card featured">
        <div className="movie-featured-content">
          <div className="movie-poster-featured">
            <img src={movie.image} alt={movie.title} />
          </div>
          <div className="movie-info-featured">
            <p className="movie-meta">{movie.release_date.slice(0,4)} • {movie.genre}</p>
            <h2 className="movie-title-featured">{movie.title}</h2>
            <p className="movie-description">{movie.description}</p>
            {/* <button className="btn-view-details">View Details</button> */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.image} alt={movie.title} />
      </div>
      <div className="movie-info">
        <p className="movie-meta">{movie.year} • {movie.genre}</p>
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-description">{movie.description}</p>
        {/* <button className="btn-view-details">View Details</button> */}
      </div>
    </div>
  )
}