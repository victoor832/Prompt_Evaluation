import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Añade la importación de BrowserRouter y Routes
import { Link } from 'react-router-dom';
import AssessmentForm from './components/AssessmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import RankingPage from './components/rankingPage';
import './styles/style.css';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const HomePage = () => (
    <>
      <AssessmentForm setResults={setResults} setLoading={setLoading} />
      {loading && <div className="loading">Evaluando prompts...</div>}
      {results && <ResultsDisplay results={results} />}
    </>
  );

  return (
    <BrowserRouter> {/* Envuelve toda tu aplicación en BrowserRouter */}
      <div className="App">
        <header className="App-header">
          <h1>Sistema de Autoevaluación con IA</h1>
          <p>Mejora tus prompts con feedback de IA</p>
          <div className="nav-buttons">
            <Link 
              to="/ranking"
              className="ranking-link"
            >
              Ranking
            </Link>
            <Link 
              to="/" 
              className="home-link"
            >
              Participar
            </Link>
          </div>
        </header>
        <main>
          <Routes> {/* Usa Routes para envolver todas tus rutas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/ranking" element={<RankingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;