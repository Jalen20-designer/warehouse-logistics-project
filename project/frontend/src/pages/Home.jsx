import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

// IMPORTS
import jeanImg from '../assets/jean.jpg';
import klarisseImg from '../assets/klarisse.jpg';
import matthewImg from '../assets/matthew.jpg';

export default function Home() {
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

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) navigate('/login');
    else {
      setUser(JSON.parse(loggedInUser));
      loadViewData('dashboard');
    }
    // Responsive sidebar toggle
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
    let endpoint = view === 'dashboard' ? 'get_dashboard_stats.php' : 
                   view === 'warehouses' ? 'get_warehouses.php' : 'get_shipments.php';

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

  // Improved filtered data for search
  const filteredDataList = (currentView === 'warehouses' || currentView === 'shipments') && searchTerm
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
        }
        return false;
      })
    : dataList;

  const handleSearch = (e) => {
    e.preventDefault();
    // No-op: filtering is live, but you can trigger fetch here if needed
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
        <div className="wms-sidebar-profile">
          <div className="wms-profile-circle-initials">{user.username.charAt(0).toUpperCase()}</div>
          <h3 className="wms-profile-name">{user.username.toUpperCase()}</h3>
          <p className="wms-profile-role">SYSTEM MANAGER</p>
        </div>
        <nav className="wms-sidebar-nav">
          <div className={`wms-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => loadViewData('dashboard')}>📊 Dashboard</div>
          <div className={`wms-nav-item ${currentView === 'warehouses' ? 'active' : ''}`} onClick={() => loadViewData('warehouses')}>🏢 Warehouses</div>
          <div className={`wms-nav-item ${currentView === 'shipments' ? 'active' : ''}`} onClick={() => loadViewData('shipments')}>🚚 Shipments</div>
          <div className={`wms-nav-item ${currentView === 'about' ? 'active' : ''}`} onClick={() => setCurrentView('about')}>👥 About Us</div>
        </nav>
        <button
          className="wms-logout-box"
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
        >
          <span className="wms-logout-arrow">&#8592;</span>
        </button>

        {/* Custom Logout Modal */}
        {showLogoutModal && (
          <div className="wms-logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="wms-logout-modal" onClick={e => e.stopPropagation()}>
              <div className="wms-logout-modal-header">Log Out</div>
              <div className="wms-logout-modal-body">Are you sure you want to log out?</div>
              <div className="wms-logout-modal-actions">
                <button className="wms-logout-modal-btn wms-logout-ok" onClick={() => { localStorage.clear(); navigate('/login'); }}>OK</button>
                <button className="wms-logout-modal-btn wms-logout-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="wms-main-content" style={{position:'relative'}}>
        {loading && (
          <div className="wms-loading-overlay wms-loading-overlay-maincontent">
            <div className="wms-loading-spinner"></div>
            <div className="wms-loading-text">Loading...</div>
          </div>
        )}
        <header className="wms-top-header">
          <button className="wms-hamburger" onClick={() => setIsSidebarOpen(v => !v)}>☰</button>
          <div className="wms-header-date">📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </header>

        <div className="wms-content-padding">
          {/* FIXED VIEW HEADER - Profile badge pinned to right */}
          <div className="wms-view-header">
            <h1 className="wms-view-title">{currentView.toUpperCase()} OVERVIEW</h1>
            <div style={{ flex: 1 }}></div> {/* ITO YUNG MAGTUTULAK SA BADGE SA DULO */}
            
            {currentView === 'dashboard' && (
                <div className="wms-user-badge" onClick={() => setIsProfileModalOpen(true)}>
                    <div className="wms-badge-icon">{user.username.charAt(0).toUpperCase()}</div>
                    <div className="wms-badge-text">
                        <span className="wms-badge-name">{user.username}</span>
                        <span className="wms-badge-role">MANAGER ▼</span>
                    </div>
                </div>
            )}
          </div>



          {/* ADMIN NODE MODAL */}
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

          {/* DETAIL MODAL */}
          {isDetailModalOpen && selectedItem && (
            <div className="wms-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden', maxWidth: '450px' }}>
                    <div style={{ background: '#111827', padding: '40px', textAlign: 'center' }}>
                      <img src={currentView === 'warehouses' ? "https://cdn-icons-png.flaticon.com/512/2271/2271068.png" : "https://cdn-icons-png.flaticon.com/512/1554/1554561.png"} alt="Icon" style={{ height: '100px', filter: 'brightness(0) invert(1)' }}/>
                    </div>
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '800' }}>RECORD #00{selectedItem.id}</span>
                      <h2 style={{ margin: '10px 0' }}>{selectedItem.name || selectedItem.item_name}</h2>
                      {currentView === 'warehouses' ? (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Location: {selectedItem.location}</p>
                      ) : (
                        <>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Status: {selectedItem.status}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Warehouse: {selectedItem.warehouse_name}</p>
                          {/* Optionally show quantity if available */}
                          {selectedItem.quantity !== undefined && (
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Stock: {selectedItem.quantity}</p>
                          )}
                        </>
                      )}
                      <button onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', marginTop: '25px', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>ACKNOWLEDGE</button>
                    </div>
                </div>
            </div>
          )}


          {/* SEARCH BAR for Warehouses/Shipments */}
          {(currentView === 'warehouses' || currentView === 'shipments') && (
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
            {/* CARDS */}
            {currentView === 'dashboard' && (
              <>
                <div className="wms-card"><div className="wms-card-top accent"><span className="wms-label">USERS</span><h2 className="wms-value">{stats.users} Managers</h2></div><div className="wms-card-bottom">Active Access</div></div>
                <div className="wms-card"><div className="wms-card-top"><span className="wms-label">LOGISTICS</span><h2 className="wms-value">{stats.warehouses} Warehouses</h2></div><div className="wms-card-bottom">Authorized Hubs</div></div>
                <div className="wms-card"><div className="wms-card-top"><span className="wms-label">OPERATIONS</span><h2 className="wms-value">{stats.shipments} Shipments</h2></div><div className="wms-card-bottom">Live Tracking</div></div>
              </>
            )}

            {(currentView === 'warehouses' || currentView === 'shipments') && filteredDataList.map((item, index) => (
              <div key={index} className="wms-card">
                <div className="wms-card-top">
                  <div><span className="wms-label">#00{item.id}</span><h2 className="wms-item-name">{item.name || item.item_name}</h2><p className="wms-item-sub">{item.location || item.status}</p></div>
                  <div className="wms-card-logo-circle">{item.name ? '🏢' : '🚚'}</div>
                </div>
                <div className="wms-card-bottom">
                   <span>{item.warehouse_name || 'System Verified'}</span>
                   <button className="wms-details-btn" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>Details ❯</button>
                </div>
              </div>
            ))}

            {/* ABOUT US */}
            {currentView === 'about' && (
                <div className="wms-about-container">
                    {[
                        {
                          name: 'Jean Carlos',
                          role: 'Project Lead',
                          img: jeanImg,
                          desc: 'Jean is the main architect and project lead, ensuring the system is robust and scalable.'
                        },
                        {
                          name: 'Klarisse Borlado',
                          role: 'UI Designer',
                          img: klarisseImg,
                          desc: 'Klarisse crafts the user experience and visual design for a modern, intuitive interface.'
                        },
                        {
                          name: 'Matthew Francia',
                          role: 'Database Admin',
                          img: matthewImg,
                          desc: 'Matthew manages the database, making sure all data is secure and optimized.'
                        }
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