import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './TournamentAdmin.css';

function TournamentAdmin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [results, setResults] = useState({
    actual_mvp: '',
    actual_top_scorer: '',
    actual_croatia_placement: '',
    actual_croatia_top_scorer: '',
    actual_1st_place: '',
    actual_2nd_place: '',
    actual_3rd_place: ''
  });

  const [isFinalized, setIsFinalized] = useState(false);

  const teams = [
    'Francuska', 'Njemačka', 'Danska', 'Španjolska', 'Norveška', 'Švedska',
    'Hrvatska', 'Island', 'Mađarska', 'Nizozemska', 'Poljska', 'Portugal',
    'Srbija', 'Slovenija', 'Austrija', 'Češka', 'Rumunjska', 'Sjeverna Makedonija',
    'Švicarska', 'Ukrajina', 'Crna Gora', 'Gruzija', 'Farski Otoci', 'Italija'
  ];

  const croatiaPlacementOptions = [
    { value: 'preliminary_round', label: 'Preliminarna runda (ispada)' },
    { value: 'main_round', label: 'Glavni krug' },
    { value: 'semifinal', label: 'Polufinale' },
    { value: '3rd_place', label: '3. mjesto' },
    { value: '2nd_place', label: '2. mjesto (finale)' },
    { value: '1st_place', label: '1. mjesto (pobjednik) 🏆' }
  ];

  useEffect(() => {
    if (!user?.is_admin) {
      setError('Samo administratori mogu pristupiti ovoj stranici');
      setLoading(false);
      return;
    }
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      const response = await api.get('/tournament-predictions/results');
      if (response.data) {
        setResults(response.data);
        setIsFinalized(response.data.is_finalized);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Jesi li siguran? Ovo će finalizirati turnir i izračunati bodove za sve korisnike. Ova akcija se ne može poništiti!')) {
      return;
    }

    setError('');
    setMessage('');
    setFinalizing(true);

    try {
      await api.post('/tournament-predictions/finalize-results', results);
      setMessage('✓ Turnir finaliziran! Bodovi izračunati za sve korisnike.');
      setIsFinalized(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri finalizaciji');
    } finally {
      setFinalizing(false);
    }
  };

  const handleChange = (field, value) => {
    setResults(prev => ({ ...prev, [field]: value }));
  };

  if (!user?.is_admin) {
    return (
      <div className="admin-error">
        <h2>⛔ Pristup odbijen</h2>
        <p>Samo administratori mogu pristupiti ovoj stranici.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="tournament-admin-container">
      <div className="tournament-admin-card">
        <h1>🏆 Admin: Finalizacija Turnira</h1>
        
        {isFinalized && (
          <div className="finalized-banner">
            ✓ Turnir je već finaliziran! Bodovi su izračunati.
          </div>
        )}

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* MVP */}
          <div className="form-section">
            <h3>🌟 MVP Turnira</h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={results.actual_mvp}
              onChange={(e) => handleChange('actual_mvp', e.target.value)}
              required
              disabled={isFinalized}
            />
          </div>

          {/* Top Scorer */}
          <div className="form-section">
            <h3>⚽ Top strijelac turnira</h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={results.actual_top_scorer}
              onChange={(e) => handleChange('actual_top_scorer', e.target.value)}
              required
              disabled={isFinalized}
            />
          </div>

          {/* Croatia Top Scorer */}
          <div className="form-section">
            <h3>🇭🇷 Top strijelac Hrvatske</h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={results.actual_croatia_top_scorer}
              onChange={(e) => handleChange('actual_croatia_top_scorer', e.target.value)}
              required
              disabled={isFinalized}
            />
          </div>

          {/* Croatia Placement */}
          <div className="form-section">
            <h3>🇭🇷 Plasman Hrvatske</h3>
            <select
              value={results.actual_croatia_placement}
              onChange={(e) => handleChange('actual_croatia_placement', e.target.value)}
              required
              disabled={isFinalized}
            >
              <option value="">-- Odaberi plasman --</option>
              {croatiaPlacementOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Top 3 Teams */}
          <div className="form-section">
            <h3>🥇🥈🥉 Top 3 ekipe</h3>

            <div className="top-three-grid">
              <div>
                <label>🥇 1. mjesto</label>
                <select
                  value={results.actual_1st_place}
                  onChange={(e) => handleChange('actual_1st_place', e.target.value)}
                  required
                  disabled={isFinalized}
                >
                  <option value="">-- Odaberi ekipu --</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>🥈 2. mjesto</label>
                <select
                  value={results.actual_2nd_place}
                  onChange={(e) => handleChange('actual_2nd_place', e.target.value)}
                  required
                  disabled={isFinalized}
                >
                  <option value="">-- Odaberi ekipu --</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>🥉 3. mjesto</label>
                <select
                  value={results.actual_3rd_place}
                  onChange={(e) => handleChange('actual_3rd_place', e.target.value)}
                  required
                  disabled={isFinalized}
                >
                  <option value="">-- Odaberi ekipu --</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isFinalized && (
            <button type="submit" disabled={finalizing} className="finalize-btn">
              {finalizing ? 'Finaliziranje...' : '🔒 Finaliziraj turnir i izračunaj bodove'}
            </button>
          )}
        </form>

        {!isFinalized && (
          <div className="warning-box">
            <p>⚠️ Pažnja: Nakon finalizacije ne možeš mijenjati rezultate!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TournamentAdmin;
