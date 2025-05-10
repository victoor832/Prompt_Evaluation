FROM node:18-alpine as base

WORKDIR /app

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Instalar dependencias del frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copiar todo el código fuente
WORKDIR /app
COPY . .

# Construir el frontend
WORKDIR /app/frontend
RUN npm run build

# Construir el backend
WORKDIR /app/backend
RUN npm run build || echo "Skipping backend build if not configured"

# Configurar para producción
ENV NODE_ENV=production
WORKDIR /app/backend

# Exponer el puerto que usa el backend
EXPOSE 3001

# Comando para iniciar el servidor
CMD ["npm", "start"]