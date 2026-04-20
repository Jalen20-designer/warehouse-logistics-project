import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2070')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: 'Inter, sans-serif' 
  },

  card: { 
    width: '100%', 
    maxWidth: '500px', 
    background: '#1f2937', 
    padding: '3rem', 
    borderRadius: '20px', 
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
    textAlign: 'center',
    color: 'white' 
  },
  title: { 
    fontSize: '2rem', 
    fontWeight: 'bold', 
    marginBottom: '1rem', 
    color: '#60a5fa' 
  },
  subtitle: { 
    color: '#9ca3af', 
    marginBottom: '2.5rem', 
    lineHeight: '1.6',
    fontSize: '1rem'
  },
  btnGroup: { 
    display: 'flex', 
    gap: '1rem', 
    justifyContent: 'center' 
  },
  btnPrimary: { 
    padding: '0.8rem 2rem', 
    background: '#2563eb', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '10px', 
    fontWeight: '600', 
    transition: '0.3s' 
  },
  btnSecondary: { 
    padding: '0.8rem 2rem', 
    background: 'transparent', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '10px', 
    border: '1px solid #4b5563', 
    fontWeight: '600', 
    transition: '0.3s' 
  }
};

export default function Landing() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>Warehouse Logistics LMS</div>
        <div style={styles.subtitle}>
          A secure and professional platform for managing warehouse inventory, 
          tracking shipments, and monitoring staff activity in real-time.
        </div>

        <div style={styles.btnGroup}>
          <Link to="/register" style={styles.btnPrimary}>
            Get Started
          </Link>
          <Link to="/login" style={styles.btnSecondary}>
            Sign In
          </Link>
        </div>
        
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#4b5563' }}>
            System Version Group 3 - Secure Manager Portal
        </p>
      </div>
    </div>
  );
}