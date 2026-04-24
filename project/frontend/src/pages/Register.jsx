import React, { useState } from 'react';
import './Register.css';
import { Link } from 'react-router-dom';

// ICONS
const EyeOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeClosed = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', top: '-150px', left: '-150px', width: '400px', height: '400px', background: 'rgba(245, 158, 11, 0.1)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '400px', background: '#2a2a2a', backdropFilter: 'blur(12px)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'white', position: 'relative', zIndex: 1 },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', color: '#f59e0b' },
  subtitle: { color: '#9ca3af', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '0.75rem', background: '#1a1a1a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: 'white', marginBottom: '1.25rem', outline: 'none', transition: 'border-color 0.3s ease' },
  btn: { width: '100%', padding: '0.8rem', background: '#f59e0b', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)' },
  errorBox: { background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem' },
  success: { background: '#064e3b', color: '#34d399', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }
};

// --- VALIDATION LOGIC RE-ADDED ---
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least 1 number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least 1 symbol (@, #, !, etc.)');
  return errors;
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]); // List ng password requirements
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // Reset errors
    setApiError('');

    // 1. Check Password Requirements
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return; // Stop here if validation fails
    }

    try {
      const res = await fetch('http://localhost/backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setApiError(data.message);
    } catch (err) { setApiError('Server connection failed.'); }
  };

  return (
    <div style={styles.page}>
      <style>{`.register-input:focus { border-color: #f59e0b !important; }`}</style>
      <div style={styles.glow}></div>
      <div style={styles.card}>
        <div style={styles.title}>Warehouse LMS</div>
        <div style={styles.subtitle}>Create your manager account</div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.success}>Registration Successful!</div>
            <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>Proceed to Login →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" spellCheck={false}>
            {/* API Errors */}
            {apiError && <div style={styles.errorBox}>{apiError}</div>}

            {/* PASSWORD REQUIREMENTS LIST */}
            {errors.length > 0 && (
              <div style={styles.errorBox}>
                <strong>Security Requirements:</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '1.2rem' }}>
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            
            <label style={styles.label}>Username</label>
            <input className="register-input" style={styles.input} type="text" autoComplete="new-username" name="register-username" onChange={(e) => setForm({...form, username: e.target.value})} required />

            <label style={styles.label}>Email Address</label>
            <input className="register-input" style={styles.input} type="email" autoComplete="new-email" name="register-email" onChange={(e) => setForm({...form, email: e.target.value})} required />

            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="register-input"
                style={styles.input} 
                type={showPassword ? "text" : "password"} 
                autoComplete="new-password" 
                name="register-password"
                onChange={(e) => setForm({...form, password: e.target.value})} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>

            <button type="submit" style={styles.btn}>Register Manager</button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
              Already a manager? <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}