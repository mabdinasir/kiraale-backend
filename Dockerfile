# Use Alpine Node.js for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies for Prisma CLI)
RUN npm ci

# Install PM2 globally
RUN npm install -g pm2

# Generate Prisma Client (schema is now available)
RUN npx prisma generate

# Remove dev dependencies after Prisma generation (optional)
RUN npm prune --omit=dev

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the application port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "eastleigh-real-estate-production", "--watch", "--no-daemon"]