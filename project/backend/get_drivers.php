<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once 'db.php';
$stmt = $pdo->query("SELECT id, name, license_number, status, vehicle_type, contact_no, license_expiry FROM drivers");
echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
?>