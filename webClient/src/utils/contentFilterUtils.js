/**
 * Filters a list of items based on content type filter
 * @param {Array} items - Array of movies/series items
 * @param {string} filterType - 'movies', 'series', or 'both'
 * @returns {Array} Filtered items
 */
export function filterByContentType(items, filterType) {
    if (!items || !Array.isArray(items)) {
        return []
    }

    if (filterType === 'both') {
        return items
    }

    if (filterType === 'movies') {
        return items.filter(item => item.is_movie === 1 || item.is_movie === true)
    }

    if (filterType === 'series') {
        return items.filter(item => item.is_movie === 0 || item.is_movie === false)
    }

    return items
}

/**
 * Merges and filters movies and series arrays from API response
 * @param {Object} apiResponse - { movies: [], series: [] }
 * @param {string} filterType - 'movies', 'series', or 'both'
 * @returns {Array} Combined and filtered results
 */
export function mergeMoviesAndSeries(apiResponse, filterType = 'both') {
    const movies = apiResponse?.movies || []
    const series = apiResponse?.series || []

    if (filterType === 'movies') {
        return movies
    }

    if (filterType === 'series') {
        return series
    }

    // 'both' - combine movies first, then series
    return [...movies, ...series]
}
