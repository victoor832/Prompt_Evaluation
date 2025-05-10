import React, { useState } from 'react';
import AssessmentForm from './components/AssessmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import './styles/style.css';

function App() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Autoevaluación con IA</h1>
        <p>Mejora tus prompts con feedback de IA</p>
      </header>
      <main>
        <AssessmentForm setResults={setResults} setLoading={setLoading} />
        {loading && <div className="loading">Evaluando prompts...</div>}
        {results && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
}

export default App;