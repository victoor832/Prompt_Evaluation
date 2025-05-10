import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluationController';
import { AIService } from '../services/aiService'; // Import AIService

const router = Router();
const aiService = new AIService(); // Create an instance of AIService
const evaluationController = new EvaluationController(aiService);

export const setRoutes = (app: unknown) => {
    router.post('/evaluate', evaluationController.evaluateTexts);
    return router;
};