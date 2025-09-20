import Link from 'next/link'
import { HeartIcon, UserGroupIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SE-Porfiria</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="btn-secondary">
                Iniciar Sesión
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Sistema Experto para
            <span className="text-primary-600"> Diagnóstico Temprano</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Herramienta especializada para médicos y el Centro de Investigación de Porfiria y Porfirina (CIPYP) 
            en la evaluación y seguimiento de casos de Porfiria Aguda y Cutánea.
          </p>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card text-center">
            <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Pacientes</h3>
            <p className="text-gray-600">
              Registro y seguimiento completo de pacientes con historial médico detallado.
            </p>
          </div>

          <div className="card text-center">
            <DocumentTextIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cuestionario Inteligente</h3>
            <p className="text-gray-600">
              Sistema de preguntas dinámicas que guía hacia la recomendación de tests específicos.
            </p>
          </div>

          <div className="card text-center">
            <ChartBarIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis y Reportes</h3>
            <p className="text-gray-600">
              Dashboard completo para CIPYP con estadísticas y seguimiento de casos.
            </p>
          </div>

          <div className="card text-center">
            <HeartIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnóstico Asistido</h3>
            <p className="text-gray-600">
              Recomendaciones basadas en evidencia para tests de PBG en orina.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Eres un profesional médico?
            </h3>
            <p className="text-gray-600 mb-6">
              Únete a nuestra plataforma y contribuye al diagnóstico temprano de Porfiria. 
              La herramienta está diseñada exclusivamente para profesionales habilitados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary">
                Registrarse como Médico
              </Link>
              <Link href="/auth/login" className="btn-secondary">
                Acceder a mi cuenta
              </Link>
            </div>
          </div>
        </div>

        {/* About CIPYP */}
        <div className="mt-20">
          <div className="card max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Centro de Investigación de Porfiria y Porfirina (CIPYP)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Para Médicos</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Registro y gestión de pacientes</li>
                  <li>• Cuestionario especializado de evaluación</li>
                  <li>• Recomendaciones de tests basadas en evidencia</li>
                  <li>• Historial completo de consultas</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Para CIPYP</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Acceso a todos los casos registrados</li>
                  <li>• Análisis estadístico de datos</li>
                  <li>• Seguimiento de recomendaciones de tests</li>
                  <li>• Reportes y exportación de datos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 SE-Porfiria. Sistema desarrollado para el Centro de Investigación de Porfiria y Porfirina (CIPYP).
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta herramienta no reemplaza el juicio clínico profesional y no debe ser utilizada como único método de diagnóstico.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
