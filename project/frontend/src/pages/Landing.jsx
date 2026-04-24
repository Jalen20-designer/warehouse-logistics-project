import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

export default function Landing() {
  const { isDark } = useTheme();

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto Condensed, sans-serif', background: '#121417' }}>
      <div className="landing-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', background: '#1E2126', padding: '3rem 2rem', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '2px solid #343A40', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'repeating-linear-gradient(45deg, #000, #000 8px, #FFB800 8px, #FFB800 16px)' }}></div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#F37021', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>WAREHOUSE LOGISTICS LMS</div>
        <div style={{ color: '#9ca3af', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
          A secure and professional platform for managing warehouse inventory, 
          tracking shipments, and monitoring staff activity in real-time.
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '0.9rem 2rem', background: '#F37021', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 700, transition: '0.3s', boxShadow: '0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Get Started
          </Link>
          <Link to="/login" style={{ padding: '0.9rem 2rem', background: 'transparent', color: '#F37021', textDecoration: 'none', borderRadius: '4px', border: '2px solid #F37021', fontWeight: 700, transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sign In
          </Link>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#FFB800', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            SYSTEM VERSION GROUP 3 - SECURE MANAGER PORTAL
        </p>
      </div>
    </div>
  );
}