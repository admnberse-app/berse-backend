FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy only the necessary files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public/
COPY src ./src/

# Expose Vite dev server port
EXPOSE 5173

# Development command (overridden in docker-compose.yml)
CMD ["npm", "run", "dev"]