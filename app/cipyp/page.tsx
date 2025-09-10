'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  HeartIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

// Simulamos datos para el dashboard de CIPYP
const mockStats = {
  totalPatients: 156,
  totalQuestionnaires: 234,
  testsRecommended: 89,
  testsCompleted: 67,
  positiveResults: 12,
  pendingFollowUps: 22
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'questionnaire',
    patient: 'María González',
    doctor: 'Dr. Juan Pérez',
    date: '2024-01-15',
    status: 'completed',
    recommendation: 'PBG_URINE_TEST'
  },
  {
    id: '2',
    type: 'test_result',
    patient: 'Carlos Rodríguez',
    doctor: 'Dr. Ana Martínez',
    date: '2024-01-14',
    status: 'positive',
    recommendation: 'PBG_URINE_TEST'
  },
  {
    id: '3',
    type: 'questionnaire',
    patient: 'Luis Fernández',
    doctor: 'Dr. Pedro García',
    date: '2024-01-13',
    status: 'completed',
    recommendation: 'FOLLOW_UP_REQUIRED'
  }
]

const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Juan Pérez',
    hospital: 'Hospital General',
    patients: 24,
    questionnaires: 18,
    testsRecommended: 12
  },
  {
    id: '2',
    name: 'Dr. Ana Martínez',
    hospital: 'Clínica Privada',
    patients: 18,
    questionnaires: 15,
    testsRecommended: 8
  },
  {
    id: '3',
    name: 'Dr. Pedro García',
    hospital: 'Hospital Universitario',
    patients: 32,
    questionnaires: 28,
    testsRecommended: 15
  }
]

export default function CIPYPDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'PBG_URINE_TEST':
        return 'bg-red-100 text-red-800'
      case 'FOLLOW_UP_REQUIRED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'PBG_URINE_TEST':
        return 'Test PBG'
      case 'FOLLOW_UP_REQUIRED':
        return 'Seguimiento'
      default:
        return 'Sin test'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard CIPYP</h1>
                <p className="text-sm text-gray-600">Centro de Investigación de Porfiria y Porfirina</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="input-field"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
              <button className="btn-secondary">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-medical-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cuestionarios</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalQuestionnaires}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Recomendados</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.testsRecommended}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Completados</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.testsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resultados Positivos</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.positiveResults}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Seguimientos</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.pendingFollowUps}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
                <Link href="/cipyp/activity" className="text-sm text-primary-600 hover:text-primary-500">
                  Ver todo →
                </Link>
              </div>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'questionnaire' ? 'Cuestionario completado' : 'Resultado de test'}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationBadge(activity.recommendation)}`}>
                          {getRecommendationText(activity.recommendation)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Paciente: {activity.patient} • Doctor: {activity.doctor}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doctors Performance */}
          <div>
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Médicos Activos</h2>
              <div className="space-y-4">
                {mockDoctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <span className="text-sm text-gray-600">{doctor.hospital}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{doctor.patients}</p>
                        <p className="text-gray-600">Pacientes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{doctor.questionnaires}</p>
                        <p className="text-gray-600">Cuestionarios</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{doctor.testsRecommended}</p>
                        <p className="text-gray-600">Tests</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Recomendaciones</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Test PBG Recomendado</span>
                </div>
                <span className="text-sm font-medium text-gray-900">89 casos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Seguimiento Requerido</span>
                </div>
                <span className="text-sm font-medium text-gray-900">45 casos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Sin Test Necesario</span>
                </div>
                <span className="text-sm font-medium text-gray-900">100 casos</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Tasa de Completitud de Tests</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round((mockStats.testsCompleted / mockStats.testsRecommended) * 100)}%
              </div>
              <p className="text-sm text-gray-600">
                {mockStats.testsCompleted} de {mockStats.testsRecommended} tests completados
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(mockStats.testsCompleted / mockStats.testsRecommended) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/cipyp/patients" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Ver Todos los Pacientes</h3>
                  <p className="text-sm text-gray-600">Lista completa</p>
                </div>
              </Link>

              <Link href="/cipyp/questionnaires" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <DocumentTextIcon className="h-8 w-8 text-medical-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Cuestionarios</h3>
                  <p className="text-sm text-gray-600">Ver todos</p>
                </div>
              </Link>

              <Link href="/cipyp/reports" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ChartBarIcon className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Reportes</h3>
                  <p className="text-sm text-gray-600">Generar reportes</p>
                </div>
              </Link>

              <Link href="/cipyp/doctors" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Médicos</h3>
                  <p className="text-sm text-gray-600">Gestionar usuarios</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
