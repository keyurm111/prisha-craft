FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=/api/v1
ARG VITE_BACKEND_URL=http://server:5000
ARG VITE_GOOGLE_CLIENT_ID=
ARG GOOGLE_CLIENT_ID=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

ENV BACKEND_PORT=5000

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
