import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: isDark ? '#1a1a1a' : '#f3f4f6' }}>
      <button 
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: isDark ? '#eab308' : '#2563eb',
          color: isDark ? '#1a1a1a' : '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s',
          zIndex: 1000
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      <div className="landing-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', background: isDark ? '#2a2a2a' : '#fff', padding: '3rem 2rem', borderRadius: '12px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: isDark ? '#eab308' : '#2563eb' }}>Warehouse Logistics LMS</div>
        <div style={{ color: isDark ? '#d1d5db' : '#6b7280', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
          A secure and professional platform for managing warehouse inventory, 
          tracking shipments, and monitoring staff activity in real-time.
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '0.8rem 2rem', background: isDark ? '#eab308' : '#2563eb', color: isDark ? '#1a1a1a' : '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: 600, transition: '0.3s' }}>
            Get Started
          </Link>
          <Link to="/login" style={{ padding: '0.8rem 2rem', background: 'transparent', color: isDark ? '#eab308' : '#2563eb', textDecoration: 'none', borderRadius: '10px', border: isDark ? '1px solid #eab308' : '1px solid #2563eb', fontWeight: 600, transition: '0.3s' }}>
            Sign In
          </Link>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#4b5563' }}>
            System Version Group 3 - Secure Manager Portal
        </p>
      </div>
    </div>
  );
}