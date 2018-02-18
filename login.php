<?php
    require_once "func/function.php"; 
    session_start();  

     if(isset($_POST['log'])){         
     // по нажатию на кнопку с именем login

     // создаём и заполняем переменные

        $login = htmlspecialchars($_POST['l_login']);
        $password = md5(htmlspecialchars( $_POST['l_password'] ));
        $bad = false;

         // очищяем данные с сессий
        
        // unset($_SESSION['err_log_login']);
        // unset($_SESSION['err_log_login2']);
        // unset($_SESSION['err_log_password']);
        // unset($_SESSION['err_log_password2']);
        // unset($_SESSION['err_log_password3']);
        // unset($_SESSION['auth']);
        
        //  // проверки на правильность ввода

        // if( (strlen($login) <= 3) || (strlen($login) > 32) ){
        //      $_SESSION['err_log_login'] = 1;
        //      $bad = true;
        // }
        // if( $login == null || $login == ''){
        //      $_SESSION['err_log_login2'] = 1;
        //      $bad = true;
        // }

        // if( (strlen($password) <= 6) || (strlen($password) > 32) ){
        //      $_SESSION['err_log_password'] = 1;
        //      $bad = true;
        // }
        // if( $password == null || $password == ''){
        //      $_SESSION['err_log_password2'] = 1;
        //      $bad = true;
        // }

        // if( $password == null && $login == null ){
        //      $_SESSION['err_log_password3'] = 1;
        //      $bad = true;
        // }
        // var_dump($bad);
        // if(!$bad){
            // var_dump($login);
            
            if( checkUser( $login, $password ) ){
                $_SESSION['auth'] = 1;
                $_SESSION['login'] = $login;
                header("Location: index.php"); 

            } else {
                header("Location: login.php");                
            }
        // } 

    }       
        
         // если ошибок нет, то входим, создаём и заполняем переменные для сессии, переходим на главную
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Авторизация</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="./dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="./css/style.css">
  </head>

  <body>

    <div class="container">



      <form class="form-signin ajax"  method="post" action="">
     
         <!-- 
            if (isset($_SESSION['err_log_password3']) == 1) echo'<div class="main-error alert alert-error"><p>Введите данные.</p></div>';
            else if (isset($_SESSION['err_log_login']) == 1) echo'<div class="main-error alert alert-error"><p>Введите логин более 3 символов.</p></div>';
            else if (isset($_SESSION['err_log_login2']) == 1) echo'<div class="main-error alert alert-error"><p>Введите логин.</p></div>';
            else if (isset($_SESSION['err_log_password']) == 1) echo'<div class="main-error alert alert-error"><p>Введите пароль более 6 символов.</p></div>';
            else if (isset($_SESSION['err_log_password2']) == 1) echo'<div class="main-error alert alert-error"><p>Введите пароль.</p></div>';
            
             -->
           
        

        <h2 class="form-signin-heading">Авторизация</h2>
        <input name="l_login" type="text" class="input-block-level" placeholder="Логин" autofocus>
        <input name="l_password" type="password" class="input-block-level" placeholder="Пароль">
        <button class="btn btn-large btn-primary" name="log" type="submit">Вход</button>
        <div class="alert alert-info" style="margin-top:15px;">
            <p>Если вы не зарегистрированны,то перейдите на страницу <a href="reg.php">Регистрация.</a>
        </div>
      </form>



    </div> 

  <script src="./js/adapter.js"></script>
  <script src="./js/common.js"></script>  

  </body>
</html>