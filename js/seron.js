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
                    index.add(that, container);
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

function Index(container)
{
    var proto = {
        init:function(container){
            this.container = container;
            this.categories = {};
            this.data = [];
        },
        add:function(post_item, layer){
            var cat = post_item.data.category;
            this.data.push(post_item);
            if(this.categories[cat] === undefined)
            {
                this.categories[cat] = $('<div class="index-category"></div>');
                this.categories[cat].append('<div class="index-category-name">'+cat+'</div>');
                this.container.append(this.categories[cat]);
            }
            var iit = $('<div class="index-item">'+post_item.data.title+'</div>');
            iit.on('click', function(evt){
                layer.animate({
                    left:(-post_item.x)+'px',
                    top:(-post_item.y)+'px'
                });
                post_item.show();
            });
            this.categories[cat].append(iit);
        },
        go:function(name, layer){
            for(var i = 0; i < this.data.length; i++)
            {
                var p_i = this.data[i];
                if(p_i.data.title === name)
                {
                    layer.animate({
                        left:(-p_i.x)+'px',
                        top:(-p_i.y)+'px'
                    });
                    p_i.show();
                    break;
                }
            }
        },
    };
    var ret = Object.create(proto);
    ret.init(container);
    return ret;
}


function form_to_json(form)
{
    var inputs = form.find('input');
    var ret = {};
    inputs.each(function(idx, html_elem){
        var elem = $(html_elem);
        var name = elem.attr('name');
        if(name !== undefined)
        {
            var val = elem.val();
            if(elem.hasClass('integer'))
            {
                val = parseInt(val);
            }
            ret[name] = val;
        }
        
    });
    return JSON.stringify(ret);
}

function upload_file()
{
    
}

function FormManager(map, layer)
{
    $('.form').hide();
    var proto = {
        init:function(map, layer){
            this.type_txt = 'text_t';
            this.type_img = 'image_t';
            this.map = map;
            this.layer = layer;
            var that = this;
            $.get('/get_images', function(data){
                that.images = data;
                $('#form-button-text').on('click', function(evt){that.show(that.type_txt);});
                $('#form-button-image').on('click', function(evt){that.show(that.type_img);});
            });
            
        },
        show:function(form_t){
            var form = $('#text-form');
            if(form_t === this.type_img)
            {
                form = $('#image-form');
                var mediabox = $('#media-item-box');
                mediabox.empty();
                var i_img = form.children('input[name="image_file"]');
                $.each(this.images, function(idx, obj){
                    var img = $('<div class="media-item"><img src="/images/thumbnails/'+obj+'"/></div>');
                    img.on('click', {fn:obj}, function(evt){
                        i_img.val(evt.data.fn);
                        var thb = $('#form-thumbnail');
                        thb.empty();
                        thb.append('<img src="/images/thumbnails/'+evt.data.fn+'"/>');
                    });
                    mediabox.append(img);
                });
            }
            var ix = form.children('input[name="x"]');
            var iy = form.children('input[name="y"]');
            ix.val(-this.layer.offset().left);
            iy.val(-this.layer.offset().top);
            var submit = form.children('.submit');
            submit.off();
            var that = this;
            submit.on('click', function(evt){
                that.save(form);
            });
            form.show();
        },
        save:function(form){
            var json_data = form_to_json(form);
            $.post('/api/objs/add', {insert:json_data}, function(data){
                console.log(data);
            }, 'json');
        },
    };
    var ret = Object.create(proto);
    ret.init(map, layer);
    return ret;
}

$(document).ready(function(){
    var map = $('#map');
    var layer = $('#layer');
    layer.draggable();
    var index = Index($('#index'));
    api.set_table('objs');
    
    var FM = FormManager(map,layer);
    
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