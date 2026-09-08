import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/Dashboard.css";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";
import { useTranslation } from "react-i18next";

export default function MyJobOffers() {
  const { t, i18n } = useTranslation();

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
          throw new Error(t("myOffers.errors.fetchEmployerId"));
        }

        const offersData = await apiFetch(`/jobs/employer/${employerId}`);
        const employerData = await apiFetch(`/employers/${employerId}`);

        setEmployer(employerData);
        const offersWithEmployer = Array.isArray(offersData)
          ? offersData.map((offer) => ({ ...offer, employer: employerData }))
          : [];
        setOffers(offersWithEmployer);
      } catch (err) {
        console.error(err);
        setError(err.message || t("myOffers.errors.fetchOffers"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleDelete = async (offerId) => {
    const result = await Swal.fire({
      title: t("myOffers.deleteConfirmTitle"),
      text: t("myOffers.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("myOffers.actions.delete"),
      cancelButtonText: t("myOffers.actions.cancel"),
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
      toast.success(t("myOffers.deleteSuccess"));
    } catch (err) {
      console.error(err);
      setError(t("myOffers.deleteError"));
      toast.error(t("myOffers.deleteError"));
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
      setApplicationsError(t("myOffers.errors.fetchApplications"));
    } finally {
      setApplicationsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOffer(null);
    setApplications([]);
    setApplicationsError("");
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const updated = await apiFetch(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setApplications((cur) =>
        cur.map((app) =>
          app.id === applicationId
            ? { ...app, status: updated.status ?? status }
            : app
        )
      );

      toast.success(
        status === "accepted"
          ? t("myOffers.applications.acceptedToast")
          : t("myOffers.applications.rejectedToast")
      );
    } catch (error) {
      console.error(error);
      toast.error(t("myOffers.applications.statusError"));
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
      toast.success(t("myOffers.editSuccess"));
      setEditingOffer(null);
    } catch (err) {
      console.error(err);
      toast.error(t("myOffers.editError"));
      setError(t("myOffers.editError"));
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
          <h1>{t("myOffers.title")}</h1>
          <p>{t("myOffers.subtitle")}</p>
        </div>

        {loading && (
          <div className="loading-message">
            <p>{t("myOffers.loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && offers.length === 0 && (
          <div className="empty-items">
            <h2>{t("myOffers.emptyTitle")}</h2>
            <p>{t("myOffers.emptyText")}</p>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="items-gallery">
            {offers.map((offer) => (
              <div className="item-card" key={`offer-${offer.id}`}>
                <div className="item-card-content">
                  <h2>{offer.title}</h2>

                  <p className="item-views">
                    {t("myOffers.viewsCount", { count: offer.views ?? 0 })}
                  </p>

                  {offer.employer && (
                    <div className="item-company-info">
                      {offer.employer.companyName && (
                        <p className="item-company">
                          {t("myOffers.companyPrefix")}{" "}
                          {offer.employer.companyName}
                        </p>
                      )}
                      {offer.employer.email && <p>{offer.employer.email}</p>}
                    </div>
                  )}

                  {offer.commune && (
                    <p className="item-location">
                      {t("myOffers.communePrefix")} {offer.commune}
                    </p>
                  )}

                  {offer.description && (
                    <p className="item-description">
                      {" "}
                      {t("myOffers.descPrefix")}{" "}
                      {truncateDescription(offer.description, 120)}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="item-card-footer">
                  {/* DETAILS */}
                  <button
                    type="button"
                    className="item-action-btn details-btn"
                    onClick={() => handleDetails(offer)}
                    title={t("myOffers.detailsTitle")}
                  >
                    {t("myOffers.actions.details")}
                  </button>

                  {/* EDIT */}
                  <button
                    type="button"
                    className="item-action-btn edit-btn"
                    onClick={() => handleEdit(offer)}
                    disabled={deletingId === offer.id}
                    title={t("myOffers.editTitle")}
                  >
                    {t("myOffers.actions.edit")}
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    className="item-action-btn delete-btn"
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    title={t("myOffers.deleteTitle")}
                  >
                    {deletingId === offer.id
                      ? "..."
                      : t("myOffers.actions.delete")}
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
          <div
            className="modal-content details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeDetails} type="button">
              x
            </button>

            <h2>{selectedOffer.title}</h2>
            <div className="details-section">
              <h3>{t("myOffers.modal.offerInfoTitle")}</h3>

              <div className="detail-row">
                <strong>{t("myOffers.modal.titleLabel")}</strong>
                <span>
                  {selectedOffer.title || t("myOffers.modal.notProvided")}
                </span>
              </div>

              <div className="detail-row">
                <strong>{t("myOffers.modal.communeLabel")}</strong>
                <span>
                  {selectedOffer.commune || t("myOffers.modal.notProvidedFem")}
                </span>
              </div>

              <div className="detail-row detail-description">
                <strong>{t("myOffers.modal.descLabel")}</strong>
                <p>
                  {selectedOffer.description ||
                    t("myOffers.modal.noDescription")}
                </p>
              </div>

              <div className="detail-row">
                <strong>{t("myOffers.modal.viewsLabel")}</strong>
                <span>{selectedOffer.views ?? 0}</span>
              </div>
            </div>

            <div className="details-section">
              <h3>{t("myOffers.modal.companyInfoTitle")}</h3>

              {selectedOffer.employer.companyName && (
                <div className="detail-row">
                  <strong>{t("myOffers.modal.companyLabel")}</strong>
                  <span>{selectedOffer.employer.companyName}</span>
                </div>
              )}

              {selectedOffer.employer.email && (
                <div className="detail-row">
                  <strong>{t("myOffers.modal.emailLabel")}</strong>
                  <span>{selectedOffer.employer.email}</span>
                </div>
              )}

              {selectedOffer.employer.companyDesc && (
                <div className="detail-row">
                  <strong>{t("myOffers.modal.descLabel")}</strong>
                  <span>{selectedOffer.employer.companyDesc}</span>
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>
                {t("myOffers.applications.titleCount", {
                  count: applications.length,
                })}
              </h3>

              {applicationsLoading && (
                <p>{t("myOffers.applications.loading")}</p>
              )}

              {applicationsError && (
                <p className="error-message">{applicationsError}</p>
              )}

              {!applicationsLoading &&
                !applicationsError &&
                applications.length === 0 && (
                  <p>{t("myOffers.applications.empty")}</p>
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
                      <h4>
                        {seeker?.firstname || t("myOffers.candidate.defaultFirstname")}{" "}
                        {seeker?.lastname || t("myOffers.candidate.defaultLastname")}
                      </h4>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.email")}</strong>
                        <span>
                          {seeker?.email || t("myOffers.modal.notProvided")}
                        </span>
                      </div>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.skills")}</strong>
                        <span>
                          {profile?.skills?.length
                            ? profile.skills.join(", ")
                            : t("myOffers.modal.notProvidedPlur")}
                        </span>
                      </div>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.experience")}</strong>
                        <span>
                          {profile?.experience ||
                            t("myOffers.modal.notProvidedFem")}
                        </span>
                      </div>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.availability")}</strong>
                        <span>
                          {profile?.availability ||
                            t("myOffers.modal.notProvidedFem")}
                        </span>
                      </div>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.status")}</strong>
                        <span>
                          {application.status === "waiting" &&
                            t("myOffers.status.waiting")}
                          {application.status === "accepted" &&
                            t("myOffers.status.accepted")}
                          {application.status === "rejected" &&
                            t("myOffers.status.rejected")}
                        </span>
                      </div>

                      <div className="detail-row">
                        <strong>{t("myOffers.candidate.receivedAt")}</strong>
                        <span>
                          {new Date(application.createdAt).toLocaleDateString(
                            i18n.language
                          )}
                        </span>
                      </div>

                      <div className="candidate-actions">
                        <button
                          type="button"
                          className="candidate-accept-btn"
                          disabled={application.status === "accepted"}
                          onClick={() =>
                            updateApplicationStatus(application.id, "accepted")
                          }
                        >
                          {t("myOffers.actions.accept")}
                        </button>

                        <button
                          type="button"
                          className="candidate-reject-btn"
                          disabled={application.status === "rejected"}
                          onClick={() =>
                            updateApplicationStatus(application.id, "rejected")
                          }
                        >
                          {t("myOffers.actions.reject")}
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
                {t("myOffers.actions.close")}
              </button>
              <button
                type="button"
                className="modal-edit-btn"
                onClick={() => {
                  closeDetails();
                  handleEdit(selectedOffer);
                }}
              >
                {t("myOffers.actions.modify")}
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
            <button className="modal-close" onClick={closeEdit} type="button">
              x
            </button>
            <h2>{t("myOffers.editModal.title")}</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label htmlFor="title">{t("myOffers.editModal.titleLabel")}</label>
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
                <label htmlFor="commune">{t("myOffers.editModal.communeLabel")}</label>
                <input
                  id="commune"
                  type="text"
                  name="commune"
                  value={editingOffer.commune || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  {t("myOffers.editModal.descLabel")}
                </label>
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
                  {t("myOffers.actions.cancel")}
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? t("myOffers.editModal.saving")
                    : t("myOffers.actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}