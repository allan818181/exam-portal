<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Permission denied.']);
    exit;
}

try {
    $pdo = connect_db();

    // Fetch all users including their status
    $stmt = $pdo->prepare("SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode($users);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
