require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 80;
const BASE_URL =
  process.env.URL_BASE_BACKEND_SERVICES || 'http://localhost:3001'; // fallback for local testing

const allowedClientTypes = ['Web'];

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

    req.user = decoded; // attach decoded token to request
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

// 🔀 Proxy to /books endpoint (no mobile logic)
app.use('/books', validateJWT, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BASE_URL}/books${req.url}`,
      data: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || {
      message: 'Error forwarding /books request',
    };
    res.status(status).json(message);
  }
});

// 🔀 Proxy to /customers endpoint (no mobile logic)
app.use('/customers', validateJWT, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BASE_URL}/customers${req.url}`,
      data: req.body,
    });

    res.status(response.status).json(response.data);
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
  console.log(`bff-web listening on port ${PORT}`);
});
