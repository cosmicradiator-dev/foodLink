import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function VolunteerDashboard() {
  const { volunteerTasks, acceptVolunteerTask, currentUser } = useFoodLink();
  const [completedCount] = useState(7); // hardcoded demo: 7 past deliveries
  const [kmCovered] = useState(18.4);

  const openTasks = volunteerTasks.filter((t) => t.status === 'open');
  const assignedTasks = volunteerTasks.filter((t) => t.status === 'assigned');

  const handleAccept = (taskId) => {
    acceptVolunteerTask(taskId);
    toast.success('Task accepted! 🚴 Pickup and drop contact details are now unlocked.');
  };

  return (
    <Layout>
      <style>{`
        .task-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .task-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
        .accept-btn:hover { background: linear-gradient(135deg, #14532d, #15803d) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,101,52,0.3); }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .task-animate { animation: slideIn 0.3s ease forwards; }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* Volunteer Profile Strip */}
        {currentUser && (
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
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
                {currentUser.avatar || '🚴'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>{currentUser.org}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { label: 'Deliveries completed', value: completedCount, icon: '📦' },
                { label: 'Km covered', value: `${kmCovered} km`, icon: '📍' },
                { label: 'Trust Score', value: `${currentUser.trustScore}/100`, icon: '⭐' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{s.icon} {s.value}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          🚴 Volunteer Tasks
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Accept surplus food delivery tasks from mess canteens to recipient shelters across campus.
        </p>

        {/* Active Deliveries */}
        {assignedTasks.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🟢 My Active Deliveries
              <span style={{ fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                {assignedTasks.length}
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {assignedTasks.map((task, i) => (
                <div
                  key={task.id}
                  className="task-card task-animate"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #86efac',
                    borderLeft: '4px solid #16a34a',
                    borderRadius: '12px', padding: '1.25rem 1.5rem',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.08)',
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 10px', borderRadius: '9999px' }}>
                          🟢 In Transit
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>· {task.distance}</span>
                      </div>
                      {/* Route display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        <span>📍 {task.pickup}</span>
                        <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>→</span>
                        <span>🏠 {task.drop}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>
                        🍱 {task.servings} meals · 📞 +91 98765 43210
                      </div>
                    </div>
                    <span style={{ fontSize: '2.5rem' }}>🚴</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Tasks */}
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            📬 Open Delivery Tasks
            {openTasks.length > 0 && (
              <span style={{ fontSize: '0.78rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                {openTasks.length} available
              </span>
            )}
          </h2>

          {openTasks.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: '16px', padding: '3rem', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>All caught up!</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                No pending delivery tasks. Check back when recipients request volunteer pickups.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {openTasks.map((task, i) => (
                <div
                  key={task.id}
                  className="task-card task-animate"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px', padding: '1.25rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    flexWrap: 'wrap', gap: '1rem',
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {/* Route display with emoji pins */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                      <span>📍 {task.pickup}</span>
                      <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>→</span>
                      <span>🏠 {task.drop}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                      <span>🍱 {task.servings} meals</span>
                      <span>📏 {task.distance}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="accept-btn"
                    onClick={() => handleAccept(task.id)}
                    style={{
                      padding: '0.6rem 1.4rem',
                      background: 'linear-gradient(135deg, #166534, #16a34a)',
                      color: '#ffffff', border: 'none', borderRadius: '9px',
                      fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                    }}
                  >
                    ✅ Accept Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
