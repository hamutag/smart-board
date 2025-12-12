# Multi-stage build for the Smart Board (Vite + React)

FROM node:20-alpine AS build

WORKDIR /app

# Install deps
# If package-lock.json exists, use npm ci (reproducible). Otherwise fall back to npm install.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build
COPY . .
RUN npm run build


FROM nginx:1.27-alpine

# SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built site
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
