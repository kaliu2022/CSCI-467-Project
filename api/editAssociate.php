<?php
// Edit Sales Associate endpoint: updates an existing associate's account
// details and/or accumulated commission.
require __DIR__ . '/../includes/json_api.php';

$data = json_decode(file_get_contents('php://input'), true);
$associate_id = trim($data['associate_id'] ?? '');
$user_id = trim($data['user_id'] ?? '');
// An empty password means "leave it unchanged" - the associate list
// endpoint never sends the current password back to the browser, so
// there's nothing to prefill and re-submit.
$password = $data['password'] ?? '';
$name = trim($data['name'] ?? '');
$address = trim($data['address'] ?? '');
$accumulated_commission = $data['accumulated_commission'] ?? 0;

if ($associate_id === '' || $user_id === '' || $name === '') {
    http_response_code(400);
    echo json_encode(['errors' => ['associate_id, user_id, and name are required']]);
    exit;
}

$stmt = $conn->prepare('SELECT associate_id FROM sales_associates WHERE associate_id = ?');
$stmt->bind_param('s', $associate_id);
$stmt->execute();
if ($stmt->get_result()->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Sales associate not found']]);
    exit;
}

try {
    if ($password !== '') {
        $stmt = $conn->prepare(
            'UPDATE sales_associates
             SET user_id = ?, password = ?, name = ?, address = ?, accumulated_commission = ?
             WHERE associate_id = ?'
        );
        $stmt->bind_param('ssssds', $user_id, $password, $name, $address, $accumulated_commission, $associate_id);
    } else {
        $stmt = $conn->prepare(
            'UPDATE sales_associates
             SET user_id = ?, name = ?, address = ?, accumulated_commission = ?
             WHERE associate_id = ?'
        );
        $stmt->bind_param('sssds', $user_id, $name, $address, $accumulated_commission, $associate_id);
    }
    $stmt->execute();
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        http_response_code(409);
        echo json_encode(['errors' => ["User ID \"$user_id\" is already in use"]]);
        exit;
    }
    throw $e;
}

echo json_encode(['success' => true, 'associate_id' => $associate_id]);
