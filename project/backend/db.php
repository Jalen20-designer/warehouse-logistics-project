<?php
$host = "localhost";
$dbname = "warehouse_db";
$username = "root"; // Default XAMPP username
$password = "";     // Default XAMPP password is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $e->getMessage()]));
}
?>