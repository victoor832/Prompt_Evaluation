import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankingPage.css'

interface UserRanking {
  username: string;
  score: number;
}

const RankingPage: React.FC = () => {
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  const [filteredRanking, setFilteredRanking] = useState<UserRanking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const response = await axios.get<UserRanking[]>(`/api/ranking`);
        console.log("Datos recibidos del API:", response.data);
        setRanking(response.data);
        setFilteredRanking(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error al cargar el ranking:', err);
        setError('Error al cargar el ranking. Por favor, intenta más tarde.');
        
        // Datos de fallback en caso de error
        const fallbackData = [
          { username: "usuario_ejemplo1", score: 9.5 },
          { username: "usuario_ejemplo2", score: 8.7 },
          { username: "usuario_ejemplo3", score: 7.8 }
        ];
        console.log("Usando datos de fallback");
        setRanking(fallbackData);
        setFilteredRanking(fallbackData);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRanking();
  }, []);

  useEffect(() => {
    // Filtrar localmente
    if (searchTerm.trim() === '') {
      setFilteredRanking(ranking);
    } else {
      const filtered = ranking.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRanking(filtered);
    }
  }, [searchTerm, ranking]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="ranking-container">
      <h1 className="ranking-title">Ranking de Participantes</h1>

      <div className="search-box">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre de usuario..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando ranking...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Usuario</th>
                <th className="score-column">Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {filteredRanking.length > 0 ? (
                filteredRanking.map((user, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="position-cell">{index + 1}</td>
                    <td>{user.username}</td>
                    <td className="score-cell">{user.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty-message">
                    {searchTerm ? 'No se encontraron usuarios con ese nombre' : 'No hay datos de ranking disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingPage;