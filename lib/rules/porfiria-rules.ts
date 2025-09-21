/**
 * Definición de reglas específicas para diagnóstico de Porfiria
 * 
 * Este archivo contiene todas las reglas médicas que se aplicarán
 * durante la evaluación del cuestionario. Las reglas están organizadas
 * por categorías y pueden ser fácilmente modificadas o extendidas.
 */

import { PorfiriaRule, PatientData, QuestionnaireResponse } from '../drools-engine';

/**
 * Reglas para síntomas gastrointestinales
 */
export const gastrointestinalRules: PorfiriaRule[] = [
  {
    id: 'gastro_abdominal_pain_severe',
    name: 'Dolor abdominal severo',
    condition: (data, responses) => {
      const abdominalPain = getResponse(responses, '1') === 'YES';
      const location = getResponse(responses, '2') === 'YES'; // Cuadrante superior derecho
      return abdominalPain && location;
    },
    weight: 4,
    category: 'gastrointestinal',
    reasoning: 'Dolor abdominal severo localizado en cuadrante superior derecho'
  },
  {
    id: 'gastro_nausea_vomiting',
    name: 'Náuseas y vómitos',
    condition: (data, responses) => {
      const nausea = getResponse(responses, '13') === 'YES';
      return nausea;
    },
    weight: 2,
    category: 'gastrointestinal',
    reasoning: 'Presencia de náuseas y vómitos'
  },
  {
    id: 'gastro_constipation',
    name: 'Estreñimiento',
    condition: (data, responses) => {
      const constipation = getResponse(responses, '14') === 'YES';
      return constipation;
    },
    weight: 1,
    category: 'gastrointestinal',
    reasoning: 'Presencia de estreñimiento'
  }
];

/**
 * Reglas para síntomas neurológicos
 */
export const neurologicalRules: PorfiriaRule[] = [
  {
    id: 'neuro_muscle_weakness',
    name: 'Debilidad muscular',
    condition: (data, responses) => {
      const weakness = getResponse(responses, '3') === 'YES';
      const upperLimbs = getResponse(responses, '4') === 'YES';
      return weakness && upperLimbs;
    },
    weight: 3,
    category: 'neurological',
    reasoning: 'Debilidad muscular que afecta principalmente las extremidades superiores'
  },
  {
    id: 'neuro_seizures',
    name: 'Convulsiones',
    condition: (data, responses) => {
      const seizures = getResponse(responses, '15') === 'YES';
      return seizures;
    },
    weight: 4,
    category: 'neurological',
    reasoning: 'Presencia de convulsiones'
  },
  {
    id: 'neuro_mental_changes',
    name: 'Cambios en el estado mental',
    condition: (data, responses) => {
      const mentalChanges = getResponse(responses, '7') === 'YES';
      const specificSymptoms = getResponse(responses, '8') === 'YES';
      return mentalChanges && specificSymptoms;
    },
    weight: 3,
    category: 'neurological',
    reasoning: 'Cambios en el comportamiento con síntomas específicos (ansiedad, confusión, alucinaciones)'
  }
];

/**
 * Reglas para síntomas cutáneos
 */
export const cutaneousRules: PorfiriaRule[] = [
  {
    id: 'cutaneous_photosensitivity',
    name: 'Fotosensibilidad',
    condition: (data, responses) => {
      const skinLesions = getResponse(responses, '5') === 'YES';
      const sunExposed = getResponse(responses, '6') === 'YES';
      return skinLesions && sunExposed;
    },
    weight: 3,
    category: 'cutaneous',
    reasoning: 'Lesiones cutáneas en áreas expuestas al sol'
  }
];

/**
 * Reglas para factores genéticos y antecedentes
 */
export const geneticRules: PorfiriaRule[] = [
  {
    id: 'genetic_family_history',
    name: 'Antecedentes familiares',
    condition: (data, responses) => {
      return data.familyHistory;
    },
    weight: 4,
    category: 'genetic',
    reasoning: 'Antecedentes familiares de Porfiria'
  }
];

/**
 * Reglas para factores ambientales y desencadenantes
 */
export const environmentalRules: PorfiriaRule[] = [
  {
    id: 'env_medications',
    name: 'Medicamentos desencadenantes',
    condition: (data, responses) => {
      const medications = getResponse(responses, '10') === 'YES';
      return medications;
    },
    weight: 3,
    category: 'environmental',
    reasoning: 'Uso de medicamentos que pueden desencadenar Porfiria'
  },
  {
    id: 'env_alcohol',
    name: 'Consumo de alcohol',
    condition: (data, responses) => {
      return data.alcoholConsumption;
    },
    weight: 2,
    category: 'environmental',
    reasoning: 'Consumo regular de alcohol'
  },
  {
    id: 'env_fasting',
    name: 'Ayuno prolongado',
    condition: (data, responses) => {
      return data.fastingStatus;
    },
    weight: 2,
    category: 'environmental',
    reasoning: 'Ayuno prolongado o dieta restrictiva'
  }
];

