<?php
session_start();
define('IS_APPLICATION', true);
require 'Slim/Slim/Slim.php';
\Slim\Slim::registerAutoloader();

require 'api.php';

$app = new \Slim\Slim(array(
    'mode' =>'development',
    'debug' => true,
    'log.level' => \Slim\Log::DEBUG,
    'templates.path' => './templates'
    ));

$app->get('/', 'index');
$app->get('/get_images', 'get_images');
$app->get('/salt', 'salt');
$app->get('/login-page', 'login_page');
$app->get('/login', 'login');
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
    $app->render('base.php', array('title' => 'Emile Seron', 'is_logged' => is_logged()));
}


function login_page()
{
    global $app;
    $app->render('login.php', array('title' => 'Login', 'is_logged' => is_logged()));
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
        $app->render('login.php', array('title' => 'Login', 'is_logged' => is_logged()));
    }
    
}

function logout()
{
    unset($_SESSION['login']);
}

function is_logged()
{
//     return true;
    return isset($_SESSION['login']);
}

function get_images()
{
    global $app;
    $res = $app->response();
    $res['Content-Type'] = 'application/json';
    $images = array();
    foreach(glob("images/*.{jpg,jpeg,png}", GLOB_BRACE) as $fn)
    {
        $sz = getimagesize($fn);
        $images[] = array('filename' => basename($fn), 'width' => $sz[0], 'height' => $sz[1]);
    }
    $res->body(json_encode($images));
}

function upload_image()
{
    global $app;
    require('upload.php');
    $u = new Upload();
//     $app->render('debug.php', array('debug' => $_FILES));
    $u->handle_upload('file');
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