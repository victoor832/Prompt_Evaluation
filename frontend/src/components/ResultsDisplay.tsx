import React from 'react';
import ReactMarkdown from 'react-markdown';
import EvaluationRadar from './EvaluationRadar';
import { useTheme } from '../contexts/ThemeContext';
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
  // Usar el contexto de tema
  const { isDarkMode } = useTheme();
  
  // Verificar si hay error
  if (!results.success) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{results.error || 'Ha ocurrido un error durante la evaluación.'}</p>
      </div>
    );
  }

  // Función para convertir texto Markdown a HTML
  function convertMarkdownToHtml(text: string): string {
    // Escapar caracteres HTML especiales
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convertir negrita (**texto**) a <strong>texto</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir cursiva (*texto*) a <em>texto</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return html;
  }

  // Función simplificada para formatear las recomendaciones
  function formatRecommendations(text: string): string {
    if (!text) return '';
    
    // Si ya está formateado correctamente, devolverlo como está
    if (text.includes('\n- ')) return text;
    
    // Dividir por el patrón " - " que separa las recomendaciones (espacio, guión, espacio)
    const parts = text.split(/ - /);
    
    if (parts.length <= 1) {
      // Si no hay separaciones por " - ", intentar otro enfoque
      return text.replace(/(\.)(\s*-)/, '$1\n\n-').replace(/^-/, '- ');
    }
    
    // Formatear como lista de Markdown
    let formatted = '';
    
    // El primer elemento puede necesitar un tratamiento especial
    if (parts[0].trim().startsWith('-')) {
      formatted = parts[0].trim() + '\n\n';
    } else {
      formatted = '- ' + parts[0].trim() + '\n\n';
    }
    
    // Procesar el resto de elementos
    for (let i = 1; i < parts.length; i++) {
      formatted += '- ' + parts[i].trim() + '\n\n';
    }
    
    return formatted;
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
    recommendations = parts[4] ? formatRecommendations(parts[4].trim()) : 'No disponible';
  } else {
    // Nuevo formato estructurado
    score1 = results.evaluation.score1;
    score2 = results.evaluation.score2;
    justification = results.evaluation.justification;
    conclusion = results.evaluation.conclusion;
    recommendations = formatRecommendations(results.evaluation.recommendations);
  }

  // Convertir score2 a número para el gráfico radar
  const numericScore = parseFloat(score2) || 50; // Usar 50 como valor predeterminado si no es un número válido

  return (
    <div className="results-container">
      <h2>Resultados de la Evaluación</h2>
      
      <div className="scores-container">
        <div className="score-card">
          <h3>Prompt Base</h3>
          <div className="score">{score1}</div>
        </div>
        
        <div className="score-card highlighted">
          <h3>Tu Prompt</h3>
          <div className="score">{score2}</div>
        </div>
      </div>
      
      {/* Componente de radar para visualizar aspectos de la evaluación */}
      <EvaluationRadar 
        evaluationText={justification + " " + conclusion} 
        score={numericScore}
      />
      
      <div className="analysis-section">
        <h3>Justificación</h3>
        <div className="markdown-content">
          <ReactMarkdown>{justification}</ReactMarkdown>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>Conclusión</h3>
        <div className="markdown-content">
          <ReactMarkdown>{conclusion}</ReactMarkdown>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>Recomendaciones</h3>
        <div className="markdown-content">
          {/* Para mostrar el contenido formateado con negrita */}
          <div dangerouslySetInnerHTML={{ 
            __html: recommendations
              .split('\n\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => {
                if (line.startsWith('- ')) {
                  return `<p class="recommendation-item">${convertMarkdownToHtml(line)}</p>`;
                }
                return `<p>${convertMarkdownToHtml(line)}</p>`;
              })
              .join('')
          }} />
        </div>
      </div>
      
      <div className="user-info">
        <p>Evaluación para: {results.userId || 'Usuario anónimo'}</p>
        {results.timestamp && <p>Fecha: {new Date(results.timestamp).toLocaleString()}</p>}
      </div>
    </div>
  );
};

export default ResultsDisplay;