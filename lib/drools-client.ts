/**
 * Cliente Drools para comunicación con el servidor de reglas
 * 
 * Este cliente se conecta al servidor Drools real que procesa
 * archivos .drl y ejecuta el motor de inferencia.
 */

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

export interface DroolsRecommendation {
  testType: 'PBG_URINE_TEST' | 'NO_TEST_NEEDED' | 'FOLLOW_UP_REQUIRED';
  confidence: 'low' | 'medium' | 'high';
  message: string;
  score: number;
  criticalSymptoms: number;
  reasoning: string[];
  riskFactors: string[];
  estudiosRecomendados?: string[];
  medicamentosContraproducentes?: string[];
  recommendedTests?: string[];
  contraindicatedMedications?: string[];
}

export interface DroolsEvaluationResult {
  success: boolean;
  recommendation?: DroolsRecommendation;
  error?: string;
}

/**
 * Cliente para comunicación con el servidor Drools
 */
export class DroolsClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  /**
   * Evalúa un cuestionario usando el motor Drools real
   */
  async evaluateQuestionnaire(
    patientData: PatientData,
    responses: QuestionnaireResponse[]
  ): Promise<DroolsEvaluationResult> {
    try {
      console.log('Enviando evaluación a servidor Drools...');
      
      const response = await fetch(`${this.baseUrl}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient: patientData,
          responses: responses.reduce((acc, resp) => {
            acc[resp.questionId] = resp.answer;
            return acc;
          }, {} as Record<string, string>)
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          recommendation: result.recommendation
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error desconocido del servidor'
        };
      }
    } catch (error) {
      console.error('Error en comunicación con Drools:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Obtiene las reglas activas del servidor Drools
   */
  async getActiveRules(): Promise<{ success: boolean; rules?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rules`);
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error obteniendo reglas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  /**
   * Verifica la salud del servidor Drools
   */
  async checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verificando salud del servidor:', error);
      throw error;
    }
  }

  /**
   * Evalúa con fallback a lógica local si Drools no está disponible
   */
  async evaluateWithFallback(
    patientData: PatientData,
    responses: QuestionnaireResponse[],
    fallbackLogic: () => DroolsRecommendation
  ): Promise<DroolsEvaluationResult> {
    try {
      // Intentar conectar con Drools
      await this.checkHealth();
      
      // Si la conexión es exitosa, usar Drools
      return await this.evaluateQuestionnaire(patientData, responses);
    } catch (error) {
      console.warn('Servidor Drools no disponible, usando lógica de fallback:', error);
      
      // Usar lógica de fallback
      try {
        const recommendation = fallbackLogic();
        return {
          success: true,
          recommendation
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: `Error en lógica de fallback: ${fallbackError}`
        };
      }
    }
  }
}

/**
 * Instancia singleton del cliente Drools
 */
export const droolsClient = new DroolsClient();

/**
 * Función de conveniencia para evaluar cuestionarios
 */
export async function evaluateWithDrools(
  patientData: PatientData,
  responses: QuestionnaireResponse[],
  fallbackLogic?: () => DroolsRecommendation
): Promise<DroolsEvaluationResult> {
  if (fallbackLogic) {
    return await droolsClient.evaluateWithFallback(patientData, responses, fallbackLogic);
  } else {
    return await droolsClient.evaluateQuestionnaire(patientData, responses);
  }
}
