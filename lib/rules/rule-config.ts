/**
 * Configuración centralizada para las reglas de Porfiria
 * 
 * Este archivo permite configurar fácilmente las reglas sin modificar
 * el código del motor. Las reglas pueden ser cargadas desde archivos
 * externos o bases de datos.
 */

import { PorfiriaRule } from '../drools-engine';

/**
 * Configuración de umbrales para las recomendaciones
 */
export interface RuleThresholds {
  highRisk: {
    minScore: number;
    minCriticalSymptoms: number;
  };
  mediumRisk: {
    minScore: number;
    minCriticalSymptoms: number;
  };
  lowRisk: {
    maxScore: number;
    maxCriticalSymptoms: number;
  };
}

/**
 * Configuración por defecto de umbrales
 */
export const defaultThresholds: RuleThresholds = {
  highRisk: {
    minScore: 8,
    minCriticalSymptoms: 2
  },
  mediumRisk: {
    minScore: 5,
    minCriticalSymptoms: 1
  },
  lowRisk: {
    maxScore: 4,
    maxCriticalSymptoms: 0
  }
};

/**
 * Configuración de mensajes para las recomendaciones
 */
export interface RecommendationMessages {
  highRisk: {
    testType: 'PBG_URINE_TEST';
    confidence: 'high';
    message: string;
  };
  mediumRisk: {
    testType: 'FOLLOW_UP_REQUIRED';
    confidence: 'medium';
    message: string;
  };
  lowRisk: {
    testType: 'NO_TEST_NEEDED';
    confidence: 'low';
    message: string;
  };
}

/**
 * Mensajes por defecto para las recomendaciones
 */
export const defaultMessages: RecommendationMessages = {
  highRisk: {
    testType: 'PBG_URINE_TEST',
    confidence: 'high',
    message: 'Se recomienda realizar test de PBG en orina para descartar Porfiria Aguda. La combinación de síntomas y factores de riesgo sugiere alta probabilidad.'
  },
  mediumRisk: {
    testType: 'FOLLOW_UP_REQUIRED',
    confidence: 'medium',
    message: 'Se recomienda seguimiento clínico y considerar test de PBG si los síntomas persisten o empeoran.'
  },
  lowRisk: {
    testType: 'NO_TEST_NEEDED',
    confidence: 'low',
    message: 'Los síntomas no sugieren Porfiria. Continuar con evaluación clínica general.'
  }
};

/**
 * Configuración de pesos para diferentes tipos de síntomas
 */
export interface SymptomWeights {
  gastrointestinal: number;
  neurological: number;
  cutaneous: number;
  genetic: number;
  environmental: number;
  critical: number;
}

/**
 * Pesos por defecto para los síntomas
 */
export const defaultSymptomWeights: SymptomWeights = {
  gastrointestinal: 1.0,
  neurological: 1.2,
  cutaneous: 0.8,
  genetic: 1.5,
  environmental: 1.0,
  critical: 2.0
};

/**
 * Configuración de reglas personalizadas
 */
export interface RuleConfiguration {
  thresholds: RuleThresholds;
  messages: RecommendationMessages;
  weights: SymptomWeights;
  enabledRules: string[];
  customRules: PorfiriaRule[];
}

/**
 * Configuración por defecto
 */
export const defaultRuleConfiguration: RuleConfiguration = {
  thresholds: defaultThresholds,
  messages: defaultMessages,
  weights: defaultSymptomWeights,
  enabledRules: [], // Si está vacío, todas las reglas están habilitadas
  customRules: []
};

/**
 * Cargador de configuración de reglas
 */
export class RuleConfigurationLoader {
  private config: RuleConfiguration;

  constructor(config?: Partial<RuleConfiguration>) {
    this.config = { ...defaultRuleConfiguration, ...config };
  }

  /**
   * Carga configuración desde un archivo JSON
   */
  static async loadFromFile(filePath: string): Promise<RuleConfigurationLoader> {
    try {
      // En un entorno real, esto cargaría desde un archivo
      // const configData = await fs.readFile(filePath, 'utf-8');
      // const config = JSON.parse(configData);
      // return new RuleConfigurationLoader(config);
      
      // Por ahora, retornamos la configuración por defecto
      return new RuleConfigurationLoader();
    } catch (error) {
      console.warn('No se pudo cargar la configuración de reglas, usando configuración por defecto:', error);
      return new RuleConfigurationLoader();
    }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfiguration(): RuleConfiguration {
    return this.config;
  }

  /**
   * Actualiza la configuración
   */
  updateConfiguration(updates: Partial<RuleConfiguration>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Verifica si una regla está habilitada
   */
  isRuleEnabled(ruleId: string): boolean {
    if (this.config.enabledRules.length === 0) {
      return true; // Todas las reglas están habilitadas por defecto
    }
    return this.config.enabledRules.includes(ruleId);
  }

  /**
   * Obtiene el peso ajustado para una categoría
   */
  getAdjustedWeight(category: string, baseWeight: number): number {
    const categoryWeight = this.config.weights[category as keyof SymptomWeights] || 1.0;
    return baseWeight * categoryWeight;
  }
}

/**
 * Instancia global del cargador de configuración
 */
export const ruleConfigLoader = new RuleConfigurationLoader();
