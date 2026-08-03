<?php
// List Sales Associates endpoint: returns every associate for the
// sales-associate management page.
require __DIR__ . '/../includes/json_api.php';

$stmt = $conn->prepare('SELECT associate_id, user_id, password, name, address, accumulated_commission FROM sales_associates ORDER BY associate_id ASC');
$stmt->execute();
$associates = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'associates' => $associates]);
