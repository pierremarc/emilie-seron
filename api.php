<?php

if(!defined('IS_APPLICATION'))
    return;

class API
{
    
    public function __construct($app, $dbhost, $dbuser, $dbpass, $dbname)
    {
        $this->app = $app;
        $this->setup_db($dbhost, $dbuser, $dbpass, $dbname);
    }
    
    private function setup_db($dbhost, $dbuser, $dbpass, $dbname)
    {
//         $dbhost="127.0.0.1";
//         $dbuser="root";
//         $dbpass="plokplok";
//         $dbname="seron";
        $this->db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);  
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    public function setup_routes($auth = false)
    {
        $that = $this;
        //         $this->app->get('/api/:table', function(){ $that->gets($table); });
        $this->app->get('/api/:table', array(&$this, 'gets'));
        $this->app->get('/api/:table/:id', array(&$this, 'get'));
        $this->app->get('/api/:table/search/:column/:query', array(&$this, 'find'));
        if($auth)
        {
            $this->app->post('/api/:table/add', array(&$this, 'add'));
            $this->app->put('/api/:table/update/:id', array(&$this, 'update'));
            $this->app->delete('/api/:table/delete/:id',  array(&$this, 'delete'));
        }
    }
    
    private function result($body)
    {
        $res = $this->app->response();
        $res['Content-Type'] = 'application/json';
        error_log('[RESULT]' .$body);
        $res->body($body);
    }
    
    public function gets($table) {
        $sql = "select * FROM ". $table;
        try {
            $stmt = $this->db->query($sql);  
            $results = $stmt->fetchAll(PDO::FETCH_OBJ);
            $this->result( '{"result": ' . json_encode($results) . '}');
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function get($table,$id) {
        $sql = "SELECT * FROM ". $table." WHERE id=:id";
        try {
            $stmt = $this->db->prepare($sql);  
            $stmt->bindParam("id", $id);
            $stmt->execute();
            $result = $stmt->fetchObject();
            $this->result( json_encode($result) ); 
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function add($table) {
        $request = $this->app->request();
        $req_data = json_decode($request->post('insert'), true);
        $cols0 = array();
        $cols1 = array();
        $vals = array();
        foreach($req_data as $key=>$rec)
        {
            $cols0[] = '`'.$key.'`';
            $cols1[] = ':'.$key;
        }
        $sql = "INSERT INTO ".$table." (".implode(',',$cols0).") VALUES (".implode(',',$cols1).")";
//         echo('<pre>'.$sql.'</pre>');
        try {
            $stmt = $this->db->prepare($sql); 
            foreach($req_data as $key=>$val)
            {
                $paramName = ':'.$key;
//                 $paramValue = $val;
//                 echo('<pre>BIND('.$paramName.', '.$paramValue.')</pre>');
                $stmt->bindParam($paramName, $req_data[$key]);
            }
            $stmt->execute();
            $req_data['id'] = $this->db->lastInsertId();
            $this->result( json_encode($req_data) ); 
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function update($table,$id) {
//         $request = Slim::getInstance()->request();
//         $body = $request->getBody();
//         $wine = json_decode($body);
//         $sql = "UPDATE wine SET name=:name, grapes=:grapes, country=:country, region=:region, year=:year, description=:description WHERE id=:id";
//         try {
//             $db = getConnection();
//             $stmt = $db->prepare($sql);  
//             $stmt->bindParam("name", $wine->name);
//             $stmt->bindParam("grapes", $wine->grapes);
//             $stmt->bindParam("country", $wine->country);
//             $stmt->bindParam("region", $wine->region);
//             $stmt->bindParam("year", $wine->year);
//             $stmt->bindParam("description", $wine->description);
//             $stmt->bindParam("id", $id);
//             $stmt->execute();
//             $db = null;
//             $this->result( json_encode($wine)); 
//         } catch(PDOException $e) {
//             $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
//         }
    }

    public function delete($table,$id) {
        $sql = "DELETE FROM ". $table." WHERE id=:id";
        try {
            $stmt = $this->db->prepare($sql);  
            $stmt->bindParam("id", $id);
            $stmt->execute();
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function find($table,$column,$query) {
        $sql = "SELECT * FROM ". $table." WHERE :column LIKE :query ORDER BY id";
        try {
            $stmt = $this->db->prepare($sql);
            $query = "%".$query."%";  
            $stmt->bindParam("column", $column);
            $stmt->bindParam("query", $query);
            error_log($stmt->queryString);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_OBJ);
            $this->result( '{"result": ' . json_encode($results) . '}');
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

}

?>