<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$host = "localhost"; $dbname = "warehouse_db"; $username = "root"; $password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['id']) && isset($data['table'])) {
        $id = $data['id'];
        $table = $data['table']; 

        // List ng valid tables para sa security
        $allowedTables = ['warehouses', 'shipments', 'drivers'];
        if (!in_array($table, $allowedTables)) {
            echo json_encode(["success" => false, "message" => "Invalid table."]);
            exit;
        }

        // --- CASCADE DELETION LOGIC ---
        if ($table === 'warehouses') {
            // First, delete all shipments linked to this warehouse
            $stmtShipments = $pdo->prepare("DELETE FROM shipments WHERE warehouse_id = ?");
            $stmtShipments->execute([$id]);

            // Attempt to delete related drivers if the foreign key exists, ignoring column errors
            try {
                $stmtDrivers = $pdo->prepare("DELETE FROM drivers WHERE warehouse_id = ?");
                $stmtDrivers->execute([$id]);
            } catch (PDOException $e) {
                // Silently ignore if 'warehouse_id' doesn't exist in the drivers table
            }
        } elseif ($table === 'drivers') {
            // Hanapin ang mga associated warehouse IDs bago i-delete ang shipments
            $stmtGetWH = $pdo->prepare("SELECT warehouse_id FROM shipments WHERE driver_id = ?");
            $stmtGetWH->execute([$id]);
            $warehouseIds = $stmtGetWH->fetchAll(PDO::FETCH_COLUMN);

            // Delete the shipments linked to this driver
            $stmtShipments = $pdo->prepare("DELETE FROM shipments WHERE driver_id = ?");
            $stmtShipments->execute([$id]);

            // Delete the warehouses linked to this driver, ignoring if there are no associated warehouses
            if (!empty($warehouseIds)) {
                $placeholders = implode(',', array_fill(0, count($warehouseIds), '?'));
                $stmtWarehouses = $pdo->prepare("DELETE FROM warehouses WHERE id IN ($placeholders)");
                $stmtWarehouses->execute($warehouseIds);
            }
        }
        // ------------------------------

        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["success" => true, "message" => "Record deleted."]);
        } else {
            echo json_encode(["success" => false, "message" => "Delete failed."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing id or table data."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>