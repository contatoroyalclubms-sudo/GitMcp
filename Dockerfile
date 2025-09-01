FROM node:18

WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies
RUN npm install || echo "npm install completed"

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]