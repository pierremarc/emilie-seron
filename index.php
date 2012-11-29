<?php
session_start();
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
$app->get('/salt', 'salt');
$app->get('/login', 'login');
$app->get('/logout', 'logout');

$api = new API($app);
$api->setup_routes(is_logged());

function index() 
{
    global $app;
    $app->render('base.php', array('title' => 'Emile Seron'));
}

function salt()
{
    global $app;
    $res = $app->response();
    $res['Content-Type'] = 'application/json';
    if(!isset($_SESSION['salt']))
    {
        $_SESSION['salt'] = md5(mt_rand());
    }    
    $res->body(json_encode(array('salt'=>$_SESSION['salt'])));
}

function login()
{
    global $app;
    if(!isset($_SESSION['salt']))
    {
        $app->halt(403, 'No salt');
    }
    require 'users.php';
    $req = $app->request();
    $user = $req->get('u');
    $pass_h = $req->get('p');
        $res = $app->response();
    
    if($user && $pass_h)
    {
        $usrs = new Users();
        if($usrs->authenticate($user, $pass_h, $_SESSION['salt']))
        {
            $_SESSION['login'] = md5(mt_rand());
            $res['Content-Type'] = 'application/json';
            $res->body(json_encode(array('token'=>$_SESSION['login'])));
        }
        else
        {
            $app->halt(403, 'Wrong credentials');
        }
        return;
    }
    else
    {
        $app->render('login.php');
    }
    
}

function logout()
{
    unset($_SESSION['login']);
}

function is_logged()
{
    return isset($_SESSION['login']);
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