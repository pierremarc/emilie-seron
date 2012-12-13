<?php

// base.php

?><!DOCTYPE HTML>
<html>
<head>
<title></title>
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

<div id="form">
<input type="hidden" name="obj_type" value="text_t" />
<div>
title:
<input type="text" name="title" />
</div>

<div>
content:
<input type="text" name="text_content" />
</div>
<div id="submit">save</div>
</div>


<div id="upload">
<div id="upload_file">[ADD FILE]</div>
<div id="filelist"></div>
<div id="submit_upload">upload</div>
</div>


</body>
</html>