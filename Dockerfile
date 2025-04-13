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

# Check if the build was successful
RUN test -f dist/main.js && chmod +x dist/main.js || (echo "Build failed"; exit 1)

# Verify build output exists
RUN ls -la dist/ && test -f dist/main.js

CMD ["sh", "-c", "while true; do bun dist/main.js; sleep 2; done"]
