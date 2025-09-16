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


## Instalación y despliegue

### Instalación local

1. Clona el repositorio:
    ```
    git clone <URL_DEL_REPOSITORIO>
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

### Despliegue en Vercel

Puedes desplegar el backend y el frontend como proyectos separados en Vercel.

#### Variables de entorno

- En el frontend, configura en `.env`:
   ```
   REACT_APP_API_URL=https://<URL_DEL_BACKEND_VERCE>/api
   ```

- En el backend, configura en `.env`:
   ```
   GEMINI_API_KEY=tu_api_key_de_gemini
   ADMIN_API_KEY=tu_api_key_de_admin
   ```

#### Notas importantes
- El backend utiliza el modelo Gemini (`gemini-2.5-flash`) para la evaluación de textos.
- Asegúrate de que las variables de entorno estén configuradas en el panel de Vercel para producción.
- El backend expone los endpoints bajo el prefijo `/api` (por ejemplo, `/api/evaluate`).

## Uso

Una vez desplegado, accede al frontend en la URL pública de Vercel. La aplicación se conectará automáticamente al backend usando la variable de entorno configurada.

Puedes probar el endpoint de evaluación con:
```
curl -X POST https://<URL_DEL_BACKEND_VERCE>/api/evaluate \
   -H "Content-Type: application/json" \
   -d '{"originalText":"Describe el proceso de fotosíntesis.","modifiedText":"Explica cómo las plantas convierten la luz solar en energía.","criteria":"Claridad y precisión científica","userId":"usuario1"}'
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.