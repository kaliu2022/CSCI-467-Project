<?php
//ini_set('display_errors', 1);
//error_reporting(E_ALL);

//header('Content-Type: application/json');
require 'db.php';
$sql = 'SELECT * FROM sales_associates';
$stmt = $conn->prepare($sql);

$stmt->execute();
$associates = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Manage Sales Associates</title>
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
        if(($_POST['select'] ?? "") == "Delete"){
            $sql = 'DELETE FROM sales_associates WHERE associate_id = ';
            $sql .= '"'.$_POST['SalesAssociate'].'"';
            
            if($conn->query($sql) === false){
                echo "Error deleting record: " . $conn->error . "</br>";
            }
        } else if(($_POST['select'] ?? "") == "Add"){
            $sql = "INSERT INTO `sales_associates` (`associate_id`, `user_id`, `password`, `name`, `address`, `accumulated_commission`) VALUES (";
            $sql .= "'".$_POST['associate_id']."', ";
            $sql .= "'".$_POST['user_id']."', ";
            $sql .= "'".$_POST['password']."', ";
            $sql .= "'".$_POST['name']."', ";
            $sql .= "'".$_POST['address']."', ";
            $sql .= "'".$_POST['accumulated_commission']."')";
            $e = "error";
            try{
                $conn->query($sql) === false;
            } catch(Exception $e){
                echo "Error adding record: " . $e->getMessage() . "</br>";
            }
        } else if(($_POST['select'] ?? "") == "Update"){
            $sql = "UPDATE `sales_associates` SET 
            `associate_id`='".$_POST['associate_id'].
            "',`user_id`='".$_POST['user_id'].
            "',`password`='".$_POST['password'].
            "',`name`='".$_POST['name'].
            "',`address`='".$_POST['address'].
            "',`accumulated_commission`='".$_POST['accumulated_commission'].
            "' WHERE associate_id = '".$_POST['original']."'";
            $e = "error";
            try{
                $conn->query($sql) === false;
            } catch(Exception $e){
                echo "Error adding record: " . $e->getMessage() . "</br>";
            }
        }
        
        $sql = 'SELECT * FROM sales_associates';
        $stmt = $conn->prepare($sql);

        $stmt->execute();
        $associates = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        echo '<h1>Sales Associates</h1>';
        echo '<table><tr>
        <th>associate_id</th>
        <th>user_id</th>
        <th>password</th>
        <th>name</th>
        <th>address</th>
        <th>accumulated_commission</th>
        </tr>';
        foreach ($associates as $index => $row){
            echo"<tr>
            <td>".$row['associate_id']."</td>
            <td>".$row['user_id']."</td>
            <td>".$row['password']."</td>
            <td>".$row['name']."</td>
            <td>".$row['address']."</td>
            <td>".$row['accumulated_commission']."</td>
            </tr>";
        }
        echo '</table>';

        echo '<h3>Delete Sales Associate</h3>';
        echo '<form method="POST">';
        $result = $conn->query("SELECT DISTINCT associate_id FROM sales_associates ORDER BY associate_id ASC");
        $rows = $result->fetch_all(MYSQLI_BOTH);
        echo '<label>  Associate: </label>';
        echo '<select id = "SalesAssociate" name = "SalesAssociate">';
        echo '<option></option>';
        foreach ($rows as $row){
            echo '<option value="'.$row['associate_id'].'">'.$row['associate_id'].'</option> <br/>';
        }
        echo '</select>';
        echo '<input type="submit" name="select" value="Delete">';
        echo '</form>';

        echo '<h3>Add Sales Associate</h3>';
        echo '<form method="POST">
        <label>Associate ID:</label>
        <input type="text" id="associate_id" name="associate_id">
        <label>User ID:</label>
        <input type="text" id="user_id" name="user_id">
        <label>Password:</label>
        <input type="text" id="password" name="password">
        <label>Name:</label>
        <input type="text" id="name" name="name">
        <label>Address:</label>
        <input type="text" id="address" name="address">
        <label>Accumulated Commission:</label>
        <input type="text" id="accumulated_commission" name="accumulated_commission">';
        echo '<input type="submit" name="select" value="Add">
        </form>';

        echo "<h3>Edit Sales Associate<h3>\n";
        echo '<form method="GET" action="editSalesAssociates.php">'; //action="editSalesAssociates.php"
        $result = $conn->query("SELECT DISTINCT associate_id FROM sales_associates ORDER BY associate_id ASC");
        $rows = $result->fetch_all(MYSQLI_BOTH);
        echo "\n<label>  Associate: </label>\n";
        echo '<select id = "SalesAssociate" name = "SalesAssociate">';
        echo "\n<option></option>\n";
        foreach ($rows as $row){
            echo '<option value="'.$row['associate_id'].'">'.$row['associate_id']."</option>\n";
        }
        echo '</select>';
        echo '<input type="submit" value="Edit">';
        echo '</form>';
    ?>
  </body>
</html>