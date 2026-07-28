<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Admin page</title>
    <!--<link rel="stylesheet" href="../style.css">-->
    <style>
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
      }
    </style>
  </head>
  <body>
    <h1>Admin Page</h1>
    <h3>View Quotes:</h3>
    <form action="searchQuotes.php">
        <input type="submit" value="Quotes">
    </form>
    <h3>Manage Sales Associates:</h3>
    <form action="viewSalesAssociates.php">
        <input type="submit" value="Sales Associates">
    </form>
  </body>
</html>