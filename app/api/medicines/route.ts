import { NextRequest, NextResponse } from 'next/server'
import medicinesData from '../../../lib/data/medicines-database.json'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

// Base de datos de medicamentos basada en la Porphyria Foundation
const medicinesDatabase = medicinesData.medicines

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const classFilter = searchParams.get('class') || ''
    const conclusionFilter = searchParams.get('conclusion') || ''

    let filteredMedicines = medicinesDatabase

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.genericName.toLowerCase().includes(searchLower) ||
        medicine.brandName.toLowerCase().includes(searchLower) ||
        medicine.class.toLowerCase().includes(searchLower) ||
        medicine.type.toLowerCase().includes(searchLower)
      )
    }

    if (classFilter) {
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.class === classFilter
      )
    }

    if (conclusionFilter) {
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.conclusion === conclusionFilter
      )
    }

    // Obtener clases únicas para filtros
    const uniqueClasses = [...new Set(medicinesDatabase.map(m => m.class))].sort()
    const uniqueConclusions = [...new Set(medicinesDatabase.map(m => m.conclusion))].sort()

    return NextResponse.json({
      medicines: filteredMedicines,
      total: filteredMedicines.length,
      totalInDatabase: medicinesDatabase.length,
      filters: {
        classes: uniqueClasses,
        conclusions: uniqueConclusions
      },
      metadata: medicinesData.metadata
    })

  } catch (error) {
    console.error('Error en API de medicamentos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}