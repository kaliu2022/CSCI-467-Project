<?php
// Edit Quote endpoint: recalculates the final amount from discount +
// line items, then saves discount/notes/status for the given quote.
require __DIR__ . '/../includes/json_api.php';

$data = json_decode(file_get_contents('php://input'), true);
$quote_id = $data['quote_id'] ?? null;
$discount_type = $data['discount_type'] ?? null;
$discount_value = $data['discount_value'] ?? 0;
$secret_notes = $data['secret_notes'] ?? null;
$status = $data['status'] ?? 'finalized';
$line_items = $data['line_items'] ?? null;

if (!$quote_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['quote_id is required']]);
    exit;
}

if (!is_array($line_items) || count($line_items) === 0) {
    http_response_code(400);
    echo json_encode(['errors' => ['At least one line item is required']]);
    exit;
}

$quote = getQuoteOrFail($conn, $quote_id);

// Replace the quote's line items with the submitted set, looking up the
// catalog price for any item that didn't have one supplied. Wrapped in a
// transaction so a bad item ID can't leave the quote with no line items.
$conn->begin_transaction();

$stmt = $conn->prepare('DELETE FROM quote_line_items WHERE quote_id = ?');
$stmt->bind_param('i', $quote_id);
$stmt->execute();

$subtotal = 0;
foreach ($line_items as $item) {
    $item_id = $item['item_id'];
    $quantity = $item['quantity'] ?? 1;

    $stmt = $conn->prepare('SELECT price FROM items WHERE item_id = ?');
    $stmt->bind_param('i', $item_id);
    $stmt->execute();
    $itemResult = $stmt->get_result();

    if ($itemResult->num_rows === 0) {
        $conn->rollback();
        http_response_code(400);
        echo json_encode(['errors' => ["Item id $item_id not found"]]);
        exit;
    }

    $itemRow = $itemResult->fetch_assoc();
    $price = $item['price'] ?? $itemRow['price'];

    $stmt = $conn->prepare('INSERT INTO quote_line_items (quote_id, item_id, price, quantity) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('iidi', $quote_id, $item_id, $price, $quantity);
    $stmt->execute();

    $subtotal += $price * $quantity;
}

$conn->commit();

// Apply the discount on top of the subtotal
$final_amount = $subtotal;
if ($discount_type === 'percent') {
    $final_amount = $subtotal - ($subtotal * ($discount_value / 100));
} elseif ($discount_type === 'amount') {
    $final_amount = $subtotal - $discount_value;
}

$stmt = $conn->prepare(
    'UPDATE quotes
     SET discount_type = ?, discount_value = ?, final_amount = ?, secret_notes = ?, status = ?
     WHERE quote_id = ?'
);
$stmt->bind_param('sddssi', $discount_type, $discount_value, $final_amount, $secret_notes, $status, $quote_id);
$stmt->execute();

// sending an "email"
if ($status === 'sanctioned') {
    error_log("[EMAIL] Sanctioned quote #$quote_id sent to {$quote['customer_email']}. Final amount: $" . number_format($final_amount, 2));
}

echo json_encode(['success' => true, 'quote_id' => $quote_id, 'final_amount' => $final_amount, 'status' => $status]);