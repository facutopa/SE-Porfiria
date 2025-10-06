# SE-Porfiria - Sistema Experto para Diagnóstico Temprano

Sistema experto desarrollado para asistir en el diagnóstico temprano de Porfiria Aguda y Cutánea, diseñado para médicos y el Centro de Investigación de Porfiria y Porfirina (CIPYP).

## 🎯 Características Principales

- **Motor de Reglas Inteligente**: Sistema experto basado en reglas médicas implementado en TypeScript
- **PWA (Progressive Web App)**: Aplicación web responsive que funciona offline
- **Sistema de Cuestionario Inteligente**: Evaluación dinámica basada en síntomas y antecedentes
- **Gestión de Pacientes**: Registro completo de pacientes y historiales médicos
- **Dashboard CIPYP**: Panel de control para análisis y seguimiento de casos
- **Recomendaciones de Tests**: Sistema experto que sugiere tests específicos según el tipo de Porfiria
- **Base de Datos de Medicamentos**: Integración con base de datos oficial de seguridad farmacológica
- **Autenticación Segura**: Sistema de login para médicos y personal CIPYP

## 🏗️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Prisma ORM con SQLite
- **Motor de Reglas**: Sistema de reglas personalizado en TypeScript
- **PWA**: Service Workers, Web App Manifest
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Zod, React Hook Form

## 📱 Funcionalidades

### Para Médicos
- Registro y gestión de pacientes
- Cuestionario especializado de evaluación de Porfiria
- Recomendaciones automáticas basadas en reglas médicas
- Historial completo de consultas y evaluaciones
- Dashboard personal con estadísticas
- Consulta de seguridad de medicamentos

### Para CIPYP
- Acceso a todos los casos registrados en el sistema
- Análisis estadístico y reportes
- Seguimiento de recomendaciones de tests
- Gestión de médicos usuarios
- Exportación de datos para investigación

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd SE-Porfiria
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Generar el cliente de Prisma
npx prisma generate

# Aplicar migraciones y cargar datos iniciales
npx prisma migrate reset --force
```

4. **Iniciar la aplicación**
```bash
npm run dev
```

5. **Acceder a la aplicación**
```
Frontend: http://localhost:3000
```

6. **Credenciales por defecto**
```
Email: doctor@example.com
Contraseña: demo123
```

## 📊 Estructura del Proyecto

```
SE-Porfiria/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── patients/          # Gestión de pacientes
│   ├── questionnaire/     # Sistema de cuestionarios
│   ├── cipyp/            # Dashboard CIPYP
│   └── globals.css       # Estilos globales
├── lib/                  # Utilidades y configuración
│   ├── drools-engine.ts # Motor de reglas principal
│   ├── drools-client.ts  # Cliente para comunicación
│   ├── rules/            # Definición de reglas médicas
│   └── data/             # Base de datos de medicamentos
├── prisma/               # Esquema de base de datos
└── public/               # Archivos estáticos
```

## 🗄️ Esquema de Base de Datos

### Entidades Principales
- **User**: Médicos y personal CIPYP
- **Patient**: Pacientes registrados
- **Questionnaire**: Evaluaciones completadas
- **Answer**: Respuestas individuales
- **TestResult**: Resultados de tests realizados

## 📋 Sistema de Cuestionario y Reglas

### Categorías de Preguntas
- **Síntomas Cutáneos**: Fotosensibilidad, lesiones, ampollas
- **Síntomas Agudos**: Dolor abdominal, trastornos neurológicos
- **Anamnesis**: Antecedentes familiares, medicamentos, alcohol

### Sistema de Puntuación
- **Porfiria Cutánea**: ≥ 22 puntos en síntomas cutáneos
- **Porfiria Aguda**: ≥ 36 puntos en síntomas agudos
- **Anamnesis Significativa**: ≥ 12 puntos

### Recomendaciones
- **Tests para Porfiria Cutánea**: IPP, PTO, CRO, PBG
- **Tests para Porfiria Aguda**: PBG, IPP, ALA, PTO
- **Medicamentos Contraindicados**: Lista específica según tipo

## 🔐 Sistema de Autenticación

- JWT para manejo de sesiones
- Roles diferenciados (MEDICO, CIPYP, ADMIN)
- Acceso restringido por rol
- Protección de rutas API

## 💊 Base de Datos de Medicamentos

El sistema incluye una base de datos completa de medicamentos basada en la información oficial de la Porphyria Foundation, con niveles de seguridad:

- **OK!** - Muy Seguro (verde)
- **OK?** - Probablemente Seguro (amarillo)
- **BAD?** - Probablemente Inseguro (naranja)
- **BAD!** - Muy Inseguro (rojo)
- **NO INFO** - Sin Información (gris)

## 🏥 Uso Médico

**Importante**: Esta aplicación es una herramienta de apoyo al diagnóstico y no reemplaza el juicio clínico profesional. Todas las decisiones médicas deben basarse en la evaluación clínica completa del paciente.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto está desarrollado para uso académico y de investigación en el marco de la tesis de Licenciatura en Sistemas.

---

**Desarrollado para el Centro de Investigación de Porfiria y Porfirina (CIPYP)**