'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HeartIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  UserPlusIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    questionnairesCompleted: 0
  })
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [kieStatus, setKieStatus] = useState<{ ok: boolean, message: string } | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Cargar datos del usuario desde la sesión
        const userResponse = await fetch('/api/auth/session')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        }

        // Cargar estadísticas
        const statsResponse = await fetch('/api/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Cargar pacientes recientes
        const patientsResponse = await fetch('/api/patients?limit=3')
        if (patientsResponse.ok) {
          const { patients } = await patientsResponse.json()
          setRecentPatients(patients.map((p: any) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            dni: p.dni,
            lastVisit: new Date(p.updatedAt).toLocaleDateString(),
            status: p.questionnaires?.length > 0 ? 'completed' : 'pending'
          })))
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    let isMounted = true
    let intervalId: any

    const checkHealth = async () => {
      try {
        const res = await fetch('/api/kie/health')
        const ok = res.ok
        const message = await res.text()
        if (isMounted) setKieStatus({ ok, message })
      } catch (e: any) {
        if (isMounted) setKieStatus({ ok: false, message: e?.message || 'Error' })
      }
    }

    // primer chequeo inmediato y luego cada 30s
    checkHealth()
    intervalId = setInterval(checkHealth, 30000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
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
                <h1 className="text-xl font-bold text-gray-900">SE-Porfiria</h1>
                <p className="text-sm text-gray-600">Bienvenido{user?.name ? `, ${user.name}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${kieStatus?.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <span className={`mr-1 h-2 w-2 rounded-full ${kieStatus?.ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {kieStatus ? (kieStatus.ok ? 'KIE server OK' : 'KIE server OFF') : 'KIE server...' }
                </span>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/logout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });

                    if (!response.ok) {
                      throw new Error('Error al cerrar sesión');
                    }

                    router.push('/auth/login');
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error al cerrar sesión');
                  }
                }}
                className="btn-secondary"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
          <div className="card">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-medical-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cuestionarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.questionnairesCompleted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/patients/new" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserPlusIcon className="h-8 w-8 text-primary-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Nuevo Paciente</h3>
                  </div>
                </Link>

                {kieStatus?.ok ? (
                  <Link href="/questionnaire/new" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <DocumentTextIcon className="h-8 w-8 text-medical-600 mr-4" />
                    <div>
                      <h3 className="font-medium text-gray-900">Nuevo Cuestionario</h3>
                    </div>
                  </Link>
                ) : (
                  <div
                    aria-disabled
                    className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                    title="KIE server no disponible. Intenta nuevamente cuando el servicio esté activo."
                  >
                    <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-4" />
                    <div>
                      <h3 className="font-medium">Nuevo Cuestionario</h3>
                    </div>
                  </div>
                )}

                <Link href="/patients" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Ver Pacientes</h3>
                  </div>
                </Link>

                <Link href="/medicamentos" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <BeakerIcon className="h-8 w-8 text-yellow-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Medicamentos</h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pacientes Recientes</h2>
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">DNI: {patient.dni}</p>
                      <p className="text-xs text-gray-500">Última visita: {patient.lastVisit}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/patients" className="text-sm text-primary-600 hover:text-primary-500">
                  Ver todos los pacientes →
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
