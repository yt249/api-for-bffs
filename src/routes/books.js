const express = require('express');
const router = express.Router();
const db = require('../models/db');

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

  try {
    const [rows] = await db.query('SELECT * FROM books WHERE ISBN = ?', [ISBN]);
    if (rows.length > 0) {
      return res
        .status(422)
        .json({ message: 'This ISBN already exists in the system.' });
    }

    await db.query(
      'INSERT INTO books (ISBN, title, Author, description, genre, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ISBN, title, Author, description, genre, price, quantity]
    );
    res
      .status(201)
      .json({ ISBN, title, Author, description, genre, price, quantity });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
});

// Update a book
router.put('/:ISBN', async (req, res) => {
  const { title, Author, description, genre, price, quantity } = req.body;
  const { ISBN } = req.params;

  if (!title || !Author || !description || !genre || !price || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [rows] = await db.query(
      'UPDATE books SET title=?, Author=?, description=?, genre=?, price=?, quantity=? WHERE ISBN=?',
      [title, Author, description, genre, price, quantity, ISBN]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'ISBN not found' });
    }

    res
      .status(200)
      .json({ ISBN, title, Author, description, genre, price, quantity });
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
