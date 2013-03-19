<?php
session_start();
define('IS_APPLICATION', true);
require 'Slim/Slim/Slim.php';
\Slim\Slim::registerAutoloader();


require_once('MarkdownParser.php');
require_once('api.php');

$md_parser = new MarkdownParser();

$app = new \Slim\Slim(array(
    'mode' =>'development',
    'debug' => true,
    'log.level' => \Slim\Log::DEBUG,
    'templates.path' => './templates'
    ));
    
$app->get('/', 'index');
$app->get('/at/:id', 'at');
$app->get('/get_images', 'get_images');
$app->get('/salt', 'salt');
$app->get('/login-page', 'login_page');
$app->get('/login', 'login');
$app->post('/markdown', 'md');

if(is_logged())
{
    $app->get('/logout', 'logout');
    $app->post('/upload', 'upload_image');
}

require_once('config.php');
$api = new API($app, $DB_INFO['host'], $DB_INFO['user'], $DB_INFO['password'], $DB_INFO['table']);
$api->setup_routes(is_logged());


function index() 
{
    global $app;
    $req = $app->request();
    $app->render('base.php', array('title' => 'Emile Seron', 'is_logged' => is_logged(), 'ROOT_URI'=>$req->getRootUri()));
}


function md()
{
    global $app;
    global $md_parser;
    $req = $app->request();
    $res = $app->response();
    $txt = $req->params('text');
    $html = $md_parser->transform($txt);
    $res->body($html);
}

function at($id) 
{
    global $app;
    $req = $app->request();
    $app->render('base.php', array('title' => 'Emile Seron', 'is_logged' => is_logged(), 'ROOT_URI'=>$req->getRootUri(), 'start_id'=>$id));
}



function login_page()
{
    global $app;
    $req = $app->request();
    $app->render('login.php', array('title' => 'Login', 'ROOT_URI'=>$req->getRootUri(),'is_logged' => is_logged()));
}

function login()
{
    global $app;
    $res = $app->response();
    if(session_id() === '')
    {
        $res['Content-Type'] = 'application/json';
        $res->body(json_encode(array('status'=>'error', 'message'=>'Not Interactive login')));
    }
    require 'users.php';
    $req = $app->request();
    $user = $req->params('u');
    $pass_h = $req->params('p');
    
    if($user && $pass_h)
    {
        $usrs = new Users();
        if($usrs->authenticate($user, $pass_h, session_id()))
        {
            $_SESSION['login'] = md5(mt_rand());
            $res['Content-Type'] = 'application/json';
            $res->body(json_encode(array('status'=>'ok','token'=>$_SESSION['login'])));
        }
        else
        {
            $res['Content-Type'] = 'application/json';
            $res->body(json_encode(array('status'=>'error', 'message'=>'wrong credentials')));
        }
        return;
    }
    else
    {
        $app->render('login.php', array('title' => 'Login', 'ROOT_URI'=>$req->getRootUri(), 'is_logged' => is_logged()));
    }
    
}

function logout()
{
    unset($_SESSION['login']);
    return index();
}

function is_logged()
{
//     return true;
    return isset($_SESSION['login']);
}

function get_images()
{
    global $UPLOAD_DIR;
    global $MEDIA_URL;
    global $app;
    $res = $app->response();
    $res['Content-Type'] = 'application/json';
    $images = array();
    foreach(glob($UPLOAD_DIR."*.{jpg,jpeg,png}", GLOB_BRACE) as $fn)
    {
        $sz = getimagesize($fn);
        $thname = basename($fn);
        $thbfn = $UPLOAD_DIR.'thumbnails/'.$thname;
        if(!file_exists($thbfn))
        {
            require_once('upload.php');
            $u = new Upload();
            $image_name = pathinfo($fn);
            $image = $u->image_create($fn, $image_name['filename']);
            $u->make_thumbnail($image);
        }
        if(file_exists($thbfn))
        {
            $thsz = getimagesize($thbfn);
            $images[] = array('filename' => basename($fn), 'width' => $sz[0], 'height' => $sz[1], 
                                'thumbnail'=>array(
                                    'url'=>$MEDIA_URL.'thumbnails/'.$thname,
                                    'width' => $thsz[0], 'height' => $thsz[1]
                                    ));
        }
    }
    $res->body(json_encode($images));
}

function upload_image()
{
    global $app;
    $res = $app->response();
    require_once('upload.php');
    $u = new Upload();
//     $app->render('debug.php', array('debug' => $_FILES));
    $result =  $u->handle_upload('file');
    $res['Content-Type'] = 'application/json';
    $res->body(json_encode($result, JSON_NUMERIC_CHECK));
}

// $app->hook('slim.before.dispatch', function () use ($app) {
//     $res = $app->response();
//     if($res->isNotFound())
//     {
//         
//     }
// });
// print_r($app);

$app->notFound(function () use ($app) {
    $req = $app->request();
    $res = $app->response();
    error_log('[404] '.$req->getResourceUri());
});

$app->run();