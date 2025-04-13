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

# Verify build output exists
RUN ls -la dist/ && test -f dist/main.js

CMD ["bun", "dist/main.js", "--name", "kiraale-be", "--watch", "--no-daemon"]
