import express from 'express';
import path from 'path';
import { setRoutes } from './routes/index';
import 'dotenv/config';
import { AIService } from './services/aiService';
import { predefinedChallenges } from './challenges/challenges';
import * as evaluationController from './controllers/evaluationController';
import { DatabaseService } from './services/databaseService'; // Añadir esta importación

const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;
// Inicializar singleton de base de datos
const dbService = DatabaseService.getInstance();
dbService.connect().catch(err => {
  console.warn('No se pudo conectar a MongoDB inicialmente:', err.message);
});
// Middleware para verificación de admin
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-api-key'];
  
  if (!adminKey) {
    return res.status(500).json({ error: 'ADMIN_API_KEY no configurada en el servidor' });
  }
  
  if (providedKey === adminKey) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
};

// Pon estas definiciones en este orden:
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Primero configura las rutas generales
setRoutes(app);

// Endpoint para obtener todas las evaluaciones (solo admin)
app.get('/api/admin/evaluations', adminAuth, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const evaluations = await dbService.getAllEvaluations(limit);
    return res.json(evaluations);
  } catch (error: any) {
    console.error('Error al obtener evaluaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint para obtener evaluaciones por usuario
app.get('/api/evaluations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const evaluations = await dbService.getEvaluationsByUser(userId);
    return res.json(evaluations);
  } catch (error: any) {
    console.error(`Error al obtener evaluaciones del usuario ${req.params.userId}:`, error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint para descargar todas las evaluaciones como archivo (solo admin)
app.get('/api/admin/evaluations/download', adminAuth, async (req, res) => {
  try {
    const evaluations = await dbService.getAllEvaluations(1000);
    
    // Crear un nombre de archivo con la fecha actual
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `evaluaciones_${timestamp}.json`;
    
    // Configurar las cabeceras para descarga
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/json');
    
    // Enviar los datos como un archivo para descargar
    res.json(evaluations);
  } catch (error: any) {
    console.error('Error al descargar evaluaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Luego las rutas específicas
app.get('/api/test', (_req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const { originalText, modifiedText, criteria, userId = "anonymous_user" } = req.body;
    
    // Validar que se recibieron todos los datos necesarios
    if (!originalText || !modifiedText || !criteria) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren originalText, modifiedText y criteria'
      });
    }
    
    const aiService = new AIService();
    const result = await aiService.evaluateTexts(originalText, modifiedText, criteria, userId);
          
    return res.json(result);
  } catch (error: any) {
    console.error('Error en ruta /api/evaluate:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener la lista de retos predefinidos
app.get('/api/challenges', (req, res) => {
  console.log('Solicitud recibida para /api/challenges');
  try {
    // Enviar solo la información pública de los retos
    const publicChallenges = predefinedChallenges.map(({ id, title, description }) => ({
      id,
      title,
      description
    }));
    
    // Asegurar que la respuesta tenga el tipo MIME correcto
    res.setHeader('Content-Type', 'application/json');
    res.json(publicChallenges);
    console.log('Retos enviados:', publicChallenges.length);
  } catch (error) {
    console.error('Error al obtener retos:', error);
    res.status(500).json({ error: 'Error al obtener retos predefinidos' });
  }
});

// Endpoint para evaluar un reto predefinido
app.post('/api/evaluate-challenge', async (req, res) => {
  try {
    const { challengeId, userPrompt, userId = "anonymous_user" } = req.body;
    
    // Validar datos
    if (!challengeId || !userPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren challengeId y userPrompt'
      });
    }
    
    const aiService = new AIService();
    const result = await aiService.evaluatePredefinedChallenge(challengeId, userPrompt, userId);
          
    return res.json(result);
  } catch (error: any) {
    console.error('Error en ruta /api/evaluate-challenge:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// El middleware de "ruta no encontrada" debe ir al final
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/api/test`);
});

// Reemplaza por una ruta simple para la raíz
app.get('/', (req, res) => {
  res.json({ message: 'API server running' });
});