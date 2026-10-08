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
$attempt_id = $data['attempt_id'] ?? null;
$grades = $data['grades'] ?? [];

if (!$attempt_id || empty($grades)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Attempt ID and grades are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $pdo->beginTransaction();

    // Update marks for each subjective answer
    $update_stmt = $pdo->prepare("UPDATE Answers SET marks_awarded = ? WHERE answer_id = ?");
    foreach ($grades as $grade) {
        $update_stmt->execute([$grade['marks_awarded'], $grade['answer_id']]);
    }

    // Recalculate the total score
    $stmt = $pdo->prepare("SELECT SUM(marks_awarded) as total_score FROM Answers WHERE attempt_id = ?");
    $stmt->execute([$attempt_id]);
    $result = $stmt->fetch();
    $total_score = $result['total_score'] ?? 0;

    // Update the attempt with the new total score and status
    $stmt = $pdo->prepare("UPDATE Student_Exam_Attempts SET score = ?, status = 'graded' WHERE attempt_id = ?");
    $stmt->execute([$total_score, $attempt_id]);

    $pdo->commit();

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Exam graded successfully!']);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
