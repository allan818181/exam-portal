<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

// Check if user is logged in and is an examiner or admin
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'examiner' && $_SESSION['role'] !== 'admin')) {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'message' => 'You do not have permission to perform this action.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$title = $data['title'] ?? '';
$subject_id = $data['subject_id'] ?? null;
$description = $data['description'] ?? '';
$total_marks = $data['total_marks'] ?? 0;
$time_limit = $data['time_limit'] ?? 0;
$created_by = $_SESSION['user_id'];

if (empty($title) || empty($total_marks) || empty($time_limit)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare(
        "INSERT INTO Exams (title, subject_id, description, total_marks, time_limit, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$title, $subject_id, $description, $total_marks, $time_limit, $created_by]);

    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Exam created successfully!']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
