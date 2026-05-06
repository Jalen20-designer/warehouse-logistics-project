<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
require_once '../db.php';

try {
    // Get the id, username, email, at date created. 
    $stmt = $pdo->query("SELECT id, username, email, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>