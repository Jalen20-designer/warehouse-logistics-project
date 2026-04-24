<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');

// 1. Force the script to look for db.php in the same folder
$db_path = __DIR__ . '/db.php';

if (file_exists($db_path)) {
    require_once $db_path;
} else {
    echo json_encode(["success" => false, "message" => "db.php not found in " . __DIR__]);
    exit;
}

// 2. Check if $pdo was actually created in db.php
if (!isset($pdo)) {
    echo json_encode(["success" => false, "message" => "Database connection variable (\$pdo) is missing. check db.php"]);
    exit;
}

try {
    // 3. Run the counts
    // We use @ to suppress errors in case the tables don't exist yet
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $warehouseCount = @$pdo->query("SELECT COUNT(*) FROM warehouses")->fetchColumn() ?: 0;
    $shipmentCount = @$pdo->query("SELECT COUNT(*) FROM shipments")->fetchColumn() ?: 0;
    $driverCount = @$pdo->query("SELECT COUNT(*) FROM drivers")->fetchColumn() ?: 0;

    echo json_encode([
        "success" => true,
        "stats" => [
            "users" => (int)$userCount,
            "warehouses" => (int)$warehouseCount,
            "shipments" => (int)$shipmentCount,
            "drivers" => (int)$driverCount
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Query Error: " . $e->getMessage()]);
}
?>