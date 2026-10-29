import React from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function VolunteerDashboard() {
  const { volunteerTasks, acceptVolunteerTask } = useFoodLink();

  const openTasks = volunteerTasks.filter((t) => t.status === 'open');
  const assignedTasks = volunteerTasks.filter((t) => t.status === 'assigned');

  const handleAccept = (taskId) => {
    acceptVolunteerTask(taskId);
    toast.success('Task accepted! Pickup and drop contact details are now unlocked.');
  };

  return (
    <Layout>
      <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Volunteer Tasks
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Accept surplus food delivery tasks from mess canteens to recipient shelters across campus.
        </p>

        {/* Active Deliveries */}
        {assignedTasks.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              My Active Deliveries
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #16a34a',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>
                        In Transit
                      </span>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '0.5rem', color: '#0f172a' }}>
                        Pickup: {task.pickup} → Drop: {task.drop} ({task.distance})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Servings: {task.servings} meals · Contact: +91 98765 43210
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>🚴</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Delivery Tasks (Figure 5) */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Open Delivery Tasks
          </h2>

          {openTasks.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '2.5rem',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              No pending delivery tasks requested right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {openTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                      Pickup: {task.pickup} , Drop: {task.drop} ({task.distance})
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Quantity: {task.servings} meals
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAccept(task.id)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Accept
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
