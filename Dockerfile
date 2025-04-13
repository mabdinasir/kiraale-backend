# Bun's Alpine image (smaller and faster)
FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy package.json and PRISMA schema directory
COPY package.json ./
COPY prisma ./prisma/
COPY bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile  

# Install PM2 globally and ensure it's in PATH
RUN bun install -g pm2
RUN ln -s /root/.bun/bin/pm2-runtime /usr/local/bin/pm2-runtime
RUN ln -s /root/.bun/bin/pm2 /usr/local/bin/pm2

# Generate Prisma Client
RUN bunx prisma generate

# Build and run
COPY . .
RUN bun run build

# Environment variable
ENV NODE_ENV=production

# Expose the application port
EXPOSE 8080

# Start with PM2
CMD ["pm2-runtime", "dist/main.js", "--name", "kiraale-be", "--no-daemon"]