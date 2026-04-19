import { useState } from 'react'
import { Link } from 'react-router-dom'

// --- Standard Eye Icons (SVG) ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

// --- Your Existing Styles ---
const page = { minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }
const header = { background: '#1f2937', color: 'white', padding: '1rem 2rem', fontWeight: '600' }
const container = { maxWidth: '420px', margin: '3rem auto', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2rem' }
const label = { fontSize: '0.85rem', color: '#374151', fontWeight: '600' }
const input = { width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '0.3rem', marginBottom: '1rem', fontSize: '0.95rem' }
const btn = { width: '100%', padding: '0.6rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }
const errorBox = { background: '#fee2e2', border: '1px solid #dc2626', color: '#7f1d1d', padding: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }
const successBox = { background: '#ecfdf5', border: '1px solid #16a34a', color: '#065f46', padding: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }

function validatePassword(password) {
  const errors = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least 1 symbol')
  return errors
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState([])
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Toggle State

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors([])
    setApiError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const passwordErrors = validatePassword(form.password)
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost/backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) { setSuccess(true) } 
      else { setApiError(data.message || 'Registration failed.') }
    } catch (err) {
      setApiError('Server unavailable. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={page}>
      <div style={header}>Warehouse Management System</div>
      <div style={container}>
        {success ? (
          <>
            <div style={successBox}>Account successfully created.</div>
            <Link to="/login" style={{ ...btn, display: 'block', textAlign: 'center', textDecoration: 'none' }}>Proceed to Login</Link>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '1rem' }}>Register New User</h2>
            {apiError && <div style={errorBox}>{apiError}</div>}
            {errors.length > 0 && (
              <div style={errorBox}>
                <strong>Password requirements:</strong>
                <ul style={{ marginTop: '0.3rem', paddingLeft: '1.2rem' }}>
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label style={label}>Username</label>
              <input style={input} type="text" name="username" value={form.username} onChange={handleChange} required />

              <label style={label}>Email</label>
              <input style={input} type="email" name="email" value={form.email} onChange={handleChange} required />

              <label style={label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...input, paddingRight: '2.5rem' }} 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '38%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280', // Grey color for icon
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <button style={btn} type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Register'}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}