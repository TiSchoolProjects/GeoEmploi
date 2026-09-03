import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar";
import "../CSS/MyJobOffers.css";

export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const seekerId = user?.sub;

    if (!seekerId) {
      setError("Impossible de récupérer l'identifiant de l'employeur.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:4242/applications/seeker/${seekerId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des offres.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Offres récupérées :", data);
        setApplications(Array.isArray(data) ? data : []); // tableau ? 
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger vos offres.");
        setLoading(false);
      });
  }, []);

  const handleEdit = (applicationId) => {
    console.log("Modifier l'offre :", applicationId);
  };

  const handleDelete = (applicationId) => {
    console.log("Supprimer l'offre :", applicationId);
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
                  <h2>{application.title}</h2>

                  {application.company && (
                    <p className="offer-company">🏢 {application.company}</p>
                  )}

                  {application.adress && (
                    <p className="offer-location">📍 {application.adress}</p>
                  )}

                  {application.description && (
                    <p className="offer-description">{application.description}</p>
                  )}

                  {application.contractType && (
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
