import React from "react";
import logo from "../assets/jeb.png";
import { Link } from "react-router-dom";
import "../CSS/Home.css";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer"
import LocLogo from "../assets/LogoCarte.png";

import { useTranslation } from "react-i18next";


function Home() {
  const {t} = useTranslation()
  return (
    <div className="home">
      {/* NAVBAR */}
      <NavBar />
      {/* BODY */}
      <main className="body-container">
        <div className="body-style-container">
          <p>{t("home.title")}<br />{t("home.subtitle")}</p>
          <div className="map-button-container">
            <Link to="/map" className="map-btn"> <span>{t("home.mapButton")}</span> <span className="arrow">→</span> </Link>
          </div>
        </div>
        <div className="image-container"> <img src={LocLogo} alt={t("home.imageAlt")} /></div>
      </main>
    </div>
  );
}

export default Home;
