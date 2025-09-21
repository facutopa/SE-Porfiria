'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { 
  HeartIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

import { questionnaireQuestions } from '@/lib/constants/questionnaire-questions';

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

export default function ViewQuestionnairePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Cargar el cuestionario existente
    const loadQuestionnaire = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${params.id}`);
        const data = await response.json();
        
        if (data.questionnaire) {
          setQuestionnaire(data.questionnaire);
          setAnswers(data.questionnaire.answers);
          setSelectedPatient(data.questionnaire.patient);
        } else {
          throw new Error('Cuestionario no encontrado');
        }
      } catch (error) {
        console.error('Error al cargar cuestionario:', error);
        alert('Error al cargar el cuestionario. Por favor, inténtalo de nuevo.');
        router.push('/patients');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestionnaire();
  }, [params.id, router]);

  const currentQuestion = questionnaireQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questionnaireQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

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

  const getRecommendationIcon = (testType: string) => {
    switch (testType) {
      case 'PBG_URINE_TEST':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
      case 'FOLLOW_UP_REQUIRED':
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
      default:
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />
    }
  }

  const getRecommendationColor = (testType: string) => {
    switch (testType) {
      case 'PBG_URINE_TEST':
        return 'border-red-200 bg-red-50'
      case 'FOLLOW_UP_REQUIRED':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cuestionario...</p>
        </div>
      </div>
    )
  }

  if (!selectedPatient || !questionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cuestionario no encontrado</p>
          <Link href="/patients" className="btn-primary mt-4">
            Volver a Pacientes
          </Link>
        </div>
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
                <h1 className="text-xl font-bold text-gray-900">Ver Cuestionario</h1>
                <p className="text-sm text-gray-600">
                  {selectedPatient.firstName} {selectedPatient.lastName} (DNI: {selectedPatient.dni})
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                href={`/questionnaire/edit/${params.id}`}
                className="btn-secondary"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Editar
              </Link>
              <Link href="/patients" className="btn-secondary">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del cuestionario */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha de Evaluación</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(questionnaire.completedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
              <p className="text-lg font-semibold text-gray-900">
                {questionnaire.doctor?.name || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Estado</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completado
              </span>
            </div>
          </div>
        </div>

        {/* Recomendación */}
        {questionnaire.testRecommendation && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recomendación del Sistema</h2>
            <div className={`border-2 rounded-lg p-6 ${getRecommendationColor(questionnaire.testRecommendation)}`}>
              <div className="flex items-center justify-center mb-4">
                {getRecommendationIcon(questionnaire.testRecommendation)}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                {questionnaire.testRecommendation === 'PBG_URINE_TEST' && 'Test de PBG Recomendado'}
                {questionnaire.testRecommendation === 'FOLLOW_UP_REQUIRED' && 'Seguimiento Requerido'}
                {questionnaire.testRecommendation === 'NO_TEST_NEEDED' && 'Sin Indicación de Test'}
              </h3>

              {questionnaire.notes && (
                <p className="text-gray-700 text-center mb-6">
                  {questionnaire.notes}
                </p>
              )}
              
              {/* Mostrar estudios recomendados */}
              {questionnaire.estudiosRecomendados && (
                <div className="mt-6 bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Estudios Recomendados:</h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {JSON.parse(questionnaire.estudiosRecomendados).map((estudio: string, index: number) => (
                      <li key={index}>{estudio}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Mostrar medicamentos contraindicados */}
              {questionnaire.medicamentosContraproducentes && (
                <div className="mt-4 bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medicamentos Contraindicados:</h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {JSON.parse(questionnaire.medicamentosContraproducentes).map((medicamento: string, index: number) => (
                      <li key={index}>{medicamento}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Mostrar información adicional si está disponible */}
              {questionnaire.confidence && (
                <div className="mt-4 bg-white p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Confianza:</span>
                      <span className="ml-2 text-gray-700 capitalize">{questionnaire.confidence}</span>
                    </div>
                    {questionnaire.score && (
                      <div>
                        <span className="font-medium text-gray-900">Puntuación:</span>
                        <span className="ml-2 text-gray-700">{questionnaire.score} puntos</span>
                      </div>
                    )}
                    {questionnaire.tipoPorfiria && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-900">Tipo de Porfiria:</span>
                        <span className="ml-2 text-gray-700">{questionnaire.tipoPorfiria}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
          </div>

          <div className="space-y-4 mb-8">
            <div className={`p-4 border-2 rounded-lg ${
              answers[currentQuestion.id] === 'SI' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full border-2 mr-3 ${
                  answers[currentQuestion.id] === 'SI' 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion.id] === 'SI' && (
                    <div className="h-2 w-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span className="text-gray-900 font-medium">Sí</span>
              </div>
            </div>

            <div className={`p-4 border-2 rounded-lg ${
              answers[currentQuestion.id] === 'NO' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full border-2 mr-3 ${
                  answers[currentQuestion.id] === 'NO' 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion.id] === 'NO' && (
                    <div className="h-2 w-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span className="text-gray-900 font-medium">No</span>
              </div>
            </div>
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
              <div className="flex space-x-3">
                <Link 
                  href={`/questionnaire/edit/${params.id}`}
                  className="btn-primary"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar Cuestionario
                </Link>
                <Link href="/patients" className="btn-secondary">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Volver a Pacientes
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="btn-primary"
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
