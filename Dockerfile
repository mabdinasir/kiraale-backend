FROM oven/bun:1.1-alpine

WORKDIR /app

# 1. Install system dependencies
RUN apk add --no-cache nodejs npm && \
    npm install -g pm2

# 2. Copy dependency files first (for better caching)
COPY package.json bun.lockb ./

# 3. Install dependencies
RUN bun install

# 4. Copy Prisma schema
COPY prisma/ ./prisma/

# 5. Copy ALL other files
COPY . .

# 6. Build the application (including Prisma generation)
RUN bun run build

# 7. Runtime command
CMD ["pm2-runtime", "dist/main.js"]
