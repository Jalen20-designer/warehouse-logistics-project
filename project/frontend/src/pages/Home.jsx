import { useNavigate } from 'react-router-dom'

const page = {
  minHeight: '100vh',
  background: '#f3f4f6',
  fontFamily: 'Arial, sans-serif',
}

const header = {
  background: '#1f2937',
  color: 'white',
  padding: '1rem 2rem',
  fontWeight: '600',
  fontSize: '1.1rem',
}

const container = {
  padding: '2rem',
}

const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '6px',
  maxWidth: '500px',
  border: '1px solid #e5e7eb',
}

const label = {
  fontSize: '0.85rem',
  color: '#6b7280',
}

const value = {
  fontSize: '1rem',
  color: '#111827',
  fontWeight: '600',
  marginBottom: '1rem',
}

const logoutBtn = {
  marginTop: '1.5rem',
  padding: '0.5rem 1rem',
  background: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={page}>
      {/* Top bar */}
      <div style={header}>
        Warehouse System
      </div>

      {/* Content */}
      <div style={container}>
        <div style={card}>
          <h2 style={{ marginBottom: '1rem' }}>User Information</h2>

          <div>
            <div style={label}>Username</div>
            <div style={value}>{user.username || 'N/A'}</div>
          </div>

          <div>
            <div style={label}>Email</div>
            <div style={value}>{user.email || 'N/A'}</div>
          </div>

          <div>
            <div style={label}>Status</div>
            <div style={value}>Active</div>
          </div>

          <button style={logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}