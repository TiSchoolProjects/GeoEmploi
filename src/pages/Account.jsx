import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Account.css";
import NavBar from "../components/Navbar";

function Account() {
  return (
    <div className="account">
      <NavBar />
      <div className="account-container">
        <h1>Bienvenue sur GéoEmploi</h1>
        <p className="subtitle"> Créez votre compte et commencez votre expérience dès maintenant.</p>
        <div className="buttons-container">
          <Link to="" className="role-button rh-button"> Créer un compte RH </Link>
          <Link to="" className="role-button seeker-button"> Créer un compte Seeker </Link>
        </div>
        <p className="footer">Déjà un compte ?{" "}<Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}

export default Account;