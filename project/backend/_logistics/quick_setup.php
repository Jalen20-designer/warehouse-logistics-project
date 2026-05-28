<?php
// Disable HTML error output
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../encryption_helper.php';

$warehouseName = $_POST['warehouseName'] ?? null;

if (!$warehouseName) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Error: warehouseName is missing"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert Warehouse
    $stmtW = $pdo->prepare("INSERT INTO warehouses (name, location) VALUES (?, ?)");
    $stmtW->execute([$warehouseName, $_POST['location'] ?? '']);
    $warehouseId = $pdo->lastInsertId();

    // 2. Prepare driver data with validation
    $driverName = $_POST['driverName'] ?? '';
    $contactNo = $_POST['contact_no'] ?? $_POST['contactNumber'] ?? '';
    $vehicleType = $_POST['vehicleType'] ?? '';
    $licenseNumber = $_POST['licenseNumber'] ?? '';
    $licenseExpiry = $_POST['licenseExpiry'] ?? null;

    // Validate required fields
    if (empty($driverName)) {
        throw new Exception("Driver name is required");
    }
    if (empty($contactNo)) {
        throw new Exception("Contact number is required");
    }
    if (empty($licenseNumber)) {
        throw new Exception("License number is required");
    }

    // Encrypt sensitive fields
    $encryptedContact = encryptField($contactNo);
    $encryptedLicense = encryptField($licenseNumber);

    // Check if encryption failed
    if ($encryptedContact === null) {
        throw new Exception("Failed to encrypt contact number");
    }
    if ($encryptedLicense === null) {
        throw new Exception("Failed to encrypt license number");
    }

    // 3. Insert Driver with encrypted data
    $stmtD = $pdo->prepare("INSERT INTO drivers (name, contact_no, vehicle_type, license_number, license_expiry, warehouse_id, status) VALUES (?, ?, ?, ?, ?, ?, 'Available')");
    $stmtD->execute([
        $driverName,
        $encryptedContact,
        $vehicleType,
        $encryptedLicense,
        $licenseExpiry,
        $warehouseId
    ]);
    $driverId = $pdo->lastInsertId();

    // 4. Handle file upload
    $dbFileName = 'default_item.jpg';
    
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/';
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExt = strtolower(pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (in_array($fileExt, $allowedExts)) {
            $newFileName = uniqid('item_') . '.' . $fileExt;
            $targetPath = $uploadDir . $newFileName;
            
            if (move_uploaded_file($_FILES['item_image']['tmp_name'], $targetPath)) {
                $dbFileName = $newFileName;
            }
        }
    }

    // 5. Insert Shipment
    $stmtS = $pdo->prepare("INSERT INTO shipments (item_name, quantity, warehouse_id, driver_id, shipment_date, status, item_image) VALUES (?, ?, ?, ?, ?, 'In Transit', ?)");
    $stmtS->execute([
        $_POST['shipmentItem'] ?? '',
        $_POST['quantity'] ?? 1,
        $warehouseId,
        $driverId,
        $_POST['shipment_date'] ?? null,
        $dbFileName
    ]);

    // 6. Insert into activities table
    $userId = $_POST['user_id'] ?? 1;
    $action_text = "Quick Setup: Added Warehouse '$warehouseName', Driver, and Shipment.";
    $stmtA = $pdo->prepare("INSERT INTO activities (user_id, action_text, created_at) VALUES (?, ?, NOW())");
    $stmtA->execute([$userId, $action_text]);

    $pdo->commit();
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Success! All records linked and image saved."]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
