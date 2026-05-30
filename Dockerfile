# Stage 1: Build the Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install exact dependencies
RUN npm ci

# Copy all source files
COPY . .

# Compile the optimized production build
RUN npm run build

# Stage 2: Serve the application with Nginx for ultra-high performance
FROM nginx:alpine

# Copy custom Nginx configuration for React SPA routing and Gzip compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx default public directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
