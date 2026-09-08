import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from './locales/fr.json'
import en from './locales/en.json'
import br from './locales/breton.json'
import oc from './locales/oc.json'
import nl from './locales/nl.json'
import eu from './locales/eu.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      br: {translation: br},
      oc: {translation: oc},
      nl: {translation: nl},
      eu: {translation: eu},
    },
    fallbackLng: "fr",
    detection: {
      order: ["navigator", "htmlTag"],
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;