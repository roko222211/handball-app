import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './TournamentPredictions.css';

function TournamentPredictions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [prediction, setPrediction] = useState({
    predicted_mvp: '',
    predicted_top_scorer: '',
    predicted_croatia_top_scorer: '',
    predicted_croatia_placement: '',
    predicted_1st_place: '',
    predicted_2nd_place: '',
    predicted_3rd_place: ''
  });

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
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      const response = await api.get('/tournament-predictions/my-prediction');
      if (response.data) {
        setPrediction(response.data);
      }
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      await api.post('/tournament-predictions/my-prediction', prediction);
      setMessage('✓ Predviđanje spremljeno uspješno!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri spremanju');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPrediction(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="tournament-predictions-container">
      <div className="tournament-predictions-card">
        <h1>🏆 Predviđanja Turnira</h1>
        <p className="subtitle">
          Predvidi MVP-a, top strijelca, plasman Hrvatske i top 3 ekipe!
        </p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* MVP */}
          <div className="form-section">
            <h3>🌟 MVP Turnira <span className="points">(3 boda)</span></h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={prediction.predicted_mvp}
              onChange={(e) => handleChange('predicted_mvp', e.target.value)}
              required
            />
          </div>

          {/* Top Scorer */}
          <div className="form-section">
            <h3>⚽ Top strijelac turnira <span className="points">(3 boda)</span></h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={prediction.predicted_top_scorer}
              onChange={(e) => handleChange('predicted_top_scorer', e.target.value)}
              required
            />
          </div>

          {/* Croatia Top Scorer */}
          <div className="form-section">
            <h3>🇭🇷 Top strijelac Hrvatske <span className="points">(3 boda)</span></h3>
            <input
              type="text"
              placeholder="Ime i prezime igrača"
              value={prediction.predicted_croatia_top_scorer}
              onChange={(e) => handleChange('predicted_croatia_top_scorer', e.target.value)}
              required
            />
          </div>

          {/* Croatia Placement */}
          <div className="form-section">
            <h3>🇭🇷 Plasman Hrvatske <span className="points">(3 boda)</span></h3>
            <select
              value={prediction.predicted_croatia_placement}
              onChange={(e) => handleChange('predicted_croatia_placement', e.target.value)}
              required
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
            <p className="hint">
              1 bod ako ekipa uđe u top 3, +2 boda ako je na točnom mjestu (3 boda ukupno)
            </p>

            <div className="top-three-grid">
              <div>
                <label>🥇 1. mjesto</label>
                <select
                  value={prediction.predicted_1st_place}
                  onChange={(e) => handleChange('predicted_1st_place', e.target.value)}
                  required
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
                  value={prediction.predicted_2nd_place}
                  onChange={(e) => handleChange('predicted_2nd_place', e.target.value)}
                  required
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
                  value={prediction.predicted_3rd_place}
                  onChange={(e) => handleChange('predicted_3rd_place', e.target.value)}
                  required
                >
                  <option value="">-- Odaberi ekipu --</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Spremanje...' : 'Spremi predviđanje'}
          </button>
        </form>

        {prediction.id && (
          <div className="info-box">
            <p>ℹ️ Možeš mijenjati predviđanja do finalizacije turnira.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TournamentPredictions;
