import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div className="landing-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2563eb' }}>Warehouse Logistics LMS</div>
        <div style={{ color: '#6b7280', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
          A secure and professional platform for managing warehouse inventory, 
          tracking shipments, and monitoring staff activity in real-time.
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '0.8rem 2rem', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 600, transition: '0.3s' }}>
            Get Started
          </Link>
          <Link to="/login" style={{ padding: '0.8rem 2rem', background: 'transparent', color: '#2563eb', textDecoration: 'none', borderRadius: '10px', border: '1px solid #2563eb', fontWeight: 600, transition: '0.3s' }}>
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