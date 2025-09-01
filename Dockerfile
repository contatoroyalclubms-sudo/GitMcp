# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package.json first
COPY package.json ./

# Install dependencies with proper flags
RUN npm install --production --silent --no-audit --no-fund || npm install

# Copy all source files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]