'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { HeartIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface Medicine {
  class: string
  type: string
  genericName: string
  brandName: string
  conclusion: string
  references: string
}

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterConclusion, setFilterConclusion] = useState('')
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([])
  const [uniqueConclusions, setUniqueConclusions] = useState<string[]>([])
  const [totalInDatabase, setTotalInDatabase] = useState<number>(0)

  // Cargar todos los medicamentos una sola vez al inicio
  const loadAllMedicines = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/medicines')
      if (!response.ok) {
        throw new Error('Error al cargar medicamentos')
      }
      
      const data = await response.json()
      setAllMedicines(data.medicines)
      setUniqueClasses(data.filters.classes)
      setUniqueConclusions(data.filters.conclusions)
      setTotalInDatabase(data.totalInDatabase || data.medicines.length)
    } catch (error) {
      console.error('Error:', error)
      setError('Error al cargar la base de datos de medicamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllMedicines()
  }, [])

  // Filtrado en tiempo real en el lado del cliente
  const filteredMedicines = useMemo(() => {
    let filtered = allMedicines

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(medicine =>
        medicine.genericName.toLowerCase().includes(searchLower) ||
        medicine.brandName.toLowerCase().includes(searchLower) ||
        medicine.class.toLowerCase().includes(searchLower) ||
        medicine.type.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por clase
    if (filterClass) {
      filtered = filtered.filter(medicine => medicine.class === filterClass)
    }

    // Filtro por conclusión
    if (filterConclusion) {
      filtered = filtered.filter(medicine => medicine.conclusion === filterConclusion)
    }

    return filtered
  }, [allMedicines, searchTerm, filterClass, filterConclusion])

  const getConclusionIcon = (conclusion: string) => {
    switch (conclusion) {
      case 'OK!':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" title="Muy Seguro" />
      case 'OK?':
        return <QuestionMarkCircleIcon className="h-5 w-5 text-yellow-600" title="Probablemente Seguro" />
      case 'BAD?':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" title="Probablemente Inseguro" />
      case 'BAD!':
        return <XCircleIcon className="h-5 w-5 text-red-600" title="Muy Inseguro" />
      case 'NO INFO':
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" title="Sin Información" />
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-600" title="Sin Información" />
    }
  }

  const getConclusionColor = (conclusion: string) => {
    switch (conclusion) {
      case 'OK!':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'OK?':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'BAD?':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'BAD!':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'NO INFO':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getConclusionText = (conclusion: string) => {
    switch (conclusion) {
      case 'OK!':
        return 'Muy Seguro'
      case 'OK?':
        return 'Probablemente Seguro'
      case 'BAD?':
        return 'Probablemente Inseguro'
      case 'BAD!':
        return 'Muy Inseguro'
      case 'NO INFO':
        return 'Sin Información'
      default:
        return 'Sin Información'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando base de datos de medicamentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => loadAllMedicines()} 
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
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
                <h1 className="text-xl font-bold text-gray-900">Base de Datos de Medicamentos</h1>
                <p className="text-sm text-gray-600">Seguridad de medicamentos para pacientes con Porfiria</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar medicamento
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre genérico, marca, clase o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filtro por Clase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clase de medicamento
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las clases</option>
                {uniqueClasses.map((cls: string) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Conclusión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de seguridad
              </label>
              <select
                value={filterConclusion}
                onChange={(e) => setFilterConclusion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los niveles</option>
                {uniqueConclusions.map((conclusion: string) => (
                  <option key={conclusion} value={conclusion}>
                    {getConclusionText(conclusion)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Información de la Fuente */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Fuente de Información</h3>
          <p className="text-sm text-gray-600 mb-2">
            Esta base de datos está basada en la información oficial de la <a href="https://www.porphyriafoundation.org/drugsafety_listall.cfm" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 underline">Porphyria Foundation Drug Safety Database</a>, que contiene {totalInDatabase || 723} registros de medicamentos evaluados para su seguridad en pacientes con Porfiria.
          </p>
          <p className="text-xs text-gray-500 mb-3">
            <strong>Nota:</strong> Esta información es solo para referencia y no debe reemplazar el juicio clínico profesional.
          </p>
          
          {/* Botón para base de datos extendida */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div>
              <p className="text-sm text-blue-800 font-medium">¿Necesitas más medicamentos?</p>
              <p className="text-xs text-blue-600">Accede a esta base de datos extendida.</p>
            </div>
            <a
              href="https://porphyriadrugs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              PorphyriaDrugs.com
            </a>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Leyenda de Seguridad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700">OK! - Muy Seguro</span>
            </div>
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-yellow-700">OK? - Probablemente Seguro</span>
            </div>
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-orange-700">BAD? - Probablemente Inseguro</span>
            </div>
            <div className="flex items-center">
              <XCircleIcon className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-red-700">BAD! - Muy Inseguro</span>
            </div>
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-gray-700">NO INFO - Sin Información</span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Resultados ({filteredMedicines.length} medicamentos encontrados)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seguridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencias
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((medicine: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {medicine.genericName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {medicine.brandName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine.type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getConclusionIcon(medicine.conclusion)}
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full border ${getConclusionColor(medicine.conclusion)}`}>
                          {getConclusionText(medicine.conclusion)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={medicine.references}>
                        {medicine.references || 'Sin referencias'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron medicamentos</h3>
            <p className="text-gray-500 mb-6">Intenta ajustar los filtros de búsqueda o busca en nuestra base de datos extendida</p>
            
            {/* Botón para acceder a PorphyriaDrugs.com */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h4 className="text-md font-medium text-blue-900 mb-2">¿No encuentra el medicamento?</h4>
              <p className="text-sm text-blue-700 mb-4">
                Accede a otra base de datos extendida con más de 10,000 medicamentos y información actualizada.
              </p>
              <a
                href="https://porphyriadrugs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Buscar en PorphyriaDrugs.com
              </a>
              <p className="text-xs text-blue-600 mt-3">
                Se abrirá en una nueva pestaña
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
