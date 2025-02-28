# Use a Node.js base image
FROM node:23

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package manager files to cache dependencies
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install


COPY . .

# Expose the development server port
EXPOSE 5173

# Default command to start the development server
CMD ["npm", "run", "dev"]
