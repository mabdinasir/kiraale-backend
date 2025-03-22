# Use Alpine Node.js for a lightweight image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/home/runner/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH

# Copy package files
COPY package.json ./
COPY bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Install PM2 globally
RUN bun add pm2

# Copy the rest of the application files
COPY . .

# Build the TypeScript project using Bun
RUN bun run build

# Expose the application port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "eastleigh-real-estate-production", "--watch", "--no-daemon"]
