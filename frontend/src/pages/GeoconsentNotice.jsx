import { useTranslation } from "react-i18next";

export default function GeoConsentNotice() {
  const { t } = useTranslation();

  return (
    <ul className="locationModalList">
      <li>
        <strong>{t("geoConsentNotice.dataLabel")}</strong> {t("geoConsentNotice.dataValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.purposeLabel")}</strong> {t("geoConsentNotice.purposeValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.legalBasisLabel")}</strong> {t("geoConsentNotice.legalBasisValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.recipientsLabel")}</strong> {t("geoConsentNotice.recipientsValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.transferLabel")}</strong> {t("geoConsentNotice.transferValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.retentionLabel")}</strong> {t("geoConsentNotice.retentionValue")}
      </li>
      <li>
        <strong>{t("geoConsentNotice.rightsLabel")}</strong> {t("geoConsentNotice.rightsValue")}
      </li>
    </ul>
  );
}