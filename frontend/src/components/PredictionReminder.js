import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './PredictionReminder.css';

function PredictionReminder() {
  const [missingPredictions, setMissingPredictions] = useState(0);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    checkMissingPredictions();
  }, []);

  const checkMissingPredictions = async () => {
  try {
    const [matchesRes, predictionsRes] = await Promise.all([
      api.get('/matches'),
      api.get('/predictions/my-predictions')
    ]);

    const now = new Date();
    
    // Filtriraj samo utakmice u sljedećih 24 sata (samo poznati timovi)
    const upcomingMatches = matchesRes.data.filter(m => {
      if (m.is_finished) return false;
      if (m.home_team.includes('TBD') || m.away_team.includes('TBD')) return false;  // ← DODAJ
      
      const matchDate = new Date(m.match_date);
      const hoursUntilMatch = (matchDate - now) / (1000 * 60 * 60);
      
      return hoursUntilMatch > 0 && hoursUntilMatch <= 24;
    });

    const predictedMatchIds = new Set(predictionsRes.data.map(p => p.match_id));
    const missing = upcomingMatches.filter(m => !predictedMatchIds.has(m.id));

    setMissingPredictions(missing.length);
    
    if (missing.length > 0) {
      setShowReminder(true);
    }
  } catch (error) {
    console.error('Greška:', error);
  }
};


  if (!showReminder || missingPredictions === 0) {
    return null;
  }

  return (
    <div className="prediction-reminder">
      <div className="reminder-content">
        <span className="reminder-icon">🎯</span>
        <span className="reminder-text">
          Imaš <strong>{missingPredictions}</strong> {missingPredictions === 1 ? 'utakmicu' : 'utakmica'} bez predviđanja u sljedećih 24h!
        </span>
        <Link to="/matches" className="reminder-btn">Unesi sada</Link>
        <button className="close-reminder" onClick={() => setShowReminder(false)}>✕</button>
      </div>
    </div>
  );
}

export default PredictionReminder;
