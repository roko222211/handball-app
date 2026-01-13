import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './Leaderboard.css';

function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchMyStats();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Greška:', error);
      setLoading(false);
    }
  };

  const fetchMyStats = async () => {
    try {
      const response = await api.get(`/leaderboard/user/${user.id}`);
      setMyStats(response.data);
    } catch (error) {
      console.error('Greška pri dohvaćanju statistike:', error);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return <div className="loading">Učitavanje ljestvice...</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>🏆 Ljestvica</h1>

      {/* Moja statistika */}
      {myStats && (
        <div className="my-stats-card">
          <h2>📊 Tvoja statistika</h2>
          <div className="stats-overview">
            <div className="stat-box">
              <div className="stat-value">{myStats.user.total_points}</div>
              <div className="stat-label">Ukupno bodova</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{myStats.stats.total_predictions}</div>
              <div className="stat-label">Predviđanja</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{myStats.stats.exact_scores}</div>
              <div className="stat-label">Točni rezultati</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{myStats.stats.correct_differences}</div>
              <div className="stat-label">Točne razlike</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{myStats.stats.correct_winners}</div>
              <div className="stat-label">Točni pobjednici</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{myStats.stats.wrong_predictions}</div>
              <div className="stat-label">Promašaji</div>
            </div>
          </div>
        </div>
      )}

      {/* Ljestvica */}
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="col-rank">Pozicija</div>
          <div className="col-username">Korisnik</div>
          <div className="col-points">Bodovi</div>
        </div>

        {leaderboard.map((player) => (
          <div
            key={player.id}
            className={`table-row ${player.id === user.id ? 'highlight-me' : ''} ${
              player.rank <= 3 ? 'top-three' : ''
            }`}
          >
            <div className="col-rank">
              <span className="rank-badge">{getMedalEmoji(player.rank)}</span>
            </div>
            <div className="col-username">
              {player.username}
              {player.id === user.id && <span className="you-badge">TI</span>}
            </div>
            <div className="col-points">
              <strong>{player.total_points}</strong>bodova
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="no-data">
          <p>Još nema igrača na ljestvici</p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
