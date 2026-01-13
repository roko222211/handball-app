import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PredictionReminder from '../components/PredictionReminder';
import { formatTeamWithFlag } from '../utils/flags';
import './Home.css';

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Dohvati statistiku korisnika
      const statsRes = await api.get(`/leaderboard/user/${user.id}`);
      setStats(statsRes.data.stats);

      // Dohvati nadolazeće utakmice (samo one sa poznatim timovima)
      const matchesRes = await api.get('/matches');
      const upcoming = matchesRes.data
        .filter(m => 
          !m.is_finished && 
          new Date(m.match_date) > new Date() &&
          !m.home_team.includes('TBD') &&
          !m.away_team.includes('TBD')
        )
        .slice(0, 5);
      setUpcomingMatches(upcoming);

      // Dohvati top 5 korisnika
      const leaderboardRes = await api.get('/leaderboard');
      setTopUsers(leaderboardRes.data.slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error('Greška:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Dobrodošao, {user.username}! 🏐</h1>
        <p>Ukupno bodova: <strong>{user.total_points}</strong></p>
      </div>

      <PredictionReminder />

      <div className="home-grid">
        {/* Tvoja statistika */}
        <div className="home-card">
          <h2>📊 Tvoja statistika</h2>
          {stats && (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_predictions}</div>
                <div className="stat-label">Ukupno predviđanja</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.exact_scores}</div>
                <div className="stat-label">Točni rezultati</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.correct_differences}</div>
                <div className="stat-label">Točne razlike</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.correct_winners}</div>
                <div className="stat-label">Točni pobjednici</div>
              </div>
            </div>
          )}
        </div>

        {/* Nadolazeće utakmice */}
        <div className="home-card">
          <h2>⏰ Nadolazeće utakmice</h2>
          {upcomingMatches.length > 0 ? (
            <div className="upcoming-list">
              {upcomingMatches.map(match => (
                <div key={match.id} className="upcoming-match">
                  <div className="match-teams">
                    {formatTeamWithFlag(match.home_team)} vs {formatTeamWithFlag(match.away_team)}
                  </div>
                  <div className="match-date">
                    {new Date(match.match_date).toLocaleDateString('hr-HR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nema nadolazećih utakmica</p>
          )}
          <Link to="/matches" className="card-link">
            Vidi sve utakmice →
          </Link>
        </div>

        {/* Top 5 ljestvica */}
        <div className="home-card">
          <h2>🏆 Top 5 igrača</h2>
          <div className="top-users">
            {topUsers.map((u, index) => (
              <div key={u.id} className="top-user-item">
                <span className="user-rank">#{index + 1}</span>
                <span className="user-username">{u.username}</span>
                <span className="user-total-points">{u.total_points} bodova</span>
              </div>
            ))}
          </div>
          <Link to="/leaderboard" className="card-link">
            Vidi cijelu ljestvicu →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
