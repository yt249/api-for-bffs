const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Function to validate price format
const isValidPrice = (price) => {
  return !isNaN(price) && price > 0 && /^\d+\.\d{2}$/.test(price.toFixed(2));
};

// Add a book
router.post('/', async (req, res) => {
  const { ISBN, title, Author, description, genre, price, quantity } = req.body;

  if (
    !ISBN ||
    !title ||
    !Author ||
    !description ||
    !genre ||
    !price ||
    !quantity
  ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const priceValue = parseFloat(price);
  if (!isValidPrice(priceValue)) {
    return res
      .status(400)
      .json({
        message:
          'Invalid price format. Must be a positive number with two decimal places.',
      });
  }

  try {
    const [rows] = await db.query('SELECT * FROM books WHERE ISBN = ?', [ISBN]);
    if (rows.length > 0) {
      return res
        .status(422)
        .json({ message: 'This ISBN already exists in the system.' });
    }

    await db.query(
      'INSERT INTO books (ISBN, title, Author, description, genre, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ISBN, title, Author, description, genre, priceValue, quantity]
    );

    res
      .status(201)
      .json({
        ISBN,
        title,
        Author,
        description,
        genre,
        price: priceValue,
        quantity,
      });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Update a book
router.put('/:ISBN', async (req, res) => {
  const {
    title,
    Author,
    description,
    genre,
    price,
    quantity,
    ISBN: bodyISBN,
  } = req.body;
  const { ISBN } = req.params;

  if (!title || !Author || !description || !genre || !price || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (bodyISBN && bodyISBN !== ISBN) {
    return res
      .status(400)
      .json({ message: 'ISBN in request body does not match URL' });
  }

  const priceValue = parseFloat(price);
  if (!isValidPrice(priceValue)) {
    return res
      .status(400)
      .json({
        message:
          'Invalid price format. Must be a positive number with two decimal places.',
      });
  }

  try {
    const [rows] = await db.query(
      'UPDATE books SET title=?, Author=?, description=?, genre=?, price=?, quantity=? WHERE ISBN=?',
      [title, Author, description, genre, priceValue, quantity, ISBN]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'ISBN not found' });
    }

    res
      .status(200)
      .json({
        ISBN,
        title,
        Author,
        description,
        genre,
        price: priceValue,
        quantity,
      });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Retrieve a book
router.get('/:ISBN', async (req, res) => {
  const { ISBN } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM books WHERE ISBN = ?', [ISBN]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ISBN not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

module.exports = router;
