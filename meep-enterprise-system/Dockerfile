FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./

# Generate package-lock.json if it doesn't exist, then install
RUN rm -f package-lock.json && npm install --package-lock-only && npm ci --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

CMD ["node", "server.js"]