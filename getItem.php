<?php
require 'json_api.php';

$item_id = $_GET['id'] ?? null;

if (!$item_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['id is required']]);
    exit;
}

$stmt = $conn->prepare('SELECT item_id, description, price FROM items WHERE item_id = ?');
$stmt->bind_param('i', $item_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Item not found']]);
    exit;
}

echo json_encode(['success' => true, 'item' => $result->fetch_assoc()]);
