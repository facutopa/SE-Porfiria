/**
 * Ejemplo de reglas personalizadas para Porfiria
 * 
 * Este archivo muestra cómo puedes definir tus propias reglas
 * basadas en los criterios médicos específicos que tengas en tu Word.
 * 
 * Para agregar nuevas reglas:
 * 1. Copia la estructura de las reglas existentes
 * 2. Modifica las condiciones según tus criterios
 * 3. Ajusta los pesos según la importancia
 * 4. Agrega la regla al motor usando droolsEngine.addRule()
 */

import { PorfiriaRule, PatientData, QuestionnaireResponse } from '../drools-engine';

/**
 * Función auxiliar para obtener respuestas
 */
function getResponse(responses: QuestionnaireResponse[], questionId: string): string | null {
  const response = responses.find(r => r.questionId === questionId);
  return response ? response.answer : null;
}

/**
 * EJEMPLO 1: Regla para síntomas específicos de Porfiria Aguda
 * 
 * Basada en: "Dolor abdominal severo + debilidad muscular + antecedentes familiares"
 */
export const acutePorphyriaRule: PorfiriaRule = {
  id: 'custom_acute_porphyria',
  name: 'Sospecha de Porfiria Aguda Intermitente',
  condition: (data, responses) => {
    const abdominalPain = getResponse(responses, '1') === 'YES';
    const muscleWeakness = getResponse(responses, '3') === 'YES';
    const familyHistory = data.familyHistory;
    
    // La regla se activa si hay dolor abdominal Y debilidad muscular Y antecedentes familiares
    return abdominalPain && muscleWeakness && familyHistory;
  },
  weight: 5, // Peso alto porque es muy específico
  category: 'critical',
  reasoning: 'Combinación clásica de síntomas de Porfiria Aguda Intermitente con antecedentes familiares'
};

/**
 * EJEMPLO 2: Regla para Porfiria Cutánea Tardía
 * 
 * Basada en: "Lesiones cutáneas + fotosensibilidad + consumo de alcohol"
 */
export const cutaneousPorphyriaRule: PorfiriaRule = {
  id: 'custom_cutaneous_porphyria',
  name: 'Sospecha de Porfiria Cutánea Tardía',
  condition: (data, responses) => {
    const skinLesions = getResponse(responses, '5') === 'YES';
    const photosensitivity = getResponse(responses, '6') === 'YES';
    const alcoholConsumption = data.alcoholConsumption;
    
    // La regla se activa si hay lesiones cutáneas Y fotosensibilidad Y consumo de alcohol
    return skinLesions && photosensitivity && alcoholConsumption;
  },
  weight: 4,
  category: 'cutaneous',
  reasoning: 'Síntomas característicos de Porfiria Cutánea Tardía con factor desencadenante (alcohol)'
};

/**
 * EJEMPLO 3: Regla para crisis por medicamentos
 * 
 * Basada en: "Medicamentos desencadenantes + síntomas neurológicos"
 */
export const medicationTriggerRule: PorfiriaRule = {
  id: 'custom_medication_trigger',
  name: 'Crisis desencadenada por medicamentos',
  condition: (data, responses) => {
    const medications = getResponse(responses, '10') === 'YES';
    const seizures = getResponse(responses, '15') === 'YES';
    const mentalChanges = getResponse(responses, '7') === 'YES';
    
    // La regla se activa si hay medicamentos Y síntomas neurológicos
    return medications && (seizures || mentalChanges);
  },
  weight: 4,
  category: 'environmental',
  reasoning: 'Síntomas neurológicos en contexto de medicamentos que pueden desencadenar Porfiria'
};

/**
 * EJEMPLO 4: Regla para pacientes pediátricos
 * 
 * Basada en: "Edad < 18 + síntomas + antecedentes familiares"
 */
