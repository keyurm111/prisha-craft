FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS development-deps
ENV NODE_ENV=development
RUN npm ci

FROM base AS production-deps
ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS development
ENV NODE_ENV=development
COPY --from=development-deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public/uploads
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
RUN apk add --no-cache su-exec
COPY --from=production-deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public/uploads \
    && chown -R node:node /app \
    && chmod -R 775 /app/public/uploads \
    && chmod +x /app/docker-entrypoint.sh
USER root
ENTRYPOINT ["/app/docker-entrypoint.sh"]
EXPOSE 5000
CMD ["npm", "start"]
