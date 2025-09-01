FROM node:18

WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies
RUN npm install || echo "npm install completed"

# Give execute permissions
RUN chmod +x /usr/local/bin/node || true
RUN chmod 755 server.js || true

# Expose port
EXPOSE 3000

# Start command using shell form
CMD node server.js