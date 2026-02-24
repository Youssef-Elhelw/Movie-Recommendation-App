import { useDispatch, useSelector } from 'react-redux'
import { setContentFilter, selectContentFilter } from '../store/moviesSlice'
import './ContentFilter.css'

export default function ContentFilter() {
  const dispatch = useDispatch()
  const contentFilter = useSelector(selectContentFilter)

  const handleFilter = (filterType) => {
    dispatch(setContentFilter(filterType))
  }

  return (
    <div className="content-filter">
      <div className="filter-label">Show:</div>
      <div className="filter-buttons-group">
        <button
          className={`filter-btn ${contentFilter === 'movies' ? 'active' : ''}`}
          onClick={() => handleFilter('movies')}
          aria-label="Show only movies"
        >
          🎬 Movies
        </button>
        <button
          className={`filter-btn ${contentFilter === 'series' ? 'active' : ''}`}
          onClick={() => handleFilter('series')}
          aria-label="Show only series"
        >
          📺 Series
        </button>
        <button
          className={`filter-btn ${contentFilter === 'both' ? 'active' : ''}`}
          onClick={() => handleFilter('both')}
          aria-label="Show both movies and series"
        >
          ⭐ Both
        </button>
      </div>
    </div>
  )
}
