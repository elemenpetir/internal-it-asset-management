# Dockerfile — backend Express (production)
FROM node:20-alpine

WORKDIR /app

# Copy package files dulu supaya layer caching efektif
# (npm install cuma di-rerun kalau package*.json berubah)
COPY package*.json ./

RUN npm install --omit=dev

# Copy semua source code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
