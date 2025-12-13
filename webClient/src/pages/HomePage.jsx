import './HomePage.css'
import HeroSection from '../components/HeroSection.jsx'
import MovieCard from '../components/MovieCard.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFeatured, setRecommended, setSuggested, selectFeatured, selectRecommended, selectSuggested } from '../store/moviesSlice'

export default function HomePage({ setMovieData }) {
  const dispatch = useDispatch()
  const featuredMovies = useSelector(selectFeatured)
  const recommendedMovies = useSelector(selectRecommended)
  const suggestedMovies = useSelector(selectSuggested)
  // console.log('HomePage featuredMovies:', featuredMovies);

  const onMovieSelect = (movie) => {
    const mv = { ...movie, image: movie.poster_url ?? movie.poster }
    dispatch(setFeatured([mv]))
  }

  const onGetSuggestion = (movies) => {
    const newMovies = (movies || []).map((movie) => ({
      id: movie.index, // Assign a unique id
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0,4) : 'N/A',
      genre: movie.genres,
      description: movie.overview,
      image: movie.poster_url,
      poster: movie.poster_url,
      rating: movie.rating
    }))
    dispatch(setRecommended(newMovies.slice(0,3)))
    dispatch(setSuggested(newMovies.slice(3)))
  }

    useEffect(()=>{
      // scroll to top when page loads
      window.scrollTo(0, 0);
    })

  return (
    <div className="home-page">
      <HeroSection onMovieSelect={onMovieSelect} onGetSuggestion={onGetSuggestion} />
      
      <section className="featured-section">
        <div className="container">
            <h2 className="section-title">Selected Moive</h2>
          <div className="featured-movie">

            { featuredMovies.length > 0 ?
              featuredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} featured setMovieData={setMovieData} />
              ))
              : <div>No movie selected.</div>
            }
          </div>
        </div>
      </section>

      <section className="recommendations-section">
        <div className="container">
          <h2 className="section-title">Our Recommendation</h2>
          <div className="recommendations-grid">
            { recommendedMovies.length > 0 ?
            recommendedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} setMovieData={setMovieData} />
            )) : <div>No recommendations yet.</div>
            }
          </div>
        </div>
      </section>

      <section className="suggested-section">
        <div className="container">
          <h2 className="section-title">You Might Also Like...</h2>
          <div className="movies-scroll">
            { suggestedMovies.length > 0 &&
            suggestedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} compact  setMovieData={setMovieData}/>
            ))
            }
          </div>
        </div>
      </section>
    </div>
  )
}