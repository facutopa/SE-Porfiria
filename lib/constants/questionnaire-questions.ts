/**
 * Preguntas del cuestionario de Porfiria
 * 
 * Estas preguntas están mapeadas directamente a las reglas Drools
 * y sus IDs coinciden con los questionId usados en las reglas.
 */

export interface QuestionnaireQuestion {
  id: string;
  category: string;
  text: string;
  type: 'YES_NO';
  required: boolean;
  weight: number;
  dependsOn?: string;
  droolsRule?: string; // ID de la regla Drools asociada
}

// Categorías de síntomas
export const SYMPTOM_CATEGORIES = {
  CUTANEOUS: 'sintomas_cutaneos',
  ACUTE: 'sintomas_agudos',
  ANAMNESIS: 'anamnesis',
  ENVIRONMENTAL: 'factores_ambientales'
} as const;

// Preguntas mapeadas a reglas Drools
export const questionnaireQuestions: QuestionnaireQuestion[] = [
  // Síntomas Cutáneos
  {
    id: 'maculas',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿El paciente presenta máculas?',
    type: 'YES_NO',
    required: true,
    weight: 2,
    droolsRule: 'REG-001'
  },
  {
    id: 'fragilidadCutanea',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta fragilidad cutánea?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-002'
  },
  {
    id: 'hipertricosis',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta hipertricosis?',
    type: 'YES_NO',
    required: true,
    weight: 4,
    droolsRule: 'REG-003'
  },
  {
    id: 'nodulos',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta nódulos?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-004'
  },
  {
    id: 'lesionesOculares',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta lesiones oculares?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-005'
  },
  {
    id: 'costras',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta costras?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-006'
  },
  {
    id: 'quistesMilia',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta quistes de milia?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-007'
  },
  {
    id: 'hiperpigmentacion',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta hiperpigmentación?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-008'
  },
  {
    id: 'ampollas',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta ampollas?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-009'
  },
  {
    id: 'fotosensibilidad',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta fotosensibilidad?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-010'
  },
  {
    id: 'pruritos',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta pruritos?',
    type: 'YES_NO',
    required: true,
    weight: 2,
    droolsRule: 'REG-011'
  },
  {
    id: 'tricosis',
    category: SYMPTOM_CATEGORIES.CUTANEOUS,
    text: '¿Presenta tricosis?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-012'
  },

  // Síntomas Agudos
  {
    id: 'trastornosPsiquiatricos',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta trastornos psiquiátricos?',
    type: 'YES_NO',
    required: true,
    weight: 4,
    droolsRule: 'REG-013'
  },
  {
    id: 'parestesias',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta parestesias?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-014'
  },
  {
    id: 'cefaleas',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta cefaleas?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-015'
  },
  {
    id: 'paresia',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta paresia?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-016'
  },
  {
    id: 'convulsiones',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta convulsiones?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-017'
  },
  {
    id: 'trastornosAbdominales',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta trastornos abdominales?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-018'
  },
  {
    id: 'sindromeAcidoSensitivo',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta síndrome ácido sensitivo?',
    type: 'YES_NO',
    required: true,
    weight: 2,
    droolsRule: 'REG-019'
  },
  {
    id: 'palpitaciones',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta palpitaciones?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-020'
  },
  {
    id: 'anorexia',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta anorexia?',
    type: 'YES_NO',
    required: true,
    weight: 2,
    droolsRule: 'REG-021'
  },
  {
    id: 'estres',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta estrés?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-022'
  },
  {
    id: 'trastornosNeurologicos',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta trastornos neurológicos?',
    type: 'YES_NO',
    required: true,
    weight: 4,
    droolsRule: 'REG-023'
  },
  {
    id: 'doloresMusculares',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta dolores musculares?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-024'
  },
  {
    id: 'mareos',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta mareos?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-025'
  },
  {
    id: 'paralisis',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta parálisis?',
    type: 'YES_NO',
    required: true,
    weight: 4,
    droolsRule: 'REG-026'
  },
  {
    id: 'dolorAbdominalLumbar',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta dolor abdominal/lumbar?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-027'
  },
  {
    id: 'constipacion',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta constipación?',
    type: 'YES_NO',
    required: true,
    weight: 3,
    droolsRule: 'REG-028'
  },
  {
    id: 'astenia',
    category: SYMPTOM_CATEGORIES.ACUTE,
    text: '¿Presenta astenia?',
    type: 'YES_NO',
    required: true,
    weight: 4,
    droolsRule: 'REG-029'
  },

  // Anamnesis
  {
    id: 'colorOrina',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Color de orina oscura/ámbar?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-030'
  },
  {
    id: 'familiares',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene antecedentes familiares de Porfiria?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-031'
  },
  {
    id: 'diabetes',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene diabetes?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-032'
  },
  {
    id: 'hta',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene HTA?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-033'
  },
  {
    id: 'tiroides',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene problemas de tiroides?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-034'
  },
  {
    id: 'celiaquia',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene celiaquía?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-035'
  },
  {
    id: 'lupus',
    category: SYMPTOM_CATEGORIES.ANAMNESIS,
    text: '¿Tiene lupus?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-036'
  },

  // Factores Ambientales
  {
    id: 'operaciones',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido operaciones recientes?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-037'
  },
  {
    id: 'contactoPoliclorados',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con policlorados?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-038'
  },
  {
    id: 'contactoOtrasDrogas',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con otras drogas?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-039'
  },
  {
    id: 'contactoPlomo',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con plomo?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-040'
  },
  {
    id: 'contactoOtrosMetales',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con otros metales?',
    type: 'YES_NO',
    required: true,
    weight: 0.5,
    droolsRule: 'REG-041'
  },
  {
    id: 'cercaniaFabrica',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Vive cerca de una fábrica?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-042'
  },
  {
    id: 'contactoVeneno',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con venenos?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-043'
  },
  {
    id: 'contactoDerivadoPetroleo',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Ha tenido contacto con derivados del petróleo?',
    type: 'YES_NO',
    required: true,
    weight: 1,
    droolsRule: 'REG-044'
  },
  {
    id: 'consumeAlcohol',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Consume alcohol regularmente?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-045'
  },
  {
    id: 'fuma',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Fuma?',
    type: 'YES_NO',
    required: true,
    weight: 2,
    droolsRule: 'REG-046'
  },
  {
    id: 'barbituricos',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Consume barbitúricos?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-047'
  },
  {
    id: 'medicamentosHormonas',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Toma medicamentos hormonales?',
    type: 'YES_NO',
    required: true,
    weight: 5,
    droolsRule: 'REG-048'
  },
  {
    id: 'anomaliasPeriodosMenstruales',
    category: SYMPTOM_CATEGORIES.ENVIRONMENTAL,
    text: '¿Presenta anomalías en los períodos menstruales?',
    type: 'YES_NO',
    required: false, // Solo para mujeres
    weight: 4,
    droolsRule: 'REG-049'
  }
];
