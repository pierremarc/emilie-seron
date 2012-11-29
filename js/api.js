
(function(ns, undefined){
    
    ns.api = ns.api || {};
    ns.api.root_url = '/api';
    
    ns.api.set_table = function(table)
    {
        this.root_url += '/'+table;
    };
    
    ns.api.findAll = function(cb) {
        console.log('findAll');
        $.ajax({
            type: 'GET',
            url: this.root_url,
            dataType: "json", // data type of response
            success: cb || console.log
        });
    };

    ns.api.findByName = function(searchKey, cb) {
        $.ajax({
            type: 'GET',
            url: this.root_url + '/search/' + searchKey,
            dataType: "json",
            success: cb || console.log 
        });
    };

    ns.api.findById = function(id, cb) {
        console.log('findById: ' + id);
        $.ajax({
            type: 'GET',
            url: this.root_url + '/' + id,
            dataType: "json",
            success: cb || console.log
        });
    };

    ns.api.add = function(form_data, cb) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: this.root_url,
            dataType: "json",
            data: form_data,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('add error: ' + textStatus);
            }
        });
    };

    ns.api.update = function(form_data, cb) {
        $.ajax({
            type: 'PUT',
            contentType: 'application/json',
            url: this.root_url + '/' + $('#wineId').val(),
            dataType: "json",
            data: form_data,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('update error: ' + textStatus);
            }
        });
    };

    ns.api.delete = function(id, cb) {
        console.log('deleteWine');
        $.ajax({
            type: 'DELETE',
            url: this.root_url + '/' + id,
            success: cb || console.log,
            error: function(jqXHR, textStatus, errorThrown){
                console.log('delete error: '+textStatus);
            }
        });
    };
    
})( window );
