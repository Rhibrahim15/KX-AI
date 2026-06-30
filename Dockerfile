# KX Sanctuary OS
FROM node:20-slim

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

# Copy all engine source, bots, bibles, and built static UI
COPY api/ ./api/
COPY bots/ ./bots/
COPY src/ ./src/
COPY gkp/ ./gkp/
COPY out/ ./out/
COPY public/ ./public/

# Create non-root user for security
RUN addgroup --system app && adduser --system --ingroup app app

# HF Spaces expects port 7860
ENV PORT=7860
EXPOSE 7860

# Switch to non-root user
USER app

# Health check for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:7860/v1/health || exit 1

CMD ["npx", "tsx", "api/server.ts"]
