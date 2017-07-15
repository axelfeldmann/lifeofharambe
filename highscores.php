<?php
  error_reporting(E_ALL);
  ini_set('display_errors', 1);


$con = new mysqli('localhost','axelfeld_admin','Ceciltheli0n','axelfeld_harambe_scores');
	
  if (!$con){
  die('Could not connect: ' . mysqli_error($con));
  }
	
  if(isset($_GET['name']) && isset($_GET['score']) && isset($_GET['meme'])){
    
    $sig = bcpowmod($_GET['meme'], 192133, 339803);
    $validate = 0;
    for($j = 0; $j < strlen($_GET['name']); $j++){
      $validate += ord($_GET['name'][$j]);
    }
    $validate += $_GET['score'];
    
    $bottom_result = $con->query("select * from highscores order by score limit 1");
    $bottom_row = mysqli_fetch_row($bottom_result);
    
    if($_GET['score'] > $bottom_row[1] && $_GET['score'] < 420 && $sig == $validate && preg_match('/^[ \w.-]+$/', $_GET['name'])){
    
      echo "validation complete";
      
      if($stmt = $con->prepare('insert into highscores values (?, ?)')) {
        $con->query("delete * from highscores order by score desc limit 1");
        $stmt->bind_param('si', $_GET['name'], $_GET['score']);
   
        mysqli_stmt_execute($stmt);
      }
      else {
	echo "Fail";
      }
    }
    else{
      echo "YOU'RE THE REASON HARAMBE DIED.";
    }
    }
    
  else {
    $results = $con->query("select * from highscores order by score desc limit 10");
    echo '[';
    while($row = mysqli_fetch_row($results)) {
    echo '{"name":"' . $row[0] . '","score":' . $row[1] . '},';
    }
    echo '{}]';
    /*for ($i = 0; $i < 10 && ($row = $result->fetch_object()); $i++){
        echo $row;
    }*/
  }
  $con->close();
?>