FROM oven/bun:1.1-alpine

WORKDIR /app

# Install PM2 globally using npm
RUN apk add --no-cache nodejs npm && \
    npm install -g pm2

# Copy dependency files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the entire prisma directory with all schema files
COPY prisma/ ./prisma/

# Debug: Check what files are present
RUN echo "=== Prisma directory contents ===" && \
    find prisma -name "*.prisma" -exec echo "File: {}" \; -exec cat {} \; && \
    echo "=== End of prisma files ==="

# Generate Prisma Client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Use PM2 to run App
CMD ["pm2-runtime", "dist/main.js"]
