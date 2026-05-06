<?php
// backend/activities/activities_manager.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once '../db.php';

// Kunin ang action mula sa URL
$action = $_GET['action'] ?? '';

try {
    // 1. LIST (Payagan ang GET request dito)
    if ($action === 'list') {
        $sql = "SELECT a.id, a.user_id, a.action_text, a.created_at, u.username 
                FROM activities a 
                LEFT JOIN users u ON a.user_id = u.id 
                ORDER BY a.created_at DESC 
                LIMIT 10";
        $stmt = $pdo->query($sql);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 

    // 2. DELETE (Dapat ito ay POST)
    elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "message" => "Deleted"]);
        }
    }

    // 3. DELETE ALL (Dapat ito ay POST)
    elseif ($action === 'delete_all' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $stmt = $pdo->prepare("DELETE FROM activities");
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Cleared all"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>