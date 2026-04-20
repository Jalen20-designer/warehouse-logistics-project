<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once 'db.php';
try {
    // Kinukuha natin ang shipment pati ang pangalan ng warehouse gamit ang JOIN
    $sql = "SELECT s.*, w.name as warehouse_name FROM shipments s 
            JOIN warehouses w ON s.warehouse_id = w.id ORDER BY s.id ASC";
    $stmt = $pdo->query($sql);
    echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>