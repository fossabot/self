# Multi-stage build for TypeScript API
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps

# Enable Corepack to use the correct Yarn version
RUN corepack enable

# Copy package files
COPY package.json yarn.lock* ./
COPY sdk/tests/ts-api/package.json ./sdk/tests/ts-api/
COPY sdk/core/package.json ./sdk/core/
COPY common/package.json ./common/

# Install dependencies using yarn workspaces 
# Force Yarn to use node_modules instead of PnP mode
RUN yarn config set nodeLinker node-modules
RUN yarn install

# Build stage
FROM base AS builder

# Enable Corepack in builder stage too
RUN corepack enable

# Configure Yarn for workspaces (same as deps stage)
RUN yarn config set nodeLinker node-modules

# Copy workspace configuration files first
COPY package.json yarn.lock* ./
COPY sdk/tests/ts-api/package.json ./sdk/tests/ts-api/
COPY sdk/core/package.json ./sdk/core/
COPY common/package.json ./common/

# Copy installed dependencies (Yarn workspaces use single root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code for workspace dependencies
COPY common/ ./common/
COPY sdk/core/ ./sdk/core/
COPY sdk/tests/ts-api/ ./sdk/tests/ts-api/

# Re-run yarn install to establish proper workspace links (fast since deps are cached)
RUN yarn install

# Build workspace dependencies using correct workspace names
RUN yarn workspaces list
RUN yarn workspace @selfxyz/common run build
RUN yarn install   # Refresh and validate state
RUN yarn workspace @selfxyz/core run build  
RUN yarn install   # Refresh and validate state

# Build the TypeScript API (correct name from workspaces list)
RUN yarn workspace @selfxyz/ts-api-test run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Enable Corepack for production dependencies
RUN corepack enable

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 apiuser

# Copy built files
COPY --from=builder --chown=apiuser:nodejs /app/sdk/tests/ts-api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/sdk/tests/ts-api/package.json ./package.json

# Install only production dependencies
RUN yarn install --production && yarn cache clean

USER apiuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
