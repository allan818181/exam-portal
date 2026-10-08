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

if (!$exam_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Exam ID is required.']);
    exit;
}

try {
    $pdo = connect_db();
    // Ensure the user can only delete their own exams
    $stmt = $pdo->prepare("DELETE FROM Exams WHERE exam_id = ? AND created_by = ?");
    $stmt->execute([$exam_id, $_SESSION['user_id']]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Exam deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Exam not found or you do not have permission to delete it.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
