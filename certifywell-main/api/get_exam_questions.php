<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$exam_id = $_GET['exam_id'] ?? null;

if (!$exam_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Exam ID is required.']);
    exit;
}

try {
    $pdo = connect_db();

    // Get questions already in the exam
    $stmt = $pdo->prepare(
        "SELECT q.* FROM Questions q
         JOIN Exam_Question_Bank eqb ON q.question_id = eqb.question_id
         WHERE eqb.exam_id = ?"
    );
    $stmt->execute([$exam_id]);
    $in_exam = $stmt->fetchAll();

    // Get questions not in the exam
    $stmt = $pdo->prepare(
        "SELECT * FROM Questions 
         WHERE question_id NOT IN (SELECT question_id FROM Exam_Question_Bank WHERE exam_id = ?)"
    );
    $stmt->execute([$exam_id]);
    $available = $stmt->fetchAll();

    echo json_encode(['in_exam' => $in_exam, 'available' => $available]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
