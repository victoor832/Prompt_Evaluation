import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AssessmentForm from './components/AssessmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import RankingPage from './components/rankingPage';
import History from './components/History';
import { ThemeProvider } from './contexts/ThemeContext';
import PromptsGallery from './components/PromptsGallery';
import './styles/style.css';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const HomePage = () => (
    <>
      <History />
      <AssessmentForm setResults={setResults} setLoading={setLoading} />
      {loading && <div className="loading">Evaluando prompts...</div>}
      {results && <ResultsDisplay results={results} />}
    </>
  );

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            <h1>Sistema de Autoevaluación con IA</h1>
            <p>Mejora tus prompts con feedback de IA</p>
            <div className="nav-buttons">
              <Link 
                to="/" 
                className="home-link"
              >
                Participar
              </Link>
                {/* <Link 
                to="/ranking"
                className="ranking-link"
                >
                Ranking
                </Link> */}
                            <Link 
                to="/gallery"
                className="gallery-link"
              >
                Ejemplos
              </Link>
            </div>
          </header>
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/gallery" element={<PromptsGallery />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;