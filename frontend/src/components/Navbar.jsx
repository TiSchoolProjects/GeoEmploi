import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/jeb.png";
import "./Navbar.css";

function NavBar() {
  return (
    <nav className="nav-bar-container">

      {/* Logo + nom */}
      <div className="logo-section">
        <Link to="../Home" className="logo-container"> <img src={logo} alt="Logo" className="logo" /> </Link>
        <Link to="../Home" className="logo-container"> <p className="site-name">GéoEmploi</p> </Link>
        
      </div>
      {/* Liens à droite */}
      <div className="nav-right">
        <Link to="/about" className="nav-link"> À propos </Link>
        <Link to="/account" className="profile-btn" aria-label="Account"> 👤 </Link>
      </div>
    </nav>
  );
}

export default NavBar;
