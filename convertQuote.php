<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$quote_id = $data['quote_id'] ?? null;
$final_discount_value = $data['final_discount_value'] ?? 0;

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

if ($quote['status'] !== 'sanctioned') {
    http_response_code(400);
    echo json_encode(['errors' => ['Only sanctioned quotes can be converted to purchase orders']]);
    exit;
}

// The final discount gets added on top of whatever discount was already applied
$order_amount = $quote['final_amount'] - $final_discount_value;

// Keeps the po number unique even across multiple orders
$po_number = 'PO-' . $quote_id . '-' . round(microtime(true) * 1000);

// Send the order to the external processing system
$postData = json_encode([
    'order' => $po_number,
    'associate' => $quote['associate_id'],
    'custid' => (string)$quote['customer_id'],
    'amount' => number_format($order_amount, 2, '.', '')
]);

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method' => 'POST',
        'content' => $postData
    ]
];

$context = stream_context_create($options);
$response = file_get_contents('http://blitz.cs.niu.edu/PurchaseOrder/', false, $context);
$result = json_decode($response, true);

if (isset($result['errors'])) {
    http_response_code(400);
    echo json_encode(['errors' => $result['errors']]);
    exit;
}

// processDay comes back as "2026/8/19", mysql wants "2026-08-19"
$dateParts = explode('/', $result['processDay']);
$processing_date = $dateParts[0] . '-' . str_pad($dateParts[1], 2, '0', STR_PAD_LEFT) . '-' . str_pad($dateParts[2], 2, '0', STR_PAD_LEFT);

// Commission comes back as a string like "9%"
$commission_rate = (float)str_replace('%', '', $result['commission']);
$commission_amount = $order_amount * ($commission_rate / 100);

// Save the po details and mark the quote as ordered
$stmt = $conn->prepare(
    "UPDATE quotes
     SET status = 'ordered', po_number = ?, final_discount_value = ?, processing_date = ?,
         commission_rate = ?, commission_amount = ?
     WHERE quote_id = ?"
);
$stmt->bind_param('sdsddi', $po_number, $final_discount_value, $processing_date, $commission_rate, $commission_amount, $quote_id);
$stmt->execute();

// Credit the commission to the associate's running total
$stmt = $conn->prepare(
    'UPDATE sales_associates
     SET accumulated_commission = accumulated_commission + ?
     WHERE associate_id = ?'
);
$stmt->bind_param('ds', $commission_amount, $quote['associate_id']);
$stmt->execute();

error_log("[EMAIL] Purchase order $po_number sent to {$quote['customer_email']}. Processing date: $processing_date, Amount: $" . number_format($order_amount, 2));

echo json_encode([
    'success' => true,
    'po_number' => $po_number,
    'processing_date' => $processing_date,
    'commission_rate' => $commission_rate,
    'commission_amount' => $commission_amount,
    'order_amount' => $order_amount
]);