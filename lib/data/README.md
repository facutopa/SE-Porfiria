# Base de Datos de Medicamentos - Porphyria Foundation

## 📋 Instrucciones para Actualizar la Base de Datos Completa

### Paso 1: Obtener los Datos
1. Ve a https://www.porphyriafoundation.org/drugsafety_listall.cfm
2. Copia toda la tabla (Ctrl+A, Ctrl+C)
3. Pega el contenido en un archivo llamado `medicines-raw-data.txt` en la raíz del proyecto

### Paso 2: Procesar los Datos
Ejecuta el script de procesamiento:
```bash
node scripts/parse-medicines-data.js
```

### Paso 3: Verificar el Resultado
El script generará:
- `lib/data/medicines-database.json` - Base de datos completa en formato JSON
- Estadísticas de procesamiento en la consola

## 📊 Estructura de Datos

```json
{
  "medicines": [
    {
      "class": "ANESTHETICS",
      "type": "GENERAL",
      "genericName": "Desflurane",
      "brandName": "Suprane",
      "conclusion": "OK!",
      "references": "www.drugs-porphyria.org: Probably Not Porphyrinogenic"
    }
  ],
  "metadata": {
    "source": "https://www.porphyriafoundation.org/drugsafety_listall.cfm",
    "totalRecords": 723,
    "lastUpdated": "2025-01-27",
    "description": "Base de datos oficial de seguridad de medicamentos para pacientes con Porfiria"
  }
}
```

## 🔍 Niveles de Seguridad

- **OK!** - Muy Seguro (verde)
- **OK?** - Probablemente Seguro (amarillo)
- **BAD?** - Probablemente Inseguro (naranja)
- **BAD!** - Muy Inseguro (rojo)
- **NO INFO** - Sin Información (gris)

## 📝 Notas Importantes

- La información es solo para referencia
- No reemplaza el juicio clínico profesional
- Basada en la base de datos oficial de la Porphyria Foundation
- Se actualiza periódicamente según la fuente oficial
