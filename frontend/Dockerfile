# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --workspace=frontend

# Copy source code
COPY frontend/ ./frontend/

# Build the application
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
