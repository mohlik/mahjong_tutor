class FieldItemsManager{
	constructor(){

    }

init(params) {    
    this.emitter = new Phaser.Events.EventEmitter();

    this.scene = game_data['scene'];
    this.field_items_holder = params['field_items_holder']; 
    this.border_holder = params['border_holder'];    
    this.gems_holder = params['gems_holder'];
    this.blocks_holder = params['blocks_holder'];
    this.locks_holder = params['locks_holder'];
    this.tiles_holder = params['tiles_holder'];
    this.blick_holder = params['blick_holder'];			
    this.light_holder = params['light_holder'];
    this.moving_holder = params['moving_holder'];
    this.field_items = params['field_items'];
    this.targets_manager = params['targets_manager'];
    this.first_gems_moving_holder = params['first_gems_moving_holder'];                                                                
}
        
update_level(params) {	
    this.level_id = params['level_id'];
    this.level = params['level'];
    this.reproduction_moves = 0;
    this.destroyed_blocks = {};   
    this.unlocked_cells = {'0': true}; 
    game_data['is_broom_applicable_level'] = false;
}	

start_level() {
    //this.blick_tiles();
}

update_field(_field_id) { 
    game_data['error_history'].push('gpfim1');   
    this.field_id = _field_id;	    
    this.clean_field_items(true);
    this.create_empty_field();
    this.unlocked_cells = {'0': true};
}

unlock_field(params) {
    var pos_y; 
    var pos_x;
    var lock_id = params['lock_id'];
    var cell_type;
    var new_items;

    let callback = params['callback'] ? params['callback'] : () => {};
    this.unlocked_cells[lock_id] = true;
	
	
	this.level_scale = game_data['utils'].get_field_scale({
     'field': this.level['fields'][this.field_id], 
     'unlocked_cells': this.unlocked_cells,
    });
	this.emitter.emit('EVENT', {'event': 'UPDATE_LEVEL_SCALE', 'level_scale': this.level_scale});	
	// debugger
	//this.level_scale = params['level_scale'];
    new_items = [];
    
    this.init_show_type(lock_id);
    game_data['allow_create_gems'] = lock_id != 0;
    game_data['allow_wait_for_quiet'] = lock_id != 0;
    if (lock_id == 0) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'level_start_field'});

    var field =  this.level['fields'][this.field_id];
    for(pos_y = field['cells'].length - 1; pos_y >= 0; pos_y--){				
        for(pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++){								
            cell_type = field['cells'][pos_y][pos_x];
            if (cell_type != '-' && cell_type != 'E' && lock_id == parseInt(cell_type)) {
                let field_item = this.create_field_item({'pos_y': pos_y, 'pos_x': pos_x, 'delay': this.show_type_delays[pos_y][pos_x]});
                
                if (field_item) {
                    callback(field_item);

                    if (!field_item.is_locked() && field_item.is_blocked() && field_item.is_empty() && lock_id > 0) {
                        new_items.push({'pos_y': pos_y, 'pos_x': pos_x, 'new': true});
                    }
                }
            }            
        }				
    }
    this.emitter.emit('EVENT', {'event': 'UPDATE_FIELD_LOCATION', 
                            'field_items': this.field_items, 
                            'field': field,
                            'unlocked_cells': this.unlocked_cells,
                            'is_smooth': lock_id > 0}); 
    if (new_items.length > 0) this.add_new_gems(new_items);
	 game_data['allow_wait_for_quiet'] = true;


	game_data['allow_create_gems'] = true;
}

after_show_hide(on_complete, level_complete = () => {}) {
    var pos_x, pos_y, cell_type;
    var field =  this.level['fields'][this.field_id];			
    game_data['allow_create_gems'] = false;
    for(pos_y = field['cells'].length - 1; pos_y >= 0; pos_y--){				
        for(pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++){								
            cell_type = field['cells'][pos_y][pos_x];
            if (cell_type != '-' && cell_type != 'E' && this.field_items && this.field_items[pos_y] && this.field_items[pos_y][pos_x] ) {
                this.field_items[pos_y][pos_x].hide_field_item(this.backup_delays[pos_y][pos_x])
            }            
        }				
    }

    

    setTimeout(() => {
        level_complete();
    }, 800);
    setTimeout(() => {  
        on_complete();
    }, 1200);
}

