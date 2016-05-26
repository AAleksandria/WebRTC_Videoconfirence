<?php
header('Content-type: text/html; charset=utf-8');

$dbhost = "localhost";
$dbname = "call";
$dbuser = "call";
$dbpasswd = "123";

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
//mysql_query("DELETE FROM call_table") or die(mysql_error());
if(isset($_POST['msg'])){

	$id = $_POST['id'];
	$flag = $_POST['flag'];
	$msg = mysql_real_escape_string($_POST['msg']);

	//mysql_query("DELETE FROM call_table") or die(mysql_error());
	
	$query = "INSERT INTO call_table ( id,message,time ) 
	VALUES ( $id , '$msg' , $flag )";
	$res = mysql_query($query) or die(mysql_error());
	echo "Запрос успешно выполнен";
}

if(isset($_POST['msg2'])){

	
	$query = "SELECT * from call_table order by time LIMIT 0,1";
	$res = mysql_query($query) or die(mysql_error());
	while($row = mysql_fetch_array($res))
	{
		echo $row['message'];
	}
	
	
	// $time = mysql_query("SELECT min(time) from call_table");
	mysql_query("DELETE FROM call_table where time=( SELECT MIN(t.time) from (SELECT time from call_table) AS t)") or die(mysql_error());
	// echo $time;
		// echo "\r\n";
	// }
}




/*
$file =''.$_SERVER["REMOTE_ADDR"].'.txt';

//-----------Отправка SendMessage()------------
if(isset($_POST['msg'])){
	echo $_POST['msg'];
	file_put_contents($file, $_POST['msg']);
}

//-----------Приём GetMessage()------------
if(isset($_POST['msg2'])){
	echo file_get_contents($file);
}
*/
?>