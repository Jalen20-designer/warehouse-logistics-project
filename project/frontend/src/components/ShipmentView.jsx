import React from 'react';
import { MdLocalShipping as MdTruck } from 'react-icons/md';

export default function ShipmentView({ filteredDataList, setSelectedItem, setIsDetailModalOpen, getStatusClass }) {
  return (
    <>
      {filteredDataList.length === 0 ? (
        <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
      ) : (
        filteredDataList.map((item, index) => {
          const imageUrl = item.item_image 
            ? `http://localhost/backend/uploads/${item.item_image}` 
            : 'http://localhost/backend/uploads/default_item.jpg';
          
          const statusClass = getStatusClass(item.status);
          
          return (
            <div key={index} className="wms-card wms-shipment-card-dark">
              <div className="wms-shipment-image-container-compact">
                <img 
                  src={imageUrl}
                  alt={item.item_name}
                  className="wms-shipment-image"
                  onError={(e) => {
                    e.target.src = 'http://localhost/backend/uploads/default_item.jpg';
                  }}
                />
                <div className="wms-shipment-image-overlay"></div>
                {/* Glassmorphism Status Badge */}
                <div className={`status-badge-glass ${statusClass}`}>
                  {item.status}
                </div>
              </div>
              <div className="wms-card-body-dark">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <span className="wms-label-dark">#00{(item.warehouse_id || item.id).toString().padStart(2, '0')}</span>
                    <h2 className="wms-item-name-dark">{item.item_name}</h2>
                  </div>
                  <MdTruck style={{ fontSize: '1.5em', color: '#F37021', marginLeft: '10px' }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Qty: <span style={{ color: '#e5e7eb', fontWeight: '600' }}>{item.quantity || 'N/A'}</span></p>
              </div>
              <div className="wms-card-footer-dark">
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Driver: <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{item.driver_name || 'Unassigned'}</span></span>
                <button className="wms-details-btn-compact" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>DETAILS</button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
