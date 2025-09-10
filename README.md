# SE-Porfiria - Sistema Experto para Diagnóstico Temprano

Sistema experto desarrollado para asistir en el diagnóstico temprano de Porfiria Aguda y Cutánea, diseñado para médicos y el Centro de Investigación de Porfiria y Porfirina (CIPYP).

## 🎯 Características Principales

- **PWA (Progressive Web App)**: Aplicación web responsive que funciona offline
- **Sistema de Cuestionario Inteligente**: Evaluación dinámica basada en síntomas y antecedentes
- **Gestión de Pacientes**: Registro completo de pacientes y historiales médicos
- **Dashboard CIPYP**: Panel de control para análisis y seguimiento de casos
- **Recomendaciones de Tests**: Sistema experto que sugiere tests de PBG en orina
- **Autenticación Segura**: Sistema de login para médicos y personal CIPYP

## 🏗️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Prisma ORM con SQLite
- **PWA**: Service Workers, Web App Manifest
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Zod, React Hook Form

## 📱 Funcionalidades

### Para Médicos
- Registro y gestión de pacientes
- Cuestionario especializado de evaluación de Porfiria
- Recomendaciones automáticas de tests basadas en evidencia
- Historial completo de consultas y evaluaciones
- Dashboard personal con estadísticas

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
npx prisma generate
npx prisma db push
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 📊 Estructura del Proyecto

```
SE-Porfiria/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── patients/          # Gestión de pacientes
│   ├── questionnaire/     # Sistema de cuestionarios
│   ├── cipyp/            # Dashboard CIPYP
│   └── globals.css       # Estilos globales
├── components/            # Componentes reutilizables
├── lib/                  # Utilidades y configuración
├── prisma/               # Esquema de base de datos
├── public/               # Archivos estáticos
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service Worker
│   └── icons/           # Iconos PWA
└── types/               # Definiciones TypeScript
```

## 🗄️ Esquema de Base de Datos

### Entidades Principales
- **User**: Médicos y personal CIPYP
- **Patient**: Pacientes registrados
- **Question**: Preguntas del cuestionario
- **Questionnaire**: Evaluaciones completadas
- **Answer**: Respuestas individuales
- **TestResult**: Resultados de tests realizados

## 🔐 Sistema de Autenticación

- Registro diferenciado para médicos y personal CIPYP
- Validación de matrícula médica
- JWT para sesiones seguras
- Roles y permisos diferenciados

## 📋 Sistema de Cuestionario

### Categorías de Preguntas
- **Síntomas Generales**: Dolor abdominal, náuseas, vómitos
- **Síntomas Neurológicos**: Debilidad muscular, convulsiones
- **Síntomas Cutáneos**: Fotosensibilidad, lesiones
- **Síntomas Psiquiátricos**: Cambios de comportamiento
- **Antecedentes**: Familiares, medicamentos, alcohol

### Algoritmo de Recomendación
- Sistema de puntuación ponderada
- Identificación de síntomas críticos
- Recomendaciones basadas en evidencia:
  - **Test PBG**: Alta probabilidad de Porfiria
  - **Seguimiento**: Probabilidad moderada
  - **Sin Test**: Baja probabilidad

## 📱 PWA Features

- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión a internet
- **Responsive**: Optimizado para móviles y tablets
- **Fast Loading**: Carga rápida con service workers
- **Push Notifications**: Notificaciones (futuro)

## 🎨 Diseño Responsive

- **Mobile First**: Diseño optimizado para móviles
- **Tablet Support**: Interfaz adaptada para tablets
- **Desktop**: Experiencia completa en escritorio
- **Touch Friendly**: Botones y elementos táctiles

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 📈 Próximas Funcionalidades

- [ ] Notificaciones push
- [ ] Exportación de reportes PDF
- [ ] Integración con laboratorios
- [ ] Chat entre médicos y CIPYP
- [ ] Análisis de tendencias
- [ ] API REST para integraciones

## 🏥 Uso Médico

**Importante**: Esta aplicación es una herramienta de apoyo al diagnóstico y no reemplaza el juicio clínico profesional. Todas las decisiones médicas deben basarse en la evaluación clínica completa del paciente.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto está desarrollado para uso académico y de investigación en el marco de la tesis de Licenciatura en Sistemas.

---

**Desarrollado para el Centro de Investigación de Porfiria y Porfirina (CIPYP)**
