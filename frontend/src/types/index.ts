// frontend/src/types/index.ts
export interface Challenge {
  id: string;
  title: string;
  description: string;
  basePrompt: string;
  criteria: string; // Esta propiedad es la que falta
}