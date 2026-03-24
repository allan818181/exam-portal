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

$attempt_id = $_GET['attempt_id'] ?? null;

if (!$attempt_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Attempt ID is required.']);
    exit;
}

try {
    $pdo = connect_db();

    // Get exam and student info
    $stmt = $pdo->prepare(
        "SELECT e.title as exam_title, u.username as student_name
         FROM Student_Exam_Attempts sea
         JOIN Exams e ON sea.exam_id = e.exam_id
         JOIN users u ON sea.student_id = u.id
         WHERE sea.attempt_id = ?"
    );
    $stmt->execute([$attempt_id]);
    $exam_info = $stmt->fetch();

    // Get subjective answers for this attempt
    $stmt = $pdo->prepare(
        "SELECT a.answer_id, q.question_text, a.answer_text, q.marks
         FROM Answers a
         JOIN Questions q ON a.question_id = q.question_id
         WHERE a.attempt_id = ? AND q.question_type = 'subjective'"
    );
    $stmt->execute([$attempt_id]);
    $answers = $stmt->fetchAll();

    echo json_encode([
        'exam_title' => $exam_info['exam_title'],
        'student_name' => $exam_info['student_name'],
        'answers' => $answers
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
