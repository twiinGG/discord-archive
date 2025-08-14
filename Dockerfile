# Use Node.js 20 Alpine for better Supabase compatibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Keep TypeScript for runtime config loading
RUN npm prune --production --ignore-scripts

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
