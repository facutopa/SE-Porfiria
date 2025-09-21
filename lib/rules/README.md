# Sistema de Reglas Drools para Porfiria

Este directorio contiene la implementación del motor de reglas para el diagnóstico asistido de Porfiria. El sistema permite definir reglas médicas basadas en criterios específicos y aplicarlas automáticamente durante la evaluación de cuestionarios.

## Estructura del Sistema

### Archivos Principales

- **`drools-engine.ts`**: Motor principal que procesa las reglas y genera recomendaciones
- **`porfiria-rules.ts`**: Definición de todas las reglas médicas organizadas por categorías
- **`rule-config.ts`**: Configuración de umbrales, mensajes y pesos
- **`example-custom-rules.ts`**: Ejemplos de cómo crear reglas personalizadas

## Cómo Agregar Nuevas Reglas

### 1. Definir la Regla

```typescript
import { PorfiriaRule } from '../drools-engine';

const miNuevaRegla: PorfiriaRule = {
  id: 'mi_regla_unica',
  name: 'Descripción de la regla',
  condition: (data, responses) => {
    // Lógica de la regla
    const sintoma1 = getResponse(responses, '1') === 'YES';
    const sintoma2 = getResponse(responses, '2') === 'YES';
    return sintoma1 && sintoma2;
  },
  weight: 3, // Peso de la regla (1-6)
  category: 'gastrointestinal', // Categoría
  reasoning: 'Explicación de por qué se activa esta regla'
};
```

### 2. Agregar la Regla al Motor

```typescript
import { droolsEngine } from '../drools-engine';

// Agregar la regla
droolsEngine.addRule(miNuevaRegla);
```

### 3. Categorías Disponibles

- **`gastrointestinal`**: Síntomas digestivos
- **`neurological`**: Síntomas neurológicos
- **`cutaneous`**: Síntomas cutáneos
- **`genetic`**: Factores genéticos/antecedentes
- **`environmental`**: Factores ambientales
- **`critical`**: Combinaciones críticas de síntomas

## Estructura de las Reglas

### Función `condition`

La función `condition` recibe dos parámetros:
- **`data`**: Datos del paciente (edad, género, antecedentes, etc.)
- **`responses`**: Respuestas del cuestionario

### Función `getResponse`

```typescript
function getResponse(responses: QuestionnaireResponse[], questionId: string): string | null {
  const response = responses.find(r => r.questionId === questionId);
  return response ? response.answer : null;
}
```

## Ejemplos de Reglas

### Regla Simple
```typescript
{
  id: 'dolor_abdominal',
  name: 'Dolor abdominal severo',
  condition: (data, responses) => {
    return getResponse(responses, '1') === 'YES';
  },
  weight: 3,
  category: 'gastrointestinal',
  reasoning: 'Presencia de dolor abdominal severo'
}
```

### Regla Compleja
```typescript
{
  id: 'porfiria_aguda',
  name: 'Sospecha de Porfiria Aguda',
  condition: (data, responses) => {
    const dolorAbdominal = getResponse(responses, '1') === 'YES';
    const debilidadMuscular = getResponse(responses, '3') === 'YES';
    const antecedentesFamiliares = data.familyHistory;
    
    return dolorAbdominal && debilidadMuscular && antecedentesFamiliares;
  },
  weight: 5,
  category: 'critical',
  reasoning: 'Combinación de síntomas críticos con antecedentes familiares'
}
```

## Configuración de Umbrales

Los umbrales se pueden modificar en `rule-config.ts`:

```typescript
export const defaultThresholds: RuleThresholds = {
  highRisk: {
    minScore: 8,        // Puntuación mínima para alto riesgo
    minCriticalSymptoms: 2  // Síntomas críticos mínimos
  },
  mediumRisk: {
    minScore: 5,
    minCriticalSymptoms: 1
  },
  lowRisk: {
    maxScore: 4,
    maxCriticalSymptoms: 0
  }
};
```

## Uso en el Cuestionario

El motor se integra automáticamente con el cuestionario existente:

```typescript
import { droolsEngine } from '@/lib/drools-engine';

const result = await droolsEngine.evaluateQuestionnaire(patientData, responses);
```

## Agregar Reglas desde tu Word

1. **Identifica los criterios**: Extrae los criterios médicos de tu documento Word
2. **Convierte a reglas**: Transforma cada criterio en una regla usando la estructura mostrada
3. **Define las condiciones**: Especifica cuándo se debe activar cada regla
4. **Asigna pesos**: Determina la importancia de cada regla (1-6)
5. **Agrega al sistema**: Usa `droolsEngine.addRule()` para registrar la regla

## Ejemplo de Conversión desde Word

**Criterio del Word:**
> "Si el paciente presenta dolor abdominal severo Y debilidad muscular Y tiene antecedentes familiares de Porfiria, entonces considerar test de PBG"

**Regla en código:**
```typescript
{
  id: 'criterio_porfiria_aguda',
  name: 'Criterio para Porfiria Aguda',
  condition: (data, responses) => {
    const dolorAbdominal = getResponse(responses, '1') === 'YES';
    const debilidadMuscular = getResponse(responses, '3') === 'YES';
    const antecedentesFamiliares = data.familyHistory;
    
    return dolorAbdominal && debilidadMuscular && antecedentesFamiliares;
  },
  weight: 5,
  category: 'critical',
  reasoning: 'Criterio clásico para sospecha de Porfiria Aguda'
}
```

## Monitoreo y Debugging

El sistema incluye información detallada en las recomendaciones:

- **`reasoning`**: Lista de reglas que se activaron
- **`riskFactors`**: Factores de riesgo identificados
- **`score`**: Puntuación total calculada
- **`criticalSymptoms`**: Número de síntomas críticos

Esto permite rastrear exactamente por qué se generó cada recomendación.
