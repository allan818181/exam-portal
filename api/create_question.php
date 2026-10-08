<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] !== 'examiner' && $_SESSION['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You do not have permission.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$subject_id = $data['subject_id'] ?? null;
$question_text = $data['question_text'] ?? '';
$question_type = $data['question_type'] ?? '';
$marks = $data['marks'] ?? 0;
$options = $data['options'] ?? [];

if (empty($subject_id) || empty($question_text) || empty($question_type) || empty($marks)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields.']);
    exit;
}

// For true/false and fill_blank, ensure an answer is provided
if (($question_type === 'true_false' || $question_type === 'fill_blank') && empty($options)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A correct answer is required for this question type.']);
    exit;
}


$pdo = connect_db();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        "INSERT INTO Questions (subject_id, question_text, question_type, marks) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$subject_id, $question_text, $question_type, $marks]);
    $question_id = $pdo->lastInsertId();

    // Handle options for MCQ, True/False, and Fill in the Blank
    if (!empty($options) && in_array($question_type, ['mcq', 'true_false', 'fill_blank'])) {
        $stmt = $pdo->prepare(
            "INSERT INTO Question_Options (question_id, option_text, is_correct) VALUES (?, ?, ?)"
        );
        foreach ($options as $option) {
            $stmt->execute([$question_id, $option['option_text'], $option['is_correct']]);
        }
    }

    $pdo->commit();

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Question added successfully!']);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
