<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $pdo = connect_db();
    
    // Fetch exams created by the current user
    $stmt = $pdo->prepare("SELECT * FROM Exams WHERE created_by = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $exams = $stmt->fetchAll();

    echo json_encode($exams);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
