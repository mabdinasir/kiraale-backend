# Use Alpine Node.js for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies (includes Prisma CLI from devDependencies)
RUN npm ci --omit=dev

# Install PM2 globally
RUN npm install -g pm2

# Generate Prisma Client (schema is now available)
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the application port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "eastleigh-real-estate-production", "--watch", "--no-daemon"]