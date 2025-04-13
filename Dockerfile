# Bun's Alpine image (smaller and faster)
FROM oven/bun:1.1-alpine

WORKDIR /app

# Copy package files and Prisma schema
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies (Bun will create bun.lockb) -> # Strict mode, like `npm ci`
RUN bun install --frozen-lockfile  

# Install PM2 globally
RUN bun install -g pm2

# Generate Prisma Client
RUN bunx prisma generate

# Build and run
COPY . .
RUN bun run build

# Expose the application port
EXPOSE 8080

# Start with PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "kiraale-be", "--watch", "--no-daemon"]