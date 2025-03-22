# Use Alpine Node.js for a lightweight image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies using npm
RUN npm install --omit=dev

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the application files
COPY . .

# Build the TypeScript project using npm
RUN npm run build

# Expose the application port
EXPOSE 8080

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "eastleigh-real-estate-production", "--watch", "--no-daemon"]
