import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  
  MdDashboard, MdWarehouse, MdLocalShipping, MdPerson, 
  MdList, MdGroup, MdLogout, MdAdminPanelSettings 
} from 'react-icons/md';

export default function Sidebar({ 
  currentView, 
  loadViewData, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user, 
  setIsProfileModalOpen 
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className={`wms-sidebar${isSidebarOpen ? ' mobile-open' : ' closed'}`}>
      <div 
        className="wms-sidebar-profile wms-sidebar-profile-clickable" 
        onClick={() => navigate('/profile')} 
        style={{ cursor: 'pointer' }}
      >
        <div className="wms-profile-circle-big" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #F37021 0%, #C85A1A 100%)',
          borderRadius: '50%',
          boxShadow: user?.avatar ? 'none' : '0 4px 15px rgba(243, 112, 33, 0.4)',
          overflow: 'hidden',
          width: '110px',
          height: '110px',
          margin: '0 auto'
        }}>
          {user?.avatar ? (
            <img 
              src={`http://localhost/backend/uploads/profiles/${user.avatar}`} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : user?.username ? (
            <span style={{ fontSize: '4.5rem', color: '#fff', fontWeight: 'bold' }}>
              {user.username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <MdAdminPanelSettings style={{ fontSize: '4.5rem', color: '#fff' }} />
          )}
        </div>
        
        <h4 className="wms-profile-name" style={{ fontSize: '1.4rem', marginTop: '15px', letterSpacing: '1px', fontWeight: 'bold' }}>
          {user?.username || 'ADMIN'}
        </h4>
        <p className="wms-profile-role" style={{ fontSize: '1rem', color: '#a1a1aa', marginTop: '5px' }}>
          WELCOME {(user?.username?.split(' ')[0] || 'Admin').toUpperCase()}
        </p>
      </div>

      <nav className="wms-sidebar-nav">
        <div className={`wms-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => loadViewData('dashboard')}>
          <MdDashboard className="wms-nav-icon" /> Dashboard
        </div>
        <div className={`wms-nav-item ${currentView === 'warehouses' ? 'active' : ''}`} onClick={() => loadViewData('warehouses')}>
          <MdWarehouse className="wms-nav-icon" /> Warehouses
        </div>
        <div className={`wms-nav-item ${currentView === 'shipments' ? 'active' : ''}`} onClick={() => loadViewData('shipments')}>
          <MdLocalShipping className="wms-nav-icon" /> Shipments
        </div>
        <div className={`wms-nav-item ${currentView === 'drivers' ? 'active' : ''}`} onClick={() => loadViewData('drivers')}>
          <MdPerson className="wms-nav-icon" /> Drivers
        </div>
        <div className={`wms-nav-item ${currentView === 'backlog' ? 'active' : ''}`} onClick={() => loadViewData('backlog')}>
          <MdList className="wms-nav-icon" /> Backlog
        </div>
        <div className={`currentView === 'about' ? 'active' : '' wms-nav-item`} onClick={() => setCurrentView('about')}>
          <MdGroup className="wms-nav-icon" /> About Us
        </div>
      </nav>

      <button className="wms-logout-box" onClick={() => setShowLogoutModal(true)} title="Logout">
        <MdLogout />
      </button>

      {showLogoutModal && (
        <div className="wms-logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="wms-logout-modal" onClick={e => e.stopPropagation()}>
            <div className="wms-logout-modal-header">Log Out</div>
            <div className="wms-logout-modal-body">Are you sure you want to log out?</div>
            <div className="wms-logout-modal-actions">
              <button 
                className="wms-logout-modal-btn" 
                style={{ background: '#dc2626', color: '#fff' }} 
                onClick={() => { localStorage.clear(); navigate('/'); }} 
              >
                OK
              </button>
              <button 
                className="wms-logout-modal-btn" 
                style={{ background: '#F37021', color: '#fff' }} 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
