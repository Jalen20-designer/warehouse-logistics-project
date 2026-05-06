<?php
// backend/get_recent_activity.php
require_once '../db.php'; // Siguraduhin na ito yung db.php na may $pdo

try {
    // Siguraduhin na tama ang table name mo (shipments o activities)
    $stmt = $pdo->query("SELECT * FROM activities ORDER BY id DESC LIMIT 5");
    $activities = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $activities
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Query failed: " . $e->getMessage()
    ]);
}
?>