# AI Self-Assessment Project

Este proyecto implementa un sistema de autoevaluación utilizando inteligencia artificial. Permite a los usuarios generar textos, evaluarlos y recibir retroalimentación a través de una interfaz sencilla.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales: **backend** y **frontend**.

### Backend

El backend está construido con TypeScript y se encarga de manejar la lógica de la aplicación, incluyendo la generación de textos y la evaluación de los mismos. Los archivos principales son:

- **src/app.ts**: Punto de entrada de la aplicación. Configura el servidor y las rutas.
- **src/controllers/evaluationController.ts**: Contiene la clase `EvaluationController` con métodos para evaluar textos.
- **src/routes/index.ts**: Configura las rutas del backend.
- **src/services/aiService.ts**: Interactúa con la API de OpenAI para generar textos y realizar evaluaciones.
- **src/services/textGenerationService.ts**: Contiene métodos para generar textos a partir de prompts.
- **src/types/index.ts**: Define las interfaces para las peticiones y respuestas de evaluación.

### Frontend

El frontend está construido con React y proporciona una interfaz de usuario para interactuar con el sistema de autoevaluación. Los archivos principales son:

- **public/index.html**: Página HTML principal que carga la aplicación.
- **src/App.tsx**: Componente principal que maneja el estado y la lógica de la aplicación.
- **src/components/AssessmentForm.tsx**: Permite al usuario ingresar el prompt y ajustar parámetros.
- **src/components/ResultsDisplay.tsx**: Muestra los resultados de la evaluación y la justificación de la IA.
- **src/utils/api.ts**: Funciones para interactuar con el backend.

## Instalación

Para instalar y ejecutar el proyecto, sigue estos pasos:

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Navega al directorio del backend y ejecuta:
   ```
   cd backend
   npm install
   npm run start
   ```

3. Navega al directorio del frontend y ejecuta:
   ```
   cd frontend
   npm install
   npm run start
   ```

## Uso

Una vez que ambos servidores estén en funcionamiento, abre tu navegador y dirígete a `http://localhost:3000` para acceder a la aplicación. Desde allí, podrás ingresar textos y recibir evaluaciones generadas por la inteligencia artificial.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.