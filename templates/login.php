<?php

// login.php

?><!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<title>Login page</title>
<style>

body{
    margin:0;
    padding:0;
    font-family:sans-serif;
    background-color:#1456A5;
}

#form{
    width:300px;
/*     height:130px; */
    margin:10% auto 0 auto;
    border:2px solid #888;
    padding:10px;
    background-color:#fff;
}

.input-box{
    
}

.input{
    width:100%;
    background-color:#eee;
    font-size:14pt;
    color:#666;
    border:1px solid #888;
}

#submit-box{
    text-align:center;
    margin-top:16px;
}

</style>
<script src="<?php echo $ROOT_URI; ?>/js/jquery-1.8.3.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/md5.js"></script>
<script>
<?php
echo 'var IS_LOGGED = '. ($is_logged ? 'true' : 'false') .';';
?>

$(document).ready(function(){
    $('#submit').on('click', function(){
        var hash = md5(md5($('#p').val()) + '<?php echo session_id(); ?>');
        var user = $('#u').val();
        $.getJSON('/login', {u:user, p:hash}, function(data){
            if(data.status === 'ok')
            {
                window.location = '/';
            }
            else
            {
                $('#p').val('');
                $('#u').val('');
                alert(data.message);
            }
        });
    });
});


</script>
</head>
<body>
<div id="form">

<div class="input-box">
<div class="input-label">
Identifiant
</div>
<input class="input" type="text" id="u" />
</div>

<div class="input-box">
<div class="input-label">
Mot de passe
</div>
<!-- <input id="p" type="hidden" name="p" /> -->
<input id="p" class="input" type="password" />
</div>

<div id="submit-box">
<span id="submit">Valider</span>
</div>
</div>

</body>
</html>