import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo2.png'
import './Navbar.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-icon"><img src={logo} alt="logo" className='logo-img' /></span>
            <span className="logo-text">Movie</span>
          </Link>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/genres" onClick={closeMenu}>Genres</Link></li>
          <li><Link to="/trending" onClick={closeMenu}>Trending</Link></li>
          <li><Link to="/about" onClick={closeMenu}>About</Link></li>
          <li><a href="https://buymeacoffee.com/youssefelhelw" target="_blank" rel="noopener noreferrer" className='yellow-highlight' onClick={closeMenu}>Buy Me a Coffee</a></li>
        </ul>

        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  )
}