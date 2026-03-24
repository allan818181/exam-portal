<?php

require_once 'db_mysql.php';
header('Content-Type: application/json');

$_SESSION = array();
session_destroy();

http_response_code(200);
echo json_encode(['message' => 'Successfully signed out.']);
?>