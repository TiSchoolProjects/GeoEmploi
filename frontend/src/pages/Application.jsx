import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/Dashboard.css";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";
import { useTranslation } from "react-i18next";

export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [selectedApplication, setSelectedApplication] = useState(null);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const seekerId = user?.sub;
        if (!seekerId) {
          throw new Error(t("application.fetchUserError"));
        }
        const applicationsData = await apiFetch(`/applications/seeker/${seekerId}`);
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      } catch (err) {
        console.error(err);
        setError(err.message || t("application.fetchError"));
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [t]);

  const handleDelete = async (applicationId) => {
    const result = await Swal.fire({
      title: t("application.deleteConfirmTitle"),
      text: t("application.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("application.deleteConfirmButton"),
      cancelButtonText: t("application.deleteCancelButton"),
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
      toast.success(t("application.deleteSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("application.deleteError"));
      setError(t("application.deleteError"));
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
          <h1>{t("application.title")}</h1>
          <p>{t("application.subtitle")}</p>
        </div>

        {loading && (
          <div className="loading-message">
            <p>{t("application.loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-items">
            <h2>{t("application.emptyTitle")}</h2>
            <p>{t("application.emptyText")}</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="items-gallery">
            {applications.map((application) => {
              const job = application.job;

              return (
                <div className="item-card" key={`application-${application.id}`}>
                  <div className="item-card-content">
                    <h2>{job?.title || t("application.untitledOffer")}</h2>
                    {job?.company && (
                      <p className="item-company"> {t("application.company")} {job.company}</p>
                    )}

                    {job?.commune && (
                      <p className="item-location">{t("application.location")} {job.commune}</p>
                    )}

                    {job?.description && (
                      <p className="item-description"> {t("application.description")}{" "} {truncateDescription(job.description, 120)}</p>
                    )}

                    {job?.contractType && (
                      <span className="item-tag">{job.contractType}</span>
                    )}

                    {application.status && (
                      <span className="item-tag"> {t("application.status")} : {application.status}</span>
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
                      title={t("application.detailsTitle")}
                    >
                      {t("application.detailsButton")}
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="item-action-btn delete-btn"
                      onClick={() => handleDelete(application.id)}
                      disabled={deletingId === application.id}
                      title={t("application.deleteTitle")}
                    >
                      {deletingId === application.id ? t("application.deleting") : t("application.deleteButton")}
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
            <button className="modal-close" onClick={closeDetails} type="button">x</button>
            <h2>{selectedApplication.job?.title || t("application.modalDefaultTitle")}</h2>

            {/* INFORMATIONS CANDIDATURE */}
            <div className="details-section">
              <h3>{t("application.modalApplicationInfo")}</h3>
              <div className="detail-row">
                <strong>{t("application.status")}</strong>
                <span>{selectedApplication.status || t("application.notProvided")}</span>
              </div>

              {selectedApplication.createdAt && (
                <div className="detail-row">
                  <strong>{t("application.applicationDate")}</strong>
                  <span>{new Date(selectedApplication.createdAt).toLocaleDateString(i18n.language)}</span>
                </div>
              )}
            </div>

            {/* INFORMATIONS OFFRE */}
            {selectedApplication.job && (
              <div className="details-section">
                <h3>{t("application.modalOfferInfo")}</h3>
                <div className="detail-row">
                  <strong>{t("application.offerTitle")}</strong>
                  <span>{selectedApplication.job.title || t("application.notProvided")}</span>
                </div>

                <div className="detail-row">
                  <strong>{t("application.company")}</strong>
                  <span>{selectedApplication.job.company || t("application.notProvidedFem")}</span>
                </div>

                <div className="detail-row">
                  <strong>{t("application.location")}</strong>
                  <span>{selectedApplication.job.commune || t("application.notProvidedFem")}</span>
                </div>

                {selectedApplication.job.contractType && (
                  <div className="detail-row">
                    <strong>{t("application.contractType")}</strong>
                    <span>{selectedApplication.job.contractType}</span>
                  </div>
                )}

                <div className="detail-row detail-description">
                  <strong>{t("application.description")}</strong>
                  <p>{selectedApplication.job.description || t("application.noDescription")}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="modal-secondary-btn" onClick={closeDetails}>{t("application.close")}</button>

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
                {deletingId === selectedApplication.id ? t("application.deletingInProgress") : t("application.deleteButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}