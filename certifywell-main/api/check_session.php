<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    // User is logged in
    echo json_encode([
        'loggedIn' => true,
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ]);
} else {
    // User is not logged in
    echo json_encode(['loggedIn' => false]);
}
?>
