import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/jeb.png";
import notif from "../assets/notification.png"
import "./Navbar.css";
import { getUser } from "../utils/auth.js";

function NavBar() {
  const user = getUser();
  const [selectedNotification, setSelectedNotification] = useState(null);

  // replce with API fetch
  const notifications = [
    {
      id: 1,
      title: "Nouvelle candidature",
      message: "Vous avez reçu une nouvelle candidature pour votre offre.",
      date: "Aujourd'hui",
      type: "application",
    },
    {
      id: 1,
      title: "Nouvelle candidature",
      message: "Vous avez reçu une nouvelle candidature pour votre offre.",
      date: "02/09/06",
      type: "application",
    },
    {
      id: 1,
      title: "Nouvelle candidature",
      message: "Vous avez reçu une nouvelle candidature pour votre offre.",
      date: "Hier",
      type: "application",
    },
    {
      id: 1,
      title: "Nouvelle candidature",
      message: "Vous avez reçu une nouvelle candidature pour votre offre.",
      date: "28/09/06",
      type: "application",
    },
  ];

  const openNotification = (notification) => {
    setSelectedNotification(notification);
  };

  const closeNotification = () => {
    setSelectedNotification(null);
  };

  return (
    <main className="Navbar-GUI">
      <nav className="nav-bar-container">
        <div className="logo-section">
          <Link to="/Home" className="logo-container">
            <p className="site-name">GéoEmploi</p>
          </Link>
        </div>

        <div className="nav-right">
          {/* NOTIFICATION BUTTON */}
          <button
            type="button"
            className="notification-btn"
            onClick={() => openNotification(notifications[0])}
            aria-label="Notifications">
            <img src={notif} alt="Notifications" className="notif-logo"/>
            {/* Notification badge */}
          </button>

          <Link to="/Cgu" className="nav-link">À propos</Link>

          {user?.role === "seeker" && (
            <Link to="/my-application" className="nav-link">Candidatures</Link>
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
      {/*NOTIF ODAL*/}
      {selectedNotification && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            {/* CLOSE BUTTON */}
            <button className="modal-close" onClick={closeNotification} type="button" aria-label="Fermer">×</button>
            <h2>Notifications</h2>

            {/*NOTIF GALLERY*/}
            <div className="notification-gallery">

              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-card ${selectedNotification.id === notification.id ? "active" : ""}`}
                  onClick={() => openNotification(notification)}
                >
                  <div className="notification-card-header">
                    <span className="notification-type">
                      {notification.type === "application"}
                      {notification.type === "job"}
                      {notification.type === "system"}
                    </span>
                    <span className="notification-date">{notification.date}</span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                </article>
              ))}
            </div>

            {/* SELECTED NOTIFICATION */}
            <div className="notification-details">
              <h3>{selectedNotification.title}</h3>
              <p>{selectedNotification.message}</p>
              <span className="notification-details-date">{selectedNotification.date}</span>
            </div>

            {/* ACTIONS */}
            <div className="modal-actions">
              <button type="button" className="modal-close-btn"onClick={closeNotification}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default NavBar;
