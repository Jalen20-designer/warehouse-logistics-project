import React, { useState, useEffect } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

// --- VALIDATION LOGIC ---
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least 1 number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least 1 symbol (@, #, !, etc.)');
  return errors;
}

// Icons
const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]); 
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); 
    setApiError('');

    // 1. Password Validation
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return; 
    }

    // 2. REST API Call
    try {
      const res = await fetch('http://localhost/backend/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) // Clean: No more 'action'
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setApiError(data.message || 'Registration failed');
      }
    } catch (err) { 
      console.error("API Error:", err);
      setApiError('Server connection failed. Check if XAMPP is running.'); 
    }
  };

  return (
    <>
      {loading ? (
        <div style={styles.loaderPage}>
          <style>{`@keyframes logoHeartbeat { 0%, 100% { transform: scale(1); } 10% { transform: scale(1.1); } 20% { transform: scale(1); } 30% { transform: scale(1.15); } 40% { transform: scale(1); } }`}</style>
          <img src={logo} alt="Loading..." style={{ maxWidth: '250px', height: 'auto', animation: 'logoHeartbeat 2s ease-in-out infinite' }} />
        </div>
      ) : (
        <div style={styles.page}>
          <style>{`
            @keyframes logoBubble { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }
            .register-input:focus { border-color: #F37021 !important; box-shadow: 0 0 0 3px rgba(243, 112, 33, 0.2) !important; }
            .register-btn:hover { transform: translateY(2px); box-shadow: 0 2px 0 #C85A1A, 0 4px 6px rgba(0,0,0,0.3) !important; }
          `}</style>
          <div style={styles.glow}></div>
          <div style={styles.card}>
            <div style={styles.cautionStripe}></div>
            <Link to="/" style={styles.logoContainer}>
              <img src={logo} alt="Warehouse LMS" style={styles.logo} />
            </Link>
            <div style={styles.subtitle}>Create your manager account</div>

            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={styles.successBox}>Registration Successful!</div>
                <p style={{color: '#9ca3af'}}>Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                {apiError && <div style={styles.errorBox}>{apiError}</div>}

                {errors.length > 0 && (
                  <div style={styles.errorBox}>
                    <strong>Security Requirements:</strong>
                    <ul style={{ marginTop: '5px', paddingLeft: '1.2rem', textAlign: 'left' }}>
                      {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                
                <label style={styles.label}>Username</label>
                <input className="register-input" style={styles.input} type="text" onChange={(e) => setForm({...form, username: e.target.value})} required />

                <label style={styles.label}>Email Address</label>
                <input className="register-input" style={styles.input} type="email" onChange={(e) => setForm({...form, email: e.target.value})} required />

                <label style={styles.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    className="register-input"
                    style={styles.input} 
                    type={showPassword ? "text" : "password"} 
                    onChange={(e) => setForm({...form, password: e.target.value})} 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>

                <button type="submit" className="register-btn" style={styles.btn}>Register Manager</button>
                <p style={styles.footerText}>
                  Already a manager? <Link to="/login" style={{ color: '#F37021', textDecoration: 'none' }}>Login</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  loaderPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121417' },
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121417', fontFamily: 'Roboto, sans-serif', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(243, 112, 33, 0.1) 0%, rgba(0,0,0,0) 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 },
  card: { background: 'rgba(28, 32, 38, 0.95)', width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '12px', border: '1px solid #2d333b', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' },
  cautionStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'repeating-linear-gradient(45deg, #F37021, #F37021 10px, #1c2026 10px, #1c2026 20px)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' },
  logoContainer: { textDecoration: 'none', display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  logo: { maxWidth: '200px', height: 'auto', animation: 'logoBubble 3s ease-in-out infinite' },
  subtitle: { textAlign: 'center', color: '#9ca3af', marginBottom: '2rem', fontSize: '0.95rem', letterSpacing: '0.5px' },
  label: { display: 'block', color: '#e5e7eb', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { width: '100%', background: '#121417', border: '1px solid #2d333b', padding: '0.8rem 1rem', borderRadius: '6px', color: '#fff', marginBottom: '1.2rem', fontSize: '1rem', transition: 'all 0.2s', outline: 'none' },
  btn: { width: '100%', background: '#F37021', color: '#fff', border: 'none', padding: '1rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 0 #C85A1A', transition: 'all 0.1s', marginTop: '1rem' },
  successBox: { background: '#064e3b', color: '#34d399', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' },
  errorBox: { background: '#451a1a', color: '#f87171', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.2rem', fontSize: '0.85rem', borderLeft: '4px solid #ef4444' },
  eyeBtn: { position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }
};