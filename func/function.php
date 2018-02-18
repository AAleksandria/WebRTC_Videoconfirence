<?php

	// подключаемся к базе данных
	function connectionDB(){
		return new mysqli("localhost","call","","call");
	}

	// выходим с базы данных
	function closeDB($mysqli){
		$mysqli->close();
	}

	// регистрация пользователя
	function regUser($login,$password){
		$mysqli = connectionDB();
		$mysqli->query(" INSERT INTO users (username, password) VALUES ('$login', '$password') ");
		closeDB($mysqli);
	}

	// проверка есть ли пользователь в базе для авторизации 
	function checkUser($login,$password){
		if ( ($login == "") || ($password == "") ) return false;
		$mysqli = connectionDB();
		$result_set = $mysqli->query("SELECT password from users where username='$login' ");
		var_dump(mysqli_error($mysqli));
		$user = $result_set->fetch_assoc();
		$real_password = $user['password'];
		closeDB($mysqli);	
		return $real_password == $password;
	}

?>