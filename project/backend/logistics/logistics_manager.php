<?php
// backend/logistics/logistics_manager.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Kapag 'OPTIONS' ang request, mag-exit agad (CORS Pre-flight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once '../db.php';

$action = $_GET['action'] ?? '';

try {
    // --- 1. LIST ACTIONS (GET) ---
    
    if ($action === 'list_warehouses') {
        $stmt = $pdo->query("SELECT * FROM warehouses ORDER BY id DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    elseif ($action === 'list_drivers') {
        $stmt = $pdo->query("SELECT * FROM drivers ORDER BY id DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    elseif ($action === 'list_shipments') {
        $sql = "SELECT s.*, w.name as warehouse_name, d.name as driver_name 
                FROM shipments s 
                LEFT JOIN warehouses w ON s.warehouse_id = w.id 
                LEFT JOIN drivers d ON s.driver_id = d.id 
                ORDER BY s.id DESC";
        $stmt = $pdo->query($sql);
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // --- 2. UPDATE ACTIONS (POST) ---

    elseif ($action === 'update_shipment_status') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // SAFEGUARD: Check kung may valid data
        if (!$input || !isset($input['id'])) {
            echo json_encode(["success" => false, "message" => "No valid data provided for shipment update"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE shipments SET status = ? WHERE id = ?");
        $stmt->execute([
            $input['status'] ?? 'Pending', 
            $input['id']
        ]);
        echo json_encode(["success" => true, "message" => "Shipment status updated successfully"]);
    }

    elseif ($action === 'update_driver_info') {
        $input = json_decode(file_get_contents('php://input'), true);

        // SAFEGUARD: Check kung may valid data
        if (!$input || !isset($input['id'])) {
            echo json_encode(["success" => false, "message" => "No valid data provided for driver update"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE drivers SET contact_no = ?, vehicle_type = ?, license_expiry = ? WHERE id = ?");
        $stmt->execute([
            $input['contact_no'] ?? '', 
            $input['vehicle_type'] ?? '', 
            $input['license_expiry'] ?? '', 
            $input['id']
        ]);
        echo json_encode(["success" => true, "message" => "Driver information updated successfully"]);
    }

    else {
        echo json_encode(["success" => false, "message" => "Invalid action requested"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>