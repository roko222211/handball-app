import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Notifications.css';

function Notifications() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkUpcomingMatches();
    // Provjeravaj svakih 5 minuta
    const interval = setInterval(checkUpcomingMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkUpcomingMatches = async () => {
  try {
    const response = await api.get('/matches');
    const now = new Date();
    
    // Utakmice koje počinju u sljedećih 24 sata (samo poznati timovi)
    const upcoming = response.data.filter(match => {
      if (match.is_finished) return false;
      if (match.home_team.includes('TBD') || match.away_team.includes('TBD')) return false;  // ← DODAJ
      
      const matchDate = new Date(match.match_date);
      const hoursUntilMatch = (matchDate - now) / (1000 * 60 * 60);
      
      return hoursUntilMatch > 0 && hoursUntilMatch <= 24;
    });

    setUpcomingMatches(upcoming);
    
    if (upcoming.length > 0) {
      setShowBanner(true);
    }
  } catch (error) {
    console.error('Greška pri provjeri utakmica:', error);
  }
};


  const closeBanner = () => {
    setShowBanner(false);
  };

  const getTimeUntilMatch = (matchDate) => {
    const now = new Date();
    const match = new Date(matchDate);
    const diff = match - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return `Za ${minutes} minuta`;
    } else if (hours < 24) {
      return `Za ${hours}h ${minutes}min`;
    }
    return '';
  };

  if (!showBanner || upcomingMatches.length === 0) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-content">
        <span className="notification-icon">⏰</span>
        <div className="notification-text">
          <strong>Nadolazeće utakmice!</strong>
          {upcomingMatches.slice(0, 3).map((match, index) => (
            <div key={match.id} className="match-notification">
              {match.home_team} vs {match.away_team} - {getTimeUntilMatch(match.match_date)}
            </div>
          ))}
          {upcomingMatches.length > 3 && (
            <span className="more-matches">+{upcomingMatches.length - 3} više</span>
          )}
        </div>
        <Link to="/matches" className="notification-btn">
          Unesi predviđanja
        </Link>
        <button className="close-btn" onClick={closeBanner}>✕</button>
      </div>
    </div>
  );
}

export default Notifications;
