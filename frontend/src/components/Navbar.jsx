import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/jeb.png";
import notif from "../assets/notification.png"
import "./Navbar.css";
import { getUser } from "../utils/auth.js";
import { apiFetch } from "../api/client";

export default function NavBar() {
  const user = getUser();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    if (selectedNotification) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedNotification]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const notificationsData = await apiFetch("/notifications");
      const data = Array.isArray(notificationsData) ? notificationsData: [];
      setNotifications(data);
      if (data.length > 0) {
        setSelectedNotification(data[0]);
      } else {
        setSelectedNotification(null);
      }
      setIsNotificationModalOpen(true);

    } catch (error) {
      console.error(error);
      setError(
        error.message || "Impossible de charger vos notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const openNotification = (notification) => {
    setSelectedNotification(notification);
  };

  const closeNotification = () => {
    setSelectedNotification(null);
    setIsNotificationModalOpen(false);
  };

  const markNotificationAsRead = async () => {
    if (!selectedNotification?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiFetch(`/notifications/${selectedNotification.id}/read`,
        {
          method: "PATCH",
        }
      );
      const updatedNotification = {...selectedNotification, read: true, isRead: true,};
      setSelectedNotification(updatedNotification);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === selectedNotification.id
            ? {...notification, read: true, isRead: true} : notification
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Impossible de marquer la notification comme lue."
      );
    } finally {
      setLoading(false);
    }
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
          {user?.role === "employer" && (
            <button
              type="button"
              className="notification-btn"
              onClick={fetchNotifications}
              aria-label="Notifications">
              <img src={notif} alt="Notifications" className="notif-logo" />
            </button>
          )}
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
          {user?.role === "admin" && (
            <Link to ="/admin" className="nav-link">
              Administration
            </Link>  
          )}
          <Link to={user ? "/profile" : "/login"}className="profile-btn" aria-label="Account"> 👤 </Link>
        </div>
      </nav>
      {/*NOTIF ODAL*/}
      {isNotificationModalOpen && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            {/* CLOSE BUTTON */}
            <button className="modal-close" onClick={closeNotification} type="button" aria-label="Fermer">×</button>
            <h2>Notifications</h2>

            {/*NOTIF GALLERY*/}
            {notifications.length === 0 && (
              <p>Aucune notification pour le moment.</p>
            )}
            <div className="notification-gallery">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-card ${selectedNotification?.id === notification.id ? "active" : ""}`}
                  onClick={() => openNotification(notification)}
                >
                  <div className="notification-card-header">
                    <span className="notification-type">
                      {notification.type === "application" && "Candidature"}
                      {notification.type === "job" && "Offre"}
                      {notification.type === "system" && "Système"}
                    </span>
                    <span className="notification-date">{notification.date}</span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                </article>
              ))}
            </div>

            {/* ACTIONS */}
            {selectedNotification && (
              <div className="modal-actions">
                {!selectedNotification.read &&
                  !selectedNotification.isRead && (
                    <button
                      type="button"
                      className="mark-read-btn"
                      onClick={markNotificationAsRead}
                      disabled={loading}
                    >
                      {loading ? "Enregistrement..." : "Marquer comme lue"}
                    </button>
                  )}
              <button type="button" className="modal-close-btn"onClick={closeNotification}>Fermer</button>
            </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

