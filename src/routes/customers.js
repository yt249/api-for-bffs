const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Add customer
router.post('/', async (req, res) => {
  const { userId, name, phone, address, address2, city, state, zipcode } =
    req.body;

  if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
    return res
      .status(400)
      .json({ message: 'All required fields must be provided' });
  }

  try {
    const [existing] = await db.query(
      'SELECT * FROM customers WHERE userId = ?',
      [userId]
    );
    if (existing.length > 0) {
      return res
        .status(422)
        .json({ message: 'This user ID already exists in the system.' });
    }

    const [result] = await db.query(
      'INSERT INTO customers (userId, name, phone, address, address2, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone, address, address2, city, state, zipcode]
    );

    res.status(201).json({
      id: result.insertId,
      userId,
      name,
      phone,
      address,
      address2,
      city,
      state,
      zipcode,
    });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// ✅ Retrieve customer by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ID not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// ✅ Retrieve customer by user ID
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId query parameter' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE userId = ?', [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User-ID not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// ✅ Health Check Endpoint
router.get('/status', (req, res) => {
  res.status(200).send('OK');
});

module.exports = router;
