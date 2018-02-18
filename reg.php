<?php
    require_once "func/function.php";   // подключение function.php
    session_start();                    // включение сессии
    
    if(isset($_POST['reg'])){           // по нажатию на кнопку с именем reg 
        
        // создаём и заполняем переменные

        $login = htmlspecialchars($_POST['r_login']);
        $password = htmlspecialchars($_POST['r_password']);
        $password2 = htmlspecialchars($_POST['r_password2']);
        $bad = false;

        // очищяем данные с сессий
        
        unset($_SESSION['err_reg_login']);
        unset($_SESSION['err_reg_login2']);
        unset($_SESSION['err_reg_password']);
        unset($_SESSION['err_reg_password2']);
        unset($_SESSION['err_reg_password3']);
        unset($_SESSION['err_reg_password4']);
        unset($_SESSION['reg_success']);

        // проверки на правильность ввода

        if( (strlen($login) <= 3) || (strlen($login) > 32) ){
            $_SESSION['err_reg_login'] = 1;
            $bad = true;
        }
        
        if( $login == null || $login == ''){
            $_SESSION['err_reg_login2'] = 1;
            $bad = true;
        }

        if( $password == null && $login == null && $password2 == null){
            $_SESSION['err_reg_password'] = 1;
            $bad = true;
        }

        if( (strlen($password) <= 6) || (strlen($password) > 32) ){
            $_SESSION['err_reg_password2'] = 1;
            $bad = true;
        }

        if( $password == null || $password == ''){
            $_SESSION['err_reg_password3'] = 1;
            $bad = true;
        }

        if( $password !== $password2 ){
            $_SESSION['err_reg_password4'] = 1;
            $bad = true;
        }
        
        
        // если ошибок нет то регистрируем, создаём и записываем в сессию, переходим на главную

        if(!$bad){
            regUser($login, md5($password));
            $_SESSION['reg_success'] = 1;
            header("Location: index.php");
        }
    }


?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Регистрация</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="./dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="./css/style.css">
  </head>

  <body>

    <div class="container">

      <form class="form-signin ajax"  method="post" action="">
    
        <!-- Вывод ошибок в случае неправельного ввода  -->

        <?php 
            if (isset($_SESSION['err_reg_password']) == 1) echo'<div class="main-error alert alert-error"><p>Введите данные.</p></div>';
            else if (isset($_SESSION['err_reg_login']) == 1) echo'<div class="main-error alert alert-error"><p>Введите логин более 3 символов.</p></div>';
            else if (isset($_SESSION['err_reg_login2']) == 1) echo'<div class="main-error alert alert-error"><p>Введите логин.</p></div>';
            else if (isset($_SESSION['err_reg_password2']) == 1) echo'<div class="main-error alert alert-error"><p>Введите пароль более 6 символов.</p></div>';
            else if (isset($_SESSION['err_reg_password3']) == 1) echo'<div class="main-error alert alert-error"><p>Введите пароль.</p></div>';
            else if (isset($_SESSION['err_reg_password4']) == 1) echo'<div class="main-error alert alert-error"><p>Пароли не совпадают.</p></div>';
        ?>    
        
        <h2 class="form-signin-heading">Регистрация</h2>
        <input name="r_login" type="text" class="input-block-level" placeholder="Логин" autofocus value="">
        <input name="r_password" type="password" class="input-block-level" placeholder="Пароль" value="">
        <input name="r_password2" type="password" class="input-block-level" placeholder="Повторите пароль">
        <button class="btn btn-large btn-primary" name="reg" type="submit">Регистрация</button>
        <div class="alert alert-info" style="margin-top:15px;">
            <p>Если вы зарегистрированны,то перейдите на страницу <a href="login.php">Войти.</a>
        </div>
      </form>



    </div> 

  <script src="./js/adapter.js"></script>
  <script src="./js/common.js"></script>  

  </body>
</html>
