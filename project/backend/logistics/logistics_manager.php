<?php
// backend/logistics/logistics_manager.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

require_once '../db.php';
// --- DINAGDAG NA ENCRYPTION HELPER 
require_once '../encryption_helper.php';

$action = $_GET['action'] ?? '';

try {
    // --- 1. LIST ACTIONS (GET) 
    if ($action === 'list_warehouses') {
        $stmt = $pdo->query("SELECT * FROM warehouses ORDER BY id DESC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    elseif ($action === 'list_drivers') {
        $stmt = $pdo->query("SELECT * FROM drivers ORDER BY id DESC");
        $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // --- DECRYPTION PARA SA FRONTEND ---
        foreach ($drivers as &$driver) {
            $driver['contact_no'] = decryptField($driver['contact_no']);
            $driver['license_number'] = decryptField($driver['license_number']);
        }

        echo json_encode(["success" => true, "data" => $drivers]);
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

    // --- 2. UPDATE/CREATE ACTIONS (POST) ---
    elseif ($action === 'add_driver') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['name'], $input['contact_no'], $input['vehicle_type'], $input['warehouse_id'], $input['license_number'])) {
            echo json_encode(["success" => false, "message" => "Missing required driver data"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO drivers (name, contact_no, vehicle_type, license_expiry, warehouse_id, license_number, status) VALUES (?, ?, ?, ?, ?, ?, 'Available')");
        
        // --- ENCRYPTION BAGO I-SAVE SA DB ---
        $stmt->execute([
            $input['name'],
            encryptField($input['contact_no']),      // Encrypted
            $input['vehicle_type'],
            $input['license_expiry'] ?? null,
            $input['warehouse_id'],
            encryptField($input['license_number'])   // Encrypted
        ]);
        echo json_encode(["success" => true, "message" => "Driver added successfully (Encrypted)"]);
    }

    elseif ($action === 'add_shipments') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['item_name'], $input['warehouse_id'], $input['driver_id'], $input['status'])) {
            echo json_encode(["success" => false, "message" => "Missing required shipment data"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO shipments (item_name, warehouse_id, driver_id, status, shipment_date) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([
            $input['item_name'],
            $input['warehouse_id'],
            $input['driver_id'],
            $input['status']
        ]);
        echo json_encode(["success" => true, "message" => "Shipment created successfully"]);
    }

    elseif ($action === 'update_shipment_status') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            echo json_encode(["success" => false, "message" => "No ID provided"]);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE shipments SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'] ?? 'Pending', $input['id']]);
        echo json_encode(["success" => true, "message" => "Shipment status updated"]);
    }

    elseif ($action === 'update_driver_info') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            echo json_encode(["success" => false, "message" => "No ID provided"]);
            exit;
        }

        // --- ENCRYPTION DIN DITO PARA SA UPDATE ---
        $stmt = $pdo->prepare("UPDATE drivers SET contact_no = ?, vehicle_type = ?, license_expiry = ? WHERE id = ?");
        $stmt->execute([
            encryptField($input['contact_no']), 
            $input['vehicle_type'], 
            $input['license_expiry'], 
            $input['id']
        ]);
        echo json_encode(["success" => true, "message" => "Driver info updated (Encrypted)"]);
    }

    else {
        echo json_encode(["success" => false, "message" => "Invalid action requested"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>