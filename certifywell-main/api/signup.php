<?php
ob_start(); // Start output buffering

session_start();
require 'db_mysql.php';

// Clear any stray output from the buffer
ob_clean();

// Set the content type to JSON
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Basic validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long.']);
    exit;
}


try {
    $pdo = connect_db();

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409); // 409 Conflict
        echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user with a default role of 'student'
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'student')");
    $stmt->execute([$username, $email, $hashedPassword]);

    http_response_code(201); // 201 Created
    echo json_encode(['success' => true, 'message' => 'Account created successfully!']);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred. Please try again later.']);
    exit;
}
?>
