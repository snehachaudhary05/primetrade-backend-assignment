import React, { useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const INITIAL = { title: '', description: '', status: 'pending', priority: 'medium', due_date: '' };

export default function TaskModal({ task, onSave, onClose }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(
    task
      ? { title: task.title, description: task.description || '', status: task.status, priority: task.priority, due_date: task.due_date ? task.due_date.split('T')[0] : '' }
      : INITIAL
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, due_date: form.due_date || null, description: form.description || null };
      if (isEdit) {
        await api.patch(`/tasks/${task.id}`, body);
        toast.success('Task updated.');
      } else {
        await api.post('/tasks', body);
        toast.success('Task created.');
      }
      onSave();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.25rem 0.5rem', fontSize: '1.1rem' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className={`form-input ${errors.title ? 'error' : ''}`} name="title" value={form.title} onChange={handleChange} placeholder="Task title" required />
            {errors.title && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.title}</small>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Optional description" style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" name="due_date" value={form.due_date} onChange={handleChange} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (isEdit ? 'Save changes' : 'Create task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
