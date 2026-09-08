import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Account.css";
import NavBar from "../components/Navbar";
import { useTranslation } from "react-i18next";

function Account() {
  const { t } = useTranslation();
  return (
    <div className="account">
      <NavBar />
      <div className="account-container">
        <h1>{t("account.title")}</h1>
        <p className="subtitle">{t("account.subtitle")}</p>
        <div className="buttons-container">
          <Link to="/register/rh" className="role-button rh-button">{t("account.button1")}</Link>
          <Link to="/register/seeker" className="role-button seeker-button">{t("accoutn.button2")}</Link>
        </div>
        <p className="footer">{t("account.question")}{" "}<Link to="/login">{t("account.link")}</Link></p>
      </div>
    </div>
  );
}

export default Account;
