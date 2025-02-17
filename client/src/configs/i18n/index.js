// ** I18n Imports
import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const lag = window.localStorage.getItem('i18nextLng') || 'vi' // Mặc định là 'vi' nếu không có dữ liệu trong localStorage

i18n
  // Enables the i18next backend
  .use(Backend)

  // Enable automatic language detection
  .use(LanguageDetector)

  // Enables the hook initialization module
  .use(initReactI18next)
  .init({
    lng: lag,
    backend: {
      /* translation file paths */
      loadPath: `/locales/{{lng}}.json`, 
    },
    fallbackLng: 'vi',
    debug: false,
    keySeparator: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    supportedLngs: ['vi', 'en'],
  })

export default i18n
