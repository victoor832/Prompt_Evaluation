import { Groq } from "groq-sdk";
import { EvaluationResponse } from '../types';
import { getChallengeById } from '../challenges/challenges';
import { DatabaseService } from './databaseService';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class AIService {
  private groq: Groq;
  private dbService: DatabaseService;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        throw new Error('GROQ_API_KEY no está configurada. Asegúrate de tener un archivo .env con esta variable.');
    }
    
    this.groq = new Groq({ apiKey });
    
    // Usar el patrón singleton para la base de datos
    this.dbService = DatabaseService.getInstance();
    
    // Iniciar la conexión en la construcción
    this.dbService.connect().catch(err => {
      console.warn('No se pudo conectar a MongoDB inicialmente, se reintentará en las operaciones:', err.message);
    });
  }
  
  // Método para guardar la evaluación en un archivo
  private saveEvaluationToFile(userId: string, evaluationData: EvaluationResponse, challengeId: string = 'custom'): void {
    try {
      // Crear directorio para evaluaciones si no existe
      const evaluationsDir = path.join(__dirname, '../../evaluations');
      if (!fs.existsSync(evaluationsDir)) {
        fs.mkdirSync(evaluationsDir, { recursive: true });
      }
      
      // Crear un nombre de archivo seguro con timestamp para evitar duplicados
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeUserId = userId.replace(/[^a-z0-9_-]/gi, '_');
      const filename = `${safeUserId}_${challengeId}_${timestamp}.txt`;
      const filePath = path.join(evaluationsDir, filename);
      
      // Obtener información del reto
      const challenge = getChallengeById(challengeId);
      
      // Preparar el contenido del archivo
      let fileContent = `EVALUACIÓN DE PROMPTS\n`;
      fileContent += `=====================\n`;
      fileContent += `Usuario: ${userId}\n`;
      fileContent += `Fecha: ${new Date().toLocaleString()}\n`;
      fileContent += `Reto: ${challenge?.title || challengeId}\n\n`;
      fileContent += `Descripción: ${challenge?.description || 'No disponible'}\n`;
      fileContent += `Prompt base: ${challenge?.basePrompt || 'No disponible'}\n`;
      fileContent += `Criterios: ${challenge?.criteria || 'No disponible'}\n\n`;
      
      // Extraer los datos de evaluación
      const evaluation = evaluationData.evaluation;
      if (typeof evaluation === 'string') {
        fileContent += `RESULTADO COMPLETO:\n${evaluation}\n`;
      } else {
        fileContent += `PUNTUACIONES\n-----------\n`;
        fileContent += `Prompt Base: ${evaluation.score1}\n`;
        fileContent += `Prompt Mejorado: ${evaluation.score2}\n\n`;
        
        fileContent += `JUSTIFICACIÓN\n-----------\n`;
        fileContent += `${evaluation.justification}\n\n`;
        
        fileContent += `CONCLUSIÓN\n-----------\n`;
        fileContent += `${evaluation.conclusion}\n\n`;
        
        fileContent += `RECOMENDACIONES\n-----------\n`;
        fileContent += `${evaluation.recommendations}\n\n`;
        
        fileContent += `RESPUESTA COMPLETA\n-----------\n`;
        fileContent += `${evaluation.rawResponse}\n`;
      }
      
      // Escribir el archivo
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`✅ Evaluación guardada en archivo: ${filePath}`);
      
      // También guardamos una copia en formato JSON para fácil procesamiento
      const jsonFilePath = path.join(evaluationsDir, `${safeUserId}_${challengeId}_${timestamp}.json`);
      fs.writeFileSync(jsonFilePath, JSON.stringify({
        ...evaluationData,
        challengeId,
        challengeDetails: challenge
      }, null, 2), 'utf8');
      
    } catch (error) {
      console.error('❌ Error al guardar la evaluación en archivo:', error);
    }
  }

  async evaluatePredefinedChallenge(challengeId: string, userPrompt: string, userId: string): Promise<EvaluationResponse> {
    // Obtener el reto predefinido
    const challenge = getChallengeById(challengeId);
    
    if (!challenge) {
      console.error(`Error: Reto con ID ${challengeId} no encontrado`);
      return {
        evaluation: `Error: Reto no encontrado`,
        userId,
        success: false,
        error: `Reto con ID ${challengeId} no existe`,
        timestamp: new Date().toISOString()
      };
    }
    
    // Extraer el prompt base y criterios del reto predefinido
    const { basePrompt, criteria } = challenge;
    
    // Validar inputs
    if (!userPrompt) {
      console.error("Error: Prompt del usuario no proporcionado");
      return {
        evaluation: "Error: Debes proporcionar tu versión mejorada del prompt",
        userId,
        success: false,
        error: "Prompt de usuario no proporcionado",
        timestamp: new Date().toISOString()
      };
    }

    if (!userId) {
      userId = "usuario_anónimo";
      console.warn("Se está evaluando sin ID de usuario");
    }
  
    const evaluationPrompt = `
      Eres un evaluador experto de prompts. Analiza estos dos prompts y determina cuál cumple mejor el objetivo: "${criteria}".
      
      Prompt 1 (Base): ${basePrompt}
      
      Prompt 2 (Mejorado): ${userPrompt}
      
      Debes seguir ESTRICTAMENTE este formato en tu respuesta (sin desviarte):
      
      PUNTUACIÓN TEXTO 1: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      PUNTUACIÓN TEXTO 2: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      JUSTIFICACIÓN: [tu análisis detallado comparando ambos prompts, mínimo 100 palabras]
      CONCLUSIÓN: [indica claramente qué prompt es mejor y por qué en 1-2 frases]
      RECOMENDACIONES: [sugiere al menos 3 formas concretas de mejorar el prompt con menor puntuación]
    `;
  
    try {
      console.log(`Enviando solicitud de evaluación a Groq para el usuario ${userId}, reto: ${challengeId}`);
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: evaluationPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 1500,
      });
      
      const evaluationText = response.choices[0].message.content || "";
      console.log("Respuesta de evaluación recibida:", evaluationText.substring(0, 100) + "...");
      
      // Extraer y validar los componentes de la respuesta
      const scoreRegex1 = /PUNTUACIÓN TEXTO 1:\s*(\d+(?:\.\d{2})?)/i;
      const scoreRegex2 = /PUNTUACIÓN TEXTO 2:\s*(\d+(?:\.\d{2})?)/i;
      const justificationRegex = /JUSTIFICACIÓN:\s*([\s\S]*?)(?=CONCLUSIÓN:|$)/i;
      const conclusionRegex = /CONCLUSIÓN:\s*([\s\S]*?)(?=RECOMENDACIONES:|$)/i;
      const recommendationsRegex = /RECOMENDACIONES:\s*([\s\S]*?)(?=$)/i;
      
      // Extraer valores
      const score1Match = evaluationText.match(scoreRegex1);
      const score2Match = evaluationText.match(scoreRegex2);
      const justificationMatch = evaluationText.match(justificationRegex);
      const conclusionMatch = evaluationText.match(conclusionRegex);
      const recommendationsMatch = evaluationText.match(recommendationsRegex);
      
      // Procesar valores extraídos
      let score1 = score1Match ? parseFloat(score1Match[1]) : 0;
      let score2 = score2Match ? parseFloat(score2Match[1]) : 0;
      const justification = justificationMatch ? justificationMatch[1].trim() : "No se proporcionó justificación.";
      const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No se proporcionó conclusión.";
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "No se proporcionaron recomendaciones.";
      
      // Asegurar que las puntuaciones estén en el rango 0-100 con dos decimales
      score1 = Math.max(0, Math.min(100, score1));
      score2 = Math.max(0, Math.min(100, score2));
      const formattedScore1 = score1.toFixed(2);
      const formattedScore2 = score2.toFixed(2);
      
      // Construir respuesta estructurada
      const structuredEvaluation = {
        score1: formattedScore1,
        score2: formattedScore2,
        justification,
        conclusion,
        recommendations,
        rawResponse: evaluationText
      };
      
      const evaluationResponse = {
        evaluation: structuredEvaluation,
        userId,
        success: true,
        timestamp: new Date().toISOString()
      };
      
      // Guardar la evaluación en un archivo local
      this.saveEvaluationToFile(userId, evaluationResponse, challengeId);

      try {
        await this.dbService.saveEvaluation(evaluationResponse, challengeId);
        console.log('Evaluación guardada en MongoDB correctamente');
      } catch (dbError) {
        console.error('Error al guardar en MongoDB, continuando con respaldo local:', dbError);
        // No detener el flujo si falla MongoDB, ya tenemos respaldo local
      }

      // Guardar en base de datos
      await this.dbService.saveEvaluation(evaluationResponse, challengeId);
      
      return evaluationResponse;
    } catch (error: any) {
      console.error("Error detallado al evaluar textos con Groq:", error);
      const errorResponse = {
        evaluation: "Error al evaluar los prompts. Por favor, intente nuevamente.",
        userId,
        success: false,
        error: error.message || "Error desconocido",
        timestamp: new Date().toISOString()
      };
      
      // También guardar los errores para análisis
      this.saveEvaluationToFile(`error_${userId}`, errorResponse, challengeId);
      
      return errorResponse;
    }
  }

  async evaluateTexts(originalText: string, modifiedText: string, criteria: string, userId: string): Promise<EvaluationResponse> {
    // Validaciones para evitar llamadas innecesarias a la API
    if (!originalText || !modifiedText || !criteria) {
      console.error("Error: Datos de entrada incompletos para la evaluación");
      throw new Error("Se requieren dos textos y un criterio para la evaluación");
    }

    if (!userId) {
      userId = "usuario_anónimo";
      console.warn("Se está evaluando sin ID de usuario");
    }
  
    const evaluationPrompt = `
      Eres un evaluador experto de textos. Analiza estos dos textos y determina cuál cumple mejor el objetivo: "${criteria}".
      
      Texto 1: ${originalText}
      
      Texto 2: ${modifiedText}
      
      Debes seguir ESTRICTAMENTE este formato en tu respuesta (sin desviarte):
      
      PUNTUACIÓN TEXTO 1: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      PUNTUACIÓN TEXTO 2: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      JUSTIFICACIÓN: [tu análisis detallado comparando ambos textos, mínimo 100 palabras]
      CONCLUSIÓN: [indica claramente qué texto es mejor y por qué en 1-2 frases]
      RECOMENDACIONES: [sugiere al menos 3 formas concretas de mejorar el texto con menor puntuación]
    `;
  
    try {
      console.log(`Enviando solicitud de evaluación a Groq para el usuario ${userId}...`);
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: evaluationPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Reducimos la temperatura para respuestas más consistentes
        max_tokens: 1500, // Aumentamos el límite para permitir respuestas más detalladas
      });
      
      const evaluationText = response.choices[0].message.content || "";
      console.log("Respuesta de evaluación recibida:", evaluationText.substring(0, 100) + "...");
      
      // Extraer y validar los componentes de la respuesta
      const scoreRegex1 = /PUNTUACIÓN TEXTO 1:\s*(\d+(?:\.\d{2})?)/i;
      const scoreRegex2 = /PUNTUACIÓN TEXTO 2:\s*(\d+(?:\.\d{2})?)/i;
      const justificationRegex = /JUSTIFICACIÓN:\s*([\s\S]*?)(?=CONCLUSIÓN:|$)/i;
      const conclusionRegex = /CONCLUSIÓN:\s*([\s\S]*?)(?=RECOMENDACIONES:|$)/i;
      const recommendationsRegex = /RECOMENDACIONES:\s*([\s\S]*?)(?=$)/i;
      
      // Extraer valores
      const score1Match = evaluationText.match(scoreRegex1);
      const score2Match = evaluationText.match(scoreRegex2);
      const justificationMatch = evaluationText.match(justificationRegex);
      const conclusionMatch = evaluationText.match(conclusionRegex);
      const recommendationsMatch = evaluationText.match(recommendationsRegex);
      
      // Procesar valores extraídos
      let score1 = score1Match ? parseFloat(score1Match[1]) : 0;
      let score2 = score2Match ? parseFloat(score2Match[1]) : 0;
      const justification = justificationMatch ? justificationMatch[1].trim() : "No se proporcionó justificación.";
      const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No se proporcionó conclusión.";
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "No se proporcionaron recomendaciones.";
      
      // Asegurar que las puntuaciones estén en el rango 0-100 con dos decimales
      score1 = Math.max(0, Math.min(100, score1));
      score2 = Math.max(0, Math.min(100, score2));
      const formattedScore1 = score1.toFixed(2);
      const formattedScore2 = score2.toFixed(2);
      
      // Construir respuesta estructurada
      const structuredEvaluation = {
        score1: formattedScore1,
        score2: formattedScore2,
        justification,
        conclusion,
        recommendations,
        rawResponse: evaluationText
      };
      
      const evaluationResponse = {
        evaluation: structuredEvaluation,
        userId,
        success: true,
        timestamp: new Date().toISOString()
      };
      
      // Guardar la evaluación en un archivo local
      this.saveEvaluationToFile(userId, evaluationResponse, 'custom');
      
      return evaluationResponse;
    } catch (error: any) {
      console.error("Error detallado al evaluar textos con Groq:", error);
      const errorResponse = {
        evaluation: "Error al evaluar los textos. Por favor, intente nuevamente.",
        userId,
        success: false,
        error: error.message || "Error desconocido",
        timestamp: new Date().toISOString()
      };
      
      // También guardar los errores para análisis
      this.saveEvaluationToFile(`error_${userId}`, errorResponse, 'custom');
      
      return errorResponse;
    }
  }
}