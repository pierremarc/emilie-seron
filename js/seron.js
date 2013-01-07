// seron.js



function PostItem(id, container, map, index, titlebar)
{
    var proto = {
        init: function(id){
            var that = this;
            this.loaded = false; 
            api.get(id, function(data){
                that.x = data.x;
                that.y = data.y;
                that.t = data.obj_type;
                that.data = data;
                that.elem = $('<div />');
                that.elem.addClass('post-item');
                if(that.t === 'image_t')
                {
                    that.elem.attr('id', 'img_'+data.id);
                    that.elem.addClass('post-image');
                    that.elem.css({
                        left: that.x +'px',
                        top: that.y +'px',
                        width: data.image_width +'px',
                        height: data.image_height +'px',
                    });
                    that.image = $('<img witdh='+data.image_width+' height='+data.image_height+' src="/images/thumbnails/'+data.image_file+'" />');
                    that.elem.append(that.image);
                    that.rect = new Geom.Rect(that.x, that.y, data.image_width, data.image_height);
                    container.on('drag', function(evt, ui){
//                         if(!that.loaded)
                        {
                            var cr = new Geom.Rect(-ui.position.left, -ui.position.top, map.width(), map.height());
                            
                            if(cr.intersects(that.rect))
                            {
                                console.log(that.data.image_file+' => ' + that.rect +' <> '+ cr);
                                if(!that.loaded)
                                    that.show();
                                titlebar.add(that.data.title);
                            }
                            else
                            {
//                                 console.log(that.data.title+' => NOT INTERSECTS');
                                titlebar.remove(that.data.title);
                            }
                        }
                    });
                }
                else // text item
                {
                    that.elem.attr('id', 'txt_'+data.id);
                    that.elem.addClass('post-text');
                    that.elem.css({
                        left: that.x +'px',
                        top: that.y +'px',
                    });
                    that.elem.append('<div class="text-title">'+data.title+'</div><div class="text-content">'+data.text_content+'</div>');
                }
                
                container.append(that.elem);
                
                // insert in index
                index.add(that, container);
                
                if(IS_LOGGED)
                {
                    that.elem.draggable();
                    that.elem.on('dragstop', {post_item:that}, function(evt,ui){
                        var fdata = evt.data.post_item.data;
                        fdata.x = ui.position.left;
                        fdata.y = ui.position.top;
                        var udata = {};
                        for(var key in fdata)
                        {
                            if(key !== 'id')
                            {
                                udata[key] = fdata[key];
                            }
                        }
                        api.update(fdata.id, {update:JSON.stringify(udata)}, function(data){
                            evt.data.post_item.x = data.x;
                            evt.data.post_item.y = data.y;
                        });
                    });
                }
            });
        },
        show: function(){
            if(this.t === 'image_t')
            {
                this.image.attr('src', '/images/'+this.data.image_file);
                this.loaded = true; 
            }
        },
    };
    
    var ret = Object.create(proto);
    ret.init(id);
    return ret;
}

function Index(container, map, fmgr, titlebar)
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
                var cleft = ((map.width() - post_item.elem.width()) / 2) - post_item.x;
                var ctop = ((map.height() - post_item.elem.height()) / 2) - post_item.y;
                layer.animate({ left:cleft+'px', top:ctop+'px' });
                post_item.show();
                titlebar.remove_all();
                titlebar.add(post_item.data.title);
            });
            this.categories[cat].append(iit);
            if(IS_LOGGED)
            {
                var et = $(' <span class="index-item-edit">edit</span> ');
                et.on('click', {id:post_item.data.id}, function(evt){
                    layer.css({ left:(-post_item.x)+'px', top:(-post_item.y)+'px' });
                    fmgr.edit(evt.data.id);
                });
                iit.append(et);
            }
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
                    titlebar.remove_all();
                    titlebar.add(p_i.data.title);
                    break;
                }
            }
        },
    };
    var ret = Object.create(proto);
    ret.init(container);
    return ret;
}


