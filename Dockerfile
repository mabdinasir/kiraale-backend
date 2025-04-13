FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma Client
RUN bunx prisma generate

# Copy app and build
COPY . .
RUN bun run build

CMD ["bun", "dist/main.js"]
