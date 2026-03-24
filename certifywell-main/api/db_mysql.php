<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'certifywell');
define('DB_USER', 'root');
define('DB_PASS', '');

// Function to establish a database connection
function connect_db() {
    // Let PDO throw an exception if it can't connect.
    // The calling script (e.g., signin.php) will catch it and handle it.
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    return new PDO($dsn, DB_USER, DB_PASS, $options);
}
?>
