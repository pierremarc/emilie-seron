// seron.js

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) 
{
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


function PostItem(id, container, map, index, titlebar)
{
    
    function EditBox(id, fmgr){
            var edit = $('<span class="tool-item-edit">Éditer</span> ');
//             var del = $('<span class="tool-item-delete">Supprimer</span> ');
            
            edit.on('click', {id:id, fmgr:fmgr}, function(evt){
                evt.data.fmgr.edit(evt.data.id);
            });
            
//             del.on('click', {id:id, fmgr:fmgr}, function(evt){
//                 evt.data.fmgr.delete(evt.data.id);
//             });
            
            var toolbox = $('<div class="tool-box" />');
            toolbox.append(edit);
//             toolbox.append(del);
            return toolbox;
    };
    
    var proto = {
        init: function(id, container, map, index, titlebar){
            var that = this;
            that.id = id;
            that.container = container;
            that.map = map;
            that.index = index;
            that.titlebar = titlebar;
            that.loaded = false; 
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
                    that.container.on('drag', function(evt, ui){
                        {
                            var cr = new Geom.Rect(-ui.position.left, -ui.position.top, map.width(), map.height());
                            
                            if(cr.intersects(that.rect))
                            {
                                console.log(that.data.image_file+' => ' + that.rect +' <> '+ cr);
                                if(!that.loaded)
                                    that.show();
                                that.titlebar.add(that.data.title);
                            }
                            else
                            {
                                that.titlebar.remove(that.data.title);
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
                
                // permalink
                var prmlnk = $('<div class="permalink-box">\
                <div class="permalink-label">Permalien</div>\
                <a href="http://'+window.location.host+'/at/'+encodeURI(data.title)+'">http://'+window.location.host+'/at/'+data.title+'</a>\
                </div>');
                that.elem.append(prmlnk);
                
                // append to layer
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
                    
                    that.elem.append(EditBox(data.id, index.fmgr));
                }
            });
        },
        update_image:function(){
            var that = this;
            api.get(id, function(data){
                that.elem.attr({width:data.image_width,
                               height:data.image_height});
                that.image.attr({src:'/images/'+data.image_file,
                                width:data.image_width,
                                height:data.image_height});
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
    ret.init(id, container, map, index, titlebar);
    return ret;
}

function Index(container, map, fmgr, titlebar)
{
    var proto = {
        init:function(container, map, fmgr, titlebar){
            this.container = container;
            this.map = map;
            this.fmgr = fmgr;
            this.titlebar = titlebar;
            this.categories = {};
            this.data = [];
            this.items = [];
            var cc = $('<div>');
            this.container.append(cc);
            this.container._content = cc;
        },
        add_cat:function(cats){
            for(var i=0; i < cats.length; i++)
            {
                if(i > 0 && this.categories[cats.slice(0,i).join('/')] === undefined)
                {
                    this.add_cat(cats.slice(0,i));
                }
            }
            var fn_cat = cats.join('/');
            if(this.categories[fn_cat] !== undefined)
            {
                return this.categories[fn_cat];
            }
            var cat_container = $('<div class="index-category index-category-'+cats.length+'"></div>');
            var cat_title = $('<div class="index-category-name">'+cats[cats.length - 1]+'</div>');
            var cat_content = $('<div class="index-category-content"></div>');
            cat_container.append(cat_title);
            cat_container.append(cat_content);
            cat_container._content = cat_content;
            this.categories[fn_cat] = cat_container;
            var parent = this.container;
            var is_bound_to_root = true;
            if(cats.length > 1)
            {
                var pname = cats.slice(0, cats.length - 1).join('/');
                parent = this.categories[pname];
                is_bound_to_root = false;
            }
            
            parent._content.append(cat_container) ;
            cat_title.on('click',{ctnr:cat_container}, function(evt){
                var ctnr = evt.data.ctnr;
                if(ctnr.hasClass('index-category-off'))
                {
                    ctnr.removeClass('index-category-off');
                    ctnr.addClass('index-category-on');
                    ctnr._content.show(600);
                }
                else
                {
                    ctnr.removeClass('index-category-on');
                    ctnr.addClass('index-category-off');
                    ctnr._content.hide(600);
                }
            });
            
            if(!is_bound_to_root)
            {
                cat_content.hide();
                cat_container.addClass('index-category-off');
            }
            else
            {
                cat_container.addClass('index-category-on');
            }
            
            return cat_container;
        },
        add:function(post_item, layer){
            var cats = post_item.data.category.split('/');
            var that = this;
            if(cats.length > 0)
            {
                this.data.push(post_item);
                this.items[post_item.data.id] = iit;
                    
                var iit = $('<div class="index-item">'+post_item.data.title+'</div>');
                iit.on('click', function(evt){
                    var cleft = ((that.map.width() - post_item.elem.width()) / 2) - post_item.x;
                    var ctop = ((that.map.height() - post_item.elem.height()) / 2) - post_item.y;
                    layer.animate({ left:cleft+'px', top:ctop+'px' });
                    post_item.show();
                    that.titlebar.remove_all();
                    that.titlebar.add(post_item.data.title);
                });
                
                var container = this.add_cat(cats);
                container._content.append(iit);
            }
        },
        delete:function(id){
            for(var i = 0; i < this.data.length; i++)
            {
                var p_i = this.data[i];
                if(p_i.data.id === id)
                {
                    if(p_i.data.category.length > 0)
                    {
                        this.items[id].remove()
                    }
                    p_i.elem.remove();
                    this.data.remove(i);
                    break;
                }
            }
        },
        go:function(name, layer){
            for(var i = 0; i < this.data.length; i++)
            {
                var p_i = this.data[i];
                if(p_i.data.title === name)
                {
                    var cleft = ((this.map.width() - p_i.elem.width()) / 2) - p_i.x;
                    var ctop = ((this.map.height() - p_i.elem.height()) / 2) - p_i.y;
                    layer.animate({ left:cleft+'px', top:ctop+'px' });
                    p_i.show();
                    titlebar.remove_all();
                    titlebar.add(p_i.data.title);
                    return true;
                }
            }
            return false;
        },
    };
    var ret = Object.create(proto);
    ret.init(container, map, fmgr, titlebar);
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

function FormManager(map, layer, index)
{
    $('.form').hide();
    var proto = {
        init:function(map, layer){
            this.type_txt = 'text_t';
            this.type_img = 'image_t';
            this.map = map;
            this.layer = layer;
            this.images = [];
            this.current_form = undefined; 
            this.current_edit_id = undefined;
            var that = this;
            $('#form-button-text').on('click', function(evt){
                that.show(that.type_txt);
                that.current_form.dialog('open');
            });
            $('#form-button-image').on('click', function(evt){
                that.show(that.type_img);
                that.current_form.dialog('open');
            });
            $('.form-close').on('click', function(evt){
                $('.form').hide();
            });
            
            $('.form').dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true,
                buttons:{
                    Enregistrer:function(){
                        that.save();
                        $(this).dialog( "close" );
                    },
                    Supprimer:function(){
                        var id = that.current_edit_id;
                        api.delete(id, function(){
                            that.index.delete(id);
                        });
                        $(this).dialog( "close" );
                    },
                    Annuler:function(){
                        $(this).dialog( "close" );
                    }
                },
                close:function(){
                    that.current_form = undefined;
                    that.current_edit_id = undefined;
                }
            });
            
        },
        update_images:function(form)
        {
            var mediabox = $('#media-item-box');
            mediabox.empty();
            this.images = [];
            var that = this;
            $.get('/get_images', function(data){
                that.images = data;
                var i_img = form.children('input[name="image_file"]');
                $.each(that.images, function(idx, obj){
                    var img = $('<div class="media-item">\
                    <img src="'+obj.thumbnail.url+'" height="'+obj.thumbnail.height+'" width="'+obj.thumbnail.width+'"/>\
                    </div>');
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
                mediabox.masonry({
                    itemSelector : '.media-item',
                    gutterWidth: 3,
                }).masonry( 'reload' );
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
            
            this.current_form = form;
            
            var inputs = form.find('input');
            inputs.each(function(idx, html_elem){
                var elem = $(html_elem);
                if(elem.attr('name') !== 'obj_type')
                {
                    elem.val('');
                }
            });
            form.find('textarea').val('');
            
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
            
            var widget = this.current_form.dialog( 'widget' );
            var suppr = widget.find("button:contains('Supprimer')");
            suppr.button("disable");
        },
        edit:function(id){
            $('.form').hide();
            var that = this;
            api.get(id, function(data){
                var form = $('#text-form');
                if(data.obj_type === that.type_img)
                {
                    form = $('#image-form');
                    that.update_images(form);
                    form.find('input[name="image_file"]').val(data.image_file);
                    var thb = $('#form-thumbnail');
                    thb.empty();
                    thb.append('<img src="/images/thumbnails/'+data.image_file+'"/>');
                    form.find('input[name="image_width"]').val(data.image_width);
                    form.find('input[name="image_height"]').val(data.image_height);
                }
                else
                {
                    var content = form.find('textarea[name="text_content"]');
                    content.val(data.text_content);
                }
                that.current_form = form;
                that.current_edit_id = id;
                
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
                        window._ES_POST_ITEMS[data.id].update_image();
                        form.hide();
                    });
                });
                
                
                that.current_form.dialog('open');
                var widget = that.current_form.dialog( 'widget' );
                var suppr = widget.find("button:contains('Supprimer')");
                suppr.button("enable");
            }, this);
        },
        save:function(){
            if(that.current_form === undefined)
                return;
            var form = this.current_form;
            var json_data = form_to_json(form);
            var that = this;
            api.add({insert:json_data}, function(data){
                PostItem(data.id, that.layer, that.map, that.index);
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
    
    
    function go_to_start(id, layer)
    {
        if(!index.go(id, layer))
        {
            window.setTimeout(function(){go_to_start(id, layer)}, 500);
        }
    }
    window._ES_POST_ITEMS = {};
    api.findAll(function(data){
        var result = data.result;
        for(var i=0; i< result.length; i++)
        {
            var w = result[i];
            try{
                window._ES_POST_ITEMS[w.id] = PostItem(w.id, layer, map, index, tb);
            }
            catch(e)
            {
                console.log(e);
            }
        }
        if(window.start_id !== undefined)
        {
            go_to_start(start_id, layer)
        }
    });
    
    $('#submit').on('click', function(evt){
        save($('#form'));
    });
    
    if(IS_LOGGED)
    {
        var uploader = new plupload.Uploader({
                runtimes : 'html5',
                browse_button : 'upload_file',
                container : 'upload',
                max_file_size : '10mb',
                url : '/upload',
                filters : [ {title : "Image files", extensions : "jpg,gif,png"} ]
            });
        
        uploader.init();
        uploader.bind('FilesAdded', function(up, files){
            var up_box = $('#upload');
            up_box.show();
            uploader.start();
            $.each(files, function(i, file) {
                $('#filelist').append( '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' + '</div>' );
                
            });
            up_box.hide();
        });
        uploader.bind('FileUploaded', function(up, file){
            $('#'+file.id).remove();
            console.log('Uploaded => '+file.name);
            FM.update_images($('#image-form'));
        });
    }
});