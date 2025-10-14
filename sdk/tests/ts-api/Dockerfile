# Multi-stage build for TypeScript API
FROM node:22-alpine AS builder
WORKDIR /app

# Enable Corepack and configure Yarn
RUN corepack enable
COPY .yarnrc.yml .

# Copy workspace configuration and package files
COPY package.json yarn.lock* ./
COPY sdk/tests/ts-api/package.json ./sdk/tests/ts-api/
COPY sdk/core/package.json ./sdk/core/
COPY common/package.json ./common/
COPY circuits/package.json ./circuits/

# Copy source code
COPY common/ ./common/
COPY circuits/ ./circuits/
COPY sdk/core/ ./sdk/core/
COPY sdk/tests/ts-api/ ./sdk/tests/ts-api/

# Install dependencies and build
# Use --mode=skip-build to skip postinstall scripts (like patch-package) that aren't needed in Docker
RUN yarn install --mode=skip-build
RUN yarn workspace @selfxyz/common run build
# Skip circuits build - we only need the JSON test data files, not compiled circuits
RUN yarn workspace @selfxyz/core run build
RUN yarn workspace @selfxyz/ts-api-test run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Enable Corepack
RUN corepack enable
COPY .yarnrc.yml .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 apiuser

# Copy workspace configuration
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=apiuser:nodejs /app/yarn.lock ./yarn.lock

# Copy built workspace dependencies
COPY --from=builder --chown=apiuser:nodejs /app/common/dist ./common/dist
COPY --from=builder --chown=apiuser:nodejs /app/common/package.json ./common/package.json
# Copy only the OFAC JSON data files from circuits (no circuit files needed)
COPY --from=builder --chown=apiuser:nodejs /app/circuits/tests/consts/ofac ./circuits/tests/consts/ofac
COPY --from=builder --chown=apiuser:nodejs /app/circuits/package.json ./circuits/package.json
COPY --from=builder --chown=apiuser:nodejs /app/sdk/core/dist ./sdk/core/dist
COPY --from=builder --chown=apiuser:nodejs /app/sdk/core/package.json ./sdk/core/package.json

# Copy the API application
COPY --from=builder /app/sdk/tests/ts-api/dist ./sdk/tests/ts-api/dist
COPY --from=builder /app/sdk/tests/ts-api/package.json ./sdk/tests/ts-api/package.json

RUN yarn workspaces focus @selfxyz/ts-api-test --production

# Fix ownership after install
RUN chown -R apiuser:nodejs /app

# Set working directory to the API
WORKDIR /app/sdk/tests/ts-api

USER apiuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
