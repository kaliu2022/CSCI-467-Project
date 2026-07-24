<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$quote_id = $_GET['id'] ?? null;

if (!$quote_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['id is required']]);
    exit;
}

$stmt = $conn->prepare('SELECT * FROM quotes WHERE quote_id = ?');
$stmt->bind_param('i', $quote_id);
$stmt->execute();
$quoteResult = $stmt->get_result();

if ($quoteResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Quote not found']]);
    exit;
}
$quote = $quoteResult->fetch_assoc();

$stmt = $conn->prepare(
    'SELECT qli.quote_id, qli.item_id, i.description, qli.price, qli.quantity
     FROM quote_line_items qli
     JOIN items i ON qli.item_id = i.item_id
     WHERE qli.quote_id = ?'
);
$stmt->bind_param('i', $quote_id);
$stmt->execute();
$lineItemsResult = $stmt->get_result();
$lineItems = $lineItemsResult->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'quote' => $quote, 'line_items' => $lineItems]);