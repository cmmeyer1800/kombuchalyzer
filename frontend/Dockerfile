# -------- Build stage --------
FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build
# Output assumed: /app/dist (Vite/Vue/etc.)

# -------- Runtime stage --------
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Vite / Vue / Svelte:
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
