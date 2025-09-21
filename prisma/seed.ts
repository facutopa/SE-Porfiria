import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario doctor por defecto
  const defaultDoctor = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      email: 'doctor@example.com',
      name: 'Doctor Demo',
      password: await bcrypt.hash('demo123', 10),
      role: 'MEDICO',
      license: '12345',
      hospital: 'Hospital Demo',
      isActive: true
    },
  })

  // Crear pacientes iniciales
  const patients = [
    {
      firstName: 'María',
      lastName: 'González',
      dni: '12345678',
      birthDate: new Date('1985-03-14'),
      gender: 'F',
      phone: '+54 11 1234-5678',
      email: 'maria@example.com',
      isActive: true,
      doctorId: defaultDoctor.id
    },
    {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      dni: '87654321',
      birthDate: new Date('1978-07-21'),
      gender: 'M',
      phone: '+54 11 8765-4321',
      email: 'carlos@example.com',
      isActive: true,
      doctorId: defaultDoctor.id
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      dni: '11223344',
      birthDate: new Date('1992-11-07'),
      gender: 'F',
      phone: '+54 11 1122-3344',
      email: 'ana@example.com',
      isActive: true,
      doctorId: defaultDoctor.id
    },
    {
      firstName: 'Luis',
      lastName: 'Fernández',
      dni: '55667788',
      birthDate: new Date('1980-05-29'),
      gender: 'M',
      phone: '+54 11 5566-7788',
      email: 'luis@example.com',
      isActive: false,
      doctorId: defaultDoctor.id
    }
  ]

  for (const patient of patients) {
    await prisma.patient.upsert({
      where: { dni: patient.dni },
      update: patient,
      create: patient
    })
  }

  console.log('Base de datos inicializada con datos de prueba')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })