import React from 'react';
import { MdLocationCity, MdPerson, MdEdit, MdLocalShipping as MdTruck } from 'react-icons/md';

export default function DetailModal({
  isOpen,
  onClose,
  selectedItem,
  currentView,
  isDark,
  getStatusClass,
  isEditingDriver,
  setIsEditingDriver,
  editedDriver,
  setEditedDriver,
  handleUpdateDriver,
  handleStatusUpdate,
  handleDeleteClick
}) {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="wms-modal-overlay" onClick={onClose}>
      <div className="wms-modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', overflow: 'hidden', background: isDark ? '#fff' : '#9ca3af', width: currentView === 'shipments' ? '420px' : '480px', maxWidth: '90vw' }}>
        <div style={{ background: isDark ? '#111827' : '#6b7280', padding: '40px', textAlign: 'center' }}>
          {currentView === 'warehouses' ? (
            <MdLocationCity style={{ fontSize: '80px', color: '#fff' }} />
          ) : currentView === 'drivers' ? (
            <MdPerson style={{ fontSize: '80px', color: '#fff' }} />
          ) : (
            <MdTruck style={{ fontSize: '80px', color: '#fff' }} />
          )}
        </div>
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: isDark ? '#F37021' : '#1f2937', fontWeight: '800', display: 'block', marginBottom: '10px' }}>
            RECORD #00{(currentView === 'warehouses' ? selectedItem.id : (selectedItem.warehouse_id || selectedItem.id)).toString().padStart(2, '0')}
          </span>
          <h2 style={{ margin: '10px 0 20px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', padding: '0 10px' }}>
            {currentView === 'shipments' ? selectedItem.item_name : selectedItem.name}
          </h2>

          {/* Warehouse Details */}
          {currentView === 'warehouses' && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px' }}>
              Location: {selectedItem.location}
            </p>
          )}

          {/* Driver Details */}
          {currentView === 'drivers' && (
            <>
              {!isEditingDriver ? (
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
                  <button 
                    onClick={() => {
                      setIsEditingDriver(true);
                      setEditedDriver({
                        contact_no: selectedItem.contact_no || '',
                        vehicle_type: selectedItem.vehicle_type || '',
                        license_expiry: selectedItem.license_expiry || ''
                      });
                    }}
                    style={{
                      width: '100%',
                      marginTop: '15px',
                      padding: '12px',
                      background: '#F37021',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E67E22'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F37021'}
                  >
                    <MdEdit style={{ fontSize: '1.2em' }} />
                    EDIT DRIVER INFO
                  </button>
                </>
              ) : (
                <div style={{ marginTop: '15px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Vehicle Type</label>
                    <input 
                      type="text" 
                      value={editedDriver.vehicle_type} 
                      onChange={(e) => setEditedDriver({...editedDriver, vehicle_type: e.target.value})}
                      placeholder="Enter vehicle type"
                      list="vehicle-types-edit"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F37021'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <datalist id="vehicle-types-edit">
                      <option value="Motorcycle / Scooter" />
                      <option value="Sedan / Courier Car" />
                      <option value="Pickup Truck" />
                      <option value="Cargo Van" />
                      <option value="Step Van" />
                      <option value="Box Truck" />
                      <option value="Flatbed Truck" />
                      <option value="Refrigerated Truck" />
                      <option value="Semi-Truck (Tractor-Trailer)" />
                      <option value="Tanker Truck" />
                    </datalist>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Contact Number</label>
                    <input 
                      type="text" 
                      value={editedDriver.contact_no} 
                      onChange={(e) => setEditedDriver({...editedDriver, contact_no: e.target.value})}
                      placeholder="Enter contact number"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F37021'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>License Expiry</label>
                    <input 
                      type="date" 
                      value={editedDriver.license_expiry} 
                      onChange={(e) => setEditedDriver({...editedDriver, license_expiry: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F37021'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      onClick={() => {
                        setIsEditingDriver(false);
                        setEditedDriver({ contact_no: '', vehicle_type: '', license_expiry: '' });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                    >
                      CANCEL
                    </button>
                    <button 
                      onClick={handleUpdateDriver}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                    >
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Shipment Details */}
          {currentView === 'shipments' && (
            <>
              {selectedItem.item_image && (
                <div style={{
                  marginBottom:'15px',
                  borderRadius:'4px',
                  overflow:'hidden',
                  border:'2px solid #343A40',
                  position:'relative',
                  height:'220px'
                }}>
                  <img 
                    src={selectedItem.item_image !== 'default_item.jpg' 
                      ? `http://localhost/backend/uploads/${selectedItem.item_image}` 
                      : 'http://localhost/backend/uploads/default_item.jpg'}
                    alt={selectedItem.item_name}
                    style={{
                      width:'100%',
                      height:'100%',
                      objectFit:'cover',
                      objectPosition:'center'
                    }}
                    onError={(e) => {
                      e.target.src = 'http://localhost/backend/uploads/default_item.jpg';
                    }}
                  />
                  <div style={{
                    position:'absolute',
                    top:0,
                    left:0,
                    right:0,
                    height:'4px',
                    background:'repeating-linear-gradient(45deg, #000, #000 8px, #FFB800 8px, #FFB800 16px)'
                  }}></div>
                  <div className={`status-stamp ${getStatusClass(selectedItem.status)}`} style={{top:'20px',right:'20px'}}>
                    {selectedItem.status}
                  </div>
                </div>
              )}
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '8px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>
                <strong style={{color:'#1f2937'}}>Status:</strong> 
                <span className={`status-stamp ${getStatusClass(selectedItem.status)}`} style={{
                  position:'relative',
                  display:'inline-block',
                  marginLeft:'10px',
                  padding:'4px 12px',
                  fontSize:'0.8rem',
                  transform:'rotate(0deg)',
                  top:'0',
                  right:'0'
                }}>
                  {selectedItem.status}
                </span>
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>Quantity: {selectedItem.quantity || 'N/A'}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>Date of Shipment: {selectedItem.shipment_date || 'N/A'}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>Target Date: {selectedItem.target_date || 'Not Set'}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>Warehouse: {selectedItem.warehouse_name}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '5px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', padding: '0 10px', textAlign: 'left' }}>Driver: {selectedItem.driver_name ? selectedItem.driver_name : 'Unassigned'}</p>
              
              {/* Quick Status Update Buttons */}
              <div style={{ marginTop: '25px', padding: '0 10px' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Quick Status Update</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleStatusUpdate('Pending')}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '90px',
                      maxWidth: '120px',
                      padding: '10px 12px',
                      background: selectedItem.status === 'Pending' ? '#ef4444' : '#b91c1c',
                      color: '#fff',
                      border: selectedItem.status === 'Pending' ? '2px solid #f87171' : '2px solid transparent',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedItem.status === 'Pending' ? '#ef4444' : '#b91c1c';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('In Transit')}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '90px',
                      maxWidth: '120px',
                      padding: '10px 12px',
                      background: selectedItem.status === 'In Transit' ? '#F37021' : '#E67E22',
                      color: '#fff',
                      border: selectedItem.status === 'In Transit' ? '2px solid #ff8c42' : '2px solid transparent',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F37021';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedItem.status === 'In Transit' ? '#F37021' : '#E67E22';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    In Transit
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('Delivered')}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '90px',
                      maxWidth: '120px',
                      padding: '10px 12px',
                      background: selectedItem.status === 'Delivered' ? '#10b981' : '#059669',
                      color: '#fff',
                      border: selectedItem.status === 'Delivered' ? '2px solid #34d399' : '2px solid transparent',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#10b981';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedItem.status === 'Delivered' ? '#10b981' : '#059669';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
            {currentView === 'warehouses' ? (
              <>
                <button onClick={onClose} style={{ flex: 1, padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CANCEL</button>
                <button onClick={handleDeleteClick} style={{ flex: 1, padding: '15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>DELETE RECORD</button>
              </>
            ) : currentView === 'drivers' && !isEditingDriver ? (
              <button onClick={onClose} style={{ width: '100%', padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CLOSE</button>
            ) : currentView !== 'drivers' ? (
              <button onClick={onClose} style={{ width: '100%', padding: '15px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>CLOSE</button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
