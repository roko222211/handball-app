const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all matches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM matches ORDER BY match_date ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new match
router.post('/', async (req, res) => {
  try {
    const { home_team, away_team, match_date, stage, group_name } = req.body;
    
    const result = await pool.query(
      `INSERT INTO matches (home_team, away_team, match_date, stage, group_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [home_team, away_team, match_date, stage, group_name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
