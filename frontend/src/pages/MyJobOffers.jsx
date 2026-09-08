import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/Dashboard.css";
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
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
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
        const offersWithEmployer = Array.isArray(offersData)
          ? offersData.map((offer) => ({ ...offer, employer: employerData })) : [];
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

      await apiFetch(`/jobs/${offerId}`, { method: "DELETE" });
      setOffers((currentOffers) =>
        currentOffers.filter((offer) => offer.id !== offerId)
      );
      toast.success("Offre supprimé avec succès");
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer l'offre.");
      toast.error("Impossible de supprimer l'offre.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDetails = async (offer) => {
    setSelectedOffer(offer);
    setApplications([]);
    setApplicationsError("");
    setApplicationsLoading(true);

    try {
      const data = await apiFetch(`/applications/job/${offer.id}`);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setApplicationsError("Impossible de charger les candidatures.");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOffer(null);
    setApplications([]);
    setApplicationsError("");
  };

const updateApplicationStatus = async (
  applicationId,
  status
) => {
  try {
    const updated = await apiFetch(`/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status,}),});

    setApplications((cur) =>
      cur.map((app) =>
        app.id === applicationId ? {...app, status: updated.status ?? status,} :app
      )
    );

    toast.success(status === "accepted" ? "Candidature acceptée" : "Candidature refusée.");
  } catch (error) {
    console.error(error);
    toast.error("Impossible de modifier la candidature.");
  }
};


  const handleEdit = (offer) => {
    setEditingOffer({ ...offer });
  };

  const closeEdit = () => {
    setEditingOffer(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingOffer((current) => ({ ...current, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editingOffer) return;

    try {
      setSaving(true);
      setError("");

      const updatedOffer = await apiFetch(`/jobs/${editingOffer.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingOffer.title,
          description: editingOffer.description,
          commune: editingOffer.commune,
        }),
      });
      const updatedOfferWithEmployer = { ...updatedOffer, employer: employer };

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

      <main className="dashboard-page">
        <div className="dashboard-header">
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
          <div className="empty-items">
            <h2>Aucune offre publiée</h2>
            <p>Vous n'avez pas encore créé d'offre d'emploi.</p>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="items-gallery">
            {offers.map((offer) => (
              <div className="item-card" key={`offer-${offer.id}`}>
                <div className="item-card-content">
                  <h2>{offer.title}</h2>

                  <p className="item-views">
                    {offer.views ?? 0} vue{(offer.views ?? 0) > 1 ? "s" : ""}
                  </p>

                  {offer.employer && (
                    <div className="item-company-info">
                      {offer.employer.companyName && (
                        <p className="item-company"> Entreprise: {offer.employer.companyName}</p>
                      )}
                      {offer.employer.email && <p>{offer.employer.email}</p>}
                    </div>
                  )}

                  {offer.commune && (
                    <p className="item-location"> Commune: {offer.commune}</p>
                  )}

                  {offer.description && (
                    <p className="item-description"> {" "} Description: {truncateDescription(offer.description, 120)}</p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="item-card-footer">
                  {/* DETAILS */}
                  <button
                    type="button"
                    className="item-action-btn details-btn"
                    onClick={() => handleDetails(offer)}
                    title="Voir les détails"
                  >
                    Détail
                  </button>

                  {/* EDIT */}
                  <button
                    type="button"
                    className="item-action-btn edit-btn"
                    onClick={() => handleEdit(offer)}
                    disabled={deletingId === offer.id}
                    title="Modifier l'offre"
                  >
                    Editer
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    className="item-action-btn delete-btn"
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    title="Supprimer l'offre"
                  >
                    {deletingId === offer.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* POPUP DETAILS */}
      {selectedOffer && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails} type="button">x</button>

            <h2>{selectedOffer.title}</h2>
            <div className="details-section">
              <h3>Informations de l'offre</h3>

              <div className="detail-row">
                <strong>Titre</strong>
                <span>{selectedOffer.title || "Non renseigné"}</span>
              </div>

              <div className="detail-row">
                <strong>Commune</strong>
                <span>{selectedOffer.commune || "Non renseignée"}</span>
              </div>

              <div className="detail-row detail-description">
                <strong>Description</strong>
                <p> {selectedOffer.description || "Aucune description disponible."}</p>
              </div>

              <div className="detail-row">
                <strong>Nombre de vues</strong>
                <span>{selectedOffer.views ?? 0}</span>
              </div>
            </div>

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
              <div className="details-section">
                  <h3>
                    Candidatures ({applications.length})
                  </h3>

                  {applicationsLoading && (
                    <p>Chargement des candidatures...</p>
                  )}

                  {applicationsError && (
                    <p className="error-message">
                      {applicationsError}
                    </p>
                  )}

                  {!applicationsLoading &&
                    !applicationsError &&
                    applications.length === 0 && (
                      <p>Aucune candidature reçue pour cette offre.</p>
                    )}

                  {!applicationsLoading &&
                    applications.map((application) => {
                      const seeker = application.jobSeeker;
                      const profile = seeker?.seekerProfile;

                      return (
                        <div
                          className="candidate-card"
                          key={`application-${application.id}`}
                        >
                          <h4>{seeker?.firstname || "Prénom"}{" "} {seeker?.lastname || "Nom"} </h4>

                          <div className="detail-row">
                            <strong>Email</strong>
                            <span>{seeker?.email || "Non renseigné"}</span>
                          </div>

                          <div className="detail-row">
                            <strong>Compétences</strong>

                            <span>{profile?.skills?.length ? profile.skills.join(", ") : "Non renseignées"}</span>
                          </div>
                              
                          <div className="detail-row">
                            <strong>Expérience</strong>
                              
                            <span>
                              {profile?.experience ||
                                "Non renseignée"}
                            </span>
                          </div>
                              
                          <div className="detail-row">
                            <strong>Disponibilité</strong>
                              
                            <span>
                              {profile?.availability ||
                                "Non renseignée"}
                            </span>
                          </div>
                              
                          <div className="detail-row">
                            <strong>Statut</strong>
                              
                            <span>
                              {application.status === "waiting" && "En attente"}
                              {application.status === "accepted" && "Acceptée"}
                              {application.status === "rejected" && "Refusée"}
                            </span>
                          </div>

                          <div className="detail-row">
                              <strong>Candidature reçue le</strong>
                          
                              <span>
                                {new Date(
                                  application.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            </div>

                            <div className="candidate-actions">
                              <button type="button" className="candidate-accept-btn" disabled={application.status === "accepted"}
                              onClick={() => updateApplicationStatus(application.id, "accepted")} >
                                Accepter
                              </button>
                        
                              <button type="button" className="candidate-reject-btn" disabled={application.status === "rejected"}
                              onClick={() => updateApplicationStatus(application.id, "rejected")}>
                                Refuser      
                              </button>
                            </div>
                        </div>
                      );
                    })}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={closeDetails}
              >
                Fermer
              </button>
              <button
                type="button"
                className="modal-edit-btn"
                onClick={() => {
                  closeDetails();
                  handleEdit(selectedOffer);
                }}
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
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeEdit} type="button">x</button>
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
                <label htmlFor="commune">Commune</label>

                <input
                  id="commune"
                  type="text"
                  name="commune"
                  value={editingOffer.commune || ""}
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

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >
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
