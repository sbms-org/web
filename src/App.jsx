import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/authContext';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import './index.css';

function Shell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('sbmsDataSource') === 'demo');

  useEffect(() => {
    const handleDataSource = (event) => setDemoMode(Boolean(event.detail));
    window.addEventListener('sbms-data-source', handleDataSource);
    return () => window.removeEventListener('sbms-data-source', handleDataSource);
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="ServiceBook home">
          <span className="brand-mark">S</span>
          <span>ServiceBook</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">Discover</Link>
          <Link className={location.pathname === '/work' ? 'active' : ''} to="/work">Work feed</Link>
          <Link className={location.pathname === '/bookings' ? 'active' : ''} to="/bookings">Bookings</Link>
        </nav>
        <div className="header-account">
          {user ? (
            <>
              <span className="account-name">{user.fullname || user.name || user.mobile}</span>
              <button className="button button-quiet" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link className="button button-dark" to="/login">Sign in</Link>
          )}
        </div>
      </header>
      {demoMode && <div className="demo-data-notice" role="status">
        Demo data is active. Changes are simulated in memory and are not saved to the live database.
      </div>}
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Marketplace view="discover" />} />
          <Route path="/work" element={<Marketplace view="work" />} />
          <Route path="/bookings" element={<Marketplace view="bookings" />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>ServiceBook connects local talent with people who need their skills.</span>
        <span>Built for nearby services in Ethiopia · ETB</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
