<?php
/**
 * _auth/login.php
 * Included by api.php
 * Variables available: $pdo, $input (which is also $_POST)
 */

try {
    // Siguraduhin na may data
    if (!empty($input['email']) && !empty($input['password'])) {
        $email = $input['email'];
        $password = $input['password'];

        // Kunin ang user base sa email
        $stmt = $pdo->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify password
        if ($user && password_verify($password, $user['password'])) {
            
            // 1. I-SET ANG SESSION (Importante para sa /auth/profile)
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            // 2. IBALIK ANG RESPONSE
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user_id" => $user['id'], // Ibinabalik para sa localStorage.setItem('user_id')
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "email" => $user['email']
                ]
            ]);
            exit; // Siguraduhin na walang ibang output
        } else {
            echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Please fill all fields"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}
exit;