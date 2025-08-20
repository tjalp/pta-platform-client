/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_HOST,
  ENDPOINTS: {
    USER_ME: '/api/user/me',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    USER_PASSWORD: (userId) => `/api/user/${userId}/password`,
    DEFAULTS: (defaultString) => `/api/defaults/${defaultString}`
  },
  TIMEOUT: 10000 // 10 seconds
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Netwerkfout. Controleer uw internetverbinding.',
  UNAUTHORIZED: 'Inloggegevens zijn onjuist of verlopen.',
  FORBIDDEN: 'U heeft geen toegang tot deze resource.',
  SERVER_ERROR: 'Er is een serverprobleem. Probeer het later opnieuw.',
  UNKNOWN_ERROR: 'Er is een onbekende fout opgetreden.',
  VALIDATION_REQUIRED: 'Dit veld is verplicht.',
  LOGIN_FAILED: 'Fout bij het aanmelden. Controleer je gegevens.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Succesvol ingelogd',
  LOGIN_WELCOME: 'Welkom terug!',
  LOGOUT_SUCCESS: 'Succesvol uitgelogd',
  SAVE_SUCCESS: 'Gegevens succesvol opgeslagen',
  CREATE_SUCCESS: 'Item succesvol aangemaakt',
  UPDATE_SUCCESS: 'Wijzigingen succesvol opgeslagen',
  DELETE_SUCCESS: 'Item succesvol verwijderd'
}

// Form Validation Messages (Dutch)
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Dit veld is verplicht.',
  EMAIL_INVALID: 'Voer een geldig e-mailadres in.',
  PASSWORD_TOO_SHORT: 'Wachtwoord moet minimaal 8 karakters bevatten.',
  PASSWORDS_NOT_MATCH: 'Wachtwoorden komen niet overeen.',
  ABBREVIATION_REQUIRED: 'Afkorting is verplicht.',
  PASSWORD_REQUIRED: 'Wachtwoord is verplicht.',
  NAME_REQUIRED: 'Naam is verplicht.',
  SUBJECT_NAME_REQUIRED: 'Vak is verplicht.',
  SUBJECT_YEAR_REQUIRED: 'Jaarlaag is verplicht.',
  SUBJECT_LEVEL_REQUIRED: 'Niveau is verplicht.',
  SUBJECT_RESPONSIBLE_REQUIRED: 'Verantwoordelijke is verplicht.',
  USER_ABBREVIATION_REQUIRED: 'Afkorting is verplicht.',
  USER_PASSWORD_REQUIRED: 'Wachtwoord is verplicht.',
  USER_ROLE_REQUIRED: 'Rol is verplicht.',
  TOOL_NAME_REQUIRED: 'Hulpmiddel is verplicht.'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'pta-platform-theme',
  USER_PREFERENCES: 'pta-platform-user-preferences',
  FORM_DRAFTS: 'pta-platform-form-drafts'
}

// Theme Configuration
export const THEME_CONFIG = {
  DARK_CLASS: 'p-dark',
  STORAGE_KEY: STORAGE_KEYS.THEME,
  VALUES: {
    LIGHT: 'light',
    DARK: 'dark'
  }
}

// Toast Configuration
export const TOAST_CONFIG = {
  DEFAULT_LIFE: 3000,
  ERROR_LIFE: 5000,
  SUCCESS_LIFE: 3000,
  WARNING_LIFE: 4000
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
}

// Component Size Constants
export const COMPONENT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}