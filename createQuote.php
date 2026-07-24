<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$customer_id = $data['customer_id'] ?? null;
$associate_id = $data['associate_id'] ?? null;
$secret_notes = $data['secret_notes'] ?? null;
$line_items = $data['line_items'] ?? null;

if (!$customer_id || !$associate_id || !is_array($line_items) || count($line_items) === 0) {
    http_response_code(400);
    echo json_encode(['errors' => ['customer_id, associate_id, and at least one line item are required']]);
    exit;
}

// Look up the customer - has to already exist
$stmt = $conn->prepare('SELECT * FROM customers WHERE id = ?');
$stmt->bind_param('i', $customer_id);
$stmt->execute();
$customerResult = $stmt->get_result();

if ($customerResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Customer not found']]);
    exit;
}
$customer = $customerResult->fetch_assoc();

// Create the quote
$status = 'draft';
$stmt = $conn->prepare('INSERT INTO quotes (customer_id, associate_id, status, secret_notes, customer_email) VALUES (?, ?, ?, ?, ?)');
$stmt->bind_param('issss', $customer_id, $associate_id, $status, $secret_notes, $customer['contact']);
$stmt->execute();
$quote_id = $conn->insert_id;

// Add each line item, looking up its catalog price
foreach ($line_items as $item) {
    $item_id = $item['item_id'];
    $quantity = $item['quantity'] ?? 1;

    $stmt = $conn->prepare('SELECT price FROM items WHERE item_id = ?');
    $stmt->bind_param('i', $item_id);
    $stmt->execute();
    $itemResult = $stmt->get_result();

    if ($itemResult->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['errors' => ["Item id $item_id not found"]]);
        exit;
    }

    $itemRow = $itemResult->fetch_assoc();
    $price = $item['price'] ?? $itemRow['price'];

    $stmt = $conn->prepare('INSERT INTO quote_line_items (quote_id, item_id, price, quantity) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('iidi', $quote_id, $item_id, $price, $quantity);
    $stmt->execute();
}

echo json_encode(['success' => true, 'quote_id' => $quote_id, 'customer' => $customer]);