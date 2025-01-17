# Use an official Node.js image
FROM node:18

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json from local machine to container's /app directory
# This will ensure that necessary dependencies are installed
COPY package*.json ./

# Install dependencies (for both client and server) listed in package.json using npm 
RUN npm install

# Copy the rest of the project files into /app
COPY . .

# Build the React client
RUN npm run client --prefix client

# Expose the port the app runs on
# Note: This doesn’t publish the port to the host machine. It still needs to be mapped in docker run command or docker-compose.yml.
EXPOSE 3000

# Specifies the command to start the application inside the container, both server and client
CMD ["npm", "start"]
