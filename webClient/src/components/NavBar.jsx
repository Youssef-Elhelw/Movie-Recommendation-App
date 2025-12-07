import { useState } from 'react'
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
          <span className="logo-icon">📺</span>
          <span className="logo-text">MovieRecs</span>
        </div>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#/" onClick={closeMenu}>Home</a></li>
          <li><a href="#/genres" onClick={closeMenu}>Genres</a></li>
          <li><a href="#/mylist" onClick={closeMenu}>My List</a></li>
        </ul>

        <div className="navbar-actions">
          <button className="btn-signin">Sign In</button>
          <div className="user-avatar"></div>
        </div>
      </div>
    </nav>
  )
}