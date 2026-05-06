import '../pages/Home.css';
import React, { useState } from 'react';
import { MdClose, MdUpload, MdImage, MdWarehouse, MdPerson, MdLocalShipping } from 'react-icons/md';

const QuickSetupModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    warehouseName: '',
    location: '',
    driverName: '',
    licenseNumber: '',
    vehicleType: '',
    contactNumber: '',
    licenseExpiry: '',
    shipmentItem: '',
    quantity: '',
    shipment_date: '',
    item_image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const vehicleTypes = [
    'Motorcycle / Scooter',
    'Sedan / Courier Car',
    'Pickup Truck',
    'Cargo Van',
    'Step Van',
    'Box Truck',
    'Flatbed Truck',
    'Refrigerated Truck',
    'Semi-Truck (Tractor-Trailer)',
    'Tanker Truck'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, GIF, or WEBP)');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      console.log('File selected:', file.name, file.type, file.size);
      
      setFormData(prev => ({
        ...prev,
        item_image: file
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields (all fields with red asterisk)
    const requiredFields = [
      'warehouseName', 'location', 'driverName', 'licenseNumber',
      'vehicleType', 'contactNumber', 'licenseExpiry', 'shipmentItem',
      'quantity', 'shipment_date'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        alert(`Please fill in all required fields. Missing: ${field}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const submitData = new FormData();
      
      // Append all form fields - keys must match PHP backend expectations
      submitData.append('warehouseName', formData.warehouseName.trim());
      submitData.append('location', formData.location.trim());
      submitData.append('driverName', formData.driverName.trim());
      submitData.append('licenseNumber', formData.licenseNumber.trim());
      submitData.append('vehicleType', formData.vehicleType.trim());
      submitData.append('contact_no', formData.contactNumber.trim());
      submitData.append('licenseExpiry', formData.licenseExpiry);
      submitData.append('shipmentItem', formData.shipmentItem.trim());
      submitData.append('quantity', formData.quantity);
      submitData.append('status', 'In Transit');
      submitData.append('shipment_date', formData.shipment_date);
      
      // Append image file if selected - CRITICAL: Must be File object
      if (formData.item_image && formData.item_image instanceof File) {
        console.log('Appending image file:', formData.item_image.name, formData.item_image.type);
        submitData.append('item_image', formData.item_image, formData.item_image.name);
      } else if (formData.item_image) {
        console.warn('item_image is not a File object:', typeof formData.item_image);
      }
      
      // Add user info for activity logging (get from localStorage or props)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        submitData.append('user_id', user.id);
        submitData.append('username', user.username);
      }

      // Debug: Log FormData contents
      console.log('Submitting form data...');
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // Send POST request - CRUCIAL: DO NOT set Content-Type header
      // Browser will automatically set multipart/form-data with boundary
      const response = await fetch('http://localhost/backend/logistics/quick_setup.php', {
        method: 'POST',
        body: submitData
        // NO headers property - let browser handle Content-Type
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          warehouseName: '',
          location: '',
          driverName: '',
          licenseNumber: '',
          vehicleType: '',
          contactNumber: '',
          licenseExpiry: '',
          shipmentItem: '',
          quantity: '',
          shipment_date: '',
          item_image: null
        });
        setImagePreview(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Call success callback
        if (onSuccess) onSuccess();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      } else {
        console.error('Backend error:', data.message);
        alert(`Error: ${data.message || 'Quick setup failed'}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert(`Request failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wms-modal-overlay" onClick={onClose}>
      {/* Success Alert */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold">
          ✅ Quick Setup Completed Successfully!
        </div>
      )}
      
      <div className="setup-modal-content wms-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:600,minWidth:400,background:'#2a2a2a',color:'#fff',padding:0,maxHeight:'90vh',overflowY:'auto',position:'relative'}}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position:'absolute',
            top:'15px',
            right:'15px',
            background:'#dc2626',
            color:'#fff',
            border:'none',
            borderRadius:'50%',
            width:'35px',
            height:'35px',
            fontSize:'1.3rem',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            zIndex:10,
            transition:'all 0.2s',
            boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Close"
          disabled={isSubmitting}
        >
          ×
        </button>

        {/* Header */}
        <div className="setup-modal-header" style={{background:'#111827',padding:'24px 32px',borderBottom:'1px solid #eee'}}>
          <h2 style={{margin:0,fontSize:'1.5em',fontWeight:800,letterSpacing:1,color:'#fff'}}>Quick Setup</h2>
          <p style={{margin:'8px 0 0 0',color:'#9ca3af',fontSize:'0.9em'}}>Fill out this form to setup your nodes.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="setup-form-body" style={{padding:'32px'}}>
          {/* Warehouse Section */}
          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Warehouse Name <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="text"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleInputChange}
              placeholder="Enter warehouse name"
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Location <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          {/* Driver Section */}
          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Driver Name <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              placeholder="Enter driver name"
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          <div className="form-row" style={{display:'flex',gap:'15px',marginBottom:'15px'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>License Number <span style={{color:'red'}}></span></label>
              <input
                className="wms-search-input"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="License number"
                style={{width:'100%',marginBottom:'10px'}}
                required
              />
            </div>

            <div className="form-group" style={{flex:1}}>
              <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Vehicle Type <span style={{color:'red'}}></span></label>
              <input
                className="wms-search-input"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                placeholder="Select or type vehicle type"
                list="vehicle-types"
                style={{width:'100%',marginBottom:'10px'}}
                required
              />
              <datalist id="vehicle-types">
                {vehicleTypes.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-row" style={{display:'flex',gap:'15px',marginBottom:'15px'}}>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Contact Number <span style={{color:'red'}}></span></label>
              <input
                className="wms-search-input"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Contact number"
                style={{width:'100%',marginBottom:'10px'}}
                required
              />
            </div>

            <div className="form-group" style={{flex:1}}>
              <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>License Expiry <span style={{color:'red'}}></span></label>
              <input
                className="wms-search-input"
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                style={{width:'100%',marginBottom:'10px'}}
                required
              />
            </div>
          </div>

          {/* Shipment Section */}
          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Shipment Item <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="text"
              name="shipmentItem"
              value={formData.shipmentItem}
              onChange={handleInputChange}
              placeholder="Enter item name"
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Item Image</label>
            <div style={{position:'relative',marginBottom:'10px'}}>
              <input
                type="file"
                name="item_image"
                accept="image/*"
                onChange={handleFileChange}
                id="item-image-input"
                style={{display:'none'}}
              />
              <label
                htmlFor="item-image-input"
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'10px',
                  width:'100%',
                  padding:'12px',
                  background:'#121417',
                  border:'2px solid #343A40',
                  borderRadius:'4px',
                  color:'#9ca3af',
                  cursor:'pointer',
                  transition:'all 0.3s ease',
                  fontSize:'0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F37021';
                  e.currentTarget.style.color = '#F37021';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#343A40';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <MdUpload style={{fontSize:'1.5rem'}} />
                <span>{formData.item_image ? 'Change Image' : 'Upload Image'}</span>
              </label>
              {formData.item_image && (
                <div style={{marginTop:'10px',padding:'8px',background:'#1E2126',borderRadius:'4px',border:'1px solid #FFB800',color:'#FFB800',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'8px'}}>
                  <MdImage style={{fontSize:'1.2rem'}} />
                  <span>{formData.item_image.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{marginBottom:'15px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Quantity <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          <div className="form-group" style={{marginBottom:'25px'}}>
            <label className="form-label" style={{display:'block',fontWeight:600,marginBottom:'8px'}}>Date of Shipment <span style={{color:'red'}}></span></label>
            <input
              className="wms-search-input"
              type="date"
              name="shipment_date"
              value={formData.shipment_date}
              onChange={handleInputChange}
              style={{width:'100%',marginBottom:'10px'}}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{width:'100%',padding:'15px',background:'#F37021',color:'#fff',border:'none',borderRadius:4,fontWeight:'bold',fontSize:'1.1em',cursor:'pointer',letterSpacing:1,boxShadow:'0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)',textTransform:'uppercase',transition:'all 0.2s'}}
          >
            {isSubmitting ? 'ACTIVATING SETUP...' : 'ACTIVATE SETUP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickSetupModal;
