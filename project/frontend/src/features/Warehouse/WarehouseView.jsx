import React from 'react';
import { MdLocationCity } from 'react-icons/md';

export default function WarehouseView({ filteredDataList, setSelectedItem, setIsDetailModalOpen }) {
  return (
    <>
      {filteredDataList.length === 0 ? (
        <div style={{width:'100%',textAlign:'center',color:'#6b7280',marginTop:40,fontSize:'1.1em',gridColumn:'1/-1'}}>No records found.</div>
      ) : (
        filteredDataList.map((item, index) => (
          <div key={index} className="wms-card wms-dark-card">
            <div className="wms-card-body-dark" style={{ paddingTop: '18px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <span className="wms-label-dark">#00{item.id}</span>
                  <h2 className="wms-item-name-dark">{item.name}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>{item.location}</p>
                </div>
                <MdLocationCity style={{ fontSize: '1.5em', color: '#F37021', marginLeft: '10px' }} />
              </div>
            </div>
            <div className="wms-card-footer-dark">
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{item.warehouse_name || 'System Verified'}</span>
              <button className="wms-details-btn-compact" onClick={() => {setSelectedItem(item); setIsDetailModalOpen(true);}}>DETAILS</button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
