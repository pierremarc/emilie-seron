
(function(ns, undefined){
    
    ns.api = ns.api || {};
    ns.api.root_url_stem = '/api';
    ns.api.cur_table = '';
    ns.api.old_table = '';
    
    ns.api.root_url = function(){
        return this.root_url_stem+'/'+this.cur_table;
    };
    
    ns.api.set_table = function(table)
    {
        this.old_table = this.cur_table;
        this.cur_table = table;
    };
    
    ns.api.reset_table = function()
    {
        this.cur_table = this.old_table;
        this.old_table = '';
    };
    
    ns.api.findAll = function(cb) {
        $.ajax({
            type: 'GET',
            url: this.root_url(),
            dataType: "json", // data type of response
            success: cb || console.log
        });
    };

    ns.api.findByName = function(searchKey, cb) {
        $.ajax({
            type: 'GET',
            url: this.root_url() + '/search/' + searchKey,
            dataType: "json",
            success: cb || console.log 
        });
    };

    ns.api.get = function(id, cb, obj) {
        var cb = cb || console.log;
        var obj = obj || window;
        $.ajax({
            type: 'GET',
            url: this.root_url() + '/' + id,
            dataType: "json",
            success: function(data){cb.apply(obj,[data]);}
        });
    };

    ns.api.add = function(form_data, cb) {
        $.ajax({
            type: 'POST',
//             contentType: 'application/json',
            url: this.root_url()+'/add',
            dataType: "json",
            data: form_data,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('add error: ' + textStatus);
            }
        });
    };

    ns.api.update = function(id, form_data, cb) {
        $.ajax({
            type: 'POST',
//             contentType: 'application/json',
            url: this.root_url() + '/update/' +id,
            dataType: "json",
            data: form_data,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('update error: ' + textStatus);
            }
        });
    };

    ns.api.delete = function(id, cb) {
        $.ajax({
            type: 'DELETE',
            url: this.root_url() + '/delete/' + id,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('delete error: '+textStatus);
            }
        });
    };
    
})( window );
