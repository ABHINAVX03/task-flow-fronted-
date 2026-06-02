import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters required';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must include upper, lower & number';
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data) setErrors(data.data);
      else setApiError(data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">TASK<span>/</span>FLOW</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Get started for free</p>

        {apiError && <div className="alert alert-error">⚠ {apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" name="name"
              placeholder="Abhinav Sharma"
              value={form.name} onChange={handleChange}
            />
            {errors.name && <small style={{ color: 'var(--danger)', fontSize: '.75rem' }}>{errors.name}</small>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
            />
            {errors.email && <small style={{ color: 'var(--danger)', fontSize: '.75rem' }}>{errors.email}</small>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password"
              placeholder="Min 8 chars, A-Z, a-z, 0-9"
              value={form.password} onChange={handleChange}
            />
            {errors.password && <small style={{ color: 'var(--danger)', fontSize: '.75rem' }}>{errors.password}</small>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="loader" /> Creating account…</> : 'Create Account →'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
