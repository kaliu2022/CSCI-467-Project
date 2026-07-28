<?php
require 'json_api.php';

$customer_id = $_GET['id'] ?? null;

if (!$customer_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['id is required']]);
    exit;
}

$stmt = $conn->prepare('SELECT id, name, street, city FROM customers WHERE id = ?');
$stmt->bind_param('i', $customer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Customer not found']]);
    exit;
}

echo json_encode(['success' => true, 'customer' => $result->fetch_assoc()]);
