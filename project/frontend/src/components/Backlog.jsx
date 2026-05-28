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

  // 1. FIXED: Fetch tasks using clean GET (No body)
  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const shipmentRes = await fetch('http://localhost/backend/shipments', {
        method: 'GET',
        credentials: 'include', // Para sa PHP Session
        headers: { 'Content-Type': 'application/json' }
        // Body removed: GET requests cannot have a body
      });
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
          status: shipment.status,
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

  // 2. FIXED: Update task status using RESTful PATCH
  const handleUpdateStatus = async (task, newStatus) => {
    setLoading(true);
    setError('');

    try {
      // URL format: /shipments/{id} | Method: PATCH
      const res = await fetch(`http://localhost/backend/shipments/${task.shipment_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: newStatus
          // action removed: URL and method now define the action
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
        setSuccess(`Task updated to ${newStatus}!`);
        
        if (newStatus === 'Delivered') {
          if (onTaskUpdate) onTaskUpdate();
          fetchTasks(); 
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

  // Delete task (local state update only in your original logic)
  const handleDeleteTask = (taskId) => {
    setConfirmModal({
      isOpen: true,
      title: 'REMOVE FROM BACKLOG',
      message: 'Are you sure you want to remove this item from the backlog?',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        setSuccess('Item removed from backlog!');
        setTimeout(() => setSuccess(''), 3000);
      }
    });
  };

  // --- UI RENDER PART (No changes to styles/JSX) ---
  return (
    <div className="backlog-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px', fontFamily: 'Roboto Condensed, sans-serif' }}>
      <div style={{ background: isDark ? '#1E2126' : '#ffffff', borderRadius: '12px', padding: '30px', border: isDark ? '1px solid #343A40' : '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ color: '#F37021', fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', letterSpacing: '2px', margin: 0 }}>OVERDUE SHIPMENTS</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background: showHistory ? '#F37021' : 'transparent', color: showHistory ? '#fff' : '#F37021', border: '2px solid #F37021', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
              {showHistory ? 'Hide Delivered' : 'Show Delivered'}
            </button>
            <button onClick={fetchTasks} disabled={loading} style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdRefresh /> Refresh
            </button>
          </div>
        </div>

        {error && <div style={{ background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ background: '#10b981', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

        {loading && tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
        ) : tasks.filter(t => showHistory ? true : t.status !== 'Delivered').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', background: isDark ? '#111827' : '#ffffff', borderRadius: '8px', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }}>
            <p style={{ color: '#9ca3af', margin: 0 }}>{showHistory ? 'No history to show.' : 'No overdue shipments. All deliveries are on track!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tasks.filter(t => showHistory ? true : t.status !== 'Delivered').map((task) => (
              <div key={task.id} style={{ background: isDark ? '#111827' : '#ffffff', borderLeft: `5px solid ${task.status === 'Delivered' ? '#22c55e' : '#ef4444'}`, borderRight: isDark ? '1px solid #374151' : '1px solid #e5e7eb', borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb', borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', opacity: task.status === 'Delivered' ? 0.6 : 1 }}>
                <div style={{ flex: '1 1 300px' }}>
                  <span style={{ color: '#F37021', fontWeight: 'bold' }}>{task.order_id}</span>
                  <p style={{ margin: '5px 0', color: isDark ? '#fff' : '#1f2937', fontWeight: '500' }}>{task.task_title}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{task.task_description}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <select value={task.status} onChange={(e) => handleUpdateStatus(task, e.target.value)} style={{ padding: '8px', borderRadius: '6px', background: isDark ? '#374151' : '#f3f4f6', color: isDark ? '#fff' : '#1f2937' }}>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button onClick={() => handleDeleteTask(task.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ background: isDark ? '#1E2126' : '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ color: '#ef4444' }}>{confirmModal.title}</h2>
            <p>{confirmModal.message}</p>
            <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ marginRight: '10px' }}>CANCEL</button>
            <button onClick={confirmModal.onConfirm} style={{ background: '#ef4444', color: '#fff' }}>CONFIRM</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlog;