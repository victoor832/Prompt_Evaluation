import express from 'express';
import path from 'path';
import { setRoutes } from './routes/index';
import 'dotenv/config';
import { AIService } from './services/aiService';
import { predefinedChallenges } from './challenges/challenges';
import * as evaluationController from './controllers/evaluationController';
// import { DatabaseService } from './services/databaseService';
import * as rankingController from './controllers/rankingController';


const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// 1. Inicializar singleton de base de datos
// dbService.connect().catch((err: any) => {
//   console.warn('No se pudo conectar a MongoDB inicialmente:', err.message);
// });
// const dbService = DatabaseService.getInstance();
// dbService.connect().catch(err => {
//   console.warn('No se pudo conectar a MongoDB inicialmente:', err.message);
// });

// 2. Middleware generales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Middleware para verificación de admin
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

// 4. Rutas generales
setRoutes(app);


app.get('/api/ranking', rankingController.getRanking);

// 5. Rutas específicas de la API
app.get('/api/test', (_req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

app.get('/api/challenges', (req, res) => {
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
  } catch (error) {
    console.error('Error al obtener retos:', error);
    res.status(500).json({ error: 'Error al obtener retos predefinidos' });
  }
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

// 6. Rutas para admin (protegidas)
app.get('/api/admin/evaluations', adminAuth, async (req, res) => {
  // MongoDB deshabilitado
  return res.status(501).json({ error: 'Funcionalidad no implementada: almacenamiento de evaluaciones deshabilitado.' });
});

app.get('/api/admin/evaluations/download', adminAuth, async (req, res) => {
  // MongoDB deshabilitado
  return res.status(501).json({ error: 'Funcionalidad no implementada: descarga de evaluaciones deshabilitada.' });
});

app.get('/api/evaluations/user/:userId', async (req, res) => {
  // MongoDB deshabilitado
  return res.status(501).json({ error: 'Funcionalidad no implementada: consulta de evaluaciones por usuario deshabilitada.' });
});

// Determinar si estamos en modo producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

// Solo servir archivos estáticos en producción
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // En desarrollo, solo manejar rutas que comiencen con /api
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).json({ 
        error: 'Frontend route not handled by backend in development mode',
        message: 'Use the React development server on port 3000 for frontend routes'
      });
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// 9. Middleware de "ruta no encontrada" - solo se ejecutará para rutas que no coincidan con nada
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// 10. Iniciar el servidor - siempre debe ser lo último
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/api/test`);
});