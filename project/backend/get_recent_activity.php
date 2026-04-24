<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Get latest 5 shipments with warehouse and driver info
    $sql = "SELECT s.id, s.item_name, s.quantity, s.status, s.warehouse_id, s.driver_id,
            w.name as warehouse_name, d.name as driver_name 
            FROM shipments s 
            LEFT JOIN warehouses w ON s.warehouse_id = w.id 
            LEFT JOIN drivers d ON s.driver_id = d.id 
            ORDER BY s.id DESC 
            LIMIT 5";
    $result = $conn->query($sql);
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["success" => true, "data" => $data]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
