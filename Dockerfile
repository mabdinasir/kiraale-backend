# Use Alpine Node.js for a lightweight image
FROM --platform=linux/amd64 node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL dependencies
RUN npm install

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
CMD ["pm2-runtime", "dist/main.js", "--name", "kiraale-be", "--watch", "--no-daemon"]