function TitleBar(container)
{
    var proto = {
        init:function(container){
            this.container = container;
            this.data = {};
        },
        add:function(title){
            if(title.length == 0)
                return;
            this.data[title] = true;
            this.update();
        },
        remove:function(title){
            this.data[title] = false;
            this.update();
        },
        remove_all:function(){
            for(var key in this.data)
            {
                this.data[key] = false;
            }
        },
        update:function(){
            container.empty();
            var sep = '';
            for(var key in this.data)
            {
                if(this.data[key] === true)
                {
                    container.append(sep+'<span class="job">'+key+'</span>');
                    sep = ', ';
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
    var texts = form.find('textarea');
    var ret = {};
    function extract(idx, html_elem){
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
    }
    inputs.each(extract);
    texts.each(extract);
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
            $('.form-close').on('click', function(evt){
                $('.form').hide();
            });
            
        },
        update_images:function(form)
        {
            var mediabox = $('#media-item-box');
            mediabox.empty();
            var i_img = form.children('input[name="image_file"]');
            $.each(this.images, function(idx, obj){
                var img = $('<div class="media-item"><img src="/images/thumbnails/'+obj.filename+'"/></div>');
                img.on('click', {img_obj:obj}, function(evt){
                    i_img.val(evt.data.img_obj.filename);
                    var thb = $('#form-thumbnail');
                    thb.empty();
                    thb.append('<img src="/images/thumbnails/'+evt.data.img_obj.filename+'"/>');
                    form.find('input[name="image_width"]').val(evt.data.img_obj.width);
                    form.find('input[name="image_height"]').val(evt.data.img_obj.height);
                });
                    mediabox.append(img);
            });
        },
        show:function(form_t){
            var form = $('#text-form');
            if(form_t === this.type_img)
            {
                form = $('#image-form');
                this.update_images(form);
                $('#form-thumbnail').empty();
            }
            
            var inputs = form.find('input');
            inputs.each(function(idx, html_elem){
                var elem = $(html_elem);
                if(elem.attr('name') !== 'obj_type')
                {
                    elem.val('');
                }
            });
            
            var ix = form.find('input[name="x"]');
            var iy = form.find('input[name="y"]');
            ix.val(-this.layer.position().left);
            iy.val(-this.layer.position().top);
            var submit = form.find('.submit');
            submit.off();
            var that = this;
            submit.on('click', function(evt){
                that.save(form);
            });
            var delete_ = form.find('.delete');
            delete_.hide();
            form.show();
        },
        edit:function(id){
            api.get(id, function(data){
                var that = this;
                form = $('#text-form');
                if(data.obj_type === that.type_img)
                {
                    form = $('#image-form');
                    this.update_images(form);
                    form.find('input[name="image_file"]').val(data.image_file);
                    var thb = $('#form-thumbnail');
                    thb.empty();
                    thb.append('<img src="/images/thumbnails/'+data.image_file+'"/>');
                    form.find('input[name="image_width"]').val(data.image_width);
                    form.find('input[name="image_height"]').val(data.image_height);
                }
                var title = form.find('input[name="title"]');
                var cat = form.find('input[name="category"]');
                var ix = form.find('input[name="x"]');
                var iy = form.find('input[name="y"]');
                title.val(data.title);
                cat.val(data.category);
                ix.val(data.x);
                iy.val(data.y);
                var submit = form.find('.submit');
                submit.off();
                submit.on('click', function(evt){
                    var json_data = form_to_json(form);
                    api.update(data.id, {update:json_data}, function(){
                        form.hide();
                    });
                });
                var delete_ = form.find('.delete');
                delete_.off();
                delete_.on('click', function(evt){
                    api.delete(data.id);
                });
                form.show();
                    
            }, this);
        },
        save:function(form){
            var json_data = form_to_json(form);
            var that = this;
            api.add({insert:json_data}, function(data){
                PostItem(data.id, that.layer, that.map, that.index);
                form.hide();
            });
        },
    };
    var ret = Object.create(proto);
    ret.init(map, layer);
    return ret;
}

$(document).ready(function(){
    var map = $('#map');
    var layer = $('#layer');
    var tb = TitleBar($('#titre-box'));
    layer.draggable();
    layer.css({ left:(layer.width() / -2)+'px', top:(layer.height() / -2)+'px' });
    var FM = FormManager(map, layer);
    var index = Index($('#index'), map, FM, tb);
    FM.index = index;
    api.set_table('objs');
    
    
    api.findAll(function(data){
        var result = data.result;
        for(var i=0; i< result.length; i++)
        {
            var w = result[i];
            try{
                PostItem(w.id, layer, map, index, tb);
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