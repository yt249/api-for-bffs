FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .
COPY mobile.env .env

# Expose port 80 for BFF
EXPOSE 80

# Start the app
CMD ["node", "app.js"]
