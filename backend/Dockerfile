# This is for backend (Node.js) Dockerfile


# Use an official node.js 22-alpine as a base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Build your TypeScript into dist/
RUN npm run build

# EXPOSE the port your app will run on (5000)
EXPOSE 5000

# Command to run the compiled server code
CMD ["node", "dist/server.js"]
