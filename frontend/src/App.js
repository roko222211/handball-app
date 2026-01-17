import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Notifications from './components/Notifications';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Leaderboard from './pages/Leaderboard';
import Predictions from './pages/Predictions';
import Admin from './pages/Admin';
import TournamentPredictions from './pages/TournamentPredictions/TournamentPredictions';
import TournamentAdmin from './pages/Admin/TournamentAdmin';
import './App.css';


// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}


function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <Notifications />}
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="/predictions" element={
          <ProtectedRoute>
            <Predictions />
          </ProtectedRoute>
        } />
        <Route path="/tournament-predictions" element={
          <ProtectedRoute>
            <TournamentPredictions />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/tournament" element={
          <ProtectedRoute>
            <TournamentAdmin />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}


export default App;
