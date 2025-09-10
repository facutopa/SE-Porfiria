'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  HeartIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

// Simulamos datos de pacientes
const mockPatients = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'González',
    dni: '12345678',
    birthDate: '1985-03-15',
    gender: 'F',
    phone: '+54 11 1234-5678',
    lastVisit: '2024-01-15',
    status: 'active',
    questionnaires: 2
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    dni: '87654321',
    birthDate: '1978-07-22',
    gender: 'M',
    phone: '+54 11 8765-4321',
    lastVisit: '2024-01-14',
    status: 'active',
    questionnaires: 1
  },
  {
    id: '3',
    firstName: 'Ana',
    lastName: 'Martínez',
    dni: '11223344',
    birthDate: '1992-11-08',
    gender: 'F',
    phone: '+54 11 1122-3344',
    lastVisit: '2024-01-13',
    status: 'active',
    questionnaires: 3
  },
  {
    id: '4',
    firstName: 'Luis',
    lastName: 'Fernández',
    dni: '55667788',
    birthDate: '1980-05-30',
    gender: 'M',
    phone: '+54 11 5566-7788',
    lastVisit: '2024-01-10',
    status: 'inactive',
    questionnaires: 1
  }
]

export default function PatientsPage() {
  const [patients, setPatients] = useState(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.dni.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      default:
        return 'Desconocido'
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
                <h1 className="text-xl font-bold text-gray-900">Gestión de Pacientes</h1>
                <p className="text-sm text-gray-600">Administra tus pacientes y sus historiales</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
              <Link href="/patients/new" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Paciente
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="card">
          <div className="overflow-x-auto">
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
                    Fecha de Nacimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuestionarios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.birthDate).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.lastVisit).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.questionnaires}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/patients/${patient.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/questionnaire/new?patientId=${patient.id}`}
                          className="text-medical-600 hover:text-medical-900"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Comienza registrando tu primer paciente.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <div className="mt-6">
                  <Link href="/patients/new" className="btn-primary">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuevo Paciente
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
