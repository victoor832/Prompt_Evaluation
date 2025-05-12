import React, { useState, useEffect, useCallback, memo } from 'react';
import ChallengeSelector from './ChallengeSelector';
import { saveToHistory } from '../services/historyService';
import './PredefChallengeForm.css';

// Definir interfaces para los componentes memoizados
interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id: string;
  placeholder: string;
  required: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  basePrompt: string;
  criteria: string;
}

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  type: string;
  placeholder: string;
  required: boolean;
}

// Componente memoizado para el textarea
const MemoizedTextarea = memo<TextareaProps>(({ value, onChange, id, placeholder, required }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
  />
));

// Componente memoizado para el input
const MemoizedInput = memo<InputProps>(({ value, onChange, id, type, placeholder, required }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
  />
));

interface PredefChallengeFormProps {
  setResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
}

const PredefChallengeForm: React.FC<PredefChallengeFormProps> = ({ setResults, setLoading }) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [selectedChallengeTitle, setSelectedChallengeTitle] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [userName, setUserName] = useState(() => {
    // Intentar obtener el nombre de usuario guardado anteriormente
    return localStorage.getItem('userName') || '';
  });
  
  // Nuevo estado para almacenar los challenges
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [errorLoadingChallenges, setErrorLoadingChallenges] = useState('');

  // Guardar el nombre de usuario en localStorage cuando cambie
  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  // Cargar los challenges del backend al montar el componente
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoadingChallenges(true);
      try {
        const response = await fetch('/api/challenges');
        if (!response.ok) {
          throw new Error('Error al obtener los retos');
        }
        const data = await response.json();
        setChallenges(data);
        setErrorLoadingChallenges('');
      } catch (error) {
        console.error('Error al cargar los retos:', error);
        setErrorLoadingChallenges('No se pudieron cargar los retos. Por favor, recarga la página.');
        
        // Cargar datos de ejemplo si no se pueden obtener del backend
        setChallenges([
          {
            id: "challenge1",
            title: "Explicar conceptos complejos",
            description: "Mejora este prompt para explicar conceptos complejos de forma simple",
            basePrompt: "Explica la relatividad general",
            criteria: "Claridad, simplicidad, precisión"
          },
          {
            id: "challenge2",
            title: "Crear historias creativas",
            description: "Mejora este prompt para generar historias más originales",
            basePrompt: "Escribe una historia sobre un viaje espacial",
            criteria: "Originalidad, coherencia, nivel de detalle"
          }
        ]);
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    
    fetchChallenges();
  }, []);

  const handleChallengeSelect = useCallback((challengeId: string) => {
    setSelectedChallengeId(challengeId);
    
    // Buscar el título del challenge seleccionado
    const selectedChallenge = challenges.find(c => c.id === challengeId);
    if (selectedChallenge) {
      setSelectedChallengeTitle(selectedChallenge.title);
      console.log(`Seleccionado reto: ${selectedChallenge.title}`);
    }
  }, [challenges]);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChallengeId) {
      alert('Por favor, selecciona un reto');
      return;
    }
    
    if (!userPrompt.trim()) {
      alert('Por favor, escribe tu versión mejorada del prompt');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/evaluate-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: selectedChallengeId,
          userPrompt,
          userId: userName || 'anonymous_user'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const result = await response.json();
      
      console.log('Resultado recibido:', result);
      
      // IMPORTANTE: Guardar en historial con el título del reto
      saveToHistory(result, selectedChallengeTitle);
      console.log(`Guardando en historial: ${selectedChallengeTitle}`);
      
      setResults(result);
    } catch (error) {
      console.error('Error evaluando el reto:', error);
      alert('Ocurrió un error al evaluar el prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predef-challenge-form">
      <h2>Evaluación de Prompts con Retos Predefinidos</h2>
      
      {errorLoadingChallenges && (
        <div className="error-message">{errorLoadingChallenges}</div>
      )}
      
      {isLoadingChallenges ? (
        <div className="loading-challenges">Cargando retos...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <ChallengeSelector 
            onSelectChallenge={handleChallengeSelect} 
            challenges={challenges} 
          />
          
          <div className="form-group">
            <label htmlFor="userPrompt">Tu Prompt Mejorado:</label>
            <MemoizedTextarea
              id="userPrompt"
              value={userPrompt}
              onChange={handlePromptChange}
              placeholder="Escribe tu versión mejorada del prompt para este reto"
              required={true}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userName">Tu nombre o identificador:</label>
            <MemoizedInput
              id="userName"
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="Introduce tu nombre o ID"
              required={true}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!selectedChallengeId || challenges.length === 0}
          >
            Evaluar Prompt
          </button>
        </form>
      )}
    </div>
  );
};

export default PredefChallengeForm;