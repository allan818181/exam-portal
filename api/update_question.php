<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'examiner' && $_SESSION['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$question_id = $data['question_id'] ?? null;
$question_text = $data['question_text'] ?? '';
$marks = $data['marks'] ?? 0;

if (!$question_id || empty($question_text) || empty($marks)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("UPDATE Questions SET question_text = ?, marks = ? WHERE question_id = ?");
    $stmt->execute([$question_text, $marks, $question_id]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Question updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
