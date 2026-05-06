FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
