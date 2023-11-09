var GameEngine = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function GameEngine (scene){
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {    
    var pt;
    game_data['forced_mark'] = (Math.random() * 2) < 1;
    game_data['game_engine'] = this;
    this.field_obj = {'x': 0, 'y': 0, 'w': 720, 'h': 580};
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	
    this.targets_manager = new TargetsManager(this.scene);
    this.targets_manager.init();
    this.targets_manager.emitter.on('EVENT', this.handler_event, this);    

    pt = game_data['graphics_manager'].get_pos('boosters_panel');
    this.boosters_panel = new BoostersPanel(this.scene);
    this.boosters_panel.init({
        'moving_holder': this.moving_holder,
        'pt_field': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,  0)),
        'field_w': this.field_obj.w
    });
    this.boosters_panel.emitter.on('EVENT', this.handler_event, this);  	
    this.boosters_panel.x = pt.x;
    this.boosters_panel.y = pt.y;


    this.playing_field = new PlayingField(this.scene);    
    this.playing_field.init({
        'boosters_panel': this.boosters_panel,
        'targets_manager': this.targets_manager,        
    });	
    this.playing_field.emitter.on('EVENT', this.handler_event, this);  
    

    this.add(this.playing_field);
    this.add(this.boosters_panel);
    this.add(this.moving_holder);        

    this.boosters_panel_y = this.boosters_panel.y;            
    this.level_active = false;
    this.field_scale = 1;    
    this.dracula_resizing = false;
    this.def_x = this.x;
    this.def_y = this.y;
},


update() {
    this.playing_field.update();  
},

start_level(params) {    
    this.replay = ('replay' in params && params['replay']);
    this.post_level_show = false;	
    this.level = params['level'];	
    this.level_id = params['level_id'];	
    this.level_active = true;
    let block_update_tiles = false;
    if (this.level_id <= 2) block_update_tiles = true;
    
    if (!block_update_tiles) 
        this.update_tiles(this.level, params['fill_rate']);
        
    this.targets_manager.update_manager({'level': this.level, 'level_id': this.level_id});
    this.playing_field.start_level({'level': this.level, 'level_id': this.level_id});
    this.boosters_panel.update_panel({'level': this.level, 'level_id': this.level_id});    
},

get_coef(level_id) {
    return Math.abs(Math.sin(level_id / 2) / 3)
},

update_tiles(level, fill_rate) {
    var old_field , new_field, i, j;
    var golden = game_data['tiles_mod'];
    old_field = level['fields'][0]['cells'];
    new_field = [];
    let coef = this.get_coef(this.level_id)
    
    for (var pos_y = 0; pos_y < old_field.length; pos_y++) {
        new_field.push([]);
        for (var pos_x = 0; pos_x < old_field[pos_y].length; pos_x++) {
            var val = '-'
            if (old_field[pos_y][pos_x] != '-' && this.is_communicating({old_field, pos_x, pos_y})) {
                if (Math.random() < fill_rate + coef) {
                    val = '1';
                    if (Math.random() * golden < 1 && this.level_id > 0) val = '2';
                }
            }
            new_field[pos_y][pos_x] = val;
        }
    }
    
    level['fields'][0]['tiles'] = new_field;
},

is_communicating({old_field, pos_x, pos_y}) {
    let res = false;

    // t - 1 - 1
    if (!res)
    res = old_field[pos_y] && old_field[pos_y][pos_x + 1] && old_field[pos_y][pos_x + 2] && this._is_communicating(old_field[pos_y][pos_x + 1]) && this._is_communicating(old_field[pos_y][pos_x + 2]);
    // 1 - 1 - t
    if (!res)
    res = old_field[pos_y] && old_field[pos_y][pos_x - 1] && old_field[pos_y][pos_x - 2] && this._is_communicating(old_field[pos_y][pos_x - 1]) && this._is_communicating(old_field[pos_y][pos_x - 2]);
    // t
    // 1
    // 1
    if (!res)
    res = old_field[pos_y + 1] && old_field[pos_y + 1][pos_x] && old_field[pos_y + 2] && old_field[pos_y + 2][pos_x] && this._is_communicating(old_field[pos_y + 1][pos_x]) && this._is_communicating(old_field[pos_y + 2][pos_x]);

    // 1
    // 1
    // t
    if (!res)
    res = old_field[pos_y - 1] && old_field[pos_y - 1][pos_x] && old_field[pos_y - 2] && old_field[pos_y - 2][pos_x] && this._is_communicating(old_field[pos_y - 1][pos_x]) && this._is_communicating(old_field[pos_y - 2][pos_x]);

    // 1- t- 1
    if (!res)
    res = old_field[pos_y] && old_field[pos_y][pos_x + 1] && old_field[pos_y][pos_x - 1] && this._is_communicating(old_field[pos_y][pos_x + 1]) && this._is_communicating(old_field[pos_y][pos_x - 1]);
    
    // 1
    // t
    // 1
    if (!res)
    res = old_field[pos_y - 1] && old_field[pos_y - 1][pos_x] && old_field[pos_y + 1] && old_field[pos_y + 1][pos_x] && this._is_communicating(old_field[pos_y - 1][pos_x]) && this._is_communicating(old_field[pos_y + 1][pos_x]);

    return res;
},

