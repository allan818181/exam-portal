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

if (!$exam_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Exam ID is required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("SELECT * FROM Exams WHERE exam_id = ?");
    $stmt->execute([$exam_id]);
    $exam = $stmt->fetch();

    if ($exam) {
        echo json_encode($exam);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Exam not found.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
