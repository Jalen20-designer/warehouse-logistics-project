import React, { useState, useEffect } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeClosed = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121417', fontFamily: 'Roboto Condensed, sans-serif', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', top: '-150px', left: '-150px', width: '400px', height: '400px', background: 'rgba(243, 112, 33, 0.15)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '360px', background: '#1E2126', backdropFilter: 'blur(12px)', border: '2px solid #343A40', padding: '1.8rem', borderRadius: '4px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'white', position: 'relative', zIndex: 1 },
  cautionStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'repeating-linear-gradient(45deg, #000, #000 8px, #FFB800 8px, #FFB800 16px)' },
  title: { fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', color: '#F37021', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' },
  subtitle: { color: '#9ca3af', textAlign: 'center', marginBottom: '1.2rem', fontSize: '0.85rem' },
  label: { display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '0.6rem', background: '#121417', border: '2px solid #343A40', borderRadius: '4px', color: 'white', marginBottom: '0.8rem', outline: 'none', transition: 'border-color 0.3s ease, box-shadow 0.3s ease', fontSize: '0.9rem' },
  btn: { width: '100%', padding: '0.75rem', background: '#F37021', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', marginTop: '0.7rem', boxShadow: '0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s', fontSize: '0.85rem' },
  error: { background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.7rem', fontSize: '0.7rem', textAlign: 'center' },
  link: { color: '#F37021', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem' }
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = {
    maxWidth: '200px',
    height: 'auto',
    cursor: 'pointer',
    animation: 'logoBubble 3s ease-in-out infinite'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     const res = await fetch('http://localhost/backend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else setError(data.message);
    } catch (err) {
      console.error("Full Error:", err);
      setError(err.message);
    }
  };

  return (
    <>
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121417' }}>
          <style>{`
            @keyframes logoHeartbeat {
              0%, 100% { transform: scale(1); }
              10% { transform: scale(1.1); }
              20% { transform: scale(1); }
              30% { transform: scale(1.15); }
              40% { transform: scale(1); }
            }
          `}</style>
          <img src={logo} alt="Loading..." style={{ maxWidth: '250px', height: 'auto', animation: 'logoHeartbeat 2s ease-in-out infinite' }} />
        </div>
      ) : (
        <div style={styles.page}>
          <style>{`
            @keyframes logoBubble {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-10px) scale(1.05); }
            }
            .login-input:focus { 
              border-color: #F37021 !important; 
              box-shadow: 0 0 0 3px rgba(243, 112, 33, 0.2) !important;
            }
            .login-btn:hover {
              transform: translateY(2px);
              box-shadow: 0 2px 0 #C85A1A, 0 4px 6px rgba(0,0,0,0.3) !important;
            }
            .login-btn:active {
              transform: translateY(4px);
              box-shadow: 0 0 0 #C85A1A, 0 2px 4px rgba(0,0,0,0.3) !important;
            }
          `}</style>
          <div style={styles.glow}></div>
          <div style={styles.card}>
            <div style={styles.cautionStripe}></div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <img src={logo} alt="Warehouse LMS" style={logoStyle} />
            </Link>
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

              <button type="submit" className="login-btn" style={styles.btn}>Sign In to Dashboard</button>
              
              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                New Manager? <Link to="/register" style={styles.link}>Register Here</Link>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}