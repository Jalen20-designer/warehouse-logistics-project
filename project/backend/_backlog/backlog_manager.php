<?php
// backend/backlog/backlog_manager.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle pre-flight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

try {
    require_once __DIR__ . '/../db.php';
    if (!isset($pdo)) {
        throw new Exception('Database connection variable ($pdo) is missing.');
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB Include/Connection Error: " . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    // 1. LIST - Kunin lahat ng columns para sa UI
    if ($action === 'list') {
        $sql = "SELECT id, order_id, task_title, task_description, priority, task_type, status, created_at, due_date 
                FROM system_backlog 
                ORDER BY created_at DESC";
        $stmt = $pdo->query($sql);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // 2. ADD - Pinagsama at kinumpleto ang lahat ng fields
    elseif ($action === 'add') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $order_id    = $input['order_id'] ?? '';
        $task_title  = $input['task_title'] ?? '';
        $task_desc   = $input['task_description'] ?? '';
        $priority    = $input['priority'] ?? 'Medium';
        $task_type   = $input['task_type'] ?? 'Picking';
        $due_date    = $input['due_date'] ?? null; // Sasaluhin nito ang date picker mula sa React

        if ($task_title) {
            $sql = "INSERT INTO system_backlog (order_id, task_title, task_description, priority, task_type, status, due_date) 
                    VALUES (?, ?, ?, ?, ?, 'Queued', ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$order_id, $task_title, $task_desc, $priority, $task_type, $due_date]);
            
            echo json_encode(["success" => true, "message" => "WMS Ticket created successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Task title is required"]);
        }
    }

    // 3. UPDATE STATUS - May kasamang Auto-Log sa Dashboard Activities
    elseif ($action === 'update') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        $status = $input['status'] ?? 'Queued';
        $order_id = $input['order_id'] ?? 'Unknown';

        if ($id) {
            $stmt = $pdo->prepare("UPDATE system_backlog SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);

            // Kapag naging 'Shipped', mag-insert din sa activities table para lumitaw sa Dashboard log
            if ($status === 'Shipped') {
                $log_text = "Order $order_id has been successfully shipped and cleared from backlog.";
                $logStmt = $pdo->prepare("INSERT INTO activities (user_id, action_text, created_at) VALUES (?, ?, NOW())");
                $logStmt->execute([1, $log_text]); // Default Admin ID = 1
            }

            echo json_encode(["success" => true, "message" => "Status updated and synced to activity log."]);
        } else {
            echo json_encode(["success" => false, "message" => "Task ID is required for update"]);
        }
    }

    // 4. DELETE - Burahin ang isang specific task
    elseif ($action === 'delete') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM system_backlog WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "message" => "Task deleted"]);
        } else {
            echo json_encode(["success" => false, "message" => "ID required"]);
        }
    }

    // 5. PURGE COMPLETED - Linisin lahat ng shipped items para hindi mag-overload ang DB
    elseif ($action === 'purge_completed') {
        $stmt = $pdo->prepare("DELETE FROM system_backlog WHERE status = 'Shipped'");
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Shipped history cleared successfully!"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>