<?php
// _auth/register.php
// NOTE: $pdo is already available from api.php
// NOTE: CORS headers are already set in api.php
// NOTE: $input is already parsed in api.php

try {
    $data = isset($input) ? $input : $_POST;
    if (!empty($data['username']) && !empty($data['email']) && !empty($data['password'])) {
        $username = $data['username'];
        $email = $data['email'];
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Email already registered."]);
            exit;
        }
        $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute([$username, $email, $hashedPassword])) {
            echo json_encode(["success" => true, "message" => "User registered successfully!"]);
            exit;
        } else {
            echo json_encode(["success" => false, "message" => "SQL execution failed."]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    exit;
}
?>