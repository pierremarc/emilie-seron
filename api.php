<?php


class API
{
    
    public function __construct($app)
    {
        $this->app = $app;
        $this->setup_db();
    }
    
    private function setup_db()
    {
        $dbhost="127.0.0.1";
        $dbuser="root";
        $dbpass="plokplok";
        $dbname="seron";
        $this->db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);  
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    public function setup_routes($auth = false)
    {
        $that = $this;
        //         $this->app->get('/api/:table', function(){ $that->gets($table); });
        $this->app->get('/api/:table', array(&$this, 'gets'));
        $this->app->get('/api/:table/:id', array(&$this, 'get'));
        $this->app->get('/api/:table/search/:query', array(&$this, 'findByName'));
        if($auth)
        {
            $this->app->post('/api/:table', array(&$this, 'add'));
            $this->app->put('/api/:table/:id', array(&$this, 'update'));
            $this->app->delete('/api/:table/:id',  array(&$this, 'delete'));
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
        $sql = "select * FROM ". $table." ORDER BY name";
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
        $req_data = json_decode($request->getBody());
        $cols0 = array();
        $cols1 = array();
        $vals = array();
        foreach($req_data['insert'] as $cv)
        {
            $cols0[] = $cv[0];
            $cols1[] = ':'.$cv[0];
            $vals[] = $cv[1];
        }
        $sql = "INSERT INTO ".$table." (".implode(',',$cols0).") VALUES (".implode(',',$cols1).")";
        try {
            $stmt = $this->db->prepare($sql); 
            foreach($req_data['insert'] as $cv)
            {
                $stmt->bindParam($cv[0], $cv[1]);
            }
            $stmt->execute();
            $req_data->id = $this->db->lastInsertId();
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

    public function findByName($table,$query) {
        $sql = "SELECT * FROM ". $table." WHERE UPPER(name) LIKE :query ORDER BY name";
        try {
            $stmt = $this->db->prepare($sql);
            $query = "%".$query."%";  
            $stmt->bindParam("query", $query);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_OBJ);
            $this->result( '{"result": ' . json_encode($results) . '}');
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

}

?>