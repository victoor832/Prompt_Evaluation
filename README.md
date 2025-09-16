
# AI Self-Assessment Project

This project implements a self-assessment system using artificial intelligence. It allows users to generate texts, evaluate them, and receive feedback through a simple interface.

## Project Structure

The project is divided into two main parts: **backend** and **frontend**.

### Backend

The backend is built with TypeScript and handles the application logic, including text generation and evaluation. Main files:

- **src/app.ts**: Application entry point. Sets up the server and routes.
- **src/controllers/evaluationController.ts**: Contains the `EvaluationController` class with methods for text evaluation.
- **src/routes/index.ts**: Configures backend routes.
- **src/services/aiService.ts**: Interacts with the OpenAI API to generate texts and perform evaluations.
- **src/services/textGenerationService.ts**: Methods for generating texts from prompts.
- **src/types/index.ts**: Defines interfaces for evaluation requests and responses.

### Frontend

The frontend is built with React and provides a user interface to interact with the self-assessment system. Main files:

- **public/index.html**: Main HTML page that loads the app.
- **src/App.tsx**: Main component handling app state and logic.
- **src/components/AssessmentForm.tsx**: Lets users enter prompts and adjust parameters.
- **src/components/ResultsDisplay.tsx**: Shows evaluation results and AI justification.
- **src/utils/api.ts**: Functions to interact with the backend.

## Installation and Deployment

### Local Installation

1. Clone the repository:
    ```
    git clone <REPOSITORY_URL>
    ```

2. Backend:
    ```
    cd backend
    npm install
    npm run start
    ```

3. Frontend:
    ```
    cd frontend
    npm install
    npm run start
    ```

### Deployment on Vercel

You can deploy the backend and frontend as separate projects on Vercel.

#### Environment Variables

- In the frontend, set in `.env`:
   ```
   REACT_APP_API_URL=https://<BACKEND_VERCEL_URL>/api
   ```

- In the backend, set in `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ADMIN_API_KEY=your_admin_api_key
   ```

#### Important Notes
- The backend uses the Gemini model (`gemini-2.5-flash`) for text evaluation.
- Make sure environment variables are set in the Vercel dashboard for production.
- The backend exposes endpoints under the `/api` prefix (e.g., `/api/evaluate`).

## Usage

Once deployed, access the frontend at the public Vercel URL. The app will automatically connect to the backend using the configured environment variable.

You can test the evaluation endpoint with:
```
curl -X POST https://<BACKEND_VERCEL_URL>/api/evaluate \
   -H "Content-Type: application/json" \
   -d '{"originalText":"Describe the process of photosynthesis.","modifiedText":"Explain how plants convert sunlight into energy.","criteria":"Clarity and scientific accuracy","userId":"user1"}'
```

## Contributions

Contributions are welcome. If you want to contribute, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.