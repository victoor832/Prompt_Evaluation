import React, { useState, useEffect } from 'react';
import { getHistory, removeFromHistory, clearHistory, HistoryItem, HISTORY_UPDATED_EVENT } from '../services/historyService';
import './History.css';

const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Cargar historial al montar el componente
  useEffect(() => {
    setHistoryItems(getHistory());
    
    // Escuchar el evento personalizado para actualizaciones del historial
    const handleHistoryUpdate = () => {
      console.log('Actualizando historial desde evento');
      setHistoryItems(getHistory());
    };
    
    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    };
  }, []);
  
  // Manejar eliminación de un elemento
  const handleRemoveItem = (id: string) => {
    removeFromHistory(id);
    setHistoryItems(getHistory());
  };
  
  // Manejar eliminación de todo el historial
  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todo tu historial?')) {
      clearHistory();
      setHistoryItems([]);
    }
  };
  
  // Si no hay elementos en el historial
  if (historyItems.length === 0) {
    return (
      <div className="history-container empty-history">
        <h3>Historial de Evaluaciones</h3>
        <p>No hay evaluaciones en tu historial.</p>
      </div>
    );
  }
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h3>Historial de Evaluaciones</h3>
        <button 
          className="toggle-history-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="history-items">
            {historyItems.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-content">
                  <div className="history-item-header">
                    <span className="history-date">{formatDate(item.timestamp)}</span>
                    <span className="history-user">{item.userId}</span>
                  </div>
                  {item.challengeTitle && (
                    <div className="history-challenge">
                      <strong>Reto:</strong> {item.challengeTitle}
                    </div>
                  )}
                  <div className="history-scores">
                    <div className="history-score">
                      <span>Base:</span> {item.score1}
                    </div>
                    <div className="history-score highlight">
                      <span>Tu prompt:</span> {item.score2}
                    </div>
                  </div>
                </div>
                <button 
                  className="remove-history-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Eliminar"
                  title="Eliminar entrada"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="history-footer">
            <button 
              className="clear-history-btn" 
              onClick={handleClearHistory}
            >
              Borrar historial
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default History;