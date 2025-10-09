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
  const [currentPage, setCurrentPage] = useState(1)
  const [medicinesPerPage] = useState(50)

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

    // Ordenar alfabéticamente por genericName
    filtered.sort((a, b) => a.genericName.localeCompare(b.genericName))

    return filtered
  }, [allMedicines, searchTerm, filterClass, filterConclusion])

  // Paginación
  const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage)
  const startIndex = (currentPage - 1) * medicinesPerPage
  const endIndex = startIndex + medicinesPerPage
  const paginatedMedicines = filteredMedicines.slice(startIndex, endIndex)

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterClass, filterConclusion])

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

  // Función para capitalizar texto (primera letra mayúscula, resto minúscula)
  const capitalizeText = (text: string) => {
    if (!text || text === 'n/a') return text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
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
                  <option key={cls} value={cls}>{capitalizeText(cls)}</option>
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
                {uniqueConclusions
                  .sort((a, b) => getConclusionText(a).localeCompare(getConclusionText(b)))
                  .map((conclusion: string) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-green-600 mr-2">
                <title>Muy Seguro</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              </svg>
              <span className="text-green-700 font-medium">Muy Seguro</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-yellow-600 mr-2">
                <title>Probablemente Seguro</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"></path>
              </svg>
              <span className="text-yellow-700 font-medium">Probablemente Seguro</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-orange-600 mr-2">
                <title>Probablemente Inseguro</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path>
              </svg>
              <span className="text-orange-700 font-medium">Probablemente Inseguro</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-red-600 mr-2">
                <title>Muy Inseguro</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              </svg>
              <span className="text-red-700 font-medium">Muy Inseguro</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 text-gray-600 mr-2">
                <title>Sin Información</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"></path>
              </svg>
              <span className="text-gray-700 font-medium">Sin Información</span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Resultados ({filteredMedicines.length} medicamentos encontrados)
            </h3>
            {filteredMedicines.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredMedicines.length)} de {filteredMedicines.length} medicamentos
              </p>
            )}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMedicines.map((medicine: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {capitalizeText(medicine.genericName)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {medicine.brandName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {capitalizeText(medicine.class)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {capitalizeText(medicine.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getConclusionIcon(medicine.conclusion)}
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full border ${getConclusionColor(medicine.conclusion)}`}>
                          {getConclusionText(medicine.conclusion)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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
