# Servidor Drools para Porfiria

Este servidor ejecuta el motor Drools real con archivos `.drl` para procesar las reglas médicas de diagnóstico de Porfiria.

## 🏗️ Arquitectura

```
drools-server/
├── server.js              # Servidor Express con motor Drools
├── rules/
│   └── porfiria-rules.drl # Reglas en formato DRL
├── drools-config.xml      # Configuración de Drools
└── package.json           # Dependencias del servidor
```

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
cd drools-server
npm install
```

### 2. Ejecutar el servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 📋 Endpoints Disponibles

### POST `/api/evaluate`
Evalúa un cuestionario usando las reglas Drools.

**Request:**
```json
{
  "patient": {
    "id": "123",
    "firstName": "María",
    "lastName": "González",
    "dni": "12345678",
    "age": 35,
    "gender": "F",
    "familyHistory": true,
    "medications": [],
    "alcoholConsumption": false,
    "fastingStatus": false
  },
  "responses": [
    {
      "questionId": "maculas",
      "answer": "SI",
      "patientId": "123",
      "timestamp": "2024-01-14T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "testType": "PBG_URINE_TEST",
    "confidence": "high",
    "message": "Se recomienda realizar estudios para Porfiria Cutánea.",
    "score": 22,
    "criticalSymptoms": 1,
    "reasoning": ["Síntomas cutáneos significativos"],
    "riskFactors": [],
    "estudiosRecomendados": [
      "IPP (Isómeros de Porfirinas)",
      "PTO (Porfirinas Totales en Orina)",
      "CRO (Coproporfirinas)",
      "PBG (Porfobilinógeno)"
    ],
    "medicamentosContraproducentes": [
      "Tetraciclinas",
      "Nalidíxico",
      "Furosemida",
      "Sulfonilureas",
      "Estrógenos"
    ]
  }
}
```

### GET `/api/rules`
Obtiene las reglas activas en el servidor.

### GET `/health`
Verifica el estado del servidor.

## 📝 Sistema de Reglas

### Categorías de Reglas

1. **Reglas de Puntuación - Síntomas Cutáneos**
   - Máculas (+2 puntos)
   - Fragilidad Cutánea (+5 puntos)
   - Hipertricosis (+4 puntos)
   - Y más...

2. **Reglas de Puntuación - Síntomas Agudos**
   - Trastornos Psiquiátricos (+4 puntos)
   - Parestesias (+5 puntos)
   - Cefaleas (+3 puntos)
   - Y más...

3. **Reglas de Puntuación - Anamnesis**
   - Color Orina Oscura (+5 puntos)
   - Familiares (+5 puntos)
   - Diabetes (+1 punto)
   - Y más...

### Reglas de Diagnóstico

- **Porfiria Cutánea**: ≥ 22 puntos en síntomas cutáneos
- **Porfiria Aguda**: ≥ 36 puntos en síntomas agudos
- **Anamnesis Significativa**: ≥ 12 puntos

### Reglas de Recomendación

1. **Tests para Porfiria Cutánea**:
   - IPP (Isómeros de Porfirinas)
   - PTO (Porfirinas Totales en Orina)
   - CRO (Coproporfirinas)
   - PBG (Porfobilinógeno)

2. **Tests para Porfiria Aguda**:
   - PBG (Porfobilinógeno)
   - IPP (Isómeros de Porfirinas)
   - ALA (Ácido Aminolevulínico)
   - PTO (Porfirinas Totales en Orina)

### Medicamentos Contraindicados

1. **Para Porfiria Aguda**:
   - Barbitúricos
   - Sulfonamidas
   - Estrógenos
   - Y más...

2. **Para Porfiria Cutánea**:
   - Tetraciclinas
   - Nalidíxico
   - Furosemida
   - Y más...

## 🔄 Integración con Frontend

El frontend se conecta automáticamente al servidor Drools:

```typescript
import { droolsClient } from '@/lib/drools-client';

const result = await droolsClient.evaluateQuestionnaire(patientData, responses);
```

Si el servidor no está disponible, el sistema usa lógica de fallback automáticamente.

## 🚨 Notas Importantes

- **Desarrollo**: El servidor actual es una simulación. Para producción, integra con Drools real (KIE Server)
- **Seguridad**: En producción, agregar autenticación y validación de datos
- **Escalabilidad**: Considerar usar KIE Server para mayor rendimiento
- **Monitoreo**: Implementar logging y métricas en producción

## 📈 Próximas Mejoras

- [ ] Integración con KIE Server
- [ ] Sistema de caché para reglas
- [ ] Validación avanzada de datos
- [ ] Métricas de rendimiento
- [ ] Logs detallados de ejecución de reglas