import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/jeb.png";
import notif from "../assets/notification.png";
import "./Navbar.css";
import { getUser } from "../utils/auth.js";
import { apiFetch } from "../api/client";
import { useTranslation } from "react-i18next";

export default function NavBar() {
  const { t } = useTranslation();
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
      const data = Array.isArray(notificationsData) ? notificationsData : [];
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
        error.message || t("navbar.fetchError")
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
      await apiFetch(`/notifications/${selectedNotification.id}/read`, {
        method: "PATCH",
      });
      const readAt = new Date().toISOString();
      const updatedNotification = { ...selectedNotification, readAt };
      setSelectedNotification(updatedNotification);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === selectedNotification.id
            ? { ...notification, readAt }
            : notification
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || t("navbar.markReadError")
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
            <p className="site-name">{t("navbar.siteName")}</p>
          </Link>
        </div>

        <div className="nav-right">
          {/* NOTIFICATION BUTTON */}
          {user?.role === "employer" && (
            <button
              type="button"
              className="notification-btn"
              onClick={fetchNotifications}
              aria-label={t("navbar.notificationsAria")}
            >
              <img src={notif} alt={t("navbar.notificationsAria")} className="notif-logo" />
            </button>
          )}
          <Link to="/more" className="nav-link">
            {t("navbar.aboutLink")}
          </Link>
          {user?.role === "seeker" && (
            <Link to="/my-application" className="nav-link">
              {t("navbar.applicationsLink")}
            </Link>
          )}
          {user?.role === "employer" && (
            <div className="employer-actions">
              <Link to="/my-job-offers" className="nav-link">
                {t("navbar.myOffersLink")}
              </Link>
              <Link to="/job-offers" className="nav-link">
                {t("navbar.createOfferLink")}
              </Link>
            </div>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="nav-link">
              {t("navbar.adminLink")}
            </Link>
          )}
          <Link
            to={user ? "/profile" : "/login"}
            className="profile-btn"
            aria-label={t("navbar.accountAria")}
          >
            👤
          </Link>
        </div>
      </nav>

      {/* NOTIF MODAL */}
      {isNotificationModalOpen && (
        <div className="modal-overlay" onClick={closeNotification}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            {/* CLOSE BUTTON */}
            <button
              className="modal-close"
              onClick={closeNotification}
              type="button"
              aria-label={t("navbar.closeAria")}
            >
              ×
            </button>
            <h2>{t("navbar.notificationsTitle")}</h2>

            {/* NOTIF GALLERY */}
            {notifications.length === 0 && (
              <p>{t("navbar.noNotifications")}</p>
            )}
            <div className="notification-gallery">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    selectedNotification?.id === notification.id ? "active" : ""
                  }`}
                  onClick={() => openNotification(notification)}
                >
                  <div className="notification-card-header">
                    <span className="notification-type">
                      {notification.type === "application" && t("navbar.typeApplication")}
                      {notification.type === "job" && t("navbar.typeJob")}
                      {notification.type === "system" && t("navbar.typeSystem")}
                    </span>
                    <span className="notification-date">
                      {notification.readAt ? t("navbar.read") : t("navbar.unread")}
                    </span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                </article>
              ))}
            </div>

            {/* ACTIONS */}
            {selectedNotification && (
              <div className="modal-actions">
                {selectedNotification.readAt === null && (
                  <button
                    type="button"
                    className="mark-read-btn"
                    onClick={markNotificationAsRead}
                    disabled={loading}
                  >
                    {loading ? t("navbar.markingAsRead") : t("navbar.markAsRead")}
                  </button>
                )}
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeNotification}
                >
                  {t("navbar.close")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}