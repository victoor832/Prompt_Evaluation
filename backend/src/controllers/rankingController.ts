import { Request, Response } from 'express';
import { DatabaseService } from '../services/databaseService';

const dbService = DatabaseService.getInstance();

export const getRanking = async (req: Request, res: Response) => {
  try {
    const searchUsername = req.query.username as string | undefined;
    
    // Obtenemos todas las evaluaciones y agrupamos por usuario
    const evaluations = await dbService.getAllEvaluations(1000);
    
    // Creamos un mapa para calcular las puntuaciones totales por usuario
    const userScores = new Map<string, { username: string, score: number, evaluationCount: number }>();
    
    // Procesar las evaluaciones para calcular puntuaciones
    evaluations.forEach(evaluation => {
        if (!evaluation.userId || evaluation.userId === 'anonymous_user') return;
        
        const username = evaluation.username || evaluation.userId;
        const score = evaluation.grade || 0;
        
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
      .map(user => ({
        username: user.username,
        score: Math.round((user.score / user.evaluationCount) * 10) / 10 // Promedio redondeado a 1 decimal
      }))
      .sort((a, b) => b.score - a.score);
    
    // Filtrar por nombre de usuario si se proporciona
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