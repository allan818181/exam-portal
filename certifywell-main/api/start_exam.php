<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$exam_id = $data['exam_id'] ?? null;
$token = $data['token'] ?? '';
$student_id = $_SESSION['user_id'];

if (!$exam_id || empty($token)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Exam ID and token are required.']);
    exit;
}

try {
    $pdo = connect_db();

    // Check if a valid attempt exists with the given token
    $stmt = $pdo->prepare(
        "SELECT * FROM Student_Exam_Attempts WHERE exam_id = ? AND student_id = ? AND token = ?"
    );
    $stmt->execute([$exam_id, $student_id, $token]);
    $attempt = $stmt->fetch();

    if ($attempt) {
        // Check if the exam has already been submitted or graded
        if ($attempt['status'] === 'submitted' || $attempt['status'] === 'graded') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You have already completed this exam.']);
        } else {
            // The token is valid and the exam is not completed, so allow the student to start
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Exam started successfully.']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token for this exam.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
