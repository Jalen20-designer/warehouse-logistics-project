<?php
$host = "localhost";
$dbname = "warehouse_db";
$username = "root";
$password = "";

try {
    // Make sure this says $pdo = ...
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // If it fails, stop and show why
    header('Content-Type: application/json');
    die(json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]));
}
?>