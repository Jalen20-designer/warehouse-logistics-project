<?php
// backend/login.php
require_once '../db.php'; // Gagamitin nito ang headers at $pdo mula sa db.php

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = $data['password'];

    try {
        // Tinitingnan kung existing ang user sa 'users' table
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Paalala: Kung plain text ang password mo sa DB, tanggalin ang password_verify
        // Pero kung naka-hash (recommended), hayaan lang ito.
        if ($user && ($password === $user['password'] || password_verify($password, $user['password']))) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['id'],
                    "email" => $user['email'],
                    "name" => $user['name'] ?? 'User'
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Server error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Please fill all fields"]);
}
?>