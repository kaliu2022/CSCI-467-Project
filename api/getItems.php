<?php
require __DIR__ . '/../includes/json_api.php';

$stmt = $conn->prepare('SELECT item_id, description, price FROM items ORDER BY description');
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'items' => $items]);
