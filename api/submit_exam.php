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
$answers = $data['answers'] ?? [];
$student_id = $_SESSION['user_id'];

if (!$exam_id || empty($answers)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Exam ID and answers are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $pdo->beginTransaction();

    // Find the student's current attempt for this exam
    $stmt = $pdo->prepare("SELECT attempt_id FROM Student_Exam_Attempts WHERE exam_id = ? AND student_id = ? AND status = 'started'");
    $stmt->execute([$exam_id, $student_id]);
    $attempt = $stmt->fetch();

    if (!$attempt) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No active exam attempt found.']);
        exit;
    }
    $attempt_id = $attempt['attempt_id'];

    $total_score = 0;

    foreach ($answers as $answer) {
        $question_id = $answer['question_id'];
        $option_id = $answer['option_id'] ?? null;
        $answer_text = $answer['answer_text'] ?? null;

        // Get question details for grading
        $stmt = $pdo->prepare("SELECT marks, question_type FROM Questions WHERE question_id = ?");
        $stmt->execute([$question_id]);
        $question = $stmt->fetch();

        $marks_awarded = 0;
        $is_correct = false;

        if ($question['question_type'] == 'mcq' && $option_id) {
            // Check if the selected option is correct
            $stmt = $pdo->prepare("SELECT is_correct FROM Question_Options WHERE option_id = ? AND question_id = ?");
            $stmt->execute([$option_id, $question_id]);
            $correct_option = $stmt->fetch();
            if ($correct_option && $correct_option['is_correct']) {
                $marks_awarded = $question['marks'];
                $is_correct = true;
            }
        } elseif ($question['question_type'] == 'true_false' && $option_id) {
            // Check if the selected option (True/False) is correct
            $stmt = $pdo->prepare("SELECT is_correct FROM Question_Options WHERE option_id = ? AND question_id = ?");
            $stmt->execute([$option_id, $question_id]);
            $correct_option = $stmt->fetch();
            if ($correct_option && $correct_option['is_correct']) {
                $marks_awarded = $question['marks'];
                $is_correct = true;
            }
        } elseif ($question['question_type'] == 'fill_blank' && $answer_text) {
            // Check if the provided text matches the correct answer (case-insensitive)
            $stmt = $pdo->prepare("SELECT option_text FROM Question_Options WHERE question_id = ? AND is_correct = 1");
            $stmt->execute([$question_id]);
            $correct_answer = $stmt->fetch();
            if ($correct_answer && strtolower(trim($answer_text)) == strtolower(trim($correct_answer['option_text']))) {
                $marks_awarded = $question['marks'];
                $is_correct = true;
            }
        }
        
        $total_score += $marks_awarded;

        // Save the answer
        $stmt = $pdo->prepare(
            "INSERT INTO Answers (attempt_id, question_id, option_id, answer_text, is_correct, marks_awarded) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$attempt_id, $question_id, $option_id, $answer_text, $is_correct, $marks_awarded]);
    }

    // Update the attempt status and score
    $stmt = $pdo->prepare("UPDATE Student_Exam_Attempts SET status = 'submitted', score = ?, end_time = NOW() WHERE attempt_id = ?");
    $stmt->execute([$total_score, $attempt_id]);
    
    $pdo->commit();

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Exam submitted successfully!', 'score' => $total_score]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
