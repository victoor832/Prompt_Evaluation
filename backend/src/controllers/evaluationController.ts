import { AIService } from '../services/aiService';
import express, { Request, Response } from 'express';
import { EvaluationResponse } from '../types/index';

export interface EvaluationRequest {
    originalText: string;
    modifiedText: string;
    criteria: string[] | string;
    userId?: string;
}

export class EvaluationController {
    private aiService: AIService;

    constructor(aiService: AIService) {
        this.aiService = aiService;
    }
    
    public async evaluateTexts(req: express.Request, res: Response): Promise<void> {
        try {
            const { originalText, modifiedText, criteria, userId }: EvaluationRequest = req.body;
            
            // Convertir criteria a string si es un array
            const criteriaString = Array.isArray(criteria) ? criteria.join(', ') : criteria;
            
            // Usar un userId predeterminado si no se proporciona uno
            const userIdentifier = userId || 'anonymous_user';

            const evaluationResults: EvaluationResponse = await this.aiService.evaluateTexts(
                originalText, 
                modifiedText, 
                criteriaString,
                userIdentifier
            );
            res.json(evaluationResults);
        } catch (error) {
            res.status(500).json({ error: 'Error evaluating texts' });
        }
    }
}