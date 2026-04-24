<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $pdo->beginTransaction();

    // 1. I-save ang Warehouse
    $stmtW = $pdo->prepare("INSERT INTO warehouses (name, location) VALUES (?, ?)");
    $stmtW->execute([$data['warehouse_name'], $data['warehouse_location']]);
    $warehouseId = $pdo->lastInsertId();

    // 2. I-save ang Driver
    $stmtD = $pdo->prepare("INSERT INTO drivers (name, status, license_number, vehicle_type, contact_no, license_expiry, warehouse_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmtD->execute([
        $data['driver_name'], 
        'On Delivery',
        $data['licenseNo'],
        $data['vehicleType'],
        $data['contactNo'],
        $data['licenseExpiry'],
        $warehouseId
    ]);
    $driverId = $pdo->lastInsertId();

    // 3. I-save ang Shipment (gamit ang IDs ng dalawa sa itaas)
    $stmtS = $pdo->prepare("INSERT INTO shipments (item_name, quantity, status, warehouse_id, driver_id) VALUES (?, ?, ?, ?, ?)");
    $stmtS->execute([$data['shipment_item'], $data['shipment_quantity'], $data['shipment_status'], $warehouseId, $driverId]);

    $pdo->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>