_is_communicating(item) {
    return item != '-';
},

get_total_items() {
    return this.targets_manager.get_total_tiles();
},

handler_update_level_scale(params) {
    this.level_scale = params['level_scale'];
    this.playing_field.update_scale(this.level_scale);
    this.emitter.emit('EVENT', params);
},

get_targets() {
    return this.targets_manager.get_targets();
},

handler_booster_drag_end(params) {
    this.playing_field.booster_drag_end(params);
},

handler_booster_drag_start(params) {
    this.playing_field.booster_drag_start(params);
},

handler_return_booster(params) {
    this.boosters_panel.return_booster(params);
},

block_moves() {
    this.playing_field.block_moves();
},
     
unblock_moves() {
    this.playing_field.unblock_moves();
},

handler_field_appeared(params) {				
   this.emitter.emit('EVENT', params);
},

handler_try_reshuffle(event) {
    
},

update_boosters() {
    this.boosters_panel.update_boosters();
},

handler_update_field_location(params) {
    game_data['error_history'].push('gpge2');
    var _this = this;
    var orient = loading_vars['orientation'];
    var pos_y;
    var pos_x;
    var start_x;
    var start_y;
    var end_x;
    var end_y;
    var field_items = params['field_items'];
    var field = params['field'];
    var unlocked_cells = params['unlocked_cells'];
    var is_smooth = params['is_smooth'];
    
	
	
    start_x = field_items[0].length - 1;
    start_y = field_items.length - 1;
    end_x = 0;
    end_y = 0;
    for (pos_y = 0; pos_y < field['cells'].length; pos_y++) {				
        for (pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++) {
            if (field['cells'][pos_y][pos_x] == 'E' || (field['cells'][pos_y][pos_x] in unlocked_cells)) {
                if (pos_x < start_x)
                    start_x = pos_x;
                if (pos_y < start_y)
                    start_y = pos_y;
                if (pos_x > end_x)
                    end_x = pos_x;
                if (pos_y > end_y)
                    end_y = pos_y;												
            }
                
        }
    }

    var new_x = (game_data['dim'][orient]['fieldW'] - (end_x + start_x + 1) * game_data['dim']['item_width']* this.level_scale) / 2;
    var new_y = (game_data['dim'][orient]['fieldH'] - (end_y + start_y + 1) * game_data['dim']['item_height']* this.level_scale) / 2;

    if (is_smooth) {
        game_data['scene'].tweens.add({targets: this.playing_field, 
		   'x': game_data['dim']['item_width'] / 2 * this.level_scale + new_x,
		   'y': game_data['dim']['item_height'] / 2 * this.level_scale + new_y,
		   'scaleX': _this.level_scale,
		   'scaleY': _this.level_scale,
            duration: 1000,  onComplete: function () {  
                _this.playing_field.create_mask();
                
            }});			
    }
    else {   
        this.playing_field.x = game_data['dim']['item_width'] / 2 * this.level_scale + new_x;
        this.playing_field.y = game_data['dim']['item_height'] / 2 * this.level_scale + new_y;
		this.playing_field.setScale(this.level_scale);
        this.playing_field.create_mask();        
    }       
},

no_moves(on_complete) {

},
        
add_extra_moves() {
    this.playing_field.unblock_moves();
},

get_empty_field_items() {
    return this.playing_field.get_empty_field_items();
},

