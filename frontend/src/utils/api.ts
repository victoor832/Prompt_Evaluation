import axios from 'axios';

// Define la URL base para las llamadas a la API
const API_BASE_URL = '/api';

/// Interfaz para los retos
export interface Challenge {
  id: string;
  title: string;
  description: string;
}

// Interfaz para los parámetros de evaluación
export interface EvaluatePromptsParams {
  challenge: Challenge;
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

// Función para obtener los retos predefinidos
export const getChallenges = async (): Promise<Challenge[]> => {
  try {
    // Usar axios de manera consistente con evaluatePrompts
    const response = await axios.get<Challenge[]>(`${API_BASE_URL}/challenges`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener retos:', error);
    throw new Error('Error al cargar los retos predefinidos');
  }
};