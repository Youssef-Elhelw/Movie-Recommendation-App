import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">📺</span>
          <span className="logo-text">MovieRecs</span>
        </div>
        <ul className="navbar-menu">
          <li><a href="#/">Home</a></li>
          <li><a href="#/genres">Genres</a></li>
          <li><a href="#/mylist">My List</a></li>
        </ul>
        <div className="navbar-actions">
          <button className="btn-signin">Sign In</button>
          <div className="user-avatar"></div>
        </div>
      </div>
    </nav>
  )
}