import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';
import logo from '../assets/logo.png';
import warehouseImg1 from '../assets/warehouseimg.jpg';
import warehouseImg2 from '../assets/warehouseimg2.jpg';
import warehouseImg3 from '../assets/warehouseimg3.jpg';

export default function Landing() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [warehouseImg1, warehouseImg2, warehouseImg3];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, images.length]);

  const logoStyle = {
    maxWidth: '250px',
    height: 'auto',
    marginBottom: '1.5rem',
    cursor: 'pointer',
    animation: 'logoBubble 3s ease-in-out infinite'
  };

  return (
    <>
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#121417', flexDirection: 'column' }}>
          <style>{`
            @keyframes logoHeartbeat {
              0%, 100% { transform: scale(1); }
              10% { transform: scale(1.1); }
              20% { transform: scale(1); }
              30% { transform: scale(1.15); }
              40% { transform: scale(1); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
          <img src={logo} alt="Loading..." style={{ maxWidth: '300px', height: 'auto', animation: 'logoHeartbeat 2s ease-in-out infinite' }} />
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F37021', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F37021', animation: 'pulse 1.5s ease-in-out 0.3s infinite' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F37021', animation: 'pulse 1.5s ease-in-out 0.6s infinite' }}></div>
          </div>
          <p style={{ marginTop: '1.5rem', color: '#9ca3af', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px', fontSize: '1.2rem' }}>LOADING SYSTEM...</p>
        </div>
      ) : (
        <div 
          className="landing-container" 
          style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'Roboto Condensed, sans-serif',
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transition: 'background-image 1s ease-in-out',
            position: 'relative'
          }}
        >
          <style>{`
            @keyframes logoBubble {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-10px) scale(1.05); }
            }
          `}</style>
          
          {/* Dark overlay for better readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1
          }}></div>

          <div className="landing-card" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            textAlign: 'center', 
            background: '#1E2126', 
            padding: '3rem 2rem', 
            borderRadius: '4px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', 
            border: '2px solid #343A40', 
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'repeating-linear-gradient(45deg, #000, #000 8px, #FFB800 8px, #FFB800 16px)' }}></div>
            <img src={logo} alt="Warehouse LMS" style={logoStyle} />
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
      )}
    </>
  );
}
