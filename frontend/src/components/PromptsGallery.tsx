import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './PromptsGallery.css';

interface PromptExample {
  id: string;
  title: string;
  category: string;
  prompt: string;
  explanation: string;
  score: number;
  tags: string[];
}

// Ejemplos de prompts bien evaluados
const promptExamples: PromptExample[] = [
  {
    id: 'exp1',
    title: 'Explicación de concepto técnico para niños',
    category: 'Educación',
    prompt: 'Explica cómo funciona internet a un niño de 8 años, usando analogías con cosas que conoce como carreteras, bibliotecas y carteros. Incluye una pequeña historia con personajes que representen partes de internet (routers, servidores, etc). La explicación debe ser divertida pero precisa.',
    explanation: 'Este prompt es efectivo porque: 1) Especifica la audiencia exacta, 2) Sugiere analogías concretas, 3) Pide elementos narrativos específicos, 4) Mantiene el equilibrio entre diversión y precisión.',
    score: 92,
    tags: ['analogías', 'educativo', 'narrativo', 'para niños']
  },
  {
    id: 'exp2',
    title: 'Análisis de textos literarios',
    category: 'Literatura',
    prompt: 'Realiza un análisis literario del poema "Campos de Castilla" de Antonio Machado. Enfócate en: 1) El uso del paisaje como metáfora de España, 2) Elementos de la España rural y tradición, 3) Técnicas poéticas utilizadas. Para cada punto, incluye al menos dos citas textuales. Estructura tu análisis con introducción, desarrollo de los tres puntos y conclusión.',
    explanation: 'Este prompt destaca por: 1) Especificar exactamente qué analizar, 2) Solicitar puntos concretos, 3) Pedir citas textuales como evidencia, 4) Indicar una estructura clara.',
    score: 96,
    tags: ['literatura', 'análisis', 'estructurado', 'académico']
  },
  {
    id: 'exp3',
    title: 'Generación de receta adaptada',
    category: 'Cocina',
    prompt: 'Crea una receta de lasaña vegetariana que: 1) Sea baja en calorías, 2) No contenga gluten, 3) Use ingredientes fáciles de encontrar en supermercados españoles, 4) Pueda prepararse en menos de 45 minutos. Incluye tiempos de preparación y cocción, ingredientes con cantidades exactas (en gramos y mililitros), instrucciones paso a paso numeradas, e información nutricional por porción.',
    explanation: 'Este prompt funciona bien porque: 1) Define restricciones dietéticas claras, 2) Contextualiza geográficamente los ingredientes, 3) Establece un límite de tiempo, 4) Especifica el formato exacto deseado con unidades de medida.',
    score: 88,
    tags: ['recetas', 'vegetariano', 'sin gluten', 'práctico']
  },
  {
    id: 'exp4',
    title: 'Resolución de problema matemático',
    category: 'Matemáticas',
    prompt: 'Resuelve el siguiente problema de optimización: Encuentra las dimensiones del rectángulo de perímetro 100 metros que tiene el área máxima. Muestra: 1) El planteamiento del problema con variables claramente definidas, 2) El desarrollo algebraico paso a paso, 3) La aplicación del método de derivadas para encontrar máximos, 4) La comprobación del resultado. Incluye visualizaciones o representaciones gráficas que ayuden a entender el proceso.',
    explanation: 'Este prompt es excelente porque: 1) Plantea un problema matemático específico, 2) Solicita el proceso completo, no solo la respuesta, 3) Requiere verificación del resultado, 4) Pide elementos visuales para reforzar la comprensión.',
    score: 94,
    tags: ['matemáticas', 'optimización', 'educativo', 'paso a paso']
  },
  {
    id: 'exp5',
    title: 'Creación de historia con restricciones',
    category: 'Creatividad',
    prompt: 'Escribe un microcuento de ciencia ficción que cumpla con estas restricciones: 1) Máximo 300 palabras, 2) Ambientado en Marte en el año 2150, 3) Incluye un personaje que es mitad humano, mitad máquina, 4) El conflicto central debe relacionarse con la escasez de agua, 5) La historia debe empezar y terminar con la misma frase, 6) No debe incluir diálogos. El tono debe ser melancólico pero con un final esperanzador.',
    explanation: 'Este prompt sobresale porque: 1) Establece límites de extensión precisos, 2) Define el escenario espaciotemporal, 3) Impone restricciones formales creativas, 4) Especifica elementos narrativos y tonales concretos.',
    score: 91,
    tags: ['ciencia ficción', 'microcuento', 'creatividad', 'restricciones']
  }
];

const PromptsGallery: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(promptExamples.map(example => example.category)))];
  
  // Filtrar ejemplos por categoría y búsqueda
  const filteredExamples = promptExamples.filter(example => {
    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Manejar copia al portapapeles con feedback visual
  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  // Clases CSS condicionales basadas en el tema
  const themeClass = isDarkMode ? 'dark-theme' : 'light-theme';
  
  return (
    <div className={`gallery-container ${themeClass}`}>
      <h2>Galería de Prompts Ejemplares</h2>
      <p className="gallery-intro">
        Explora nuestra colección de prompts de alta calidad que han obtenido excelentes resultados. 
        Usa estos ejemplos como inspiración para crear tus propios prompts efectivos.
      </p>
      
      <div className="gallery-filters">
        <div className="category-filter">
          <label>Categoría:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`category-select ${themeClass}`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="search-filter">
          <input
            type="text"
            placeholder="Buscar por título o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`search-input ${themeClass}`}
          />
        </div>
      </div>
      
      <div className="examples-grid">
        {filteredExamples.length > 0 ? (
          filteredExamples.map(example => (
            <div key={example.id} className={`example-card ${themeClass}`}>
              <div className="example-header">
                <h3>{example.title}</h3>
                <span className="example-score">{example.score}</span>
              </div>
              
              <div className="example-category">{example.category}</div>
              
              <div className={`example-prompt ${themeClass}`}>
                <h4>Prompt:</h4>
                <p>{example.prompt}</p>
              </div>
              
              <div className="example-explanation">
                <h4>Por qué funciona:</h4>
                <p>{example.explanation}</p>
              </div>
              
              <div className="example-tags">
                {example.tags.map(tag => (
                  <span key={tag} className={`tag ${themeClass}`}>{tag}</span>
                ))}
              </div>
              
              <button 
                className={`use-template-btn ${copiedId === example.id ? 'copied' : ''} ${themeClass}`}
                onClick={() => handleCopyPrompt(example.id, example.prompt)}
              >
                {copiedId === example.id ? 'Copiado' : 'Usar como plantilla'}
              </button>
            </div>
          ))
        ) : (
          <div className={`no-results ${themeClass}`}>
            <p>No se encontraron ejemplos que coincidan con tu búsqueda.</p>
            <p>Intenta con otros términos o categorías.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptsGallery;