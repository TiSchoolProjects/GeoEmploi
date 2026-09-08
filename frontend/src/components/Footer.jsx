import React from "react";
import "./Footer.css";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="foot-text">
        <p>{t("footer.text")}</p>
      </div>
    </footer>
  );
}