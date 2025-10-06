'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { 
  EyeIcon, 
  PencilIcon, 
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/solid'

interface Patient {
  id: string
  name: string
  gender: string
  dni: string
  birthDate: string
  phone: string
  lastVisit: string
  status: string
  questionnaires: Array<{
    id: string
    completedAt: string
    recommendation: {
      testType: 'PBG_URINE_TEST' | 'NO_TEST_NEEDED' | 'FOLLOW_UP_REQUIRED'
      message: string
      estudiosRecomendados: string[]
    }
  }>
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPatient, setDeletingPatient] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error('Error al cargar pacientes');
        }
        const data = await response.json();
        setPatients(data.patients.map((patient: any) => ({
          ...patient,
          name: `${patient.firstName} ${patient.lastName}`,
          birthDate: new Date(patient.birthDate).toLocaleDateString(),
          lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Sin visitas',
          status: patient.isActive ? 'Activo' : 'Inactivo',
          questionnaires: (patient.questionnaires || []).map((q: any) => ({
            ...q,
            completedAt: q.completedAt ? new Date(q.completedAt).toLocaleDateString() : null,
            recommendation: {
              testType: q.testRecommendation || 'NO_TEST_NEEDED',
              message: q.notes || 'Sin notas adicionales',
              estudiosRecomendados: []
            }
          }))
        })));
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar la lista de pacientes');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paciente y todos sus cuestionarios? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingPatient(patientId);
    try {
      const response = await fetch(`/api/patients?id=${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar paciente');
      }

      const result = await response.json();
      
      // Actualizar la lista de pacientes
      setPatients(patients.filter(patient => patient.id !== patientId));
      
      alert(`Paciente eliminado exitosamente. Se eliminaron ${result.deletedQuestionnaires} cuestionarios.`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el paciente: ' + (error as Error).message);
    } finally {
      setDeletingPatient(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }


  const getRecommendationIcon = (testType: string) => {
    switch (testType) {
      case 'PBG_URINE_TEST':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" title="Test Recomendado" />
      case 'FOLLOW_UP_REQUIRED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" title="Seguimiento Requerido" />
      case 'NO_TEST_NEEDED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" title="Sin Indicación de Test" />
      default:
        return null
    }
  }

  const getRecommendationColor = (testType: string) => {
    switch (testType) {
      case 'PBG_URINE_TEST':
        return 'text-red-700 bg-red-50'
      case 'FOLLOW_UP_REQUIRED':
        return 'text-yellow-700 bg-yellow-50'
      case 'NO_TEST_NEEDED':
        return 'text-green-700 bg-green-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  const filteredPatients = patients
    .filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.dni.includes(searchTerm)
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Pacientes</h1>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
              <Link href="/patients/new" className="btn-primary">
                + Nuevo Paciente
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-lg">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Evaluación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const lastQuestionnaire = patient.questionnaires[0]
                return (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lastQuestionnaire ? lastQuestionnaire.completedAt : 'Sin evaluación'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lastQuestionnaire ? (
                        <div className="flex items-center">
                          {getRecommendationIcon(lastQuestionnaire.recommendation.testType)}
                          <span className={`ml-2 text-sm px-2 py-1 rounded-full ${getRecommendationColor(lastQuestionnaire.recommendation.testType)}`}>
                            {lastQuestionnaire.recommendation.message}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin diagnóstico</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {lastQuestionnaire ? (
                          <>
                            <Link 
                              href={`/questionnaire/view/${lastQuestionnaire.id}`}
                              className="text-primary-600 hover:text-primary-900"
                              title="Ver cuestionario"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link 
                              href={`/questionnaire/edit/${lastQuestionnaire.id}`}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Editar cuestionario"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                          </>
                        ) : (
                          <Link 
                            href={`/questionnaire/new?patientId=${patient.id}`}
                            className="text-green-600 hover:text-green-900"
                            title="Nuevo cuestionario"
                          >
                            <DocumentPlusIcon className="h-5 w-5" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          disabled={deletingPatient === patient.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar paciente"
                        >
                          {deletingPatient === patient.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}