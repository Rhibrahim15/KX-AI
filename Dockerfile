# KX Sanctuary OS - Robust HF Spaces Dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev) for tsx + TypeScript to work reliably
RUN npm ci

# Copy all source code
COPY . .

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# HF Spaces expects port 7860
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

# Switch to non-root user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD curl -f http://localhost:7860/v1/health || exit 1

# Start with tsx (now guaranteed to be available)
CMD ["npx", "tsx", "api/server.ts"]
