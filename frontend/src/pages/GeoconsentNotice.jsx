export default function GeoConsentNotice() {
  return (
    <ul className="locationModalList">
      <li>
        <strong>Données concernées :</strong> coordonnées GPS brutes (latitude, longitude).
      </li>
      <li>
        <strong>Finalité :</strong> filtrer les offres d'emploi selon la distance
        géographique de l'utilisateur.
      </li>
      <li>
        <strong>Base légale :</strong> votre consentement, exprimé via l'autorisation
        demandée par le navigateur.
      </li>
      <li>
        <strong>Destinataires :</strong> équipe technique et produit de GéoEmploi (logs
        techniques) ; IGN pour les tuiles cartographiques et le géocodage (API Adresse /
        Géoplateforme).
      </li>
      <li>
        <strong>Transfert hors UE :</strong> aucun ; données hébergées en France.
      </li>
      <li>
        <strong>Durée de conservation :</strong> donnée volatile, utilisée uniquement le
        temps de la requête, sans stockage en base de données.
      </li>
      <li>
        <strong>Vos droits :</strong> accès, effacement, limitation, et retrait du
        consentement à tout moment, y compris depuis votre page de profil.
      </li>
    </ul>
  );
}