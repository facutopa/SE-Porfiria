'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  HeartIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import { questionnaireQuestions } from '@/lib/constants/questionnaire-questions';
import { droolsClient, evaluateWithDrools, type DroolsRecommendation } from '@/lib/drools-client';

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'sintomas_cutaneos':
      return 'bg-blue-100 text-blue-800';
    case 'sintomas_agudos':
      return 'bg-red-100 text-red-800';
    case 'anamnesis':
      return 'bg-green-100 text-green-800';
    case 'otros_datos_medicos':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function NewQuestionnairePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [patientId, setPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  // Estado para la lista de pacientes
  const [patients, setPatients] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadError, setLoadError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentQuestion = questionnaireQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questionnaireQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  useEffect(() => {
    const patientIdParam = searchParams.get('patientId');
    
    const loadPatients = async () => {
      if (!patientIdParam) {
        setLoadingPatients(true);
        setLoadError('');
        try {
          const response = await fetch('/api/patients');
          if (!response.ok) {
            throw new Error('Error al cargar la lista de pacientes');
          }
          const data = await response.json();
          
          // Filtrar solo pacientes que no tienen cuestionario completo
          const patientsWithoutQuestionnaire = [];
          for (const patient of data.patients) {
            try {
              const questionnaireResponse = await fetch(`/api/questionnaires?patientId=${patient.id}`);
              if (questionnaireResponse.ok) {
                const questionnaireData = await questionnaireResponse.json();
                // Solo incluir si NO tiene cuestionario
                if (!questionnaireData.questionnaire) {
                  patientsWithoutQuestionnaire.push(patient);
                }
              } else {
                // Si hay error al verificar, incluir el paciente (por seguridad)
                patientsWithoutQuestionnaire.push(patient);
              }
            } catch (error) {
              console.warn(`Error verificando cuestionario para paciente ${patient.id}:`, error);
              // En caso de error, incluir el paciente
              patientsWithoutQuestionnaire.push(patient);
            }
          }
          
          setPatients(patientsWithoutQuestionnaire);
        } catch (error) {
          console.error('Error:', error);
          setLoadError('Error al cargar la lista de pacientes');
        } finally {
          setLoadingPatients(false);
        }
        return;
      }

      try {
        // Primero obtener los datos del paciente
        const patientResponse = await fetch(`/api/patients/${patientIdParam}`);
        if (!patientResponse.ok) {
          throw new Error('Error al cargar datos del paciente');
        }
        const patientData = await patientResponse.json();

        // Verificar si ya existe un cuestionario
        const questionnaireResponse = await fetch(`/api/questionnaires?patientId=${patientIdParam}`);
        if (!questionnaireResponse.ok) {
          console.warn('Error al verificar cuestionario existente:', questionnaireResponse.status);
        }
        const questionnaireData = await questionnaireResponse.json();
        
        if (questionnaireData.questionnaire) {
          // Si existe, redirigir a la página de edición
          router.push(`/questionnaire/edit/${questionnaireData.questionnaire.id}?patientId=${patientIdParam}`);
        } else {
          // Si no existe, establecer el paciente seleccionado
          setPatientId(patientIdParam);
          setSelectedPatient(patientData.patient);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoadError('Error al cargar los datos del paciente');
        setTimeout(() => router.push('/patients'), 2000);
      }
    };
    
    loadPatients();
  }, [searchParams, router]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questionnaireQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateRecommendationFallback = (): DroolsRecommendation => {
    let score = 0
    let criticalSymptoms = 0

    // Contadores por categoría para síntomas críticos
    let cutaneousScore = 0
    let acuteScore = 0
    let anamnesisScore = 0

    // Calcular puntuación basada en respuestas
    questionnaireQuestions.forEach(question => {
      const answer = answers[question.id]
      if (answer === 'SI') { // Cambiado de 'YES' a 'SI'
        score += question.weight || 0
        
        // Acumular por categoría para síntomas críticos
        if (question.category === 'sintomas_cutaneos') {
          cutaneousScore += question.weight || 0
        } else if (question.category === 'sintomas_agudos') {
          acuteScore += question.weight || 0
        } else if (question.category === 'anamnesis') {
          anamnesisScore += question.weight || 0
        }
      }
    })

    // Calcular síntomas críticos basado en puntuación por categoría
    if (cutaneousScore >= 22) { // Umbral para síntomas cutáneos
      criticalSymptoms++
    }
    if (acuteScore >= 36) { // Umbral para síntomas agudos
      criticalSymptoms += 2
    }
    if (anamnesisScore >= 12) { // Umbral para factores ambientales
      criticalSymptoms++
    }

    // Debug logs
    console.log('Cálculo de puntuación:', {
      totalScore: score,
      cutaneousScore,
      acuteScore,
      anamnesisScore,
      criticalSymptoms,
      answers: Object.entries(answers).filter(([_, answer]) => answer === 'SI')
    });

    // Determinar recomendación
    let recommendation: DroolsRecommendation = {
      testType: 'NO_TEST_NEEDED',
      confidence: 'low',
      message: '',
      score: score,
      criticalSymptoms: criticalSymptoms,
      reasoning: [] as string[],
      riskFactors: [] as string[],
      estudiosRecomendados: [] as string[], 
      contraindicatedMedications: [] as string[]
    }

    if (score >= 36 || criticalSymptoms >= 2) {
      recommendation = {
        testType: 'PBG_URINE_TEST',
        confidence: 'high',
        message: 'Se recomienda realizar estudios urgentes para Porfiria Aguda.',
        score: score,
        criticalSymptoms: criticalSymptoms,
        reasoning: ['Puntuación alta o síntomas críticos detectados'],
        riskFactors: [],
        estudiosRecomendados: [
          'PBG (Porfobilinógeno)',
          'IPP (Isómeros de Porfirinas)',
          'ALA (Ácido Aminolevulínico)',
          'PTO (Porfirinas Totales en Orina)'
        ],
        medicamentosContraproducentes: [
          'Barbitúricos',
          'Sulfonamidas',
          'Estrógenos',
          'Progestágenos',
          'Anticonvulsivantes'
        ]
      }
    } else if (score >= 22) {
      recommendation = {
        testType: 'PBG_URINE_TEST',
        confidence: 'high',
        message: 'Se recomienda realizar estudios para Porfiria Cutánea.',
        score: score,
        criticalSymptoms: criticalSymptoms,
        reasoning: ['Síntomas cutáneos significativos'],
        riskFactors: [],
        estudiosRecomendados: [
          'IPP (Isómeros de Porfirinas)',
          'PTO (Porfirinas Totales en Orina)',
          'CRO (Coproporfirinas)',
          'PBG (Porfobilinógeno)'
        ],
        medicamentosContraproducentes: [
          'Tetraciclinas',
          'Nalidíxico',
          'Furosemida',
          'Sulfonilureas',
          'Estrógenos'
        ]
      }
    } else {
      recommendation = {
        testType: 'NO_TEST_NEEDED',
        confidence: 'low',
        message: 'Los síntomas no sugieren Porfiria. Continuar con evaluación clínica general.',
        score: score,
        criticalSymptoms: criticalSymptoms,
        reasoning: ['Puntuación baja sin síntomas críticos'],
        riskFactors: [],
        estudiosRecomendados: [],
        medicamentosContraproducentes: []
      }
    }

    return recommendation
  }

  const calculateRecommendation = async () => {
    console.log('🧠 [DEBUG] Iniciando cálculo de recomendación...');
    console.log('👤 [DEBUG] Paciente seleccionado:', selectedPatient);
    console.log('📋 [DEBUG] Respuestas del cuestionario:', answers);
    
    try {
      const patientData = {
        id: selectedPatient.id,
        firstName: selectedPatient.name.split(' ')[0],
        lastName: selectedPatient.name.split(' ').slice(1).join(' '),
        dni: selectedPatient.dni,
        age: 35,
        gender: 'F' as const,
        familyHistory: answers['familiares'] === 'SI',
        medications: [],
        alcoholConsumption: answers['consumeAlcohol'] === 'SI',
        fastingStatus: answers['ayunoProlongado'] === 'SI'
      };

      console.log('👤 [DEBUG] Datos del paciente preparados:', patientData);

      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        patientId: selectedPatient.id,
        timestamp: new Date()
      }));

      console.log('📝 [DEBUG] Respuestas formateadas para Drools:', responses);
      console.log('🔗 [DEBUG] Llamando a evaluateWithDrools...');

      const result = await evaluateWithDrools(
        patientData, 
        responses, 
        calculateRecommendationFallback
      );
      
      console.log('🎯 [DEBUG] Resultado de Drools:', result);
      
      if (result.success && result.recommendation) {
        console.log('✅ [DEBUG] Recomendación exitosa de Drools:', result.recommendation);
        return {
          testType: result.recommendation.testType,
          confidence: result.recommendation.confidence,
          message: result.recommendation.message,
          score: result.recommendation.score,
          criticalSymptoms: result.recommendation.criticalSymptoms,
          reasoning: result.recommendation.reasoning,
          riskFactors: result.recommendation.riskFactors,
          recommendedTests: result.recommendation.recommendedTests,
          contraindicatedMedications: result.recommendation.contraindicatedMedications
        };
      } else {
        console.log('⚠️ [DEBUG] Drools falló, usando lógica de fallback');
        return calculateRecommendationFallback();
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error en evaluación con Drools:', error);
      console.log('🔄 [DEBUG] Usando lógica de fallback debido al error');
      return calculateRecommendationFallback();
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 [DEBUG] Iniciando envío del cuestionario...');
    console.log('📋 [DEBUG] Respuestas del usuario:', answers);
    console.log('👤 [DEBUG] Paciente seleccionado:', selectedPatient);
    
    setIsLoading(true)
    
    try {
      console.log('🧠 [DEBUG] Paso 1: Calculando recomendación...');
      // Primero calcular la recomendación
      const recommendation = await calculateRecommendation();
      console.log('✅ [DEBUG] Recomendación calculada:', recommendation);
      
      console.log('💾 [DEBUG] Paso 2: Preparando datos para guardar...');
      // Luego guardar el cuestionario con la recomendación
      const questionnaireData = {
        patientId: selectedPatient.id,
        answers,
        recommendation,
        timestamp: new Date()
      };

      console.log('📦 [DEBUG] Datos del cuestionario a guardar:', questionnaireData);
      console.log('🔗 [DEBUG] Paso 3: Enviando a /api/questionnaires...');

      const saveResponse = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionnaireData)
      });

      console.log('📡 [DEBUG] Respuesta del servidor:', saveResponse.status, saveResponse.statusText);

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        console.error('❌ [DEBUG] Error del servidor:', error);
        throw new Error(error.error || 'Error al guardar el cuestionario');
      }

      console.log('✅ [DEBUG] Cuestionario guardado exitosamente');
      console.log('🎯 [DEBUG] Paso 4: Mostrando resultados...');
      
      setRecommendation(recommendation);
      setShowResults(true);
      
      console.log('🎉 [DEBUG] Proceso completado exitosamente');
    } catch (error) {
      console.error('❌ [DEBUG] Error al guardar cuestionario:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el cuestionario');
    } finally {
      console.log('🏁 [DEBUG] Finalizando proceso...');
      setIsLoading(false);
    }
  }

  const getRecommendationIcon = (recommendation: DroolsRecommendation) => {
    switch (recommendation.testType) {
      case 'PBG_URINE_TEST':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
      case 'FOLLOW_UP_REQUIRED':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
      default:
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />
    }
  }

  const getRecommendationColor = (recommendation: DroolsRecommendation) => {
    switch (recommendation.testType) {
      case 'PBG_URINE_TEST':
        return 'border-red-200 bg-red-50'
      case 'FOLLOW_UP_REQUIRED':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  if (showResults && recommendation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Resultados del Cuestionario</h1>
                  <p className="text-sm text-gray-600">Evaluación completada</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Evaluación Completada
              </h2>
              <p className="text-gray-600">
                Paciente: {selectedPatient?.name} (DNI: {selectedPatient?.dni})
              </p>
            </div>

            <div className={`border-2 rounded-lg p-6 ${getRecommendationColor(recommendation)}`}>
              <div className="flex items-center justify-center mb-4">
                {getRecommendationIcon(recommendation)}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                {recommendation.testType === 'PBG_URINE_TEST' && 'Test de PBG Recomendado'}
                {recommendation.testType === 'FOLLOW_UP_REQUIRED' && 'Seguimiento Requerido'}
                {recommendation.testType === 'NO_TEST_NEEDED' && 'Sin Indicación de Test'}
              </h3>

              <p className="text-gray-700 text-center mb-6">
                {recommendation.message}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Puntuación Total</h4>
                  <p className="text-2xl font-bold text-primary-600">{recommendation.score}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Síntomas Críticos</h4>
                  <p className="text-2xl font-bold text-red-600">{recommendation.criticalSymptoms}</p>
                </div>
              </div>

              {recommendation.estudiosRecomendados && recommendation.estudiosRecomendados.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Estudios Recomendados:</h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {recommendation.estudiosRecomendados.map((estudio: string, index: number) => (
                      <li key={index}>{estudio}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.medicamentosContraproducentes && recommendation.medicamentosContraproducentes.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medicamentos Contraindicados:</h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {recommendation.medicamentosContraproducentes.map((medicamento: string, index: number) => (
                      <li key={index}>{medicamento}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Importante:</strong> Esta recomendación es solo orientativa y no reemplaza el juicio clínico profesional.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <Link href="/patients" className="btn-secondary">
                Ver Pacientes
              </Link>
              <Link 
                href={`/questionnaire/edit/${selectedPatient.id}`} 
                className="btn-primary"
              >
                Editar Respuestas
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!selectedPatient) {
    // Si no hay patientId en la URL, mostrar la selección de paciente
    if (!searchParams.get('patientId')) {
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Nuevo Cuestionario</h1>
                  </div>
                </div>
                <Link href="/patients" className="btn-secondary">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Volver
                </Link>
              </div>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Seleccionar Paciente</h2>
              <div className="space-y-3">
                {loadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                    {loadError}
                  </div>
                )}

                {loadingPatients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando pacientes...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-2">No hay pacientes disponibles para completar cuestionario.</p>
                    <p className="text-sm text-gray-500 mb-6">Todos los pacientes ya tienen un cuestionario completo.</p>
                    <Link href="/patients" className="btn-primary">
                      Ver todos los pacientes
                    </Link>
                  </div>
                ) : patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient)
                      setPatientId(patient.id)
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                    <div className="text-sm text-gray-600">DNI: {patient.dni}</div>
                    <div className="text-xs text-gray-500">
                      {patient.updatedAt ? `Última visita: ${new Date(patient.updatedAt).toLocaleDateString()}` : 'Sin visitas previas'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      );
    }
    
    // Si hay patientId pero aún no se cargó el paciente, mostrar loading
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cuestionario de Evaluación</h1>
                <p className="text-sm text-gray-600">
                  {selectedPatient.firstName} {selectedPatient.lastName} (DNI: {selectedPatient.dni})
                </p>
              </div>
            </div>
            <Link href="/patients" className="btn-secondary">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Cancelar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {currentQuestionIndex + 1} de {questionnaireQuestions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questionnaireQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questionnaireQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="card">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getCategoryStyle(currentQuestion.category)}`}>
                {currentQuestion.category === 'otros_datos_medicos' 
                  ? 'OTROS DATOS MÉDICOS'
                  : currentQuestion.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            {currentQuestion.required && (
              <p className="text-sm text-red-600">* Campo obligatorio</p>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name={`question_${currentQuestion.id}`}
                value="SI"
                checked={answers[currentQuestion.id] === 'SI'}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-gray-900">Sí</span>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name={`question_${currentQuestion.id}`}
                value="NO"
                checked={answers[currentQuestion.id] === 'NO'}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-3 text-gray-900">No</span>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={isFirstQuestion}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Anterior
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !answers[currentQuestion.id]}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : 'Finalizar Evaluación'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                disabled={!answers[currentQuestion.id]}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}