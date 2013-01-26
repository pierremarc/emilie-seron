<?php

if(!defined('IS_APPLICATION'))
    return;

class Users
{
    private $users = array();
    
    public function __construct()
    {
        $this->users['emilie'] = '3a5951e726fae996f15192f15ff756ab';
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