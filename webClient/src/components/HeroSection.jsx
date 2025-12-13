import { useEffect, useState, useRef } from 'react'
import './HeroSection.css'
import SearchSuggestions from './SearchSuggestions.jsx'

export default function HeroSection({ onMovieSelect, onGetSuggestion }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [arrowVisible, setArrowVisible] = useState(false)
  const [fetchFlag, setFetchFlag] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const arrowTimeoutRef = useRef(null)

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
      // show the double-down arrows briefly when suggestions arrive
      setArrowVisible(true)
      if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current)
      arrowTimeoutRef.current = setTimeout(() => {
        setArrowVisible(false)
      }, 4000)
      setSelectedIndex(-1)
      setHoveredIndex(-1)
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
      setArrowVisible(false)
      if (arrowTimeoutRef.current) {
        clearTimeout(arrowTimeoutRef.current)
        arrowTimeoutRef.current = null
      }
      setSelectedIndex(-1)
      setHoveredIndex(-1)
    }
  }, [searchQuery])

  const handleSelectSuggestion = (suggestion) => {
    setFetchFlag(false)
    setSearchQuery(suggestion.title)
    handleGetRecommendation(suggestion.title)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setHoveredIndex(-1)
    if (onMovieSelect) {
      suggestion = { ...suggestion, id: Math.random() }
      onMovieSelect(suggestion)
    }
    setTimeout(() => {
      setFetchFlag(true)
    }, 500)
  }

  const handleGetRecommendation = async (searchQuery_p) => {
    if (searchQuery_p.trim()) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/recommend?title=${encodeURIComponent(searchQuery_p)}`)
        .then(response => response.json())
        .then(data => {
          // console.log(searchQuery_p)
          data.forEach((item, index) => {
            // console.log(`${index + 1}. ${item.title}`)
          })
          if (onGetSuggestion) {
            onGetSuggestion(data)
          }
        })
        .catch(error => {
          console.error('Error fetching recommendations:', error)
        })
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchSuggestions([])
    setShowSuggestions(false)
    setArrowVisible(false)
    if (arrowTimeoutRef.current) {
      clearTimeout(arrowTimeoutRef.current)
      arrowTimeoutRef.current = null
    }
    setSelectedIndex(-1)
    setHoveredIndex(-1)
    document.querySelector('.search-input').focus();
  }

  useEffect(()=>{
    // console.log("hoveredIndex changed:", selectedIndex);
  },[selectedIndex])

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (arrowTimeoutRef.current) clearTimeout(arrowTimeoutRef.current)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleGetRecommendation(searchQuery)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        )
        setHoveredIndex(-1)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        setHoveredIndex(-1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(searchSuggestions[selectedIndex])
        } else {
          handleGetRecommendation(searchQuery)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedIndex(-1)
        setHoveredIndex(-1)
        break
      default:
        break
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
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button
                  className="clear-button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              className="btn-get-recommendation"
              onClick={() => { handleGetRecommendation(searchQuery) }}
            >
              Get Recommendation
            </button>
            {/* double down arrows shown when suggestions are available; they auto-hide after a timeout */}
            {!showSuggestions && searchSuggestions.length > 0 && !loading && (
              <div className={`double-down ${arrowVisible ? 'visible' : 'hidden'}`} aria-hidden="true">
                <span className="down-arrow" />
                <span className="down-arrow second" />
              </div>
            )}
          </div>
          {showSuggestions && (
            <SearchSuggestions
              suggestions={searchSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
              loading={loading}
              selectedIndex={selectedIndex}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
        </div>
      </div>
    </div>
  )
}