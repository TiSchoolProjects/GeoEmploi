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

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState("")

  const [employers, setEmployers] = useState([])
  const [employersLoading, setEmployersLoading] = useState(false)
  const [employersError, setEmployersError] = useState("")

  const currentUser =
    JSON.parse(localStorage.getItem("user") || "null")

  const currentAdminId = currentUser?.sub

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
      toast.error("Veuillez saisir une commune.")
      return
    }

    try {
      setSavingJobId(job.id)

      const updated = await apiFetch(`/jobs/${job.id}`, {method: "PATCH",
          body: JSON.stringify({ commune: newAddress,}),})

      if (updated.GeocodingStatus === "valid") {
        setJobsToVerify((current) => current.filter((currentJob) => currentJob.id !== job.id))

        setAddressEdits((current) => {
          const next = { ...current }
          delete next[job.id]
          return next
        })

        toast.success("Commune corrigée et offre regéocodée.")
        return
      }

      setJobsToVerify((current) => current.map((currentJob) => currentJob.id === job.id ? updated : currentJob))
      toast.error("La commune n'a pas pu être géocodée.")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de corriger la commune.")
    } finally {
      setSavingJobId(null)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      setUsersError("")

      const data = await apiFetch("/users")

      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)

      setUsersError("Impossible de charger les utilisateurs.")
    } finally {
      setUsersLoading(false)
    }
  }

  const updateUserStatus = async (userId, status) => {
    if (userId === currentAdminId) {
      toast.error("Vous ne pouvez pas suspendre votre propre compte.")
      return
    }

    try {
      const updated = await apiFetch(`/users/status/${userId}`,{ method: "PATCH",
          body: JSON.stringify({status,}),
        }
      )

      setUsers((current) => current.map((user) => user.id === userId ? {
        ...user, status: updated.status,}: user))

      toast.success( status === "suspended" ? "Utilisateur suspendu" : "Utilisateur réactivé")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de modifier le statut.")
    }
  }

  const deleteUser = async (userId) => {
    if (userId === currentAdminId) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.")
      return
    }

    const confirmed = window.confirm("Supprimer définitivement cet utilisateur ?")

    if (!confirmed) {
      return
    }

    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE",})

      setUsers((current) => current.filter((user) => user.id !== userId))

      setEmployers((current) => current.filter((employer) => employer.userId !== userId))

      toast.success("Utilisateur supprimé")
    } catch (error) {
      console.error(error)
      toast.error("Impossible de supprimer l'utilisateur.")
    }
  }

  const fetchEmployers = async () => {
    try {
      setEmployersLoading(true)
      setEmployersError("")

      const data =
        await apiFetch("/employers")

      setEmployers(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(error)

      setEmployersError(
        "Impossible de charger les employeurs."
      )
    } finally {
      setEmployersLoading(false)
    }
  }

  const verifyEmployer = async (userId) => {
    try {
      const updated = await apiFetch(
        `/employers/${userId}/verify`,
        {
          method: "PATCH",
        }
      )

      setEmployers((current) =>
        current.map((employer) =>
          employer.userId === userId
            ? {
                ...employer,
                user: employer.user
                  ? {
                      ...employer.user,
                      status: updated.status,
                    }
                  : employer.user,
              }
            : employer
        )
      )
      toast.success("Employeur vérifié")
    } catch (error) {
      console.error(error)

      toast.error(
        "Impossible de vérifier l'employeur."
      )
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
                className={
                  activeTab === "users" ? "active" : ""}
                onClick={() => {
                  setActiveTab("users")
                  fetchUsers()
                }}
              >
                Utilisateurs
              </button>
              <button
                type="button"
                className={
                  activeTab === "employers"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab("employers")
                  fetchEmployers()
                }}
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
                          <strong>Commune :</strong>{" "}
                          {job.commune || "Non renseignée"}
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
                          Corriger la commune
                        </label>

                        <input
                          id={`address-${job.id}`}
                          type="text"
                          value={
                            addressEdits[job.id] ??
                            job.commune ??
                            ""
                          }
                          onChange={(event) =>
                            handleAddressChange(
                              job.id,
                              event.target.value
                            )
                          }
                          placeholder="Nouvelle commune"
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
                <h2>
                  Utilisateurs ({users.length})
                </h2>

                {usersLoading && (
                  <p>Chargement...</p>
                )}

                {usersError && (
                  <p className="error-message">
                    {usersError}
                  </p>
                )}

                {!usersLoading &&
                  !usersError &&
                  users.length === 0 && (
                    <p>Aucun utilisateur.</p>
                  )}

                {!usersLoading &&
                  !usersError &&
                  users.map((user) => (
                    <article
                      className="admin-user-card"
                      key={user.id}
                    >
                      <div>
                        <h3>
                          {user.firstname}{" "}
                          {user.lastname}

                          {user.id === currentAdminId && (
                            <span className="admin-you-badge">
                              Vous
                            </span>
                          )}
                        </h3>

                        <p>
                          <strong>Email :</strong>{" "}
                          {user.email}
                        </p>

                        <p>
                          <strong>Rôle :</strong>{" "}
                          {user.role}
                        </p>

                        <p>
                          <strong>Statut :</strong>{" "}

                          <span
                            className={
                              user.status === "active"
                                ? "status-badge status-active"
                                : "status-badge status-suspended"
                            }
                          >
                            {user.status === "active"
                              ? "Actif"
                              : "Suspendu"}
                          </span>
                        </p>

                        <p>
                          <strong>Créé le :</strong>{" "}
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>

                      {user.id !== currentAdminId && (
                        <div className="admin-user-actions">
                          {user.status === "active" ? (
                            <button
                              type="button"
                              className="admin-suspend-btn"
                              onClick={() =>
                                updateUserStatus(
                                  user.id,
                                  "suspended"
                                )
                              }
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-reactivate-btn"
                              onClick={() =>
                                updateUserStatus(
                                  user.id,
                                  "active"
                                )
                              }
                            >
                              Réactiver
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-delete-btn"
                            onClick={() =>
                              deleteUser(user.id)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
              </section>
            )}

                      {activeTab === "employers" && (
            <section className="admin-section">
              <h2>
                Employeurs ({employers.length})
              </h2>

              {employersLoading && (
                <p>Chargement...</p>
              )}

              {employersError && (
                <p className="error-message">
                  {employersError}
                </p>
              )}

              {!employersLoading &&
                !employersError &&
                employers.length === 0 && (
                  <p>Aucun employeur.</p>
                )}

              {!employersLoading &&
                !employersError &&
                employers.map((employer) => (
                  <article
                    className="admin-employer-card"
                    key={employer.userId}
                  >
                    <div>
                      <h3>
                        {employer.companyName}
                      </h3>

                      <p>
                        <strong>Responsable :</strong>{" "}
                        {employer.user
                          ? `${employer.user.firstname} ${employer.user.lastname}`
                          : "Non renseigné"}
                      </p>

                      <p>
                        <strong>Email :</strong>{" "}
                        {employer.user?.email ||
                          "Non renseigné"}
                      </p>

                      <p>
                        <strong>Description :</strong>{" "}
                        {employer.companyDesc ||
                          "Non renseignée"}
                      </p>

                      <p>
                        <strong>Compte :</strong>{" "}

                        <span
                          className={
                            employer.user?.status === "active"
                              ? "status-badge status-active"
                              : "status-badge status-suspended"
                          }
                        >
                          {employer.user?.status === "active"
                            ? "Actif"
                            : "Suspendu"}
                        </span>
                      </p>

                      <p>
                        <strong>Vérification :</strong>{" "}

                        {employer.verifiedAt ? (
                          <span className="status-badge status-verified">
                            Vérifié
                          </span>
                        ) : (
                          <span className="status-badge status-pending">
                            À vérifier
                          </span>
                        )}
                      </p>

                      {employer.verifiedAt && (
                        <p>
                          <strong>Vérifié le :</strong>{" "}
                          {new Date(
                            employer.verifiedAt
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>

                    <div className="admin-employer-actions">
                      {!employer.verifiedAt && (
                        <button
                          type="button"
                          className="admin-verify-btn"
                          onClick={() =>
                            verifyEmployer(
                              employer.userId
                            )
                          }
                        >
                          Vérifier
                        </button>
                      )}

                      {employer.user?.status === "active" ? (
                        <button
                          type="button"
                          className="admin-suspend-btn"
                          onClick={() =>
                            updateUserStatus(
                              employer.userId,
                              "suspended"
                            )
                          }
                        >
                          Suspendre
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-reactivate-btn"
                          onClick={() =>
                            updateUserStatus(
                              employer.userId,
                              "active"
                            )
                          }
                        >
                          Réactiver
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() =>
                          deleteUser(
                            employer.userId
                          )
                        }
                      >
                        Supprimer le compte
                      </button>
                    </div>
                  </article>
                ))}
            </section>
          )}
          </main>
        </>
      )
    }
