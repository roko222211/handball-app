const express = require('express');
const router = express.Router();
const pool = require('../db');

// Dohvati ljestvicu svih korisnika
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, total_points, created_at
       FROM users
       ORDER BY total_points DESC, created_at ASC`
    );
    
    // Dodaj ranking poziciju
    const leaderboard = result.rows.map((user, index) => ({
      rank: index + 1,
      ...user
    }));
    
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati detaljnu statistiku korisnika
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Osnovni podaci korisnika
    const userResult = await pool.query(
      'SELECT id, username, email, total_points FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }
    
    // Statistika predviđanja
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_predictions,
        COUNT(CASE WHEN points_earned = 5 THEN 1 END) as exact_scores,
        COUNT(CASE WHEN points_earned = 3 THEN 1 END) as correct_differences,
        COUNT(CASE WHEN points_earned = 1 THEN 1 END) as correct_winners,
        COUNT(CASE WHEN points_earned = 0 THEN 1 END) as wrong_predictions
       FROM predictions
       WHERE user_id = $1`,
      [userId]
    );
    
    res.json({
      user: userResult.rows[0],
      stats: statsResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
