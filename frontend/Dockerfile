# ===== Stage 1: Build React App =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ===== Stage 2: Serve with Nginx =====
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static content
RUN rm -rf ./*

# Copy built React app
COPY --from=builder /app/dist .

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