is_active(obj) {
    let {pos_x, pos_y} = obj;
    let field_item = this.field_items[pos_y];
    if (field_item) {
        if (field_item.every(el => el === null)) return false;
        field_item = this.field_items[pos_y][pos_x];
    }

    if (!field_item || field_item.is_blocked() || field_item.is_locked()) return false;

    return true;
}

is_exists(obj) {
    let {pos_x, pos_y} = obj;
    let field_item = this.field_items[pos_y];

    if (field_item) {
        field_item = this.field_items[pos_y][pos_x];
        if (!field_item) return false;
    } else return false;

    return field_item;
}

init_show_type(lock_id) {
    var pos_y; 
    var pos_x;
    var cell_type;
    var show_type = ['sequence_top', 'sequence_down', 'top_rows', 'bottom_rows', 'left_cols', 'right_cols', 'random'];
    var _type = show_type[parseInt(Math.random() * show_type.length)];
    var field =  this.level['fields'][this.field_id];
    var base_delay = 20; //sequence_down 
    var row_delay = 10;
    var col_delay = 20;
    this.show_type_delays = {'max_delay': base_delay};
    var reverse = false;
    //_type = 'immediate'
    if (_type == 'immediate') {
        base_delay = 0;
        row_delay = 0;
        col_delay = 0;
    }
    else if (_type == 'sequence_top') {
        reverse = true;
    }
    else if (_type == 'top_rows') {
        row_delay = 100;
        col_delay = 0;
        reverse = true;
    }
    else if (_type == 'bottom_rows') {
        row_delay = 100;
        col_delay = 0;
    }
    else if (_type == 'left_cols') {
        row_delay = 0;
        col_delay = 100;
    }
    else if (_type == 'right_cols') {
        row_delay = 0;
        col_delay = 100;
        reverse = true;
    }

    var total_items = 0;
    for(pos_y = field['cells'].length - 1; pos_y >= 0; pos_y--){	
        this.show_type_delays[pos_y] = {};
        for(pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++){								
            cell_type = field['cells'][pos_y][pos_x];
            if (cell_type != '-' && cell_type != 'E') {
                this.show_type_delays[pos_y][pos_x] = 0;
                total_items++;
            }            
        }				
    }
    
    if (_type == 'right_cols' || _type == 'left_cols') {
        for(pos_x = 0; pos_x < field['cells'][0].length; pos_x++){
            base_delay += col_delay;
            for(pos_y = field['cells'].length - 1; pos_y >= 0; pos_y--){								
                cell_type = field['cells'][pos_y][pos_x];
                if (cell_type != '-' && cell_type != 'E') {
                    this.show_type_delays[pos_y][pos_x] = lock_id != 0 ? 0 : base_delay;
                    base_delay += row_delay;
                    this.show_type_delays['max_delay'] = lock_id != 0 ? 0 : base_delay;;
                }            
            }				
        }
    }
    else {
        for(pos_y = field['cells'].length - 1; pos_y >= 0; pos_y--){	
            base_delay += row_delay;
            for(pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++){								
                cell_type = field['cells'][pos_y][pos_x];
                if (cell_type != '-' && cell_type != 'E') {
                    if (_type == 'random') {
                        var _delay = parseInt(Math.random() * total_items + 1) * 20;
                        this.show_type_delays[pos_y][pos_x] = lock_id != 0 ? 0 : _delay;
                    }
                    else this.show_type_delays[pos_y][pos_x] = lock_id != 0 ? 0 : base_delay;
                    base_delay += col_delay;
                    this.show_type_delays['max_delay'] = lock_id != 0 ? 0 : base_delay;;
                }            
            }				
        }
    }
    if (reverse) {
        for (pos_y in this.show_type_delays) {
            for (pos_x in this.show_type_delays[pos_y]) {
                this.show_type_delays[pos_y][pos_x] = this.show_type_delays['max_delay'] - this.show_type_delays[pos_y][pos_x];
            }
        }
    }
    if (lock_id == 0) {
        this.backup_delays =  {'max_delay': 1000};
        for (pos_y in this.show_type_delays) {
            this.backup_delays[pos_y] = {}
            for (pos_x in this.show_type_delays[pos_y]) {
                this.backup_delays[pos_y][pos_x] = this.show_type_delays[pos_y][pos_x];
            }
        }
    }
}

get_unlocked_cells() {

    return this.unlocked_cells;
}



