import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeClosed = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', top: '-150px', left: '-150px', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.15)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '400px', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'white', position: 'relative', zIndex: 1 },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', background: 'linear-gradient(to right, #3b82f6, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white', marginBottom: '1.25rem', outline: 'none', transition: 'border-color 0.3s ease' },
  btn: { width: '100%', padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)' },
  error: { background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' },
  link: { color: '#60a5fa', textDecoration: 'none', fontWeight: '500' }
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else setError(data.message);
    } catch (err) { setError('Login connection failed.'); }
  };

  return (
    <div style={styles.page}>
      <style>{`.login-input:focus { border-color: #3b82f6 !important; }`}</style>
      <div style={styles.glow}></div>
      <div style={styles.card}>
        <div style={styles.title}>Warehouse LMS</div>
        <div style={styles.subtitle}>Secure Portal Login</div>

        <form onSubmit={handleSubmit} autoComplete="off" spellCheck={false}>
          {error && <div style={styles.error}>{error}</div>}
          
          <label style={styles.label}>Email Address</label>
          <input className="login-input" style={styles.input} type="email" autoComplete="username" name="login-email" onChange={(e) => setForm({...form, email: e.target.value})} required />

          <label style={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              className="login-input"
              style={styles.input} 
              type={showPassword ? "text" : "password"} 
              autoComplete="current-password" 
              name="login-password"
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              {/* LOGIC: Show Open Eye if Password is visible, Closed Eye if hidden */}
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>

          <button type="submit" style={styles.btn}>Sign In to Dashboard</button>
          
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            New Manager? <Link to="/register" style={styles.link}>Register Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}