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

// Simulamos las preguntas del cuestionario basadas en criterios de Porfiria
const questionnaireQuestions = [
  {
    id: '1',
    category: 'sintomas_generales',
    text: '¿El paciente presenta dolor abdominal severo?',
    type: 'YES_NO',
    required: true,
    weight: 3
  },
  {
    id: '2',
    category: 'sintomas_generales',
    text: '¿El dolor abdominal se localiza principalmente en el cuadrante superior derecho?',
    type: 'YES_NO',
    required: false,
    weight: 2,
    dependsOn: '1'
  },
  {
    id: '3',
    category: 'sintomas_neurologicos',
    text: '¿El paciente presenta debilidad muscular?',
    type: 'YES_NO',
    required: true,
    weight: 2
  },
  {
    id: '4',
    category: 'sintomas_neurologicos',
    text: '¿La debilidad muscular afecta principalmente las extremidades superiores?',
    type: 'YES_NO',
    required: false,
    weight: 1,
    dependsOn: '3'
  },
  {
    id: '5',
    category: 'sintomas_cutaneos',
    text: '¿El paciente presenta lesiones cutáneas o fotosensibilidad?',
    type: 'YES_NO',
    required: true,
    weight: 2
  },
  {
    id: '6',
    category: 'sintomas_cutaneos',
    text: '¿Las lesiones aparecen principalmente en áreas expuestas al sol?',
    type: 'YES_NO',
    required: false,
    weight: 1,
    dependsOn: '5'
  },
  {
    id: '7',
    category: 'sintomas_psiquiatricos',
    text: '¿El paciente presenta cambios en el comportamiento o estado mental?',
    type: 'YES_NO',
    required: true,
    weight: 2
  },
  {
    id: '8',
    category: 'sintomas_psiquiatricos',
    text: '¿Se observan síntomas de ansiedad, confusión o alucinaciones?',
    type: 'YES_NO',
    required: false,
    weight: 1,
    dependsOn: '7'
  },
  {
    id: '9',
    category: 'antecedentes',
    text: '¿El paciente tiene antecedentes familiares de Porfiria?',
    type: 'YES_NO',
    required: true,
    weight: 3
  },
  {
    id: '10',
    category: 'antecedentes',
    text: '¿El paciente está tomando algún medicamento que pueda desencadenar Porfiria?',
    type: 'YES_NO',
    required: true,
    weight: 2
  },
  {
    id: '11',
    category: 'antecedentes',
    text: '¿El paciente consume alcohol regularmente?',
    type: 'YES_NO',
    required: true,
    weight: 1
  },
  {
    id: '12',
    category: 'antecedentes',
    text: '¿El paciente está en ayuno prolongado o dieta restrictiva?',
    type: 'YES_NO',
    required: true,
    weight: 1
  },
  {
    id: '13',
    category: 'sintomas_generales',
    text: '¿El paciente presenta náuseas y vómitos?',
    type: 'YES_NO',
    required: true,
    weight: 1
  },
  {
    id: '14',
    category: 'sintomas_generales',
    text: '¿El paciente presenta estreñimiento?',
    type: 'YES_NO',
    required: true,
    weight: 1
  },
  {
    id: '15',
    category: 'sintomas_neurologicos',
    text: '¿El paciente presenta convulsiones?',
    type: 'YES_NO',
    required: true,
    weight: 2
  }
]

import { DroolsEngine } from '@/lib/drools-engine';

