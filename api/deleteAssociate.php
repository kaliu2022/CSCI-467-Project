<?php
// Delete Sales Associate endpoint: removes an associate account, unless
// they still have quotes on file (blocked by the quotes.associate_id
// foreign key).
require __DIR__ . '/../includes/json_api.php';

$data = json_decode(file_get_contents('php://input'), true);
$associate_id = trim($data['associate_id'] ?? '');

if ($associate_id === '') {
    http_response_code(400);
    echo json_encode(['errors' => ['associate_id is required']]);
    exit;
}

try {
    $stmt = $conn->prepare('DELETE FROM sales_associates WHERE associate_id = ?');
    $stmt->bind_param('s', $associate_id);
    $stmt->execute();
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1451) {
        http_response_code(409);
        echo json_encode(['errors' => ['This associate has existing quotes and cannot be deleted']]);
        exit;
    }
    throw $e;
}

if ($stmt->affected_rows === 0) {
    http_response_code(404);
    echo json_encode(['errors' => ['Sales associate not found']]);
    exit;
}

echo json_encode(['success' => true]);
