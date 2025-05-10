import React, { useState } from 'react';
import ChallengeSelector from './ChallengeSelector';
import './PredefChallengeForm.css';

interface PredefChallengeFormProps {
  setResults: (results: any) => void;
  setLoading: (loading: boolean) => void;
}

const PredefChallengeForm: React.FC<PredefChallengeFormProps> = ({ setResults, setLoading }) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [userName, setUserName] = useState('');

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
  };

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
          <textarea
            id="userPrompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Escribe tu versión mejorada del prompt para este reto"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="userName">Tu nombre o identificador:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Introduce tu nombre o ID"
            required
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