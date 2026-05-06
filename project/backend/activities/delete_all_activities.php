<?php
// backend/activities/delete_all_activities.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Siguraduhin na tama ang path papunta sa db.php mo (labas ng isang folder)
require_once '../db.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Direkta nating gagamitin ang $pdo variable na galing sa db.php
        $query = "DELETE FROM activities";
        $stmt = $pdo->prepare($query);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'All activities have been cleared successfully.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to clear the activities table.'
            ]);
        }
    } catch (PDOException $e) {
        // Kapag may problema sa SQL query
        echo json_encode([
            'success' => false,
            'message' => 'Database Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. POST required.'
    ]);
}
?>