create_field_item(obj) {
    var pos_y = obj['pos_y'];
    var pos_x = obj['pos_x'];

    var field = this.level['fields'][this.field_id];
    var block_type = field['blocks'][pos_y][pos_x];
    var tile_type = field['tiles'][pos_y][pos_x];
    var lock_type = field['locks'][pos_y][pos_x];    
    
    var field_item = new FieldItem(this.scene);
    field_item.init({
        'pos_y': pos_y,
        'pos_x': pos_x,
        'delay': obj['delay'],
        'moving_holder': this.moving_holder,
        'gems_holder':	this.gems_holder,
        'blocks_holder': this.blocks_holder,
        'locks_holder': this.locks_holder,
        'tiles_holder': this.tiles_holder,
        'light_holder': this.light_holder,							 					 
    });

    field_item.x = pos_x * game_data['dim']['item_width'] //+ int(Math.random() * 20)
    field_item.y = pos_y * game_data['dim']['item_height'];	
    						
    this.field_items_holder.add(field_item);
    
    field_item.init_tile(tile_type);
    field_item.update_tile();
    field_item.init_block(block_type);
    field_item.update_block();				
    field_item.init_lock(lock_type);
    field_item.update_lock();
    field_item.update_gem_visibility();
    //field_item.delayed_show();
    this.field_items[pos_y][pos_x] = field_item;
    field_item.emitter.on("EVENT", this.handler_event, this);	
    return field_item;
}

create_empty_field() {
    for(var pos_y = 0; pos_y < this.level['fields'][this.field_id]['cells'].length; pos_y++){
        this.field_items.push(new Array());				
        for(var pos_x = 0; pos_x < this.level['fields'][this.field_id]['cells'][pos_y].length; pos_x++)					
            this.field_items[pos_y][pos_x] = null;				
    }			
}


add_new_gems(arr) {
	/*
    var field_item;		
    var field = this.level['fields'][this.field_id];
   
    for (var i = 0; i < arr.length; i++) {
        field_item = this.field_items[arr[i]['pos_y']][arr[i]['pos_x']];
        if (!field_item.is_extrusive() || field['items'][arr[i]['pos_y']][arr[i]['pos_x']] != '-') {
            //if (with_delay) this.add_new_gem_delayed(arr[i]);
            //else 
            this.emitter.emit("EVENT", {'event': 'CREATE_GEM', 'item': arr[i]}, this);
        }
            
    }
	*/
	this.emitter.emit('EVENT', {'event': 'ADD_NEW_GEMS', 'items': arr});
}

update_empty_field_items (field_item) {
    
    // console.log(field_item.is_empty());
    // console.log(field_item.is_dynamical());
    // console.log(field_item.is_blocked());
    if (field_item.is_empty() && !field_item.is_dynamical() && !field_item.is_blocked() && !field_item.is_locked()) {
        
        this.emitter.emit('EVENT', {'event': 'UPDATE_EMPTY_FIELD_ITEMS', 'item': field_item});	
    }
    
}

handler_lock_destroyed(params) {
    this.field_id
    this.unlock_field({...params, 'callback': this.update_empty_field_items.bind(this)});

    this.emitter.emit("EVENT", {'event': 'MAKE_QUAKE'});
    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'field_unlocked'});   
}

reset_destroyed_blocks() {   
    this.destroyed_blocks = {};
}

