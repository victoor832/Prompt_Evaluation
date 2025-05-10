import React, { useState, useEffect } from 'react';
import './ChallengeSelector.css';

interface Challenge {
  id: string;
  title: string;
  description: string;
}

interface ChallengeSelectorProps {
  onSelectChallenge: (challengeId: string) => void;
}

const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({ onSelectChallenge }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch('/api/challenges');
        
        if (!response.ok) {
          throw new Error('Error al obtener retos');
        }
        
        const data = await response.json();
        setChallenges(data);
        
        // Seleccionar el primer reto por defecto si hay alguno
        if (data.length > 0) {
          setSelectedChallenge(data[0].id);
          onSelectChallenge(data[0].id);
        }
      } catch (error) {
        setError('Error al cargar los retos predefinidos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [onSelectChallenge]);

  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedChallenge(selectedId);
    onSelectChallenge(selectedId);
  };

  if (loading) {
    return <div className="loading-challenges">Cargando retos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="challenge-selector">
      <label htmlFor="challenge-select">Selecciona un reto:</label>
      <select 
        id="challenge-select" 
        value={selectedChallenge} 
        onChange={handleChallengeChange}
      >
        {challenges.map(challenge => (
          <option key={challenge.id} value={challenge.id}>
            {challenge.title}
          </option>
        ))}
      </select>
      
      {selectedChallenge && (
        <div className="challenge-description">
          {challenges.find(c => c.id === selectedChallenge)?.description}
        </div>
      )}
    </div>
  );
};

export default ChallengeSelector;