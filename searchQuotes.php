<?php
// Search Quotes endpoint: returns quotes matching an optional set of
// filters. All filters are optional and only applied when present.
require 'json_api.php';

$status = $_GET['status'] ?? null;
$associate_id = $_GET['associate_id'] ?? null;
$customer_id = $_GET['customer_id'] ?? null;
$date_from = $_GET['date_from'] ?? null;
$date_to = $_GET['date_to'] ?? null;

$conditions = [];
$params = [];
$types = '';

if ($status) {
    $conditions[] = 'status = ?';
    $params[] = $status;
    $types .= 's';
}
if ($associate_id) {
    $conditions[] = 'associate_id = ?';
    $params[] = $associate_id;
    $types .= 's';
}
if ($customer_id) {
    $conditions[] = 'customer_id = ?';
    $params[] = $customer_id;
    $types .= 'i';
}
if ($date_from) {
    $conditions[] = 'created_date >= ?';
    $params[] = $date_from;
    $types .= 's';
}
if ($date_to) {
    $conditions[] = 'created_date <= ?';
    $params[] = "$date_to 23:59:59";
    $types .= 's';
}

$sql = 'SELECT * FROM quotes';
if (count($conditions) > 0) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}
$sql .= ' ORDER BY created_date DESC';

$stmt = $conn->prepare($sql);

// bind_param needs its arguments passed by reference, so we build them dynamically
if (count($params) > 0) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$quotes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'quotes' => $quotes, 'count' => count($quotes)]);
