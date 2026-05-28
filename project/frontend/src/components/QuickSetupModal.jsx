import '../pages/Home.css';
import './QuickSetupModal.css';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MdClose, MdUpload, MdImage, MdWarehouse, MdPerson, MdLocalShipping } from 'react-icons/md';

const QuickSetupModal = ({ isOpen, onClose, onSuccess }) => {
  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const { isDark } = useTheme();

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
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Add CSS animations on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `;
    if (!document.head.querySelector('style[data-quick-setup]')) {
      style.setAttribute('data-quick-setup', 'true');
      document.head.appendChild(style);
    }
  }, []);

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
    if (name === 'contactNumber') {
      // Only allow numbers and limit to 11 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'licenseNumber') {
      // Only allow numbers for license number
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
        setErrorMsg(`Please fill in all required fields. Missing: ${field}`);
        return;
      }
    }

    // Validate license expiry year is present year or later
    if (formData.licenseExpiry) {
      const selectedYear = new Date(formData.licenseExpiry).getFullYear();
      const currentYear = new Date().getFullYear();
      if (selectedYear < currentYear) {
        setErrorMsg('License expiry year must be this year or later.');
        return;
      }
    }

    setIsSubmitting(true);
    setProcessingStep('Validating data...');

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
      // No endpoint field needed for RESTful API

      // Debug: Log FormData contents
      console.log('Submitting form data...');
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // Send POST request - CRUCIAL: DO NOT set Content-Type header
      // Browser will automatically set multipart/form-data with boundary
      setProcessingStep('Creating warehouse...');
      const response = await fetch('http://localhost/backend/quick_setup', {
        method: 'POST',
        body: submitData
      });

      setProcessingStep('Processing response...');
      const data = await response.json();

      if (data.success) {
        // Show success message
        setProcessingStep('Setup completed!');
        setShowSuccess(true);
        setErrorMsg('');
        
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
        
        // Call success callback to trigger parent re-fetch
        if (onSuccess) onSuccess();
        
        // Close modal after 2.5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setProcessingStep('');
          setIsSubmitting(false);
          onClose();
        }, 2500);
      } else {
        setIsSubmitting(false);
        console.error('Backend error:', data.message);
        setErrorMsg(data.message || 'Quick setup failed');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Request failed:', error);
      setErrorMsg(`Request failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setProcessingStep('');
    }
  };

  // ✅ CONDITIONAL RENDERING MOVED TO RETURN STATEMENT
  if (!isOpen) return null;

  return (
    <div className="wms-modal-overlay" onClick={onClose}>
      {/* Processing Loading Overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#1f2937',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid #374151'
          }}>
            {/* Spinner */}
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              border: '4px solid #374151',
              borderTop: '4px solid #F37021',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            
            {/* Processing Text */}
            <p style={{
              color: '#e5e7eb',
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: '0 0 10px 0',
              letterSpacing: '0.5px'
            }}>
              {processingStep || 'Processing...'}
            </p>
            
            {/* Animated dots */}
            <p style={{
              color: '#9ca3af',
              fontSize: '1.5rem',
              margin: 0,
              letterSpacing: '4px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              ●●●
            </p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold">
          ✅ Quick Setup Completed Successfully!
        </div>
      )}
      
      <div
        className="setup-modal-content wms-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '90vw',
          maxWidth: 600,
          minWidth: 'min(350px, 98vw)',
          background: isDark ? '#2a2a2a' : '#fff',
          color: isDark ? '#fff' : '#222',
          padding: 0,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          opacity: isSubmitting ? 0.5 : 1,
          pointerEvents: isSubmitting ? 'none' : 'auto',
          transition: 'all 0.3s ease',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.7)'
            : '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        {/* Responsive style for modal padding */}
        <style>{`
          @media (max-width: 600px) {
            .setup-modal-content.wms-modal-content .setup-form-body {
              padding: 16px !important;
            }
          }
        `}</style>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '1.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Close"
          disabled={isSubmitting}
        >
          ×
        </button>

        {/* Header */}
        <div
          className="setup-modal-header"
          style={{
            background: isDark ? '#111827' : '#f3f4f6',
            padding: '24px 32px',
            borderBottom: isDark ? '1px solid #222' : '1px solid #eee'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5em',
              fontWeight: 800,
              letterSpacing: 1,
              color: isDark ? '#fff' : '#222'
            }}
          >
            Quick Setup
          </h2>
          <p
            style={{
              margin: '8px 0 0 0',
              color: isDark ? '#9ca3af' : '#555',
              fontSize: '0.9em'
            }}
          >
            Fill out this form to setup your nodes.
          </p>
        </div>

        {/* Form */}
        {errorMsg && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '18px',
            fontWeight: 600,
            textAlign: 'center',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span style={{ fontSize: '1.3em' }}>⚠️</span>
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg('')} style={{ position: 'absolute', right: 12, top: 8, background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', fontSize: '1.2em', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form-body" style={{ padding: '32px' }}>
          {/* Warehouse Section */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" htmlFor="warehouseName" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Warehouse Name <span style={{ color: 'red' }}>*</span></label>
            <input
              id="warehouseName"
              className="wms-search-input"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #111',
                borderRadius: '6px',
                outline: 'none',
                background: isDark ? '#23272f' : '#fff',
                color: isDark ? '#fff' : '#222',
                fontSize: '1em',
                marginBottom: '10px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#F37021'}
              onBlur={e => e.target.style.borderColor = '#111'}
              type="text"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleInputChange}
              placeholder="Enter warehouse name"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" htmlFor="location" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Location <span style={{ color: 'red' }}>*</span></label>
            <input
              id="location"
              className="wms-search-input"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              style={{ width: '100%', marginBottom: '10px' }}
              required
            />
          </div>

          {/* Driver Section */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" htmlFor="driverName" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Driver Name <span style={{ color: 'red' }}>*</span></label>
            <input
              id="driverName"
              className="wms-search-input"
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              placeholder="Enter driver name"
              style={{ width: '100%', marginBottom: '10px' }}
              required
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="licenseNumber" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>License Number <span style={{ color: 'red' }}>*</span></label>
              <input
                id="licenseNumber"
                className="wms-search-input"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="License number"
                style={{ width: '100%', marginBottom: '10px' }}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="vehicleType" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Vehicle Type <span style={{ color: 'red' }}>*</span></label>
              <input
                id="vehicleType"
                className="wms-search-input"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                placeholder="Select or type vehicle type"
                list="vehicle-types"
                style={{ width: '100%', marginBottom: '10px' }}
                required
              />
              <datalist id="vehicle-types">
                {vehicleTypes.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="contactNumber" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Contact Number <span style={{ color: 'red' }}>*</span></label>
              <input
                id="contactNumber"
                className="wms-search-input"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="09XX XXX XXXX"
                style={{ width: '100%', marginBottom: '10px' }}
                maxLength={11}
                pattern="[0-9]{11}"
                inputMode="numeric"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>License Expiry <span style={{ color: 'red' }}>*</span></label>
              <input
                className="wms-search-input"
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                style={{ width: '100%', marginBottom: '10px' }}
                required
              />
            </div>
          </div>

          {/* Shipment Section */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Shipment Item <span style={{ color: 'red' }}>*</span></label>
            <input
              className="wms-search-input"
              type="text"
              name="shipmentItem"
              value={formData.shipmentItem}
              onChange={handleInputChange}
              placeholder="Enter item name"
              style={{ width: '100%', marginBottom: '10px' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Item Image</label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="file"
                name="item_image"
                accept="image/*"
                onChange={handleFileChange}
                id="item-image-input"
                style={{ display: 'none' }}
              />
              <label
                htmlFor="item-image-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px',
                  background: isDark ? '#121417' : '#f3f4f6',
                  border: isDark ? '2px solid #343A40' : '2px solid #d1d5db',
                  borderRadius: '4px',
                  color: isDark ? '#9ca3af' : '#222',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F37021';
                  e.currentTarget.style.color = '#F37021';
                  e.currentTarget.style.background = isDark ? '#23272f' : '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? '#343A40' : '#d1d5db';
                  e.currentTarget.style.color = isDark ? '#9ca3af' : '#222';
                  e.currentTarget.style.background = isDark ? '#121417' : '#f3f4f6';
                }}
              >
                <MdUpload style={{ fontSize: '1.5rem', color: isDark ? '#9ca3af' : '#222' }} />
                <span>{formData.item_image ? 'Change Image' : 'Upload Image'}</span>
              </label>
              {formData.item_image && (
                <div style={{ marginTop: '10px', padding: '8px', background: '#1E2126', borderRadius: '4px', border: '1px solid #FFB800', color: '#FFB800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdImage style={{ fontSize: '1.2rem' }} />
                  <span>{formData.item_image.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Quantity <span style={{ color: 'red' }}>*</span></label>
            <input
              className="wms-search-input"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              style={{ width: '100%', marginBottom: '10px' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label" style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Date of Shipment <span style={{ color: 'red' }}>*</span></label>
            <input
              className="wms-search-input"
              type="date"
              name="shipment_date"
              value={formData.shipment_date}
              onChange={handleInputChange}
              style={{ width: '100%', marginBottom: '10px' }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '15px',
              background: isSubmitting ? '#9ca3af' : '#F37021',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 'bold',
              fontSize: '1.1em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              letterSpacing: 1,
              boxShadow: isSubmitting ? 'none' : '0 4px 0 #C85A1A, 0 6px 8px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'PROCESSING...' : 'ACTIVATE SETUP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickSetupModal;
