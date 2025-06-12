FROM oven/bun:1.1-alpine

WORKDIR /app

# Install PM2 globally using npm instead of bun
RUN apk add --no-cache nodejs npm && npm install -g pm2


COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma Client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Use PM2 to run App
CMD ["pm2-runtime", "dist/main.js"]
