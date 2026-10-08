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
$title = $data['title'] ?? '';
$subject_id = $data['subject_id'] ?? null;
$description = $data['description'] ?? '';
$total_marks = $data['total_marks'] ?? 0;
$time_limit = $data['time_limit'] ?? 0;

if (!$exam_id || empty($title) || empty($subject_id) || empty($total_marks) || empty($time_limit)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare(
        "UPDATE Exams 
         SET title = ?, subject_id = ?, description = ?, total_marks = ?, time_limit = ? 
         WHERE exam_id = ?"
    );
    $stmt->execute([$title, $subject_id, $description, $total_marks, $time_limit, $exam_id]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Exam updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
