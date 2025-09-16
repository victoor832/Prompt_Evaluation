import React, { useState, useEffect, useCallback } from 'react';
import ChallengeSelector from './ChallengeSelector';
import { API_BASE_URL } from '../utils/api';
import { saveToHistory } from '../services/historyService';
import { Challenge } from '../types';
import './AssessmentForm.css'; // Asegúrate de tener estilos para el componente

// Definir claves para localStorage
const USER_PROMPT_KEY = 'draft_user_prompt';
const SELECTED_CHALLENGE_KEY = 'draft_selected_challenge';
const USER_NAME_KEY = 'user_name'; // Clave para el nombre de usuario

// Interfaz para props del componente
interface AssessmentFormProps {
  setResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ setResults, setLoading }) => {
  // Estado para desafíos
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [errorLoadingChallenges, setErrorLoadingChallenges] = useState(false);
  
  // Inicializar con valores guardados
  const [selectedChallengeId, setSelectedChallengeId] = useState(() => {
    return localStorage.getItem(SELECTED_CHALLENGE_KEY) || '';
  });
  
  const [userPrompt, setUserPrompt] = useState(() => {
    return localStorage.getItem(USER_PROMPT_KEY) || '';
  });
  
  // Estado para el nombre de usuario
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem(USER_NAME_KEY) || '';
  });
  
  // Estado para mensaje de guardado
  const [saveStatus, setSaveStatus] = useState<string>('');
  
  // Cargar desafíos con propiedad criteria garantizada
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
  const response = await fetch(`${API_BASE_URL}/challenges`);
        if (!response.ok) throw new Error('Error cargando retos');
        const data = await response.json();
        
        // Asegurar que todos los desafíos tengan la propiedad criteria
        const challengesWithCriteria = data.map((challenge: any) => ({
          ...challenge,
          criteria: challenge.criteria || 'Criterios de evaluación generales'
        }));
        
        setChallenges(challengesWithCriteria);
      } catch (error) {
        console.error('Error:', error);
        setErrorLoadingChallenges(true);
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    
    fetchChallenges();
  }, []);
  
  // Efecto para autoguardar el prompt mientras se escribe
  useEffect(() => {
    if (userPrompt) {
      localStorage.setItem(USER_PROMPT_KEY, userPrompt);
      // Mostrar mensaje de guardado
      setSaveStatus('Guardando...');
      const timer = setTimeout(() => setSaveStatus('Guardado'), 500);
      return () => clearTimeout(timer);
    } else if (userPrompt === '') {
      // Si se borra todo el contenido, también eliminarlo del localStorage
      localStorage.removeItem(USER_PROMPT_KEY);
      setSaveStatus('');
    }
  }, [userPrompt]);
  
  // Efecto para guardar el ID del desafío seleccionado
  useEffect(() => {
    if (selectedChallengeId) {
      localStorage.setItem(SELECTED_CHALLENGE_KEY, selectedChallengeId);
    } else {
      localStorage.removeItem(SELECTED_CHALLENGE_KEY);
    }
  }, [selectedChallengeId]);
  
  // Efecto para guardar el nombre de usuario
  useEffect(() => {
    if (userName) {
      localStorage.setItem(USER_NAME_KEY, userName);
    }
  }, [userName]);
  
  // Manejar cambios en el prompt con autoguardado
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
  }, []);
  
  // Manejar cambios en el nombre de usuario
  const handleUserNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  }, []);
  
  // Manejar la tecla Ctrl+Enter para enviar
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  }, []);
  
  // Manejar selección de desafío
  const handleChallengeSelect = useCallback((challengeId: string) => {
    setSelectedChallengeId(challengeId);
  }, []);
  
  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChallengeId) {
      alert('Por favor, selecciona un reto');
      return;
    }
    
    if (!userPrompt.trim()) {
      alert('Por favor, escribe tu versión mejorada del prompt');
      return;
    }
    
    // Validar que se haya ingresado un nombre de usuario
    if (!userName.trim()) {
      alert('Por favor, ingresa tu nombre o identificador');
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);
      
      const response = await fetch('/api/evaluate-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: selectedChallengeId,
          userPrompt,
          userName // Incluir el nombre de usuario en la solicitud
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const result = await response.json();
      
      // Incluir nombre de usuario en los resultados
      result.userName = userName;
      
      // Guardar en historial
      if (result.success && selectedChallenge) {
        saveToHistory(result, selectedChallenge.title);
      }
      
      // Limpiar borrador después de envío exitoso
      localStorage.removeItem(USER_PROMPT_KEY);
      localStorage.removeItem(SELECTED_CHALLENGE_KEY);
      // No eliminar el nombre de usuario para futuras evaluaciones
      setSaveStatus('');
      
      setResults(result);
    } catch (error) {
      console.error('Error evaluando el reto:', error);
      alert('Ocurrió un error al evaluar el prompt.');
    } finally {
      setLoading(false);
    }
  }, [challenges, selectedChallengeId, userPrompt, userName, setLoading, setResults]);
  
  // Borrar el borrador guardado
  const clearSavedDraft = useCallback(() => {
    localStorage.removeItem(USER_PROMPT_KEY);
    setUserPrompt('');
    setSaveStatus('Borrador eliminado');
    setTimeout(() => setSaveStatus(''), 1500);
  }, []);
  
  // Obtener el reto seleccionado
  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  return (
    <div className="assessment-form">
      {errorLoadingChallenges && (
        <div className="error-loading">
          Error cargando los retos. Por favor, intenta recargar la página.
        </div>
      )}
      
      {isLoadingChallenges ? (
        <div className="loading-challenges">Cargando retos...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <ChallengeSelector 
            onSelectChallenge={handleChallengeSelect} 
            challenges={challenges}
            selectedChallengeId={selectedChallengeId}
          />
          
          {selectedChallenge && (
            <div className="challenge-details">
              <h3>{selectedChallenge.title}</h3>
              <div className="base-prompt">
                <h4>Description:</h4>
                <p>{selectedChallenge.basePrompt}</p>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <div className="prompt-header">
              <label htmlFor="userPrompt">Tu Prompt Mejorado:</label>
              {userPrompt && (
                <div className="draft-controls">
                  {saveStatus && <span className="save-status">{saveStatus}</span>}
                  <button 
                    type="button" 
                    className="clear-draft-btn" 
                    onClick={clearSavedDraft}
                    title="Borrar borrador guardado"
                  >
                    Borrar borrador
                  </button>
                </div>
              )}
            </div>
            
            <textarea
              id="userPrompt"
              value={userPrompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu versión mejorada del prompt para este reto"
              required={true}
            />
            <div className="prompt-hint">
              <small>Sugerencia: Usa Ctrl+Enter (o ⌘+Enter en Mac) para enviar.</small>
            </div>
          </div>
          
          {/* Campo de nombre de usuario 
          <div className="form-group user-name-group">
            <label htmlFor="userName">Tu Nombre/Identificador:</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={handleUserNameChange}
              placeholder="Ingresa tu nombre o ID para el ranking"
              required={true}
              className="user-name-input"
            />
            <div className="name-hint">
              <small>Este nombre aparecerá en el ranking si tu prompt obtiene una buena puntuación.</small>
            </div>
          </div>
          */}
          
          <button type="submit" className="submit-btn">
            Evaluar Prompt
          </button>
        </form>
      )}
    </div>
  );
};

export default AssessmentForm;