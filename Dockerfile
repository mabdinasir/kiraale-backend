# Bun's Alpine image (smaller and faster)
FROM --platform=linux/amd64 oven/bun:1.1-alpine

WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Install PM2 globally
RUN bun install -g pm2

# Generate Prisma Client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the project (Bun can run TypeScript directly, but tsc is fine too)
RUN bun run build

EXPOSE 8080

# Start with PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "kiraale-be", "--watch", "--no-daemon"]