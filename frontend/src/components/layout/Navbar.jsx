import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFoodLink } from '../../context/FoodLinkContext';

const ROLE_COLORS = {
  donor: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  recipient: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  volunteer: { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
  admin: { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
};

const ROLE_NAVLINKS = {
  donor: [
    { label: '📋 My Listings', to: '/donor/create' },
    { label: '📊 Impact', to: '/dashboard' },
  ],
  recipient: [
    { label: '🗺️ Nearby Food', to: '/recipient/map' },
    { label: '📦 My Claims', to: '/recipient/claims' },
    { label: '📊 Impact', to: '/dashboard' },
  ],
  volunteer: [
    { label: '🚴 Tasks', to: '/volunteer' },
    { label: '📊 Impact', to: '/dashboard' },
  ],
  admin: [
    { label: '🛡️ Moderation', to: '/admin' },
    { label: '📊 Impact', to: '/dashboard' },
  ],
};

export default function Navbar() {
  const { currentUser, logoutUser } = useFoodLink();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pathname = location.pathname;
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const handleLogout = () => {
    logoutUser();
    setShowUserMenu(false);
    navigate('/', { replace: true });
  };

  const navLinks = currentUser ? (ROLE_NAVLINKS[currentUser.role] || []) : [];
  const roleColors = currentUser ? (ROLE_COLORS[currentUser.role] || ROLE_COLORS.donor) : null;

  return (
    <>
      <style>{`
        .nav-link-item { transition: color 0.15s ease; }
        .nav-link-item:hover { color: #166534 !important; }
        .logout-btn:hover { background-color: #fee2e2 !important; color: #b91c1c !important; border-color: #fca5a5 !important; }
        .user-menu-card {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem;
          min-width: 220px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 999;
          animation: dropDown 0.15s ease forwards;
        }
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1150px',
            margin: '0 auto',
            padding: '0.8rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link
            to={currentUser ? (ROLE_NAVLINKS[currentUser.role]?.[0]?.to || '/') : '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.45rem',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              gap: '0.1rem',
            }}
          >
            <span
              style={{
                color: '#166534',
                background: 'linear-gradient(135deg, #166534, #16a34a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Food
            </span>
            <span style={{ color: '#ea580c' }}>Link</span>
            <span style={{ fontSize: '1.1rem', marginLeft: '0.15rem' }}>🍱</span>
          </Link>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {currentUser ? (
              <>
                {/* Role-specific nav links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {navLinks.map((link) => {
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="nav-link-item"
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: active ? '#166534' : '#475569',
                          position: 'relative',
                          padding: '0.4rem 0',
                        }}
                      >
                        {link.label}
                        {active && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '2px',
                              backgroundColor: '#ea580c',
                              borderRadius: '2px',
                            }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* User avatar / dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.4rem 0.75rem 0.4rem 0.4rem',
                      backgroundColor: roleColors?.bg || '#f1f5f9',
                      border: `1px solid ${roleColors?.border || '#e2e8f0'}`,
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {currentUser.avatar}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: roleColors?.color || '#0f172a', lineHeight: 1.2 }}>
                        {currentUser.name.split(' ')[0]}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: roleColors?.color || '#64748b',
                          opacity: 0.8,
                          textTransform: 'capitalize',
                        }}
                      >
                        {currentUser.role}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: roleColors?.color, opacity: 0.6, marginLeft: '0.2rem' }}>
                      {showUserMenu ? '▲' : '▼'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="user-menu-card" onMouseLeave={() => setShowUserMenu(false)}>
                      {/* User info */}
                      <div style={{ marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{currentUser.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{currentUser.org}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.1rem' }}>{currentUser.email}</div>
                      </div>
                      {/* Role badge */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.75rem',
                            backgroundColor: roleColors.bg,
                            color: roleColors.color,
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}
                        >
                          {currentUser.avatar} {currentUser.role}
                        </span>
                      </div>
                      {/* Stats */}
                      {currentUser.role === 'donor' && (
                        <div
                          style={{
                            padding: '0.6rem 0.75rem',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#166534',
                            marginBottom: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          🍱 {currentUser.totalMeals} meals donated · ⭐ Trust: {currentUser.trustScore}/100
                        </div>
                      )}
                      {/* Logout */}
                      <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not logged in: show Login/About links */
              <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link
                  to="/dashboard"
                  style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', color: '#475569' }}
                >
                  📊 Impact
                </Link>
                <Link
                  to="/login"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    borderRadius: '8px',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  🔑 Sign In
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
