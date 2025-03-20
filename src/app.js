require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bookRoutes = require('./routes/books');
const customerRoutes = require('./routes/customers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/books', bookRoutes);
app.use('/customers', customerRoutes);

app.get('/status', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
