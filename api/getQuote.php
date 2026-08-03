<?php
require __DIR__ . '/../includes/json_api.php';

$quote_id = $_GET['id'] ?? null;

if (!$quote_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['id is required']]);
    exit;
}

$quote = getQuoteOrFail($conn, $quote_id);

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