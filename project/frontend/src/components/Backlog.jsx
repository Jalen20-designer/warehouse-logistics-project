import React, { useState, useEffect } from 'react';
import { MdDelete, MdRefresh } from 'react-icons/md';
import '../styles/backlog-modern.css';

const Backlog = ({ onTaskUpdate, isDark = true }) => {
  const [tasks, setTasks] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks including auto-populated overdue shipments
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch undelivered shipments to auto-populate backlog
      const shipmentRes = await fetch('http://localhost/backend/logistics/logistics_manager.php?action=list_shipments');
      const shipmentData = await shipmentRes.json();
      
      let allTasks = [];
      
      if (shipmentData.success && shipmentData.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter undelivered shipments with overdue target dates
        const overdueShipments = shipmentData.data.filter(shipment => {
          if (shipment.status === 'Delivered') return false;
          if (!shipment.target_date) return false;
          
          const targetDate = new Date(shipment.target_date);
          targetDate.setHours(0, 0, 0, 0);
          
          return targetDate < today;
        });
        
        // Convert shipments to backlog task format
        const autoTasks = overdueShipments.map(shipment => ({
          id: `auto_${shipment.id}`,
          order_id: `SHP-${shipment.id}`,
          task_title: shipment.item_name || 'Undelivered Shipment',
          task_description: `Status: ${shipment.status} | Target: ${shipment.target_date}`,
          task_type: 'Shipping',
          priority: 'High',
          status: 'Queued',
          due_date: shipment.target_date,
          created_at: shipment.created_at,
          is_auto: true,
          shipment_id: shipment.id
        }));
        
        allTasks = autoTasks;
      }
      
      setTasks(allTasks);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const handleUpdateStatus = async (task, newStatus) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost/backend/logistics/logistics_manager.php?action=update_shipment_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: task.shipment_id, 
          status: newStatus
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update local state immediately
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
        setSuccess(`Task updated to ${newStatus}!`);
        
        if (newStatus === 'Delivered') {
          if (onTaskUpdate) onTaskUpdate();
          fetchTasks(); // Refresh backlog list
        }

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete task (remove from backlog)
  const handleDeleteTask = (taskId) => {
    setConfirmModal({
      isOpen: true,
      title: 'REMOVE FROM BACKLOG',
      message: 'Are you sure you want to remove this item from the backlog?',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoading(true);
        setError('');

        try {
          // Remove from local state immediately
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          setSuccess('Item removed from backlog!');
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          setError('Failed to remove item');
          console.error('Delete error:', err);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="backlog-container" style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '30px',
      fontFamily: 'Roboto Condensed, sans-serif'
    }}>
      <div style={{
        background: isDark ? '#1E2126' : '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        border: isDark ? '1px solid #343A40' : '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h2 style={{ 
            color: '#F37021', 
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2rem',
            letterSpacing: '2px',
            margin: 0
          }}>
            OVERDUE SHIPMENTS
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: showHistory ? '#F37021' : 'transparent',
                color: showHistory ? '#fff' : '#F37021',
                border: '2px solid #F37021',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {showHistory ? 'Hide Delivered' : 'Show Delivered'}
            </button>
            <button
              onClick={fetchTasks}
              disabled={loading}
              style={{
                background: '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <MdRefresh style={{ fontSize: '1.2rem' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: '#ef4444',
            color: '#fff',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#10b981',
            color: '#fff',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}

        {/* Tasks List */}
        {loading && tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Loading overdue shipments...
          </div>
        ) : tasks.filter(t => showHistory ? true : t.status !== 'Delivered').length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px',
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '8px',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '1.1rem' }}>
              {showHistory ? 'No delivered shipments to show.' : 'No overdue shipments. All deliveries are on track!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tasks.filter(t => showHistory ? true : t.status !== 'Delivered').map((task) => (
              <div
                key={task.id}
                className="task-card"
                style={{
                  background: isDark ? '#111827' : '#ffffff',
                  borderLeft: `5px solid ${task.status === 'Delivered' ? '#22c55e' : '#ef4444'}`,
                  borderRight: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s',
                  boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  opacity: task.status === 'Delivered' ? 0.6 : 1,
                  filter: task.status === 'Delivered' ? 'grayscale(80%)' : 'none'
                }}
              >
                {/* Left Side: Details */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#F37021', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px' }}>
                      {task.order_id}
                    </span>
                  </div>
                  <p style={{
                    margin: '0 0 6px 0',
                    color: task.status === 'Delivered' ? '#6b7280' : (isDark ? '#e5e7eb' : '#1f2937'),
                    textDecoration: task.status === 'Delivered' ? 'line-through' : 'none',
                    fontSize: '1.05rem',
                    fontWeight: '500'
                  }}>
                    {task.task_title}
                  </p>
                  {task.task_description && (
                    <p style={{
                      margin: '0 0 6px 0',
                      color: '#9ca3af',
                      fontSize: '0.85rem'
                    }}>
                      {task.task_description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      Added: {task.created_at ? new Date(task.created_at).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                    </p>
                    {task.due_date && (
                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: task.status === 'Delivered' ? '#22c55e' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        Due: {task.due_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle: Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minWidth: '150px' }}>
                  <span style={{
                    background: task.status === 'Delivered' ? '#22c55e' : '#ef4444',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {task.status === 'Delivered' ? 'DELIVERED' : 'OVERDUE'}
                  </span>
                  <span style={{
                    background: '#4b5563',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {task.task_type}
                  </span>
                </div>

                {/* Right Side: Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <select
                    value={task.status || 'Queued'}
                    onChange={(e) => handleUpdateStatus(task, e.target.value)}
                    disabled={loading}
                    style={{
                      padding: '8px 30px 8px 16px',
                      background: task.status === 'Delivered' ? (isDark ? '#064e3b' : '#d1fae5') : (isDark ? '#374151' : '#f3f4f6'),
                      color: task.status === 'Delivered' ? (isDark ? '#34d399' : '#065f46') : (isDark ? '#fff' : '#1f2937'),
                      border: isDark ? '1px solid transparent' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${isDark ? 'ffffff' : '1f2937'}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px top 50%',
                      backgroundSize: '10px auto',
                    }}
                  >
                    <option value="Queued">Queued</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={loading}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#dc2626')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#ef4444')}
                  >
                    <MdDelete style={{ fontSize: '1.1rem' }} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Count */}
        {tasks.length > 0 && (
          <div style={{
            marginTop: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '0.95rem',
            background: isDark ? '#111827' : '#ffffff',
            padding: '16px 24px',
            borderRadius: '8px',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: isDark ? '#e5e7eb' : '#1f2937' }}>Total Overdue: {tasks.length}</span>
              <span style={{ margin: '0 15px', color: isDark ? '#4b5563' : '#d1d5db' }}>|</span>
              <span style={{ color: '#ef4444', fontWeight: '500' }}>Pending: {tasks.filter(t => t.status !== 'Delivered').length}</span>
              <span style={{ margin: '0 15px', color: isDark ? '#4b5563' : '#d1d5db' }}>|</span>
              <span style={{ color: '#22c55e', fontWeight: '500' }}>Delivered: {tasks.filter(t => t.status === 'Delivered').length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: isDark ? '#1E2126' : '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            border: isDark ? '1px solid #343A40' : '1px solid #e5e7eb',
            boxShadow: isDark ? '0 20px 25px -5px rgba(0,0,0,0.5)' : '0 20px 25px -5px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#ef4444', 
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '2rem',
              letterSpacing: '1px',
              margin: '0 0 15px 0'
            }}>
              {confirmModal.title}
            </h2>
            <p style={{ color: isDark ? '#e5e7eb' : '#4b5563', fontSize: '1.05rem', margin: '0 0 30px 0', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                style={{
                  background: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmModal.onConfirm}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.3)';
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlog;
