'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HeartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NewPatientPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    medicalHistory: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones básicas
    if (!formData.firstName || !formData.lastName || !formData.dni || !formData.birthDate || !formData.gender) {
      setError('Por favor, completa todos los campos obligatorios.')
      setIsLoading(false)
      return
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(formData.dni)) {
      setError('El DNI debe tener exactamente 8 dígitos.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el paciente');
      }

      // Redirigir a la lista de pacientes
      router.push('/patients?created=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el paciente. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
                <h1 className="text-xl font-bold text-gray-900">Nuevo Paciente</h1>
                <p className="text-sm text-gray-600">Registra un nuevo paciente en el sistema</p>
              </div>
            </div>
            <Link href="/patients" className="btn-secondary">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    className="input-field"
                    placeholder="María"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    className="input-field"
                    placeholder="González"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="dni" className="label">
                    DNI *
                  </label>
                  <input
                    type="text"
                    name="dni"
                    id="dni"
                    required
                    className="input-field"
                    placeholder="12345678"
                    maxLength={8}
                    value={formData.dni}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="birthDate" className="label">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    id="birthDate"
                    required
                    className="input-field"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="label">
                    Sexo *
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    className="input-field"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="label">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="input-field"
                    placeholder="+54 11 1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="input-field"
                    placeholder="maria@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="label">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    className="input-field"
                    placeholder="Av. Corrientes 1234, CABA"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Historia Médica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historia Médica</h3>
              <div>
                <label htmlFor="medicalHistory" className="label">
                  Antecedentes Médicos Relevantes
                </label>
                <textarea
                  name="medicalHistory"
                  id="medicalHistory"
                  rows={4}
                  className="input-field"
                  placeholder="Describa cualquier antecedente médico relevante, medicamentos actuales, alergias, etc."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/patients" className="btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando paciente...' : 'Crear Paciente'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}