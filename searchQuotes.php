<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

//header('Content-Type: application/json');
require 'db.php';

// All filters are optional and will only be used if they are given in the GET request
$status = $_GET['Status'] ?? null;
$associate_id = $_GET['SalesAssociate'] ?? null;
$customer_id = $_GET['Customer'] ?? null;
$date_from = $_GET['Earliest'] ?? null;
$date_to = $_GET['Latest'] ?? null;

$conditions = [];
$params = [];
$types = '';

if ($status) {
    $conditions[] = 'status = ?';
    $params[] = $status;
    $types .= 's';
}
if ($associate_id) {
    $conditions[] = 'associate_id = ?';
    $params[] = $associate_id;
    $types .= 's';
}
if ($customer_id) {
    $conditions[] = 'customer_id = ?';
    $params[] = $customer_id;
    $types .= 'i';
}
if ($date_from) {
    $conditions[] = 'created_date >= ?';
    $params[] = $date_from;
    $types .= 's';
}
if ($date_to) {
    $conditions[] = 'created_date <= ?';
    $params[] = $date_to;
    $types .= 's';
}

$sql = 'SELECT * FROM quotes';
if (count($conditions) > 0) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}
$sql .= ' ORDER BY created_date DESC';

$stmt = $conn->prepare($sql);

// bind_param needs its arguments passed by reference, so we build them dynamically
if (count($params) > 0) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$quotes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

//echo json_encode(['success' => true, 'quotes' => $quotes, 'count' => count($quotes)]);
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Search Quotes</title>
    <!--<link rel="stylesheet" href="../style.css">-->
    <style>
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
      }
    </style>
  </head>
  <body>
    <?php
    echo '<form action="admin.php">
    <input type=submit value="<-back">
    </form>';

    echo '<h1>Quotes</h1>';
    echo '<h3>Search</h3>';
    echo '<form method="GET">';
    
    $result = $conn->query("SELECT DISTINCT customer_id FROM quotes ORDER BY customer_id ASC");
    $rows = $result->fetch_all(MYSQLI_BOTH);
    echo '<label>Customer: </label>';
    echo '<select id = "Customer" name = "Customer">';
    echo '<option></option>';
    foreach ($rows as $row){
      echo '<option value="'.$row['customer_id'].'">'.$row['customer_id'].'</option> <br/>';
    }
    echo '</select>';

    $result = $conn->query("SELECT DISTINCT associate_id FROM quotes ORDER BY associate_id ASC");
    $rows = $result->fetch_all(MYSQLI_BOTH);
    echo '<label>  Associate: </label>';
    echo '<select id = "SalesAssociate" name = "SalesAssociate">';
    echo '<option></option>';
    foreach ($rows as $row){
      echo '<option value="'.$row['associate_id'].'">'.$row['associate_id'].'</option> <br/>';
    }
    echo '</select>';

    $result = $conn->query("SELECT DISTINCT status FROM quotes ORDER BY status ASC");
    $rows = $result->fetch_all(MYSQLI_BOTH);
    echo '<label>  Status: </label>';
    echo '<select id = "Status" name = "Status">';
    echo '<option></option>';
    foreach ($rows as $row){
      echo '<option value="'.$row['status'].'">'.$row['status'].'</option> <br/>';
    }
    echo '</select>';

    $result = $conn->query("SELECT DISTINCT created_date FROM quotes ORDER BY created_date ASC");
    $rows = $result->fetch_all(MYSQLI_BOTH);
    echo '<label>  After: </label>';
    echo '<select id = "Earliest" name = "Earliest">';
    echo '<option></option>';
    foreach ($rows as $row){
      echo '<option value="'.$row['created_date'].'">'.$row['created_date'].'</option> <br/>';
    }

    echo '</select>';
    $result = $conn->query("SELECT DISTINCT created_date FROM quotes ORDER BY created_date ASC");
    $rows = $result->fetch_all(MYSQLI_BOTH);
    echo '<label>  Before: </label>';
    echo '<select id = "Latest" name = "Latest">';
    echo '<option></option>';
    foreach ($rows as $row){
      echo '<option value="'.$row['created_date'].'">'.$row['created_date'].'</option> <br/>';
    }
    echo '</select>';

    echo '<input type="submit">';
    
    echo '</form>';

    echo '<table><tr>
      <th>customer_id</th>
      <th>associate_id</th>
      <th>status</th>
      <th>created_date</th>
      </tr>';
      foreach ($quotes as $index => $row){
        echo"<tr>
          <td>".$row['customer_id']."</td>
          <td>".$row['associate_id']."</td>
          <td>".$row['status']."</td>
          <td>".$row['created_date']."</td>
        </tr>";
      }
          
      echo '</table>';
      //*/
      
    
    ?>

  </body>
</html>
