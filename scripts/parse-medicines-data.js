/**
 * Script para convertir los datos de la Porphyria Foundation a JSON
 * 
 * INSTRUCCIONES:
 * 1. Ve a https://www.porphyriafoundation.org/drugsafety_listall.cfm
 * 2. Copia toda la tabla (Ctrl+A, Ctrl+C)
 * 3. Pega el contenido en un archivo de texto llamado 'medicines-raw-data.txt'
 * 4. Ejecuta este script: node scripts/parse-medicines-data.js
 * 5. El resultado se guardará en 'lib/data/medicines-database.json'
 */

const fs = require('fs');
const path = require('path');

function parseMedicinesData() {
  try {
    // Leer el archivo con los datos copiados de la página web
    const rawDataPath = path.join(__dirname, '..', 'medicines-raw-data.txt');
    
    if (!fs.existsSync(rawDataPath)) {
      console.log('❌ No se encontró el archivo medicines-raw-data.txt');
      console.log('📋 Instrucciones:');
      console.log('1. Ve a https://www.porphyriafoundation.org/drugsafety_listall.cfm');
      console.log('2. Copia toda la tabla (Ctrl+A, Ctrl+C)');
      console.log('3. Pega el contenido en un archivo llamado medicines-raw-data.txt en la raíz del proyecto');
      console.log('4. Ejecuta este script nuevamente');
      return;
    }

    const rawData = fs.readFileSync(rawDataPath, 'utf8');
    
    // Dividir por líneas y procesar
    const lines = rawData.split('\n').filter(line => line.trim());
    const medicines = [];
    
    console.log(`📊 Procesando ${lines.length} líneas...`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Saltar líneas de encabezado o vacías
      if (!line || line.includes('Class') || line.includes('---') || line.includes('records found')) {
        continue;
      }
      
      // Dividir por columnas (asumiendo que están separadas por tabs o múltiples espacios)
      const columns = line.split(/\t|  +/).filter(col => col.trim());
      
      if (columns.length >= 5) {
        const medicine = {
          class: columns[0]?.trim() || '',
          type: columns[1]?.trim() || '',
          genericName: columns[2]?.trim() || '',
          brandName: columns[3]?.trim() || '',
          conclusion: columns[4]?.trim() || '',
          references: columns.slice(5).join(' ').trim() || ''
        };
        
        // Solo agregar si tiene nombre genérico
        if (medicine.genericName) {
          medicines.push(medicine);
        }
      }
    }
    
    console.log(`✅ Procesados ${medicines.length} medicamentos`);
    
    // Crear el objeto final
    const result = {
      medicines: medicines,
      metadata: {
        source: "https://www.porphyriafoundation.org/drugsafety_listall.cfm",
        totalRecords: medicines.length,
        lastUpdated: new Date().toISOString().split('T')[0],
        description: "Base de datos oficial de seguridad de medicamentos para pacientes con Porfiria de la Porphyria Foundation"
      }
    };
    
    // Guardar en el archivo JSON
    const outputPath = path.join(__dirname, '..', 'lib', 'data', 'medicines-database.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`💾 Datos guardados en: ${outputPath}`);
    console.log(`📈 Total de medicamentos: ${medicines.length}`);
    
    // Mostrar estadísticas por conclusión
    const conclusions = {};
    medicines.forEach(med => {
      conclusions[med.conclusion] = (conclusions[med.conclusion] || 0) + 1;
    });
    
    console.log('\n📊 Estadísticas por nivel de seguridad:');
    Object.entries(conclusions).forEach(([conclusion, count]) => {
      console.log(`  ${conclusion}: ${count} medicamentos`);
    });
    
  } catch (error) {
    console.error('❌ Error procesando los datos:', error);
  }
}

// Ejecutar el script
parseMedicinesData();
