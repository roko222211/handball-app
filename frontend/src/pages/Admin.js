import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatTeamWithFlag } from '../utils/flags';
import './Admin.css';

function Admin() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // matches, users, tbd
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [resultForm, setResultForm] = useState({
    actual_home_score: '',
    actual_away_score: '',
    top_goalscorer: ''
  });
  const [teamsForm, setTeamsForm] = useState({
    home_team: '',
    away_team: ''
  });
  const [modalType, setModalType] = useState(null); // 'result' or 'teams'

  useEffect(() => {
    if (!user.is_admin) {
      window.location.href = '/';
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [matchesRes, usersRes] = await Promise.all([
        api.get('/admin/matches'),
        api.get('/admin/users')
      ]);
      setMatches(matchesRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Greška:', error);
      setLoading(false);
    }
  };

  const openResultModal = (match) => {
    setSelectedMatch(match);
    setResultForm({
      actual_home_score: match.actual_home_score || '',
      actual_away_score: match.actual_away_score || '',
      top_goalscorer: match.top_goalscorer || ''
    });
    setModalType('result');
  };

  const openTeamsModal = (match) => {
    setSelectedMatch(match);
    setTeamsForm({
      home_team: match.home_team || '',
      away_team: match.away_team || ''
    });
    setModalType('teams');
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setModalType(null);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/match-stats/update-match', {
        match_id: selectedMatch.id,
        actual_home_score: parseInt(resultForm.actual_home_score),
        actual_away_score: parseInt(resultForm.actual_away_score),
        top_goalscorer: resultForm.top_goalscorer
      });
      
      alert('Rezultat ažuriran i bodovi izračunati! 🎉');
      fetchData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Greška pri ažuriranju rezultata');
    }
  };

  const handleSubmitTeams = async (e) => {
    e.preventDefault();
    
    try {
      await api.patch(`/admin/matches/${selectedMatch.id}/teams`, {
        home_team: teamsForm.home_team,
        away_team: teamsForm.away_team
      });
      
      alert('Timovi ažurirani! ✅');
      fetchData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Greška pri ažuriranju timova');
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    if (!window.confirm(`Sigurno želiš ${currentStatus ? 'ukloniti' : 'dodijeliti'} admin ovlasti?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/admin`, {
        is_admin: !currentStatus
      });
      alert('Admin status ažuriran!');
      fetchData();
    } catch (error) {
      alert('Greška pri ažuriranju statusa');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Sigurno želiš obrisati ovu utakmicu?')) {
      return;
    }

    try {
      await api.delete(`/admin/matches/${matchId}`);
      alert('Utakmica obrisana!');
      fetchData();
    } catch (error) {
      alert('Greška pri brisanju utakmice');
    }
  };

  if (!user.is_admin) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h1>⛔ Pristup odbijen</h1>
          <p>Nemaš admin ovlasti</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  const tbdMatches = matches.filter(m => 
    m.home_team.includes('TBD') || m.away_team.includes('TBD')
  );

  const normalMatches = matches.filter(m => 
    !m.home_team.includes('TBD') && !m.away_team.includes('TBD')
  );

  return (
    <div className="admin-container">
      <h1>🔧 Admin Panel</h1>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          ⚽ Utakmice ({normalMatches.length})
        </button>
        <button
          className={activeTab === 'tbd' ? 'active' : ''}
          onClick={() => setActiveTab('tbd')}
        >
          🔄 TBD Utakmice ({tbdMatches.length})
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Korisnici ({users.length})
        </button>
      </div>

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="admin-section">
          <div className="matches-grid">
            {normalMatches.map(match => (
              <div key={match.id} className={`admin-match-card ${match.is_finished ? 'finished' : ''}`}>
                <div className="match-header">
                  <span className="match-stage">{match.stage}</span>
                  {match.group_name && (
                    <span className="match-group">Grupa {match.group_name}</span>
                  )}
                  {match.is_finished && (
                    <span className="finished-badge">✅ Završeno</span>
                  )}
                </div>

                <div className="match-teams">
                  <div className="team">
                    <span className="team-name">{formatTeamWithFlag(match.home_team)}</span>
                    {match.is_finished && (
                      <span className="score">{match.actual_home_score}</span>
                    )}
                  </div>
                  <span className="vs">VS</span>
                  <div className="team">
                    <span className="team-name">{formatTeamWithFlag(match.away_team)}</span>
                    {match.is_finished && (
                      <span className="score">{match.actual_away_score}</span>
                    )}
                  </div>
                </div>

                <div className="match-date">
                  {new Date(match.match_date).toLocaleDateString('hr-HR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="match-actions">
                  <button
                    className="btn-result"
                    onClick={() => openResultModal(match)}
                  >
                    {match.is_finished ? '✏️ Uredi rezultat' : '➕ Unesi rezultat'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteMatch(match.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TBD Matches Tab */}
      {activeTab === 'tbd' && (
        <div className="admin-section">
          <div className="tbd-info">
            <p>⚠️ Ove utakmice čekaju da se poznaju timovi nakon preliminarnih rundi.</p>
          </div>
          <div className="matches-grid">
            {tbdMatches.map(match => (
              <div key={match.id} className="admin-match-card tbd-card">
                <div className="match-header">
                  <span className="match-stage">{match.stage}</span>
                  {match.group_name && (
                    <span className="match-group">Grupa {match.group_name}</span>
                  )}
                </div>

                <div className="match-teams">
                  <div className="team">
                    <span className="team-name tbd">{match.home_team}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="team">
                    <span className="team-name tbd">{match.away_team}</span>
                  </div>
                </div>

                <div className="match-date">
                  {new Date(match.match_date).toLocaleDateString('hr-HR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="match-actions">
                  <button
                    className="btn-update-teams"
                    onClick={() => openTeamsModal(match)}
                  >
                    ✏️ Postavi timove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="users-table">
            <div className="table-header">
              <div>Korisnik</div>
              <div>Email</div>
              <div>Bodovi</div>
              <div>Admin</div>
              <div>Akcije</div>
            </div>
            {users.map(u => (
              <div key={u.id} className="table-row">
                <div className="user-username">
                  {u.username}
                  {u.id === user.id && <span className="you-badge">TI</span>}
                </div>
                <div className="user-email">{u.email}</div>
                <div className="user-points">{u.total_points}</div>
                <div className="user-admin">
                  {u.is_admin ? '✅ Da' : '❌ Ne'}
                </div>
                <div className="user-actions">
                  {u.id !== user.id && (
                    <button
                      className={u.is_admin ? 'btn-revoke' : 'btn-grant'}
                      onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                    >
                      {u.is_admin ? 'Ukloni admin' : 'Dodaj admin'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal za unos rezultata */}
      {modalType === 'result' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Unesi rezultat</h2>
            <h3>{formatTeamWithFlag(selectedMatch.home_team)} vs {formatTeamWithFlag(selectedMatch.away_team)}</h3>

            <form onSubmit={handleSubmitResult}>
              <div className="result-inputs">
                <div className="team-input">
                  <label>{formatTeamWithFlag(selectedMatch.home_team)}</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={resultForm.actual_home_score}
                    onChange={(e) => setResultForm({
                      ...resultForm,
                      actual_home_score: e.target.value
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
                    value={resultForm.actual_away_score}
                    onChange={(e) => setResultForm({
                      ...resultForm,
                      actual_away_score: e.target.value
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Top strijelac utakmice:</label>
                <input
                  type="text"
                  placeholder="Ime i prezime"
                  value={resultForm.top_goalscorer}
                  onChange={(e) => setResultForm({
                    ...resultForm,
                    top_goalscorer: e.target.value
                  })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Odustani
                </button>
                <button type="submit" className="submit-btn">
                  Spremi i izračunaj bodove
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal za postavljanje timova */}
      {modalType === 'teams' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Postavi timove</h2>
            <h3>{selectedMatch.stage} - {new Date(selectedMatch.match_date).toLocaleDateString('hr-HR')}</h3>

            <form onSubmit={handleSubmitTeams}>
              <div className="form-group">
                <label>Domaćin:</label>
                <input
                  type="text"
                  placeholder="Npr. Hrvatska"
                  value={teamsForm.home_team}
                  onChange={(e) => setTeamsForm({
                    ...teamsForm,
                    home_team: e.target.value
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gost:</label>
                <input
                  type="text"
                  placeholder="Npr. Njemačka"
                  value={teamsForm.away_team}
                  onChange={(e) => setTeamsForm({
                    ...teamsForm,
                    away_team: e.target.value
                  })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Odustani
                </button>
                <button type="submit" className="submit-btn">
                  Spremi timove
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