export const pediatricPorphyriaRule: PorfiriaRule = {
  id: 'custom_pediatric_porphyria',
  name: 'Sospecha de Porfiria en paciente pediátrico',
  condition: (data, responses) => {
    const isPediatric = data.age < 18;
    const anySymptoms = getResponse(responses, '1') === 'YES' || 
                       getResponse(responses, '3') === 'YES' ||
                       getResponse(responses, '5') === 'YES';
    const familyHistory = data.familyHistory;
    
    // La regla se activa si es pediátrico Y tiene síntomas Y antecedentes familiares
    return isPediatric && anySymptoms && familyHistory;
  },
  weight: 4,
  category: 'genetic',
  reasoning: 'Paciente pediátrico con síntomas y antecedentes familiares de Porfiria'
};

/**
 * EJEMPLO 5: Regla para síntomas atípicos
 * 
 * Basada en: "Síntomas psiquiátricos + convulsiones sin dolor abdominal"
 */
export const atypicalPorphyriaRule: PorfiriaRule = {
  id: 'custom_atypical_porphyria',
  name: 'Presentación atípica de Porfiria',
  condition: (data, responses) => {
    const mentalChanges = getResponse(responses, '7') === 'YES';
    const seizures = getResponse(responses, '15') === 'YES';
    const noAbdominalPain = getResponse(responses, '1') === 'NO';
    
    // La regla se activa si hay síntomas psiquiátricos Y convulsiones PERO NO dolor abdominal
    return mentalChanges && seizures && noAbdominalPain;
  },
  weight: 3,
  category: 'neurological',
  reasoning: 'Presentación atípica con síntomas neurológicos sin dolor abdominal característico'
};

/**
 * EJEMPLO 6: Regla para factores de riesgo múltiples
 * 
 * Basada en: "Múltiples factores desencadenantes simultáneos"
 */
export const multipleRiskFactorsRule: PorfiriaRule = {
  id: 'custom_multiple_risk_factors',
  name: 'Múltiples factores de riesgo',
  condition: (data, responses) => {
    const medications = getResponse(responses, '10') === 'YES';
    const alcohol = data.alcoholConsumption;
    const fasting = data.fastingStatus;
    
    // La regla se activa si hay 2 o más factores de riesgo
    const riskFactorCount = [medications, alcohol, fasting].filter(Boolean).length;
    return riskFactorCount >= 2;
  },
  weight: 3,
  category: 'environmental',
  reasoning: 'Presencia de múltiples factores que pueden desencadenar crisis de Porfiria'
};

/**
 * EJEMPLO 7: Regla para seguimiento de casos
 * 
 * Basada en: "Síntomas leves pero persistentes"
 */
export const followUpRule: PorfiriaRule = {
  id: 'custom_follow_up',
  name: 'Caso para seguimiento',
  condition: (data, responses) => {
    const mildSymptoms = getResponse(responses, '13') === 'YES' || // Náuseas
                        getResponse(responses, '14') === 'YES';   // Estreñimiento
    const familyHistory = data.familyHistory;
    
    // La regla se activa si hay síntomas leves Y antecedentes familiares
    return mildSymptoms && familyHistory;
  },
  weight: 2,
  category: 'genetic',
  reasoning: 'Síntomas leves con antecedentes familiares - requiere seguimiento'
};

/**
 * Todas las reglas personalizadas de ejemplo
 */
export const exampleCustomRules: PorfiriaRule[] = [
  acutePorphyriaRule,
  cutaneousPorphyriaRule,
  medicationTriggerRule,
  pediatricPorphyriaRule,
  atypicalPorphyriaRule,
  multipleRiskFactorsRule,
  followUpRule
];

/**
 * Función para agregar reglas personalizadas al motor
 * 
 * Uso:
 * import { droolsEngine } from '../drools-engine';
 * import { exampleCustomRules } from './example-custom-rules';
 * 
 * // Agregar todas las reglas de ejemplo
 * exampleCustomRules.forEach(rule => droolsEngine.addRule(rule));
 * 
 * // O agregar una regla específica
 * droolsEngine.addRule(acutePorphyriaRule);
 */
export function addExampleRulesToEngine(): void {
  // Esta función se puede llamar para agregar las reglas de ejemplo al motor
  // En un entorno real, esto se haría durante la inicialización de la aplicación
  console.log('Reglas de ejemplo cargadas:', exampleCustomRules.length);
}
