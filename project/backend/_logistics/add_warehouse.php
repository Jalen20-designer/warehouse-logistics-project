<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['name']) && !empty($data['location'])) {
    try {
        $stmt = $pdo->prepare("INSERT INTO warehouses (name, location) VALUES (?, ?)");
        $stmt->execute([$data['name'], $data['location']]);
        echo json_encode(["success" => true, "message" => "Warehouse added!"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    // ITO ANG MAGA-ADVISE SA ATIN KUNG BAKIT WALANG LUMALABAS
    echo json_encode(["success" => false, "message" => "Data received:", "received_data" => $data]);
}
?>