update_reproduction() {
    var pos_x;
    var pos_y;
    var ind1;
    var ind2;
    var dir;
    var reproductive_item;
    var all_reproductive = {};
    var reproductive_items;
    var dirs;
    var added;
    var obj;
    var pt;
    var block_id;
    var reproductivity;
    
    this.reproduction_moves++;		
    for(pos_y = 0; pos_y < this.field_items.length; pos_y++){				
        for(pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++){					
            if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_reproductive()) {
                block_id = this.field_items[pos_y][pos_x].get_block_id();
                if (!(block_id in all_reproductive))
                    all_reproductive[block_id] = [];
                all_reproductive[block_id].push(this.field_items[pos_y][pos_x]);
            }
        }
    }				
    // debugger

    for (block_id in all_reproductive) {
        if (!(block_id in this.destroyed_blocks)) {
            if ('reproductivity' in this.level && block_id in this.level['reproductivity'])
                reproductivity = this.level['reproductivity'][block_id];
            else 
                reproductivity = 1;

            if (this.reproduction_moves % reproductivity == 0) {
                reproductive_items = all_reproductive[block_id];
                added = false;

                while (reproductive_items.length > 0 && !added) {			
                    ind1 = Math.floor(Math.random() * reproductive_items.length);
                    reproductive_item = reproductive_items[ind1];
                    obj = reproductive_item.get_pos();
                    pos_x = obj['pos_x'];
                    pos_y = obj['pos_y'];						
                    reproductive_items.splice(ind1, 1);
                    dirs = [0, 1, 2, 3];
                    while (dirs.length && !added) {
                        ind2 = Math.floor(Math.random() * dirs.length);
                        dir = dirs[ind2];
                        dirs.splice(ind2, 1);							
                            
                        if (dir == 0 && pos_y > 0 && this.field_items[pos_y - 1][pos_x] && !this.field_items[pos_y - 1][pos_x].is_blocked() && this.field_items[pos_y - 1][pos_x].is_normal()) {
                            added = true;							
                            this.field_items[pos_y - 1][pos_x].infect(reproductive_item);
                        }														
                        if (dir == 1 && pos_x < this.field_items[pos_y].length - 1 && this.field_items[pos_y][pos_x + 1] && !this.field_items[pos_y][pos_x + 1].is_blocked() && this.field_items[pos_y][pos_x + 1].is_normal()) {
                            added = true;							
                            this.field_items[pos_y][pos_x + 1].infect(reproductive_item);							
                        }														
                        if (dir == 2 && pos_y < this.field_items.length - 1 && this.field_items[pos_y + 1][pos_x] && !this.field_items[pos_y + 1][pos_x].is_blocked() && this.field_items[pos_y + 1][pos_x].is_normal()) {
                            added = true;	
                            this.field_items[pos_y + 1][pos_x].infect(reproductive_item);							
                        }														
                        if (dir == 3 && pos_x > 0 && this.field_items[pos_y][pos_x - 1] && !this.field_items[pos_y][pos_x - 1].is_blocked() && this.field_items[pos_y][pos_x - 1].is_normal()) {
                            added = true;
                            this.field_items[pos_y][pos_x - 1].infect(reproductive_item);
                        }														
                    }					
                }		
            }
        }				
    }
}		

handler_remove_gem(params) {
    
    var pos_x = params['pos_x'];
    var pos_y = params['pos_y'];
    this.field_items[pos_y][pos_x].destroy_gem();
    
}		

blick_tiles() {

    var tiled_items = this.get_tiled_items();
    if (tiled_items.length > 0) {

        var ind = Math.floor(Math.random() * tiled_items.length);
        var tiled_item = tiled_items[ind];
        var mc = tiled_item.get_tile();
        if (mc) {
            mc.tween = game_data['scene'].tweens.add({targets: mc, scale: 1.07, duration: 200, ease: "Sine.easeInOut", loop: 1, yoyo: true});
        }
        setTimeout(() => {
            if (game_data['allow_create_gems']) this.blick_tiles();
        }, 6000);
    }
    
}



get_tiled_items() {
    
    var pos_x; 
    var pos_y;
    var arr = [];
    for(pos_y = 0; pos_y < this.field_items.length; pos_y++)				
        for(pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++)
            if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_tiled(true))
                arr.push(this.field_items[pos_y][pos_x]);
    
    return arr;			
}				

handler_block_destroyed(params) {
    var block_id = params['block_id'];
    this.destroyed_blocks[block_id] = true;
}

handler_tile_destroyed(params) {
    this.targets_manager.tile_destroyed(params);
}

create_border() {
    /*
    var i, j, pos_x, pos_y: int;
    while (border_holder.numChildren)
        border_holder.removeChildAt(0);
    borders = new Array();
    
    for(pos_y = 0; pos_y < field_items.length; pos_y++){
        borders.push(new Array());
        for(pos_x = 0; pos_x < field_items[pos_y].length; pos_x++){					
            borders[pos_y][pos_x] = {};
            if(field_items[pos_y][pos_x]) {
                if (pos_x == 0 || !field_items[pos_y][pos_x - 1])
                    add_border('left', pos_y, pos_x);
                if (pos_x == field_items[pos_y].length - 1 || !field_items[pos_y][pos_x + 1])
                    add_border('right', pos_y, pos_x);
                if (pos_y == 0 || !field_items[pos_y - 1][pos_x])
                    add_border('up', pos_y, pos_x);
                if (pos_y == field_items.length - 1 || !field_items[pos_y + 1][pos_x])
                    add_border('down', pos_y, pos_x);
            }
        }
    }					
    */
}

