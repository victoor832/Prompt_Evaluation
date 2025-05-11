import React, { useState, useCallback, memo } from 'react';
import ChallengeSelector from './ChallengeSelector';
import './PredefChallengeForm.css';

// Definir interfaces para los componentes memoizados
interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id: string;
  placeholder: string;
  required: boolean;
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
  const [userPrompt, setUserPrompt] = useState('');
  const [userName, setUserName] = useState('');

  const handleChallengeSelect = useCallback((challengeId: string) => {
    setSelectedChallengeId(challengeId);
  }, []);

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
      <form onSubmit={handleSubmit}>
        <ChallengeSelector onSelectChallenge={handleChallengeSelect} />
        
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
        
        <button type="submit" className="submit-btn" disabled={!selectedChallengeId}>
          Evaluar Prompt
        </button>
      </form>
    </div>
  );
};

export default PredefChallengeForm;