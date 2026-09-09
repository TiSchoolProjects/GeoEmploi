import { useTranslation } from "react-i18next";

export default function GeoConsentNotice() {
  const { t } = useTranslation();

  return (
    <ul className="locationModalList">
      <li>
        <strong>{t("geoConsent.dataLabel")} :</strong> {t("geoConsent.dataDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.purposeLabel")} :</strong> {t("geoConsent.purposeDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.legalBasisLabel")} :</strong> {t("geoConsent.legalBasisDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.recipientsLabel")} :</strong> {t("geoConsent.recipientsDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.transferLabel")} :</strong> {t("geoConsent.transferDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.retentionLabel")} :</strong> {t("geoConsent.retentionDesc")}
      </li>
      <li>
        <strong>{t("geoConsent.rightsLabel")} :</strong> {t("geoConsent.rightsDesc")}
      </li>
    </ul>
  );
}