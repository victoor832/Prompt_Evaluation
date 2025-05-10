import React from 'react';
import './ResultDisplay.css';

interface ResultsDisplayProps {
  results: {
    evaluation: string | {
      score1: string;
      score2: string;
      justification: string;
      conclusion: string;
      recommendations: string;
      rawResponse: string;
    };
    success: boolean;
    error?: string;
    userId?: string;
    timestamp?: string;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  // Verificar si hay error
  if (!results.success) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{results.error || 'Ha ocurrido un error durante la evaluación.'}</p>
      </div>
    );
  }

  // Comprobar el tipo de evaluación y extraer los datos
  let score1, score2, justification, conclusion, recommendations;
  
  if (typeof results.evaluation === 'string') {
    // Modo compatible con el formato anterior
    const parts = results.evaluation.split(/PUNTUACIÓN TEXTO \d+:|JUSTIFICACIÓN:|CONCLUSIÓN:|RECOMENDACIONES:/i);
    score1 = "N/A";
    score2 = "N/A";
    justification = parts[2] ? parts[2].trim() : 'No disponible';
    conclusion = parts[3] ? parts[3].trim() : 'No disponible';
    recommendations = parts[4] ? parts[4].trim() : 'No disponible';
  } else {
    // Nuevo formato estructurado
    score1 = results.evaluation.score1;
    score2 = results.evaluation.score2;
    justification = results.evaluation.justification;
    conclusion = results.evaluation.conclusion;
    recommendations = results.evaluation.recommendations;
  }

  return (
    <div className="results-container">
      <h2>Resultados de la Evaluación</h2>
      
      <div className="scores-container">
        <div className="score-card">
          <h3>Prompt Base</h3>
          <div className="score">{score1}</div>
        </div>
        
        <div className="score-card">
          <h3>Tu Prompt</h3>
          <div className="score">{score2}</div>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>Justificación</h3>
        <p>{justification}</p>
      </div>
      
      <div className="analysis-section">
        <h3>Conclusión</h3>
        <p>{conclusion}</p>
      </div>
      
      <div className="analysis-section">
        <h3>Recomendaciones</h3>
        <p>{recommendations}</p>
      </div>
      
      <div className="user-info">
        <p>Evaluación para: {results.userId || 'Usuario anónimo'}</p>
        {results.timestamp && <p>Fecha: {new Date(results.timestamp).toLocaleString()}</p>}
      </div>
    </div>
  );
};

export default ResultsDisplay;