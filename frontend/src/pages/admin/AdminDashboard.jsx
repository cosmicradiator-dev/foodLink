import React from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { moderationItems, handleModerationAction } = useFoodLink();

  const handleAction = (id, actionName, itemName) => {
    handleModerationAction(id, actionName);
    toast.success(`${actionName === 'approve' ? 'Approved' : 'Action applied to'}: ${itemName}`);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Admin Moderation Card matching Figure 6 */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {/* Header with Admin view pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Admin moderation
            </h1>
            <span
              style={{
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
              }}
            >
              Admin view
            </span>
          </div>

          {/* Table matching Figure 6 */}
          {moderationItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              All moderation items have been reviewed!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 0', fontWeight: 700, width: '45%' }}>ITEM</th>
                    <th style={{ padding: '0.75rem 0', fontWeight: 700, width: '30%' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 0', fontWeight: 700, textAlign: 'left' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationItems.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                        {row.item}
                      </td>
                      <td style={{ padding: '1.25rem 0', fontSize: '0.92rem', color: '#475569' }}>
                        {row.type}
                      </td>
                      <td style={{ padding: '1.25rem 0' }}>
                        {row.type === 'Reported listing' ? (
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'remove', row.item)}
                            style={{
                              padding: '0.45rem 1rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              borderRadius: '9999px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Remove listing
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleAction(row.id, 'approve', row.item)}
                              style={{
                                padding: '0.45rem 1.1rem',
                                backgroundColor: '#166534',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(row.id, 'reject', row.item)}
                              style={{
                                padding: '0.45rem 1.1rem',
                                backgroundColor: '#ffffff',
                                border: '1px solid #dc2626',
                                color: '#dc2626',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
