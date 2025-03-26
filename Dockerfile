# Use official Bun image
FROM oven/bun:1.1-alpine

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies (Bun will handle both dev and prod)
RUN bun install

# Install PM2 globally (using npm that comes with Bun)
RUN npm install -g pm2

# Generate Prisma Client
RUN bunx prisma generate

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN bun run build

# Expose the application port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "eastleigh-real-estate-production", "--watch", "--no-daemon"]