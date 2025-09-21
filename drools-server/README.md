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
  "responses": {
    "1": "YES",
    "3": "YES",
    "5": "NO"
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "testType": "PBG_URINE_TEST",
    "confidence": "high",
    "message": "Se recomienda realizar test de PBG...",
    "score": 8,
    "criticalSymptoms": 2,
    "reasoning": ["Dolor abdominal severo", "Debilidad muscular"],
    "riskFactors": ["Antecedentes familiares de Porfiria"]
  }
}
```

### GET `/api/rules`
Obtiene las reglas activas en el servidor.

### GET `/health`
Verifica el estado del servidor.

## 📝 Archivos DRL

### Estructura de Reglas

Las reglas están definidas en `rules/porfiria-rules.drl` usando la sintaxis DRL:

```drl
rule "Nombre de la Regla"
    when
        // Condiciones (hechos que deben cumplirse)
        $patient: Patient(familyHistory == true)
        $response1: QuestionnaireResponse(questionId == "1", answer == "YES")
    then
        // Acciones (qué hacer cuando se cumple la condición)
        System.out.println("Regla activada");
        // Crear recomendación...
end
```

### Tipos de Hechos

```drl
declare Patient
    id: String
    firstName: String
    lastName: String
    dni: String
    age: int
    gender: String
    familyHistory: boolean
    medications: List<String>
    alcoholConsumption: boolean
    fastingStatus: boolean
end

declare QuestionnaireResponse
    questionId: String
    answer: String
    patientId: String
    timestamp: java.util.Date
end

declare Recommendation
    testType: String
    confidence: String
    message: String
    score: int
    criticalSymptoms: int
    reasoning: List<String>
    riskFactors: List<String>
end
```

## 🔧 Agregar Nuevas Reglas

### 1. Editar el archivo DRL

Agrega tu regla en `rules/porfiria-rules.drl`:

```drl
rule "Mi Nueva Regla"
    when
        $patient: Patient(age < 18)
        $response1: QuestionnaireResponse(questionId == "1", answer == "YES")
        not Recommendation()
    then
        System.out.println("Regla activada: Mi Nueva Regla");
        
        List<String> reasoning = new ArrayList<>();
        reasoning.add("Paciente pediátrico");
        reasoning.add("Dolor abdominal");
        
        Recommendation recommendation = new Recommendation();
        recommendation.setTestType("PBG_URINE_TEST");
        recommendation.setConfidence("high");
        recommendation.setMessage("Se recomienda test de PBG para paciente pediátrico.");
        recommendation.setScore(5);
        recommendation.setCriticalSymptoms(1);
        recommendation.setReasoning(reasoning);
        recommendation.setRiskFactors(new ArrayList<>());
        
        insert(recommendation);
end
```

### 2. Reiniciar el servidor

```bash
npm run dev
```

## 🔍 Debugging

### Logs del Servidor

El servidor muestra logs detallados:

```
🚀 Servidor Drools ejecutándose en puerto 3001
Cargando reglas Drools desde archivos .drl...
Regla activada: Porfiria Aguda Intermitente
```

### Verificar Reglas Activas

```bash
curl http://localhost:3001/api/rules
```

## 🔄 Integración con Frontend

El frontend se conecta automáticamente al servidor Drools:

```typescript
import { droolsClient } from '@/lib/drools-client';

const result = await droolsClient.evaluateQuestionnaire(patientData, responses);
```

Si el servidor no está disponible, el sistema usa lógica de fallback automáticamente.

## 🏥 Reglas Médicas Implementadas

1. **Porfiria Aguda Intermitente**: Dolor abdominal + debilidad muscular + antecedentes familiares
2. **Porfiria Cutánea Tardía**: Lesiones cutáneas + fotosensibilidad + consumo de alcohol
3. **Síntomas Neurológicos Críticos**: Debilidad muscular + convulsiones
4. **Factores Desencadenantes Múltiples**: Medicamentos + factores ambientales
5. **Síntomas Moderados**: Dolor abdominal sin síntomas neurológicos críticos
6. **Paciente Pediátrico**: Edad < 18 + antecedentes familiares + síntomas
7. **Sin Indicación**: Regla por defecto cuando no se cumplen otras condiciones

## 🚨 Notas Importantes

- **Desarrollo**: El servidor actual es una simulación. Para producción, integra con Drools real (KIE Server)
- **Seguridad**: En producción, agregar autenticación y validación de datos
- **Escalabilidad**: Considerar usar KIE Server para mayor rendimiento
- **Monitoreo**: Implementar logging y métricas en producción
