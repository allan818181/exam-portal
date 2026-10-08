<?php
ob_start(); // Start output buffering

session_start();
require 'db_mysql.php';

// Clear any stray output from the buffer
ob_clean(); 

// Set the content type to JSON
header('Content-Type: application/json');

// Get the posted data
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

try {
    $pdo = connect_db();
    
    $stmt = $pdo->prepare("SELECT id, username, role, status, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Check if the user is banned
        if ($user['status'] === 'banned') {
            http_response_code(403); // Forbidden
            echo json_encode(['success' => false, 'message' => 'This account has been temporarily banned.']);
            exit;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Login successful!']);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    // In a production environment, you might not want to expose the detailed error message.
    echo json_encode(['success' => false, 'message' => 'A server error occurred. Please try again later.']);
    // For debugging, you could log the detailed error: error_log($e->getMessage());
    exit;
}
?>
