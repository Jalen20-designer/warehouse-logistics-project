<?php
// backend/logistics/quick_setup.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once '../db.php';

$warehouseName = $_POST['warehouseName'] ?? null;

if (!$warehouseName) {
    echo json_encode(["success" => false, "message" => "Error: warehouseName is missing"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert Warehouse
    $stmtW = $pdo->prepare("INSERT INTO warehouses (name, location) VALUES (?, ?)");
    $stmtW->execute([$warehouseName, $_POST['location'] ?? '']);
    $warehouseId = $pdo->lastInsertId();

    // 2. Insert Driver
    $stmtD = $pdo->prepare("INSERT INTO drivers (name, license_number, vehicle_type, contact_no, license_expiry, warehouse_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtD->execute([
        $_POST['driverName'] ?? '',
        $_POST['licenseNumber'] ?? '',
        $_POST['vehicleType'] ?? '',
        $_POST['contact_no'] ?? '', 
        $_POST['licenseExpiry'] ?? null,
        $warehouseId 
    ]);
    $driverId = $pdo->lastInsertId();

    // --- FILE UPLOAD LOGIC ---
    $dbFileName = 'default_item.jpg'; // Default value kung walang inupload
    
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/'; // Umakyat ng isang folder para makita ang 'uploads'
        
        // Siguraduhin na exist ang folder
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExt = strtolower(pathinfo($_FILES['item_image']['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (in_array($fileExt, $allowedExts)) {
            // Gumawa ng unique name para walang conflict
            $newFileName = uniqid('item_') . '.' . $fileExt;
            $targetPath = $uploadDir . $newFileName;
            
            if (move_uploaded_file($_FILES['item_image']['tmp_name'], $targetPath)) {
                // MAHALAGA: Filename lang ang i-save sa DB
                $dbFileName = $newFileName;
            } else {
                // Optional: Pwedeng mag-log dito kung failed ang move
            }
        }
    }

    // 3. Insert Shipment with image (Filenname lang ang sinesave natin)
    $stmtS = $pdo->prepare("INSERT INTO shipments (item_name, quantity, warehouse_id, driver_id, shipment_date, status, item_image) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)");
    $stmtS->execute([
        $_POST['shipmentItem'] ?? '',
        $_POST['quantity'] ?? 1,
        $warehouseId,
        $driverId,
        $_POST['shipment_date'] ?? $_POST['shipmentDate'] ?? null,
        $dbFileName
    ]);

    // 4. Insert into activities table
    $action_text = "Quick Setup: Added Warehouse '$warehouseName', Driver, and Shipment.";
    $stmtA = $pdo->prepare("INSERT INTO activities (user_id, action_text, created_at) VALUES (?, ?, NOW())");
    $stmtA->execute([1, $action_text]); 

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Success! All records linked and image saved."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>