# Use Node.js official lightweight image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3000

# Start the API
CMD ["node", "src/app.js"]
