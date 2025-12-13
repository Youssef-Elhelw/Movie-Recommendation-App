import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    featured: [
        // {
        //     description: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
        //     genre: "Action, Science Fiction, Adventure",
        //     id: 0.2874389046866638,
        //     image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        //     poster_url: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        //     release_date: "2010-07-15",
        //     score: 35,
        //     title: "Inception"
        // }
    ],
    recommended: [],
    //     [{
    //         "backdrop_path": "/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
    //         "budget": 9000000,
    //         "genres": "Mystery, Thriller",
    //         "homepage": null,
    //         "imdb_id": "tt0209144",
    //         "index": 139,
    //         "original_language": "en",
    //         "original_title": "Memento",
    //         "overview": "Leonard Shelby is tracking down the man who raped and murdered his wife. The difficulty of locating his wife's killer, however, is compounded by the fact that he suffers from a rare, untreatable form of short-term memory loss. Although he can recall details of life before his accident, Leonard cannot remember what happened fifteen minutes ago, where he's going, or why.",
    //         "popularity": 31.795,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg",
    //         "rating": 8.188,
    //         "release_date": "2000-10-11",
    //         "revenue": 39723096,
    //         "status": "Released",
    //         "tagline": "Some memories are best forgotten.",
    //         "title": "Memento",
    //         "vote_average": 8.188,
    //         "vote_count": 13723
    //     },
    //     {
    //         "backdrop_path": "/mWLljCmpqlcYQh7uh51BBMwCZwN.jpg",
    //         "budget": 9000000,
    //         "genres": "Horror, Thriller, Mystery",
    //         "homepage": "https://www.escaperoom.movie/",
    //         "imdb_id": "tt5886046",
    //         "index": 971,
    //         "original_language": "en",
    //         "original_title": "Escape Room",
    //         "overview": "Six strangers find themselves in circumstances beyond their control, and must use their wits to survive.",
    //         "popularity": 25.429,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/8Ls1tZ6qjGzfGHjBB7ihOnf7f0b.jpg",
    //         "rating": 6.535,
    //         "release_date": "2019-01-03",
    //         "revenue": 155712077,
    //         "status": "Released",
    //         "tagline": "Find The Clues Or Die",
    //         "title": "Escape Room",
    //         "vote_average": 6.535,
    //         "vote_count": 4315
    //     },
    //     {
    //         "backdrop_path": "/3ZiM6gm2XL8qnhZCXsTjixvaH4v.jpg",
    //         "budget": 85000000,
    //         "genres": "Action, Crime, Drama, Thriller",
    //         "homepage": "https://www.thefastsaga.com/fast-saga/ff4",
    //         "id": 533,
    //         "imdb_id": "tt1013752",
    //         "original_language": "en",
    //         "original_title": "Fast & Furious",
    //         "overview": "When a crime brings them back to L.A., fugitive ex-con Dom Toretto reignites his feud with agent Brian O'Conner. But as they are forced to confront a shared enemy, Dom and Brian must give in to an uncertain new trust if they hope to outmaneuver him. And the two men will find the best way to get revenge: push the limits of what's possible behind the wheel.",
    //         "popularity": 7.716,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/lUtVoRukW7WNtUySwd8hWlByBds.jpg",
    //         "production_companies": "dentsu, Universal Pictures, Relativity Media, Original Film, One Race",
    //         "production_countries": "Japan, United States of America",
    //         "rating": 6.68,
    //         "release_date": "2009-04-02",
    //         "revenue": 363164265,
    //         "runtime": 107,
    //         "spoken_languages": "English, Spanish",
    //         "status": "Released",
    //         "tagline": "New model. Original parts.",
    //         "title": "Fast & Furious",
    //         "vote_average": 6.68,
    //         "vote_count": 6702
    //     }
    // ],
    suggested: []
    // [
    //     {
    //         "backdrop_path": "/63y4XSVTZ7mRzAzkqwi3o0ajDZZ.jpg",
    //         "budget": 100000000,
    //         "genres": "Crime, Drama, Comedy",
    //         "homepage": "http://www.thewolfofwallstreet.com/",
    //         "id": 22,
    //         "imdb_id": "tt0993846",
    //         "original_language": "en",
    //         "original_title": "The Wolf of Wall Street",
    //         "overview": "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street, corporate banking world and mob infiltration. Based on Jordan Belfort's autobiography.",
    //         "popularity": 97.444,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg",
    //         "production_companies": "EMJAG Productions, Red Granite Pictures, Appian Way, Sikelia Productions",
    //         "production_countries": "United States of America",
    //         "rating": 8.035,
    //         "release_date": "2013-12-25",
    //         "revenue": 392000000,
    //         "runtime": 180,
    //         "spoken_languages": "English, French",
    //         "status": "Released",
    //         "tagline": "Earn. Spend. Party.",
    //         "title": "The Wolf of Wall Street",
    //         "vote_average": 8.035,
    //         "vote_count": 22222
    //     },
    //     {
    //         "backdrop_path": "/2nqsOT2AqPkTW81bWaLRtjgjqVM.jpg",
    //         "budget": 80000000,
    //         "genres": "Drama, Thriller, Mystery",
    //         "homepage": "http://www.shutterisland.com/",
    //         "id": 21,
    //         "imdb_id": "tt1130884",
    //         "original_language": "en",
    //         "original_title": "Shutter Island",
    //         "overview": "World War II soldier-turned-U.S. Marshal Teddy Daniels investigates the disappearance of a patient from a hospital for the criminally insane, but his efforts are compromised by troubling visions and a mysterious doctor.",
    //         "popularity": 56.595,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
    //         "production_companies": "Phoenix Pictures, Paramount, Appian Way, Sikelia Productions, Mandate International",
    //         "production_countries": "United States of America",
    //         "rating": 8.2,
    //         "release_date": "2010-02-14",
    //         "revenue": 294800000,
    //         "runtime": 138,
    //         "spoken_languages": "English, German",
    //         "status": "Released",
    //         "tagline": "Some places never let you go.",
    //         "title": "Shutter Island",
    //         "vote_average": 8.2,
    //         "vote_count": 22318
    //     },
    //     {
    //         "backdrop_path": "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    //         "budget": 185000000,
    //         "genres": "Drama, Action, Crime, Thriller",
    //         "homepage": "https://www.warnerbros.com/movies/dark-knight/",
    //         "id": 2,
    //         "imdb_id": "tt0468569",
    //         "original_language": "en",
    //         "original_title": "The Dark Knight",
    //         "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    //         "popularity": 130.643,
    //         "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    //         "production_companies": "DC Comics, Legendary Pictures, Syncopy, Isobel Griffiths, Warner Bros. Pictures",
    //         "production_countries": "United Kingdom, United States of America",
    //         "rating": 8.512,
    //         "release_date": "2008-07-16",
    //         "revenue": 1004558444,
    //         "runtime": 152,
    //         "spoken_languages": "English, Mandarin",
    //         "status": "Released",
    //         "tagline": "Welcome to a world without rules.",
    //         "title": "The Dark Knight",
    //         "vote_average": 8.512,
    //         "vote_count": 30619
    //     }
    // ]
}

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setFeatured(state, action) {
            state.featured = action.payload ?? []
        },
        setRecommended(state, action) {
            state.recommended = action.payload ?? []
        },
        setSuggested(state, action) {
            state.suggested = action.payload ?? []
        },
        setAll(state, action) {
            const { featured, recommended, suggested } = action.payload || {}
            state.featured = featured ?? []
            state.recommended = recommended ?? []
            state.suggested = suggested ?? []
        }
    }
})

export const { setFeatured, setRecommended, setSuggested, setAll } = moviesSlice.actions
export default moviesSlice.reducer

// selectors
export const selectFeatured = (state) => state.movies.featured
export const selectRecommended = (state) => state.movies.recommended
export const selectSuggested = (state) => state.movies.suggested
