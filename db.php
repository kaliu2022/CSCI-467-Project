<?php
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'quotesystem';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(['errors' => ['Database connection failed: ' . $conn->connect_error]]));
}