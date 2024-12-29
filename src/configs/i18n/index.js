// ** I18n Imports
import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const lag = window.localStorage.getItem('i18nextLng')
i18n

  // Enables the i18next backend
  .use(Backend)

  // Enable automatic language detection
  .use(LanguageDetector)

  // Enables the hook initialization module
  .use(initReactI18next)
  .init({
    lng: lag ? lag : 'vi',
    backend: {
      /* translation file path */
      loadPath: `public/locales/vi/translation.json`
    },
    fallbackLng: lag ? lag : 'vi',
    debug: false,
    keySeparator: false,
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    }
  })

export default i18n
