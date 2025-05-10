import React, { useState, useEffect } from 'react';
import './ChallengeSelector.css';
import { getChallenges } from '../utils/api';

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
        setLoading(true);
        const data = await getChallenges();
        
        setChallenges(data);
        
        // Seleccionar el primer reto por defecto si hay alguno
        if (data.length > 0) {
          setSelectedChallenge(data[0].id);
          onSelectChallenge(data[0].id);
        }
      } catch (error) {
        console.error('Error completo:', error);
        setError(`Error al cargar los retos: ${error instanceof Error ? error.message : 'Desconocido'}`);
        
        // Usar retos de fallback
        console.log('Usando retos de fallback debido al error');
        const fallbackChallenges = [
          {
            id: "fallback1",
            title: "[Local] Explicación de conceptos científicos",
            description: "Cómo explicar la teoría de la relatividad a estudiantes de secundaria"
          },
          {
            id: "fallback2",
            title: "[Local] Redacción creativa",
            description: "Crear una historia corta de ciencia ficción sobre viajes en el tiempo"
          },
          {
            id: "fallback3",
            title: "[Local] Resolución de problemas",
            description: "Cómo ayudar a un equipo a resolver conflictos internos"
          }
        ];
        
        setChallenges(fallbackChallenges);
        setSelectedChallenge(fallbackChallenges[0].id);
        onSelectChallenge(fallbackChallenges[0].id);
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
    return (
      <div className="error-message">
        <p>{error}</p>
        <p>Se están usando retos predeterminados locales.</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return <div className="error-message">No hay retos disponibles en este momento.</div>;
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