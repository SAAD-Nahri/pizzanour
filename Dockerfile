FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data /app/uploads && chown -R node:node /app

ENV NODE_ENV=production
USER node

FROM base AS website-production
ENV PORT=3002
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3002}/health || exit 1
CMD ["node", "website-server.js"]

FROM base AS admin-production
ENV PORT=3102
EXPOSE 3102
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3102}/health || exit 1
CMD ["node", "admin-server.js"]
