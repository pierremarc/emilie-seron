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

if(isset($start_id))
{
    echo 'var start_id="'.$start_id.'";';
}

?>
</script>
<script src="<?php echo $ROOT_URI; ?>/js/jquery-1.8.3.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/jquery-ui-1.9.2.custom.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/api.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/plupload.full.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/geom.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/seron.js"></script>
<link rel="stylesheet" href="<?php echo $ROOT_URI; ?>/css/styles.css">

</head>

<body>

<div id="map">
<div id="layer"></div>
</div>
<div id="header">
 <div id="name-box">
        <a class="name-link" href="http://emilieseron.ultra-book.com/">Emilie Seron</a>
    </div>
   
    <div id="titre-box"> 
        <div class="job">Titre</div>
    </div>

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
<div class="text-box-form-up">
Titre
<input type="text" name="title" />
</div>
<div class="text-box-form"> Catégorie <input type="text" name="category" /> </div>
<div class="text-box-form"> Texte</div>
<textarea class="content-editor" name="text_content"></textarea>

<div class="submit">Enregistrer</div>
<div class="delete">Effacer</div>
<div class="form-close">Fermer</div>

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

<div class="text-box-form"> Nom <input type="text" name="title" /> </div>
<div class="text-box-form"> Catégorie <input type="text" name="category" /> </div>
<div id="form-thumbnail"></div>
<div class="submit">Enregistrer</div>
<div class="delete">Effacer</div>
<div class="form-close">Fermer</div>
<div id="medias">
    <div id="media-item-box"></div>
    <div id="upload">
    <div id="upload_file">Ajouter une nouvelle image</div>
    <div id="filelist"></div>
    <div id="submit_upload">upload</div>
</div>
</div>
</div>

<div id="form-button-box">
<div id="form-button-text" class="form-button"> Nouveau Texte </div>
<div id="form-button-image" class="form-button"> Nouvelle Image </div>
</div>
<?php endif ?>





</body>
</html>