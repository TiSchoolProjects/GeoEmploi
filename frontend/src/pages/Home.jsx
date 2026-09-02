import React from "react";
import logo from "../assets/jeb.png";
import { Link } from "react-router-dom";
import "../CSS/Home.css";
import NavBar from "../components/Navbar";
import LocLogo from "../assets/LogoCarte.png";


function Home() {
  return (
    <div className="home">
a
      {/* NAVBAR */}
      <NavBar />
      {/* BODY */}
      <main className="body-container">
        <div className="body-style-container">
          <p>Découvrez le marché <br /> de l'emploi <br /> français</p>
          <div className="map-button-container">
            <Link to="/map" className="map-btn"> <span>Découvrir la carte</span> <span className="arrow">→</span> </Link>
          </div>
        </div>
        <div className="image-container"> <img src={LocLogo} alt="Illustration" /></div>
      </main>
    </div>
  );
}

export default Home;
