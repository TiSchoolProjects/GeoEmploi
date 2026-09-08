import i18n from "../i18n"; // ajuste le chemin vers ton fichier d'initialisation i18n

const GEO_CONSENT_KEY = "geoConsent";

export function getGeoConsent() {
  try {
    const raw = localStorage.getItem(GEO_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setGeoConsent(status) {
  const value = { status, date: new Date().toISOString() };
  try {
    localStorage.setItem(GEO_CONSENT_KEY, JSON.stringify(value));
  } catch (error) {
    console.error(i18n.t("consent.saveError", "Impossible d'enregistrer le consentement :"), error);
  }
  return value;
}

export function clearGeoConsent() {
  localStorage.removeItem(GEO_CONSENT_KEY);
}