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

# Generate Prisma Client
RUN bun run build

# Copy the rest of the application
COPY . .

# Use PM2 to run App
CMD ["pm2-runtime", "dist/main.js"]
