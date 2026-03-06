# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./

RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["npm", "start"]
