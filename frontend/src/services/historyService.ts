// Definir interfaz para los elementos del historial
export interface HistoryItem {
  id: string;
  timestamp: string;
  userId: string;
  score1: string;
  score2: string;
  challengeTitle?: string;
  challengeId?: string;
}

// Evento personalizado para notificar cambios en el historial
export const HISTORY_UPDATED_EVENT = 'historyUpdated';

// Clave para localStorage
const HISTORY_STORAGE_KEY = 'prompt_evaluation_history';
const MAX_HISTORY_ITEMS = 20;

// Obtener historial completo
export const getHistory = (): HistoryItem[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!storedHistory) return [];
    
    return JSON.parse(storedHistory);
  } catch (error) {
    console.error('Error parsing history from localStorage:', error);
    return [];
  }
};

// Guardar un nuevo elemento en el historial
export const saveToHistory = (evaluation: any, challengeTitle?: string): void => {
  // Asegurarse de que la evaluación tenga la estructura correcta
  if (!evaluation || !evaluation.success) return;
  
  try {
    // Obtener el historial actual
    const history = getHistory();
    
    // Extraer las puntuaciones correctamente
    let score1 = 'N/A';
    let score2 = 'N/A';
    
    if (typeof evaluation.evaluation === 'object') {
      score1 = evaluation.evaluation.score1 || 'N/A';
      score2 = evaluation.evaluation.score2 || 'N/A';
    } else if (typeof evaluation.evaluation === 'string') {
      // Intentar extraer puntuaciones del texto
      const score1Match = evaluation.evaluation.match(/PUNTUACIÓN TEXTO 1: ([0-9.]+)/i);
      const score2Match = evaluation.evaluation.match(/PUNTUACIÓN TEXTO 2: ([0-9.]+)/i);
      
      if (score1Match && score1Match[1]) score1 = score1Match[1];
      if (score2Match && score2Match[1]) score2 = score2Match[1];
    }
    
    // Crear nuevo elemento de historial
    const historyItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      timestamp: evaluation.timestamp || new Date().toISOString(),
      userId: evaluation.userId || 'anonymous_user',
      score1: score1,
      score2: score2,
      challengeTitle: challengeTitle || 'Evaluación personalizada',
      challengeId: evaluation.challengeId,
    };
    
    // Añadir al inicio del array y limitar el tamaño
    const updatedHistory = [historyItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    // Guardar en localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Disparar evento para notificar cambios
    const event = new Event(HISTORY_UPDATED_EVENT);
    window.dispatchEvent(event);
    
    console.log('Evaluación guardada en historial:', historyItem);
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

// Eliminar un elemento del historial
export const removeFromHistory = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Disparar evento para notificar cambios
    const event = new Event(HISTORY_UPDATED_EVENT);
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error removing from history:', error);
  }
};

// Limpiar todo el historial
export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  
  // Disparar evento para notificar cambios
  const event = new Event(HISTORY_UPDATED_EVENT);
  window.dispatchEvent(event);
};