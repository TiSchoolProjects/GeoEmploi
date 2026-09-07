import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import toast from "react-hot-toast";
import NavBar from "../components/Navbar";
import "../CSS/AdminPanel.css"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("reports")

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [jobsToVerify, setJobsToVerify] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState("")

  const [addressEdits, setAddressEdits] = useState({})
  const [savingJobId, setSavingJobId] = useState(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await apiFetch("/reports")

      setReports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setError("Impossible de charger les signalements.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const resolveReport = async (reportId) => {
    try {
      const updated = await apiFetch(`/reports/${reportId}/resolve`, {method: "PATCH"})

      setReports((cur) => cur.map((report) => report.id === reportId ? {
            ...report,
            status: updated.status,
            resolvedAt: updated.resolvedAt,
          } : report
        )
      )
      toast.success("Signalement résolu")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de résoudre le signalement.");
    }
  };

  const deleteReportedJob = async (jobId) => {
    if (!jobId) {
      return
    }

    const confirmed = window.confirm("Supprimer définitivement cette offre ?")

    if (!confirmed) return 

    try {
      await apiFetch(`/jobs/${jobId}`, {
        method: "DELETE",
      })

      setReports((cur) => cur.filter((report) => report.job?.id !== jobId))
      toast.success("Offre supprimée")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de supprimer l'offre.")
    }
  }

  const fetchJobsToVerify = async () => {
    try {
      setJobsLoading(true)
      setJobsError("")

      const data = await apiFetch("/jobs/to-verify")
      setJobsToVerify(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setJobsError("Impossible de charger les offres à vérifier.")
    } finally {
      setJobsLoading(false)
    }
  }

  const deleteJobToVerify = async (jobId) =>  {
    const confirmed = window.confirm("Supprimer définitivement cette offre ?")
    if (!confirmed) return

    try {
      await apiFetch(`/jobs/${jobId}`, {method: "DELETE"})

      setJobsToVerify((cur) => cur.filter((job) => job.id !== jobId))
      toast.success("Offre supprimée")
    } catch (error) {
      console.error(error)
      toast.error("Suppression impossible")
    }
  }

  const handleAddressChange = (jobId, value) => {
    setAddressEdits((current) => ({
      ...current,
      [jobId]: value,
    }))
  }

  const correctJobAddress = async (job) => {
    const newAddress = addressEdits[job.id]?.trim()

    if (!newAddress) {
      toast.error("Veuillez saisir une adresse.")
      return
    }

    try {
      setSavingJobId(job.id)

      const updated = await apiFetch(`/jobs/${job.id}`, {method: "PATCH",
          body: JSON.stringify({ adress: newAddress,}),})

      if (updated.GeocodingStatus === "valid") {
        setJobsToVerify((current) => current.filter((currentJob) => currentJob.id !== job.id))

        setAddressEdits((current) => {
          const next = { ...current }
          delete next[job.id]
          return next
        })

        toast.success("Adresse corrigée et offre regéocodée.")
        return
      }

      setJobsToVerify((current) => current.map((currentJob) => currentJob.id === job.id ? updated : currentJob))
      toast.error("L'adresse n'a pas pu être géocodée.")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de corriger l'adresse.")
    } finally {
      setSavingJobId(null)
    }
  }

  const pendingReports = reports.filter((report) => report.status === "pending");

  return (
        <>
          <NavBar />

          <main className="admin-page">
            <header className="admin-header">
              <h1>Administration</h1>
              <p>
                Gestion et modération de GéoEmploi
              </p>
            </header>

            <section className="admin-stats">
              <div className="admin-stat-card">
                <strong>
                  {pendingReports.length}
                </strong>
                <span>
                  Signalements en attente
                </span>
              </div>
            </section>

            <nav className="admin-tabs">
              <button
                type="button"
                className={
                  activeTab === "reports"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("reports")
                }
              >
                Signalements
              </button>

              <button
                type="button"
                className= {
                  activeTab === "jobs" ? "active" : ""
                }
                onClick={() => {
                  setActiveTab("jobs")
                  fetchJobsToVerify()
                }}
              >
                Offres à vérifier
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("users")
                }
              >
                Utilisateurs
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("employers")
                }
              >
                Employeurs
              </button>
            </nav>

            {activeTab === "reports" && (
              <section className="admin-section">
                <h2>Signalements</h2>

                {loading && (
                  <p>
                    Chargement...
                  </p>
                )}

                {error && (
                  <p className="error-message">
                    {error}
                  </p>
                )}

                {!loading &&
                  reports.length === 0 && (
                    <p>
                      Aucun signalement.
                    </p>
                  )}

                {reports.map((report) => (
                  <article
                    className="admin-report-card"
                    key={report.id}
                  >
                    <div>
                      <h3>
                        {report.job?.title ||
                          "Offre supprimée"}
                      </h3>

                      <p>
                        <strong>Motif :</strong>{" "}
                        {report.reason}
                      </p>

                      <p>
                        <strong>Description :</strong>{" "}
                        {report.description}
                      </p>

                      <p>
                        <strong>Signalé par :</strong>{" "}
                        {report.reporter
                          ? `${report.reporter.firstname} ${report.reporter.lastname}`
                          : "Utilisateur supprimé"}
                      </p>

                      <p>
                        <strong>Date :</strong>{" "}
                        {new Date(
                          report.createdAt
                        ).toLocaleString("fr-FR")}
                      </p>

                      <p>
                        <strong>Statut :</strong>{" "}
                        {report.status === "pending"
                          ? "En attente"
                          : "Résolu"}
                      </p>
                    </div>

                    <div className="admin-report-actions">
                      {report.status === "pending" && (
                        <button
                          type="button"
                          className="admin-resolve-btn"
                          onClick={() =>
                            resolveReport(report.id)
                          }
                        >
                          Résoudre
                        </button>
                      )}

                      {report.job && (
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() =>
                            deleteReportedJob(report.job.id)
                          }
                        >
                          Supprimer l'offre
                        </button>
                      )}
                    </div>

                  </article>
                ))}
              </section>
            )}

            {activeTab === "jobs" && (
              <section className="admin-section">
                <h2>
                  Offres à vérifier ({jobsToVerify.length})
                </h2>

                {jobsLoading && (
                  <p>Chargement...</p>
                )}

                {jobsError && (
                  <p className="error-message">
                    {jobsError}
                  </p>
                )}

                {!jobsLoading &&
                  !jobsError &&
                  jobsToVerify.length === 0 && (
                    <p>
                      Aucune offre à vérifier.
                    </p>
                  )}

                {!jobsLoading &&
                  !jobsError &&
                  jobsToVerify.map((job) => (
                    <article
                      key={job.id}
                      className="admin-job-card"
                    >
                      <div>
                        <h3>{job.title}</h3>

                        <p>
                          <strong>Adresse :</strong>{" "}
                          {job.adress || "Non renseignée"}
                        </p>

                        <p>
                          <strong>Description :</strong>{" "}
                          {job.description}
                        </p>

                        <p>
                          <strong>Statut géocodage :</strong>{" "}
                          {job.GeocodingStatus}
                        </p>

                        <p>
                          <strong>Latitude :</strong>{" "}
                          {job.lat ?? "absente"}
                        </p>

                        <p>
                          <strong>Longitude :</strong>{" "}
                          {job.lng ?? "absente"}
                        </p>
                      </div>
                      
                      <div className="admin-address-edit">
                        <label htmlFor={`address-${job.id}`}>
                          Corriger l'adresse
                        </label>

                        <input
                          id={`address-${job.id}`}
                          type="text"
                          value={
                            addressEdits[job.id] ??
                            job.adress ??
                            ""
                          }
                          onChange={(event) =>
                            handleAddressChange(
                              job.id,
                              event.target.value
                            )
                          }
                          placeholder="Nouvelle adresse"
                        />
                      </div>

                      <div className="admin-job-actions">
                      <button
                        type="button"
                        className="admin-correct-btn"
                        disabled={savingJobId === job.id}
                        onClick={() =>
                          correctJobAddress(job)
                        }
                      >
                        {savingJobId === job.id
                          ? "Vérification..."
                          : "Corriger et regéocoder"}
                      </button>

                      <button
                        type="button"
                        className="admin-delete-btn"
                        disabled={savingJobId === job.id}
                        onClick={() =>
                          deleteJobToVerify(job.id)
                        }
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                  ))}
              </section>
            )}

            {activeTab === "users" && (
              <section className="admin-section">
                <h2>Utilisateurs</h2>
              </section>
            )}

            {activeTab === "employers" && (
              <section className="admin-section">
                <h2>Employeurs</h2>
              </section>
            )}
          </main>
        </>
      )
    }
