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
    nationality: '',
    city: '',
    workplace: '',
    healthInsurance: '',
    insuranceNumber: '',
    previousJobs: '',
    maritalStatus: '',
    occupation: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null)
  const router = useRouter()

  // Función para calcular la edad
  const calculateAge = (birthDate: string) => {
    if (!birthDate) {
      setCalculatedAge(null)
      return
    }
    
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    setCalculatedAge(age)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

     // Validaciones básicas
     if (!formData.firstName || !formData.lastName || !formData.dni || !formData.birthDate || !formData.gender || !formData.phone) {
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
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    }
    
    setFormData(newFormData)
    
    // Calcular edad automáticamente cuando cambie la fecha de nacimiento
    if (e.target.name === 'birthDate') {
      calculateAge(e.target.value)
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
                <h1 className="text-xl font-bold text-gray-900">Nuevo Paciente</h1>
              </div>
            </div>
            <Link href="/patients" className="btn-secondary flex items-center">
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
                  {calculatedAge !== null && (
                    <p className="mt-1 text-sm text-gray-600">
                      Edad: {calculatedAge} años
                    </p>
                  )}
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

                <div>
                  <label htmlFor="nationality" className="label">
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    id="nationality"
                    className="input-field"
                    placeholder="Argentina"
                    value={formData.nationality}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="maritalStatus" className="label">
                    Estado Civil
                  </label>
                  <select
                    name="maritalStatus"
                    id="maritalStatus"
                    className="input-field"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="soltero">Soltero/a</option>
                    <option value="casado">Casado/a</option>
                    <option value="divorciado">Divorciado/a</option>
                    <option value="viudo">Viudo/a</option>
                    <option value="concubinato">Concubinato</option>
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
                     Teléfono *
                   </label>
                   <input
                     type="tel"
                     name="phone"
                     id="phone"
                     required
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

                <div>
                  <label htmlFor="city" className="label">
                    Localidad
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="input-field"
                    placeholder="Buenos Aires"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Información Obra Social */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Obra Social</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="healthInsurance" className="label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="healthInsurance"
                    id="healthInsurance"
                    className="input-field"
                    placeholder="OSDE, Swiss Medical, etc."
                    value={formData.healthInsurance}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="insuranceNumber" className="label">
                    Número de Afiliado
                  </label>
                  <input
                    type="text"
                    name="insuranceNumber"
                    id="insuranceNumber"
                    className="input-field"
                    placeholder="12345678"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="occupation" className="label">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    id="occupation"
                    className="input-field"
                    placeholder="Ingeniero, Médico, etc."
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="workplace" className="label">
                    Lugar de Trabajo
                  </label>
                  <input
                    type="text"
                    name="workplace"
                    id="workplace"
                    className="input-field"
                    placeholder="Empresa, Institución, etc."
                    value={formData.workplace}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="previousJobs" className="label">
                    Trabajos Anteriores
                  </label>
                  <textarea
                    name="previousJobs"
                    id="previousJobs"
                    rows={3}
                    className="input-field"
                    placeholder="Describa trabajos anteriores relevantes..."
                    value={formData.previousJobs}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>


            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/patients" className="btn-secondary flex items-center">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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