FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Install PM2 globally
RUN bun install -g pm2

# Check pm2 installation path
RUN which pm2

# Generate Prisma Client
RUN bunx prisma generate

# Copy app and build
COPY . .
RUN bun run build

# Check if the build was successful
RUN test -f dist/main.js && chmod +x dist/main.js || (echo "Build failed"; exit 1)

# Verify build output exists
RUN ls -la dist/ && test -f dist/main.js

CMD ["sh", "-c", "pm2-runtime dist/main.js"]
