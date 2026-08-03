<?php
// Create Sales Associate endpoint: adds a new associate account.
// associate_id isn't supplied by the caller - it's generated here in the
// same "RE-######" format as the existing associates.
require 'json_api.php';

$data = json_decode(file_get_contents('php://input'), true);
$user_id = trim($data['user_id'] ?? '');
$password = $data['password'] ?? '';
$name = trim($data['name'] ?? '');
$address = trim($data['address'] ?? '');
$accumulated_commission = $data['accumulated_commission'] ?? 0;

if ($user_id === '' || $password === '' || $name === '') {
    http_response_code(400);
    echo json_encode(['errors' => ['user_id, password, and name are required']]);
    exit;
}

function generateAssociateId(mysqli $conn): string {
    do {
        $candidate = 'RE-' . str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $stmt = $conn->prepare('SELECT 1 FROM sales_associates WHERE associate_id = ?');
        $stmt->bind_param('s', $candidate);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
    } while ($exists);

    return $candidate;
}

$associate_id = generateAssociateId($conn);

try {
    $stmt = $conn->prepare(
        'INSERT INTO sales_associates (associate_id, user_id, password, name, address, accumulated_commission)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssssd', $associate_id, $user_id, $password, $name, $address, $accumulated_commission);
    $stmt->execute();
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        http_response_code(409);
        echo json_encode(['errors' => ["User ID \"$user_id\" is already in use"]]);
        exit;
    }
    throw $e;
}

echo json_encode(['success' => true, 'associate_id' => $associate_id]);
