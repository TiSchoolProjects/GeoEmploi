import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import "../../CSS/DailyChallenge.css";

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    try {
      setLoading(true);

      const data = await apiFetch(
        "/challenges/today"
      );

      if (!data?.challenge) {
        setChallenge(null);
        return;
      }

      setChallenge(data.challenge);
    } catch (error) {
      console.error(
        "Erreur chargement défi du jour :",
        error
      );

      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenge();

    const handleProgressUpdate = () => {
      loadChallenge();
    };

    window.addEventListener(
      "challenge-progress-updated",
      handleProgressUpdate
    );

    return () => {
      window.removeEventListener(
        "challenge-progress-updated",
        handleProgressUpdate
      );
    };
  }, [loadChallenge]);

  if (loading) {
    return null;
  }

  if (!challenge) {
    return null;
  }

  const progress =
    Number(challenge.progress) || 0;

  const target =
    Number(challenge.target) || 1;

  const currentProgress =
    Math.min(progress, target);

  const completed =
    Boolean(challenge.completed) ||
    currentProgress >= target;

  const percentage = Math.min(
    100,
    Math.round(
      (currentProgress / target) * 100
    )
  );

  return (
    <section className="daily-challenge-card">
      <div className="daily-challenge-header">
        <div>
          <span className="daily-challenge-label">
            Défi du Jour
          </span>

          <h2>
            {challenge.title}
          </h2>

          {challenge.description && (
            <p className="daily-challenge-description">
              {challenge.description}
            </p>
          )}
        </div>

        {completed && (
          <span className="daily-challenge-completed">
            Terminé ✓
          </span>
        )}
      </div>

      <div className="daily-challenge-progress-info">
        <span>
          Progression
        </span>

        <strong>
          {currentProgress} / {target}
        </strong>
      </div>

      <div
        className="daily-challenge-progress"
        role="progressbar"
        aria-label="Progression du défi du jour"
        aria-valuemin="0"
        aria-valuemax={target}
        aria-valuenow={currentProgress}
      >
        <div
          className="daily-challenge-progress-bar"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {completed && (
        <p className="daily-challenge-success">
          Défi terminé pour aujourd'hui.
        </p>
      )}
    </section>
  );
}
