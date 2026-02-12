import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo2.png'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <Link to="/">
                <span className="logo-icon"><img src={logo} alt="logo" className='logo-img' /></span>
                <span className="logo-text">Movie</span>
              </Link>
            </div>
            <p className="footer-description">
              Discover your next favorite movie with AI-powered recommendations tailored to your taste.
            </p>
            <div className="social-links">
              <a href="https://buymeacoffee.com/youssefelhelw" target="_blank" rel="noopener noreferrer" aria-label="Buy Me a Coffee">☕</a>
              <a href="https://www.linkedin.com/in/ahmed-ehab-dev/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn - Ahmed Ehab">🔗</a>
              <a href="https://www.linkedin.com/in/youssefelhelw/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn - Youssef">🔗</a>
              <a href="https://github.com/Ahmed-eltohfa" target="_blank" rel="noopener noreferrer" aria-label="GitHub - Ahmed">🐙</a>
              <a href="https://github.com/Youssef-Elhelw" target="_blank" rel="noopener noreferrer" aria-label="GitHub - Youssef">🐙</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/genres">Genres</Link></li>
              <li><Link to="/trending">Trending</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>

          {/* Popular Genres */}
          <div className="footer-section">
            <h4 className="footer-title">Popular Genres</h4>
            <ul className="footer-links">
              <li><Link to="/genres">Action</Link></li>
              <li><Link to="/genres">Comedy</Link></li>
              <li><Link to="/genres">Drama</Link></li>
              <li><Link to="/genres">Sci-Fi</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="mailto:info@movierecs.com">Contact Us</a></li>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} MovieRecs. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer