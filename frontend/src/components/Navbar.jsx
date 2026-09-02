import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/jeb.png";
import "./Navbar.css";
import { getUser } from "../utils/auth.js";

function NavBar() {
  const user = getUser();

  return (
    <nav className="nav-bar-container">

      <div className="logo-section">
        <Link to="/Home" className="logo-container"><img src={logo} alt="Logo" className="logo" /></Link>
        <Link to="/Home" className="logo-container"><p className="site-name">GéoEmploi</p></Link>
      </div>

      <div className="nav-right">
        <Link to="/about" className="nav-link">À propos</Link>

        {user?.role === "seeker" && (
          <Link to="/applied-jobs" className="nav-link">Applied Jobs</Link>
        )}
        {user?.role === "rh" && (
          <Link to="/job-offers" className="nav-link">Job Offers</Link>
        )}
        <Link to={user ? "/profile" : "/login"}className="profile-btn" aria-label="Account"> 👤 </Link>
      </div>
    </nav>
  );
}

export default NavBar;
