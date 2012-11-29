<?php


class API{
    
    public function __construct($app, $)
    {
        $this->app = $app;
        
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
    
    private function setup_routes()
    {
        $app->get('/api/:table', 'gets');
        $app->get('/api/:table/:id', 'get');
        $app->get('/api/:table/search/:query', 'findByName');
        $app->post('/api/:table', 'add');
        $app->put('/api/:table/:id', 'update');
        $app->delete('/api/:table/:id',  'delete');
    }
    
    private function result($body)
    {
        $res = $this->app->response();
        $res['Content-Type'] = 'application/json';
        $res->body($body);
    }
    
    public function gets($table) {
        $sql = "select * FROM ". $this->db->quote($table)." ORDER BY name";
        try {
            $stmt = $this->db->query($sql);  
            $wines = $stmt->fetchAll(PDO::FETCH_OBJ);
            $this->result( '{"wine": ' . json_encode($wines) . '}');
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function get($table,$id) {
        $sql = "SELECT * FROM ". $this->db->quote($table)." WHERE id=:id";
        try {
            $stmt = $this->db->prepare($sql);  
            $stmt->bindParam("id", $id);
            $stmt->execute();
            $wine = $stmt->fetchObject();
            $this->result( json_encode($wine) ); 
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
        $sql = "INSERT INTO ".$this->db->quote($table)." (".implode(',',$cols0).") VALUES (".implode(',',$cols1).")";
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
        $request = Slim::getInstance()->request();
        $body = $request->getBody();
        $wine = json_decode($body);
        $sql = "UPDATE wine SET name=:name, grapes=:grapes, country=:country, region=:region, year=:year, description=:description WHERE id=:id";
        try {
            $db = getConnection();
            $stmt = $db->prepare($sql);  
            $stmt->bindParam("name", $wine->name);
            $stmt->bindParam("grapes", $wine->grapes);
            $stmt->bindParam("country", $wine->country);
            $stmt->bindParam("region", $wine->region);
            $stmt->bindParam("year", $wine->year);
            $stmt->bindParam("description", $wine->description);
            $stmt->bindParam("id", $id);
            $stmt->execute();
            $db = null;
            $this->result( json_encode($wine)); 
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function delete($table,$id) {
        $sql = "DELETE FROM ". $this->db->quote($table)." WHERE id=:id";
        try {
            $db = getConnection();
            $stmt = $db->prepare($sql);  
            $stmt->bindParam("id", $id);
            $stmt->execute();
            $db = null;
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

    public function findByName($table,$query) {
        $sql = "SELECT * FROM ". $this->db->quote($table)." WHERE UPPER(name) LIKE :query ORDER BY name";
        try {
            $db = getConnection();
            $stmt = $db->prepare($sql);
            $query = "%".$query."%";  
            $stmt->bindParam("query", $query);
            $stmt->execute();
            $wines = $stmt->fetchAll(PDO::FETCH_OBJ);
            $db = null;
            $this->result( '{"wine": ' . json_encode($wines) . '}');
        } catch(PDOException $e) {
            $this->result( '{"error":{"text":'. $e->getMessage() .'}}'); 
        }
    }

}

?>