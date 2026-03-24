<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Permission denied.']);
    exit;
}

$student_id = $_SESSION['user_id'];

try {
    $pdo = connect_db();

    // Fetch exams assigned to the student via the attempts table
    $stmt = $pdo->prepare(
        "SELECT e.*, s.name as subject_name, sea.token, sea.status
         FROM Exams e
         JOIN Subjects s ON e.subject_id = s.subject_id
         JOIN Student_Exam_Attempts sea ON e.exam_id = sea.exam_id
         WHERE sea.student_id = ?
         ORDER BY e.created_at DESC"
    );
    $stmt->execute([$student_id]);
    $exams = $stmt->fetchAll();

    echo json_encode($exams);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
