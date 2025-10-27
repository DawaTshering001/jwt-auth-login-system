# Backend/Dockerfile
# Multi-stage, cache-friendly Dockerfile for a Node 18+ backend
# - Copies package.json and package-lock.json first to leverage Docker layer caching
# - Installs production dependencies in a small base image
# - Copies application source code and runs as non-root user
# - Exposes port 4000

# Use official Node 18 LTS alpine image for smaller size
FROM node:18-alpine AS deps

# Create app directory
WORKDIR /app

# Install OS packages required for some native modules (if needed). Keep minimal.
# If your project doesn't need build tools you can remove the apk add line.
RUN apk add --no-cache libc6-compat

# Copy package manifests and install dependencies (cached layer)
COPY package.json package-lock.json* ./
# Install only production dependencies for the runtime image
RUN npm ci --production

# ---- runtime image ----
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Use environment variable for production setting; can be overridden
ENV NODE_ENV=production
# Recommended environment vars (set in docker-compose or runtime)
ENV PORT=4000

EXPOSE 4000

# Run as non-root user
USER appuser

# Start the server
CMD ["node", "server.js"]
