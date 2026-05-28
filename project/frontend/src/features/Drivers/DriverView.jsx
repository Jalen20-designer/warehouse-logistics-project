import React from 'react';
import { MdPerson, MdPhone, MdCreditCard } from 'react-icons/md';
import { MdLocalShipping as MdTruck } from 'react-icons/md';

export default function DriverView({ filteredDataList, setSelectedItem, setIsDetailModalOpen }) {
  return (
    <>
      {filteredDataList.length === 0 ? (
        <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
      ) : (
        filteredDataList.map((item, index) => (
          <div key={index} className="wms-card wms-dark-card">
            <div className="wms-card-body-dark" style={{ paddingTop: '18px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span className="wms-label-dark">#00{(item.warehouse_id || item.id).toString().padStart(2, '0')}</span>
                  <h2 className="wms-item-name-dark" style={{ marginBottom: '6px' }}>{item.name}</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdTruck style={{ fontSize: '1.2em' }} /> 
                    {item.vehicle_type ? <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{item.vehicle_type}</span> : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending Verification</span>}
                  </p>
                </div>
                <MdPerson style={{ fontSize: '1.5em', color: '#F37021', marginLeft: '10px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', paddingTop: '8px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdPhone style={{ fontSize: '1.2em', color: '#9ca3af' }} /> 
                  <span style={{ color: '#9ca3af' }}>Contact:</span> 
                  {item.contact_no ? (
                    <span style={{ color: '#e5e7eb', fontWeight: '600' }}>{item.contact_no}</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdCreditCard style={{ fontSize: '1.2em', color: '#9ca3af' }} /> 
                  <span style={{ color: '#9ca3af' }}>Expiry:</span> 
                  {item.license_expiry ? (
                    <span style={{ color: '#e5e7eb', fontWeight: '600' }}>{item.license_expiry}</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending</span>
                  )}
                </div>
              </div>
            </div>
            <div className="wms-card-footer-dark">
              <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600' }}>{item.status}</span>
              <button className="wms-details-btn-compact" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>DETAILS</button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
