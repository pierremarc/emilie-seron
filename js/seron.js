// seron.js

$(document).ready(function(){
    api.set_table('wine');
    api.findAll(function(data){
        var ctnr = $('#index');
        var result = data.result;
        for(var i=0; i< result.length; i++)
        {
            var w = result[i];
            ctnr.append('<h1>'+w.name+'</h1>');
        }
    });
    
});