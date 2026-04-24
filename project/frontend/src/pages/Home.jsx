import React, { useEffect, useState } from 'react';
import { MdDashboard, MdWarehouse, MdLocalShipping, MdGroup, MdCalendarToday, MdLogout, MdLocationCity, MdLocalShipping as MdTruck, MdPerson, MdSecurity, MdPhone, MdCreditCard, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

// IMPORTS
import jeanImg from '../assets/jean.jpg';
import klarisseImg from '../assets/klarisse.jpg';
import matthewImg from '../assets/matthew.jpg';

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  // 1. ALL STATE DEFINITIONS MUST BE INSIDE THE COMPONENT
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.matchMedia('(max-width: 700px)').matches ? false : true);
  const [stats, setStats] = useState({ users: 0, warehouses: 0, shipments: 0 });
  const [dataList, setDataList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'success' });

  // Quick Setup Modal State (Moved inside the component)
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [quickSetup, setQuickSetup] = useState({
    warehouse_name: '',
    warehouse_location: '',
    driver_name: '',
    licenseNo: '',
    vehicleType: '',
    contactNo: '',
    licenseExpiry: '',
    shipment_item: '',
    shipment_quantity: '',
    shipment_status: 'In Transit',
  });
  const shipmentStatusOptions = ['In Transit', 'Delivered', 'Pending'];

  const navigate = useNavigate();

  // 2. HELPER FUNCTIONS
  const handleQuickInput = (e) => {
    const { name, value } = e.target;
    setQuickSetup(qs => ({ ...qs, [name]: value }));
  };

  const handleQuickSave = async () => {
    const { warehouse_name, warehouse_location, driver_name, licenseNo, vehicleType, contactNo, licenseExpiry, shipment_item, shipment_quantity, shipment_status } = quickSetup;
    
    if (!warehouse_name || !warehouse_location || !driver_name || !licenseNo || !vehicleType || !contactNo || !licenseExpiry || !shipment_item || !shipment_quantity || !shipment_status) {
      showNotif('Please fill in all required fields before activating setup.', 'error');
      return;
    }

    try {
      const payload = {
        warehouse_name,
        warehouse_location,
        driver_name,
        licenseNo,
        vehicleType,
        contactNo,
        licenseExpiry,
        shipment_item,
        shipment_quantity: parseInt(shipment_quantity, 10),
        shipment_status
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/quick_setup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsQuickSetupOpen(false);
        showNotif('Quick Setup successful!', 'success');
        setQuickSetup({ warehouse_name: '', warehouse_location: '', driver_name: '', licenseNo: '', vehicleType: '', contactNo: '', licenseExpiry: '', shipment_item: '', shipment_quantity: '', shipment_status: 'In Transit' });
        loadViewData(currentView); // refresh current view
        loadViewData('dashboard'); // refresh stats
      } else {
        showNotif(data.message || 'Quick setup failed.', 'error');
      }
    } catch (err) {
      showNotif('Quick setup failed.', 'error');
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) navigate('/login');
    else {
      setUser(JSON.parse(loggedInUser));
      loadViewData('dashboard');
    }
    const handleResize = () => {
      if (window.matchMedia('(max-width: 700px)').matches) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const loadViewData = async (view) => {
    setLoading(true);
    setCurrentView(view);
    setSearchTerm('');
    let endpoint =
      view === 'dashboard' ? 'get_dashboard_stats.php'
      : view === 'warehouses' ? 'get_warehouses.php'
      : view === 'shipments' ? 'get_shipments.php'
      : view === 'drivers' ? 'get_drivers.php'
      : null;

    if (view === 'about') {
      setTimeout(() => setLoading(false), 500);
      return;
    }

    try {
      // Added timestamp to prevent browser from caching the old list
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}?t=${new Date().getTime()}`);
      const data = await res.json();
      if (data.success) {
        if (view === 'dashboard') {
            setStats(data.stats);
            const userRes = await fetch(`${import.meta.env.VITE_API_URL}/get_all_users.php?t=${new Date().getTime()}`);
            const userData = await userRes.json();
            if (userData.success) setUsersList(userData.users);
        }
        else setDataList(data.data || []);
      }
    } catch (err) { console.error("Load failed"); }
    setTimeout(() => setLoading(false), 500);
  };

  const filteredDataList =
    (currentView === 'warehouses' || currentView === 'shipments' || currentView === 'drivers') && searchTerm
      ? dataList.filter(item => {
          const search = searchTerm.toLowerCase();
          if (currentView === 'warehouses') {
            return (
              (item.id && (`00${item.id}`).includes(search.replace('#','')))
              || (item.name && item.name.toLowerCase().includes(search))
              || (item.location && item.location.toLowerCase().includes(search))
              || (item.city && item.city.toLowerCase().includes(search))
            );
          } else if (currentView === 'shipments') {
            return (
              (item.id && (`00${item.id}`).includes(search.replace('#','')))
              || (item.item_name && item.item_name.toLowerCase().includes(search))
              || (item.status && item.status.toLowerCase().includes(search))
            );
          } else if (currentView === 'drivers') {
            return (
              (item.id && (`00${item.id}`).includes(search.replace('#','')))
              || (item.name && item.name.toLowerCase().includes(search))
              || (item.status && item.status.toLowerCase().includes(search))
            );
          }
          return false;
        })
      : dataList;

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const showNotif = (msg, type = 'success') => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/delete_record.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedItem.id, table: currentView })
      });
      
      const data = await res.json();
      if (data.success) {
        setIsConfirmOpen(false);
        setIsDetailModalOpen(false);
        setSelectedItem(null);
        showNotif('Successfully deleted record.', 'success');
        loadViewData(currentView);
      } else {
        showNotif(data.message || 'Delete operation failed.', 'error');
      }
    } catch (err) {
      showNotif('Delete request failed.', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="wms-main-layout">
      {notif.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: notif.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold'
        }}>
          {notif.msg}
        </div>
      )}
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && window.matchMedia('(max-width: 700px)').matches && (
        <div className="wms-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      {/* SIDEBAR */}
      <aside className={`wms-sidebar${isSidebarOpen ? '' : ' closed'}${window.matchMedia('(max-width: 700px)').matches && isSidebarOpen ? ' mobile-open' : ''}`}>
        <div className="wms-sidebar-profile wms-sidebar-profile-clickable" onClick={() => setIsProfileModalOpen(true)} style={{cursor:'pointer'}}>
          <div className="wms-profile-circle-big">{user.username.charAt(0).toUpperCase()}</div>
          <h3 className="wms-profile-name">{user.username.toUpperCase()}</h3>
          <p className="wms-profile-role">SYSTEM MANAGER</p>
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
          <div className={`wms-nav-item ${currentView === 'about' ? 'active' : ''}`} onClick={() => setCurrentView('about')}>
            <MdGroup className="wms-nav-icon" /> About Us
          </div>
        </nav>

        <button
          className="wms-logout-box"
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
        >
          <MdLogout className="wms-nav-icon" style={{fontSize:'1.5em',margin:0}} />
        </button>

        {showLogoutModal && (
          <div className="wms-logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="wms-logout-modal" onClick={e => e.stopPropagation()}>
              <div className="wms-logout-modal-header">Log Out</div>
              <div className="wms-logout-modal-body">Are you sure you want to log out?</div>
              <div className="wms-logout-modal-actions">
                <button className="wms-logout-modal-btn wms-logout-ok" style={{background:'#dc2626',color:'#fff'}} onClick={() => { localStorage.clear(); navigate('/login'); }}>OK</button>
                <button className="wms-logout-modal-btn wms-logout-cancel" style={{background:'#22c55e',color:'#fff',outline:'none',boxShadow:'none'}} onClick={() => setShowLogoutModal(false)} onMouseDown={e => e.preventDefault()}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="wms-main-content" style={{position:'relative'}}>
        {loading && (
          <div className="wms-loading-overlay wms-loading-overlay-maincontent">
            <div className="wms-loading-spinner"></div>
            <div className="wms-loading-text">Loading...</div>
          </div>
        )}
        <header className="wms-top-header" style={{display:'flex',alignItems:'center',gap:16}}>
          <button className="wms-hamburger" onClick={() => setIsSidebarOpen(v => !v)}>☰</button>
          <div className="wms-header-date"><MdCalendarToday className="wms-nav-icon" style={{marginRight:8}} />{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <button 
            onClick={toggleTheme}
            style={{
              background: isDark ? '#eab308' : '#2563eb',
              color: isDark ? '#1a1a1a' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s',
              marginLeft: 'auto',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? <MdLightMode style={{ fontSize: '1.3rem' }} /> : <MdDarkMode style={{ fontSize: '1.3rem' }} />}
          </button>
          <button
            style={{background: isDark ? '#eab308' : '#2563eb',color: isDark ? '#1a1a1a' : '#fff',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:'bold',fontSize:'1em',cursor:'pointer',boxShadow:'0 2px 8px #0001'}} 
            onClick={()=>setIsQuickSetupOpen(true)}
          >+ Quick Setup</button>
        </header>

        {/* QUICK SETUP MODAL */}
        {isQuickSetupOpen && (
          <div className="wms-modal-overlay" onClick={()=>setIsQuickSetupOpen(false)}>
            <div className="setup-modal-content wms-modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:600,minWidth:400,background:'#2a2a2a',color:'#fff',padding:0,maxHeight:'90vh',overflowY:'auto'}}>
              <div className="setup-modal-header" style={{background:'#111827',padding:'24px 32px',borderBottom:'1px solid #eee'}}>
                <h2 style={{margin:0,fontSize:'1.5em',fontWeight:800,letterSpacing:1,color:'#fff'}}>Quick Setup</h2>
                <p style={{margin:'8px 0 0 0',color:'#9ca3af',fontSize:'0.9em'}}>Fill out this form to setup your nodes.</p>
              </div>
              <div className="setup-form-body" style={{padding:'32px'}}>
                <div className="form-group" style={{marginBottom:'15px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Warehouse Name <span style={{color:'red'}}>*</span></label>
                   <input className="wms-search-input" name="warehouse_name" value={quickSetup.warehouse_name} onChange={handleQuickInput} placeholder="Warehouse Name" style={{width:'100%',marginBottom:'10px'}} />
                </div>
                <div className="form-group" style={{marginBottom:'15px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Location <span style={{color:'red'}}>*</span></label>
                   <input className="wms-search-input" name="warehouse_location" value={quickSetup.warehouse_location} onChange={handleQuickInput} placeholder="Location" style={{width:'100%',marginBottom:'10px'}} />
                </div>

                <div className="form-group" style={{marginBottom:'15px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Driver Name <span style={{color:'red'}}>*</span></label>
                   <input className="wms-search-input" name="driver_name" value={quickSetup.driver_name} onChange={handleQuickInput} placeholder="Driver Name" style={{width:'100%',marginBottom:'10px'}} />
                </div>

                <div className="form-row" style={{display:'flex',gap:'15px',marginBottom:'15px'}}>
                   <div className="form-group" style={{flex:1}}>
                       <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>License Number <span style={{color:'red'}}>*</span></label>
                       <input className="wms-search-input" name="licenseNo" value={quickSetup.licenseNo} onChange={handleQuickInput} placeholder="License Number" style={{width:'100%',marginBottom:'10px'}} />
                   </div>
                   <div className="form-group" style={{flex:1}}>
                       <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Vehicle Type <span style={{color:'red'}}>*</span></label>
                       <input className="wms-search-input" name="vehicleType" value={quickSetup.vehicleType} onChange={handleQuickInput} placeholder="Vehicle Type" style={{width:'100%',marginBottom:'10px'}} />
                   </div>
                </div>

                <div className="form-row" style={{display:'flex',gap:'15px',marginBottom:'15px'}}>
                   <div className="form-group" style={{flex:1}}>
                       <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Contact Number <span style={{color:'red'}}>*</span></label>
                       <input className="wms-search-input" name="contactNo" value={quickSetup.contactNo} onChange={handleQuickInput} placeholder="Contact Number" style={{width:'100%',marginBottom:'10px'}} />
                   </div>
                   <div className="form-group" style={{flex:1}}>
                       <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>License Expiry <span style={{color:'red'}}>*</span></label>
                       <input className="wms-search-input" type="date" name="licenseExpiry" value={quickSetup.licenseExpiry} onChange={handleQuickInput} style={{width:'100%',marginBottom:'10px'}} />
                   </div>
                </div>

                <div className="form-group" style={{marginBottom:'15px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Shipment Item <span style={{color:'red'}}>*</span></label>
                   <input className="wms-search-input" name="shipment_item" value={quickSetup.shipment_item} onChange={handleQuickInput} placeholder="Item Name" style={{width:'100%',marginBottom:'10px'}} />
                </div>
                <div className="form-group" style={{marginBottom:'15px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Quantity <span style={{color:'red'}}>*</span></label>
                   <input className="wms-search-input" type="number" name="shipment_quantity" value={quickSetup.shipment_quantity} onChange={handleQuickInput} placeholder="Quantity" style={{width:'100%',marginBottom:'10px'}} />
                </div>
                <div className="form-group" style={{marginBottom:'25px'}}>
                   <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Shipment Status <span style={{color:'red'}}>*</span></label>
                   <select className="wms-search-input" name="shipment_status" value={quickSetup.shipment_status} onChange={handleQuickInput} style={{width:'100%',marginBottom:'10px'}}>
                      {shipmentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>

                <button onClick={handleQuickSave} style={{width:'100%',padding:'15px',background:'#10b981',color:'#fff',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1.1em',cursor:'pointer',letterSpacing:1}}>ACTIVATE SETUP</button>
              </div>
            </div>
          </div>
        )}

        <div className="wms-content-padding">
          <div className="wms-view-header">
            <h1 className="wms-view-title">{currentView.toUpperCase()} OVERVIEW</h1>
            <div style={{ flex: 1 }}></div>
          </div>

          {isProfileModalOpen && (
              <div className="wms-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
                  <div className="wms-modal-content wide-modal" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '30px', textAlign: 'center', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <MdSecurity style={{ fontSize: '4.5rem', color: '#3b82f6' }} />
                          <h3 style={{ marginTop: '10px', fontSize: '0.8rem', color: '#2563eb', fontWeight: '900', letterSpacing: '2px' }}>ADMIN NODE</h3>
                      </div>
                      <div style={{ padding: '30px' }}>
                          <div className="wms-modal-table-wrapper">
                              <table className="wms-modal-table">
                                  <thead>
                                      <tr><th>MANAGER</th><th style={{ textAlign: 'right' }}>STATUS</th></tr>
                                  </thead>
                                  <tbody>
                                      {usersList.map((u) => (
                                          <tr key={u.id}>
                                              <td><b>{u.username}</b></td>
                                              <td style={{ textAlign: 'right' }}><span className="wms-status-badge">AUTHORIZED</span></td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      <button className="wms-close-btn" onClick={() => setIsProfileModalOpen(false)}>CLOSE OVERVIEW</button>
                  </div>
              </div>
          )}

          {isDetailModalOpen && selectedItem && (
            <div className="wms-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ background: '#111827', padding: '40px', textAlign: 'center' }}>
                      {currentView === 'warehouses' ? (
                        <MdLocationCity style={{ fontSize: '80px', color: '#fff' }} />
                      ) : currentView === 'drivers' ? (
                        <MdPerson style={{ fontSize: '80px', color: '#fff' }} />
                      ) : (
                        <MdTruck style={{ fontSize: '80px', color: '#fff' }} />
                      )}
                    </div>
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '800' }}>RECORD #00{(currentView === 'warehouses' ? selectedItem.id : (selectedItem.warehouse_id || selectedItem.id)).toString().padStart(2, '0')}</span>
                      <h2 style={{ margin: '10px 0' }}>{currentView === 'shipments' ? selectedItem.item_name : selectedItem.name}</h2>
                      {currentView === 'warehouses' ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Location: {selectedItem.location}</p>
                      ) : currentView === 'drivers' ? (
                        <>
                          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#6b7280' }}>Vehicle:</span> {selectedItem.vehicle_type ? <span style={{ color: '#1f2937', fontWeight: '500' }}>{selectedItem.vehicle_type}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending Verification</span>}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#6b7280' }}>Contact:</span> {selectedItem.contact_no ? <span style={{ color: '#1f2937', fontWeight: '500' }}>{selectedItem.contact_no}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending Verification</span>}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#6b7280' }}>License Expiry:</span> {selectedItem.license_expiry ? <span style={{ color: '#1f2937', fontWeight: '500' }}>{selectedItem.license_expiry}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending Verification</span>}
                          </p>
                          <p style={{ margin: '15px 0 0 0', fontWeight: 'bold' }}>Status: {selectedItem.status}</p>
                        </>
                      ) : (
                        <>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Status: {selectedItem.status}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Quantity: {selectedItem.quantity || 'N/A'}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Warehouse: {selectedItem.warehouse_name}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Driver: {selectedItem.driver_name ? selectedItem.driver_name : 'Unassigned'}</p>
                        </>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                        {currentView === 'warehouses' ? (
                          <>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ flex: 1, padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CANCEL</button>
                            <button onClick={handleDeleteClick} style={{ flex: 1, padding: '15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>DELETE RECORD</button>
                          </>
                        ) : (
                          <button onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CLOSE</button>
                        )}
                      </div>
                    </div>
                </div>
            </div>
          )}

          {isConfirmOpen && selectedItem && (
            <div className="wms-modal-overlay" onClick={() => setIsConfirmOpen(false)} style={{zIndex: 10000}}>
              <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>⚠️</div>
                <h2 style={{ margin: '0 0 15px 0' }}>Are you sure?</h2>
                <p style={{ color: '#6b7280', marginBottom: '25px' }}>
                  Are you sure you want to delete <strong>{currentView === 'shipments' ? selectedItem.item_name : selectedItem.name}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setIsConfirmOpen(false)} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CANCEL</button>
                  <button onClick={executeDelete} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>YES, DELETE</button>
                </div>
              </div>
            </div>
          )}

          {(currentView === 'warehouses' || currentView === 'shipments' || currentView === 'drivers') && (
            <form className="wms-search-container" onSubmit={handleSearch} style={{marginBottom:'30px'}}>
              <input
                className="wms-search-input"
                type="text"
                placeholder={`Search by #, name${currentView==='shipments' ? ', or status' : ''}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="wms-search-btn" type="submit" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="7" stroke="#6b7280" strokeWidth="2"/>
                  <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
          )}

          <div className="wms-card-grid wms-dashboard-cards">
            {currentView === 'dashboard' && (
              <>
                <div className="wms-card"><div className="wms-card-top accent"><span className="wms-label">USERS</span><h2 className="wms-value">{stats.users} Managers</h2></div><div className="wms-card-bottom">Active Access</div></div>
                <div className="wms-card"><div className="wms-card-top"><span className="wms-label">LOGISTICS</span><h2 className="wms-value">{stats.warehouses} Warehouses</h2></div><div className="wms-card-bottom">Authorized Hubs</div></div>
                <div className="wms-card"><div className="wms-card-top"><span className="wms-label">OPERATIONS</span><h2 className="wms-value">{stats.shipments} Shipments</h2></div><div className="wms-card-bottom">Live Tracking</div></div>
              </>
            )}

            { currentView === 'drivers'&& (
              filteredDataList.length === 0 ? (
                <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
              ) : (
                filteredDataList.map((item, index) => (
                  <div key={index} className="wms-card">
                    <div className="wms-card-top" style={{ paddingBottom: '12px' }}>
                      <div>
                        <span className="wms-label">#00{(item.warehouse_id || item.id).toString().padStart(2, '0')}</span>
                        <h2 className="wms-item-name" style={{ marginBottom: '4px' }}>{item.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MdTruck style={{ fontSize: '1.2em' }} /> 
                          {item.vehicle_type ? <span style={{ color: '#f3f4f6', fontWeight: '500' }}>{item.vehicle_type}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending Verification</span>}
                        </p>
                      </div>
                      <div className="wms-card-logo-circle">
                        <MdPerson style={{ fontSize: '1.7em', color: isDark ? '#eab308' : '#2563eb' }} />
                      </div>
                    </div>
                    <div style={{ padding: '12px 20px 15px 20px', fontSize: '0.8rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdPhone style={{ fontSize: '1.3em', color: '#6b7280' }} /> 
                        <span style={{ width: '60px', color: '#6b7280' }}>Contact:</span> 
                        {item.contact_no ? <span style={{ color: '#1f2937', fontWeight: '600' }}>{item.contact_no}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdCreditCard style={{ fontSize: '1.3em', color: '#6b7280' }} /> 
                        <span style={{ width: '60px', color: '#6b7280' }}>Expiry:</span> 
                        {item.license_expiry ? <span style={{ color: '#1f2937', fontWeight: '600' }}>{item.license_expiry}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending</span>}
                      </div>
                    </div>
                    <div className="wms-card-bottom">
                      <span style={{ fontWeight: 'bold' }}>{item.status}</span>
                      <button className="wms-details-btn" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>Details ❯</button>
                    </div>
                  </div>
                ))
              )
            )}

            {currentView === 'warehouses' && (
              filteredDataList.length === 0 ? (
                <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
              ) : (
                filteredDataList.map((item, index) => (
                  <div key={index} className="wms-card">
                    <div className="wms-card-top">
                      <div>
                        <span className="wms-label">#00{item.id}</span>
                        <h2 className="wms-item-name">{item.name}</h2>
                        <p className="wms-item-sub">{item.location}</p>
                      </div>
                      <div className="wms-card-logo-circle">
                        <MdLocationCity style={{ fontSize: '1.7em', color: isDark ? '#eab308' : '#2563eb' }} />
                      </div>
                    </div>
                    <div className="wms-card-bottom">
                        <span>{item.warehouse_name || 'System Verified'}</span>
                        <button className="wms-details-btn" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>Details ❯</button>
                    </div>
                  </div>
                ))
              )
            )}

            {currentView === 'shipments' && (
              filteredDataList.length === 0 ? (
                <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
              ) : (
                filteredDataList.map((item, index) => (
                  <div key={index} className="wms-card">
                    <div className="wms-card-top">
                      <div>
                        <span className="wms-label">#00{(item.warehouse_id || item.id).toString().padStart(2, '0')}</span>
                        <h2 className="wms-item-name">{item.item_name}</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Qty: {item.quantity || 'N/A'}</p>
                      </div>
                      <div className="wms-card-logo-circle">
                        <MdTruck style={{ fontSize: '1.7em', color: isDark ? '#eab308' : '#2563eb' }} />
                      </div>
                    </div>
                    <div className="wms-card-bottom">
                        <span>{item.status}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.85em', marginLeft: 8 }}>Driver: {item.driver_name || 'Unassigned'}</span>
                        <button className="wms-details-btn" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>Details ❯</button>
                    </div>
                  </div>
                ))
              )
            )}

            {currentView === 'about' && (
                <div className="wms-about-container">
                    {[
                        { name: 'Jean Carlos', role: 'Project Lead', img: jeanImg, desc: 'The Project Lead is responsible for overseeing the planning, coordination, and execution of the project, ensuring that team members stay aligned with objectives.' },
                        { name: 'Klarisse Borlado', role: 'Database Administrator', img: klarisseImg, desc: 'The Database Manager is responsible for designing, organizing, and maintaining the database, ensuring data is stored securely, efficiently, and is easily accessible.' },
                        { name: 'Matthew Francia', role: 'UI/UX Designer', img: matthewImg, desc: 'The UI/UX Designer is responsible for designing user-friendly and visually appealing interfaces, ensuring a smooth and intuitive user experience..' }
                    ].map(m => (
                        <div className="wms-card wms-member-card" key={m.name}>
                            <div className="wms-card-top accent center-content">
                              <img src={m.img} className="wms-member-img" alt={m.name} />
                            </div>
                            <div className="wms-card-bottom center-content">
                              <h4 style={{margin:0}}>{m.name}</h4>
                              <p style={{fontSize:'0.7rem', color: '#6b7280', marginTop:'5px'}}>{m.role}</p>
                            </div>
                            <div className="wms-member-desc">{m.desc}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}