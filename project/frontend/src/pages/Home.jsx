import React, { useEffect, useState } from 'react';
import { MdDashboard, MdWarehouse, MdLocalShipping, MdGroup, MdCalendarToday, MdLogout, MdLocationCity, MdLocalShipping as MdTruck, MdPerson } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

// IMPORTS
import jeanImg from '../assets/jean.jpg';
import klarisseImg from '../assets/klarisse.jpg';
import matthewImg from '../assets/matthew.jpg';

export default function Home() {
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

  // Quick Setup Modal State (Moved inside the component)
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [quickSetup, setQuickSetup] = useState({
    warehouse_name: '',
    warehouse_location: '',
    driver_name: '',
    shipment_item: '',
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
    try {
      const res = await fetch('http://localhost/backend/quick_setup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickSetup),
      });
      const data = await res.json();
      if (data.success) {
        setIsQuickSetupOpen(false);
        setQuickSetup({ warehouse_name: '', warehouse_location: '', driver_name: '', shipment_item: '', shipment_status: 'In Transit' });
        loadViewData(currentView); // refresh current view
        loadViewData('dashboard'); // refresh stats
      } else {
        alert(data.message || 'Quick setup failed.');
      }
    } catch (err) {
      alert('Quick setup failed.');
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
      const res = await fetch(`http://localhost/backend/${endpoint}`);
      const data = await res.json();
      if (data.success) {
        if (view === 'dashboard') {
            setStats(data.stats);
            const userRes = await fetch('http://localhost/backend/get_all_users.php');
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

  if (!user) return null;

  return (
    <div className="wms-main-layout">
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
            style={{marginLeft:'auto',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:'bold',fontSize:'1em',cursor:'pointer',boxShadow:'0 2px 8px #0001'}} 
            onClick={()=>setIsQuickSetupOpen(true)}
          >+ Quick Setup</button>
        </header>

        {/* QUICK SETUP MODAL */}
        {isQuickSetupOpen && (
          <div className="wms-modal-overlay" onClick={()=>setIsQuickSetupOpen(false)}>
            <div className="wms-modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:700,minWidth:400,background:'#fff',color:'#181f2a',padding:0}}>
              <div style={{padding:'24px 32px',borderBottom:'1px solid #eee',background:'#fff'}}>
                <h2 style={{margin:0,fontSize:'1.3em',fontWeight:800,letterSpacing:1,color:'#181f2a'}}>Quick Setup Table</h2>
              </div>
              <div style={{padding:'32px'}}>
                <table style={{width:'100%',borderCollapse:'collapse',background:'none'}}>
                  <thead>
                    <tr style={{background:'#f3f4f6',color:'#181f2a'}}>
                      <th style={{padding:'12px 10px',fontWeight:700}}>Warehouse</th>
                      <th style={{padding:'12px 10px',fontWeight:700}}>Driver</th>
                      <th style={{padding:'12px 10px',fontWeight:700}}>Shipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{padding:'10px'}}>
                        <input name="warehouse_name" value={quickSetup.warehouse_name} onChange={handleQuickInput} placeholder="Name" style={{width:'90%',padding:'8px',borderRadius:6,border:'1px solid #bbb',background:'#fff',color:'#181f2a',marginBottom:6}} />
                        <input name="warehouse_location" value={quickSetup.warehouse_location} onChange={handleQuickInput} placeholder="Location" style={{width:'90%',padding:'8px',borderRadius:6,border:'1px solid #bbb',background:'#fff',color:'#181f2a'}} />
                      </td>
                      <td style={{padding:'10px'}}>
                        <input name="driver_name" value={quickSetup.driver_name} onChange={handleQuickInput} placeholder="Driver Name" style={{width:'90%',padding:'8px',borderRadius:6,border:'1px solid #bbb',background:'#fff',color:'#181f2a'}} />
                      </td>
                      <td style={{padding:'10px'}}>
                        <input name="shipment_item" value={quickSetup.shipment_item} onChange={handleQuickInput} placeholder="Item Name" style={{width:'90%',padding:'8px',borderRadius:6,border:'1px solid #bbb',background:'#fff',color:'#181f2a',marginBottom:6}} />
                        <select name="shipment_status" value={quickSetup.shipment_status} onChange={handleQuickInput} style={{width:'90%',padding:'8px',borderRadius:6,border:'1px solid #bbb',background:'#fff',color:'#181f2a'}}>
                          {shipmentStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{marginTop:32,display:'flex',justifyContent:'flex-end',gap:12}}>
                  <button onClick={()=>setIsQuickSetupOpen(false)} style={{padding:'10px 18px',background:'#f3f4f6',color:'#181f2a',border:'none',borderRadius:8,fontWeight:'bold',cursor:'pointer'}}>Cancel</button>
                  <button onClick={handleQuickSave} style={{padding:'10px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontWeight:'bold',cursor:'pointer'}}>Save</button>
                </div>
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
                  <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden', maxWidth: '500px' }}>
                      <div style={{ background: '#f8fafc', padding: '30px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                          <div style={{ fontSize: '3.5rem' }}>🛡️</div>
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
                <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden', maxWidth: '450px' }}>
                    <div style={{ background: '#111827', padding: '40px', textAlign: 'center' }}>
                      {currentView === 'warehouses' ? (
                        <MdLocationCity style={{ fontSize: '80px', color: '#fff' }} />
                      ) : (
                        <MdTruck style={{ fontSize: '80px', color: '#fff' }} />
                      )}
                    </div>
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '800' }}>RECORD #00{selectedItem.id}</span>
                      <h2 style={{ margin: '10px 0' }}>{currentView === 'shipments' ? selectedItem.item_name : selectedItem.name}</h2>
                      {currentView === 'warehouses' ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Location: {selectedItem.location}</p>
                      ) : (
                        <>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Status: {selectedItem.status}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Warehouse: {selectedItem.warehouse_name}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Driver: {selectedItem.driver_name ? selectedItem.driver_name : 'Unassigned'}</p>
                        </>
                      )}
                      <button onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', marginTop: '25px', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>ACKNOWLEDGE</button>
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

            {currentView === 'drivers' && (
              filteredDataList.length === 0 ? (
                <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
              ) : (
                filteredDataList.map((item, index) => (
                  <div key={index} className="wms-card">
                    <div className="wms-card-top">
                      <div>
                        <span className="wms-label">#00{item.id}</span>
                        <h2 className="wms-item-name">{item.name}</h2>
                      </div>
                      <div className="wms-card-logo-circle">
                        <MdPerson style={{ fontSize: '1.7em', color: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="wms-card-bottom">
                      <span>{item.status}</span>
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
                        <MdLocationCity style={{ fontSize: '1.7em', color: '#2563eb' }} />
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
                        <span className="wms-label">#00{item.id}</span>
                        <h2 className="wms-item-name">{item.item_name}</h2>
                      </div>
                      <div className="wms-card-logo-circle">
                        <MdTruck style={{ fontSize: '1.7em', color: '#2563eb' }} />
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
                        { name: 'Jean Carlos', role: 'Project Lead', img: jeanImg, desc: 'Jean is the main architect and project lead.' },
                        { name: 'Klarisse Borlado', role: 'UI Designer', img: klarisseImg, desc: 'Klarisse crafts the user experience.' },
                        { name: 'Matthew Francia', role: 'Database Admin', img: matthewImg, desc: 'Matthew manages the database.' }
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