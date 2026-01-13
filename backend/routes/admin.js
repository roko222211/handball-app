const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');

// Sve rute trebaju admin autorizaciju
router.use(adminAuth);

// Dohvati sve utakmice (uključujući završene)
router.get('/matches', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches ORDER BY match_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati nezavršene utakmice
router.get('/matches/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE is_finished = false 
       ORDER BY match_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati sve korisnike
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, total_points, is_admin, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Promijeni admin status korisnika
router.patch('/users/:userId/admin', async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_admin } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, username, email, is_admin',
      [is_admin, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    
    res.json({
      message: 'Admin status ažuriran',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obriši utakmicu
router.delete('/matches/:matchId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM matches WHERE id = $1 RETURNING *',
      [req.params.matchId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utakmica nije pronađena' });
    }
    
    res.json({ message: 'Utakmica obrisana', match: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ažuriraj timove za TBD utakmicu
router.patch('/matches/:matchId/teams', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { home_team, away_team } = req.body;
    
    const result = await pool.query(
      'UPDATE matches SET home_team = $1, away_team = $2 WHERE id = $3 RETURNING *',
      [home_team, away_team, matchId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utakmica nije pronađena' });
    }
    
    res.json({
      message: 'Timovi ažurirani',
      match: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

