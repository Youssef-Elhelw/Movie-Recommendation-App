import './SearchSuggestions.css'

export default function SearchSuggestions({ 
  suggestions, 
  onSelectSuggestion, 
  loading, 
  selectedIndex = -1,
  hoveredIndex = -1,
  onHover = () => {}
}) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="search-suggestions">
      <div className="suggestions-list">
        {loading && <div className="suggestion-item loading">Loading...</div>}
        {!loading && suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item ${selectedIndex === index || hoveredIndex === index ? 'selected' : ''}`}
            onClick={() => onSelectSuggestion(suggestion)}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(-1)}
          >
            <div className="suggestion-poster">
              {suggestion.poster_url ? (
                <img src={suggestion.poster_url} alt={suggestion.title} />
              ) : (
                <div className="poster-placeholder">No Image</div>
              )}
            </div>
            <div className="suggestion-info">
              <h4 className="suggestion-title">{suggestion.title}</h4>
              <p className="suggestion-date">{suggestion.release_date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}