import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    setErrors({});
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-title">Create account</div>
      <div className="form-subtitle">Join PrimeTrade today</div>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input
            className={`form-input ${errors.name ? 'error' : ''}`}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          {errors.name && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.name}</small>}
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
          {errors.email && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.email}</small>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className={`form-input ${errors.password ? 'error' : ''}`}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 chars, upper + lower + number"
            required
          />
          {errors.password && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.password}</small>}
        </div>
        <div className="form-group">
          <label className="form-label">Register as</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', border: `2px solid ${form.role === 'user' ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '8px', cursor: 'pointer', background: form.role === 'user' ? '#eef2ff' : 'var(--bg)',
              transition: 'all 0.15s'
            }}>
              <input type="radio" name="role" value="user" checked={form.role === 'user'} onChange={handleChange} style={{ accentColor: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>User</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Manage own tasks</div>
              </div>
            </label>
            <label style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', border: `2px solid ${form.role === 'admin' ? '#7c3aed' : 'var(--border)'}`,
              borderRadius: '8px', cursor: 'pointer', background: form.role === 'admin' ? '#f5f3ff' : 'var(--bg)',
              transition: 'all 0.15s'
            }}>
              <input type="radio" name="role" value="admin" checked={form.role === 'admin'} onChange={handleChange} style={{ accentColor: '#7c3aed' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Admin</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Full access</div>
              </div>
            </label>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }} disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account...</> : 'Create account'}
        </button>
      </form>

      <div className="form-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
