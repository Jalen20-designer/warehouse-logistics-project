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
        onClick={() => setIsProfileModalOpen(true)} 
        style={{ cursor: 'pointer' }}
      >
        <div className="wms-profile-circle-big" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F37021 0%, #C85A1A 100%)',
          borderRadius: '50%',
          boxShadow: '0 4px 15px rgba(243, 112, 33, 0.4)'
        }}>
          <MdAdminPanelSettings style={{ fontSize: '3.2rem', color: '#fff' }} />
        </div>
        
        <h4 className="wms-profile-name">
          {user?.username || 'ADMIN'}
        </h4>
        <p className="wms-profile-role">
          Hello {(user?.username?.split(' ')[0] || 'Admin').toUpperCase()}
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
        <MdLogout className="wms-nav-icon" style={{ fontSize: '1.5em', margin: 0 }} />
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
                onClick={() => { localStorage.clear(); navigate('/login'); }} 
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