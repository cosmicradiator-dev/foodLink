import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { moderationItems, handleModerationAction, listings, currentUser } = useFoodLink();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filter, setFilter] = useState('all'); // all | verification | reported

  const pendingCount = moderationItems.filter((m) => m.status === 'pending').length;
  const reportedCount = moderationItems.filter((m) => m.type === 'Reported listing').length;
  const activeListings = listings.filter((l) => l.status === 'available').length;

  const filtered = filter === 'all'
    ? moderationItems
    : filter === 'verification'
    ? moderationItems.filter((m) => m.type.includes('verification'))
    : moderationItems.filter((m) => m.type === 'Reported listing');

  const handleAction = (id, action) => {
    handleModerationAction(id, action);
    const label = action === 'approve' ? 'Approved ✅' : action === 'reject' ? 'Rejected ❌' : 'Removed 🗑️';
    toast.success(`Action taken: ${label}`);
  };

  const typeIcon = (type) => {
    if (type.includes('Donor')) return '🍱';
    if (type.includes('NGO')) return '🏠';
    if (type.includes('Reported')) return '🚨';
    return '📋';
  };

  const typeBadge = (type) => {
    if (type.includes('verification')) {
      return { bg: '#dbeafe', color: '#1d4ed8', label: type };
    }
    return { bg: '#fee2e2', color: '#b91c1c', label: type };
  };

  return (
    <Layout>
      <style>{`
        .mod-row { transition: background-color 0.15s ease; }
        .mod-row:hover { background-color: #f8fafc !important; }
        .action-btn { transition: all 0.15s ease; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card { animation: fadeIn 0.4s ease forwards; }
        .filter-tab { transition: all 0.15s ease; }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* Admin Header Strip */}
        {currentUser && (
          <div
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
              borderRadius: '16px', padding: '1.25rem 1.75rem',
              marginBottom: '1.75rem', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                {currentUser.avatar || '🛡️'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>{currentUser.org} · System Administrator</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[
                { label: 'Pending', value: pendingCount, icon: '⏳' },
                { label: 'Reported', value: reportedCount, icon: '🚨' },
                { label: 'Active Listings', value: activeListings, icon: '📋' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{s.icon} {s.value}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
              🛡️ Admin Moderation
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Review donor/NGO verifications and reported listings.
            </p>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { label: 'Pending', value: pendingCount, bg: '#fef3c7', color: '#b45309' },
              { label: 'Reports', value: reportedCount, bg: '#fee2e2', color: '#b91c1c' },
              { label: 'Active', value: activeListings, bg: '#dcfce7', color: '#15803d' },
            ].map((s) => (
              <div
                key={s.label}
                className="stat-card"
                style={{
                  padding: '0.75rem 1.1rem', backgroundColor: s.bg,
                  borderRadius: '12px', textAlign: 'center',
                  minWidth: '70px',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600, marginTop: '0.1rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {[
            { id: 'all', label: '🗂️ All' },
            { id: 'verification', label: '✅ Verifications' },
            { id: 'reported', label: '🚨 Reported' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="filter-tab"
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                border: `1.5px solid ${filter === tab.id ? '#0f172a' : '#e2e8f0'}`,
                borderRadius: '9999px',
                backgroundColor: filter === tab.id ? '#0f172a' : '#ffffff',
                color: filter === tab.id ? '#ffffff' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Moderation Table Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr',
              padding: '0.85rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span>ITEM</span>
            <span>TYPE</span>
            <span>STATUS</span>
            <span style={{ textAlign: 'right' }}>ACTIONS</span>
          </div>

          {/* Rows */}
          <div>
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Queue is empty!</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>All items have been moderated.</div>
              </div>
            ) : (
              filtered.map((item, idx) => {
                const badge = typeBadge(item.type);
                return (
                  <div
                    key={item.id}
                    className="mod-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr',
                      padding: '1rem 1.5rem',
                      alignItems: 'center',
                      borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {/* Item name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{typeIcon(item.type)}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{item.item}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>ID: {item.id}</div>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div>
                      <span
                        style={{
                          display: 'inline-block', padding: '0.25rem 0.65rem',
                          backgroundColor: badge.bg, color: badge.color,
                          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.78rem', fontWeight: 700,
                          color: item.status === 'pending' ? '#b45309' : '#15803d',
                        }}
                      >
                        <span
                          style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            backgroundColor: item.status === 'pending' ? '#f59e0b' : '#22c55e',
                            display: 'inline-block',
                          }}
                        />
                        {item.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleAction(item.id, 'approve')}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#dcfce7', color: '#15803d',
                          border: '1px solid #86efac', borderRadius: '7px',
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleAction(item.id, 'reject')}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#fef3c7', color: '#b45309',
                          border: '1px solid #fcd34d', borderRadius: '7px',
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        ❌ Reject
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleAction(item.id, 'remove')}
                        style={{
                          padding: '0.4rem 0.7rem',
                          backgroundColor: '#fee2e2', color: '#b91c1c',
                          border: '1px solid #fca5a5', borderRadius: '7px',
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Log (hardcoded) */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem' }}>
            📜 Recent Activity
          </h3>
          <div
            style={{
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {[
              { time: '14:31', action: 'PSG Hostel Mess D verified', type: 'approved', actor: 'Admin Sankar' },
              { time: '13:18', action: 'Listing "200 kg biryani" removed (spam)', type: 'removed', actor: 'Admin Sankar' },
              { time: '12:05', action: 'Hope Shelter NGO approved', type: 'approved', actor: 'Admin Sankar' },
              { time: '11:40', action: 'User report #REP-021 reviewed — No action', type: 'neutral', actor: 'Admin Sankar' },
            ].map((log, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < 3 ? '1px solid #f8fafc' : 'none',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, minWidth: '42px' }}>
                  {log.time}
                </span>
                <span
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor:
                      log.type === 'approved' ? '#22c55e'
                        : log.type === 'removed' ? '#ef4444'
                        : '#94a3b8',
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: '#334155', flex: 1 }}>{log.action}</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>by {log.actor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
