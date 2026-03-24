<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'examiner' && $_SESSION['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(['error' => 'Permission denied.']);
    exit;
}

try {
    $pdo = connect_db();

    // Fetch all users with the 'student' role
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE role = 'student' ORDER BY username ASC");
    $stmt->execute();
    $students = $stmt->fetchAll();

    echo json_encode($students);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
