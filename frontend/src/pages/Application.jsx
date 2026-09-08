import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/Dashboard.css";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";

export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const seekerId = user?.sub;
        if (!seekerId) {
          throw new Error("Impossible de récupérer l'identifiant de l'utilisateur.");
        }
        const applicationsData = await apiFetch(`/applications/seeker/${seekerId}`);
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Impossible de charger vos candidatures.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleDelete = async (applicationId) => {
    const result = await Swal.fire({
      title: "Supprimer la candidature ?",
      text: "Êtes-vous sûr de vouloir supprimer cette candidature ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(applicationId);
      setError("");
      await apiFetch(`/applications/${applicationId}`, {method: "DELETE",});
      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== applicationId)
      );
      setSelectedApplication(null);
      toast.success("Candidature supprimée avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la candidature.");
      setError("Impossible de supprimer la candidature.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDetails = (application) => {
    setSelectedApplication(application);
  };

  const closeDetails = () => {
    setSelectedApplication(null);
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
          <h1>Mes candidatures</h1>
          <p>Retrouvez ici toutes les offres auxquelles vous avez postulé.</p>
        </div>

        {loading && (
          <div className="loading-message">
            <p>Chargement des candidatures...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-items">
            <h2>Aucune candidature</h2>
            <p>Vous n'avez pas encore postulé à une offre d'emploi.</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="items-gallery">
            {applications.map((application) => {
              const job = application.job;

              return (
                <div className="item-card" key={`application-${application.id}`}>
                  <div className="item-card-content">
                    <h2>{job?.title || "Offre sans titre"}</h2>
                    {job?.company && (
                      <p className="item-company"> Entreprise : {job.company}</p>
                    )}

                    {job?.commune && (
                      <p className="item-location">Commune : {job.commune}</p>
                    )}

                    {job?.description && (
                      <p className="item-description"> Description :{" "} {truncateDescription(job.description, 120)}</p>
                    )}

                    {job?.contractType && (
                      <span className="item-tag">{job.contractType}</span>
                    )}

                    {application.status && (
                      <span className="item-tag"> Statut : {application.status}</span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="item-card-footer">
                    {/* DETAILS */}
                    <button
                      type="button"
                      className="item-action-btn details-btn"
                      onClick={() => handleDetails(application)}
                      disabled={deletingId === application.id}
                      title="Voir les détails"
                    >
                      Détail
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="item-action-btn delete-btn"
                      onClick={() => handleDelete(application.id)}
                      disabled={deletingId === application.id}
                      title="Supprimer la candidature"
                    >
                      {deletingId === application.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* POPUP DETAILS */}
      {selectedApplication && (
        <div
          className="modal-overlay"
          onClick={closeDetails}
        >
          <div
            className="modal-content details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeDetails}type="button">x</button>
            <h2>{selectedApplication.job?.title || "Détails de la candidature"}</h2>

            {/* INFORMATIONS CANDIDATURE */}
            <div className="details-section">
              <h3>Informations de la candidature</h3>
              <div className="detail-row">
                <strong>Statut</strong>
                <span>{selectedApplication.status || "Non renseigné"}</span>
              </div>

              {selectedApplication.createdAt && (
                <div className="detail-row">
                  <strong>Date de candidature</strong>
                  <span>{new Date(selectedApplication.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
            </div>

            {/* INFORMATIONS OFFRE */}
            {selectedApplication.job && (
              <div className="details-section">
                <h3>Informations de l'offre</h3>
                <div className="detail-row">
                  <strong>Titre</strong>
                  <span>{selectedApplication.job.title || "Non renseigné"}</span>
                </div>

                <div className="detail-row">
                  <strong>Entreprise</strong>
                  <span>{selectedApplication.job.company || "Non renseignée"}</span>
                </div>

                <div className="detail-row">
                  <strong>Commune</strong>
                  <span>{selectedApplication.job.commune || "Non renseignée"}</span>
                </div>

                {selectedApplication.job.contractType && (
                  <div className="detail-row">
                    <strong>Type de contrat</strong>
                    <span>{selectedApplication.job.contractType}</span>
                  </div>
                )}

                <div className="detail-row detail-description">
                  <strong>Description</strong>
                  <p>{selectedApplication.job.description || "Aucune description disponible."}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-secondary-btn" onClick={closeDetails}>Fermer</button>

              <button
                type="button"
                className="modal-edit-btn"
                onClick={() =>
                  handleDelete(selectedApplication.id)
                }
                disabled={
                  deletingId === selectedApplication.id
                }
              >
                {deletingId === selectedApplication.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
