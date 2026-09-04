import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/MyJobOffers.css";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";

export default function MyJobOffers() {
  const [offers, setOffers] = useState([]);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [selectedOffer, setSelectedOffer] = useState(null);

  const [editingOffer, setEditingOffer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const employerId = user?.sub;

        if (!employerId) {
          throw new Error("Impossible de récupérer l'identifiant de l'employeur.");
        }

        const offersData = await apiFetch(`/jobs/employer/${employerId}`);
        const employerData = await apiFetch(`/employers/${employerId}`);

        setEmployer(employerData);
        const offersWithEmployer = Array.isArray(offersData) ? offersData.map((offer) => ({...offer, employer: employerData,})): [];
        setOffers(offersWithEmployer);
      } catch (err) {
        console.error(err);
        setError(err.message || "Impossible de charger vos offres.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (offerId) => {
    const result = await Swal.fire({
      title: "Supprimer l'offre ?",
      text: "Êtes-vous sûr de vouloir supprimer cette offre ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(offerId);
      setError("");

      await apiFetch(`/jobs/${offerId}`, {method: "DELETE"}); 

      setOffers((currentOffers) => currentOffers.filter((offer) => offer.id !== offerId));
      toast.success("Offre supprimé avec succès");
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer l'offre.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDetails = (offer) => {
    setSelectedOffer(offer);
  };

  const closeDetails = () => {
    setSelectedOffer(null);
  };

  const handleEdit = (offer) => {
    setEditingOffer({...offer,});
  };

  const closeEdit = () => {
    setEditingOffer(null);
  };

  const handleEditChange = (e) => {
    const {name, value} = e.target;

    setEditingOffer((current) => ({...current, [name]: value,}));
  };

  const handleSaveEdit = async (e) => {
    const token = getToken();
    e.preventDefault();

    if (!editingOffer)return;

    try {
      setSaving(true);
      setError("");

      const updatedOffer = await apiFetch(`/jobs/${editingOffer.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingOffer.title,
          description: editingOffer.description,
          adress: editingOffer.adress,
        }),
      });
      const updatedOfferWithEmployer = {...updatedOffer,employer: employer,};

      setOffers((currentOffers) =>
        currentOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOfferWithEmployer : offer
        )
      );
      toast.success("Offre modifié avec succès");
      setEditingOffer(null);
    } catch (err) {
      console.error(err);
      toast.error("Modification impossible");
      setError("Modification impossible");
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return "";
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trimEnd() + "...";
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
                  {offer.employer && (
                    <div className="offer-company-info">
                      {offer.employer.companyName && (
                        <p className="offer-company">Entreprise: {offer.employer.companyName}</p>
                      )}
                      {offer.employer.email && (
                        <p>{offer.employer.email}</p>
                      )}
                    </div>
                  )}
                  {offer.adress && (
                    <p className="offer-location"> Adresse: {offer.adress}</p>
                  )}
                  {offer.description && (
                    <p className="offer-description"> Description: {truncateDescription(offer.description, 120)}</p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="offer-card-footer">
                  {/* DETAILS */}
                  <button type="button" className="offer-action-btn details-btn" onClick={() => handleDetails(offer)} title="Voir les détails">
                    Détail
                  </button>

                  {/* EDIT */}
                  <button
                    type="button"
                    className="offer-action-btn edit-btn"
                    onClick={() => handleEdit(offer)}
                    disabled={deletingId === offer.id}
                    title="Modifier l'offre">
                    Editer
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    className="offer-action-btn delete-btn"
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    title="Supprimer l'offre">
                    {deletingId === offer.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* POPUP */}
      {selectedOffer && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails} type="button">
              x
            </button>

            <h2>{selectedOffer.title}</h2>
            <div className="details-section">
              <h3>Informations de l'offre</h3>

              <div className="detail-row">
                <strong>Titre</strong>
                <span>{selectedOffer.title || "Non renseigné"}</span>
              </div>

              <div className="detail-row">
                <strong>Adresse</strong>
                <span>{selectedOffer.adress || "Non renseignée"}</span>
              </div>

              <div className="detail-row detail-description">
                <strong>Description</strong>
                <p>{selectedOffer.description || "Aucune description disponible."}</p>
              </div>
            </div>

            {selectedOffer.employer && (
              <div className="details-section">
                <h3>Informations de l'entreprise</h3>

                {selectedOffer.employer.companyName && (
                  <div className="detail-row">
                    <strong>Entreprise</strong>
                    <span>{selectedOffer.employer.companyName}</span>
                  </div>
                )}

                {selectedOffer.employer.email && (
                  <div className="detail-row">
                    <strong>Email</strong>
                    <span>{selectedOffer.employer.email}</span>
                  </div>
                )}

                {selectedOffer.employer.companyDesc && (
                  <div className="detail-row">
                    <strong>Description</strong>
                    <span>{selectedOffer.employer.companyDesc}</span>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-secondary-btn"onClick={closeDetails}>Fermer</button> 
              <button type="button" className="modal-edit-btn"
                onClick={() => {closeDetails(); handleEdit(selectedOffer);}}
              >
                 Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP EDIT */}

      {editingOffer && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEdit} type="button">
              x
            </button>

            <h2>Modifier l'offre</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label htmlFor="title">Titre de l'offre</label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={editingOffer.title || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="adress">Adresse</label>

                <input
                  id="adress"
                  type="text"
                  name="adress"
                  value={editingOffer.adress || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  rows="7"
                  value={editingOffer.description || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
