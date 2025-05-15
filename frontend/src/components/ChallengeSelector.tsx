// En ChallengeSelector.tsx
import React from 'react';
import { Challenge } from '../types';
import './ChallengeSelector.css';

interface ChallengeSelectorProps {
  onSelectChallenge: (challengeId: string) => void;
  challenges: Challenge[];
  selectedChallengeId?: string;
}

const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({ 
  onSelectChallenge, 
  challenges,
  selectedChallengeId = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectChallenge(e.target.value);
  };

  return (
    <div className="challenge-selector">
      <label htmlFor="challenge-select">Selecciona un reto:</label>
      <select 
        id="challenge-select" 
        onChange={handleChange} 
        value={selectedChallengeId}
      >
        <option value="" disabled>-- Selecciona un reto --</option>
        {challenges.map(challenge => (
          <option key={challenge.id} value={challenge.id}>
            {challenge.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChallengeSelector;