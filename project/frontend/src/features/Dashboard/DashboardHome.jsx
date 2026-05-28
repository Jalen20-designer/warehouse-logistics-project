import '../../pages/Home.css';
import React from 'react';
import { MdLocalShipping, MdList, MdDelete, MdVisibility } from 'react-icons/md';

export default function DashboardHome({
  stats,
  loadViewData,
  activitiesList,
  loadingActivities,
  handleDeleteActivityClick,
  handleDeleteAllActivities,
  isActivityLogOpen,
  setIsActivityLogOpen,
  isUrgentBacklogOpen,
  setIsUrgentBacklogOpen,
  dashboardBacklogs,
  isDark,
  setIsProfileModalOpen
}) {
  return (
    <>
      {/* 1. STAT CARDS */}
      <div className="wms-card-grid wms-dashboard-cards">
        <div className="wms-card wms-card-clickable" onClick={() => setIsProfileModalOpen(true)}>
          <div className="wms-card-top accent"><span className="wms-label">USERS</span><h2 className="wms-value">{stats.users} Managers</h2></div>
          <div className="wms-card-bottom">Active Access <span style={{color: 'var(--wms-blue)', fontWeight: 'bold'}}>View ❯</span></div>
        </div>
        <div className="wms-card wms-card-clickable" onClick={() => loadViewData('warehouses')}>
          <div className="wms-card-top"><span className="wms-label">LOGISTICS</span><h2 className="wms-value">{stats.warehouses} Warehouses</h2></div>
          <div className="wms-card-bottom">Authorized Hubs <span style={{color: 'var(--wms-blue)', fontWeight: 'bold'}}>View ❯</span></div>
        </div>
        <div className="wms-card wms-card-clickable" onClick={() => loadViewData('shipments')}>
          < div className="wms-card-top"><span className="wms-label">OPERATIONS</span><h2 className="wms-value">{stats.shipments} Shipments</h2></div>
          <div className="wms-card-bottom">Live Tracking <span style={{color: 'var(--wms-blue)', fontWeight: 'bold'}}>View ❯</span></div>
        </div>
        <div className="wms-card wms-card-clickable" onClick={() => loadViewData('drivers')}>
          <div className="wms-card-top"><span className="wms-label">PERSONNEL</span><h2 className="wms-value">{stats.drivers} Drivers</h2></div>
          <div className="wms-card-bottom">On Duty <span style={{color: 'var(--wms-blue)', fontWeight: 'bold'}}>View ❯</span></div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', margin: '20px auto 0 auto' }}>
        <div style={{ height: '6px', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #FFB800 10px, #FFB800 20px)', marginBottom: '20px', borderRadius: '2px' }}></div>
        
        {/* 2. RECENT ACTIVITY LOG */}
        <div 
          onClick={() => setIsActivityLogOpen(!isActivityLogOpen)}
          style={{ background: isDark ? '#1E2126' : '#ffffff', padding: '20px 30px', borderRadius: '8px', border: isDark ? '2px solid #343A40' : '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActivityLogOpen ? '15px' : '0' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <MdLocalShipping style={{ fontSize: '1.8em', color: '#F37021' }} />
            <div>
              <h2 style={{ color: 'var(--wms-blue)', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', letterSpacing: '3px', margin: 0 }}>RECENT ACTIVITY LOG</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>{activitiesList.length} activities recorded</p>
            </div>
          </div>
          <div style={{ color: '#F37021', transform: isActivityLogOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 0.3s' }}>▼</div>
        </div>

        {isActivityLogOpen && (
          <div className="activity-log-container" style={{ background: isDark ? '#1E2126' : '#ffffff', padding: '30px', borderRadius: '8px', border: isDark ? '2px solid #343A40' : '2px solid #e5e7eb', maxHeight: '500px', overflowY: 'auto' }}>
            {activitiesList.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>No activities yet.</p> : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                  <button 
                    onClick={handleDeleteAllActivities}
                    className="wms-details-btn-compact" 
                    style={{
                      background:'#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                  >
                    <MdDelete style={{ fontSize: '1.1em' }} />
                    DELETE ALL
                  </button>
                </div>
                <div className="activity-log-timeline">
                  {activitiesList.map((activity, index) => (
                    <div key={activity.id || index} className="activity-log-item">
                      {index !== activitiesList.length - 1 && <div className="activity-log-line" style={{ background: isDark ? '#343A40' : '#e5e7eb' }}></div>}
                      <div className="activity-log-dot" style={{ border: isDark ? '3px solid #1E2126' : '3px solid #ffffff' }}></div>
                      <div className="activity-log-content" style={{ 
                        background: isDark ? 'rgba(52, 58, 64, 0.3)' : '#f9fafb',
                        borderColor: isDark ? '#343A40' : '#e5e7eb',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div className="activity-log-icon" style={{ background: isDark ? '#111827' : '#ffffff', padding: '10px', borderRadius: '8px', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <MdLocalShipping style={{ color: '#F37021', fontSize: '1.4rem' }} />
                          </div>
                          <div>
                            <p className="activity-log-action" style={{ margin: 0, color: isDark ? '#e5e7eb' : '#374151', fontSize: '0.95rem', lineHeight: '1.4' }}>{activity.action_text}</p>
                            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.75rem' }}>{activity.created_at ? new Date(activity.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteActivityClick(activity)} 
                          className="wms-details-btn-compact" 
                          style={{
                            background: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            padding: '6px 12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. URGENT BACKLOG TASKS */}
        <div style={{ marginTop: '30px' }}>
          <div 
            onClick={() => setIsUrgentBacklogOpen(!isUrgentBacklogOpen)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#1E2126' : '#ffffff', padding: '20px 30px', borderRadius: '8px', border: isDark ? '2px solid #343A40' : '2px solid #e5e7eb', marginBottom: isUrgentBacklogOpen ? '15px' : '0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <MdList style={{ fontSize: '1.8em', color: '#ef4444' }} />
              <div>
                <h2 style={{ color: 'var(--wms-blue)', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.6rem', letterSpacing: '3px', margin: 0 }}>URGENT BACKLOG TASKS</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>Top {dashboardBacklogs.length} pending tasks</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); loadViewData('backlog'); }} 
                className="wms-details-btn-compact" 
                style={{borderColor:'#F37021', color:'#F37021', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px'}}
                title="View All"
              >
                <MdVisibility size={18} />
              </button>
              <div style={{ color: '#ef4444', transform: isUrgentBacklogOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 0.3s' }}>▼</div>
            </div>
          </div>

          {isUrgentBacklogOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dashboardBacklogs.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>Everything is on schedule!</p> : (
                dashboardBacklogs.map((task) => (
                  <div key={task.id} style={{ background: isDark ? '#1E2126' : '#ffffff', borderLeft: `4px solid ${task.priority === 'High' ? '#ef4444' : '#f97316'}`, padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#F37021', fontWeight: 'bold' }}>{task.order_id || '#ORD-UNKNOWN'}</span>
                      <p style={{ margin: 0, color: isDark ? '#e5e7eb' : '#374151' }}>{task.task_title}</p>
                    </div>
                    <span style={{ background: task.priority === 'High' ? '#ef4444' : '#f97316', color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>{task.priority}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}