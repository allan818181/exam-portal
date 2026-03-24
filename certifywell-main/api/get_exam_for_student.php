<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Permission denied.']);
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

    // First, get the exam details
    $stmt = $pdo->prepare("SELECT title, time_limit FROM Exams WHERE exam_id = ?");
    $stmt->execute([$exam_id]);
    $exam = $stmt->fetch();

    if (!$exam) {
        http_response_code(404);
        echo json_encode(['error' => 'Exam not found.']);
        exit;
    }

    // Now, get the questions for that exam
    $stmt = $pdo->prepare(
        "SELECT q.question_id, q.question_text, q.question_type, q.marks 
         FROM Questions q
         JOIN Exam_Question_Bank eqb ON q.question_id = eqb.question_id
         WHERE eqb.exam_id = ?"
    );
    $stmt->execute([$exam_id]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each MCQ or True/False question, fetch its options
    foreach ($questions as $key => $question) {
        if ($question['question_type'] == 'mcq' || $question['question_type'] == 'true_false') {
            $stmt = $pdo->prepare(
                "SELECT option_id, option_text FROM Question_Options WHERE question_id = ?"
            );
            $stmt->execute([$question['question_id']]);
            $questions[$key]['options'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    echo json_encode([
        'exam' => $exam,
        'questions' => $questions
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
