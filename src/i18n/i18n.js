import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import bn from "./bn.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn }
    },
    lng: "bn", // ডিফল্ট ভাষা বাংলা
    fallbackLng: "bn",
    interpolation: { escapeValue: false }
  });

export default i18n;