export interface EvaluationRequest {
    text: string;
    userId: string;
}

export interface EvaluationResponse {
    evaluation: string | {
      score1: string;
      score2: string;
      justification: string;
      conclusion: string;
      recommendations: string;
      rawResponse: string;
    };
    userId?: string;
    success: boolean;
    error?: string;
    timestamp: string;
  }