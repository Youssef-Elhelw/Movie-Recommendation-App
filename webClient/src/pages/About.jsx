import React, { useEffect } from 'react'
import './About.css'

function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>About MovieRecs</h1>
          <p className="about-subtitle">Discover Your Next Favorite Movie with AI-Powered Recommendations</p>
        </section>

        {/* Mission Section */}
        <section className="about-section">
          <div className="section-content">
            <h2>Our Mission</h2>
            <p>
              At MovieRecs, we believe that everyone deserves personalized entertainment recommendations. 
              Our mission is to help movie enthusiasts discover films they'll love by using advanced artificial 
              intelligence and machine learning algorithms to analyze viewing patterns and preferences.
            </p>
            <p>
              We're passionate about creating a platform that makes movie discovery fun, easy, and highly personalized. 
              Whether you're a casual viewer or a film aficionado, we've got something for everyone.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-section">
          <h2>Why Choose MovieRecs?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🤖 AI-Powered Recommendations</h3>
              <p>Our advanced machine learning algorithms analyze movie data and user preferences to suggest films you'll absolutely love.</p>
            </div>
            <div className="feature-card">
              <h3>📊 Comprehensive Database</h3>
              <p>Access information on thousands of movies with detailed ratings, descriptions, genres, and more.</p>
            </div>
            <div className="feature-card">
              <h3>🎬 Genre Exploration</h3>
              <p>Browse movies by genre and discover trending films in each category. Expand your cinematic horizons.</p>
            </div>
            <div className="feature-card">
              <h3>⭐ Trending Movies</h3>
              <p>Stay updated with the latest trending movies and what everyone is watching right now.</p>
            </div>
            <div className="feature-card">
              <h3>👤 Personalized Experience</h3>
              <p>Get recommendations tailored specifically to your taste and viewing history.</p>
            </div>
            <div className="feature-card">
              <h3>🚀 Fast & Easy</h3>
              <p>Simple search functionality and intuitive interface make finding movies a breeze.</p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="about-section">
          <h2>How It Works</h2>
          <div className="how-it-works">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Search or Browse</h3>
              <p>Find movies by title, genre, or trending status</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Analyze</h3>
              <p>Our AI analyzes the movie data and patterns</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized movie recommendations</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section">
          <h2>Our Technology</h2>
          <p>
            MovieRecs is built with modern web technologies and powered by machine learning algorithms that understand movie patterns and user preferences. 
            We use TF-IDF (Term Frequency-Inverse Document Frequency) vectorization to analyze movie content and recommend similar films based on genres, 
            keywords, and other metadata.
          </p>
          <div className="tech-stack">
            <div className="tech-item">Frontend: React + Vite</div>
            <div className="tech-item">Backend: Python Flask</div>
            <div className="tech-item">Mobile: Flutter</div>
            <div className="tech-item">ML: TF-IDF, scikit-learn</div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section about-cta">
          <h2>Get Started Today</h2>
          <p>Ready to discover your next favorite movie? Start exploring with MovieRecs!</p>
          <button className="cta-button">Explore Movies</button>
        </section>
      </div>
    </div>
  )
}

export default About