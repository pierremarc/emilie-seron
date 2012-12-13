// seron.js



function PostItem(id, container, map, index)
{
    var proto = {
        init: function(id){
            var that = this;
            api.get(id, function(data){
                that.x = data.x;
                that.y = data.y;
                that.t = data.obj_type;
                that.data = data;
                if(that.t === 'image_t')
                {
                    that.elem = $('<div />');
                    that.elem.attr('id', 'img_'+data.id);
                    that.elem.addClass('post-item');
                    that.elem.addClass('post-image');
                    that.elem.css({
                        left: that.x +'px',
                        top: that.y +'px',
                        width: data.image_width +'px',
                        height: data.image_height +'px',
                    });
                    that.image = $('<img witdh='+data.image_width+' height='+data.image_height+' src="/images/thumbnails/'+data.image_file+'" />');
                    that.elem.append(that.image);
                    container.append(that.elem);
                    that.rect = new Geom.Rect(that.x, that.y, data.image_width, data.image_height);
                    container.on('drag', function(evt, ui){
                        var cr = new Geom.Rect(-ui.position.left, -ui.position.top, map.width(), map.height());
                        console.log(ui.position.left+' x '+ ui.position.top)
                        if(cr.intersects(that.rect))
                        {
                            that.show();
                        }
                    });
                    
                    // insert in index
                    var iit = $('<div class="index-item">'+data.title+'</div>');
                    iit.on('click', function(evt){
                        container.css({
                            left:(-that.x)+'px',
                            top:(-that.y)+'px'
                        });
                        that.show();
                    });
            index.append(iit);
                }
            });
        },
        show: function(){
            if(this.t === 'image_t')
            {
                this.image.attr('src', '/images/'+this.data.image_file);
            }
        },
    };
    
    var ret = Object.create(proto);
    ret.init(id);
    return ret;
}


function form_to_json(form)
{
    var inputs = form.find('input');
    var ret = {};
    inputs.each(function(idx, html_elem){
        var elem = $(html_elem);
        var name = elem.attr('name');
        var val = elem.val();
        if(elem.hasClass('integer'))
        {
            val = parseInt(val);
        }
        ret[name] = val;
        
    });
    return JSON.stringify({insert:ret});
}

function save(form)
{
    var json_data = form_to_json(form);
    $.post('/api/objs/add', json_data, function(data){
        console.log(data);
    }, 'json');
}

function upload_file()
{
    
}

$(document).ready(function(){
    var map = $('#map');
    var layer = $('#layer');
    layer.draggable();
    var index = $('#index');
    api.set_table('objs');
    api.findAll(function(data){
        var result = data.result;
        for(var i=0; i< result.length; i++)
        {
            var w = result[i];
            try{
                var pit = PostItem(w.id, layer, map, index);
            }
            catch(e)
            {
                console.log(e);
            }
        }
    });
    
    $('#submit').on('click', function(evt){
        save($('#form'));
    });
    
    var uploader = new plupload.Uploader({
            runtimes : 'html5',
            browse_button : 'upload_file',
            container : 'upload',
            max_file_size : '10mb',
            url : '/upload',
            filters : [ {title : "Image files", extensions : "jpg,gif,png"} ]
        });
    
    $('#submit_upload').click(function(e) {
        uploader.start();
        e.preventDefault();
    });
    
    uploader.init();
    uploader.bind('FilesAdded', function(up, files){
        $.each(files, function(i, file) {
            $('#filelist').append( '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' + '</div>' );
            
        });
    });
    uploader.bind('FileUploaded', function(up, file){
        $('#'+file.id).remove();
    });
    
    
});