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
    $stmtW->execute([$data['warehouse_name'], $data['location']]);
    $warehouseId = $pdo->lastInsertId();

    // 2. I-save ang Driver
    $stmtD = $pdo->prepare("INSERT INTO drivers (name, status) VALUES (?, ?)");
    $stmtD->execute([$data['driver_name'], 'On Delivery']);
    $driverId = $pdo->lastInsertId();

    // 3. I-save ang Shipment (gamit ang IDs ng dalawa sa itaas)
    $stmtS = $pdo->prepare("INSERT INTO shipments (item_name, status, warehouse_id, driver_id) VALUES (?, ?, ?, ?)");
    $stmtS->execute([$data['item_name'], $data['shipment_status'], $warehouseId, $driverId]);

    $pdo->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>