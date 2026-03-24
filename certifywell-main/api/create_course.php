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
$course_name = $data['course_name'] ?? '';
$course_description = $data['course_description'] ?? '';

if (empty($course_name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course name is required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("INSERT INTO Courses (name, description) VALUES (?, ?)");
    $stmt->execute([$course_name, $course_description]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Course created successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