complete_when_empty_field_items_is_empty(on_complete, iter = 10) {
    iter++;
    let empty_field_items = [...game_data.game_engine.playing_field.gems_manager.empty_field_items];
    if (empty_field_items.length === 0 || iter === 10) {
        on_complete();
    } else {
        setTimeout(() => {
            this.complete_when_empty_field_items_is_empty(on_complete, iter);
        }, 200);
    }
},

after_show(on_complete) {
    this.playing_field.field_items_manager.after_show_hide(on_complete, () => {
        this.complete_when_empty_field_items_is_empty(() => {
            this.level_complete(true);
        }, 0);
       
    });
    
},

apply_post_level_candies(on_complete) {    
    this.playing_field.apply_post_level_candies(on_complete);
},

wait_for_quiet(on_complete) {   
    this.playing_field.wait_for_quiet(on_complete);
},

monster_hurt(obj) {  
   this.playing_field.monster_hurt();
},


get_tutorial_holes(obj) {
    
    if (obj['type'] == 'tutorial1') return  this.playing_field.gems_manager.start_tutorial(obj);
    else if (obj['type'] == 'tutorial2') return game_data['field_tutorial_manager'].check_tutorial();
},

handler_make_quake(event) {
    game_data['error_history'].push('gpge3');
    this.make_quake(this, 3);
},
                
make_quake(item, repeatCount) {
    game_data['scene'].tweens.add({targets:item, repeat:repeatCount-1, y:item.y+ (5 + Math.random() * 3) * (2 * Math.floor(Math.random() * 2) - 1), x:item.x + (5 + Math.random() * 3) * (2 * Math.floor(Math.random() * 2) - 1) ,  duration: 100});
    game_data['scene'].tweens.add({targets:item, delay:(repeatCount + 1) * 100, y:this.def_y, x:this.def_x, duration: 100});
},

handler_make_dracula_resize(event) {

},

make_resize(item, num, on_compete) {
	
},

        
handler_move_target_gem(params) {
	
},

handler_event(params) {    
    switch (params['event']) {
        
	    case 'FIELD_APPEARED':
		    this.handler_field_appeared(params);
        break;                 
	    case 'PAUSE_GAME':
		    this.handler_pause_game(params);
        break;                 
	    case 'RESUME_GAME':
		    this.handler_resume_game(params);
        break;                 
	    case 'MAKE_QUAKE':
		    this.handler_make_quake(params);
        break;                 
	    case 'MAKE_DRACULA_RESIZE':
		    this.handler_make_dracula_resize(params);
        break;                 
	    case 'UPDATE_FIELD_LOCATION':
		    this.handler_update_field_location(params);
        break;                 
	    case 'TRY_RESHUFFLE':
		    this.handler_bonus_anim(params);
        break;   
	    case 'BONUS_CURSOR_SELECT':
		    this.handler_try_reshuffle(params);
        break;   
	    case 'APPLY_DRACULA':
		    this.handler_bonus_cursor_select(params);
        break;   
	    case 'APPLY_CANDIES':
		    this.handler_apply_candies(params);
        break;
	    case 'BOOSTER_DRAG_START':
		    this.handler_booster_drag_start(params);
        break;         
	    case 'BOOSTER_DRAG_END':
		    this.handler_booster_drag_end(params);
        break;           
	    case 'RETURN_BOOSTER':
		    this.handler_return_booster(params);
        break;           
        case 'APPLY_BOOSTER': 
            this.boosters_panel.apply_booster(params);
        break;  
        case 'BOOSTER_USED': 
            this.boosters_panel.booster_used(params);
        break; 
        case 'BOOSTER_CLICK': 
            this.playing_field.booster_click(params);
        break;  
        case 'MOVE_TARGET_GEM':
            this.handler_move_target_gem(params);
            this.emitter.emit('EVENT', params);
        break;  
        case 'UPDATE_LEVEL_SCALE':
            this.handler_update_level_scale(params);
        break;         

	    default:
		    this.emitter.emit('EVENT', params);
		break;
    }

},

level_complete(with_destroy = false) {
    this.level_active = true;
    this.playing_field.gems_manager.attr['level_active'] = false;
    if (with_destroy) this.destroy_level();
},

destroy_level() {
    if (this.level_active) {
        this.playing_field.destroy_level();							
        this.level_active = false;
    }
},

});
