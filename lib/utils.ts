import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function validateDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generatePatientCode(firstName: string, lastName: string, dni: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const year = new Date().getFullYear()
  const lastFourDigits = dni.slice(-4)
  return `${initials}${year}${lastFourDigits}`
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'PBG_URINE_TEST':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'FOLLOW_UP_REQUIRED':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'NO_TEST_NEEDED':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getRecommendationText(recommendation: string): string {
  switch (recommendation) {
    case 'PBG_URINE_TEST':
      return 'Test PBG Recomendado'
    case 'FOLLOW_UP_REQUIRED':
      return 'Seguimiento Requerido'
    case 'NO_TEST_NEEDED':
      return 'Sin Test Necesario'
    default:
      return 'Sin Recomendación'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'inactive':
      return 'text-gray-600 bg-gray-50'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'completed':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'pending':
      return 'Pendiente'
    case 'completed':
      return 'Completado'
    default:
      return 'Desconocido'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
