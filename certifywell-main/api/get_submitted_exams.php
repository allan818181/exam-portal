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

    // Fetch all submitted exam attempts that are not yet graded
    $stmt = $pdo->prepare(
        "SELECT sea.attempt_id, e.title as exam_title, u.username as student_name, sea.end_time
         FROM Student_Exam_Attempts sea
         JOIN Exams e ON sea.exam_id = e.exam_id
         JOIN users u ON sea.student_id = u.id
         WHERE sea.status = 'submitted'
         ORDER BY sea.end_time ASC"
    );
    $stmt->execute();
    $attempts = $stmt->fetchAll();

    echo json_encode($attempts);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
