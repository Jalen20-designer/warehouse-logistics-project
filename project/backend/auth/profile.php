<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    // --- 1. GET PROFILE (Para maipakita ang data sa screen) ---
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(["success" => false, "message" => "User ID is required"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, username, email, created_at, avatar FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode(["success" => true, "data" => $user]);
        } else {
            echo json_encode(["success" => false, "message" => "User not found"]);
        }
    }

    // --- 2. UPDATE PROFILE (POST - Multipart Form Data para sa image upload) ---
    elseif ($method === 'POST') {
        // Tandaan: Tinanggal na natin ang email sa requirements para sa update
        if (!isset($_POST['id'], $_POST['username'])) {
            echo json_encode(["success" => false, "message" => "Missing required fields (ID or Username)"]);
            exit;
        }

        $id = $_POST['id'];
        $username = $_POST['username'];
        $avatarName = null;

        // Check if an avatar was uploaded
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/profiles/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileExtension = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $avatarName = 'avatar_' . $id . '_' . time() . '.' . $fileExtension;
            $targetPath = $uploadDir . $avatarName;

            if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                echo json_encode(["success" => false, "message" => "Failed to upload avatar"]);
                exit;
            }
        }

        // --- SQL UPDATE: Username at Avatar na lang ang ina-update natin (Email is Read-Only) ---
        if ($avatarName) {
            $stmt = $pdo->prepare("UPDATE users SET username = ?, avatar = ? WHERE id = ?");
            $success = $stmt->execute([$username, $avatarName, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            $success = $stmt->execute([$username, $id]);
        }

        if ($success) {
            $response = ["success" => true, "message" => "Profile updated successfully!"];
            if ($avatarName) { $response["avatar"] = $avatarName; }
            echo json_encode($response);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update profile"]);
        }
    }

    // --- 3. (Optional) PUT UPDATE (Para sa mga updates na walang file upload) ---
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'], $data['username'])) {
            echo json_encode(["success" => false, "message" => "Missing ID or Username"]);
            exit;
        }

        // Username lang ang ina-update dito
        $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
        $success = $stmt->execute([$data['username'], $data['id']]);

        if ($success) {
            echo json_encode(["success" => true, "message" => "Username updated successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update username"]);
        }
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>