/**
 * Reglas críticas (combinaciones de síntomas)
 */
export const criticalRules: PorfiriaRule[] = [
  {
    id: 'critical_acute_porphyria',
    name: 'Sospecha de Porfiria Aguda',
    condition: (data, responses) => {
      const abdominalPain = getResponse(responses, '1') === 'YES';
      const weakness = getResponse(responses, '3') === 'YES';
      const familyHistory = data.familyHistory;
      const medications = getResponse(responses, '10') === 'YES';
      
      return (abdominalPain && weakness) || (familyHistory && medications);
    },
    weight: 5,
    category: 'critical',
    reasoning: 'Combinación de síntomas que sugiere Porfiria Aguda'
  },
  {
    id: 'critical_cutaneous_porphyria',
    name: 'Sospecha de Porfiria Cutánea',
    condition: (data, responses) => {
      const skinLesions = getResponse(responses, '5') === 'YES';
      const photosensitivity = getResponse(responses, '6') === 'YES';
      const familyHistory = data.familyHistory;
      
      return skinLesions && photosensitivity && familyHistory;
    },
    weight: 4,
    category: 'critical',
    reasoning: 'Combinación de síntomas que sugiere Porfiria Cutánea'
  },
  {
    id: 'critical_high_risk',
    name: 'Alto riesgo de Porfiria',
    condition: (data, responses) => {
      const abdominalPain = getResponse(responses, '1') === 'YES';
      const weakness = getResponse(responses, '3') === 'YES';
      const seizures = getResponse(responses, '15') === 'YES';
      const familyHistory = data.familyHistory;
      
      return (abdominalPain && weakness && familyHistory) || 
             (seizures && familyHistory);
    },
    weight: 6,
    category: 'critical',
    reasoning: 'Alto riesgo basado en múltiples síntomas críticos y antecedentes familiares'
  }
];

/**
 * Reglas específicas por edad
 */
export const ageSpecificRules: PorfiriaRule[] = [
  {
    id: 'age_pediatric_risk',
    name: 'Riesgo pediátrico',
    condition: (data, responses) => {
      const isPediatric = data.age < 18;
      const familyHistory = data.familyHistory;
      const anySymptoms = getResponse(responses, '1') === 'YES' || 
                         getResponse(responses, '3') === 'YES' ||
                         getResponse(responses, '5') === 'YES';
      
      return isPediatric && familyHistory && anySymptoms;
    },
    weight: 3,
    category: 'genetic',
    reasoning: 'Paciente pediátrico con antecedentes familiares y síntomas'
  },
  {
    id: 'age_adult_onset',
    name: 'Inicio en edad adulta',
    condition: (data, responses) => {
      const isAdult = data.age >= 18 && data.age <= 65;
      const abdominalPain = getResponse(responses, '1') === 'YES';
      const medications = getResponse(responses, '10') === 'YES';
      
      return isAdult && abdominalPain && medications;
    },
    weight: 2,
    category: 'environmental',
    reasoning: 'Síntomas en edad adulta con medicamentos desencadenantes'
  }
];

/**
 * Reglas específicas por género
 */
export const genderSpecificRules: PorfiriaRule[] = [
  {
    id: 'gender_female_risk',
    name: 'Riesgo en mujeres',
    condition: (data, responses) => {
      const isFemale = data.gender === 'F';
      const age = data.age >= 15 && data.age <= 45; // Edad reproductiva
      const anySymptoms = getResponse(responses, '1') === 'YES' || 
                         getResponse(responses, '3') === 'YES';
      
      return isFemale && age && anySymptoms;
    },
    weight: 1,
    category: 'genetic',
    reasoning: 'Mujer en edad reproductiva con síntomas (mayor prevalencia de Porfiria)'
  }
];

/**
 * Función auxiliar para obtener respuestas
 */
function getResponse(responses: QuestionnaireResponse[], questionId: string): string | null {
  const response = responses.find(r => r.questionId === questionId);
  return response ? response.answer : null;
}

/**
 * Todas las reglas organizadas por categoría
 */
export const allPorfiriaRules = {
  gastrointestinal: gastrointestinalRules,
  neurological: neurologicalRules,
  cutaneous: cutaneousRules,
  genetic: geneticRules,
  environmental: environmentalRules,
  critical: criticalRules,
  ageSpecific: ageSpecificRules,
  genderSpecific: genderSpecificRules
};

/**
 * Obtiene todas las reglas como un array plano
 */
export function getAllRules(): PorfiriaRule[] {
  return Object.values(allPorfiriaRules).flat();
}

/**
 * Obtiene reglas por categoría específica
 */
export function getRulesByCategory(category: string): PorfiriaRule[] {
  return allPorfiriaRules[category as keyof typeof allPorfiriaRules] || [];
}
