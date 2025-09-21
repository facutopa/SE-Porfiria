/**
 * Motor de reglas Drools para evaluación de cuestionarios de Porfiria
 * 
 * Este motor procesa las respuestas del cuestionario y aplica reglas
 * basadas en criterios médicos para determinar recomendaciones de tests.
 */

import { getAllRules } from './rules/porfiria-rules';
import { ruleConfigLoader } from './rules/rule-config';

// Tipos de datos para el motor de reglas
export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  age: number;
  gender: 'M' | 'F';
  familyHistory: boolean;
  medications: string[];
  alcoholConsumption: boolean;
  fastingStatus: boolean;
}

export interface QuestionnaireResponse {
  questionId: string;
  answer: string;
  patientId: string;
  timestamp: Date;
}

export interface SymptomScore {
  category: string;
  score: number;
  weight: number;
}

export interface TestRecommendation {
  testType: 'PBG_URINE_TEST' | 'NO_TEST_NEEDED' | 'FOLLOW_UP_REQUIRED';
  confidence: 'low' | 'medium' | 'high';
  message: string;
  score: number;
  criticalSymptoms: number;
  reasoning: string[];
  riskFactors: string[];
}

export interface EvaluationResult {
  success: boolean;
  recommendations?: TestRecommendation;
  error?: string;
}

/**
 * Motor de reglas Drools simplificado para evaluación de Porfiria
 * 
 * En un entorno de producción, esto se conectaría con un servidor Drools real,
 * pero para este ejemplo implementamos la lógica de reglas directamente.
 */
export class DroolsEngine {
  private rules: PorfiriaRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Inicializa las reglas de evaluación de Porfiria
   */
  private initializeRules(): void {
    // Cargar todas las reglas definidas en el archivo de reglas
    this.rules = getAllRules();
    
    // Filtrar reglas habilitadas según la configuración
    this.rules = this.rules.filter(rule => 
      ruleConfigLoader.isRuleEnabled(rule.id)
    );
  }

  /**
   * Obtiene la respuesta de una pregunta específica
   */
  private getResponse(responses: QuestionnaireResponse[], questionId: string): string | null {
    const response = responses.find(r => r.questionId === questionId);
    return response ? response.answer : null;
  }

  /**
   * Evalúa el cuestionario aplicando todas las reglas
   */
  async evaluateQuestionnaire(
    patientData: PatientData, 
    responses: QuestionnaireResponse[]
  ): Promise<EvaluationResult> {
    try {
      const matchedRules = this.rules.filter(rule => 
        rule.condition(patientData, responses)
      );

      const scores = this.calculateScores(matchedRules);
      const recommendation = this.generateRecommendation(scores, matchedRules, patientData);

      return {
        success: true,
        recommendations: recommendation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Calcula las puntuaciones por categoría
   */
  private calculateScores(matchedRules: PorfiriaRule[]): SymptomScore[] {
    const categoryScores: { [key: string]: { score: number; weight: number } } = {};

    matchedRules.forEach(rule => {
      if (!categoryScores[rule.category]) {
        categoryScores[rule.category] = { score: 0, weight: 0 };
      }
      
      // Aplicar peso ajustado según la configuración
      const adjustedWeight = ruleConfigLoader.getAdjustedWeight(rule.category, rule.weight);
      
      categoryScores[rule.category].score += adjustedWeight;
      categoryScores[rule.category].weight += adjustedWeight;
    });

    return Object.entries(categoryScores).map(([category, data]) => ({
      category,
      score: data.score,
      weight: data.weight
    }));
  }

  /**
   * Genera la recomendación basada en las reglas aplicadas
   */
  private generateRecommendation(
    scores: SymptomScore[], 
    matchedRules: PorfiriaRule[],
    patientData: PatientData
  ): TestRecommendation {
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const criticalSymptoms = matchedRules.filter(rule => 
      rule.category === 'critical' || rule.weight >= 4
    ).length;

    const reasoning = matchedRules.map(rule => rule.reasoning);
    const riskFactors = this.identifyRiskFactors(patientData, matchedRules);

    // Obtener configuración de umbrales
    const config = ruleConfigLoader.getConfiguration();
    const thresholds = config.thresholds;
    const messages = config.messages;

    // Lógica de decisión basada en configuración
    if (totalScore >= thresholds.highRisk.minScore || criticalSymptoms >= thresholds.highRisk.minCriticalSymptoms) {
      return {
        testType: messages.highRisk.testType,
        confidence: messages.highRisk.confidence,
        message: messages.highRisk.message,
        score: totalScore,
        criticalSymptoms,
        reasoning,
        riskFactors
      };
    } else if (totalScore >= thresholds.mediumRisk.minScore || criticalSymptoms >= thresholds.mediumRisk.minCriticalSymptoms) {
      return {
        testType: messages.mediumRisk.testType,
        confidence: messages.mediumRisk.confidence,
        message: messages.mediumRisk.message,
        score: totalScore,
        criticalSymptoms,
        reasoning,
        riskFactors
      };
    } else {
      return {
        testType: messages.lowRisk.testType,
        confidence: messages.lowRisk.confidence,
        message: messages.lowRisk.message,
        score: totalScore,
        criticalSymptoms,
        reasoning,
        riskFactors
      };
    }
  }

  /**
   * Identifica factores de riesgo específicos
   */
  private identifyRiskFactors(patientData: PatientData, matchedRules: PorfiriaRule[]): string[] {
    const riskFactors: string[] = [];

    if (patientData.familyHistory) {
      riskFactors.push('Antecedentes familiares de Porfiria');
    }

    if (patientData.alcoholConsumption) {
      riskFactors.push('Consumo de alcohol');
    }

    if (patientData.fastingStatus) {
      riskFactors.push('Ayuno prolongado');
    }

    if (patientData.medications.length > 0) {
      riskFactors.push('Medicamentos que pueden desencadenar Porfiria');
    }

    if (patientData.age < 18) {
      riskFactors.push('Edad pediátrica (mayor riesgo)');
    }

    return riskFactors;
  }

  /**
   * Agrega una nueva regla al motor
   */
  addRule(rule: PorfiriaRule): void {
    this.rules.push(rule);
  }

  /**
   * Obtiene todas las reglas disponibles
   */
  getRules(): PorfiriaRule[] {
    return this.rules;
  }
}

/**
 * Interfaz para definir reglas de Porfiria
 */
export interface PorfiriaRule {
  id: string;
  name: string;
  condition: (patientData: PatientData, responses: QuestionnaireResponse[]) => boolean;
  weight: number;
  category: 'gastrointestinal' | 'neurological' | 'cutaneous' | 'genetic' | 'environmental' | 'critical';
  reasoning: string;
}

/**
 * Instancia singleton del motor de reglas
 */
export const droolsEngine = new DroolsEngine();
