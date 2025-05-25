FROM oven/bun:1.1-alpine

WORKDIR /app

# Install PM2 globally using npm instead of bun
RUN apk add --no-cache nodejs npm && \
    npm install -g pm2

# Copy dependency files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy app
COPY . .

# Generate Prisma Client
RUN cat prisma/schema/*.prisma > prisma/schema.prisma && bunx prisma generate

# Build the application
RUN bun run build

# Use PM2 to run App
CMD ["pm2-runtime", "dist/main.js"]
