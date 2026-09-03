import { useEffect, useState } from "react";

export default function Application() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const seekerId = user?.sub;

        if (!seekerId) {
          throw new Error("Impossible de récupérer l'identifiant du chercheur.");
        }

        // 1. Récupération des applications
        const response = await fetch(`seekerpath`);

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des applications.");
        }

        const applicationsData = await response.json();

        // 2. Pour chaque application, récupérer le job puis l'employeur
        const enrichedApplications = await Promise.all(
          applicationsData.map(async (application) => {
            // Adapte le nom selon ton JSON
            const jobId = application.jobId;

            // Récupération du job 
            const jobResponse = await fetch(`/jobs/${jobId}`);

            if (!jobResponse.ok) {
              throw new Error(
                `Impossible de récupérer le job ${jobId}`
              );
            }

            const job = await jobResponse.json();

            // Récupération de l'employeur
            const employerId = job.employerId;

            const employerResponse = await fetch(
              `/employer/${employerId}`
            );

            if (!employerResponse.ok) {
              throw new Error(
                `Impossible de récupérer l'employeur ${employerId}`
              );
            }

            const employer = await employerResponse.json();

            // On regroupe tout
            return {
              ...application,
              job,
              employer,
            };
          })
        );

        console.log("Applications enrichies :", enrichedApplications);

        setApplications(enrichedApplications);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {applications.map((application) => (
        <div key={application.id}>
          <h2>{application.job.title}</h2>

          <p>
            Employeur : {application.employer.companyName}
          </p>

          <p>
            Statut : {application.status}
          </p>
        </div>
      ))}
    </div>
  );
}
