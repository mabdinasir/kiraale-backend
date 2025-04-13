FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies and PM2
RUN bun install --frozen-lockfile
# Install PM2 globally
RUN bun install -g pm2

# Generate Prisma Client
RUN bunx prisma generate

# Copy app and build
COPY . .
RUN bun run build

# Set production env
ENV NODE_ENV=production

EXPOSE 8080

# Start with PM2
CMD ["/usr/local/bin/pm2-runtime", "dist/main.js", "--name", "kiraale-be", "--no-daemon"]