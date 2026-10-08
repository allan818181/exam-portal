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

$data = json_decode(file_get_contents("php://input"), true);
$exam_id = $data['exam_id'] ?? null;
$question_id = $data['question_id'] ?? null;

if (!$exam_id || !$question_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Exam ID and Question ID are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("INSERT INTO Exam_Question_Bank (exam_id, question_id) VALUES (?, ?)");
    $stmt->execute([$exam_id, $question_id]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Question added to exam.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
