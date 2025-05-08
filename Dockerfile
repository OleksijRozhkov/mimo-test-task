# Use Node 22.15.0 as base
FROM node:22.15.0-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code, migrations, and SQLite DB
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies for final image
RUN npm prune --production

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
