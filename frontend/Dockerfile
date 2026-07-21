# Dockerfile — frontend React (production)
# Stage 1: build React app jadi static files
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve hasil build pakai Nginx (image jauh lebih kecil dari image Node)
FROM nginx:alpine

# Ganti "dist" jadi "build" di baris bawah kalau project pakai Create React App, bukan Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Config custom supaya React Router (client-side routing) tidak 404 saat refresh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
