const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth'); // pretpostavljam da imaš auth middleware

// GET - dohvati tournament prediction za usera
router.get('/my-prediction', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tournament_predictions WHERE user_id = $1',
      [req.user.userId]
    );
    
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST/PUT - spremi/ažuriraj tournament prediction
router.post('/my-prediction', authenticateToken, async (req, res) => {
  try {
    const {
      predicted_mvp,
      predicted_top_scorer,
      predicted_croatia_top_scorer,
      predicted_croatia_placement,
      predicted_1st_place,
      predicted_2nd_place,
      predicted_3rd_place
    } = req.body;
    
    // Check if prediction already exists
    const existing = await pool.query(
      'SELECT id FROM tournament_predictions WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (existing.rows.length > 0) {
      // UPDATE
      const result = await pool.query(
        `UPDATE tournament_predictions 
         SET predicted_mvp = $1,
             predicted_top_scorer = $2,
             predicted_croatia_top_scorer = $3,
             predicted_croatia_placement = $4,
             predicted_1st_place = $5,
             predicted_2nd_place = $6,
             predicted_3rd_place = $7,
             updated_at = NOW()
         WHERE user_id = $8
         RETURNING *`,
        [predicted_mvp, predicted_top_scorer, predicted_croatia_top_scorer,
         predicted_croatia_placement, predicted_1st_place, predicted_2nd_place,
         predicted_3rd_place, req.user.userId]
      );
      res.json(result.rows[0]);
    } else {
      // INSERT
      const result = await pool.query(
        `INSERT INTO tournament_predictions 
         (user_id, predicted_mvp, predicted_top_scorer, predicted_croatia_top_scorer,
          predicted_croatia_placement, predicted_1st_place, predicted_2nd_place, predicted_3rd_place)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.user.userId, predicted_mvp, predicted_top_scorer, predicted_croatia_top_scorer,
         predicted_croatia_placement, predicted_1st_place, predicted_2nd_place, predicted_3rd_place]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - tournament results (admin sets these)
router.get('/results', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournament_results LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - finalize tournament results (ADMIN ONLY)
router.post('/finalize-results', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    // if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    
    const {
      actual_mvp,
      actual_top_scorer,
      actual_croatia_placement,
      actual_croatia_top_scorer,
      actual_1st_place,
      actual_2nd_place,
      actual_3rd_place
    } = req.body;
    
    // Update tournament results
    await pool.query(
      `UPDATE tournament_results 
       SET actual_mvp = $1,
           actual_top_scorer = $2,
           actual_croatia_placement = $3,
           actual_croatia_top_scorer = $4,
           actual_1st_place = $5,
           actual_2nd_place = $6,
           actual_3rd_place = $7,
           is_finalized = true,
           finalized_at = NOW()
       WHERE id = 1`,
      [actual_mvp, actual_top_scorer, actual_croatia_placement,
       actual_croatia_top_scorer, actual_1st_place, actual_2nd_place, actual_3rd_place]
    );
    
    // Calculate points for all users
    await calculateTournamentPoints();
    
    res.json({ message: 'Tournament finalized and points calculated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Points calculation function
async function calculateTournamentPoints() {
  try {
    // Get actual results
    const resultsQuery = await pool.query('SELECT * FROM tournament_results WHERE id = 1');
    const results = resultsQuery.rows[0];
    
    if (!results || !results.is_finalized) return;
    
    const {
      actual_mvp,
      actual_top_scorer,
      actual_croatia_placement,
      actual_croatia_top_scorer,
      actual_1st_place,
      actual_2nd_place,
      actual_3rd_place
    } = results;
    
    // Get all predictions
    const predictions = await pool.query('SELECT * FROM tournament_predictions');
    
    for (const pred of predictions.rows) {
      let points_mvp = 0;
      let points_top_scorer = 0;
      let points_croatia_placement = 0;
      let points_croatia_top_scorer = 0;
      let points_1st = 0;
      let points_2nd = 0;
      let points_3rd = 0;
      
      // MVP (3 pts)
      if (pred.predicted_mvp?.toLowerCase().trim() === actual_mvp?.toLowerCase().trim()) {
        points_mvp = 3;
      }
      
      // Top scorer (3 pts)
      if (pred.predicted_top_scorer?.toLowerCase().trim() === actual_top_scorer?.toLowerCase().trim()) {
        points_top_scorer = 3;
      }
      
      // Croatia placement (3 pts)
      if (pred.predicted_croatia_placement === actual_croatia_placement) {
        points_croatia_placement = 3;
      }
      
      // Croatia top scorer (3 pts)
      if (pred.predicted_croatia_top_scorer?.toLowerCase().trim() === actual_croatia_top_scorer?.toLowerCase().trim()) {
        points_croatia_top_scorer = 3;
      }
      
      // Top 3 teams logic
      const actualTop3 = [actual_1st_place, actual_2nd_place, actual_3rd_place];
      
      // 1st place: 1pt if in top3, +2pts if exact = 3pts total
      if (pred.predicted_1st_place === actual_1st_place) {
        points_1st = 3; // exact position
      } else if (actualTop3.includes(pred.predicted_1st_place)) {
        points_1st = 1; // in top 3 but wrong position
      }
      
      // 2nd place
      if (pred.predicted_2nd_place === actual_2nd_place) {
        points_2nd = 3;
      } else if (actualTop3.includes(pred.predicted_2nd_place)) {
        points_2nd = 1;
      }
      
      // 3rd place
      if (pred.predicted_3rd_place === actual_3rd_place) {
        points_3rd = 3;
      } else if (actualTop3.includes(pred.predicted_3rd_place)) {
        points_3rd = 1;
      }
      
      const total_tournament_points = 
        points_mvp + points_top_scorer + points_croatia_placement +
        points_croatia_top_scorer + points_1st + points_2nd + points_3rd;
      
      // Update tournament_predictions
      await pool.query(
        `UPDATE tournament_predictions
         SET points_mvp = $1,
             points_top_scorer = $2,
             points_croatia_placement = $3,
             points_croatia_top_scorer = $4,
             points_1st_place = $5,
             points_2nd_place = $6,
             points_3rd_place = $7,
             total_tournament_points = $8
         WHERE id = $9`,
        [points_mvp, points_top_scorer, points_croatia_placement,
         points_croatia_top_scorer, points_1st, points_2nd, points_3rd,
         total_tournament_points, pred.id]
      );
      
      // Update user's total_points (add tournament points)
      await pool.query(
        `UPDATE users
         SET total_points = total_points + $1
         WHERE id = $2`,
        [total_tournament_points, pred.user_id]
      );
    }
    
    console.log('✓ Tournament points calculated for all users');
  } catch (err) {
    console.error('❌ Tournament points calculation error:', err);
  }
}

module.exports = router;
