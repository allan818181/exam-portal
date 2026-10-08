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

if (!$course_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course ID is required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("DELETE FROM Courses WHERE course_id = ?");
    $stmt->execute([$course_id]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Course deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
