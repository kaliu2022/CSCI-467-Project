<?php
// Shared bootstrap for endpoints that respond with JSON.
// display_errors is off so a stray PHP notice/warning can never get printed
// ahead of the JSON body and break the client's response.json() parsing.
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require __DIR__ . '/db.php';

function getQuoteOrFail(mysqli $conn, $quote_id): array {
    $stmt = $conn->prepare('SELECT * FROM quotes WHERE quote_id = ?');
    $stmt->bind_param('i', $quote_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['errors' => ['Quote not found']]);
        exit;
    }

    return $result->fetch_assoc();
}
