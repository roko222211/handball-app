import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏐 Handball Euro 2026
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Početna</Link>
          <Link to="/matches" className="navbar-link">Utakmice</Link>
          <Link to="/predictions" className="navbar-link">Moja predviđanja</Link>
          <Link to="/leaderboard" className="navbar-link">Ljestvica</Link>
          {user?.is_admin && (
            <Link to="/admin" className="navbar-link admin-link">Admin</Link>
          )}
          
          <div className="navbar-user">
            <span className="user-name">{user?.username}</span>
            <span className="user-points">{user?.total_points} bodova</span>
            <button onClick={handleLogout} className="logout-btn">
              Odjava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
