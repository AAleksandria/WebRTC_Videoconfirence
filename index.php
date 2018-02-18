
<?php
    // require_once "func/function.php";
    session_start();
    if(!isset($_SESSION['auth']) ){
      header("Location: login.php");
    }
    
?>

<!DOCTYPE html>
<html>
<head>

  <meta charset="utf-8">
  <title>WebRTC video conference</title>
  <link rel="stylesheet"  href="./vendor/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="./dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="./css/style.css">

</head>

<body>

<nav class="navbar navbar-dark navbar-fixed-top bg-inverse">
<div class="navbar">
    <a class="navbar-brand" href="index.php">Главная</a> 
        <nav class="nav navbar-nav" id="reg">
            <p class="nav-item nav-link" id="user1"><?php echo $_SESSION['login']; ?></p>
            <a class="nav-item nav-link" href="disconnect.php">Выход</a>  
        </nav> 
</div>
</nav>
    
<div id="container">
    <div id="video">
        <video id="remote"  autoplay></video>
        <video id="local" autoplay muted></video>
    </div>
    
    <div id="sidebar">
        <input type="text" id="user2" size="40" placeholder="Ник собеседника">
        <button id="call" class="btn btn-inverse">Call</button>
<!--         <button id="answer" class="btn btn-inverse">Answer</button> -->
        <button id="hangUp" class="btn btn-inverse">Hang Up</button>
        <button id="del" class="btn btn-inverse">Delete</button>
        <button id="" class="btn btn-inverse" data-toggle="modal" data-target="#modal-1" style="display: none;">Modal</button>
    </div>
</div>

  <div class="modal" id="modal-1">
    <div class="modal-dialog" id="modal-dialog1">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Вам звонит <?php echo $_SESSION['login']; ?> пользователь</h4> 
        </div>
        <div class="modal-footer">
          <button class="btn btn-success" type="button" data-dismiss="modal" onclick="doAnswer()">Принять</button>
          <button class="btn btn-danger" type="button" data-dismiss="modal">Отклонить</button>
        </div>
      </div>
    </div>

  </div>  

  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
  <script src="./vendor/bootstrap/js/bootstrap.min.js"></script>
  <!-- // <script src="./dist/js/bootstrap.min.js"></script> -->
  <script src="./js/adapter.js"></script>
  <script src="./js/common.js"></script>
  <script src="./js/main.js"></script>


</body>
</html>