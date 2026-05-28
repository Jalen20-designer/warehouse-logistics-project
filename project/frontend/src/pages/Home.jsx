import React, { useEffect, useState } from 'react';
import { MdDashboard, MdWarehouse, MdLocalShipping, MdGroup, MdCalendarToday, MdLogout, MdLocationCity, MdLocalShipping as MdTruck, MdPerson, MdSecurity, MdPhone, MdCreditCard, MdLightMode, MdDarkMode, MdAdd, MdUpload, MdImage, MdEdit, MdDelete, MdList } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Home.css';
import '../styles/admin-modal.css';

// IMPORTS
import { decryptFieldInReact } from '../utils/cryptoHelper';
import logo from '../assets/logo.png';
import Backlog from '../components/Backlog';
import QuickSetupModal from '../components/QuickSetupModal';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import WarehouseView from '../features/Warehouse/WarehouseView';
import DriverView from '../features/Drivers/DriverView';
import ShipmentView from '../features/Shipments/ShipmentView';
import AboutView from '../components/AboutView';
import DashboardHome from '../features/Dashboard/DashboardHome';
import DetailModal from '../components/DetailModal';

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  // 1. ALL STATE DEFINITIONS MUST BE INSIDE THE COMPONENT
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.matchMedia('(max-width: 768px)').matches ? false : true);
  const [stats, setStats] = useState({ users: 0, warehouses: 0, shipments: 0, drivers: 0 });
  const [dataList, setDataList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [dashboardBacklogs, setDashboardBacklogs] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'success' });
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [isUrgentBacklogOpen, setIsUrgentBacklogOpen] = useState(false);
  const [shipmentFilter, setShipmentFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [editedDriver, setEditedDriver] = useState({
    contact_no: '',
    vehicle_type: '',
    license_expiry: ''
  });
  const [isDeleteActivityOpen, setIsDeleteActivityOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isDeleteAllActivitiesOpen, setIsDeleteAllActivitiesOpen] = useState(false);

  // Quick Setup Modal State
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);

  // Helper function to get status stamp class
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return 'delivered';
    if (statusLower === 'in transit') return 'in-transit';
    if (statusLower === 'pending' || statusLower === 'delayed') return 'pending';
    return 'pending'; // default
  };

  const navigate = useNavigate();

  // HELPER FUNCTIONS

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) navigate('/login');
    else {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);

      // RESTful: GET /auth/profile with credentials
      fetch('http://localhost/backend/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const updatedUser = { ...parsedUser, ...data.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch(err => console.error("Profile fetch error:", err));

      loadViewData('dashboard');
    }
    const handleResize = () => {
      if (window.matchMedia('(max-width: 768px)').matches) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const loadViewData = async (view) => {
    setLoading(true);
    setCurrentView(view);
    setSearchTerm('');

    // Skip API calls for about and backlog views
    if (view === 'about' || view === 'backlog') {
      setTimeout(() => setLoading(false), 500);
      return;
    }

    try {
      let endpoint = 'http://localhost/backend';
      let res;
      if (view === 'dashboard') {
        // GET /activities/stats
        res = await fetch(`${endpoint}/activities/stats`, { method: 'GET', credentials: 'include' });
      } else if (view === 'warehouses') {
        // GET /warehouses
        res = await fetch(`${endpoint}/warehouses`, { method: 'GET', credentials: 'include' });
      } else if (view === 'shipments') {
        // GET /shipments
        res = await fetch(`${endpoint}/shipments`, { method: 'GET', credentials: 'include' });
      } else if (view === 'drivers') {
        // GET /drivers
        res = await fetch(`${endpoint}/drivers`, { method: 'GET', credentials: 'include' });
      }
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Invalid JSON from backend:', text);
        setNotif({ show: true, msg: 'Server error: Invalid JSON response', type: 'error' });
        setTimeout(() => setLoading(false), 500);
        return;
      }

      if (data.success) {
        if (view === 'dashboard') {
          // Dashboard Counters
          setStats({
            users: data.stats.users || 0,
            warehouses: data.stats.warehouses || 0,
            shipments: data.stats.shipments || 0,
            drivers: data.stats.drivers || 0
          });

          // Fetch extra Dashboard data
          setLoadingActivities(true);
          try {
            // GET /auth/users (for managers list)
            const userRes = await fetch('http://localhost/backend/auth/users', { method: 'GET', credentials: 'include' });
            const userData = await userRes.json();
            if (userData.success) setUsersList(userData.users || []);

            // GET /activities
            const activityRes = await fetch('http://localhost/backend/activities', { method: 'GET', credentials: 'include' });
            const activityData = await activityRes.json();
            if (activityData.success) setActivitiesList(activityData.data || []);

            // GET /backlog
            const backlogRes = await fetch('http://localhost/backend/backlog', { method: 'GET', credentials: 'include' });
            const backlogData = await backlogRes.json();
            if (backlogData.success && backlogData.data) {
              const pending = backlogData.data.filter(t => t.status !== 'Shipped' && t.status !== 'Completed');
              setDashboardBacklogs(pending.slice(0, 3));
            }
          } catch (innerErr) {
            console.error("Dashboard sub-fetch failed:", innerErr);
          } finally {
            setLoadingActivities(false);
          }
        } else {
          // For shipments, warehouses, drivers
          if (view === 'drivers') {
            // I-decrypt muna ang bawat driver bago i-save sa state
            const decryptedDrivers = await Promise.all(data.data.map(async (driver) => {
              return {
                ...driver,
                contact_no: await decryptFieldInReact(driver.contact_no),
                license_number: await decryptFieldInReact(driver.license_number)
              };
            }));
            setDataList(decryptedDrivers);
          } else {
            setDataList(data.data || []);
          }
        }
      } else {
        console.error('Backend error:', data.message);
      }
    } catch (err) {
      console.error("Fetch Load failed:", err);
    }
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
      : currentView === 'shipments' && shipmentFilter !== 'All'
        ? dataList.filter(item => item.status === shipmentFilter)
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
      // RESTful DELETE /{resource}/{id} with credentials
      const res = await fetch(`http://localhost/backend/${currentView}/${selectedItem.id}`, {
        method: 'DELETE',
        credentials: 'include'
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

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      // RESTful PATCH /shipments/{id} with credentials
      const res = await fetch(`http://localhost/backend/shipments/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showNotif(`Status updated to ${newStatus}!`, 'success');
        setSelectedItem({...selectedItem, status: newStatus});
        loadViewData(currentView);
      } else {
        showNotif(data.message || 'Status update failed.', 'error');
      }
    } catch (err) {
      showNotif('Status update request failed.', 'error');
    }
  };

  const handleUpdateDriver = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      // RESTful PATCH /drivers/{id} with credentials
      const res = await fetch(`http://localhost/backend/drivers/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          contact_no: editedDriver.contact_no,
          vehicle_type: editedDriver.vehicle_type,
          license_expiry: editedDriver.license_expiry
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotif('Driver information updated successfully!', 'success');
        setSelectedItem({
          ...selectedItem, 
          contact_no: editedDriver.contact_no,
          vehicle_type: editedDriver.vehicle_type,
          license_expiry: editedDriver.license_expiry
        });
        setIsEditingDriver(false);
        loadViewData(currentView);
      } else {
        showNotif(data.message || 'Update failed.', 'error');
      }
    } catch (err) {
      showNotif('Update request failed.', 'error');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!activityId) {
      showNotif('Invalid activity ID', 'error');
      return;
    }

    try {
      // RESTful DELETE /activities/{id} with credentials
      const res = await fetch(`http://localhost/backend/activities/${activityId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      console.log('Delete response:', data); // Debug log
      
      if (data.success) {
        showNotif('Activity deleted successfully!', 'success');
        
        // Update local state immediately - remove the deleted activity
        setActivitiesList(prevList => prevList.filter(activity => activity.id !== activityId));
        
        // Close confirmation modal
        setIsDeleteActivityOpen(false);
        setActivityToDelete(null);
      } else {
        showNotif(data.message || 'Delete failed.', 'error');
        console.error('Delete failed:', data);
      }
    } catch (err) {
      console.error('Delete request error:', err);
      showNotif('Delete request failed: ' + err.message, 'error');
    }
  };

  const handleDeleteActivityClick = (activity) => {
    setActivityToDelete(activity);
    setIsDeleteActivityOpen(true);
  };

  const handleDeleteAllActivitiesClick = () => {
    setIsDeleteAllActivitiesOpen(true);
  };

  const handleDeleteAllActivities = async () => {
    try {
      // RESTful DELETE /activities (delete all) with credentials
      const res = await fetch('http://localhost/backend/activities', {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        showNotif('All activities deleted successfully!', 'success');
        setActivitiesList([]);
        setIsDeleteAllActivitiesOpen(false);
      } else {
        showNotif(data.message || 'Delete all failed.', 'error');
      }
    } catch (err) {
      console.error('Delete all request error:', err);
      showNotif('Delete all request failed: ' + err.message, 'error');
    }
  };

  // Helper function to open detail modal
  const setSelectedItemAndOpenModal = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Helper function to close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setIsEditingDriver(false);
    setEditedDriver({ contact_no: '', vehicle_type: '', license_expiry: '' });
  };

  if (!user) return null;

  return (
    <div className="wms-main-layout">
      {notif.show && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: notif.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold'
        }}>
          {notif.msg}
        </div>
      )}
      
      <Sidebar 
        currentView={currentView}
        loadViewData={loadViewData}
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
        setIsProfileModalOpen={setIsProfileModalOpen}
      />

      {isSidebarOpen && (
        <div className="wms-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="wms-main-content" style={{position:'relative'}}>
        {loading && (
          <div className="wms-loading-overlay wms-loading-overlay-maincontent">
            <div className="wms-loading-spinner"></div>
            <div className="wms-loading-bars">
              <div className="wms-loading-bar"></div>
              <div className="wms-loading-bar"></div>
              <div className="wms-loading-bar"></div>
              <div className="wms-loading-bar"></div>
              <div className="wms-loading-bar"></div>
            </div>
            <div className="wms-loading-text">Loading Warehouse</div>
            <div className="wms-loading-caution"></div>
          </div>
        )}
        <TopHeader
          setIsSidebarOpen={setIsSidebarOpen}
          toggleTheme={toggleTheme}
          isDark={isDark}
          setIsQuickSetupOpen={setIsQuickSetupOpen}
        />

        {/* QUICK SETUP MODAL */}
        <QuickSetupModal 
          isOpen={isQuickSetupOpen}
          onClose={() => setIsQuickSetupOpen(false)}
          onSuccess={() => {
            showNotif('Quick Setup successful!', 'success');
            loadViewData(currentView);
            loadViewData('dashboard');
          }}
        />

        <div className="wms-content-padding">
          <div className="wms-view-header">
            <div>
              <h1 className="wms-view-title">{currentView.toUpperCase()} OVERVIEW</h1>
              <p style={{
                fontSize: '0.85rem',
                color: '#9ca3af',
                margin: '8px 0 0 0',
                fontWeight: 400,
                letterSpacing: '0.3px'
              }}>
                {currentView === 'dashboard' && 'A real-time snapshot of your entire warehouse and logistics operations.'}
                {currentView === 'warehouses' && 'Manage facility locations, storage capacities, and inventory distribution.'}
                {currentView === 'shipments' && 'Create, track, and manage all inbound and outbound deliveries.'}
                {currentView === 'drivers' && 'Manage driver profiles, vehicle assignments, and license credentials.'}
                {currentView === 'backlog' && 'Manage your task backlog and track progress.'}
                {currentView === 'about' && 'Information about the system, developers, and support contact details.'}
              </p>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>

          {isProfileModalOpen && (
                <div className="wms-modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
                  <div className="wms-modal-content wide-modal" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                    <div style={{ background: '#f8fafc', padding: '30px', textAlign: 'center', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#F37021', fontWeight: '900', letterSpacing: '3px' }}>ADMIN NODE</h3>
                      <img src={logo} alt="Admin" style={{ maxWidth: '180px', height: 'auto', display: 'block' }} />
                    </div>
                    <div style={{ padding: '30px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <div className="wms-modal-table-wrapper">
                        <table className="wms-modal-table">
                          <thead>
                            <tr><th>MANAGER</th><th style={{ textAlign: 'right' }}>STATUS</th></tr>
                          </thead>
                          <tbody>
                            {(usersList || []).map((u) => (
                              <tr key={u.id} style={{ background: user && u.id === user.id ? '#fff3e0' : 'transparent' }}>
                                <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <b>{u.username}</b>
                                  {user && u.id === user.id && (
                                  <span style={{ 
                                    background: '#F37021', 
                                    color: '#fff', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: '700',
                                    letterSpacing: '0.5px'
                                  }}>YOU</span>
                                  )}
                                </div>
                                </td>
                                <td style={{ textAlign: 'right' }}><span className="wms-status-badge">AUTHORIZED</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div style={{ padding: '20px', borderTop: '1px solid #eee', background: '#f8fafc' }}>
                    <button className="wms-close-btn" onClick={() => setIsProfileModalOpen(false)} style={{ width: '100%' }}>CLOSE OVERVIEW</button>
                    </div>
                  </div>
                </div>
          )}

          <DetailModal 
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            selectedItem={selectedItem}
            currentView={currentView}
            isDark={isDark}
            isEditingDriver={isEditingDriver}
            setIsEditingDriver={setIsEditingDriver}
            editedDriver={editedDriver}
            setEditedDriver={setEditedDriver}
            handleUpdateDriver={handleUpdateDriver}
            handleStatusUpdate={handleStatusUpdate}
            handleDeleteClick={handleDeleteClick}
            getStatusClass={getStatusClass}
          />

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

          {/* Delete Activity Confirmation Modal */}
          {isDeleteActivityOpen && activityToDelete && (
            <div className="wms-modal-overlay" onClick={() => setIsDeleteActivityOpen(false)} style={{zIndex: 10000}}>
              <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'center', maxWidth: '450px' }}>
                <div style={{ 
                  fontSize: '5rem', 
                  marginBottom: '15px',
                  color: '#ef4444',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <MdDelete />
                </div>
                <h2 style={{ margin: '0 0 15px 0', color: isDark ? '#1f2937' : '#1f2937' }}>Delete Activity?</h2>
                <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.95rem' }}>
                  Are you sure you want to delete this activity?
                </p>
                <div style={{
                  background: isDark ? '#f3f4f6' : '#f9fafb',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    color: '#374151',
                    fontStyle: 'italic',
                    wordBreak: 'break-word'
                  }}>
                    "{activityToDelete.action_text}"
                  </p>
                </div>
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '600' }}>
                  ⚠️ This action cannot be undone
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      setIsDeleteActivityOpen(false);
                      setActivityToDelete(null);
                    }} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: '#f3f4f6', 
                      color: '#374151', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={() => handleDeleteActivity(activityToDelete.id)} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    YES, DELETE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete All Activities Confirmation Modal */}
          {isDeleteAllActivitiesOpen && (
            <div className="wms-modal-overlay" onClick={() => setIsDeleteAllActivitiesOpen(false)} style={{zIndex: 10000}}>
              <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px', textAlign: 'center', maxWidth: '450px' }}>
                <div style={{ 
                  fontSize: '5rem', 
                  marginBottom: '15px',
                  color: '#dc2626',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <MdDelete />
                </div>
                <h2 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Delete All Activities?</h2>
                <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.95rem' }}>
                  Are you sure you want to delete <strong>ALL {activitiesList.length} activities</strong>?
                </p>
                <div style={{
                  background: '#fef2f2',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  border: '2px solid #fecaca'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    color: '#991b1b',
                    fontWeight: '600'
                  }}>
                    ⚠️ WARNING: This will permanently delete all activity records!
                  </p>
                </div>
                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '700' }}>
                  This action cannot be undone!
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setIsDeleteAllActivitiesOpen(false)} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: '#f3f4f6', 
                      color: '#374151', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={handleDeleteAllActivities} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: '#dc2626', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                  >
                    YES, DELETE ALL
                  </button>
                </div>
              </div>
            </div>
          )}

          {(currentView === 'warehouses' || currentView === 'shipments' || currentView === 'drivers') && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-start' }}>
                <form className="wms-search-container" onSubmit={handleSearch} style={{marginBottom: 0, flex: 1}}>
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
                
                {/* Filter Toggle Button - Only show for shipments */}
                {currentView === 'shipments' && (
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    style={{
                      padding: '14px 20px',
                      background: isFilterOpen ? '#F37021' : isDark ? '#1E2126' : '#ffffff',
                      color: isFilterOpen ? '#fff' : isDark ? '#fff' : '#1f2937',
                      border: isDark ? '2px solid #343A40' : '2px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                      height: '52px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isFilterOpen) {
                        e.currentTarget.style.borderColor = '#F37021';
                        if (!isDark) e.currentTarget.style.color = '#F37021';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isFilterOpen) {
                        e.currentTarget.style.borderColor = isDark ? '#343A40' : '#e5e7eb';
                        if (!isDark) e.currentTarget.style.color = '#1f2937';
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filter
                  </button>
                )}
              </div>
              
              {/* Shipment Status Filter Buttons - Collapsible */}
              {currentView === 'shipments' && isFilterOpen && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginBottom: '30px', 
                  flexWrap: 'wrap',
                  padding: '20px',
                  background: isDark ? '#1E2126' : '#6b7280',
                  border: isDark ? '2px solid #343A40' : '2px solid #4b5563',
                  borderRadius: '8px',
                  animation: 'slideDown 0.3s ease'
                }}>
                  <style>{`
                    @keyframes slideDown {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                  <button
                    onClick={() => setShipmentFilter('All')}
                    style={{
                      padding: '10px 20px',
                      background: shipmentFilter === 'All' ? '#F37021' : isDark ? '#121417' : '#4b5563',
                      color: '#fff',
                      border: shipmentFilter === 'All' ? '2px solid #ff8c42' : '2px solid #343A40',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      if (shipmentFilter !== 'All') {
                        e.currentTarget.style.borderColor = '#F37021';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shipmentFilter !== 'All') {
                        e.currentTarget.style.borderColor = '#343A40';
                      }
                    }}
                  >
                    All Shipments
                  </button>
                  <button
                    onClick={() => setShipmentFilter('Pending')}
                    style={{
                      padding: '10px 20px',
                      background: shipmentFilter === 'Pending' ? '#ef4444' : isDark ? '#121417' : '#4b5563',
                      color: '#fff',
                      border: shipmentFilter === 'Pending' ? '2px solid #f87171' : '2px solid #343A40',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      if (shipmentFilter !== 'Pending') {
                        e.currentTarget.style.borderColor = '#ef4444';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shipmentFilter !== 'Pending') {
                        e.currentTarget.style.borderColor = '#343A40';
                      }
                    }}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setShipmentFilter('In Transit')}
                    style={{
                      padding: '10px 20px',
                      background: shipmentFilter === 'In Transit' ? '#F37021' : isDark ? '#121417' : '#4b5563',
                      color: '#fff',
                      border: shipmentFilter === 'In Transit' ? '2px solid #ff8c42' : '2px solid #343A40',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      if (shipmentFilter !== 'In Transit') {
                        e.currentTarget.style.borderColor = '#F37021';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shipmentFilter !== 'In Transit') {
                        e.currentTarget.style.borderColor = '#343A40';
                      }
                    }}
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => setShipmentFilter('Delivered')}
                    style={{
                      padding: '10px 20px',
                      background: shipmentFilter === 'Delivered' ? '#10b981' : isDark ? '#121417' : '#4b5563',
                      color: '#fff',
                      border: shipmentFilter === 'Delivered' ? '2px solid #34d399' : '2px solid #343A40',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      if (shipmentFilter !== 'Delivered') {
                        e.currentTarget.style.borderColor = '#10b981';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shipmentFilter !== 'Delivered') {
                        e.currentTarget.style.borderColor = '#343A40';
                      }
                    }}
                  >
                    Delivered
                  </button>
                </div>
              )}
            </>
          )}

          {currentView === 'dashboard' && (
            <DashboardHome 
              stats={stats}
              loadViewData={loadViewData}
              activitiesList={activitiesList}
              loadingActivities={loadingActivities}
              handleDeleteActivityClick={handleDeleteActivityClick}
              handleDeleteAllActivities={handleDeleteAllActivitiesClick}
              isActivityLogOpen={isActivityLogOpen}
              setIsActivityLogOpen={setIsActivityLogOpen}
              isUrgentBacklogOpen={isUrgentBacklogOpen}
              setIsUrgentBacklogOpen={setIsUrgentBacklogOpen}
              dashboardBacklogs={dashboardBacklogs}
              isDark={isDark}
              setIsProfileModalOpen={setIsProfileModalOpen}
            />
          )}

          {currentView !== 'dashboard' && currentView !== 'backlog' && (
            <div className="wms-card-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {currentView === 'drivers' && (
                <DriverView 
                  filteredDataList={filteredDataList}
                  setSelectedItem={setSelectedItem}
                  setIsDetailModalOpen={setIsDetailModalOpen}
                  onDetails={setSelectedItemAndOpenModal}
                />
              )}

              {currentView === 'warehouses' && (
                <WarehouseView 
                  filteredDataList={filteredDataList}
                  setSelectedItem={setSelectedItem}
                  setIsDetailModalOpen={setIsDetailModalOpen}
                  onDetails={setSelectedItemAndOpenModal}
                />
              )}

              {currentView === 'shipments' && (
                <ShipmentView 
                  filteredDataList={filteredDataList}
                  setSelectedItem={setSelectedItem}
                  setIsDetailModalOpen={setIsDetailModalOpen}
                  getStatusClass={getStatusClass}
                  onDetails={setSelectedItemAndOpenModal}
                />
              )}

              {currentView === 'about' && (
                <AboutView />
              )}
            </div>
          )}

          {currentView === 'backlog' && (
            <Backlog isDark={isDark} onTaskUpdate={() => {
                if (window.location.pathname === '/') {
                  // Re-fetch dashboard data in the background silently (RESTful, GET, credentials)
                  const loadDashboardSilently = async () => {
                    try {
                      const activityRes = await fetch('http://localhost/backend/activities', {
                        method: 'GET',
                        credentials: 'include'
                      });
                      const activityData = await activityRes.json();
                      if (activityData.success && activityData.data) {
                        setActivitiesList(activityData.data);
                      }
                      const backlogRes = await fetch('http://localhost/backend/backlog', {
                        method: 'GET',
                        credentials: 'include'
                      });
                      const backlogData = await backlogRes.json();
                      if (backlogData.success && backlogData.data) {
                        const PRIORITY_ORDER = { 'High': 1, 'Medium': 2, 'Low': 3 };
                        const pendingTasks = backlogData.data.filter(t => t.status !== 'Shipped' && t.status !== 'Completed' && t.status !== 'completed');
                        pendingTasks.sort((a, b) => (PRIORITY_ORDER[a.priority] || 4) - (PRIORITY_ORDER[b.priority] || 4));
                        setDashboardBacklogs(pendingTasks.slice(0, 3));
                      }
                    } catch (e) {
                      console.error('Silent refresh failed', e);
                    }
                  };
                  loadDashboardSilently();
                }
              }} />
          )}
        </div>
      </main>
    </div>
  );
}