export default function NewQuestionnairePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [patientId, setPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Simulamos lista de pacientes
  const mockPatients = [
    { id: '1', name: 'María González', dni: '12345678' },
    { id: '2', name: 'Carlos Rodríguez', dni: '87654321' },
    { id: '3', name: 'Ana Martínez', dni: '11223344' }
  ]

  useEffect(() => {
    const patientIdParam = searchParams.get('patientId')
    if (patientIdParam) {
      setPatientId(patientIdParam)
      const patient = mockPatients.find(p => p.id === patientIdParam)
      if (patient) {
        setSelectedPatient(patient)
      }
    }
  }, [searchParams])

  const currentQuestion = questionnaireQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questionnaireQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

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

  const calculateRecommendationFallback = () => {
    let score = 0
    let criticalSymptoms = 0

    // Calcular puntuación basada en respuestas
    questionnaireQuestions.forEach(question => {
      const answer = answers[question.id]
      if (answer === 'YES') {
        score += question.weight
        
        // Síntomas críticos
        if (question.category === 'sintomas_generales' && question.id === '1') {
          criticalSymptoms++
        }
        if (question.category === 'sintomas_neurologicos' && question.id === '3') {
          criticalSymptoms++
        }
        if (question.category === 'antecedentes' && question.id === '9') {
          criticalSymptoms++
        }
      }
    })

    // Determinar recomendación
    let recommendation = {
      test: 'NO_TEST_NEEDED',
      confidence: 'low',
      message: '',
      score: score,
      criticalSymptoms: criticalSymptoms
    }

    if (score >= 8 || criticalSymptoms >= 2) {
      recommendation = {
        test: 'PBG_URINE_TEST',
        confidence: 'high',
        message: 'Se recomienda realizar test de PBG en orina para descartar Porfiria Aguda.',
        score: score,
        criticalSymptoms: criticalSymptoms
      }
    } else if (score >= 5) {
      recommendation = {
        test: 'FOLLOW_UP_REQUIRED',
        confidence: 'medium',
        message: 'Se recomienda seguimiento clínico y considerar test de PBG si los síntomas persisten.',
        score: score,
        criticalSymptoms: criticalSymptoms
      }
    } else {
      recommendation = {
        test: 'NO_TEST_NEEDED',
        confidence: 'low',
        message: 'Los síntomas no sugieren Porfiria. Continuar con evaluación clínica general.',
        score: score,
        criticalSymptoms: criticalSymptoms
      }
    }

    return recommendation
  }

  const calculateRecommendation = async () => {
    try {
      const droolsEngine = new DroolsEngine();
      
      // Preparar datos del paciente
      const patientData = {
        id: selectedPatient.id,
        firstName: selectedPatient.name.split(' ')[0],
        lastName: selectedPatient.name.split(' ').slice(1).join(' '),
        dni: selectedPatient.dni,
        age: 35, // Calcular basado en fecha de nacimiento
        gender: 'F', // Obtener del perfil del paciente
        familyHistory: answers['9'] === 'YES',
        medications: [], // Obtener de historial médico
        alcoholConsumption: answers['11'] === 'YES',
        fastingStatus: answers['12'] === 'YES'
      };

      // Preparar respuestas
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        patientId: selectedPatient.id,
        timestamp: new Date()
      }));

      // Evaluar con Drools
      const result = await droolsEngine.evaluateQuestionnaire(patientData, responses);
      
      if (result.success && result.recommendations) {
        return {
          test: result.recommendations.testType,
          confidence: result.recommendations.confidence,
          message: result.recommendations.message,
          score: result.recommendations.score,
          criticalSymptoms: result.recommendations.criticalSymptoms
        };
      } else {
        // Fallback a lógica original si Drools falla
        return calculateRecommendationFallback();
      }
    } catch (error) {
      console.error('Error en evaluación con Drools:', error);
      return calculateRecommendationFallback();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Simular guardado del cuestionario
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const recommendation = await calculateRecommendation()
      setRecommendation(recommendation)
      setShowResults(true)
    } catch (error) {
      console.error('Error al guardar cuestionario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendationIcon = (test: string) => {
    switch (test) {
      case 'PBG_URINE_TEST':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
      case 'FOLLOW_UP_REQUIRED':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
      default:
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />
    }
  }

  const getRecommendationColor = (test: string) => {
    switch (test) {
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

            <div className={`border-2 rounded-lg p-6 ${getRecommendationColor(recommendation.test)}`}>
              <div className="flex items-center justify-center mb-4">
                {getRecommendationIcon(recommendation.test)}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                {recommendation.test === 'PBG_URINE_TEST' && 'Test de PBG Recomendado'}
                {recommendation.test === 'FOLLOW_UP_REQUIRED' && 'Seguimiento Requerido'}
                {recommendation.test === 'NO_TEST_NEEDED' && 'Sin Indicación de Test'}
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

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Importante:</strong> Esta recomendación es solo orientativa y no reemplaza el juicio clínico profesional.
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <Link href="/patients" className="btn-secondary">
                Ver Pacientes
              </Link>
              <Link href="/questionnaire/new" className="btn-primary">
                Nuevo Cuestionario
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Nuevo Cuestionario</h1>
                  <p className="text-sm text-gray-600">Selecciona un paciente</p>
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
              {mockPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient)
                    setPatientId(patient.id)
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-600">DNI: {patient.dni}</div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
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
                  {selectedPatient.name} (DNI: {selectedPatient.dni})
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
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {currentQuestion.category.replace('_', ' ').toUpperCase()}
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
                value="YES"
                checked={answers[currentQuestion.id] === 'YES'}
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
