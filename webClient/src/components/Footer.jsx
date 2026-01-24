import React from 'react'
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
          <span className="logo-icon"><img src={logo} alt="logo" className='logo-img' /></span>
          <span className="logo-text">Movie</span>
            </div>
            <p className="footer-description">
              Discover your next favorite movie with AI-powered recommendations tailored to your taste.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#/">Home</a></li>
              <li><a href="#/genres">Genres</a></li>
              <li><a href="#/mylist">My List</a></li>
              <li><a href="#/">Trending</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li><a href="#/">Action</a></li>
              <li><a href="#/">Comedy</a></li>
              <li><a href="#/">Drama</a></li>
              <li><a href="#/">Sci-Fi</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#/">Help Center</a></li>
              <li><a href="#/">Contact Us</a></li>
              <li><a href="#/">Privacy Policy</a></li>
              <li><a href="#/">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} MovieRecs. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#/">Privacy</a>
            <a href="#/">Terms</a>
            <a href="#/">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer