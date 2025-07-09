import { Groq } from "groq-sdk";
import { EvaluationResponse } from '../types';
import { getChallengeById } from '../challenges/challenges';
// import { DatabaseService } from './databaseService';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class AIService {
  private groq: Groq;
  // private dbService: any;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        throw new Error('GROQ_API_KEY no está configurada. Asegúrate de tener un archivo .env con esta variable.');
    }
    
    this.groq = new Groq({ apiKey });
    
    // No usar base de datos
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

  // Método auxiliar para procesar el texto y enfocar en el prompt del usuario
  private processEvaluationText(text: string): string {
    // Fase 1: Reemplazar referencias directas a Prompt/Texto 1 y 2
    let processed = text.replace(/Prompt 1|Texto 1/gi, "prompt predeterminado");
    processed = processed.replace(/Prompt 2|Texto 2/gi, "prompt del usuario");
    
    // Fase 2: Eliminar o transformar secciones sobre el prompt predeterminado
    
    // Eliminar frases que comparan directamente ambos prompts
    processed = processed.replace(/el prompt predeterminado es (mejor|peor) que el prompt del usuario[^.]*\./gi, "");
    processed = processed.replace(/[^.]*?comparado con el prompt predeterminado[^.]*\./gi, "");
    processed = processed.replace(/[^.]*?a diferencia del prompt predeterminado[^.]*\./gi, "");
    processed = processed.replace(/el prompt predeterminado[^.]*?mientras que el prompt del usuario/gi, "El prompt del usuario");
    
    // Eliminar oraciones completas que solo hablan del prompt predeterminado
    const sentences = processed.split(/(?<=[.!?])\s+/);
    processed = sentences
      .filter(sentence => {
        // Mantener oraciones que no mencionan exclusivamente al prompt predeterminado
        const onlyMentionsBasePrompt = 
          sentence.toLowerCase().includes("prompt predeterminado") && 
          !sentence.toLowerCase().includes("prompt del usuario");
        
        // Filtrar oraciones que solo hablan del prompt predeterminado
        return !onlyMentionsBasePrompt;
      })
      .join(" ");
    
    // Fase 3: Eliminar cualquier mención restante al prompt predeterminado
    processed = processed.replace(/prompt predeterminado/gi, "prompt que propone el reto");
    
    return processed;
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
      
      INSTRUCCIONES DE FORMATO:
      - Puedes usar formato Markdown para resaltar puntos importantes (**negrita**, *cursiva*, listas con - o 1. etc.)
      - Mantén una estructura clara con párrafos separados por líneas en blanco
      - Usa **negrita** para destacar aspectos clave
      - Cuando te refieras a los prompts, usa "prompt predeterminado" y "prompt del usuario" en lugar de "Prompt 1" y "Prompt 2"
      - En la JUSTIFICACIÓN, enfócate en analizar el "prompt del usuario", sus fortalezas y debilidades
      - En la CONCLUSIÓN, evalúa principalmente el prompt del usuario y sus méritos propios
      - En las RECOMENDACIONES, concéntrate en mejorar el prompt del usuario independientemente de su puntuación
      
      Debes seguir ESTRICTAMENTE este formato en tu respuesta (sin desviarte):
      
      PUNTUACIÓN TEXTO 1: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      PUNTUACIÓN TEXTO 2: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      JUSTIFICACIÓN: [tu análisis detallado del prompt del usuario, usa Markdown para formatear]
      CONCLUSIÓN: [indica claramente las fortalezas o debilidades del prompt del usuario en 1-2 frases]
      RECOMENDACIONES: [sugiere al menos 3 formas concretas de mejorar el prompt del usuario, usa listas con -]
    `;
  
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: evaluationPrompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.8,
        max_tokens: 1500,
      });
      
      const evaluationText = response.choices[0].message.content || "";
      
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
      
      // Procesar textos para enfocar en el prompt del usuario
      let justification = justificationMatch ? justificationMatch[1].trim() : "No se proporcionó justificación.";
      let conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No se proporcionó conclusión.";
      let recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "No se proporcionaron recomendaciones.";
      
      // Aplicar procesamiento de texto a cada sección
      justification = this.processEvaluationText(justification);
      conclusion = this.processEvaluationText(conclusion);
      recommendations = this.processEvaluationText(recommendations);
      
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
        // Guardado en base de datos deshabilitado
      } catch (dbError) {
        console.error('Error al guardar en MongoDB, continuando con respaldo local:', dbError);
        // No detener el flujo si falla MongoDB, ya tenemos respaldo local
      }
      
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
      
      INSTRUCCIONES DE FORMATO:
      - Puedes usar formato Markdown para resaltar puntos importantes (**negrita**, *cursiva*, listas con - o 1. etc.)
      - Mantén una estructura clara con párrafos separados por líneas en blanco
      - Usa **negrita** para destacar aspectos clave
      - Cuando te refieras a los textos, usa "texto predeterminado" y "texto del usuario" en lugar de "Texto 1" y "Texto 2"
      - En la JUSTIFICACIÓN, enfócate en analizar el "texto del usuario", sus fortalezas y debilidades
      - En la CONCLUSIÓN, evalúa principalmente el texto del usuario y sus méritos propios
      - En las RECOMENDACIONES, concéntrate en mejorar el texto del usuario independientemente de su puntuación
      
      Debes seguir ESTRICTAMENTE este formato en tu respuesta (sin desviarte):
      
      PUNTUACIÓN TEXTO 1: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      PUNTUACIÓN TEXTO 2: [un número entre 0.00 y 100.00 con exactamente dos decimales]
      JUSTIFICACIÓN: [tu análisis detallado del texto del usuario, usa Markdown para formatear]
      CONCLUSIÓN: [indica claramente las fortalezas o debilidades del texto del usuario en 1-2 frases]
      RECOMENDACIONES: [sugiere al menos 3 formas concretas de mejorar el texto del usuario, usa listas con -]
    `;
  
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: evaluationPrompt }],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.1, // Reducimos la temperatura para respuestas más consistentes
        max_tokens: 1500, // Aumentamos el límite para permitir respuestas más detalladas
      });
      
      const evaluationText = response.choices[0].message.content || "";
      
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
      
      // Procesar textos para enfocar en el texto del usuario
      let justification = justificationMatch ? justificationMatch[1].trim() : "No se proporcionó justificación.";
      let conclusion = conclusionMatch ? conclusionMatch[1].trim() : "No se proporcionó conclusión.";
      let recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "No se proporcionaron recomendaciones.";
      
      // Aplicar procesamiento de texto a cada sección
      justification = this.processEvaluationText(justification);
      conclusion = this.processEvaluationText(conclusion);
      recommendations = this.processEvaluationText(recommendations);
      
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

      try {
        // Guardado en base de datos deshabilitado
      } catch (dbError) {
        console.error('Error al guardar en MongoDB, continuando con respaldo local:', dbError);
        // No detener el flujo si falla MongoDB, ya tenemos respaldo local
      }
      
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