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
<script src="<?php echo $ROOT_URI; ?>/js/jquery-1.9.1.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/ui/jquery/js/jquery-ui-1.10.1.custom.min.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/api.js"></script>
<?php
if($is_logged)
{
    echo '<script src="'.$ROOT_URI.'/js/plupload.full.js"></script>';
    echo '<script src="'.$ROOT_URI.'/js/jquery.masonry.min.js"></script>';
    echo '<script src="'.$ROOT_URI.'/js/markitup/jquery.markitup.js"></script>';
    echo '<script src="'.$ROOT_URI.'/js/markitup/sets/markdown/set.js"></script>';
    
    echo '<link rel="stylesheet" type="text/css" href="'.$ROOT_URI.'/js/markitup/skins/simple/style.css" />';
    echo '<link rel="stylesheet" type="text/css" href="'.$ROOT_URI.'/js/markitup/sets/markdown/style.css" />';
}
?>
<script src="<?php echo $ROOT_URI; ?>/js/geom.js"></script>
<script src="<?php echo $ROOT_URI; ?>/js/seron.js"></script>

<link rel="stylesheet" href="<?php echo $ROOT_URI; ?>/js/ui/jquery/css/smoothness/jquery-ui-1.10.1.custom.css" />

<link rel="stylesheet/less" type="text/css" href="<?php echo $ROOT_URI; ?>/css/styles.less" />
<script src="<?php echo $ROOT_URI; ?>/js/less.js"></script>


</head>

<body>

<div id="map">
<div id="layer"></div>
</div>
<div id="header">
 <div id="name-box">
        <a class="name-link" href="http://emilieseron.com/at/About">Emilie Seron</a>
    </div>
   
    <div id="titre-box"> 
        <div class="job"></div>
    </div>

</div>
<div id="index">
</div>

<?php if($is_logged): ?>

<!-- 
    TEXT FORM
-->

<div id="text-form" class="form" title="Ajouter un texte">
    <input type="hidden" name="obj_type" value="text_t" />
    <input type="hidden" name="x" value="0" class="integer" />
    <input type="hidden" name="y" value="0" class="integer" />
<!--     <input type="hidden" name="cat_ref" value="0" class="integer" /> -->
    
    <div class="text-box-form-up">
        Titre <input type="text" name="title" />
    </div>
    <div class="text-box-form"> 
        Catégorie <!--<input type="text" name="category" /> -->
        <select name="cat_ref" class="integer">
        <select/> 
    </div>
    <div class="text-box-form"> 
        Texte 
    </div>
    <textarea class="content-editor" name="text_content"></textarea>


</div>

<!-- 
    IMAGE FORM
-->

<div id="image-form" class="form" title="Ajouter une image">
    <input type="hidden" name="obj_type" value="image_t" />
    <input type="hidden" name="x" value="0" class="integer" />
    <input type="hidden" name="y" value="0" class="integer" />
    <input type="hidden" name="image_width" value="0" class="integer" />
    <input type="hidden" name="image_height" value="0" class="integer" />
<!--     <input type="hidden" name="cat_ref" value="0" class="integer" /> -->
    <input type="hidden" name="image_file" value="" />

    <div class="image-form-top">
        <div class="text-box-form">
            Nom <input type="text" name="title" /> 
        </div>
        <div class="text-box-form"> 
            Catégorie <!--<input type="text" name="category" /> -->
            <select name="cat_ref" class="integer">
            <select/>
        </div>
        <div id="form-thumbnail"></div>
    </div>
    <div class="image-form-bottom">
    <div id="upload_file"><span>Ajouter des images à la collection</span></div>
    <div id="medias">
        <div id="media-item-box-wrapper">
            <div id="media-item-box"></div>
        </div>
        <div id="upload">
            <div id="filelist"></div>
        </div>
    </div>
    </div>
</div>


<!-- 
Category FORM
-->
<div id="category-form" class="form" title="Gérer les catégories">
    
</div>

<div id="form-button-box">
<div id="form-button-text" class="form-button"> Nouveau Texte </div>
<div id="form-button-image" class="form-button"> Nouvelle Image </div>
<div id="form-button-category" class="form-button"> Gérer les catégories </div>
<div id="form-button-logout" class="form-button"> <a href="/logout" title="logout">Quitter le mode édition</a> </div>
</div>




<?php endif ?>





</body>
</html>
