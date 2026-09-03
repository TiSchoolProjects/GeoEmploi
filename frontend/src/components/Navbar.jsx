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
        <Link to="/Cgu" className="nav-link">À propos</Link>

        {user?.role === "seeker" && (
          <Link to="/applied-jobs" className="nav-link">Candidatures</Link>
        )}
        {user?.role === "employer" && (
          <div className="employer-actions">
            <Link to="/my-job-offers" className="nav-link">Voir mes offres</Link>
            <Link to="/job-offers" className="nav-link">Créer une offre</Link>
          </div>
        )}
        <Link to={user ? "/profile" : "/login"}className="profile-btn" aria-label="Account"> 👤 </Link>
      </div>
    </nav>
  );
}

export default NavBar;
