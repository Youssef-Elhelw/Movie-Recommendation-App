import './HomePage.css'
import HeroSection from '../components/HeroSection.jsx'
import ContentFilter from '../components/ContentFilter.jsx'
import MovieCard from '../components/MovieCard.jsx'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFeatured, setRecommendedMovies, setRecommendedSeries, setSuggestedMovies, setSuggestedSeries, selectFeatured, selectRecommendedMovies, selectRecommendedSeries, selectSuggestedMovies, selectSuggestedSeries, selectContentFilter } from '../store/moviesSlice'

export default function HomePage({ setMovieData }) {
  const dispatch = useDispatch()
  const featuredMovies = useSelector(selectFeatured)
  const recommendedMovies = useSelector(selectRecommendedMovies)
  const recommendedSeries = useSelector(selectRecommendedSeries)
  const suggestedMovies = useSelector(selectSuggestedMovies)
  const suggestedSeries = useSelector(selectSuggestedSeries)
  const contentFilter = useSelector(selectContentFilter)
  // console.log('HomePage featuredMovies:', featuredMovies);

  const onMovieSelect = (movie) => {
    const mv = { ...movie, image: movie.poster_url ?? movie.poster }
    dispatch(setFeatured([mv]))
  }

  const onGetSuggestion = (apiResponse) => {
    const moviesList = (apiResponse?.movies || []).map((movie) => ({
      id: movie.index,
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0,4) : 'N/A',
      genre: movie.genres,
      description: movie.overview,
      image: movie.poster_url,
      poster: movie.poster_url,
      rating: movie.rating,
      is_movie: movie.is_movie
    }))
    
    const seriesList = (apiResponse?.series || []).map((series) => ({
      id: series.index,
      title: series.title,
      year: series.release_date ? series.release_date.slice(0,4) : 'N/A',
      genre: series.genres,
      description: series.overview,
      image: series.poster_url,
      poster: series.poster_url,
      rating: series.rating,
      is_movie: series.is_movie
    }))

    dispatch(setRecommendedMovies(moviesList.slice(0,10)))
    dispatch(setRecommendedSeries(seriesList.slice(0,10)))
    dispatch(setSuggestedMovies(moviesList.slice(10)))
    dispatch(setSuggestedSeries(seriesList.slice(10)))
  }

    useEffect(()=>{
      // scroll to top when page loads
      window.scrollTo(0, 0);
    })

  return (
    <div className="home-page">
      <HeroSection onMovieSelect={onMovieSelect} onGetSuggestion={onGetSuggestion} />
      
      <ContentFilter />
      
      <section className="featured-section">
        <div className="container">
            <h2 className="section-title">Selected Movie</h2>
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
          {(contentFilter === 'movies' || contentFilter === 'both') && (
            <div className="recommendations-movies">
              <h2 className="section-title">🎬 Recommended Movies</h2>
              <div className="recommendations-grid">
                { recommendedMovies.length > 0 ?
                recommendedMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} setMovieData={setMovieData} />
                )) : <div className="no-content">No movie recommendations yet.</div>
                }
              </div>
            </div>
          )}
          
          {(contentFilter === 'series' || contentFilter === 'both') && (
            <div className="recommendations-series">
              <h2 className="section-title">📺 Recommended Series</h2>
              <div className="recommendations-grid">
                { recommendedSeries.length > 0 ?
                recommendedSeries.map(series => (
                  <MovieCard key={series.id} movie={series} setMovieData={setMovieData} />
                )) : <div className="no-content">No series recommendations yet.</div>
                }
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="suggested-section">
        <div className="container">
          {(suggestedMovies.length > 0 || suggestedSeries.length > 0) && (
            <div className="suggested-combined">
              <h2 className="section-title">You Might Also Like...</h2>
              <div className="movies-scroll">
                {contentFilter === 'movies' && suggestedMovies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} compact setMovieData={setMovieData}/>
                ))}
                {contentFilter === 'series' && suggestedSeries.map(series => (
                  <MovieCard key={series.id} movie={series} compact setMovieData={setMovieData}/>
                ))}
                {contentFilter === 'both' && (
                  <>
                    {suggestedMovies.map(movie => (
                      <MovieCard key={`movie-${movie.id}`} movie={movie} compact setMovieData={setMovieData}/>
                    ))}
                    {suggestedSeries.map(series => (
                      <MovieCard key={`series-${series.id}`} movie={series} compact setMovieData={setMovieData}/>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}