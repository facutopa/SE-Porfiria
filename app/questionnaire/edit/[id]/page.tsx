'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditQuestionnairePage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, string>>({})
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Cargar el cuestionario existente
    const loadQuestionnaire = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${params.id}`);
        const data = await response.json();
        
        if (data.questionnaire) {
          setAnswers(data.questionnaire.answers);
          setOriginalAnswers(data.questionnaire.answers);
          setSelectedPatient(data.questionnaire.patient);
        }
      } catch (error) {
        console.error('Error al cargar cuestionario:', error);
        router.push('/patients');
      }
    };
    
    loadQuestionnaire();
  }, [params.id, router]);

  const currentQuestion = questionnaireQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questionnaireQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const hasChanges = JSON.stringify(answers) !== JSON.stringify(originalAnswers)

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

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Actualizar el cuestionario
      const response = await fetch(`/api/questionnaires/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          timestamp: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el cuestionario');
      }

      // Recalcular recomendación
      const patientData = {
        id: selectedPatient.id,
        firstName: selectedPatient.firstName,
        lastName: selectedPatient.lastName,
        dni: selectedPatient.dni,
        age: new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear(),
        gender: selectedPatient.gender as 'M' | 'F',
        familyHistory: answers['familiares'] === 'SI',
        medications: [],
        alcoholConsumption: answers['consumeAlcohol'] === 'SI',
        fastingStatus: answers['ayunoProlongado'] === 'SI'
      };

      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer as string,
        patientId: selectedPatient.id,
        timestamp: new Date()
      }));

      const result = await evaluateWithDrools(patientData, responses);
      
      if (result.success && result.recommendation) {
        setRecommendation({
          test: result.recommendation.testType,
          confidence: result.recommendation.confidence,
          message: result.recommendation.message,
          score: result.recommendation.score,
          criticalSymptoms: result.recommendation.criticalSymptoms,
          reasoning: result.recommendation.reasoning,
          riskFactors: result.recommendation.riskFactors,
          estudiosRecomendados: result.recommendation.estudiosRecomendados,
          medicamentosContraproducentes: result.recommendation.medicamentosContraproducentes
        });
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error al actualizar cuestionario:', error)
    } finally {
      setIsLoading(false)
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
                  <h1 className="text-xl font-bold text-gray-900">Resultados Actualizados</h1>
                  <p className="text-sm text-gray-600">Evaluación modificada</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Evaluación Actualizada
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
                    {recommendation.estudiosRecomendados.map((estudio, index) => (
                      <li key={index}>{estudio}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.medicamentosContraproducentes && recommendation.medicamentosContraproducentes.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medicamentos Contraindicados:</h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {recommendation.medicamentosContraproducentes.map((medicamento, index) => (
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
              <button 
                onClick={() => setShowResults(false)}
                className="btn-primary"
              >
                Seguir Editando
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!selectedPatient) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editar Cuestionario</h1>
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
                disabled={isLoading || !answers[currentQuestion.id] || !hasChanges}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : 'Actualizar Evaluación'}
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
