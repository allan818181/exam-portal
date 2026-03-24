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

    // Fetch all generated tokens with student and exam names
    $stmt = $pdo->prepare(
        "SELECT gt.*, u.username as student_name, e.title as exam_title 
         FROM Generated_Tokens gt
         JOIN users u ON gt.student_id = u.id
         JOIN Exams e ON gt.exam_id = e.exam_id
         ORDER BY gt.generated_at DESC"
    );
    $stmt->execute();
    $tokens = $stmt->fetchAll();

    echo json_encode($tokens);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
