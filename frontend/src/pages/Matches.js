import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatTeamWithFlag } from '../utils/flags';
import './Matches.css';

function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictionForm, setPredictionForm] = useState({
    predicted_home_score: '',
    predicted_away_score: '',
    predicted_top_goalscorer: ''
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchMyPredictions();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Greška:', error);
      setLoading(false);
    }
  };

  const fetchMyPredictions = async () => {
    try {
      const response = await api.get('/predictions/my-predictions');
      const predMap = {};
      response.data.forEach(pred => {
        predMap[pred.match_id] = pred;
      });
      setPredictions(predMap);
    } catch (error) {
      console.error('Greška pri dohvaćanju predviđanja:', error);
    }
  };

  const openPredictionModal = (match) => {
    setSelectedMatch(match);
    
    // Ako već postoji predviđanje, popuni formu
    const existingPrediction = predictions[match.id];
    if (existingPrediction) {
      setPredictionForm({
        predicted_home_score: existingPrediction.predicted_home_score,
        predicted_away_score: existingPrediction.predicted_away_score,
        predicted_top_goalscorer: existingPrediction.predicted_top_goalscorer || ''
      });
    } else {
      setPredictionForm({
        predicted_home_score: '',
        predicted_away_score: '',
        predicted_top_goalscorer: ''
      });
    }
    
    setShowModal(true);
  };

  const closePredictionModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  const handleSubmitPrediction = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/predictions', {
        match_id: selectedMatch.id,
        ...predictionForm
      });
      
      alert('Predviđanje spremljeno! 🎯');
      fetchMyPredictions();
      closePredictionModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Greška pri spremanju predviđanja');
    }
  };

  const canPredict = (match) => {
    return !match.is_finished && new Date(match.match_date) > new Date();
  };

  const groupMatchesByStage = () => {
    const grouped = {};
    matches
      .filter(match => 
        !match.home_team.includes('TBD') && 
        !match.away_team.includes('TBD')
      )
      .forEach(match => {
        if (!grouped[match.stage]) {
          grouped[match.stage] = [];
        }
        grouped[match.stage].push(match);
      });
    return grouped;
  };

  if (loading) {
    return <div className="loading">Učitavanje utakmica...</div>;
  }

  const groupedMatches = groupMatchesByStage();

  return (
    <div className="matches-container">
      <h1>🏐 Sve utakmice</h1>
      
      {Object.keys(groupedMatches).map(stage => (
        <div key={stage} className="stage-section">
          <h2>{stage}</h2>
          
          <div className="matches-list">
            {groupedMatches[stage].map(match => {
              const hasPrediction = predictions[match.id];
              const isPredictable = canPredict(match);
              
              return (
                <div key={match.id} className={`match-card ${match.is_finished ? 'finished' : ''}`}>
                  <div className="match-header">
                    {match.group_name && (
                      <span className="group-badge">Grupa {match.group_name}</span>
                    )}
                    <span className="match-date">
                      {new Date(match.match_date).toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="match-teams">
                    <div className="team home-team">
                      <span className="team-name">{formatTeamWithFlag(match.home_team)}</span>
                      {match.is_finished && (
                        <span className="score">{match.actual_home_score}</span>
                      )}
                    </div>
                    
                    <div className="vs">VS</div>
                    
                    <div className="team away-team">
                      {match.is_finished && (
                        <span className="score">{match.actual_away_score}</span>
                      )}
                      <span className="team-name">{formatTeamWithFlag(match.away_team)}</span>
                    </div>
                  </div>
                  
                  {hasPrediction && (
                    <div className="prediction-display">
                      <p>Tvoje predviđanje: {hasPrediction.predicted_home_score} - {hasPrediction.predicted_away_score}</p>
                      {match.is_finished && (
                        <p className="points-earned">
                          Bodovi: <strong>{hasPrediction.points_earned}</strong>
                        </p>
                      )}
                    </div>
                  )}
                  
                  {isPredictable && (
                    <button 
                      className="predict-btn"
                      onClick={() => openPredictionModal(match)}
                    >
                      {hasPrediction ? '✏️ Uredi predviđanje' : '➕ Predvidi'}
                    </button>
                  )}
                  
                  {match.is_finished && !hasPrediction && (
                    <p className="no-prediction">Nisi predvidio ovu utakmicu</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Modal za unos predviđanja */}
      {showModal && selectedMatch && (
        <div className="modal-overlay" onClick={closePredictionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Predvidi rezultat</h2>
            <h3>{formatTeamWithFlag(selectedMatch.home_team)} vs {formatTeamWithFlag(selectedMatch.away_team)}</h3>
            
            <form onSubmit={handleSubmitPrediction}>
              <div className="prediction-inputs">
                <div className="team-input">
                  <label>{formatTeamWithFlag(selectedMatch.home_team)}</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={predictionForm.predicted_home_score}
                    onChange={(e) => setPredictionForm({
                      ...predictionForm,
                      predicted_home_score: parseInt(e.target.value) || 0
                    })}
                    required
                  />
                </div>
                
                <span className="vs-separator">-</span>
                
                <div className="team-input">
                  <label>{formatTeamWithFlag(selectedMatch.away_team)}</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={predictionForm.predicted_away_score}
                    onChange={(e) => setPredictionForm({
                      ...predictionForm,
                      predicted_away_score: parseInt(e.target.value) || 0
                    })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Top strijelac utakmice (bonus +1 bod):</label>
                <input
                  type="text"
                  placeholder="Puno ime i prezime igrača"
                  value={predictionForm.predicted_top_goalscorer}
                  onChange={(e) => setPredictionForm({
                    ...predictionForm,
                    predicted_top_goalscorer: e.target.value
                  })}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closePredictionModal} className="cancel-btn">
                  Odustani
                </button>
                <button type="submit" className="submit-btn">
                  Spremi predviđanje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
