const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Pošalji predviđanje
router.post('/', auth, async (req, res) => {
  try {
    const { match_id, predicted_home_score, predicted_away_score, predicted_top_goalscorer } = req.body;
    const userId = req.user.userId;
    
    // Provjeri je li utakmica već počela
    const matchResult = await pool.query(
      'SELECT match_date, is_finished FROM matches WHERE id = $1',
      [match_id]
    );
    
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utakmica nije pronađena' });
    }
    
    const match = matchResult.rows[0];
    
    if (new Date(match.match_date) < new Date()) {
      return res.status(400).json({ error: 'Utakmica je već počela. Ne možeš mijenjati predviđanje.' });
    }
    
    if (match.is_finished) {
      return res.status(400).json({ error: 'Utakmica je završena' });
    }
    
    // Upsert (insert ili update ako već postoji)
    const result = await pool.query(
      `INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_top_goalscorer) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, match_id) 
       DO UPDATE SET 
         predicted_home_score = $3,
         predicted_away_score = $4,
         predicted_top_goalscorer = $5
       RETURNING *`,
      [userId, match_id, predicted_home_score, predicted_away_score, predicted_top_goalscorer]
    );
    
    res.json({
      message: 'Predviđanje spremljeno',
      prediction: result.rows[0]
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati sva predviđanja korisnika
router.get('/my-predictions', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT p.*, m.home_team, m.away_team, m.match_date, m.stage, m.group_name
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       WHERE p.user_id = $1
       ORDER BY m.match_date ASC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati predviđanje za specifičnu utakmicu
router.get('/match/:matchId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchId = req.params.matchId;
    
    const result = await pool.query(
      'SELECT * FROM predictions WHERE user_id = $1 AND match_id = $2',
      [userId, matchId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nema predviđanja za ovu utakmicu' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
