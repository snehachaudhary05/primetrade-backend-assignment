import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/users?page=${page}&limit=10`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated.');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`, {});
      toast.success(res.message);
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>Loading admin data...</div>;

  return (
    <div>
      {stats && (
        <>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform Stats</div>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{stats.users.total}</div></div>
            <div className="stat-card"><div className="stat-label">Admins</div><div className="stat-value" style={{ color: '#7c3aed' }}>{stats.users.admins}</div></div>
            <div className="stat-card"><div className="stat-label">Total Tasks</div><div className="stat-value">{stats.tasks.total}</div></div>
            <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: '#166534' }}>{stats.tasks.completed}</div></div>
          </div>
        </>
      )}

      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>User Management</div>
      <div className="table-wrap" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                <td>
                  {u.id === currentUser.id ? (
                    <span className={`pill ${u.role === 'admin' ? 'pill-in_progress' : 'pill-pending'}`}>{u.role}</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ border: '1px solid var(--border)', borderRadius: '5px', padding: '2px 6px', fontSize: '0.8rem', background: 'var(--bg)' }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
                <td>
                  <span className="status-dot" style={{ background: u.is_active ? 'var(--success)' : 'var(--muted)' }} />
                  {u.is_active ? 'Active' : 'Inactive'}
                </td>
                <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.id !== currentUser.id && (
                    <button
                      className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>Prev</button>
          <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
