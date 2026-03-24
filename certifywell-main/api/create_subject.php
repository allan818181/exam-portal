<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$course_id = $data['course_id'] ?? null;
$subject_name = $data['subject_name'] ?? '';

if (empty($course_id) || empty($subject_name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course and subject name are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("INSERT INTO Subjects (course_id, name) VALUES (?, ?)");
    $stmt->execute([$course_id, $subject_name]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Subject created successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
