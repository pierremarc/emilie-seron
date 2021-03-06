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
            that.pre_loaded = false; 
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
                    that.image = $('<img witdh='+data.image_width+' height='+data.image_height+' src="/es_media/thumbnails/'+data.image_file+'" />');
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
                    var text_title = $('<div class="text-title">'+data.title+'</div>');
                    var text_content = $('<div class="text-content" />');
                    $.post('/markdown', {text:data.text_content}, function(html_data){
                        text_content.html(html_data);
                    });
                    that.elem.append(text_title);
                    that.elem.append(text_content);
                }
                
                // permalink
                var prmlnk = $('<div class="permalink-box">\
                <a class="permalink-link" href="http://'+window.location.host+'/at/'+encodeURI(data.title)+'">http://'+window.location.host+'/at/'+data.title+'</a>\
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
                    var edit_box = EditBox(data.id, index.fmgr)
                    that.elem.append(edit_box);
                }
                
                that.pre_loaded = true;
            });
        },
        update_image:function(){
            var that = this;
            api.get(id, function(data){
                if(that.t === 'image_t')
                {
                    that.elem.attr({width:data.image_width,
                                height:data.image_height});
                    that.image.attr({src:'/es_media/'+data.image_file,
                                    width:data.image_width,
                                    height:data.image_height});
                }
                else
                {
                    
                    var text_title = that.elem.find('.text-title');
                    var text_content = that.elem.find('.text-content');
                    text_title.text(data.title);
                    $.post('/markdown', {text:data.text_content}, function(html_data){
                        text_content.html(html_data);
                    });
                }
            });
        },
        show: function(){
            if(this.t === 'image_t' && !this.loaded)
            {
                this.image.attr('src', '/es_media/'+this.data.image_file);
                this.loaded = true; 
            }
        },
        clear: function(){
            this.elem.remove();
        }
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
            
            this.items = {};
            var cc = $('<div>');
            this.container.append(cc);
            this.container._content = cc;
            this.categories_ready = false;
            this.setup_categories();
        },
        setup_categories:function(){
            this.categories = {};
            var that = this;
            api.set_table('categories');
            api.findAll(function(data){
                var cats = data.result;
                cats.sort(function(a,b){
                    return a.ord - b.ord;
                });
                for(var i = 0; i < cats.length; i++){
                    that.add_cat(cats[i].name, cats[i].id);
                }
                that.cat_data = cats;
                that.categories_ready = true;
            });
            api.reset_table();
        },
        add_cat:function(cat, id){
            var cat_h = cat.split('/');
            var cat_leaf_name = cat.split('/').pop();
            if(this.categories[id] !== undefined)
            {
                return;
            }
            this.categories[id] = {};
            
            var cat_container = $('<div class="index-category index-category-'+cat_h.length+'"></div>');
            var cat_title = $('<div class="index-category-name">'+cat_leaf_name+'</div>');
            var cat_content = $('<div class="index-category-content"></div>');
            cat_container.append(cat_title);
            cat_container.append(cat_content);
            cat_container._content = cat_content;
            this.categories[id].container = cat_container;
            this.categories[id].name = cat_leaf_name;
            var parent = this.container;
            var is_bound_to_root = true;
            if(cat_h.length > 1)
            {
                var pname = cat_h.slice(0, cat_h.length - 1).join('/');
                for(var ci in this.categories)
                {
                    if(this.categories[ci].name === pname)
                    {
                        parent = this.categories[ci].container;
                        break;
                    }
                }
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
            var that = this;
            if(!this.categories_ready)
            {
                window.setTimeout(function(){that.add(post_item, layer)} ,500);
                return;
            }
            
            if(post_item.data.cat_ref > 0)
            {
                var iit = $('<div class="index-item" data-x="'+post_item.x+'">'+post_item.data.title+'</div>');
                this.items[post_item.id] = {data:post_item, element:iit};
                
                iit.on('click', function(evt){
                    var cleft = ((that.map.width() - post_item.elem.width()) / 2) - post_item.x - (that.container.width() / 2);
                    var ctop = ((that.map.height() - post_item.elem.height()) / 2) - post_item.y;
                    layer.animate({ left:cleft+'px', top:ctop+'px' });
                    post_item.show();
                    that.titlebar.remove_all();
                    that.titlebar.add(post_item.data.title);
                });
                
                var category = this.categories[post_item.data.cat_ref];
                if(category !== undefined)
                {
                    var container = category.container;
                    var menu_items = container._content.find('.index-item');
                    var inserted = false;
                    for(var i = 0; i < menu_items.length; i++)
                    {
                        var menu_item = $(menu_items[i]);
                        var x = parseInt(menu_item.attr('data-x'));
                        if(x > post_item.x)
                        {
                            menu_item.before(iit);
                            inserted = true;
                            break;
                        }
                    }
                    if(!inserted)
                    {
                        container._content.append(iit);
                    }
                }
            }
        },
        delete:function(id){
            if(this.items[id] !== undefined)
                this.items[id].element.remove();
        },
        go:function(name, layer){
            for(var id in this.items)
            {
                var p_i = this.items[id].data;
                if(p_i.data.title === name)
                {
                    var cleft = ((this.map.width() - p_i.elem.width()) / 2) - p_i.x - (this.container.width() / 2);
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
    var selects = form.find('select');
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
    selects.each(extract);
    return JSON.stringify(ret);
}

function upload_file()
{
    
}

function FormManager(map, layer, titlebar)
{
    $('.form').hide();
    var proto = {
        init:function(map, layer, titlebar){
            this.type_txt = 'text_t';
            this.type_img = 'image_t';
            this.map = map;
            this.layer = layer;
            this.titlebar = titlebar;
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
            $('#form-button-category').on('click', function(evt){
                that.show_categories();
                that.current_form.dialog('open');
            });
            $('.form-close').on('click', function(evt){
                $('.form').hide();
            });
            
            $('.form').dialog({
                autoOpen: false,
                height: 500,
                width: 650,
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
                            var del_item = window._ES_POST_ITEMS[id];
                            del_item.clear();
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
                    var media_item = $('<div class="media-item" />');
                    var img = $('<img src="'+obj.thumbnail.url+'" height="'+obj.thumbnail.height+'" width="'+obj.thumbnail.width+'" />');
                    var media_del = $('<div class="media-remove">suprimer</div>');
                    
                    img.on('click', {img_obj:obj}, function(evt){
                        i_img.val(evt.data.img_obj.filename);
                        var thb = $('#form-thumbnail');
                        thb.empty();
                        thb.append('<img src="/es_media/thumbnails/'+evt.data.img_obj.filename+'"/>');
                        form.find('input[name="image_width"]').val(evt.data.img_obj.width);
                        form.find('input[name="image_height"]').val(evt.data.img_obj.height);
                    });
                    
                    media_del.on('click', {fn:obj.filename}, function(evt){
                        $.post('/delimage', evt.data, function(){
                            media_item.remove();
                        });
                    });
                    media_item.append(img);
                    media_item.append(media_del);
                    mediabox.append(media_item);
                });
                mediabox.masonry({
                    itemSelector : '.media-item',
                    gutterWidth: 3,
                }).masonry( 'reload' );
            });
        },
        show_categories:function(){
            var form = $('#category-form');
            this.current_form = form;
            form.empty();
            var cat_list = $('<ul id="form-category-list" />');
            form.append(cat_list);
            api.set_table('categories');
            api.findAll(function(data){
                var cats = data.result;
                cats.sort(function(a,b){
                    return a.ord - b.ord;
                });
                for(var i = 0; i < cats.length; i++){
                    var cid = cats[i].id;
                    var cat_item = $('<li class="form-category-item" id="id_'+cats[i].id+'" ><span>'+cats[i].name+'</span></li>');
                    var cat_del = $('<span class="form-category-item-delete">supprimer</span>');
                    cat_item.append(cat_del);
                    cat_list.append(cat_item);
                    
                    cat_del.on('click', {catid:cid,item:cat_item[0]}, function(evt){
                        api.set_table('categories');
                        api.delete(evt.data.catid, function(data){
                            $(this).remove();
                        }, evt.data.item);
                        api.reset_table();
                    });
                    
                }
            });
            api.reset_table();
            cat_list.sortable();
            cat_list.disableSelection();
            
            var new_cat=$('<input type="text" />');
            var new_cat_submit=$('<span>enregistrer nouvelle category</span>');
            new_cat_submit.button();
            var new_cat_box=$('<div id="new_cat_box" />');
            new_cat_box.append(new_cat);
            new_cat_box.append(new_cat_submit);
            new_cat_submit.on('click',function(){
               if(new_cat.val().length > 0)
               {
                    var val = new_cat.val();
                    new_cat.val('');
                    var order = cat_list.find('li').length + 1;
                    api.set_table('categories');
                    api.add({insert:JSON.stringify({name:val, ord:order})}, function(data){
                        cat_list.append('<li class="form-category-item" id="id_'+data.id+'" ><span>'+data.name+'</span></li>');
                    });
                    api.reset_table();
               }
            });
            form.append(new_cat_box);
            
            var widget = this.current_form.dialog( 'widget' );
            var suppr = widget.find("button:contains('Supprimer')");
            suppr.remove();
        },
        cat_options:function(select, selected){
            select.empty();
            select.append('<option value="0">Pas de catégorie</option>');
            api.set_table('categories');
            api.findAll(function(data){
                var selected_idx = -1;
                var cats = data.result;
                cats.sort(function(a,b){
                    return a.ord - b.ord;
                });
                for(var i = 0; i < cats.length; i++){
                    var option = $('<option value="'+cats[i].id+'">'+cats[i].name+'</option>')
                    select.append(option);
                    if(selected === parseInt(cats[i].id))
                    {
                        select[0].selectedIndex =  i+1;
                    }
                }
            });
            api.reset_table();
            
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
            
            this.cat_options(form.find('select[name="cat_ref"]'));
            
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
                    thb.append('<img src="/es_media/thumbnails/'+data.image_file+'"/>');
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
                var ix = form.find('input[name="x"]');
                var iy = form.find('input[name="y"]');
                title.val(data.title);
                ix.val(data.x);
                iy.val(data.y);
                
                this.cat_options(form.find('select[name="cat_ref"]'), data.cat_ref);
                
                
                that.current_form.dialog('open');
                var widget = that.current_form.dialog( 'widget' );
                var suppr = widget.find("button:contains('Supprimer')");
                suppr.button("enable");
            }, this);
        },
        save_category:function()
        {
            var s = $('#form-category-list').sortable('toArray');
            api.set_table('categories');
            for(var i = 0; i <s.length; i++)
            {
                var id = s[i].split('_').pop();
                api.update(id, {update:JSON.stringify({ord:i})});
            }
            api.reset_table();
        },
        save:function(){
            if(this.current_form === undefined)
                return;
            if(this.current_form.attr('id') === 'category-form')
            {
                this.save_category();
                return;
            }
            var form = this.current_form;
            var json_data = form_to_json(form);
            var that = this;
            if(that.current_edit_id === undefined)
            {
                api.add({insert:json_data}, function(data){
                    window._ES_POST_ITEMS[data.id] = PostItem(data.id, that.layer, that.map, that.index, that.titlebar);
                });
            }
            else
            {
                var update_id = that.current_edit_id;
                api.update(update_id, {update:json_data}, function(){
                    var update_pi = window._ES_POST_ITEMS[update_id];
                    that.index.delete(update_id);
                    update_pi.clear();
                    window._ES_POST_ITEMS[update_id] = PostItem(update_id, that.layer, that.map, that.index, that.titlebar);
                });
            }
        },
    };
    var ret = Object.create(proto);
    ret.init(map, layer, titlebar);
    return ret;
}

$(document).ready(function(){
    var map = $('#map');
    var layer = $('#layer');
    var tb = TitleBar($('#titre-box'));
    layer.draggable();
    layer.css({ left:(layer.width() / -2)+'px', top:(layer.height() / -2)+'px' });
    var FM = FormManager(map, layer, tb);
    var index = Index($('#index'), map, FM, tb);
    FM.index = index;
    api.set_table('objects');
    
    
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
        
        function complete_load(pid)
        {
            var item =  window._ES_POST_ITEMS[pid];
           if(item.pre_loaded)
               item.show();
           else
               window.setTimeout(function(){complete_load(pid);}, 200);
        };
        
        for(var pid in  window._ES_POST_ITEMS)
        {
            complete_load(pid);
        }
    });
    
    $('#submit').on('click', function(evt){
        save($('#form'));
    });
    
    if(IS_LOGGED)
    {
        $('textarea').markItUp(MarkDownSettings);
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