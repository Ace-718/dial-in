# Static site (plain HTML/JS, or a built SPA). For a Vite/React app, use the two-stage version below.
FROM nginx:1.29-alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/default.conf \
    && chmod -R a+rX /usr/share/nginx/html
EXPOSE 80

# --- Vite/React instead: replace everything above with ---
# FROM node:24-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# FROM nginx:1.29-alpine
# COPY default.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
