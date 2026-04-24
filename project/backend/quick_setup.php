<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

try {
    // Start PDO transaction
    $pdo->beginTransaction();

    // Handle image upload
    $imageName = 'default_item.jpg';
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        $fileType = $_FILES['item_image']['type'];
        
        if (in_array($fileType, $allowedTypes)) {
            $fileExtension = pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION);
            $imageName = 'shipment_' . time() . '_' . uniqid() . '.' . $fileExtension;
            $uploadPath = __DIR__ . '/uploads/' . $imageName;
            
            if (!move_uploaded_file($_FILES['item_image']['tmp_name'], $uploadPath)) {
                throw new Exception('Failed to upload image');
            }
        } else {
            throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.');
        }
    }

    // 1. Insert Warehouse (columns: id, name, location)
    // Mapping: $_POST['warehouse_name'] -> name column
    $stmtW = $pdo->prepare("INSERT INTO warehouses (name, location) VALUES (?, ?)");
    $stmtW->execute([$_POST['warehouse_name'], $_POST['warehouse_location']]);
    $warehouseId = $pdo->lastInsertId();

    // 2. Insert Driver (columns: id, warehouse_id, name, status, license_number, vehicle_type, contact_no, license_expiry)
    // Mapping: $_POST['driver_name'] -> name column
    $stmtD = $pdo->prepare("INSERT INTO drivers (warehouse_id, name, status, license_number, vehicle_type, contact_no, license_expiry) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmtD->execute([
        $warehouseId,
        $_POST['driver_name'],
        'On Delivery',
        $_POST['licenseNo'],
        $_POST['vehicleType'],
        $_POST['contactNo'],
        $_POST['licenseExpiry']
    ]);
    $driverId = $pdo->lastInsertId();

    // 3. Insert Shipment (columns: id, item_name, item_image, status, warehouse_id, quantity, driver_id)
    // Mapping: $_POST['shipment_item'] -> item_name column
    $stmtS = $pdo->prepare("INSERT INTO shipments (item_name, item_image, status, warehouse_id, quantity, driver_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtS->execute([
        $_POST['shipment_item'],
        $imageName,
        $_POST['shipment_status'],
        $warehouseId,
        $_POST['shipment_quantity'],
        $driverId
    ]);

    // 4. Log Activity
    $userId = isset($_POST['user_id']) ? $_POST['user_id'] : 1;
    $username = isset($_POST['username']) ? $_POST['username'] : 'System';
    $actionText = "User {$username} activated a Quick Setup for {$_POST['shipment_item']}";
    
    $stmtA = $pdo->prepare("INSERT INTO activities (user_id, action_text, created_at) VALUES (?, ?, NOW())");
    $stmtA->execute([$userId, $actionText]);

    // Commit transaction
    $pdo->commit();
    echo json_encode(["success" => true]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    
    // Delete uploaded image if transaction fails (but keep default_item.jpg)
    if (isset($imageName) && $imageName !== 'default_item.jpg' && file_exists(__DIR__ . '/uploads/' . $imageName)) {
        unlink(__DIR__ . '/uploads/' . $imageName);
    }
    
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>