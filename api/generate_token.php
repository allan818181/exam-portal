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
$student_id = $data['student_id'] ?? null;

if (!$exam_id || !$student_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Exam and Student are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $pdo->beginTransaction();

    // Check if an attempt already exists for this student and exam
    $stmt = $pdo->prepare("SELECT * FROM Student_Exam_Attempts WHERE exam_id = ? AND student_id = ?");
    $stmt->execute([$exam_id, $student_id]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'This student has already been assigned this exam.']);
        $pdo->rollBack();
        exit;
    }

    // Generate a unique token
    $token = bin2hex(random_bytes(8));

    // Create a new exam attempt for the student
    $stmt = $pdo->prepare(
        "INSERT INTO Student_Exam_Attempts (exam_id, student_id, status, token) VALUES (?, ?, 'started', ?)"
    );
    $stmt->execute([$exam_id, $student_id, $token]);
    
    // Log the generated token
    $stmt = $pdo->prepare(
        "INSERT INTO Generated_Tokens (exam_id, student_id, token) VALUES (?, ?, ?)"
    );
    $stmt->execute([$exam_id, $student_id, $token]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Token generated successfully!', 'token' => $token]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
