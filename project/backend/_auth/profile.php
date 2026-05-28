<?php
/**
 * @var PDO $pdo
 * @var string $method
 * @var array $input
 */

// 1. Alamin kung sinong user (Session priority, GET/URL fallback para sa debugging)
$userId = $_SESSION['user_id'] ?? $_GET['id'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "message" => "No user session found"]);
    exit;
}

// CASE 1: GET (Pagkuha ng Data)
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, username, email, avatar, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userData) {
            echo json_encode(["success" => true, "user" => $userData]);
        } else {
            echo json_encode(["success" => false, "message" => "User not found in database"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// CASE 2: POST (Pag-update ng Data)
if ($method === 'POST') {
    try {
        $newUsername = $input['username'] ?? '';
        
        // Update logic dito...
        $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
        $stmt->execute([$newUsername, $userId]);

        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}