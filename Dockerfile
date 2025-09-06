# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (dev 포함)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build react app
RUN npm run build

# Production stage (nginx serving)
FROM nginx:alpine AS production

# Copy build result
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]