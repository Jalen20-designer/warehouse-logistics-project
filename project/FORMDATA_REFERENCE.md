# FormData Implementation - Quick Reference

## Updated Files

### Frontend: Home.jsx
- **Function**: `handleQuickSave`
- **Location**: Line ~75-145

### Backend: quick_setup.php
- **Location**: `backend/quick_setup.php`
- **Updated**: Field mapping to accept frontend keys

## Field Mapping

### Frontend → Backend

| Frontend Key (FormData) | Backend Key ($_POST) | Database Column |
|-------------------------|---------------------|-----------------|
| `warehouseName` | `warehouse_name` | `warehouses.name` |
| `location` | `warehouse_location` | `warehouses.location` |
| `driverName` | `driver_name` | `drivers.name` |
| `licenseNumber` | `licenseNo` | `drivers.license_number` |
| `vehicleType` | `vehicleType` | `drivers.vehicle_type` |
| `contactNumber` | `contactNo` | `drivers.contact_no` |
| `licenseExpiry` | `licenseExpiry` | `drivers.license_expiry` |
| `shipmentItem` | `shipment_item` | `shipments.item_name` |
| `quantity` | `shipment_quantity` | `shipments.quantity` |
| `status` | `shipment_status` | `shipments.status` |
| `shipment_date` | `shipment_date` | `shipments.shipment_date` |
| `item_image` | `item_image` | `shipments.item_image` |

## Frontend Code

```javascript
const handleQuickSave = async () => {
  // Validation
  if (!warehouse_name || !warehouse_location || ...) {
    showNotif('Please fill in all required fields', 'error');
    return;
  }

  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append all fields with EXACT keys
    formData.append('warehouseName', warehouse_name);
    formData.append('location', warehouse_location);
    formData.append('driverName', driver_name);
    formData.append('licenseNumber', licenseNo);
    formData.append('vehicleType', vehicleType);
    formData.append('contactNumber', contactNo);
    formData.append('licenseExpiry', licenseExpiry);
    formData.append('shipmentItem', shipment_item);
    formData.append('quantity', shipment_quantity);
    formData.append('status', shipment_status);
    formData.append('shipment_date', shipment_date);
    
    // Append image file if selected
    if (quickSetup.item_image) {
      formData.append('item_image', quickSetup.item_image);
    }
    
    // Append user info
    if (user && user.id) {
      formData.append('user_id', user.id);
      formData.append('username', user.username);
    }

    // Debug log
    console.log('Sending payload:', Object.fromEntries(formData));

    // Send POST request - NO Content-Type header
    const res = await fetch('http://localhost/backend/quick_setup.php', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    // Handle response...
  } catch (err) {
    console.error('Quick setup error:', err);
  }
};
```

## Backend Code

```php
<?php
// Field mapping - accepts both frontend and backend keys
$fieldMapping = [
    'warehouseName' => 'warehouse_name',
    'location' => 'warehouse_location',
    'driverName' => 'driver_name',
    'licenseNumber' => 'licenseNo',
    'vehicleType' => 'vehicleType',
    'contactNumber' => 'contactNo',
    'licenseExpiry' => 'licenseExpiry',
    'shipmentItem' => 'shipment_item',
    'quantity' => 'shipment_quantity',
    'status' => 'shipment_status',
    'shipment_date' => 'shipment_date'
];

// Normalize $_POST
$normalizedPost = [];
foreach ($fieldMapping as $frontendKey => $backendKey) {
    if (isset($_POST[$frontendKey])) {
        $normalizedPost[$backendKey] = $_POST[$frontendKey];
    }
}
$_POST = array_merge($_POST, $normalizedPost);

// Now use backend keys throughout the code
$_POST['warehouse_name']
$_POST['warehouse_location']
// etc...
?>
```

## Key Points

### ✅ DO:
- Use `FormData()` for file uploads
- Let browser set Content-Type header automatically
- Use exact field keys as specified
- Log payload for debugging: `console.log('Sending payload:', Object.fromEntries(formData))`
- Validate all required fields before sending

### ❌ DON'T:
- Don't set `'Content-Type': 'application/json'` header
- Don't use `JSON.stringify()` with FormData
- Don't manually set multipart boundary
- Don't forget to append the file object

## Debugging

### Check Console Log

When you submit the form, you should see in browser console:

```javascript
Sending payload: {
  warehouseName: "Test Warehouse",
  location: "Test City",
  driverName: "John Doe",
  licenseNumber: "ABC123",
  vehicleType: "Cargo Van",
  contactNumber: "1234567890",
  licenseExpiry: "2025-12-31",
  shipmentItem: "Test Item",
  quantity: "10",
  status: "In Transit",
  shipment_date: "2024-01-15",
  item_image: "[object File]",
  user_id: "1",
  username: "admin"
}
```

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit the form
4. Click on `quick_setup.php` request
5. Check **Headers** tab:
   - Content-Type should be: `multipart/form-data; boundary=----WebKitFormBoundary...`
6. Check **Payload** tab:
   - Should show all form fields
   - Should show file name for item_image

### Check PHP Backend

Add this at the top of `quick_setup.php` for debugging:

```php
// Debug: Log received data
file_put_contents(__DIR__ . '/debug.log', 
    "POST: " . print_r($_POST, true) . "\n" . 
    "FILES: " . print_r($_FILES, true) . "\n\n", 
    FILE_APPEND
);
```

## Testing

### Test Data

```javascript
{
  warehouseName: "Test Warehouse",
  location: "Test City",
  driverName: "John Doe",
  licenseNumber: "ABC123456",
  vehicleType: "Cargo Van",
  contactNumber: "1234567890",
  licenseExpiry: "2025-12-31",
  shipmentItem: "Test Item",
  quantity: "10",
  status: "In Transit",
  shipment_date: "2024-01-15"
}
```

### Expected Response

**Success:**
```json
{
  "success": true,
  "message": "Quick Setup completed",
  "data": {
    "warehouse_id": 5,
    "driver_id": 8,
    "shipment_id": 12
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Missing required field: warehouseName"
}
```

## Common Issues

### Issue: "Missing required field"
**Cause:** Field key mismatch between frontend and backend
**Solution:** Check console.log output, verify exact keys match

### Issue: Image not uploading
**Cause:** Content-Type header set incorrectly
**Solution:** Remove any Content-Type header, let browser set it

### Issue: Empty $_POST in PHP
**Cause:** Content-Type header set to application/json
**Solution:** Remove Content-Type header completely

### Issue: File shows as [object File] in console
**Normal:** This is expected. The actual file is sent in the request

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

## File Upload Limits

Check PHP settings:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_file_uploads = 20
```

## Security

- ✅ File type validation (JPG, PNG, GIF, WEBP only)
- ✅ Prepared statements (SQL injection prevention)
- ✅ Transaction support (data consistency)
- ✅ Error handling (no sensitive data exposure)
- ✅ CORS configured properly

## Next Steps

1. Test the form with all fields filled
2. Check browser console for payload log
3. Verify network request shows multipart/form-data
4. Check database for new records
5. Verify image uploaded to backend/uploads/
6. Test error handling (missing fields, invalid file type)
