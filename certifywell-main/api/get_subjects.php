<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

// Allow both admins and examiners to fetch subjects
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'examiner')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

try {
    $pdo = connect_db();
    
    // Fetch all subjects
    $stmt = $pdo->prepare("SELECT * FROM Subjects ORDER BY name ASC");
    $stmt->execute();
    $subjects = $stmt->fetchAll();

    echo json_encode($subjects);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
