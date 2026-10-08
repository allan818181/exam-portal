<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'examiner' && $_SESSION['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

$exam_id = $_GET['exam_id'] ?? null;

try {
    $pdo = connect_db();
    
    $sql = "SELECT e.title as exam_title, u.username as student_name, sea.score, e.total_marks, sea.end_time
            FROM Student_Exam_Attempts sea
            JOIN Exams e ON sea.exam_id = e.exam_id
            JOIN users u ON sea.student_id = u.id
            WHERE sea.status = 'graded'";
    
    $params = [];

    if ($exam_id) {
        $sql .= " AND e.exam_id = ?";
        $params[] = $exam_id;
    }

    $sql .= " ORDER BY sea.end_time DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $scores = $stmt->fetchAll();

    echo json_encode($scores);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
