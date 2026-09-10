import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import NavBar from "../components/Navbar";
import "../CSS/AdminPanel.css";
import { useTranslation } from "react-i18next";

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("reports");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jobsToVerify, setJobsToVerify] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  const [addressEdits, setAddressEdits] = useState({});
  const [savingJobId, setSavingJobId] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [employers, setEmployers] = useState([]);
  const [employersLoading, setEmployersLoading] = useState(false);
  const [employersError, setEmployersError] = useState("");

  const [metrics, setMetrics] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentAdminId = currentUser?.sub;

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/reports");
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(t("admin.errors.fetchReports"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const resolveReport = async (reportId) => {
    try {
      const updated = await apiFetch(`/reports/${reportId}/resolve`, { method: "PATCH" });
      setReports((cur) =>
        cur.map((report) =>
          report.id === reportId ? { ...report, status: updated.status, resolvedAt: updated.resolvedAt } : report
        )
      );
      toast.success(t("admin.reports.resolveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.reports.resolveError"));
    }
  };

  const deleteReportedJob = async (jobId) => {
    if (!jobId) return;

    const result = await Swal.fire({
      title: t("admin.jobs.deleteConfirmTitle"),
      text: t("admin.jobs.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("admin.actions.delete"),
      cancelButtonText: t("admin.actions.cancel"),
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
      setReports((cur) => cur.filter((report) => report.job?.id !== jobId));
      toast.success(t("admin.jobs.deleteSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.jobs.deleteError"));
    }
  };

  const fetchJobsToVerify = async () => {
    try {
      setJobsLoading(true);
      setJobsError("");
      const data = await apiFetch("/jobs/to-verify");
      setJobsToVerify(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setJobsError(t("admin.errors.fetchJobs"));
    } finally {
      setJobsLoading(false);
    }
  };

  const deleteJobToVerify = async (jobId) => {
    const result = await Swal.fire({
      title: t("admin.jobs.deleteConfirmTitle"),
      text: t("admin.jobs.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("admin.actions.delete"),
      cancelButtonText: t("admin.actions.cancel"),
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/jobs/${jobId}`, { method: "DELETE" });
      setJobsToVerify((cur) => cur.filter((job) => job.id !== jobId));
      toast.success(t("admin.jobs.deleteSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.jobs.deleteError"));
    }
  };

  const handleAddressChange = (jobId, value) => {
    setAddressEdits((current) => ({ ...current, [jobId]: value }));
  };

  const correctJobAddress = async (job) => {
    const newAddress = addressEdits[job.id]?.trim();
    if (!newAddress) {
      toast.error(t("admin.jobs.enterCityPrompt"));
      return;
    }

    try {
      setSavingJobId(job.id);
      const updated = await apiFetch(`/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ commune: newAddress }),
      });

      if (updated.GeocodingStatus === "valid") {
        setJobsToVerify((current) => current.filter((currentJob) => currentJob.id !== job.id));
        setAddressEdits((current) => {
          const next = { ...current };
          delete next[job.id];
          return next;
        });
        toast.success(t("admin.jobs.addressCorrected"));
        return;
      }

      setJobsToVerify((current) =>
        current.map((currentJob) => (currentJob.id === job.id ? updated : currentJob))
      );
      toast.error(t("admin.jobs.geocodeFailed"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.jobs.correctError"));
    } finally {
      setSavingJobId(null);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const data = await apiFetch("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsersError(t("admin.errors.fetchUsers"));
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    if (userId === currentAdminId) {
      toast.error(t("admin.users.cannotSuspendSelf"));
      return;
    }

    try {
      const updated = await apiFetch(`/users/status/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, status: updated.status } : user))
      );
      setEmployers((current) =>
        current.map((employer) =>
          employer.userId === userId
            ? { ...employer, user: { ...employer.user, status: updated.status } }
            : employer
        )
      );

      toast.success(
        status === "suspended" ? t("admin.users.suspendedSuccess") : t("admin.users.reactivatedSuccess")
      );
    } catch (err) {
      console.error(err);
      toast.error(t("admin.users.statusError"));
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentAdminId) {
      toast.error(t("admin.users.cannotDeleteSelf"));
      return;
    }

    const result = await Swal.fire({
      title: t("admin.users.deleteConfirmTitle"),
      text: t("admin.users.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("admin.actions.delete"),
      cancelButtonText: t("admin.actions.cancel"),
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== userId));
      setEmployers((current) => current.filter((employer) => employer.userId !== userId));
      toast.success(t("admin.users.deletedSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.users.deleteError"));
    }
  };

  const fetchEmployers = async () => {
    try {
      setEmployersLoading(true);
      setEmployersError("");
      const data = await apiFetch("/employers");
      setEmployers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEmployersError(t("admin.errors.fetchEmployers"));
    } finally {
      setEmployersLoading(false);
    }
  };

  const verifyEmployer = async (userId) => {
    try {
      const updated = await apiFetch(`/employers/${userId}/verify`, { method: "PATCH" });
      setEmployers((current) =>
        current.map((employer) =>
          employer.userId === userId ? { ...employer, verifiedAt: updated.verifiedAt } : employer
        )
      );
      toast.success(t("admin.employers.verifySuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.employers.verifyError"));
    }
  };

  const unverifyEmployer = async (userId) => {
    try {
      const updated = await apiFetch(`/employers/${userId}/unverify`, { method: "PATCH" });
      setEmployers((current) =>
        current.map((employer) =>
          employer.userId === userId ? { ...employer, verifiedAt: updated.verifiedAt } : employer
        )
      );
      toast.success(t("admin.employers.unverifySuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("admin.employers.unverifyError"));
    }
  };

 const fetchMetrics = async () => {
    try {
      const data = await apiFetch("/admin/metrics");

      setMetrics(data);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les métriques.");
    }
  };
  useEffect(() => {
    if (activeTab === "metrics") {
      fetchMetrics();
    }
  }, [activeTab]);

  const pendingReports = reports.filter((report) => report.status === "pending");

  const createAdminAccount = async () => {
    const result = await Swal.fire({
      title: "Créer un administrateur",

      html: `
        <input
          id="new-admin-firstname"
          class="swal2-input"
          type="text"
          placeholder="Prénom"
        />

        <input
          id="new-admin-lastname"
          class="swal2-input"
          type="text"
          placeholder="Nom"
        />

        <input
          id="new-admin-email"
          class="swal2-input"
          type="email"
          placeholder="Email"
        />

        <input
          id="new-admin-password"
          class="swal2-input"
          type="password"
          placeholder="Mot de passe"
        />

        <input
          id="new-admin-password-confirm"
          class="swal2-input"
          type="password"
          placeholder="Confirmer le mot de passe"
        />
      `,

      showCancelButton: true,

      confirmButtonText:
        "Créer l'administrateur",

      cancelButtonText:
        "Annuler",

      reverseButtons: true,

      focusConfirm: false,

      preConfirm: () => {
        const popup = Swal.getPopup();

        const firstname =
          popup
            .querySelector(
              "#new-admin-firstname"
            )
            .value
            .trim();

        const lastname =
          popup
            .querySelector(
              "#new-admin-lastname"
            )
            .value
            .trim();

        const email =
          popup
            .querySelector(
              "#new-admin-email"
            )
            .value
            .trim();

        const password =
          popup
            .querySelector(
              "#new-admin-password"
            )
            .value;

        const passwordConfirm =
          popup
            .querySelector(
              "#new-admin-password-confirm"
            )
            .value;

        if (
          !firstname ||
          !lastname ||
          !email ||
          !password
        ) {
          Swal.showValidationMessage(
            "Tous les champs sont obligatoires."
          );

          return false;
        }

        const emailValid =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
          );

        if (!emailValid) {
          Swal.showValidationMessage(
            "Adresse email invalide."
          );

          return false;
        }

        if (password.length < 8) {
          Swal.showValidationMessage(
            "Le mot de passe doit contenir au moins 8 caractères."
          );

          return false;
        }

        if (
          password !==
          passwordConfirm
        ) {
          Swal.showValidationMessage(
            "Les mots de passe ne correspondent pas."
          );

          return false;
        }

        return {
          firstname,
          lastname,
          email,
          password,
        };
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await apiFetch(
        "/users/admin",
        {
          method: "POST",

          body: JSON.stringify(
            result.value
          ),
        }
      );

      toast.success(
        "Compte administrateur créé."
      );

      await fetchUsers();
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Impossible de créer l'administrateur."
      );
    }
  };

  return (
    <>
      <NavBar />
      <main className="admin-page">
        <header className="admin-header">
          <h1>{t("admin.title")}</h1>
          <p>{t("admin.subtitle")}</p>
        </header>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <strong>{pendingReports.length}</strong>
            <span>{t("admin.pendingReportsStat")}</span>
          </div>
        </section>

        <nav className="admin-tabs">
          <button
            type="button"
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            {t("admin.tabs.reports")}
          </button>
          <button
            type="button"
            className={activeTab === "jobs" ? "active" : ""}
            onClick={() => {
              setActiveTab("jobs");
              fetchJobsToVerify();
            }}
          >
            {t("admin.tabs.jobs")}
          </button>
          <button
            type="button"
            className={activeTab === "users" ? "active" : ""}
            onClick={() => {
              setActiveTab("users");
              fetchUsers();
            }}
          >
            {t("admin.tabs.users")}
          </button>
          <button
            type="button"
            className={activeTab === "employers" ? "active" : ""}
            onClick={() => {
              setActiveTab("employers");
              fetchEmployers();
            }}
          >
            {t("admin.tabs.employers")}
          </button>
          <button
            className={activeTab === "metrics" ? "active" : ""}
            onClick={() => {
              setActiveTab("metrics")
            }}
          >
            Métriques
          </button>
        </nav>

        {activeTab === "reports" && (
          <section className="admin-section">
            <h2>{t("admin.tabs.reports")}</h2>
            {loading && <p>{t("admin.loading")}</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && reports.length === 0 && <p>{t("admin.reports.empty")}</p>}

            {reports.map((report) => (
              <article className="admin-report-card" key={report.id}>
                <div>
                  <h3>{report.job?.title || t("admin.reports.deletedJob")}</h3>
                  <p><strong>{t("admin.reports.reason")} :</strong> {report.reason}</p>
                  <p><strong>{t("admin.reports.description")} :</strong> {report.description}</p>
                  <p>
                    <strong>{t("admin.reports.reportedBy")} :</strong>{" "}
                    {report.reporter
                      ? `${report.reporter.firstname} ${report.reporter.lastname}`
                      : t("admin.reports.deletedUser")}
                  </p>
                  <p>
                    <strong>{t("admin.reports.date")} :</strong>{" "}
                    {new Date(report.createdAt).toLocaleString(i18n.language)}
                  </p>
                  <p>
                    <strong>{t("admin.reports.status")} :</strong>{" "}
                    {report.status === "pending" ? t("admin.reports.pending") : t("admin.reports.resolved")}
                  </p>
                </div>

                <div className="admin-report-actions">
                  {report.status === "pending" && (
                    <button
                      type="button"
                      className="admin-resolve-btn"
                      onClick={() => resolveReport(report.id)}
                    >
                      {t("admin.actions.resolve")}
                    </button>
                  )}
                  {report.job && (
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => deleteReportedJob(report.job.id)}
                    >
                      {t("admin.actions.deleteOffer")}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {activeTab === "jobs" && (
          <section className="admin-section">
            <h2>{t("admin.jobs.toVerifyCount", { count: jobsToVerify.length })}</h2>
            {jobsLoading && <p>{t("admin.loading")}</p>}
            {jobsError && <p className="error-message">{jobsError}</p>}
            {!jobsLoading && !jobsError && jobsToVerify.length === 0 && (
              <p>{t("admin.jobs.noneToVerify")}</p>
            )}

            {!jobsLoading &&
              !jobsError &&
              jobsToVerify.map((job) => (
                <article key={job.id} className="admin-job-card">
                  <div>
                    <h3>{job.title}</h3>
                    <p><strong>{t("admin.jobs.commune")} :</strong> {job.commune || t("admin.notProvidedFem")}</p>
                    <p><strong>{t("admin.jobs.description")} :</strong> {job.description}</p>
                    <p><strong>{t("admin.jobs.geocodeStatus")} :</strong> {job.GeocodingStatus}</p>
                  </div>

                  <div className="admin-address-edit">
                    <label htmlFor={`address-${job.id}`}>{t("admin.jobs.correctAddressLabel")}</label>
                    <input
                      id={`address-${job.id}`}
                      type="text"
                      value={addressEdits[job.id] ?? job.commune ?? ""}
                      onChange={(event) => handleAddressChange(job.id, event.target.value)}
                      placeholder={t("admin.jobs.newAddressPlaceholder")}
                    />
                  </div>

                  <div className="admin-job-actions">
                    <button
                      type="button"
                      className="admin-correct-btn"
                      disabled={savingJobId === job.id}
                      onClick={() => correctJobAddress(job)}
                    >
                      {savingJobId === job.id ? t("admin.jobs.checking") : t("admin.jobs.correctAndGeocode")}
                    </button>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      disabled={savingJobId === job.id}
                      onClick={() => deleteJobToVerify(job.id)}
                    >
                      {t("admin.actions.delete")}
                    </button>
                  </div>
                </article>
              ))}
          </section>
        )}

        {activeTab === "users" && (
          <section className="admin-section">
              <h2>{t("admin.users.count", {count: users.length,})}</h2>
          <button
            type="button"
            className="admin-create-admin-btn"
            onClick={createAdminAccount}
          >
            + Créer un administrateur
          </button>
          {usersLoading && <p>{t("admin.loading")}</p>}
            {usersError && <p className="error-message">{usersError}</p>}
            {!usersLoading && !usersError && users.length === 0 && <p>{t("admin.users.none")}</p>}

            {!usersLoading &&
              !usersError &&
              users.map((user) => (
                <article className="admin-user-card" key={user.id}>
                  <div>
                    <h3>
                      {user.firstname} {user.lastname}
                      {user.id === currentAdminId && <span className="admin-you-badge">{t("admin.youBadge")}</span>}
                    </h3>
                    <p><strong>{t("admin.users.email")} :</strong> {user.email}</p>
                    <p><strong>{t("admin.users.role")} :</strong> {user.role}</p>
                    <p>
                      <strong>{t("admin.users.status")} :</strong>{" "}
                      <span className={user.status === "active" ? "status-badge status-active" : "status-badge status-suspended"}>
                        {user.status === "active" ? t("admin.status.active") : t("admin.status.suspended")}
                      </span>
                    </p>
                    <p>
                      <strong>{t("admin.users.createdAt")} :</strong>{" "}
                      {new Date(user.createdAt).toLocaleDateString(i18n.language)}
                    </p>
                  </div>

                  {user.id !== currentAdminId && (
                    <div className="admin-user-actions">
                      {user.status === "active" ? (
                        <button type="button" className="admin-suspend-btn" onClick={() => updateUserStatus(user.id, "suspended")}>
                          {t("admin.actions.suspend")}
                        </button>
                      ) : (
                        <button type="button" className="admin-reactivate-btn" onClick={() => updateUserStatus(user.id, "active")}>
                          {t("admin.actions.reactivate")}
                        </button>
                      )}
                      <button type="button" className="admin-delete-btn" onClick={() => deleteUser(user.id)}>
                        {t("admin.actions.delete")}
                      </button>
                    </div>
                  )}
                </article>
              ))}
          </section>
        )}

        {activeTab === "employers" && (
          <section className="admin-section">
            <h2>{t("admin.employers.count", { count: employers.length })}</h2>
            {employersLoading && <p>{t("admin.loading")}</p>}
            {employersError && <p className="error-message">{employersError}</p>}
            {!employersLoading && !employersError && employers.length === 0 && <p>{t("admin.employers.none")}</p>}

            {!employersLoading &&
              !employersError &&
              employers.map((employer) => (
                <article className="admin-employer-card" key={employer.userId}>
                  <div>
                    <h3>{employer.companyName}</h3>
                    <p>
                      <strong>{t("admin.employers.manager")} :</strong>{" "}
                      {employer.user ? `${employer.user.firstname} ${employer.user.lastname}` : t("admin.notProvided")}
                    </p>
                    <p><strong>{t("admin.employers.email")} :</strong> {employer.user?.email || t("admin.notProvided")}</p>
                    <p><strong>{t("admin.employers.description")} :</strong> {employer.companyDesc || t("admin.notProvidedFem")}</p>
                    <p>
                      <strong>{t("admin.employers.accountStatus")} :</strong>{" "}
                      <span className={employer.user?.status === "active" ? "status-badge status-active" : "status-badge status-suspended"}>
                        {employer.user?.status === "active" ? t("admin.status.active") : t("admin.status.suspended")}
                      </span>
                    </p>
                    <p>
                      <strong>{t("admin.employers.verification")} :</strong>{" "}
                      {employer.verifiedAt ? (
                        <span className="status-badge status-verified">{t("admin.status.verified")}</span>
                      ) : (
                        <span className="status-badge status-pending">{t("admin.status.toVerify")}</span>
                      )}
                    </p>
                    {employer.verifiedAt && (
                      <p>
                        <strong>{t("admin.employers.verifiedAt")} :</strong>{" "}
                        {new Date(employer.verifiedAt).toLocaleDateString(i18n.language)}
                      </p>
                    )}
                  </div>

                  <div className="admin-employer-actions">
                    {employer.verifiedAt ? (
                      <button type="button" className="admin-unverify-btn" onClick={() => unverifyEmployer(employer.userId)}>
                        {t("admin.actions.removeVerification")}
                      </button>
                    ) : (
                      <button type="button" className="admin-verify-btn" onClick={() => verifyEmployer(employer.userId)}>
                        {t("admin.actions.verifyCompany")}
                      </button>
                    )}

                    {employer.user?.status === "active" ? (
                      <button type="button" className="admin-suspend-btn" onClick={() => updateUserStatus(employer.userId, "suspended")}>
                        {t("admin.actions.suspend")}
                      </button>
                    ) : (
                      <button type="button" className="admin-reactivate-btn" onClick={() => updateUserStatus(employer.userId, "active")}>
                        {t("admin.actions.reactivate")}
                      </button>
                    )}

                    <button type="button" className="admin-delete-btn" onClick={() => deleteUser(employer.userId)}>
                      {t("admin.actions.deleteAccount")}
                    </button>
                  </div>
                </article>
              ))}
          </section>
        )}

      {activeTab === "metrics" && metrics && (
        <div className="admin-metrics">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Offres publiées</h3>
              <p>{metrics.jobs}</p>
            </div>

            <div className="stat-card">
              <h3>Candidatures</h3>
              <p>{metrics.applications}</p>
            </div>

            <div className="stat-card">
              <h3>Employeurs</h3>
              <p>{metrics.employers}</p>
            </div>
          </div>

          <div className="metrics-table">
            <h3>Répartition géographique des offres</h3>

            <table>
              <thead>
                <tr>
                  <th>Commune</th>
                  <th>Nombre d'offres</th>
                </tr>
              </thead>

              <tbody>
                {metrics.jobsByCommune.map((item) => (
                  <tr key={item.commune}>
                    <td>{item.commune}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
