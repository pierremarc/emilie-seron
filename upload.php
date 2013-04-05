<?php
/**********************************
 * 
 *   upload.php
 * 
 *  copied from https://github.com/arsduo/php-uploader/blob/master/uploader.php
 * ********************************/

if(!defined('IS_APPLICATION'))
    return;

require_once('config.php');

ini_set("memory_limit", "100M");


define("PRODUCTION", preg_match('/emilieseron\.be/', $_SERVER['SERVER_NAME']));
define("IMAGE_URL_STEM", '/es_media/');
define("IMAGE_PATH", dirname(__FILE__) . '/es_media/');

// max size: 4 MB
define("MAX_FILESIZE", 5000);

class Upload{
    
    function __construct()
    {
        $this->thumbnails_size = 200;
        $this->finfo = new finfo(FILEINFO_MIME_TYPE);
        $this->mimes = array(
            'image/jpeg' => array(
                'extension'=>'.jpeg', 
                'create'=>'imagecreatefromjpeg', 
                'save'=>'imagejpeg'),
            'image/png' => array(
                'extension'=>'.png', 
                'create'=>'imagecreatefrompng', 
                'save'=>'imagepng'),
            'image/gif' => array(
                'extension'=>'.gif', 
                'create'=>'imagecreatefromgif', 
                'save'=>'imagegif'),
            );
    }
    
    function slugify($text)
    { 
        // replace non letter or digits by -
        $text = preg_replace('~[^\\pL\d]+~u', '-', $text);
        
        // trim
        $text = trim($text, '-');
        
        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        
        // lowercase
        $text = strtolower($text);
        
        // remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);
        
        if (empty($text))
        {
            return 'n-a';
        }
        
        return $text;
    }
    
    function get_mime($filename)
    {
        return $this->finfo->file($filename);
    }
    
    function image_create($file_path, $name)
    {
        error_log('image_create: '.$file_path. '  ' . $name);
        $mime = $this->get_mime($file_path);
        $image = $this->mimes[$mime]['create']($file_path);
        imagealphablending($image, true);
        $size = getimagesize($file_path);
        return (object)array('resource'=>$image, 'mime'=>$mime, 'filename'=>$name, 'width'=>$size[0], 'height'=>$size[1]);
    }
    
    function image_save($image, $dir)
    {
        error_log('image_save');
        $filepath = IMAGE_PATH.$dir.$image->filename.$this->mimes[$image->mime]['extension'];
        $this->mimes[$image->mime]['save']($image->resource, $filepath);
    }
    
    function make_thumbnail($image) {
        error_log('make_thumbnail');
        $isHorizontal = $image->width < $image->height;
        if ($isHorizontal) 
        {
            $newHeight = ($image->height / $image->width) * $this->thumbnails_size;
            $newWidth = $this->thumbnails_size;
        }
        else 
        {
            $newWidth = ($image->width / $image->height) * $this->thumbnails_size;
            $newHeight = $this->thumbnails_size;
        }
        $tmp = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($tmp, false);
        imagesavealpha($tmp, true);
        imagecopyresampled($tmp, $image->resource, 0, 0, 0, 0, $newWidth, $newHeight, $image->width, $image->height);
        
        $thumbnail = (object)array('resource'=>$tmp, 'mime'=>$image->mime, 'filename'=>$image->filename, 'width'=>$newWidth, 'height'=>$newHeight);
        $this->image_save($thumbnail, '/thumbnails/');
        
        return array("width" => (int)$newWidth, "height" => (int)$newHeight);
    }
    
    
    function handle_upload($post_name)
    {
        error_log('handle_upload');
        $results = array();
        $error = null;
        $resultsSent = false;
        $url = '';
        
        if ($_SERVER["REQUEST_METHOD"] == "POST") 
        {
            $image_name = pathinfo($_FILES[$post_name]["name"]);
            $tmp_file = $_FILES[$post_name]["tmp_name"];
            
            error_log($image_name['filename']);
            
            if ($image_name) 
            {
                $result_filename_stem = $this->slugify($image_name['filename']);
                $image = $this->image_create($tmp_file, $result_filename_stem);
                imagealphablending($image->resource, false);
                imagesavealpha($image->resource, true);
                
                $thumbnail = $this->make_thumbnail($image);
                $this->image_save($image, '/');
                imagedestroy($image->resource);
            }
                
            if ($error) 
            {
                return array('status'=>'error');
            }
            else 
            {
                $results['status'] = 'ok';
                return $results;
            }
                
        }
    }
}
