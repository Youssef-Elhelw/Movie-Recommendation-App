import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
