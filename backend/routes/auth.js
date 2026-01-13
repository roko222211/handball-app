const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Registracija
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Provjeri postoji li već korisnik
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Korisnik s tim emailom već postoji' });
    }
    
    // Hash lozinke
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Spremi korisnika
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) RETURNING id, email, username, total_points, is_admin, created_at`,
      [email, username, password_hash]
    );
    
    const user = result.rows[0];
    
    // Kreiraj JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Registracija uspješna',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        total_points: user.total_points,
        is_admin: user.is_admin
      }
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Pronađi korisnika
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Neispravni email ili lozinka' });
    }
    
    const user = result.rows[0];
    
    // Provjeri lozinku
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Neispravni email ili lozinka' });
    }
    
    // Kreiraj JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Prijava uspješna',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        total_points: user.total_points,
        is_admin: user.is_admin
      }
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
