import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useFoodLink } from '../context/FoodLinkContext';

export default function Landing({ defaultTab = 'register' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [name, setName] = useState('Hostel Mess');
  const [email, setEmail] = useState('you@college.edu');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { setCurrentRole } = useFoodLink();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Update demo role in context
    setCurrentRole(selectedRole);

    try {
      if (activeTab === 'register') {
        if (register) {
          try {
            await register({
              name: name || 'Demo User',
              email: email || 'demo@college.edu',
              password: password || 'Password123!',
              role: selectedRole,
            });
          } catch (_) {
            // gracefully fallback to demo role navigation
          }
        }
      } else {
        if (login) {
          try {
            await login(email, password);
          } catch (_) {
            // gracefully fallback to demo role navigation
          }
        }
      }
    } finally {
      setLoading(false);
      // Navigate to destination role dashboard
      if (selectedRole === 'donor') navigate('/donor/create');
      else if (selectedRole === 'recipient') navigate('/recipient/map');
      else if (selectedRole === 'volunteer') navigate('/volunteer');
      else if (selectedRole === 'admin') navigate('/admin');
    }
  };

  return (
    <Layout>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '3.5rem',
          alignItems: 'center',
          minHeight: 'calc(80vh - 120px)',
          paddingTop: '2rem',
        }}
      >
        {/* Left Column: Hero & Feature Badges matching Figure 1 */}
        <div>
          <h1
            style={{
              fontSize: '2.85rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
            }}
          >
            Share surplus food before it spoils.
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#64748b',
              marginTop: '1.25rem',
              lineHeight: 1.6,
              maxWidth: '520px',
            }}
          >
            Food Link connects hostel messes, canteens and event organisers with nearby NGOs,
            shelters and student volunteers — free, real-time and location-aware.
          </p>

          {/* Badges from Figure 1 */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginTop: '2rem',
              maxWidth: '500px',
            }}
          >
            {['Smart ranking', 'Claim locking', 'Pickup codes', 'Auto-expiry', 'Impact dashboard'].map(
              (pill) => (
                <span
                  key={pill}
                  style={{
                    backgroundColor: '#e6f4ea',
                    color: '#166534',
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  {pill}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right Column: Auth Card matching Figure 1 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem 2.25rem',
            width: '100%',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          {/* Tabs: Register | Login */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === 'register' ? '#0f172a' : '#94a3b8',
                borderBottom: activeTab === 'register' ? '2px solid #ea580c' : 'none',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                border: 'none',
                background: 'transparent',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === 'login' ? '#0f172a' : '#94a3b8',
                borderBottom: activeTab === 'login' ? '2px solid #ea580c' : 'none',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeTab === 'register' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    marginBottom: '0.4rem',
                  }}
                >
                  Name / Organisation
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hostel Mess"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                />
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '0.4rem',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '0.4rem',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '0.5rem',
                }}
              >
                Role
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  fontSize: '0.88rem',
                  color: '#334155',
                }}
              >
                {[
                  { id: 'donor', label: 'Donor' },
                  { id: 'recipient', label: 'Recipient / NGO' },
                  { id: 'volunteer', label: 'Volunteer' },
                  { id: 'admin', label: 'Admin' },
                ].map((r) => (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={selectedRole === r.id}
                      onChange={() => setSelectedRole(r.id)}
                      style={{ accentColor: '#166534' }}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1e6b37',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '0.5rem',
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? 'Please wait...' : activeTab === 'register' ? 'Register' : 'Login'}
            </button>

            <p
              style={{
                fontSize: '0.8rem',
                color: '#64748b',
                marginTop: '0.25rem',
                lineHeight: 1.4,
              }}
            >
              Demo only – no real account is created. Your role decides which screen opens.
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
