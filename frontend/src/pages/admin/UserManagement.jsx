import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/users');
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await axiosClient.patch(`/admin/users/${userId}/verify`);
      toast.success('User verified successfully!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to verify user.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this account?')) return;
    try {
      await axiosClient.patch(`/admin/users/${userId}/deactivate`);
      toast.success('User account suspended.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user.');
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Management & Entity Verification</h1>
        <p style={{ color: '#64748b' }}>Approve donors and NGOs, monitor trust scores, and suspend abusive users</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>Name / Org</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Trust Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <strong>{u.name}</strong>
                    {u.organisation_name && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.organisation_name}</div>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>⭐ {u.trust_score}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.verified ? 'badge--primary' : 'badge--warning'}`}>
                      {u.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                    {!u.verified && (
                      <Button variant="primary" size="sm" onClick={() => handleVerify(u._id)}>
                        Verify
                      </Button>
                    )}
                    {u.role !== 'admin' && (
                      <Button variant="outline" size="sm" onClick={() => handleDeactivate(u._id)}>
                        Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
