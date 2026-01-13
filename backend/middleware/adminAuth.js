const jwt = require('jsonwebtoken');
const pool = require('../db');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Pristup odbijen. Token nije pronađen.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Provjeri je li korisnik admin
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Pristup odbijen. Potrebne su admin ovlasti.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Nevažeći token' });
  }
};

module.exports = adminAuth;
