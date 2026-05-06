import React from 'react';
import { MdCalendarToday, MdLightMode, MdDarkMode, MdAdd } from 'react-icons/md';

export default function TopHeader({
  setIsSidebarOpen,
  toggleTheme,
  isDark,
  setIsQuickSetupOpen
}) {
  return (
    <header className="wms-top-header" style={{display:'flex',alignItems:'center',gap:16}}>
      <button className="wms-hamburger" onClick={() => setIsSidebarOpen(v => !v)}>☰</button>
      <div className="wms-header-date">
        <MdCalendarToday className="wms-nav-icon" style={{marginRight:8}} />
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <button 
        onClick={toggleTheme}
        style={{
          background: '#F37021',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          width: '40px',
          height: '40px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          marginLeft: 'auto',
          marginRight: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {isDark ? <MdLightMode style={{ fontSize: '1.3rem' }} /> : <MdDarkMode style={{ fontSize: '1.3rem' }} />}
      </button>
      <button
        style={{background: '#F37021',color: '#fff',border:'none',borderRadius:4,width:'40px',height:'40px',fontSize:'1.5rem',cursor:'pointer',boxShadow:'0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',flexShrink: 0}} 
        onClick={() => setIsQuickSetupOpen(true)}
        onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        title="Quick Setup"
      >
        <MdAdd style={{ fontSize: '1.8rem' }} />
      </button>
    </header>
  );
}
