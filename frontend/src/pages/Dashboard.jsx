import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';
import AdminPanel from './AdminPanel';

const STATUS_COLORS = { pending: 'pill-pending', in_progress: 'pill-in_progress', completed: 'pill-completed', cancelled: 'pill-cancelled' };
const PRIORITY_COLORS = { high: 'pill-high', medium: 'pill-medium', low: 'pill-low' };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit });
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => { fetchTasks(1); }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted.');
      fetchTasks(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingTask(null);
    fetchTasks(pagination.page);
  };

  const stats = {
    total: pagination.total,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-title">Dashboard</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Hello, {user.name}</div>
          </div>
          {isAdmin && (
            <div className="tabs" style={{ margin: 0, border: 'none' }}>
              <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>My Tasks</button>
              <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Admin Panel</button>
            </div>
          )}
        </div>

        {activeTab === 'tasks' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Total Tasks</div><div className="stat-value">{pagination.total}</div></div>
              <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: '#854d0e' }}>{tasks.filter(t => t.status === 'pending').length}</div></div>
              <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{ color: '#1e40af' }}>{tasks.filter(t => t.status === 'in_progress').length}</div></div>
              <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: '#166534' }}>{tasks.filter(t => t.status === 'completed').length}</div></div>
            </div>

            <div className="filters">
              <select className="filter-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="filter-select" value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}>
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setEditingTask(null); setModalOpen(true); }}>
                + New Task
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No tasks found. Create your first task!</div>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-body">
                      <div className="task-title">{task.title}</div>
                      {task.description && <div className="task-desc">{task.description}</div>}
                      <div className="task-meta">
                        <span className={`pill ${STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</span>
                        <span className={`pill ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                        {task.due_date && (
                          <span className="task-due">Due {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                        {isAdmin && task.owner_name && (
                          <span className="task-due" style={{ color: 'var(--primary)' }}>{task.owner_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingTask(task); setModalOpen(true); }}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task.id)}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => fetchTasks(pagination.page - 1)}>Prev</button>
                <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTasks(pagination.page + 1)}>Next</button>
              </div>
            )}
          </>
        )}

        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </>
  );
}
