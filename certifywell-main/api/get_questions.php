<?php
session_start();
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

try {
    $pdo = connect_db();
    
    // Fetch all questions and join with subjects to get the subject name
    $stmt = $pdo->prepare(
        "SELECT q.*, s.name as subject_name 
         FROM Questions q
         JOIN Subjects s ON q.subject_id = s.subject_id
         ORDER BY q.question_id DESC"
    );
    $stmt->execute();
    $questions = $stmt->fetchAll();

    echo json_encode($questions);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
