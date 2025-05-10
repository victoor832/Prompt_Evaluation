import axios from 'axios';

// Define la URL base para las llamadas a la API
const API_BASE_URL = 'http://localhost:3001/api';

// Interfaz para los parámetros de evaluación
export interface EvaluatePromptsParams {
  challenge: string;
  basePrompt: string;
  userPrompt: string;
  criteria: string;
  userId: string;
}

// Función para evaluar los prompts
export const evaluatePrompts = async ({
  challenge,
  basePrompt,
  userPrompt,
  criteria,
  userId
}: EvaluatePromptsParams) => {
  try {
    // Usar axios en lugar de fetch para mejor manejo de errores
    const response = await axios.post(`${API_BASE_URL}/evaluate`, {
      originalText: basePrompt,
      modifiedText: userPrompt,
      criteria,
      userId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en la API:', error);
    throw new Error('Error en la respuesta del servidor');
  }
};