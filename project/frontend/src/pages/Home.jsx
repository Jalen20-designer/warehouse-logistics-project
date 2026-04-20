import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// IMPORT OF PICTURES
import jeanImg from '../assets/jean.jpg';
import klarisseImg from '../assets/klarisse.jpg';
import matthewImg from '../assets/matthew.jpg';

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: { width: '260px', background: '#1f2937', color: 'white', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' },
  navSection: { flexGrow: 1 },
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
  navLink: { display: 'block', padding: '0.8rem', color: '#d1d5db', textDecoration: 'none', borderRadius: '4px', marginBottom: '0.5rem', cursor: 'pointer', transition: '0.3s' },
  navLinkActive: { background: '#2563eb', color: 'white' },
  logoutBtn: { padding: '0.8rem', color: '#f87171', cursor: 'pointer', borderTop: '1px solid #374151', marginTop: 'auto' },
  
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { textAlign: 'left', padding: '12px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb', fontSize: '0.85rem', color: '#374151' },
  td: { padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#4b5563' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' },

  // CENTERED ABOUT US STYLES
  aboutGrid: { display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px', flexWrap: 'wrap' },
  memberCard: { background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '240px' },
  avatar: { 
    width: '120px', 
    height: '120px', 
    borderRadius: '50%', 
    marginBottom: '20px', 
    marginLeft: 'auto', 
    marginRight: 'auto', 
    border: '4px solid #2563eb',
    display: 'block',
    objectFit: 'cover' 
  }
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, warehouses: 0, shipments: 0 });
  const [usersList, setUsersList] = useState([]); 
  const [dataList, setDataList] = useState([]);   
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) navigate('/login');
    else {
        setUser(JSON.parse(loggedInUser));
        loadDashboardContent(); 
    }
  }, [navigate]);

  const loadDashboardContent = async () => {
    try {
      const resStats = await fetch('http://localhost/backend/get_dashboard_stats.php');
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats);

      const resUsers = await fetch('http://localhost/backend/get_all_users.php');
      const dataUsers = await resUsers.json();
      if (dataUsers.success) setUsersList(dataUsers.users);
    } catch (err) { console.error("Load error"); }
  };

  const loadViewData = async (view) => {
    setCurrentView(view);
    let endpoint = view === 'warehouses' ? 'get_warehouses.php' : 'get_shipments.php';
    try {
      const res = await fetch(`http://localhost/backend/${endpoint}`);
      const data = await res.json();
      if (data.success) setDataList(data.data);
    } catch (err) { console.error("View error"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#60a5fa' }}>Warehouse LMS</h2>
        <div style={styles.navSection}>
          <div style={{ ...styles.navLink, ...(currentView === 'dashboard' ? styles.navLinkActive : {}) }} onClick={() => { setCurrentView('dashboard'); loadDashboardContent(); }}>📊 Dashboard</div>
          <div style={{ ...styles.navLink, ...(currentView === 'warehouses' ? styles.navLinkActive : {}) }} onClick={() => loadViewData('warehouses')}>🏢 Warehouses</div>
          <div style={{ ...styles.navLink, ...(currentView === 'shipments' ? styles.navLinkActive : {}) }} onClick={() => loadViewData('shipments')}>🚚 Shipments</div>
          <div style={{ ...styles.navLink, ...(currentView === 'about' ? styles.navLinkActive : {}) }} onClick={() => setCurrentView('about')}>👥 About Us</div>
        </div>
        <div style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout System</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {currentView === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h1>Dashboard Overview</h1>
              <div style={{ color: '#6b7280' }}>User: <b>{user.username}</b> <span style={{...styles.badge, background:'#def7ec', color:'#03543f'}}>Manager</span></div>
            </header>
            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>REGISTERED USERS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.users}</div>
                </div>
                <div style={styles.card}>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>ACTIVE WAREHOUSES</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.warehouses}</div>
                </div>
                <div style={styles.card}>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>TOTAL SHIPMENTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{stats.shipments}</div>
                </div>
            </div>
            <div style={styles.card}>
              <h3 style={{ marginBottom: '10px' }}>Registered Accounts</h3>
              <table style={styles.table}>
                <thead>
                  <tr><th style={styles.th}>ID</th><th style={styles.th}>Username</th><th style={styles.th}>Email Address</th><th style={styles.th}>Status</th></tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td style={styles.td}>#{u.id}</td><td style={styles.td}><b>{u.username}</b></td><td style={styles.td}>{u.email}</td><td style={styles.td}><span style={{...styles.badge, background:'#def7ec', color:'#03543f'}}>Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {currentView === 'warehouses' && (
          <div style={styles.card}>
            <h2>Warehouse Registry</h2>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Warehouse Name</th><th style={styles.th}>Location</th></tr></thead>
              <tbody>
                {dataList.map(w => (
                  <tr key={w.id}><td style={styles.td}>#{w.id}</td><td style={styles.td}><b>{w.name}</b></td><td style={styles.td}>{w.location}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'shipments' && (
          <div style={styles.card}>
            <h2>Shipment Tracking</h2>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Item Name</th><th style={styles.th}>Destination</th><th style={styles.th}>Status</th></tr></thead>
              <tbody>
                {dataList.map(s => (
                  <tr key={s.id}>
                    <td style={styles.td}>#{s.id}</td><td style={styles.td}><b>{s.item_name}</b></td><td style={styles.td}>{s.warehouse_name}</td>
                    <td style={styles.td}><span style={{ ...styles.badge, background: s.status === 'Delivered' ? '#def7ec' : '#fef3c7', color: s.status === 'Delivered' ? '#03543f' : '#92400e' }}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. ABOUT US VIEW WITH IMAGES */}
        {currentView === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Our Development Team</h1>
              <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '50px' }}>The creative minds behind the Warehouse Logistics Management System.</p>
              <div style={styles.aboutGrid}>
                {/* JEAN */}
                <div style={styles.memberCard}>
                  <img src={jeanImg} alt="Jean" style={styles.avatar} />
                  <h4 style={{ margin: '10px 0 5px 0' }}>Jean Lanierod Carlos</h4>
                  <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>Project Lead</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Full-Stack Developer</p>
                </div>
                {/* KLARISSE */}
                <div style={styles.memberCard}>
                  <img src={klarisseImg} alt="Klarisse" style={styles.avatar} />
                  <h4 style={{ margin: '10px 0 5px 0' }}>Klarisse Anne Borlado</h4>
                  <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>UI/UX Designer</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Frontend Specialist</p>
                </div>
                {/* MATTHEW */}
                <div style={styles.memberCard}>
                  <img src={matthewImg} alt="Matthew" style={styles.avatar} />
                  <h4 style={{ margin: '10px 0 5px 0' }}>Matthew Francia</h4>
                  <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>Database Admin</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Backend Support</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}