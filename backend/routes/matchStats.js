const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ažuriraj rezultat i top strijelca nakon utakmice (ADMIN)
router.post('/update-match', async (req, res) => {
  try {
    const { match_id, actual_home_score, actual_away_score, top_goalscorer } = req.body;
    
    const result = await pool.query(
      `UPDATE matches 
       SET actual_home_score = $1, 
           actual_away_score = $2, 
           top_goalscorer = $3,
           is_finished = true
       WHERE id = $4
       RETURNING *`,
      [actual_home_score, actual_away_score, top_goalscorer, match_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utakmica nije pronađena' });
    }
    
    // Izračunaj bodove za sve koji su predvidjeli ovu utakmicu
    await calculatePoints(match_id);
    
    res.json({
      message: 'Rezultat ažuriran i bodovi izračunati',
      match: result.rows[0]
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Funkcija za izračun bodova
async function calculatePoints(matchId) {
  try {
    // Dohvati rezultat utakmice
    const matchResult = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [matchId]
    );
    
    if (matchResult.rows.length === 0) return;
    
    const match = matchResult.rows[0];
    const homeScore = match.actual_home_score;
    const awayScore = match.actual_away_score;
    const topScorer = match.top_goalscorer;
    
    // Dohvati sva predviđanja za ovu utakmicu
    const predictions = await pool.query(
      'SELECT * FROM predictions WHERE match_id = $1',
      [matchId]
    );
    
    for (const pred of predictions.rows) {
      let points = 0;
      
      const predHome = pred.predicted_home_score;
      const predAway = pred.predicted_away_score;
      
      // Točan rezultat = 5 bodova
      if (predHome === homeScore && predAway === awayScore) {
        points = 5;
      }
      // Točna razlika = 3 boda
      else if ((predHome - predAway) === (homeScore - awayScore)) {
        points = 3;
      }
      // Točan pobjednik = 1 bod
      else if (
        (predHome > predAway && homeScore > awayScore) ||
        (predHome < predAway && homeScore < awayScore) ||
        (predHome === predAway && homeScore === awayScore)
      ) {
        points = 1;
      }
      
      // Bonus: točan top strijelac = +1 bod
      if (pred.predicted_top_goalscorer && 
          pred.predicted_top_goalscorer.toLowerCase() === topScorer?.toLowerCase()) {
        points += 1;
      }
      
      // Ažuriraj bodove za predviđanje
      await pool.query(
        'UPDATE predictions SET points_earned = $1 WHERE id = $2',
        [points, pred.id]
      );
      
      // Ažuriraj ukupne bodove korisnika
      await pool.query(
        `UPDATE users 
         SET total_points = (
           SELECT COALESCE(SUM(points_earned), 0) 
           FROM predictions 
           WHERE user_id = $1
         )
         WHERE id = $1`,
        [pred.user_id]
      );
    }
    
  } catch (err) {
    console.error('Greška pri izračunu bodova:', err);
  }
}

module.exports = router;
