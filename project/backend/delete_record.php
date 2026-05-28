<?php
// backend/delete_record.php
// TANGGALIN ang duplicate CORS headers dahil nandun na ito sa api.php

$host = "localhost"; $dbname = "warehouse_db"; $username = "root"; $password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Subukang basahin ang JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    // FALLBACK: Kung walang JSON body (RESTful DELETE), kunin ang data mula sa Router variables ($id at $resource)
    if (!$data) {
        $data = [
            'id' => $id ?? null,
            'table' => $resource ?? null
        ];
    }

    if (isset($data['id']) && isset($data['table'])) {
        $id = $data['id'];
        $table = $data['table']; 

        // List ng valid tables para sa security
        $allowedTables = ['warehouses', 'shipments', 'drivers'];
        if (!in_array($table, $allowedTables)) {
            echo json_encode(["success" => false, "message" => "Invalid table."]);
            exit;
        }

        // --- CASCADE DELETION LOGIC (Hayaang buo ang logic mo rito) ---
        if ($table === 'warehouses') {
            $stmtShipments = $pdo->prepare("DELETE FROM shipments WHERE warehouse_id = ?");
            $stmtShipments->execute([$id]);

            try {
                $stmtDrivers = $pdo->prepare("DELETE FROM drivers WHERE warehouse_id = ?");
                $stmtDrivers->execute([$id]);
            } catch (PDOException $e) {}
        } elseif ($table === 'drivers') {
            $stmtGetWH = $pdo->prepare("SELECT warehouse_id FROM shipments WHERE driver_id = ?");
            $stmtGetWH->execute([$id]);
            $warehouseIds = $stmtGetWH->fetchAll(PDO::FETCH_COLUMN);

            $stmtShipments = $pdo->prepare("DELETE FROM shipments WHERE driver_id = ?");
            $stmtShipments->execute([$id]);

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