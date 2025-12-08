import { useEffect, useState } from 'react'
import './HeroSection.css'
import SearchSuggestions from './SearchSuggestions'

export default function HeroSection({ onMovieSelect, onGetSuggestion }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fetchFlag, setFetchFlag] = useState(true)

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/search?q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setSearchSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (fetchFlag) {
        fetchSearchResults(searchQuery)
      }
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  useEffect(()=>{
    console.log(searchQuery);
  },[searchQuery])

  const handleSelectSuggestion = async (suggestion) => {
      setFetchFlag(false)
      setSearchQuery(suggestion.title);
      handleGetRecommendation(suggestion.title);
      console.log(searchQuery);
      setShowSuggestions(false)
      if (onMovieSelect) {
        suggestion = {...suggestion, id: Math.random()}; // Assign a random id if not present
        onMovieSelect(suggestion)
      }
      setTimeout(() => {
        setFetchFlag(true)
      }, 500);
  }

  const handleGetRecommendation = async (searchQuery_p) => {    
    if (searchQuery_p.trim()) {
      // Call the recommend API
      fetch(`${import.meta.env.VITE_BACKEND_URL}/recommend?title=${encodeURIComponent(searchQuery_p)}`)
        .then(response => response.json())
        .then(data => {
          console.log('Recommendations:', data)
          if (onGetSuggestion) {
            onGetSuggestion(data)
          }
        })
        .catch(error => {
          console.error('Error fetching recommendations:', error)
        })
    }
  }

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Find Your Next Favorite Movie</h1>
        <p className="hero-subtitle">Tell us a movie you love, and we'll find your next obsession.</p>

        <div className="search-container-wrapper">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Enter a movie you love"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              />
            </div>
            <button
              className="btn-get-recommendation"
              onClick={()=>{handleGetRecommendation(searchQuery)}}
            >
              Get Recommendation
            </button>
          </div>
          {showSuggestions && (
            <SearchSuggestions
              suggestions={searchSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}