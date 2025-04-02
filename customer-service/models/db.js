require('dotenv').config();
const mysql = require('mysql2');

let param = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log(param);

const pool = mysql.createPool(param);

module.exports = pool.promise();
