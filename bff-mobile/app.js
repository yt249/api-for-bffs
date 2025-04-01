require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 80;
const BASE_URL =
  process.env.URL_BASE_BACKEND_SERVICES || 'http://localhost:3001'; // fallback

const allowedClientTypes = ['iOS', 'Android'];

// 🔐 JWT validation middleware
function validateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.decode(token);
    if (
      !decoded.sub ||
      !['starlord', 'gamora', 'drax', 'rocket', 'groot'].includes(decoded.sub)
    ) {
      throw new Error('Invalid sub');
    }

    if (decoded.iss !== 'cmu.edu') {
      throw new Error('Invalid iss');
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('Token expired');
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Invalid JWT token', error: err.message });
  }
}

// 📦 Validate X-Client-Type header
app.use((req, res, next) => {
  const clientType = req.headers['x-client-type'];
  if (!clientType || !allowedClientTypes.includes(clientType)) {
    return res
      .status(400)
      .json({ message: 'Invalid or missing X-Client-Type header' });
  }
  req.clientType = clientType;
  next();
});

// 📚 Forward and transform /books responses
app.use('/books', validateJWT, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BASE_URL}/books${req.url}`,
      data: req.body,
    });

    let data = response.data;

    // Mobile transformation: replace "non-fiction" with 3
    if (
      req.method === 'GET' &&
      typeof data === 'object' &&
      data.genre === 'non-fiction'
    ) {
      data.genre = 3;
    }

    res.status(response.status).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || {
      message: 'Error forwarding /books request',
    };
    res.status(status).json(message);
  }
});

// 👤 Forward and transform /customers responses
app.use('/customers', validateJWT, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BASE_URL}/customers${req.url}`,
      data: req.body,
    });

    let data = response.data;

    // Mobile transformation: remove personal address fields
    if (req.method === 'GET' && typeof data === 'object') {
      delete data.address;
      delete data.address2;
      delete data.city;
      delete data.state;
      delete data.zipcode;
    }

    res.status(response.status).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || {
      message: 'Error forwarding /customers request',
    };
    res.status(status).json(message);
  }
});

// ✅ Health check
app.get('/status', (req, res) => res.status(200).send('OK'));

app.listen(PORT, () => {
  console.log(`bff-mobile listening on port ${PORT}`);
});
