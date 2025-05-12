import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';
import './EvaluationRadar.css';

// Registrar los componentes Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface EvaluationRadarProps {
  evaluationText: string;
  score: number;
}

// Definir un tipo para las claves de aspectos para evitar errores de tipo
type AspectKey = 'Claridad' | 'Estructura' | 'Originalidad' | 'Relevancia' | 'Precisión' | 'Adaptación';

// Función para verificar si un score es válido
const isValidScore = (score: number): boolean => {
  return !isNaN(score) && score > 0 && score <= 100;
};

// Extrae aspectos y puntuaciones estimadas de la justificación
const extractAspectScores = (text: string, score: number): Record<AspectKey, number> => {
  // Lista de aspectos a evaluar con tipado específico
  const aspects: Record<AspectKey, number> = {
    'Claridad': 0,
    'Estructura': 0,
    'Originalidad': 0,
    'Relevancia': 0,
    'Precisión': 0,
    'Adaptación': 0,
  };
  
  // Si el score no es válido, devolvemos todos los aspectos con valor 0
  if (!isValidScore(score)) {
    console.log('Puntuación no válida. Mostrando radar con valores en 0.');
    return aspects;
  }
  
  // Palabras clave para detectar aspectos positivos
  const positiveKeywords: Record<AspectKey, string[]> = {
    'Claridad': ['claro', 'claridad', 'comprensible', 'entendible', 'explícito'],
    'Estructura': ['estructura', 'organizado', 'coherente', 'secuencial', 'lógico'],
    'Originalidad': ['original', 'creativo', 'único', 'innovador', 'fresco'],
    'Relevancia': ['relevante', 'apropiado', 'adecuado', 'pertinente', 'enfocado'],
    'Precisión': ['preciso', 'exacto', 'detallado', 'específico', 'riguroso'],
    'Adaptación': ['adaptado', 'personalizado', 'ajustado', 'orientado', 'contextualizado'],
  };
  
  // Palabras clave para detectar aspectos negativos
  const negativeKeywords: Record<AspectKey, string[]> = {
    'Claridad': ['confuso', 'ambiguo', 'vago', 'complicado', 'difícil de entender'],
    'Estructura': ['desorganizado', 'inconsistente', 'desordenado', 'caótico', 'sin estructura'],
    'Originalidad': ['genérico', 'común', 'básico', 'convencional', 'típico'],
    'Relevancia': ['irrelevante', 'fuera de tema', 'desviado', 'tangencial', 'innecesario'],
    'Precisión': ['impreciso', 'vago', 'generalizado', 'superficial', 'incompleto'],
    'Adaptación': ['inadaptado', 'descontextualizado', 'inapropiado', 'genérico', 'estándar'],
  };
  
  // Analizar el texto para cada aspecto
  (Object.entries(positiveKeywords) as [AspectKey, string[]][]).forEach(([aspect, keywords]) => {
    // Contar menciones positivas
    const positiveCount = keywords.reduce((count, keyword) => {
      return count + (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    
    // Contar menciones negativas
    const negativeCount = negativeKeywords[aspect].reduce((count, keyword) => {
      return count + (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    
    // Calcular puntuación base
    let baseScore = 50 + (positiveCount * 10) - (negativeCount * 15);
    
    // Ajustar basado en puntuación global
    const scoreFactor = score / 50; // Normalizar alrededor de 50
    baseScore = baseScore * scoreFactor;
    
    // Limitar a rango 0-100
    aspects[aspect] = Math.max(0, Math.min(100, baseScore));
  });
  
  return aspects;
};

const EvaluationRadar: React.FC<EvaluationRadarProps> = ({ evaluationText, score }) => {
  const { isDarkMode } = useTheme();
  
  // Extraer aspectos del texto de evaluación
  const aspectScores = extractAspectScores(evaluationText, score);
  
  // Preparar colores basados en el tema
  const borderColor = isDarkMode ? 'rgba(54, 162, 235, 1)' : 'rgba(54, 162, 235, 1)';
  const backgroundColor = isDarkMode ? 'rgba(54, 162, 235, 0.3)' : 'rgba(54, 162, 235, 0.2)';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDarkMode ? '#f0f0f0' : '#333333';
  
  // Verificar si todos los valores son cero
  const allZeros = Object.values(aspectScores).every(val => val === 0);
  
  // Configurar datos para el gráfico
  const data = {
    labels: Object.keys(aspectScores),
    datasets: [
      {
        label: 'Puntuación por aspecto',
        data: Object.values(aspectScores),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColor,
      },
    ],
  };
  
  // Opciones del gráfico
  const options = {
    scales: {
      r: {
        angleLines: {
          color: gridColor,
        },
        grid: {
          color: gridColor,
        },
        pointLabels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false,
          color: textColor,
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#333' : '#fff',
        titleColor: isDarkMode ? '#fff' : '#333',
        bodyColor: isDarkMode ? '#fff' : '#333',
        borderColor: isDarkMode ? '#555' : '#ddd',
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="radar-container">
      <h3 className="radar-title">Análisis por Aspectos</h3>
      {allZeros ? (
        <div className="no-data-message">
          <p>No hay datos suficientes para analizar los aspectos del prompt.</p>
          <p>Complete una evaluación para ver el análisis detallado.</p>
        </div>
      ) : (
        <div className="radar-chart">
          <Radar data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default EvaluationRadar;