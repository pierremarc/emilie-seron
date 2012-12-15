<?php

// base.php

?><!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<title></title>
<script>
<?php

echo 'var IS_LOGGED = '. ($is_logged ? 'true' : 'false') .';';

?>
</script>
<script src="js/jquery-1.8.3.js"></script>
<script src="js/jquery-ui-1.9.2.custom.js"></script>
<script src="js/api.js"></script>
<script src="js/plupload.full.js"></script>
<script src="js/geom.js"></script>
<script src="js/seron.js"></script>

<style>

#map{
    position:relative;
    overflow:hidden;
    width:1200px;
    height:800px;
    background-color:#ddd;
}

#layer{
    position:absolute;
    left:0;
    top:0;
    width:99999999px;
    height:99999999px;
    background-color:blue;
}

.post-item{
    position:absolute;
}

#index{
    position:fixed;
    right:0;
    top:0;
    width:200px;
    height:100%;
    border:1px solid black;
    z-index:6;
}

.form{
    position:absolute;
    top:22px;
    left:22px;
    border:3px solid black;
    padding:12px;
    background-color:rgba(255,255,255,.8);
    width:800px;
    height:600px;
    
}

#medias{
    position:absolute;
    right:0;
    top:0;
    height:100%;
    overflow:auto;
}

</style>
</head>

<body>

<div id="map">
<div id="layer"></div>
</div>
<div id="header">
</div>
<div id="index">
</div>

<?php if($is_logged): ?>

<!-- 
    TEXT FORM
-->

<div id="text-form" class="form">
<input type="hidden" name="obj_type" value="text_t" />
<input type="hidden" name="x" value="0" class="integer" />
<input type="hidden" name="y" value="0" class="integer" />
<div>
title:
<input type="text" name="title" />
</div>

<div>
content:
<input type="text" name="text_content" />
</div>
<div class="submit">save</div>
<div class="form-close">close</div>

</div>

<!-- 
    IMAGE FORM
-->

<div id="image-form" class="form">
<input type="hidden" name="obj_type" value="image_t" />
<input type="hidden" name="x" value="0" class="integer" />
<input type="hidden" name="y" value="0" class="integer" />
<input type="hidden" name="image_width" value="0" class="integer" />
<input type="hidden" name="image_height" value="0" class="integer" />
<input type="hidden" name="image_file" value="" />

<div> Nom: <input type="text" name="title" /> </div>
<div> Catégorie: <input type="text" name="category" /> </div>
<div id="form-thumbnail"></div>
<div class="submit">Enregistrer</div>
<div class="form-close">close</div>
<div id="medias">
    <div id="media-item-box"></div>
    <div id="upload">
    <div id="upload_file">[ADD FILE]</div>
    <div id="filelist"></div>
    <div id="submit_upload">upload</div>
</div>
</div>
</div>

<div id="form-button-box">
<div id="form-button-text"> Nouveau Texte </div>
<div id="form-button-image"> Nouvelle Image </div>
</div>
<?php endif ?>





</body>
</html>