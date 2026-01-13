import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatTeamWithFlag } from '../utils/flags';
import './Predictions.css';

function Predictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, finished, pending

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/predictions/my-predictions');
      setPredictions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Greška:', error);
      setLoading(false);
    }
  };

  const getFilteredPredictions = () => {
    if (filter === 'finished') {
      return predictions.filter(p => p.is_finished);
    }
    if (filter === 'pending') {
      return predictions.filter(p => !p.is_finished);
    }
    return predictions;
  };

  const getPointsLabel = (points) => {
    if (points === 5) return '🎯 Točan rezultat';
    if (points === 3) return '✅ Točna razlika';
    if (points === 1) return '👍 Točan pobjednik';
    if (points === 0) return '❌ Promašaj';
    return '⏳ Čeka se rezultat';
  };

  const getPointsClass = (points) => {
    if (points === 5) return 'exact';
    if (points === 3) return 'difference';
    if (points === 1) return 'winner';
    if (points === 0) return 'wrong';
    return 'pending';
  };

  const calculateStats = () => {
    const finished = predictions.filter(p => p.is_finished);
    const totalPoints = finished.reduce((sum, p) => sum + (p.points_earned || 0), 0);
    const exact = finished.filter(p => p.points_earned === 5).length;
    const difference = finished.filter(p => p.points_earned === 3).length;
    const winner = finished.filter(p => p.points_earned === 1).length;
    const wrong = finished.filter(p => p.points_earned === 0).length;

    return {
      total: predictions.length,
      finished: finished.length,
      pending: predictions.length - finished.length,
      totalPoints,
      exact,
      difference,
      winner,
      wrong
    };
  };

  if (loading) {
    return <div className="loading">Učitavanje predviđanja...</div>;
  }

  const filteredPredictions = getFilteredPredictions();
  const stats = calculateStats();

  return (
    <div className="predictions-container">
      <h1>📊 Moja predviđanja</h1>

      {/* Statistika */}
      <div className="predictions-stats">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-number">{stats.exact}</div>
            <div className="stat-text">Točni rezultati</div>
            <div className="stat-points">+{stats.exact * 5} bodova</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.difference}</div>
            <div className="stat-text">Točne razlike</div>
            <div className="stat-points">+{stats.difference * 3} bodova</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👍</div>
          <div className="stat-info">
            <div className="stat-number">{stats.winner}</div>
            <div className="stat-text">Točni pobjednici</div>
            <div className="stat-points">+{stats.winner * 1} bod</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-number">{stats.wrong}</div>
            <div className="stat-text">Promašaji</div>
            <div className="stat-points">0 bodova</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Sve ({predictions.length})
        </button>
        <button 
          className={filter === 'finished' ? 'active' : ''}
          onClick={() => setFilter('finished')}
        >
          Završene ({stats.finished})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Nadolazeće ({stats.pending})
        </button>
      </div>

      {/* Lista predviđanja */}
      <div className="predictions-list">
        {filteredPredictions.length === 0 ? (
          <div className="no-predictions">
            <p>Nema predviđanja za prikaz</p>
            <a href="/matches" className="go-to-matches">Idi na utakmice →</a>
          </div>
        ) : (
          filteredPredictions.map(pred => (
            <div key={pred.id} className={`prediction-card ${pred.is_finished ? 'finished' : ''}`}>
              <div className="prediction-header">
                <span className="match-stage">{pred.stage}</span>
                {pred.group_name && (
                  <span className="match-group">Grupa {pred.group_name}</span>
                )}
                <span className="match-date">
                  {new Date(pred.match_date).toLocaleDateString('hr-HR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="prediction-body">
                <div className="match-info">
                  <div className="team home">
                    <span className="team-name">{formatTeamWithFlag(pred.home_team)}</span>
                    <div className="scores">
                      <span className="predicted-score">{pred.predicted_home_score}</span>
                      {pred.is_finished && (
                        <span className="actual-score">{pred.actual_home_score}</span>
                      )}
                    </div>
                  </div>

                  <div className="vs">VS</div>

                  <div className="team away">
                    <span className="team-name">{formatTeamWithFlag(pred.away_team)}</span>
                    <div className="scores">
                      <span className="predicted-score">{pred.predicted_away_score}</span>
                      {pred.is_finished && (
                        <span className="actual-score">{pred.actual_away_score}</span>
                      )}
                    </div>
                  </div>
                </div>

                {pred.predicted_top_goalscorer && (
                  <div className="goalscorer-prediction">
                    Top strijelac: <strong>{pred.predicted_top_goalscorer}</strong>
                    {pred.is_finished && pred.top_goalscorer && (
                      <span className="actual-goalscorer">
                        (Stvarni: {pred.top_goalscorer})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {pred.is_finished && (
                <div className={`prediction-result ${getPointsClass(pred.points_earned)}`}>
                  <span className="result-label">{getPointsLabel(pred.points_earned)}</span>
                  <span className="result-points">+{pred.points_earned} bodova</span>
                </div>
              )}

              {!pred.is_finished && (
                <div className="prediction-pending">
                  ⏳ Utakmica još nije započela
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Predictions;
