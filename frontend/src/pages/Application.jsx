import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar";
import "../CSS/MyJobOffers.css";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";

export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = getToken();
    const seekerId = user?.sub;

    if (!seekerId) {
      setError("Impossible de récupérer l'identifiant de l'utilisateur.");
      setLoading(false);
      return;
    }

    apiFetch(`/applications/seeker/${seekerId}`)
      .then((data) => {
          setApplications(Array.isArray(data) ? data : []);
        })
       .catch((err) => {
        console.error(err);
        setError("Impossible de charger vos candidature.");
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
    });
  }, []);

  const handleEdit = (applicationId) => {
    console.log("Modifier la candidature :", applicationId);
  };

  const handleDelete = (applicationId) => {
    console.log("Supprimer la candidature :", applicationId);
  };

  return (
    <>
      <NavBar />

      <main className="job-offers-page">
        <div className="job-offers-header">
          <h1>Mes offres</h1>
          <p>Retrouvez ici toutes les offres que vous avez publiées.</p>
        </div>

        {loading && (
          <div className="loading-message">
            <p>Chargement des offres...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-offers">
            <h2>Aucune offre postulées</h2>
            <p>Vous avez postulée à aucune offre d'emploi.</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="offers-gallery">
            {applications.map((application) => (
              <div className="offer-card" key={`offer-${application.id}`}>
                <div className="offer-card-content">
                  <h2>{application.job?.title}</h2>

                  {application.job?.company && (
                    <p className="offer-company"> {application.job?.company}</p>
                  )}

                  {application.job?.adress && (
                    <p className="offer-location">{application.job?.adress}</p>
                  )}

                  {application.job?.description && (
                    <p className="offer-description">{application.job?.description}</p>
                  )}

                  {application.job?.contractType && (
                    <span className="offer-tag">{application.contapplicationractType}</span>
                  )}
                </div>

                <div className="offer-card-footer">
                  <button className="edit-offer-btn"onClick={() => handleEdit(application.id)}>
                    Modifier
                  </button>

                  <button className="delete-offer-btn" onClick={() => handleDelete(application.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
