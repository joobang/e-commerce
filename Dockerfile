# Step 1: Build the NestJS application
FROM node:16 AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install

# Copy all files and build the application
COPY . .
RUN npm run build

# Step 2: Run the application
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Set environment variable
ENV NODE_ENV prod

# Copy built files and node_modules from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Start the application
CMD ["npm", "run", "start:prod"]
