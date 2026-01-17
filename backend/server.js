const express = require('express');
const cors = require('cors');
const pool = require('./db');
const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictions');
const matchStatsRoutes = require('./routes/matchStats');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const tournamentPredictionRoutes = require('./routes/tournamentPredictions');

const app = express();

// CORS - dozvoli frontend pristup
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Handball Euro 2026 API 🏐',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected!', 
      time: result.rows[0],
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes - SVE PRIJE 404 HANDLERA!
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/match-stats', matchStatsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tournament-predictions', tournamentPredictionRoutes); // ← PREMJESTIO OVDJE

// 404 handler - MORA biti ZADNJI route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`);
});
 