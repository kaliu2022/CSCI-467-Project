<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$quote_id = $data['quote_id'] ?? null;
$discount_type = $data['discount_type'] ?? null;
$discount_value = $data['discount_value'] ?? 0;
$secret_notes = $data['secret_notes'] ?? null;
$status = $data['status'] ?? 'finalized';

if (!$quote_id) {
    http_response_code(400);
    echo json_encode(['errors' => ['quote_id is required']]);
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

$stmt = $conn->prepare('SELECT * FROM quote_line_items WHERE quote_id = ?');
$stmt->bind_param('i', $quote_id);
$stmt->execute();
$lineItems = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Add up price * quantity across every line item
$subtotal = 0;
foreach ($lineItems as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

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