import { Link } from 'react-router-dom'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: 'Arial, sans-serif',
  },

  header: {
    background: '#1f2937',
    color: 'white',
    padding: '1rem 2rem',
    fontWeight: '600',
  },

  container: {
    maxWidth: '900px',
    margin: '4rem auto',
    padding: '2rem',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },

  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#111827',
  },

  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },

  btnGroup: {
    display: 'flex',
    gap: '1rem',
  },

  btnPrimary: {
    padding: '0.6rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '600',
  },

  btnSecondary: {
    padding: '0.6rem 1.5rem',
    background: '#e5e7eb',
    color: '#111827',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '600',
  },
}

export default function Landing() {
  return (
    <div style={styles.page}>
    
      <div style={styles.header}>
        Warehouse Logistics Management System
      </div>

      
      <div style={styles.container}>
        <h1 style={styles.title}>
          Warehouse Logistics Management Systems
        </h1>

        <p style={styles.subtitle}>
          Manage warehouse access and user accounts securely.
        </p>

        <div style={styles.btnGroup}>
          <Link to="/register" style={styles.btnPrimary}>
            Register Account
          </Link>

          <Link to="/login" style={styles.btnSecondary}>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}