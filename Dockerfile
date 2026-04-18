FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx tsc -p tsconfig.server.json

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY src/config/voice-and-tone.md ./src/config/voice-and-tone.md
EXPOSE 80
ENV PORT=80
CMD ["node", "dist-server/proxy.js"]
