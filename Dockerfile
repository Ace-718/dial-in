# Node server (Express/Fastify/etc). The app must listen on 0.0.0.0:3000 (or change EXPOSE + the code).
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
