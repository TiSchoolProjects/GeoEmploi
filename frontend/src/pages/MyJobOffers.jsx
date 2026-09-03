import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar";
import "../CSS/MyJobOffers.css";

export default function MyJobOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const employerId = user?.sub;

    if (!employerId) {
      setError("Impossible de récupérer l'identifiant de l'employeur.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:4242/jobs/employer/${employerId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des offres.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Offres récupérées :", data);
        setOffers(Array.isArray(data) ? data : []); // tableau ? 
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger vos offres.");
        setLoading(false);
      });
  }, []);

  const handleEdit = (offerId) => {
    console.log("Modifier l'offre :", offerId);
  };

  const handleDelete = (offerId) => {
    console.log("Supprimer l'offre :", offerId);
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

        {!loading && !error && offers.length === 0 && (
          <div className="empty-offers">
            <h2>Aucune offre publiée</h2>
            <p>Vous n'avez pas encore créé d'offre d'emploi.</p>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="offers-gallery">
            {offers.map((offer) => (
              <div className="offer-card" key={`offer-${offer.id}`}>
                <div className="offer-card-content">
                  <h2>{offer.title}</h2>

                  {offer.company && (
                    <p className="offer-company">🏢 {offer.company}</p>
                  )}

                  {offer.adress && (
                    <p className="offer-location">📍 {offer.adress}</p>
                  )}

                  {offer.description && (
                    <p className="offer-description">{offer.description}</p>
                  )}

                  {offer.contractType && (
                    <span className="offer-tag">{offer.contractType}</span>
                  )}
                </div>

                <div className="offer-card-footer">
                  <button className="edit-offer-btn"onClick={() => handleEdit(offer.id)}>
                    Modifier
                  </button>

                  <button className="delete-offer-btn" onClick={() => handleDelete(offer.id)}>
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
