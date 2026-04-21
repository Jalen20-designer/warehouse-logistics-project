<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once 'db.php';
$stmt = $pdo->query("SELECT * FROM drivers");
echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
?>