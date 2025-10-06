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
  raw?: any;
}

/**
 * Cliente para comunicación con el servidor Drools
 */
export class DroolsClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080') {
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
      console.log('🔗 [DEBUG] Enviando evaluación a KIE server...');
      console.log('🌐 [DEBUG] URL del servidor:', `${this.baseUrl}/api/porfiria/evaluar`);
      console.log('👤 [DEBUG] Datos del paciente:', patientData);
      console.log('📝 [DEBUG] Respuestas originales:', responses);

      // Ajustar cuerpo según OpenAPI EvaluacionRequest
      const requestBody = {
        patientId: patientData.id,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dni: patientData.dni,
        age: patientData.age,
        gender: patientData.gender,
        familyHistory: patientData.familyHistory,
        alcoholConsumption: patientData.alcoholConsumption,
        fastingStatus: patientData.fastingStatus,
        responses: responses.map(r => ({
          questionId: r.questionId,
          answer: r.answer,
          patientId: r.patientId
        }))
      };

      console.log('📦 [DEBUG] Cuerpo de la petición:', requestBody);

      const response = await fetch(`${this.baseUrl}/api/porfiria/evaluar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 [DEBUG] Respuesta HTTP:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ [DEBUG] Error HTTP:', response.status, response.statusText);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const kieResult = await response.json();
      console.log('🎯 [DEBUG] Resultado KIE:', kieResult);

      // Devolver directamente la respuesta del KIE server sin transformaciones
      return {
        success: true,
        raw: kieResult
      };
    } catch (error) {
      console.error('💥 [DEBUG] Error en comunicación con Drools:', error);
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
  async checkHealth(): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/porfiria/health`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      return { ok: true, message: text };
    } catch (error) {
      console.error('Error verificando salud del servidor:', error);
      return { ok: false, message: error instanceof Error ? error.message : 'Error' };
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
      console.log('🔗 [DEBUG] Intentando conectar con servidor Drools...');
      
      // Intentar evaluar directamente con Drools
      const result = await this.evaluateQuestionnaire(patientData, responses);
      
      if (result.success) {
        console.log('✅ [DEBUG] Servidor Drools respondió exitosamente');
        return result;
      } else {
        console.log('⚠️ [DEBUG] Servidor Drools falló, usando lógica de fallback');
        throw new Error(result.error || 'Error del servidor Drools');
      }
    } catch (error) {
      console.warn('❌ [DEBUG] Servidor Drools no disponible, usando lógica de fallback:', error);
      
      // Usar lógica de fallback
      try {
        const recommendation = fallbackLogic();
        console.log('🔄 [DEBUG] Usando lógica de fallback local');
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
