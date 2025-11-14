# Étape 1 : Build Angular
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build --prod

# Étape 2 : Serveur Nginx pour héberger les fichiers
FROM nginx:alpine
COPY --from=build /app/dist/steex /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]