add_border(orient, pos_y, pos_x) {
    /*
    var field_border: FieldBorder = new FieldBorder();			
    switch (orient) {
        case 'left':					
            field_border.x = pos_x * dim['item_width'] - dim['item_width'] / 2;
            field_border.y = pos_y * dim['item_height'] - dim['item_height'] / 2;
            field_border.rotation = 90;
            break;
        case 'right':					
            field_border.x = pos_x * dim['item_width'] + dim['item_width'] / 2 + field_border.height;
            field_border.y = pos_y * dim['item_height'] - dim['item_height'] / 2;
            field_border.rotation = 90;
            break;
        case 'up':					
            field_border.x = pos_x * dim['item_width'] - dim['item_width'] / 2;
            field_border.y = pos_y * dim['item_height'] - dim['item_height'] / 2 - field_border.height;
            break;
        case 'down':
            field_border.x = pos_x * dim['item_width'] -  dim['item_width'] / 2;
            field_border.y = pos_y * dim['item_height'] + dim['item_height'] / 2;				
            break;					
    }
                
    border_holder.addChild(field_border);			
    borders[pos_y][pos_x][orient] = true;
    */
}		

create_mask() {
	/*
    game_data['error_history'].push('gpfim3');   
    var pt_global = game_data['utils'].toGlobal(this.gems_holder, new Phaser.Geom.Point(0, 0));    
    this.first_gems_moving_holder.x = pt_global.x;
    this.first_gems_moving_holder.y = pt_global.y;    

    var i; 
    var j;
    var pt;
    var field_mask = new Phaser.GameObjects.Graphics(this.scene);
    field_mask.fillStyle(0xff0000, 0.5);
    
    for(i = 0; i < this.field_items.length; i++){
        for(j = 0; j < this.field_items[i].length; j++){					
            if(this.field_items[i][j]) {
                pt = this.field_items[i][j].get_center_pt();
                
                field_mask.fillRect(
                    pt.x - (game_data['dim']['item_width'] / 2) * this.level_scale, 
                    pt.y - (game_data['dim']['item_height'] / 2) * this.level_scale,
                    game_data['dim']['item_width'] * this.level_scale, game_data['dim']['item_height'] * this.level_scale
                );
            }
        }
    }					

    var mask = new Phaser.Display.Masks.GeometryMask(this.scene, field_mask);    
    this.first_gems_moving_holder.clearMask(true);
    this.first_gems_moving_holder.setMask(mask);	
	*/
}

clean_field_items(is_smooth) {
   this.destroy_level();							
}

clean_field_item(field_item, is_smooth) {	
    
    /*
    var _this = this;
    var timeout = 500;
    field_item.destroy_item(is_smooth);
    if (is_smooth) {
        this.scene.tweens.add({targets: field_item, alpha: 0, duration: timeout, onComplete: function(){
                _this.destroy_field_item(field_item);
            },                
        });
    }
    else {
        this.destroy_field_item(field_item);
    }
    */
   //this.destroy_field_item(field_item);
   
   
}		

destroy_field_item(field_item)  {
    //field_item.alpha = 1;
    //field_items_holder.removeChild(field_item);				
    //game_data['utils'].recycle({'type': 'field_item', 'item': field_item});						
}


handler_event(params) {
	switch (params['event']) {
		case 'LOCK_DESTROYED':
			this.handler_lock_destroyed(params);
      break;
    case 'REMOVE_GEM':
			this.handler_remove_gem(params);
      break;
    case 'BLOCK_DESTROYED':
			this.handler_block_destroyed(params);
      break;
    case 'TILE_DESTROYED':
			this.handler_tile_destroyed(params);
      break;
      
		default:
		  this.emitter.emit('EVENT', params);
			break;
	}
}


destroy_level() {
    var i;
    var j;

    for(i = 0; i < this.field_items.length; i++){
        for(j = 0; j < this.field_items[i].length; j++){	
            if (this.field_items[i][j]) {
                this.field_items[i][j].destroy_field_item();
                this.field_items[i][j].destroy(true);
            }
        }
    }
    while (this.field_items.length)
        this.field_items.pop();

    /*	
    clean_field_items();
    while(tiles_mask.numChildren)
        tiles_mask.removeChildAt(0);			
    clearTimeout(blick_tileout_id);
    blick.gotoAndStop(1);
    */
}


}