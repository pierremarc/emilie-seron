<?php

class Users
{
    private $users = array();
    
    public function __construct()
    {
        $this->users['emilie'] = md5('plokplok');  //  FIXME
    }
    
    public function authenticate($u, $ph, $salt)
    {
        if(isset($this->users[$u]))
        {
            $hph = md5($this->users[$u].$salt);
            if($hph === $ph)
                return true;
        }
        
        return false;
    }
}