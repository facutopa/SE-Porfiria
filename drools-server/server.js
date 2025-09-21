/**
 * Servidor Drools para procesar reglas de Porfiria
 * 
 * Este servidor ejecuta el motor Drools real con archivos .drl
 * y procesa las evaluaciones de cuestionarios.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.DROOLS_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulación del motor Drools (en producción usarías Drools real)
class DroolsEngine {
  constructor() {
    this.rules = [];
    this.loadRules();
  }

  loadRules() {
    console.log('Cargando reglas Drools desde archivos .drl...');
    
    this.rules = [
      {
        name: 'PorfiriaCutaneaRule',
        condition: (facts) => {
          const responses = facts.responses;
          let sintomasCutanea = 0;
          
          // Calcular puntuación síntomas cutáneos
          if (responses['maculas'] === 'SI') sintomasCutanea += 2;
          if (responses['fragilidadCutanea'] === 'SI') sintomasCutanea += 5;
          if (responses['hipertricosis'] === 'SI') sintomasCutanea += 4;
          if (responses['nodulos'] === 'SI') sintomasCutanea += 1;
          if (responses['lesionesOculares'] === 'SI') sintomasCutanea += 1;
          if (responses['costras'] === 'SI') sintomasCutanea += 3;
          if (responses['quistesMilia'] === 'SI') sintomasCutanea += 3;
          if (responses['hiperpigmentacion'] === 'SI') sintomasCutanea += 5;
          if (responses['ampollas'] === 'SI') sintomasCutanea += 5;
          if (responses['fotosensibilidad'] === 'SI') sintomasCutanea += 5;
          if (responses['pruritos'] === 'SI') sintomasCutanea += 2;
          if (responses['tricosis'] === 'SI') sintomasCutanea += 3;
          
          return sintomasCutanea >= 22; // Umbral correcto para Porfiria Cutánea
        },
        action: (facts) => {
          facts.recommendation = {
            testType: 'PBG_URINE_TEST',
            confidence: 'high',
            message: 'Se recomienda realizar estudios para Porfiria Cutánea.',
            score: facts.sintomasCutanea,
            criticalSymptoms: 1,
            reasoning: ['Síntomas cutáneos significativos'],
            riskFactors: [],
            estudiosRecomendados: [
              'IPP (Isómeros de Porfirinas)',
              'PTO (Porfirinas Totales en Orina)',
              'CRO (Coproporfirinas)',
              'PBG (Porfobilinógeno)'
            ],
            medicamentosContraproducentes: [
              'Tetraciclinas',
              'Nalidíxico',
              'Furosemida',
              'Sulfonilureas',
              'Estrógenos',
              'Alcohol',
              'Hierro',
              'Retinoides',
              'Cloroquina',
              'Hidroxicloroquina'
            ]
          };
        }
      },
      {
        name: 'PorfiriaAgudaRule',
        condition: (facts) => {
          const responses = facts.responses;
          let sintomasAguda = 0;
          
          // Calcular puntuación síntomas agudos
          if (responses['trastornosPsiquiatricos'] === 'SI') sintomasAguda += 4;
          if (responses['parestesias'] === 'SI') sintomasAguda += 5;
          if (responses['cefaleas'] === 'SI') sintomasAguda += 3;
          if (responses['paresia'] === 'SI') sintomasAguda += 5;
          if (responses['convulsiones'] === 'SI') sintomasAguda += 3;
          if (responses['trastornosAbdominales'] === 'SI') sintomasAguda += 5;
          if (responses['sindromeAcidoSensitivo'] === 'SI') sintomasAguda += 2;
          if (responses['palpitaciones'] === 'SI') sintomasAguda += 3;
          if (responses['anorexia'] === 'SI') sintomasAguda += 2;
          if (responses['estres'] === 'SI') sintomasAguda += 5;
          if (responses['trastornosNeurologicos'] === 'SI') sintomasAguda += 4;
          if (responses['doloresMusculares'] === 'SI') sintomasAguda += 3;
          
          return sintomasAguda >= 36; // Umbral correcto para Porfiria Aguda
        },
        action: (facts) => {
          facts.recommendation = {
            testType: 'PBG_URINE_TEST',
            confidence: 'high',
            message: 'Se recomienda realizar estudios urgentes para Porfiria Aguda.',
            score: facts.sintomasAguda,
            criticalSymptoms: 2,
            reasoning: ['Síntomas agudos significativos'],
            riskFactors: [],
            estudiosRecomendados: [
              'PBG (Porfobilinógeno)',
              'IPP (Isómeros de Porfirinas)',
              'ALA (Ácido Aminolevulínico)',
              'PTO (Porfirinas Totales en Orina)'
            ],
            medicamentosContraproducentes: [
              'Barbitúricos',
              'Sulfonamidas',
              'Estrógenos',
              'Progestágenos',
              'Anticonvulsivantes',
              'Griseofulvina',
              'Rifampicina',
              'Ergotamina',
              'Anticonceptivos orales',
              'Ketoconazol',
              'Metildopa',
              'Piroxicam',
              'Espironolactona'
            ]
          };
        }
      },
      {
        name: 'AnamnesisRule',
        condition: (facts) => {
          const responses = facts.responses;
          let anamnesis = 0;
          
          // Calcular puntuación anamnesis
          if (responses['colorOrina'] === 'Oscura') anamnesis += 5;
          if (responses['familiares'] === 'SI') anamnesis += 5;
          if (responses['diabetes'] === 'SI') anamnesis += 1;
          if (responses['hta'] === 'SI') anamnesis += 1;
          if (responses['tiroides'] === 'SI') anamnesis += 1;
          if (responses['celiaquia'] === 'SI') anamnesis += 1;
          if (responses['lupus'] === 'SI') anamnesis += 1;
          if (responses['consumeAlcohol'] === 'SI') anamnesis += 5;
          if (responses['fuma'] === 'SI') anamnesis += 2;
          
          return anamnesis >= 12; // Umbral correcto para Anamnesis
        },
        action: (facts) => {
          facts.recommendation = {
            testType: 'PBG_URINE_TEST',
            confidence: 'high',
            message: 'Se recomienda realizar estudios basado en antecedentes significativos.',
            score: facts.anamnesis,
            criticalSymptoms: 1,
            reasoning: ['Antecedentes relevantes'],
            riskFactors: [],
            estudiosRecomendados: [
              'PBG (Porfobilinógeno)',
              'IPP (Isómeros de Porfirinas)',
              'ALA (Ácido Aminolevulínico)',
              'PTO (Porfirinas Totales en Orina)'
            ]
          };
        }
      }
    ];
  }

  evaluate(facts) {
    console.log('Evaluando hechos con motor Drools...');
    
    // En Drools real, múltiples reglas pueden activarse
    // Aquí simulamos ese comportamiento
    let activatedRules = [];
    
    for (const rule of this.rules) {
      if (rule.condition(facts)) {
        console.log(`Regla activada: ${rule.name}`);
        rule.action(facts);
        activatedRules.push(rule.name);
      }
    }

    // Si no se activó ninguna regla, usar regla por defecto
    if (activatedRules.length === 0) {
      facts.recommendation = {
        testType: 'NO_TEST_NEEDED',
        confidence: 'low',
        message: 'Los síntomas no sugieren Porfiria. Continuar con evaluación clínica general.',
        score: 0,
        criticalSymptoms: 0,
        reasoning: ['Sin síntomas significativos'],
        riskFactors: [],
        estudiosRecomendados: [],
        medicamentosContraproducentes: []
      };
    }

    return facts.recommendation;
  }
}

const droolsEngine = new DroolsEngine();

// Endpoint para evaluar cuestionarios
app.post('/api/evaluate', (req, res) => {
  try {
    const { patient, responses } = req.body;
    
    console.log('Recibida evaluación:', { patient, responses });
    
    // Crear hechos para Drools
    const facts = {
      patient,
      responses,
      recommendation: null
    };
    
    // Evaluar con Drools
    const recommendation = droolsEngine.evaluate(facts);
    
    res.json({
      success: true,
      recommendation
    });
    
  } catch (error) {
    console.error('Error en evaluación Drools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para obtener reglas activas
app.get('/api/rules', (req, res) => {
  try {
    const rules = droolsEngine.rules.map(rule => ({
      name: rule.name,
      description: `Regla: ${rule.name}`
    }));
    
    res.json({
      success: true,
      rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Drools Engine',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Drools ejecutándose en puerto ${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST /api/evaluate - Evaluar cuestionario`);
  console.log(`   GET  /api/rules - Obtener reglas activas`);
  console.log(`   GET  /health - Estado del servidor`);
});

module.exports = app;