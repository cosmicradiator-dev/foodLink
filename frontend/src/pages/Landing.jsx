import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useFoodLink } from '../context/FoodLinkContext';

const DEMO_CREDS = [
  { role: 'donor', email: 'donor@foodlink.com', password: 'donor123', label: '🍱 Donor', color: '#166534', bg: '#dcfce7' },
  { role: 'recipient', email: 'ngo@foodlink.com', password: 'ngo123', label: '🏠 NGO', color: '#1d4ed8', bg: '#dbeafe' },
  { role: 'volunteer', email: 'vol@foodlink.com', password: 'vol123', label: '🚴 Volunteer', color: '#7c3aed', bg: '#ede9fe' },
  { role: 'admin', email: 'admin@foodlink.com', password: 'admin123', label: '🛡️ Admin', color: '#b45309', bg: '#fef3c7' },
];

const ROLE_REDIRECTS = {
  donor: '/donor/create',
  recipient: '/recipient/map',
  volunteer: '/volunteer',
  admin: '/admin',
};

// Floating food emojis for background
const FOOD_EMOJIS = ['🍱', '🥗', '🍛', '🥘', '🍚', '🥙', '🫕', '🍜'];

export default function Landing({ defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [floaters] = useState(() =>
    FOOD_EMOJIS.map((emoji, i) => ({
      emoji,
      x: 5 + (i * 12) % 90,
      y: 10 + (i * 17) % 80,
      duration: 8 + (i * 3) % 7,
      delay: i * 1.2,
    }))
  );

  const { loginUser, currentUser } = useFoodLink();
  const navigate = useNavigate();

  // If already logged in, redirect to their dashboard
  useEffect(() => {
    if (currentUser) {
      navigate(ROLE_REDIRECTS[currentUser.role] || '/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleQuickLogin = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setSelectedRole(cred.role);
    setActiveTab('login');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const user = loginUser(email, password);
        if (!user) {
          setError('Invalid credentials. Use the quick-login chips below to try demo accounts.');
          setLoading(false);
          return;
        }
        navigate(ROLE_REDIRECTS[user.role], { replace: true });
      } else {
        // Register: find matching demo user by role, or default to donor
        const demoUser = DEMO_CREDS.find((c) => c.role === selectedRole) || DEMO_CREDS[0];
        const user = loginUser(demoUser.email, demoUser.password);
        if (user) {
          navigate(ROLE_REDIRECTS[user.role], { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Floating food emoji background - subtle, position absolute */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {floaters.map((f, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: '2.5rem',
              opacity: 0.04,
              pointerEvents: 'none',
              zIndex: 0,
              animation: `floatUp ${f.duration}s ease-in-out ${f.delay}s infinite alternate`,
              userSelect: 'none',
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          from { transform: translateY(0px) rotate(-5deg); }
          to { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-card {
          animation: fadeInUp 0.5s ease forwards;
        }
        .quick-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
        }
        .auth-input:focus {
          border-color: #166534 !important;
          box-shadow: 0 0 0 3px rgba(22,101,52,0.1) !important;
          outline: none !important;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #14532d !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22,101,52,0.3);
        }
        .feature-pill {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .feature-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '3.5rem',
          alignItems: 'center',
          minHeight: 'calc(80vh - 120px)',
          paddingTop: '2rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column: Hero */}
        <div className="landing-card" style={{ animationDelay: '0.1s' }}>
          {/* Trust badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '9999px',
              padding: '0.3rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#166534',
              marginBottom: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>✅</span>
            PSG Tech Campus · Coimbatore · 1,250+ meals saved
          </div>

          <h1
            style={{
              fontSize: '2.85rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            Share surplus food
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              before it spoils.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#64748b',
              marginTop: '1.25rem',
              lineHeight: 1.65,
              maxWidth: '500px',
            }}
          >
            FoodLink connects hostel messes, canteens and event organisers with nearby NGOs,
            shelters and student volunteers — <strong style={{ color: '#334155' }}>free, real-time</strong> and location-aware.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginTop: '2rem',
              maxWidth: '500px',
            }}
          >
            {[
              { icon: '🎯', label: 'Smart ranking' },
              { icon: '🔒', label: 'Claim locking' },
              { icon: '🔢', label: 'Pickup codes' },
              { icon: '⏱️', label: 'Auto-expiry' },
              { icon: '📊', label: 'Impact dashboard' },
            ].map((pill) => (
              <span
                key={pill.label}
                className="feature-pill"
                style={{
                  backgroundColor: '#e6f4ea',
                  color: '#166534',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'default',
                }}
              >
                <span>{pill.icon}</span> {pill.label}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '2.5rem',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            {[
              { value: '1,250', label: 'Meals saved', color: '#166534' },
              { value: '410 kg', label: 'Food diverted', color: '#0284c7' },
              { value: '82%', label: 'Claim rate', color: '#7c3aed' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div
          className="landing-card"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
            padding: '2rem 2.25rem',
            width: '100%',
            maxWidth: '460px',
            margin: '0 auto',
            animationDelay: '0.2s',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.75rem',
              gap: '4px',
            }}
          >
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#0f172a' : '#64748b',
                  boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'login' ? '🔑 Login' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {activeTab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Name / Organisation
                </label>
                <input
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hostel Mess D"
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '0.95rem', color: '#0f172a',
                    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Email
              </label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@foodlink.com"
                required
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                  border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, fontSize: '0.95rem',
                  color: '#0f172a', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
                  backgroundColor: error ? '#fff5f5' : '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Password
              </label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                  border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, fontSize: '0.95rem',
                  color: '#0f172a', transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
                  backgroundColor: error ? '#fff5f5' : '#ffffff',
                }}
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.45rem' }}>
                  I am a…
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'donor', label: '🍱 Donor', desc: 'Share food' },
                    { id: 'recipient', label: '🏠 NGO / Recipient', desc: 'Claim food' },
                    { id: 'volunteer', label: '🚴 Volunteer', desc: 'Deliver food' },
                    { id: 'admin', label: '🛡️ Admin', desc: 'Moderate' },
                  ].map((r) => (
                    <label
                      key={r.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.6rem',
                        border: `2px solid ${selectedRole === r.id ? '#166534' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        backgroundColor: selectedRole === r.id ? '#f0fdf4' : '#ffffff',
                        transition: 'all 0.15s ease',
                        fontSize: '0.82rem',
                        fontWeight: selectedRole === r.id ? 700 : 500,
                        color: selectedRole === r.id ? '#166534' : '#475569',
                        gap: '0.15rem',
                      }}
                    >
                      <input
                        type="radio" name="role" value={r.id}
                        checked={selectedRole === r.id}
                        onChange={() => setSelectedRole(r.id)}
                        style={{ display: 'none' }}
                      />
                      <span>{r.label}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{r.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                padding: '0.6rem 0.85rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#be123c',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.8rem',
                background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
                color: '#ffffff', border: 'none', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                marginTop: '0.25rem', transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? '⏳ Please wait...' : activeTab === 'register' ? '✨ Create Account' : '🔑 Sign In'}
            </button>
          </form>

          {/* Quick login chips */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              Quick demo login
              <span style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {DEMO_CREDS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin(cred)}
                  style={{
                    padding: '0.5rem 0.65rem',
                    backgroundColor: cred.bg,
                    color: cred.color,
                    border: `1px solid ${cred.color}30`,
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.1rem',
                  }}
                >
                  <span>{cred.label}</span>
                  <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '0.72rem' }}>{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
