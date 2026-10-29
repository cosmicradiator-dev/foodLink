import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFoodLink } from '../../context/FoodLinkContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentRole, setCurrentRole } = useFoodLink();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = location.pathname;

  const isActive = (path) => {
    if (path === '/login') {
      return pathname === '/' || pathname === '/login' || pathname === '/register';
    }
    if (path === '/nearby') {
      return pathname === '/nearby' || pathname.startsWith('/recipient');
    }
    if (path === '/donate') {
      return pathname === '/donate' || pathname.startsWith('/donor');
    }
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === path;
  };

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'donor') navigate('/donor/create');
    else if (newRole === 'recipient') navigate('/recipient/map');
    else if (newRole === 'volunteer') navigate('/volunteer');
    else if (newRole === 'admin') navigate('/admin');
  };

  const navLinks = [
    { label: 'Login', to: '/login' },
    { label: 'Nearby', to: '/recipient/map' },
    { label: 'Donate', to: '/donor/create' },
    { label: 'Dashboard', to: '/dashboard' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: '1150px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo matching screenshots: Food (green) Link (orange) */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.4rem',
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#166534' }}>Food</span>
          <span style={{ color: '#ea580c', marginLeft: '0.25rem' }}>Link</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: active ? '#166534' : '#475569',
                    position: 'relative',
                    padding: '0.4rem 0',
                    transition: 'color 0.15s ease',
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

          {/* Quick Role Switcher Pill for Testing / Demonstration */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '9999px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {[
              { id: 'donor', label: 'Donor' },
              { id: 'recipient', label: 'Recipient' },
              { id: 'volunteer', label: 'Volunteer' },
              { id: 'admin', label: 'Admin' },
            ].map((roleItem) => {
              const isSelected = currentRole === roleItem.id;
              return (
                <button
                  key={roleItem.id}
                  type="button"
                  onClick={() => handleRoleSwitch(roleItem.id)}
                  style={{
                    border: 'none',
                    background: isSelected ? '#166534' : 'transparent',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {roleItem.label}
                </button>
              );
            })}
          </div>

          {/* User Status / Logout if authenticated */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                {user.name}
              </span>
              <button
                onClick={logout}
                style={{
                  border: '1px solid #cbd5e1',
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
