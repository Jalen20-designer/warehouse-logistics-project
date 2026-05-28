<?php
// 1. Pilitin ang PHP na ipakita ang lahat ng errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Siguraduhin na walang whitespace bago ang <?php
ob_start(); 

session_start();

// 2. Updated CORS Headers para sa Sessions/Cookies
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true"); // <--- IMPORTANTE para sa Profile session
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // I-check kung nage-exist ang files
    if (!file_exists(__DIR__ . '/db.php')) {
        throw new Exception("db.php not found");
    }
    
    require_once __DIR__ . '/db.php';
    require_once __DIR__ . '/encryption_helper.php';

    // 3. Kunin ang Method at Route
    $method = $_SERVER['REQUEST_METHOD'];
    $route = $_GET['route'] ?? '';
    $parts = explode('/', trim($route, '/'));

    $resource = $parts[0] ?? ''; 
    $id = $parts[1] ?? null;    

    // 4. Kunin ang JSON data
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $_POST = $input; 

    if ($method === 'DELETE' && !empty($id) && in_array($resource, ['warehouses', 'drivers', 'shipments'])) {
        include __DIR__ . '/delete_record.php';
        exit;
    }

    // --- DEBUG LOG (Makikita mo ito sa Network -> Response) ---
    // error_log("Request: $method $route"); 

    switch ($resource) {
        case 'quick_setup':
            if ($method === 'POST') {
                include __DIR__ . '/_logistics/quick_setup.php';
                exit;
            }
            break;

        case 'delete_record':
            if ($method === 'POST' || $method === 'DELETE') {
                include __DIR__ . '/delete_record.php';
                exit;
            }
            break;

        case 'logistics':
            $action = $input['action'] ?? '';
            if ($action === 'list_drivers') {
                $stmt = $pdo->query("SELECT * FROM drivers ORDER BY id DESC");
                echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            } elseif ($action === 'list_shipments') {
                $stmt = $pdo->query("SELECT * FROM shipments ORDER BY id DESC");
                echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            } elseif ($action === 'list_warehouses') {
                $stmt = $pdo->query("SELECT * FROM warehouses ORDER BY id DESC");
                echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            exit;

        case 'drivers':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM drivers ORDER BY id DESC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($data as &$d) {
                    if (!empty($d['contact_no'])) $d['contact_no'] = decryptField($d['contact_no']);
                    if (!empty($d['license_number'])) $d['license_number'] = decryptField($d['license_number']);
                }
                echo json_encode(["success" => true, "data" => $data]);
                exit; // Siguraduhing may exit
            } 
            elseif ($method === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO drivers (name, contact_no, vehicle_type, license_number, status) VALUES (?, ?, ?, ?, 'Available')");
                $stmt->execute([
                    $input['name'] ?? '', 
                    encryptField($input['contact_no'] ?? ''),
                    $input['vehicle_type'] ?? '',
                    encryptField($input['license_number'] ?? '')
                ]);
                echo json_encode(["success" => true, "message" => "Driver added"]);
                exit; // Siguraduhing may exit
            }
            // --- IDINAGDAG NATIN ITONG TULAY PARA SA DRIVER UPDATE ---
            elseif ($method === 'PATCH' && !empty($id)) {
                $input['id'] = $id;
                $action = 'update_driver_info';
                
                include __DIR__ . '/_logistics/logistics_manager.php';
                exit;
            }
            break;
        // --- WAREHOUSES CASE ---
        case 'warehouses':
            if ($method === 'GET') {
                try {
                    $stmt = $pdo->query("SELECT * FROM warehouses ORDER BY id DESC");
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(["success" => true, "data" => $data]);
                } catch (PDOException $e) {
                    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
                }
                exit; // IMPORTANTE: Para hindi umabot sa 'Unknown Route' error sa baba
            }
            break;

        case 'shipments':
            if ($method === 'GET') {
                $sql = "SELECT s.*, w.name as warehouse_name, d.name as driver_name 
                        FROM shipments s 
                        LEFT JOIN warehouses w ON s.warehouse_id = w.id 
                        LEFT JOIN drivers d ON s.driver_id = d.id 
                        ORDER BY s.id DESC";
                $stmt = $pdo->query($sql);
                echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            exit;
            }
            // --- IDINAGDAG NATIN ITONG TULAY PARA SA PATCH STATUS UPDATE ---
            elseif ($method === 'PATCH' && !empty($id)) {
                // I-inject natin ang ID mula sa URL at ang action para sa manager
                $input['id'] = $id;
                $action = 'update_shipment_status';
                
                include __DIR__ . '/_logistics/logistics_manager.php';
                exit;
            }
            break;

        case 'auth':
            if ($method === 'POST') {
                if ($id === 'login') include __DIR__ . '/_auth/login.php';
                elseif ($id === 'register') include __DIR__ . '/_auth/register.php';
                elseif ($id === 'profile' || empty($id)) include __DIR__ . '/_auth/profile.php'; // <-- IDINAGDAG ITONG LINE
                exit;
            }
            elseif ($method === 'GET') {
                // Pinaka-common na error source
                if (empty($id) || $id === 'profile') {
                    if (!file_exists(__DIR__ . '/_auth/profile.php')) throw new Exception("profile.php missing");
                    include __DIR__ . '/_auth/profile.php';
                } elseif ($id === 'users') {
                    include __DIR__ . '/_auth/get_all_users.php';
                }
                exit;
            }
            break;

        case 'activities':
            if ($method === 'GET') {
                if ($id === 'stats') include __DIR__ . '/_activities/get_dashboard_stats.php';
                else include __DIR__ . '/_activities/activities_manager.php';
                exit;
            } 
             // IDINAGDAG NATIN ITO PARA SA DELETE ALL ACTIVITIES
            elseif ($method === 'DELETE') {
                include __DIR__ . '/_activities/delete_all_activities.php';
                exit;
            }
            break;
            break;
        // --- BACKLOG CASE ---
        case 'backlog':
            if ($method === 'GET') {
                // Siguraduhin na tama ang path papunta sa folder ng backlog
                $backlogFile = __DIR__ . '/_backlog/backlog_manager.php';
                
                if (file_exists($backlogFile)) {
                    $_GET['action'] = 'list'; // Para sa compatibility ng manager file
                    include $backlogFile;
                } else {
                    echo json_encode(["success" => false, "message" => "File not found: _backlog/backlog_manager.php"]);
                }
                exit; // IMPORTANTE: Para hindi umabot sa 'Unknown Route' sa baba
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Unknown Route: $resource"]);
            break;
    }

} catch (Exception $e) {
    // 5. DETAILED ERROR CATCH
    ob_clean(); // Linisin ang kahit anong PHP warning na lumabas para JSON lang ang maiwan
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
?>