import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
// import { DatabaseService } from '../services/databaseService';

// Interfaces actualizadas para reflejar la estructura real
interface EvaluationData {
  score1?: string | number;
  score2?: string | number;
  justification?: string;
  conclusion?: string;
  recommendations?: string;
  rawResponse?: string;
  [key: string]: any;
}

interface Evaluation {
  userId: string;
  username?: string;
  evaluation?: EvaluationData; // Aquí está el objeto anidado
  success?: boolean;
  timestamp?: string;
  challengeId?: string;
  [key: string]: any;
}

// const dbService = DatabaseService.getInstance();

export const getRanking = async (req: Request, res: Response) => {
  try {
    const searchUsername = req.query.username as string | undefined;
    
    // Leer todas las evaluaciones desde archivos JSON en la carpeta /backend/evaluations
    const evaluationsDir = path.join(__dirname, '../../evaluations');
    let evaluations: Evaluation[] = [];
    if (fs.existsSync(evaluationsDir)) {
      const files = fs.readdirSync(evaluationsDir).filter(f => f.endsWith('.json'));
      evaluations = files.flatMap(file => {
        try {
          const data = fs.readFileSync(path.join(evaluationsDir, file), 'utf8');
          const evalObj = JSON.parse(data);
          return Array.isArray(evalObj) ? evalObj : [evalObj];
        } catch (err) {
          console.warn(`No se pudo leer el archivo ${file}:`, err);
          return [];
        }
      });
    }
    // Creamos un mapa para calcular las puntuaciones por usuario
    const userScores = new Map<string, { username: string, score: number, evaluationCount: number }>();
    // Procesar las evaluaciones para calcular puntuaciones
    evaluations.forEach((evaluation: Evaluation) => {
      if (!evaluation.userId || evaluation.userId === 'anonymous_user') return;
      const username = evaluation.username || evaluation.userId;
      // Extraer y verificar la puntuación - corregido para la estructura anidada
      let score = 0;
      // 1. Verificar si existe el objeto evaluation anidado y score2 dentro de él
      if (evaluation.evaluation && evaluation.evaluation.score2 !== undefined) {
        score = typeof evaluation.evaluation.score2 === 'number' ? 
                evaluation.evaluation.score2 : 
                parseFloat(String(evaluation.evaluation.score2));
      }
      
      // Acumular puntuaciones
      if (userScores.has(evaluation.userId)) {
        const currentData = userScores.get(evaluation.userId)!;
        userScores.set(evaluation.userId, {
          username,
          score: currentData.score + score,
          evaluationCount: currentData.evaluationCount + 1
        });
      } else {
        userScores.set(evaluation.userId, {
          username,
          score,
          evaluationCount: 1
        });
      }
    });
    
    // Convertir a array y ordenar por puntuación
    let ranking = Array.from(userScores.values())
      .map(user => {
        const avgScore = user.evaluationCount > 0 
          ? Math.round((user.score / user.evaluationCount) * 10) / 10 
          : 0;
          
        return {
          username: user.username,
          score: avgScore
        };
      })
      .sort((a, b) => b.score - a.score);
        
    // Añadir datos de ejemplo si no hay resultados
    if (ranking.length === 0) {
      console.log('No se encontraron evaluaciones. Agregando datos de ejemplo.');
    }
    
    // Filtrar por búsqueda
    if (searchUsername) {
      ranking = ranking.filter(user => 
        user.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }
    
    return res.json(ranking);
  } catch (error: any) {
    console.error('Error al obtener ranking:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};