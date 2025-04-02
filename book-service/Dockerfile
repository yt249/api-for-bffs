FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY book-service.env .env

EXPOSE 3000
CMD ["node", "app.js"]
