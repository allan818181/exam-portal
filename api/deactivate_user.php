<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require 'db_mysql.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permission denied.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$status = $data['status'] ?? '';

if (!$user_id || !in_array($status, ['active', 'banned'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID and a valid status are required.']);
    exit;
}

try {
    $pdo = connect_db();
    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    $stmt->execute([$status, $user_id]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'User status updated successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
