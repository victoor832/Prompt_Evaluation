import React from 'react';
import './ChallengeSelector.css';

// Definir la interfaz Challenge (debe coincidir con la del AssessmentForm)
interface Challenge {
  id: string;
  title: string;
  description: string;
  basePrompt: string;
  criteria: string;
}

// Actualizar la interfaz para incluir la prop challenges
interface ChallengeSelectorProps {
  onSelectChallenge: (challengeId: string) => void;
  challenges: Challenge[]; // Añadir esta línea
}

const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({ onSelectChallenge, challenges }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectChallenge(e.target.value);
  };

  return (
    <div className="challenge-selector">
      <label htmlFor="challenge-select">Selecciona un reto:</label>
      <select 
        id="challenge-select" 
        onChange={handleChange} 
        defaultValue=""
      >
        <option value="" disabled>-- Selecciona un reto --</option>
        {challenges.map(challenge => (
          <option key={challenge.id} value={challenge.id}>
            {challenge.title}
          </option>
        ))}
      </select>
      
      {/* Mostrar detalles del reto seleccionado si hay uno */}
      {challenges.length > 0 && (
        <div className="challenge-details">
          <p className="challenge-description">
            Selecciona un reto para ver su descripción y prompt base
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengeSelector;