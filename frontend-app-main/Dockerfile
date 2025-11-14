# Multi-stage build for Angular
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build --prod

# Runtime stage with nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage - FIXED PATH
COPY --from=build /app/dist/steex /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]