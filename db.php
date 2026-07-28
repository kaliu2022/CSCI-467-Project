<?php
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'csci_467';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(['errors' => ['Database connection failed: ' . $conn->connect_error]]));
}