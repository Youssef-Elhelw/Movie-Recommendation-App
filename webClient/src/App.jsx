import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/NavBar.jsx'
import HomePage from './pages/HomePage.jsx'
import MoviePage from './pages/MoviePage.jsx'
import Footer from './components/Footer.jsx'
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
        </Routes>
        <Footer />
      </div>
    </Provider>
  )
}

export default App
