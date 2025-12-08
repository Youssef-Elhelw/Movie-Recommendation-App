import './HomePage.css'
import HeroSection from '../components/HeroSection'
import MovieCard from '../components/MovieCard'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState([
    {
      id: 1,
      title: 'Inception',
      year: 2010,
      genre: 'Sci-Fi, Action',
      description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      image: 'https://image.tmdb.org/t/p/original/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      poster: 'https://image.tmdb.org/t/p/original/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg'
    }
  ])

  const [recommendedMovies, setRecommendedMovies] = useState([
    {
      id: 2,
      title: 'The Matrix',
      year: 1999,
      genre: 'Sci-Fi, Action',
      description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth -- the life he knows is a mere simulation.',
      image: 'https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      poster: 'https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
    },
    {
      id: 9,
      title: 'escape room',
      year: 2019,
      genre: 'Thriller, Mystery',
      description: 'Six strangers find themselves in circumstances beyond their control, and must use their wits to survive.',
      image: 'https://image.tmdb.org/t/p/original/8Ls1tZ6qjGzfGHjBB7ihOnf7f0b.jpg',
      poster: 'https://image.tmdb.org/t/p/original/8Ls1tZ6qjGzfGHjBB7ihOnf7f0b.jpg'
    },
    {
      id: 10,
      title: 'arrival',
      year: 2016,
      genre: 'Sci-Fi, Drama',
      description: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
      image: 'https://image.tmdb.org/t/p/original/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
      poster: 'https://image.tmdb.org/t/p/original/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg'
    }
  ])

  const [suggestedMovies, setSuggestedMovies] = useState([
    {
      id: 3,
      title: 'The Dark Knight',
      year: 2008,
      genre: 'Action, Crime, Drama',
      image: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      poster: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    },
    {
      id: 4,
      title: 'Shutter Island',
      year: 2010,
      genre: 'Mystery, Thriller',
      image: 'https://image.tmdb.org/t/p/original/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg',
      poster: 'https://image.tmdb.org/t/p/original/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg'
    },
    {
      id: 5,
      title: 'Fight Club',
      year: 1999,
      genre: 'Drama',
      image: 'https://image.tmdb.org/t/p/original/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
      poster: 'https://image.tmdb.org/t/p/original/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg'
    },
    {
      id: 6,
      title: 'Pulp Fiction',
      year: 1994,
      genre: 'Crime, Drama',
      image: 'https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      poster: 'https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'
    },
    {
      id: 7,
      title: 'Blade Runner 2049',
      year: 2017,
      genre: 'Sci-Fi, Action, Drama',
      image: 'https://image.tmdb.org/t/p/original/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg',
      poster: 'https://image.tmdb.org/t/p/original/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg'
    },
    {
      id: 8,
      title: 'Interstellar',
      year: 2014,
      genre: 'Sci-Fi, Adventure',
      image: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
      poster: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg'
    }
  ])

  const onMovieSelect = (movie) => {
    console.log('Selected movie:', movie)
    movie.image = movie.poster_url;
    setFeaturedMovies([movie]);
  }

  const onGetSuggestion = (movies) => {
    console.log('Recommended movies:', movies)
    const newMovies = movies.map((movie) => ({
      id: movie.index, // Assign a unique id
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0,4) : 'N/A',
      genre: movie.genres,
      description: movie.overview,
      image: movie.poster_url,
      poster: movie.poster_url,
      rating: movie.rating
    }));
    setRecommendedMovies(newMovies?.slice(0,3));
    setSuggestedMovies(newMovies?.slice(3,));
    }

  return (
    <div className="home-page">
      <HeroSection onMovieSelect={onMovieSelect} onGetSuggestion={onGetSuggestion} />
      
      <section className="featured-section">
        <div className="container">
            <h2 className="section-title">Selected Moive</h2>
          <div className="featured-movie">

            {featuredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} featured />
            ))}
          </div>
        </div>
      </section>

      <section className="recommendations-section">
        <div className="container">
          <h2 className="section-title">Our Recommendation</h2>
          <div className="recommendations-grid">
            {recommendedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      <section className="suggested-section">
        <div className="container">
          <h2 className="section-title">You Might Also Like...</h2>
          <div className="movies-scroll">
            {suggestedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}