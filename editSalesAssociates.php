<?php
require 'db.php';
$sql = 'SELECT * FROM sales_associates WHERE associate_id = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $_GET['SalesAssociate']);

$stmt->execute();
$stmt->bind_result($associate_id, $user_id, $password, $name, $address, $accumulated_commission);
$stmt->fetch();
//$associates = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Edit Sales Associate</title>
    <!--<link rel="stylesheet" href="../style.css">-->
  </head>
  <body>
    <?php
        echo '<form method="POST" action="viewSalesAssociates.php">
        <label>Associate ID:</label>
        <input type="text" id="associate_id" name="associate_id" value='.$associate_id.'>
        <label>User ID:</label>
        <input type="text" id="user_id" name="user_id" value='.$user_id.'>
        <label>Password:</label>
        <input type="text" id="password" name="password" value='.$password.'>
        <label>Name:</label>
        <input type="text" id="name" name="name" value='.$name.'>
        <label>Address:</label>
        <input type="text" id="address" name="address" value='.$address.'>
        <label>Accumulated Commission:</label>
        <input type="text" id="accumulated_commission" name="accumulated_commission" value='.$accumulated_commission.'>';
        echo '<input type="hidden" name="original" value='.$_GET['SalesAssociate'].'>';
        echo '<input type="submit" name="select" value="Update">
        </form>';
        ?>
  </body>
</html>