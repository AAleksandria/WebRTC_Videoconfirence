<?php
session_start();
//--------------Подключение к БД-----------------
header('Content-type: text/html; charset=utf-8');

$dbhost = "localhost";
$dbname = "call";
$dbuser = "call";
$dbpasswd = "";

$baza=false;

function dbConnect()
{
    global $dbhost, $dbuser, $dbpasswd, $dbname, $baza;
    if (!$baza) {
        mysql_connect( $dbhost, $dbuser, $dbpasswd ) or die( "Ошибка подключения к БД" );
        mysql_select_db( $dbname );
        $baza=true;
    }
}

dbConnect();

//mysql_query("DELETE FROM call_table") or die(mysql_error()); //--------Удаление всех полей таблицы 


//--------------Запрос на запись(SendMess)-----------------
if(isset($_POST['msg'])){

	$id = mysql_real_escape_string($_POST['id']);
	$id2 = mysql_real_escape_string($_POST['id2']);
	$msg = mysql_real_escape_string($_POST['msg']);
	$flag = $_POST['flag'];
	
	$query = "INSERT INTO call_table ( id, id2, message, flag ) 
	VALUES ( '$id', '$id2', '$msg', $flag )";
	$res = mysql_query($query) or die(mysql_error());
	echo "Запись в БД: " + $msg;
}
//--------------Запрос на чтение(GetMess)-----------------
if(isset($_POST['msg2'])){

	$s_id = $_SESSION['login']; 
	$query = "SELECT * from call_table where id2 =\"$s_id\" order by flag LIMIT 0,1";
	$res = mysql_query($query) or die(mysql_error());
	while($row = mysql_fetch_array($res))
	{
		$json = array(
				'message' => $row['message'],
				'id' => $row['id']
			);
		// var_dump(json_encode($json));
		echo json_encode($json);
		//echo $row['message'];
	}
	
	
	//mysql_query("DELETE FROM call_table where time=( SELECT MIN(t.time) from (SELECT time from call_table) AS t)") or die(mysql_error());
}

if(isset($_POST['delMess'])){
	$id = $_POST['id2'];
	mysql_query("DELETE FROM call_table where flag = ( SELECT MIN(t.flag) from (SELECT flag from call_table) AS t) and id = '$id'") or die(mysql_error());
}

if(isset($_POST['del'])){
	mysql_query("DELETE FROM call_table") or die(mysql_error());
}

?>