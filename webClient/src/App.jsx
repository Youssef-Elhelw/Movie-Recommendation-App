import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/NavBar.jsx'
import HomePage from './pages/HomePage.jsx'
import MoviePage from './pages/MoviePage.jsx'
import Footer from './components/Footer.jsx'
import About from './pages/About.jsx'
import Genres from './pages/Genres.jsx'
import Trending from './pages/Trending.jsx'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'

function App() {
  const [movieData, setMovieData] = useState(null)
  return (
    <Provider store={store}>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage setMovieData={setMovieData} />} />
          <Route path="/movie/:id" element={<MoviePage movieData={movieData}/>} />
          <Route path="/about" element={<About />} />
          <Route path="/genres" element={<Genres setMovieData={setMovieData} />} />
          <Route path="/trending" element={<Trending setMovieData={setMovieData} />} />
        </Routes>
        <Footer />
      </div>
    </Provider>
  )
}

export default App
