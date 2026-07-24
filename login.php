
<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;
$password = $data['password'] ?? null;

if (!$user_id || !$password) {
    http_response_code(400);
    echo json_encode(['errors' => ['user_id and password are required']]);
    exit;
}

$stmt = $conn->prepare('SELECT associate_id, user_id, name FROM sales_associates WHERE user_id = ? AND password = ?');
$stmt->bind_param('ss', $user_id, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['errors' => ['Invalid user ID or password']]);
    exit;
}

$associate = $result->fetch_assoc();
echo json_encode(['success' => true, 'associate' => $associate]);