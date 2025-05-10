export class TextGenerationService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async generateText(prompt: string, options?: any): Promise<string> {
        const response = await this.callOpenAI(prompt, options);
        return response.choices[0].text.trim();
    }

    private async callOpenAI(prompt: string, options?: any): Promise<any> {
        const requestBody = {
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: options?.maxTokens || 150,
            temperature: options?.temperature || 0.7,
            ...options
        };

        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    }
}