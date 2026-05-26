<?php
// Disable showing errors as HTML (this stops PHP from breaking JSON)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// localhost para tumugma sa React app mo
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle Preflight Request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // 1. FIXED: Nagdagdag ng ../ sa file_exists check
    if (!file_exists('../db.php')) {
        throw new Exception("db.php file is missing in the backend folder.");
    }
    
    require_once '../db.php';

    // 2. Get the data from React
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception("Invalid JSON received from Frontend.");
    }

    if (!empty($data['username']) && !empty($data['email']) && !empty($data['password'])) {
        
        $user = $data['username'];
        $email = $data['email'];
        // Gumamit ng password_hash para sa security
        $pass = password_hash($data['password'], PASSWORD_DEFAULT);

        // 3. Check if email already exists
        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        
        if ($check->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Email already registered."]);
            exit;
        }

        // 4. Insert new user
        $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([$user, $email, $pass])) {
            echo json_encode(["success" => true, "message" => "User registered successfully!"]);
        } else {
            throw new Exception("SQL execution failed.");
        }

    } else {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
    }

} catch (Exception $e) {
    // This catches ANY error and sends it back to React so it DOES NOT crash.
    echo json_encode(["success" => false, "message" => "PHP Error: " . $e->getMessage()]);
}
?>