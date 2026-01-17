const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Registracija
router.post('/register', async (req, res) => {
  console.log('=== REGISTER REQUEST ===');
  console.log('Body:', req.body);
  
  try {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ error: 'Sva polja su obavezna' });
    }
    
    console.log('✓ Checking if user exists...');
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ error: 'Korisnik s tim emailom već postoji' });
    }
    
    console.log('✓ Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('✓ Inserting user into database...');
    const result = await pool.query(
      `INSERT INTO users (email, username, password) 
       VALUES ($1, $2, $3) RETURNING id, email, username, total_points, is_admin, created_at`,
      [email, username, hashedPassword]
    );
    
    const user = result.rows[0];
    console.log('✓ User created with ID:', user.id);
    
    console.log('✓ Creating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✓ Registration successful!');
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
    console.error('❌ REGISTRATION ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('=== LOGIN REQUEST ===');
  console.log('Email:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email i lozinka su obavezni' });
    }
    
    console.log('✓ Finding user...');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'Neispravni email ili lozinka' });
    }
    
    const user = result.rows[0];
    console.log('✓ User found:', user.id);
    
    console.log('✓ Verifying password...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Neispravni email ili lozinka' });
    }
    
    console.log('✓ Creating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✓ Login successful!');
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
    console.error('❌ LOGIN ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - dohvati trenutnog usera iz tokena
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, username, total_points, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Auth/me error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
