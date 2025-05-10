export interface Challenge {
    id: string;
    title: string;
    description: string;
    basePrompt: string;
    criteria: string;
  }
  
  export const predefinedChallenges: Challenge[] = [
    {
      id: "challenge1",
      title: "Explicación de conceptos científicos",
      description: "Cómo explicar la teoría de la relatividad a estudiantes de secundaria",
      basePrompt: "Explica la teoría de la relatividad",
      criteria: "claridad, uso de analogías, adaptación a nivel educativo secundaria"
    },
    {
      id: "challenge2",
      title: "Redacción creativa",
      description: "Crear una historia corta de ciencia ficción sobre viajes en el tiempo",
      basePrompt: "Escribe una historia corta sobre viajes en el tiempo",
      criteria: "originalidad, coherencia narrativa, desarrollo de personajes"
    },
    {
      id: "challenge3",
      title: "Resolución de problemas",
      description: "Cómo ayudar a un equipo a resolver conflictos internos",
      basePrompt: "Dame consejos para resolver conflictos en un equipo",
      criteria: "aplicabilidad práctica, consideración de diferentes perspectivas, claridad en los pasos a seguir"
    }
  ];
  
  export const getChallengeById = (id: string): Challenge | undefined => {
    return predefinedChallenges.find(challenge => challenge.id === id);
  };