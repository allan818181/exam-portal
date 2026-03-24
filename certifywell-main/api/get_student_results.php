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

    // Fetch submitted or graded exam attempts for the student
    $stmt = $pdo->prepare(
        "SELECT e.title as exam_title, s.name as subject_name, sea.score, sea.end_time
         FROM Student_Exam_Attempts sea
         JOIN Exams e ON sea.exam_id = e.exam_id
         JOIN Subjects s ON e.subject_id = s.subject_id
         WHERE sea.student_id = ? AND sea.status IN ('submitted', 'graded')
         ORDER BY sea.end_time DESC"
    );
    $stmt->execute([$student_id]);
    $results = $stmt->fetchAll();

    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
