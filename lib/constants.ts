// Constantes de la aplicación SE-Porfiria

export const APP_CONFIG = {
  name: 'SE-Porfiria',
  description: 'Sistema Experto para diagnóstico temprano de Porfiria',
  version: '1.0.0',
  author: 'Centro de Investigación de Porfiria y Porfirina (CIPYP)',
  url: 'https://se-porfiria.cipyp.org'
} as const

export const USER_ROLES = {
  MEDICO: 'MEDICO',
  CIPYP: 'CIPYP',
  ADMIN: 'ADMIN'
} as const

export const QUESTION_TYPES = {
  YES_NO: 'YES_NO',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  SCALE: 'SCALE'
} as const

export const TEST_RECOMMENDATIONS = {
  PBG_URINE_TEST: 'PBG_URINE_TEST',
  NO_TEST_NEEDED: 'NO_TEST_NEEDED',
  FOLLOW_UP_REQUIRED: 'FOLLOW_UP_REQUIRED'
} as const

export const QUESTION_CATEGORIES = {
  SINTOMAS_GENERALES: 'sintomas_generales',
  SINTOMAS_NEUROLOGICOS: 'sintomas_neurologicos',
  SINTOMAS_CUTANEOS: 'sintomas_cutaneos',
  SINTOMAS_PSIQUIATRICOS: 'sintomas_psiquiatricos',
  ANTECEDENTES: 'antecedentes'
} as const

export const QUESTIONNAIRE_WEIGHTS = {
  CRITICAL_SYMPTOMS: {
    ABDOMINAL_PAIN: 3,
    MUSCLE_WEAKNESS: 2,
    FAMILY_HISTORY: 3
  },
  MODERATE_SYMPTOMS: {
    SKIN_LESIONS: 2,
    PSYCHIATRIC_SYMPTOMS: 2,
    MEDICATION_TRIGGER: 2
  },
  MINOR_SYMPTOMS: {
    NAUSEA_VOMITING: 1,
    CONSTIPATION: 1,
    ALCOHOL_CONSUMPTION: 1,
    FASTING: 1
  }
} as const

export const RECOMMENDATION_THRESHOLDS = {
  HIGH_RISK: 8,        // Test PBG recomendado
  MEDIUM_RISK: 5,      // Seguimiento requerido
  LOW_RISK: 0          // Sin test necesario
} as const

export const CRITICAL_SYMPTOMS = [
  'ABDOMINAL_PAIN',
  'MUSCLE_WEAKNESS', 
  'FAMILY_HISTORY'
] as const

export const PWA_CONFIG = {
  name: 'SE-Porfiria',
  short_name: 'SE-Porfiria',
  description: 'Sistema Experto para diagnóstico temprano de Porfiria',
  theme_color: '#0ea5e9',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  start_url: '/',
  scope: '/',
  categories: ['medical', 'health', 'productivity']
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: '/api/users/[id]',
    DELETE: '/api/users/[id]'
  },
  PATIENTS: {
    LIST: '/api/patients',
    CREATE: '/api/patients',
    UPDATE: '/api/patients/[id]',
    DELETE: '/api/patients/[id]',
    GET: '/api/patients/[id]'
  },
  QUESTIONNAIRES: {
    LIST: '/api/questionnaires',
    CREATE: '/api/questionnaires',
    UPDATE: '/api/questionnaires/[id]',
    DELETE: '/api/questionnaires/[id]',
    GET: '/api/questionnaires/[id]'
  },
  QUESTIONS: {
    LIST: '/api/questions',
    CREATE: '/api/questions',
    UPDATE: '/api/questions/[id]',
    DELETE: '/api/questions/[id]'
  }
} as const

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false
  },
  DNI: {
    LENGTH: 8,
    PATTERN: /^\d{8}$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-\(\)]+$/
  }
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
} as const

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  PATIENTS_LIST: 'patients_list',
  QUESTIONNAIRES_LIST: 'questionnaires_list',
  QUESTIONS_LIST: 'questions_list',
  STATS: 'dashboard_stats'
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor. Inténtalo más tarde.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  USER_NOT_FOUND: 'Usuario no encontrado.',
  PATIENT_NOT_FOUND: 'Paciente no encontrado.',
  QUESTIONNAIRE_NOT_FOUND: 'Cuestionario no encontrado.'
} as const

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
  REGISTER_SUCCESS: 'Registro exitoso.',
  PATIENT_CREATED: 'Paciente creado exitosamente.',
  PATIENT_UPDATED: 'Paciente actualizado exitosamente.',
  QUESTIONNAIRE_CREATED: 'Cuestionario creado exitosamente.',
  QUESTIONNAIRE_COMPLETED: 'Cuestionario completado exitosamente.',
  DATA_SAVED: 'Datos guardados exitosamente.',
  DATA_DELETED: 'Datos eliminados exitosamente.'
} as const
