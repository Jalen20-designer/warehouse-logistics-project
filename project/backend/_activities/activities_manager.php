<?php
/**
 * @var PDO $pdo
 * @var string $method
 * @var string|null $id
 */

try {
    // 1. LIST (GET /activities)
    if ($method === 'GET') {
        $sql = "SELECT a.id, a.user_id, a.action_text, a.created_at, u.username 
                FROM activities a 
                LEFT JOIN users u ON a.user_id = u.id 
                ORDER BY a.created_at DESC 
                LIMIT 10";
        $stmt = $pdo->query($sql);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 

    // 2. DELETE (DELETE /activities/{id})
    elseif ($method === 'DELETE') {
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "message" => "Activity deleted"]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM activities");
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "All activities cleared"]);
        }
    }
    
    else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
exit;