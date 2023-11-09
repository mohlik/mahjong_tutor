var FieldItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function FieldItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();     
        
        this.shake_arr = [4, 3, 2, 1, 0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3];
    },

init(params) {
    this.gems_holder = params['gems_holder'];
    this.moving_holder = params['moving_holder'];
    this.blocks_holder = params['blocks_holder'];			
    this.locks_holder = params['locks_holder'];
    this.tiles_holder = params['tiles_holder'];
    this.light_holder = params['light_holder'];
    
    this.timer_shake = this.scene.time.addEvent({delay: 10, callback: this.handler_shake, callbackScope: this, loop: true});
    this.timer_shake.paused = true;
    this.timer_shake.type_timer = 'field_item_shake'
    this.shake_ind = 0;
        
    this.pos_x = params['pos_x'];
    this.pos_y = params['pos_y'];
    this.delay = params['delay'];
                
    this.attr = {
        'block': {},
        'intblock': {},
        'tile': {},
        'grass': {},
        'lock': {},
        'gem': {},
        'portal': {

        },
        'freezed': false,				
        'block_strength': 0,
        'tile_strength': 0,				
        'hammer_applicable': false,
        'broom_applicable': false,
        'extrusive': false,
        'reproductive': false,
        'neighbour_explosive': false,
        'trapped': false
    };										
    this.freeze_timeout_id = null;
    this.lightning_point = null;

    this.field_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "field_item_bg");
    this.add(this.field_bg);

    this.field_flash = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", "field_item_flash");
    this.field_flash.alpha = 0;
    this.add(this.field_flash);

    this.setInteractive(new Phaser.Geom.Rectangle(
        -game_data['dim']['item_width'] / 2, 
        -game_data['dim']['item_height'] / 2, 
        game_data['dim']['item_width'], 
        game_data['dim']['item_height']
    ), Phaser.Geom.Rectangle.Contains);

    this.last_time = 0;
    this.on('pointerover', this.handler_item_over, this);
    this.on('pointerout', this.handler_item_out, this);
    this.on('pointerdown', this.handler_item_down, this);
    
},

handler_item_over() {    
    this.emitter.emit('EVENT', {'event': 'FIELD_ITEM_OVER', 'pos_x': this.pos_x, 'pos_y': this.pos_y});
},

handler_item_out() {    
    this.emitter.emit('EVENT', {'event': 'FIELD_ITEM_OUT', 'pos_x': this.pos_x, 'pos_y': this.pos_y});
},

handler_item_down() {   
    if (this.is_blocked()) {
        var block = this.attr['block']['mc'];
        game_data.game_play.game_engine.playing_field.gems_manager.remove_web_shake();
            
            if (game_data['game_play'].attr.state && game_data.game_engine.playing_field.gems_manager.active_booster['current_item']) {
                var current_item = game_data.game_engine.playing_field.gems_manager.active_booster['current_item'];
                    var pt = current_item.get_center_pt();
                    game_data.game_engine.playing_field.gems_manager.prepare_booster({'booster_id': game_data['game_play'].attr.booster_id, pos_x: current_item['pos_x'], pos_y: current_item['pos_y']});
                    
                    
                game_data.game_engine.playing_field.gems_manager.emitter.emit('EVENT', {'event': 'APPLY_BOOSTER', 'booster_id': game_data['game_play'].attr.booster_id, 'pt': pt, 'items': [...game_data.game_engine.playing_field.gems_manager.active_booster['items']]});
                   this.hide_booster();
                    
            } else {
                if (!this.block_gem_click_sound) {
                    this.block_gem_click_sound = true;
                    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'gem_click'});
                    setTimeout(() => {
                        this.block_gem_click_sound = false;
                    }, 1000);
                }
                game_data['scene'].tweens.add({targets: block, angle: 5, duration: 30, onComplete: function () {
                    if (block) {
                        game_data['scene'].tweens.add({targets: block, angle: -4, duration: 40, onComplete: function () {
                            if (block) {
                                game_data['scene'].tweens.add({targets: block, angle: 0, duration: 30, onComplete: function () {
                
                                }});
                            }
                        }});
                    }
                }});
            }

    }

    let clickDelay = this.scene.time.now - this.last_time;
    this.last_time = this.scene.time.now;
    if(clickDelay < 350 && !game_data['game_play']['game_engine']['playing_field']['gems_manager'].attr['moves_blocked'] && (!game_data.tutorial_manager.is_active || get_passed_amount() === 2)) {
        if (this.is_bonus() && game_data.tutorial_manager.is_allowed({'pos_x': this.pos_x, 'pos_y': this.pos_y, 'type': 'double_click'})) {
            game_data.game_engine.playing_field.gems_manager.block_moves();
            game_data['utils'].delayed_call(600, () => {
                game_data.game_engine.playing_field.gems_manager.unblock_moves();
            })
            this.emitter.emit('EVENT', {'event': "UPDATE_TUTORIAL_ITERATION"});
            this.emitter.emit('EVENT', {'event': 'UPDATE_CANDIDATE', 'pos_x': this.pos_x, 'pos_y': this.pos_y, bonus: true});
            this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
            this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": 1000});
            setTimeout(() => {
                game_data['game_engine']['playing_field']['gems_manager'].attr['down_info'] = {};
                this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'});
            }, 350)
            game_data['game_engine']['playing_field']['gems_manager'].switched_gems.forEach(g => {
                if (g.is_switched())
                    g.switch_gem()
            })

        }
    }

    let component
    if (this.is_intblocked()) {
        component = 'intblock'
    }
    else if (this.is_blocked()) {
        component = 'block'

    }
    
    if (component) {
        let block = this.attr[component]['mc'];
        this.block_shive(block)
    }
},

block_shive(block) {

    if (!this.block_gem_click_sound) {
        this.block_gem_click_sound = true;
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'gem_click'});
        setTimeout(() => {
            this.block_gem_click_sound = false;
        }, 1000);
    }
    
    game_data['scene'].tweens.add({targets: block, angle: 5, duration: 30, onComplete: function () {
        if (block) {
            game_data['scene'].tweens.add({targets: block, angle: -4, duration: 40, onComplete: function () {
                if (block) {
                    game_data['scene'].tweens.add({targets: block, angle: 0, duration: 30, onComplete: function () {
    
                    }});
                }
            }});
        }
    }});
},

hide_booster() {
    game_data['game_play'].attr.state = false;
                    
    game_data.game_engine.playing_field.gems_manager.active_booster = {};
    game_data['game_play'].rt.destroy();
    game_data['utils'].hide_booster_info();
    if ( game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id])
    game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id].state_particle.destroy();

    game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id].attr.state = false;
    game_data['game_play'].attr.booster_id = null;
},

hide_field_item(delay) {
    game_data['scene'].tweens.add({targets:this, delay:delay, alpha:0, duration: 150});
    if (this.attr['tile']['mc']) game_data['scene'].tweens.add({targets:this.attr['tile']['mc'], delay:delay, alpha:0, duration: 150});
    if (this.attr['lock']['mc']) game_data['scene'].tweens.add({targets:this.attr['lock']['mc'], delay:delay, alpha:0, duration: 150});
    if (this.is_blocked()) game_data['scene'].tweens.add({targets:this.attr['block']['mc'], delay:delay, alpha:0, duration: 150});
    if (this.has_gem()) game_data['scene'].tweens.add({targets:this.attr['gem']['mc'], delay:delay, alpha:0, duration: 150});
},

init_tile(tile_type) {
    var tile_id = (tile_type == '-' ? 0 : parseInt(tile_type));
    this.attr['tile']['id'] = tile_id;
    this.attr['tile']['strength'] = tile_id;
},

update_tile(is_smooth) {
    var tile_strength = this.attr['tile']['strength'];
    var mc = null;
    if (tile_strength > 0) {		    	
        switch (tile_strength) {
            case 1:
                mc = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", "tile1");
                break
            case 2:
                mc = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", "tile2");
                break;
        }
        mc.setOrigin(0.5, 0.5);        
        var pt = game_data['utils'].toLocal(this.locks_holder, this.get_center_pt());
        mc.x = pt.x;
        mc.y = pt.y;
        this.tiles_holder.add(mc);
        
        if (is_smooth) {
            mc.alpha = 0;
            game_data['scene'].tweens.add({targets: mc, alpha: 1, x: 500, duration: 750});
        }
    }	
    if (this.attr['tile']['mc'] && this.attr['tile']['mc'].tween) this.attr['tile']['mc'].tween.stop();
    this.attr['tile']['mc'] = mc;
},

init_lock(_lock_type) {
    
    var lock_id = (_lock_type == '-') ? 0 : parseInt(_lock_type);

    this.attr['lock']['id'] = lock_id;
    this.attr['lock']['strength'] = 1;
    this.attr['lock']['neighbour_explosive'] = true;		
    	
},			
        
update_lock(is_smooth) {
    var mc = null;
    
    if (this.is_locked()) {
        //mc = new Lock();						
        mc = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", "lock");
        mc.setOrigin(0.5, 0.5);
        var pt = game_data['utils'].toLocal(this.locks_holder, this.get_center_pt());
        mc.x = pt.x;
        mc.y = pt.y;				
        this.locks_holder.add(mc);
        // this.set_freezed(true);
        // console.log(this.get_gem())
        // if (this.has_gem()) this.emitter.emit("EVENT", {'event': 'REMOVE_GEM', 'pos_x': this.pos_x, 'pos_y': this.pos_y});   
        // this.update_gem_visibility();
        
    } else {
        // this.set_freezed(false);
        this.emitter.emit("EVENT", {'event': 'UPDATE_EMPTY_FIELD_ITEMS', 'item': this}); 
    }				
    this.attr['lock']['mc'] = mc;        
},

init_block(block_type) {    
    if (block_type.slice(0, 1) == 'A') {
        this.attr['block']['id'] = 'A'; // BOX
        this.attr['block']['strength'] = parseInt(block_type.slice(1));				
        this.attr['block']['hammer_applicable'] = true;
        this.attr['block']['broom_applicable'] = false;
        this.attr['block']['extrusive'] = false;
        this.attr['block']['reproductive'] = false;
        this.attr['block']['neighbour_explosive'] = true;
        this.attr['block']['trapped'] = true;
        this.attr['block']['hide_gem'] = true;
    }			
    else if (block_type.slice(0, 1) == 'B') {
        this.attr['block']['id'] = 'B'; // SPIDER NET
        this.attr['block']['strength'] = parseInt(block_type.slice(1));
        this.attr['block']['hammer_applicable'] = false;
        this.attr['block']['broom_applicable'] = true;
        this.attr['block']['extrusive'] = false;
        this.attr['block']['reproductive'] = false;
        this.attr['block']['neighbour_explosive'] = false;				
        this.attr['block']['trapped'] = false;
        this.attr['block']['hide_gem'] = false;
    }			
    else if (block_type.slice(0, 1) == 'C') {
        this.attr['block']['id'] = 'C'; // STONE CREST
        this.attr['block']['strength'] = parseInt(block_type.slice(1));
        this.attr['block']['hammer_applicable'] = true;
        this.attr['block']['broom_applicable'] = false;
        this.attr['block']['extrusive'] = true;
        this.attr['block']['reproductive'] = false;
        this.attr['block']['neighbour_explosive'] = true;
        this.attr['block']['trapped'] = false;
        // this.attr['block']['hide_gem'] = true;
        this.attr['block']['hide_gem'] = false;
    }			
    else if (block_type.slice(0, 1) == 'D') {
        this.attr['block']['id'] = 'D'; // SPIDER 1
        this.attr['block']['strength'] = 1;
        this.attr['block']['hammer_applicable'] = false;
        this.attr['block']['broom_applicable'] = true;
        this.attr['block']['extrusive'] = true;
        this.attr['block']['reproductive'] = true;
        this.attr['block']['neighbour_explosive'] = true;
        this.attr['block']['trapped'] = true;
        // this.attr['block']['trapped'] = false;
        this.attr['block']['hide_gem'] = true;
    }			
    else if (block_type.slice(0, 1) == 'E') {
        this.attr['block']['id'] = 'E'; // SPIDER 2
        this.attr['block']['strength'] = 2;
        this.attr['block']['hammer_applicable'] = false;
        this.attr['block']['broom_applicable'] = true;
        // this.attr['block']['extrusive'] = true;
        this.attr['block']['extrusive'] = false;
        this.attr['block']['reproductive'] = true;
        this.attr['block']['neighbour_explosive'] = true;
        this.attr['block']['trapped'] = true;
        // this.attr['block']['hide_gem'] = true;
        this.attr['block']['hide_gem'] = true;
    }						
    else if (block_type.slice(0, 1) == 'F') {
        this.attr['block']['id'] = 'F'; // GHOST
        this.attr['block']['strength'] = 1;
        this.attr['block']['hammer_applicable'] = false;
        this.attr['block']['broom_applicable'] = true;
        this.attr['block']['extrusive'] = false;
        this.attr['block']['reproductive'] = true;
        this.attr['block']['neighbour_explosive'] = true;				
        this.attr['block']['trapped'] = true;
        this.attr['block']['hide_gem'] = true;
    }
    else {
        
    }    
    if (this.attr['block']['broom_applicable']) game_data['is_broom_applicable_level'] = true;
},


update_block(is_smooth) {    
    
    if (this.is_blocked() && this.scene) {
        var mc = null;
        if (this.attr['block']['id'] == 'A') {
            switch (this.attr['block']['strength']) {
                case 1:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "box1");
                    break;
                case 2:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "box2");
                    break;
            }
            
        }
        
        if (this.attr['block']['id'] == 'B') {
            switch (this.attr['block']['strength']) {
                case 1:
                    //mc = new SpiderNet1();
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "spider_net1");
                    break;
            }
        }															
    
        if (this.attr['block']['id'] == 'C') {
            switch (this.attr['block']['strength']) {
                case 1:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "crest1");
                    break;
                case 2:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "crest2");
                    break;
                case 3:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "crest3");
                    break;							
            }
        }					
        
        if (this.attr['block']['id'] == 'D') {
            mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "spider1");
        }
        
        if (this.attr['block']['id'] == 'E') {
            switch (this.attr['block']['strength']) {
                case 1:
                    this.init_block('B1');
                    this.update_block(false);
                    return;
                    break;
                case 2:
                    mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "spider2");
                    break;
    
            }					
        }			
        
        if (this.attr['block']['id'] == 'F') {            
            mc = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "ghost");
        }				
        
        if (mc) {
            var pt = game_data['utils'].toLocal(this.blocks_holder, this.get_center_pt());
            mc.x = pt.x;
            mc.y = pt.y;	
            mc.setOrigin(0.5, 0.5);				
            this.blocks_holder.add(mc);
            
            if (is_smooth) {
                mc.alpha = 0;                
                this.scene.tweens.add({targets: mc, alpha: 1, duration: 750});
            }								
        }
        this.attr['block']['mc'] = mc;
    } 
    else {
        this.attr['block']['broom_applicable'] = false;
        this.attr['block']['hammer_applicable'] = false;					
    }
    this.update_gem_visibility();
    
},

hide_block() {
    if (this.is_blocked())
        this.attr['block']['mc'].visible = false;
},

show_block() {
    if (this.is_blocked())
        this.attr['block']['mc'].visible = true;
},

update_gem_visibility() { 
    if (this.has_gem()) {
        
        if ((this.is_blocked() && this.attr['block']['hide_gem'])) {
            
            this.attr['gem']['mc'].hide_gem();
        }
        else {
            this.attr['gem']['mc'].show_gem();
        }
    }
},

infect(field_item) {       
    this.init_block(field_item.get_block_id());
    this.update_block(true);

    // debugger
    if (this.attr['block']['extrusive']) {
        this.emitter.emit("EVENT", {'event': 'REMOVE_GEM', 'pos_x': this.pos_x, 'pos_y': this.pos_y}); 
        this.attr['gem']['mc'] = null;
    }
        
    if (field_item.get_block_id() == 'F') game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'reproduct_ghost'});
    else game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'reproduct'});
},	
        
add_gem(gem, change_vertical = false) {    
   
    this.attr['gem']['exist'] = true;		
    this.attr['gem']['mc'] = gem;
    gem.update_pos({'pos_x': this.pos_x, 'pos_y': this.pos_y}, game_data['utils'].toLocal(this.gems_holder, this.get_center_pt()), change_vertical);
    
},

remove_gem() {
    
    var gem = this.attr['gem']['mc'];
    this.attr['gem']['exist'] = false;			
    return gem;
    
},

check_obstacle_remove() {
    
    if (this.is_blocked()) {
        this.explode_block();
        return true;
    }
    if (this.is_locked()) {		
        this.remove_lock();
        return true;
    }			
    else {					
        return false
    }
},
                                
fall() {
    if (this.has_gem())
        this.attr['gem']['mc'].fall();  
},

get_gem_id() {   
    if (this.has_gem())
        return this.attr['gem']['mc'].get_id();
    else
        return -1;
},

get_gem_type() {   
    if (this.has_gem())
        return this.attr['gem']['mc'].get_type();
    else
        return -1;
},


get_gem() {
    
    return (this.has_gem()) ? this.attr['gem']['mc'] : null;

},

get_key() {
    
    return (this.has_gem()) ? this.attr['gem']['mc'].get_key() : null;

},
                
get_tile_strength() {
    return this.attr['tile']['strength'];
},

get_gem_pt() {
    return (this.has_gem()) ? new Phaser.Geom.Point(this.attr['gem']['mc'].x, this.attr['gem']['mc'].y) : this.get_target_gem_pt();
},				

is_empty() {    
    return !this.has_gem();
},

is_trapped() {			
    return (this.is_blocked() && 'trapped' in this.attr['block'] && this.attr['block']['trapped']);
},

is_tiled(with_box = false) {   
    var result = ('strength' in this.attr['tile'] && this.attr['tile']['strength'] > 0);
    if (result && with_box) {
        result = !this.is_blocked();
    }
    return result;    
},		

is_gold(with_box = false) {
    var result = ('strength' in this.attr['tile'] && this.attr['tile']['strength'] > 1);
    if (result && with_box) {
        result = !this.is_blocked();
    }
    return result;
},

is_silver(with_box = false) {
    var result = ('strength' in this.attr['tile'] && this.attr['tile']['strength'] == 1);
    if (result && with_box) {
        result = !this.is_blocked();
    }
    return result;
},

is_dynamical() {
    return (!this.is_extrusive() && (this.has_gem() && this.attr['gem']['mc'].is_dynamical()));
},

is_normal() {
    return (this.has_gem() && this.attr['gem']['mc'].is_normal());
},

is_mark() {
    return (this.has_gem() && this.attr['gem']['mc'].is_mark());
},	

is_bottom() {
    return (this.has_gem() && this.attr['gem']['mc'].is_bottom());
},

is_fireball() {
    return (this.has_gem() && this.attr['gem']['mc'].is_fireball());
},

is_removable() {
    return (this.has_gem() && this.attr['gem']['mc'].is_removable());
},

is_bonus() {
    return (this.has_gem() && this.attr['gem']['mc'].is_bonus());
},	


explode_neighbour_block()  {
    if (this.is_blocked() && this.attr['block']['neighbour_explosive']) {
        this.explode_block();				
    }
    else if (this.is_locked()) {   
        this.remove_lock();							
    }
},


freeze(timeout, on_complete) {  
    var _this = this;
    if (on_complete == null)
        on_complete = this.dummy_function;
    if (!this.is_freezed()) {
        this.set_freezed(true);
        if ( this.freeze_timeout_id)
            this.freeze_timeout_id.destroy();
        if (timeout > 0) {
            this.freeze_timeout_id = game_data['utils'].delayed_call(timeout, function(){
                _this.set_freezed(false); 
                on_complete();
            });
        }
    }
},

unfreeze() {
    this.set_freezed(false);
    if (this.freeze_timeout_id)
        this.freeze_timeout_id.destroy();
},

remove_tile() {
    var key = 'tile' + this.attr['tile']['strength'];    
    var is_golden = this.attr['tile']['strength'] > 1;
    var is_silver = this.attr['tile']['strength'] === 1;
    this.attr['tile']['strength']--;
    if (this.attr['tile']['mc'] && this.attr['tile']['mc'].tween) this.attr['tile']['mc'].tween.stop();
    if (is_golden) this.attr['tile']['mc'].destroy();	
    // this.attr['tile']['mc'].destroy();	

    this.show_removing_tile(function(){},(is_golden && is_silver));
    var tile = this.attr['tile']['mc'];
    var pt = this.get_center_pt();
    this.update_tile();
    if (this.attr['tile']['strength'] == 0) {
        this.emitter.emit("EVENT", {'event': 'TILE_DESTROYED', 'pt': pt, 'tile': tile});    
    }
    if (is_golden) {
        this.emitter.emit("EVENT", {'event': 'GOLDEN_REMOVE', 'pt': pt}); 
    }
    
    //this.emitter.emit("EVENT", {'event': 'CREATE_PIECES', 'pt': this.get_center_pt(), 'key': key, 'w': game_data['dim']['item_width'], 'h': game_data['dim']['item_height']});    
    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tile_destroyed'});
},

remove_lock() {
    this.show_removing_lock(function(){});
    this.attr['lock']['strength']--;
    this.attr['lock']['mc'].destroy();
    this.update_lock();
    this.emitter.emit("EVENT", {'event': 'LOCK_DESTROYED', 'lock_id': this.attr['lock']['id']});    
        
},

explode_block() {
    var _this = this;
    var block_id = this.attr['block']['id'];
    this.attr['block']['strength']--;
    this.attr['block']['mc'].destroy();			
    
    this.show_removing_block(function(){
        if ((!_this.is_blocked()) && (_this.has_gem() || !_this.has_gem())) {
            if (_this.attr['gem']['mc']) {
                _this.attr['gem']['mc'].update_candidate();	
            } else if (!_this.is_locked()) {
                _this.emitter.emit("EVENT", {'event': 'UPDATE_EMPTY_FIELD_ITEMS', 'item': _this});
            }
            
        }
        else if (_this.is_empty() && !_this.is_locked() && !_this.is_blocked()) {
            _this.emitter.emit("EVENT", {'event': 'UPDATE_EMPTY_FIELD_ITEMS', 'item': _this}); 
        }
        else if (_this.is_blocked() && _this.has_gem() && !_this.is_trapped()) {
            if (_this.attr['gem']['mc'])
                _this.attr['gem']['mc'].update_candidate();	
        }
        

        _this.emitter.emit("EVENT", {'event': 'ALLOW_UPDATE_ITEMS', 'item': _this}); 
    });
    this.update_block();
    this.emitter.emit("EVENT", {'event': 'BLOCK_DESTROYED', 'block_id': block_id});            
},

get_center_pt() {
    
    return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 0));
    
},

check_hit(pt) {
    
    var center_pt = this.get_center_pt();
    if (Math.abs(pt.x - center_pt.x) < game_data['dim']['item_width'] / 2 && 
        Math.abs(pt.y - center_pt.y) < game_data['dim']['item_height'] / 2)
        return true;
    else
        return false;
        
},

add_shake() {
    
    if (this.is_blocked()) {
        this.attr['shaking'] = true;
        this.timer_shake.paused = false;
    }
    else if (this.has_gem() && !this.is_dynamical()) {
        this.attr['gem']['mc'].add_shake();
        this.attr['shaking'] = true;
    }
    
},

/*
add_block_shake() {
    if (this.is_blocked()) {
        this.attr['shaking'] = true;
        this.timer_shake.paused = false;
    }
},
*/

remove_shake() {
    
    if (this.has_gem())
        this.attr['gem']['mc'].remove_shake();	
    if (this.is_blocked()) {
        this.attr['block']['mc'].angle = 0;

        this.attr['shaking'] = false;
        this.timer_shake.paused = true;
    }

    if (this.is_shakeable_block()) {
        if (this.attr['shaking']) {
            this.timer_shake.paused = true;
            this.attr['false'] = true;
            //timer_shake.stop();
            //attr['block']['mc'].rotation = 0;
            //TweenMax.to(attr['block']['mc'], 0.3, {'scaleX': 1, 'scaleY': 1});
            //attr['shaking'] = false;
        }
    }
},

handler_shake(params) {
    if (this.is_blocked()) {        
        this.shake_ind = (this.shake_ind + 1) % this.shake_arr.length;
        var alpha = this.shake_arr[this.shake_ind];	        
        this.attr['block']['mc'].angle = alpha;
    }
           
},

get_target_gem_pt() {
    return game_data['utils'].toLocal(this.gems_holder, this.get_center_pt());
},

get_pos() {
    return {'pos_x': this.pos_x, 'pos_y': this.pos_y};
},

get_block() {
    return this.attr['block']['mc'];
},

get_lock() {
    return this.attr['lock']['mc'];
},

get_tile() {
    return this.attr['tile']['mc'];
},



show_removing_lock(on_complete) {

    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var lock = new Phaser.GameObjects.Image(game_data['scene'], pt.x, pt.y, "common1", 'lock');    
    this.moving_holder.add(lock);
    game_data['scene'].tweens.add({targets: lock, scaleX: 2, scaleY: 2, alpha: 0, duration: 500, onComplete: function () {
        lock.destroy();
        on_complete();
    }});
	
   
},

show_removing_tile(on_complete, is_golden = false) {
    if (this.scene && this.moving_holder && is_golden) {
        var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());
        var key;
        if (this.attr['tile']['strength'] == 1)
            key = "tile2";
        else
            key = "tile1";


        var part1 = new Phaser.GameObjects.Image(this.scene, pt.x - 13, pt.y - 21, "common1", key + '_1');    
        this.moving_holder.add(part1);		

        var part2 = new Phaser.GameObjects.Image(this.scene, pt.x - 21, pt.y + 17, "common1", key + '_2');    
        this.moving_holder.add(part2);		

        var part3 = new Phaser.GameObjects.Image(this.scene, pt.x + 15, pt.y + 21, "common1", key + '_3');    
        this.moving_holder.add(part3);		

        var part4 = new Phaser.GameObjects.Image(this.scene, pt.x + 23, pt.y - 1, "common1", key + '_4');    
        this.moving_holder.add(part4);				

        this.scene.tweens.add({targets: part1, x: pt.x - 95, y: pt.y - 6, angle: -60, 'alpha': 1, duration: 200, onComplete: function () {part1.destroy();}});  
        this.scene.tweens.add({targets: part2, x: pt.x - 55, y: pt.y + 47, angle: -30, 'alpha': 1, duration: 360, onComplete: function () {part2.destroy();on_complete();}});  
        this.scene.tweens.add({targets: part3, x: pt.x + 61, y: pt.y + 31, angle: 45, 'alpha': 1, duration: 300, onComplete: function () {part3.destroy();}});  
        this.scene.tweens.add({targets: part4, x: pt.x + 89, y: pt.y - 18, angle: 45, 'alpha': 1, duration: 220, onComplete: function () {part4.destroy();}});    

    }
    else if (!is_golden) {

    }
},



show_removing_block(on_complete) {
    if (this.scene && this.moving_holder) {
        var block_id = this.attr['block']['id'];
        var block_strength = this.attr['block']['strength'];			
        var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());
        var block_destroy;    
        
        if (block_id == 'A') {			// BOX	
            if (block_strength == 0)
                this.show_removing_box1(on_complete);            
            else if (block_strength == 1)
                this.show_removing_box2(on_complete);            
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'box_destroyed'});
        }
        else if (block_id == 'B') {     // NET
            if (block_strength == 0)
                this.show_removing_spider_net(on_complete);         
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'net_destroyed'});  
        }
        else if (block_id == 'C') {		// Crest
            if (block_strength == 0)
                this.show_removing_ice1(on_complete);            
            else if (block_strength == 1)
                this.show_removing_ice2(on_complete);            		
            else if (block_strength == 2)
                this.show_removing_ice3(on_complete);          
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'crest_destroyed'});  
        }
        else if (block_id == 'D') {			
            this.show_removing_spider1(on_complete);        
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'spider_destroyed'});
        }
        else if (block_id == 'E') {				
            this.show_removing_spider2(on_complete);        
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'spider_destroyed'});     
        }
        else if (block_id == 'F') {				
            this.show_removing_ghost(on_complete);     
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'ghost_destroyed'});   
        }	
    }		
},

show_removing_box1(on_complete){    
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x - 20, pt.y - 21, "common1", 'box1_1');    
    this.moving_holder.add(part1);		

    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x + 18, pt.y - 21, "common1", 'box1_2');    
    this.moving_holder.add(part2);		

    var part3 = new Phaser.GameObjects.Image(this.scene, pt.x - 16, pt.y + 19, "common1", 'box1_3');    
    this.moving_holder.add(part3);		

    var part4 = new Phaser.GameObjects.Image(this.scene, pt.x + 23, pt.y + 20, "common1", 'box1_4');    
    this.moving_holder.add(part4);		

    var part5 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'box1_5');    
    this.moving_holder.add(part5);		

    this.scene.tweens.add({targets: part1, x: pt.x - 101, y: pt.y - 12, angle: -60, 'alpha': 0.4, duration: 220, onComplete: function () {part1.destroy();}});  
    this.scene.tweens.add({targets: part2, x: pt.x + 88, y: pt.y - 44, angle: 45, 'alpha': 0.4, duration: 200, onComplete: function () {part2.destroy();}});  
    this.scene.tweens.add({targets: part3, x: pt.x - 65, y: pt.y + 42, angle: -30, 'alpha': 0.4, duration: 300, onComplete: function () {part3.destroy();}});  
    this.scene.tweens.add({targets: part4, x: pt.x + 67, y: pt.y + 36, angle: 45, 'alpha': 0.4, duration: 360, onComplete: function () {part4.destroy();on_complete();}});  
    this.scene.tweens.add({targets: part5, x: pt.x - 170, y: pt.y + 24, angle: -90, 'alpha': 0.4, duration: 220, onComplete: function () {part5.destroy();}});  
},

show_removing_box2(on_complete){
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());
	

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'box1_5');        
    this.moving_holder.add(part1);

    this.scene.tweens.add({targets: part1, x: pt.x + 167, y: pt.y - 24, angle: 90, 'alpha': 0.4, duration: 360, onComplete: function () { 
        part1.destroy();
        on_complete();}            
    });    

},

show_removing_ice1(on_complete){
    game_data['error_history'].push('gpfi1'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var part0 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1');    
    this.moving_holder.add(part0);
    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x - 14, pt.y - 18, "common1", 'crest1_1');    
    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x -13, pt.y - 2, "common1", 'crest1_2');    
    var part3 = new Phaser.GameObjects.Image(this.scene, pt.x - 11, pt.y + 24, "common1", 'crest1_3');    
    var part4 = new Phaser.GameObjects.Image(this.scene, pt.x - 4, pt.y + 23, "common1", 'crest1_4');    
    var part5 = new Phaser.GameObjects.Image(this.scene, pt.x + 20, pt.y + 24, "common1", 'crest1_5');    
    var part6 = new Phaser.GameObjects.Image(this.scene, pt.x + 32, pt.y + 21, "common1", 'crest1_6');    
    var part7 = new Phaser.GameObjects.Image(this.scene, pt.x + 26, pt.y - 7, "common1", 'crest1_7');    
    var part8 = new Phaser.GameObjects.Image(this.scene, pt.x + 21, pt.y - 20, "common1", 'crest1_8');    
    var part9 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_9');    
    part9.setScale(0.18);
    var part10 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part11 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part12 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part13 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part14 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part15 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    


    this.hide_block();
      
    game_data['scene'].tweens.add({targets: part0, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
        game_data['scene'].tweens.add({targets: part0, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
            game_data['scene'].tweens.add({targets: part0, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                game_data['scene'].tweens.add({targets: part0, x: pt.x, y: pt.y + 2, duration: 20, onComplete: function () {
                    game_data['scene'].tweens.add({targets: part0, x: pt.x + 3, y: pt.y, duration: 20, onComplete: function () {
                        game_data['scene'].tweens.add({targets: part0, x: pt.x, y: pt.y, duration: 20, onComplete: function () {
                            game_data['scene'].tweens.add({targets: part0, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
                                game_data['scene'].tweens.add({targets: part0, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                                    game_data['scene'].tweens.add({targets: part0, x: pt.x, y: pt.y + 3, duration: 20, onComplete: function () {
                                        part0.destroy();
                                        if (_this && _this.scene &&  _this.moving_holder) {
                                            _this.moving_holder.add(part1);
                                            _this.moving_holder.add(part2);
                                            _this.moving_holder.add(part3);
                                            _this.moving_holder.add(part4);
                                            _this.moving_holder.add(part5);
                                            _this.moving_holder.add(part6);
                                            _this.moving_holder.add(part7);
                                            _this.moving_holder.add(part8);
                                            _this.moving_holder.add(part9);
                                            _this.moving_holder.add(part10);
                                            _this.moving_holder.add(part11);
                                            _this.moving_holder.add(part12);
                                            _this.moving_holder.add(part13);
                                            _this.moving_holder.add(part14);
                                            _this.moving_holder.add(part15);



                                            _this.show_block();
                                            game_data['scene'].tweens.add({targets: part1, x: pt.x - 20, y: pt.y - 50, duration: 180, onComplete: function () {part1.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part2, x: pt.x - 45, y: pt.y, duration: 220, onComplete: function () {part2.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part3, x: pt.x - 44, y: pt.y + 32, duration: 180, onComplete: function () {part3.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part4, x: pt.x - 26, y: pt.y + 46, duration: 80, onComplete: function () {part4.destroy();}}); 

                                            game_data['scene'].tweens.add({targets: part5, x: pt.x - 6, y: pt.y + 52, duration: 80, onComplete: function () {part5.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part6, x: pt.x + 43, y: pt.y + 39, duration: 140, onComplete: function () {part6.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part7, x: pt.x + 57, y: pt.y - 5, duration: 200, onComplete: function () {part7.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part8, x: pt.x + 39, y: pt.y - 54, duration: 140, onComplete: function () {part8.destroy();}}); 

                                            // part 9

                                            game_data['scene'].tweens.add({targets: part9, scaleX: 0.73, scaleY: 0.73, duration: 200, onComplete: function () {
                                                game_data['scene'].tweens.add({targets: part9, scaleX: 1.3, scaleY: 1.3, alpha: 0, duration: 160, onComplete: function () {
                                                    part9.destroy();                                        
                                                }});                                             
                                            }}); 


                                            game_data['scene'].tweens.add({targets: part10, x: pt.x, y: pt.y + 60, angle: 0, duration: 120, delay: /*220*/0, onComplete: function () {part10.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part11, x: pt.x - 50, y: pt.y + 50, angle: 45, duration: 120, delay: /*140*/0, onComplete: function () {part11.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part12, x: pt.x - 70, y: pt.y - 20, angle: 105, duration: 120, delay: /*240*/0, onComplete: function () {part12.destroy();on_complete()}}); 
                                            game_data['scene'].tweens.add({targets: part13, x: pt.x + 20, y: pt.y - 80, angle: -165, duration: 120, delay: /*200*/0, onComplete: function () {part13.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part14, x: pt.x + 80, y: pt.y - 40, angle: -120, duration: 120, delay: /*100*/0, onComplete: function () {part14.destroy();}}); 
                                            game_data['scene'].tweens.add({targets: part15, x: pt.x + 65, y: pt.y + 15, angle: -75, duration: 120, delay: /*180*/0, onComplete: function () {part15.destroy();}}); 
                                        }
                                    }});                      
                                }});           
                            }});                                         
                        }});                              
                    }});                          
                }});                      
            }});           
        }});  
    }});  

},

show_removing_ice2(on_complete){
    game_data['error_history'].push('gpfi2');
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var ice1 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1');    
    var ice2 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest2');    

    this.moving_holder.add(ice2);
  
    var part9 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_9');    
    part9.setScale(0.18);
    var part10 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part11 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part12 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part13 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part14 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part15 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    


    this.hide_block();
    game_data['scene'].tweens.add({targets: ice2, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
        game_data['scene'].tweens.add({targets: ice2, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
            game_data['scene'].tweens.add({targets: ice2, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                game_data['scene'].tweens.add({targets: ice2, x: pt.x, y: pt.y + 2, duration: 20, onComplete: function () {
                    game_data['scene'].tweens.add({targets: ice2, x: pt.x + 3, y: pt.y, duration: 20, onComplete: function () {
                        game_data['scene'].tweens.add({targets: ice2, x: pt.x, y: pt.y, duration: 20, onComplete: function () {
                            game_data['scene'].tweens.add({targets: ice2, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
                                game_data['scene'].tweens.add({targets: ice2, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                                    game_data['scene'].tweens.add({targets: ice2, x: pt.x, y: pt.y + 3, duration: 20, onComplete: function () {
                                        ice2.destroy();
                                        if (_this && _this.scene && _this.moving_holder) {
                                            _this.moving_holder.add(ice1);
                                            _this.moving_holder.add(part9);
                                            _this.moving_holder.add(part10);
                                            _this.moving_holder.add(part11);
                                            _this.moving_holder.add(part12);
                                            _this.moving_holder.add(part13);
                                            _this.moving_holder.add(part14);
                                            _this.moving_holder.add(part15);
                                        
                                            _this.show_block();

                                            // part 9
                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part9, scaleX: 0.73, scaleY: 0.73, duration: 200, onComplete: function () {
                                                if (_this.scene)
                                                _this.scene.tweens.add({targets: part9, scaleX: 1.3, scaleY: 1.3, alpha: 0, duration: 160, onComplete: function () {
                                                    part9.destroy();                                        
                                                }});                                             
                                            }}); 


                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part10, x: pt.x, y: pt.y + 60, angle: 0, duration: 120, delay: /*220*/0, onComplete: function () {part10.destroy();}}); 
                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part11, x: pt.x - 50, y: pt.y + 50, angle: 45, duration: 120, delay: /*140*/0, onComplete: function () {part11.destroy();}});
                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part12, x: pt.x - 70, y: pt.y - 20, angle: 105, duration: 120, delay: /*240*/0, onComplete: function () {part12.destroy();ice1.destroy();on_complete()}});
                                            if (_this.scene) 
                                            _this.scene.tweens.add({targets: part13, x: pt.x + 20, y: pt.y - 80, angle: -165, duration: 120, delay: /*200*/0, onComplete: function () {part13.destroy();}});
                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part14, x: pt.x + 80, y: pt.y - 40, angle: -120, duration: 120, delay: /*100*/0, onComplete: function () {part14.destroy();}});
                                            if (_this.scene)
                                            _this.scene.tweens.add({targets: part15, x: pt.x + 65, y: pt.y + 15, angle: -75, duration: 120, delay: /*180*/0, onComplete: function () {part15.destroy();}}); 
                                        }
                                    }});                      
                                }});           
                            }});                                         
                        }});                              
                    }});                          
                }});                      
            }});           
        }});  
    }});  
},

show_removing_ice3(on_complete){
    game_data['error_history'].push('gpfi3'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var ice2 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1');    
    var ice3 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest2');    

    this.moving_holder.add(ice3);
  
    var part9 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_9');    
    part9.setScale(0.18);
    var part10 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part11 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part12 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part13 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part14 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    var part15 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'crest1_10');    
    


    this.hide_block();

    game_data['scene'].tweens.add({targets: ice3, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
        game_data['scene'].tweens.add({targets: ice3, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
            game_data['scene'].tweens.add({targets: ice3, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                game_data['scene'].tweens.add({targets: ice3, x: pt.x, y: pt.y + 2, duration: 20, onComplete: function () {
                    game_data['scene'].tweens.add({targets: ice3, x: pt.x + 3, y: pt.y, duration: 20, onComplete: function () {
                        game_data['scene'].tweens.add({targets: ice3, x: pt.x, y: pt.y, duration: 20, onComplete: function () {
                            game_data['scene'].tweens.add({targets: ice3, x: pt.x, y: pt.y - 3, duration: 20, onComplete: function () {
                                game_data['scene'].tweens.add({targets: ice3, x: pt.x - 3, y: pt.y, duration: 20, onComplete: function () {
                                    game_data['scene'].tweens.add({targets: ice3, x: pt.x, y: pt.y + 3, duration: 20, onComplete: function () {
                                        if (_this && _this.scene && _this.moving_holder) {
                                            ice3.destroy();
                                       
                                            _this.moving_holder.add(ice2);
                                            _this.moving_holder.add(part9);
                                            _this.moving_holder.add(part10);
                                            _this.moving_holder.add(part11);
                                            _this.moving_holder.add(part12);
                                            _this.moving_holder.add(part13);
                                            _this.moving_holder.add(part14);
                                            _this.moving_holder.add(part15);
                                        
                                            _this.show_block();

                                            // part 9

                                            game_data['scene'].tweens.add({targets: part9, scaleX: 0.73, scaleY: 0.73, duration: 200, onComplete: function () {
                                                game_data['scene'].tweens.add({targets: part9, scaleX: 1.3, scaleY: 1.3, alpha: 0, duration: 160, onComplete: function () {
                                                    part9.destroy();                                        
                                                }});                                             
                                            }}); 


                                            _this.scene.tweens.add({targets: part10, x: pt.x, y: pt.y + 60, angle: 0, duration: 120, delay: /*220*/0, onComplete: function () {part10.destroy();}}); 
                                            _this.scene.tweens.add({targets: part11, x: pt.x - 50, y: pt.y + 50, angle: 45, duration: 120, delay: /*140*/0, onComplete: function () {part11.destroy();}}); 
                                            _this.scene.tweens.add({targets: part12, x: pt.x - 70, y: pt.y - 20, angle: 105, duration: 120, delay: /*240*/0, onComplete: function () {part12.destroy();ice2.destroy();on_complete()}}); 
                                            _this.scene.tweens.add({targets: part13, x: pt.x + 20, y: pt.y - 80, angle: -165, duration: 120, delay: /*200*/0, onComplete: function () {part13.destroy();}}); 
                                            _this.scene.tweens.add({targets: part14, x: pt.x + 80, y: pt.y - 40, angle: -120, duration: 120, delay: /*100*/0, onComplete: function () {part14.destroy();}}); 
                                            _this.scene.tweens.add({targets: part15, x: pt.x + 65, y: pt.y + 15, angle: -75, duration: 120, delay: /*180*/0, onComplete: function () {part15.destroy();}}); 
                                        }
                                    }});                      
                                }});           
                            }});                                         
                        }});                              
                    }});                          
                }});                      
            }});           
        }});  
    }});  
},

show_removing_spider_net(on_complete){
    game_data['error_history'].push('gpfi4'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var part0 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'spider_net1');    
    this.moving_holder.add(part0);

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x + 16, pt.y - 20, "common1", 'spider_net1_1');    
    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x + 22, pt.y + 14, "common1", 'spider_net1_2');    
    var part3 = new Phaser.GameObjects.Image(this.scene, pt.x - 19, pt.y - 20, "common1", 'spider_net1_3');    
    var part4 = new Phaser.GameObjects.Image(this.scene, pt.x + 3, pt.y + 22, "common1", 'spider_net1_4');    
    var part5 = new Phaser.GameObjects.Image(this.scene, pt.x - 17, pt.y + 9, "common1", 'spider_net1_5');    

    game_data['scene'].tweens.add({targets: part0, scaleX: 1.17, scaleY: 1.17, duration: 120, onComplete: function () {
        game_data['scene'].tweens.add({targets: part0, scaleX: 0.8, scaleY: 0.8, duration: 60, onComplete: function () {
            game_data['scene'].tweens.add({targets: part0, scaleX: 1, scaleY: 1, duration: 60, onComplete: function () {
                if (_this && _this.scene && _this.moving_holder) {
                    part0.destroy();
                    _this.moving_holder.add(part1);
                    _this.moving_holder.add(part2);
                    _this.moving_holder.add(part3);
                    _this.moving_holder.add(part4);
                    _this.moving_holder.add(part5);

                    _this.scene.tweens.add({targets: part1, x: pt.x + 40, y: pt.y, angle: 60, duration: 200, onComplete: function () {part1.destroy();}}); 
                    _this.scene.tweens.add({targets: part2, x: pt.x + 40, y: pt.y + 40, angle: 45, duration: 160, onComplete: function () {part2.destroy();}}); 
                    _this.scene.tweens.add({targets: part3, x: pt.x - 66, y: pt.y, angle: -60, duration: 240, onComplete: function () {part3.destroy();on_complete();}}); 
                    _this.scene.tweens.add({targets: part4, x: pt.x - 4, y: pt.y + 60, angle: -15, duration: 160, onComplete: function () {part4.destroy();}}); 
                    _this.scene.tweens.add({targets: part5, x: pt.x - 47, y: pt.y + 35, angle: -30, duration: 220, onComplete: function () {part5.destroy();}}); 
                }
            }});           
        }});  
    }});  
},


show_removing_spider1(on_complete){
    game_data['error_history'].push('gpfi5'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());


    var spider1_part = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'spider1_part');    
    this.moving_holder.add(spider1_part);

    game_data['scene'].tweens.add({targets: spider1_part, x: pt.x - 3, y: pt.y, duration: 80, onComplete: function () {
        game_data['scene'].tweens.add({targets: spider1_part, x: pt.x, y: pt.y + 3, duration: 60, onComplete: function () {
            game_data['scene'].tweens.add({targets: spider1_part, x: pt.x + 3, y: pt.y, duration: 60, onComplete: function () {
                game_data['scene'].tweens.add({targets: spider1_part, x: pt.x, y: pt.y, duration: 60, onComplete: function () {
                    game_data['scene'].tweens.add({targets: spider1_part, x: pt.x, y: pt.y + 83, angle: 75, duration: 200, onComplete: function () {
                        game_data['scene'].tweens.add({targets: spider1_part, x: pt.x, y: pt.y + 143, angle: 105, alpha: 0, duration: 80, onComplete: function () {
                            spider1_part.destroy();
                            on_complete();

                        }});                              
                    }});                          
                }});                      
            }});           
        }});  
    }});  



    var part0 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'spider_net1');    
    this.moving_holder.add(part0);

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x + 16, pt.y - 20, "common1", 'spider_net1_1');    
    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x + 22, pt.y + 14, "common1", 'spider_net1_2');    
    var part3 = new Phaser.GameObjects.Image(this.scene, pt.x - 19, pt.y - 20, "common1", 'spider_net1_3');    
    var part4 = new Phaser.GameObjects.Image(this.scene, pt.x + 3, pt.y + 22, "common1", 'spider_net1_4');    
    var part5 = new Phaser.GameObjects.Image(this.scene, pt.x - 17, pt.y + 9, "common1", 'spider_net1_5');    

    game_data['scene'].tweens.add({targets: part0, scaleX: 1.17, scaleY: 1.17, duration: 120, onComplete: function () {
        game_data['scene'].tweens.add({targets: part0, scaleX: 0.8, scaleY: 0.8, duration: 60, onComplete: function () {
            game_data['scene'].tweens.add({targets: part0, scaleX: 1, scaleY: 1, duration: 60, onComplete: function () {
                if (_this && _this.scene && _this.moving_holder) {
                    part0.destroy();
                    _this.moving_holder.add(part1);
                    _this.moving_holder.add(part2);
                    _this.moving_holder.add(part3);
                    _this.moving_holder.add(part4);
                    _this.moving_holder.add(part5);

                    _this.scene.tweens.add({targets: part1, x: pt.x + 40, y: pt.y, angle: 60, duration: 200, onComplete: function () {part1.destroy();}}); 
                    _this.scene.tweens.add({targets: part2, x: pt.x + 40, y: pt.y + 40, angle: 45, duration: 160, onComplete: function () {part2.destroy();}}); 
                    _this.scene.tweens.add({targets: part3, x: pt.x - 66, y: pt.y, angle: -60, duration: 240, onComplete: function () {part3.destroy();}}); 
                    _this.scene.tweens.add({targets: part4, x: pt.x - 4, y: pt.y + 60, angle: -15, duration: 160, onComplete: function () {part4.destroy();}}); 
                    _this.scene.tweens.add({targets: part5, x: pt.x - 47, y: pt.y + 35, angle: -30, duration: 220, onComplete: function () {part5.destroy();}}); 
                }
            }});           
        }});  
    }});


},

show_removing_spider2(on_complete){
    game_data['error_history'].push('gpfi6'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());


    var spider2_part = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'spider2_part');    
    this.moving_holder.add(spider2_part);

    game_data['scene'].tweens.add({targets: spider2_part, x: pt.x - 3, y: pt.y, duration: 80, onComplete: function () {
        game_data['scene'].tweens.add({targets: spider2_part, x: pt.x, y: pt.y + 3, duration: 60, onComplete: function () {
            game_data['scene'].tweens.add({targets: spider2_part, x: pt.x + 3, y: pt.y, duration: 60, onComplete: function () {
                game_data['scene'].tweens.add({targets: spider2_part, x: pt.x, y: pt.y, duration: 60, onComplete: function () {
                    game_data['scene'].tweens.add({targets: spider2_part, x: pt.x, y: pt.y + 83, angle: 75, duration: 200, onComplete: function () {
                        game_data['scene'].tweens.add({targets: spider2_part, x: pt.x, y: pt.y + 143, angle: 105, alpha: 0, duration: 80, onComplete: function () {
                            spider2_part.destroy();
                            on_complete();
                        }});                              
                    }});                          
                }});                      
            }});           
        }});  
    }});  



    var part0 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'spider_net1');    
    this.moving_holder.add(part0);

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x + 16, pt.y - 20, "common1", 'spider_net1_1');    
    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x + 22, pt.y + 14, "common1", 'spider_net1_2');    
    var part3 = new Phaser.GameObjects.Image(this.scene, pt.x - 19, pt.y - 20, "common1", 'spider_net1_3');    
    var part4 = new Phaser.GameObjects.Image(this.scene, pt.x + 3, pt.y + 22, "common1", 'spider_net1_4');    
    var part5 = new Phaser.GameObjects.Image(this.scene, pt.x - 17, pt.y + 9, "common1", 'spider_net1_5');    

    game_data['scene'].tweens.add({targets: part0, scaleX: 1.17, scaleY: 1.17, duration: 120, onComplete: function () {
        game_data['scene'].tweens.add({targets: part0, scaleX: 0.8, scaleY: 0.8, duration: 60, onComplete: function () {
            game_data['scene'].tweens.add({targets: part0, scaleX: 1, scaleY: 1, duration: 60, onComplete: function () {
                if (_this && _this.scene && _this.moving_holder) {
                    part0.destroy();
                    _this.moving_holder.add(part1);
                    _this.moving_holder.add(part2);
                    _this.moving_holder.add(part3);
                    _this.moving_holder.add(part4);
                    _this.moving_holder.add(part5);

                    _this.scene.tweens.add({targets: part1, x: pt.x + 40, y: pt.y, angle: 60, duration: 200, onComplete: function () {part1.destroy();}}); 
                    _this.scene.tweens.add({targets: part2, x: pt.x + 40, y: pt.y + 40, angle: 45, duration: 160, onComplete: function () {part2.destroy();}}); 
                    _this.scene.tweens.add({targets: part3, x: pt.x - 66, y: pt.y, angle: -60, duration: 240, onComplete: function () {part3.destroy();}}); 
                    _this.scene.tweens.add({targets: part4, x: pt.x - 4, y: pt.y + 60, angle: -15, duration: 160, onComplete: function () {part4.destroy();}}); 
                    _this.scene.tweens.add({targets: part5, x: pt.x - 47, y: pt.y + 35, angle: -30, duration: 220, onComplete: function () {part5.destroy();}}); 
                }
            }});           
        }});  
    }});

},

show_removing_ghost(on_complete){
    game_data['error_history'].push('gpfi7'); 
    var _this = this;
    var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());

    var part1 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'ghost_1');    
    this.moving_holder.add(part1);		

    var part2 = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", 'ghost_2');    
    this.moving_holder.add(part2);		

    this.scene.tweens.add({targets: part1, alpha: 0, delay: 800, duration: 400, onComplete: function () {part1.destroy();on_complete();}});  

    game_data['scene'].tweens.add({targets: part2, y: pt.y - 66, scaleX: 0.8, angle: -15, duration: 300, onComplete: function () {
        game_data['scene'].tweens.add({targets: part2, y: pt.y - 116, scaleX: 0.93, duration: 240,  onComplete: function () {
            game_data['scene'].tweens.add({targets: part2, y: pt.y - 140, scaleX: 0.8, alpha: 0, angle: 0, duration: 260,  onComplete: function () {        
                part2.destroy();
            }});                                  
        }});                                  
    }});
},

show_candy_light() {
    /*
    var candy_light = new CandyLight();
    var pt: Point = light_holder.globalToLocal(get_center_pt());
    candy_light.x = pt.x;
    candy_light.y = pt.y;
    light_holder.addChild(candy_light);
    candy_light.addEventListener(Event.ENTER_FRAME, function(event: Event){
        if (candy_light.currentFrame == candy_light.totalFrames) {
            candy_light.removeEventListener(event.type, arguments.callee);
            light_holder.removeChild(candy_light);
        }
    });
    */
},

get_lock_id() {
    return this.attr['lock_id'];
},

is_shakeable_block() {
    return (this.attr['block']['id'] == 'B' || this.attr['block']['id'] == 'D' || this.attr['block']['id'] == 'E' || this.attr['block']['id'] == 'F')
},

is_blocked() {    
    return ('strength' in this.attr['block'] && this.attr['block']['strength'] > 0);
},	

is_locked() {
    return ('id' in this.attr['lock'] && this.attr['lock']['id'] > 0 && this.attr['lock']['strength'] > 0);
},

is_reproductive() {
    return (this.is_blocked() && 'reproductive' in this.attr['block'] && this.attr['block']['reproductive']);
},

is_extrusive() {
    return ((this.is_blocked() && ('extrusive' in this.attr['block']) && this.attr['block']['extrusive']) || this.is_locked());
},

is_moving() {
    return (this.has_gem() && this.attr['gem']['mc'].is_moving());
},

is_falling() {			
    return (this.has_gem() && this.attr['gem']['mc'].is_falling());
},

get_block_id() {
    return ('id' in this.attr['block'] ? this.attr['block']['id'] : '');
},

has_gem() {   
    return ('exist' in this.attr['gem'] && this.attr['gem']['exist']);
},

is_hammer_applicable() {
    return ((!this.is_blocked() && !this.is_bottom() && !this.is_fireball()) || (this.is_blocked() && this.attr['block']['hammer_applicable']));
},

is_broom_applicable() {
    return (this.is_blocked() && 'broom_applicable' in this.attr['block'] && this.attr['block']['broom_applicable']);
},

is_magnet_applicable() {
    return ((!this.is_blocked() && !this.is_locked() && this.is_normal()));
},

is_cross_applicable() {
    return ((!this.is_blocked() && !this.is_big_bottom() && !this.is_bottom() && !this.is_fireball()));
},

is_big_bottom() {
    return (this.attr['major_big_bottom'] || this.attr['minor_big_bottom'] || (this.has_gem() && this.attr['gem']['mc'].is_big_bottom()))
},

is_freezed() {
    return ('freezed' in this.attr && this.attr['freezed']);
},

is_intblocked() {
   
    return ('strength' in this.attr['intblock'] && this.attr['intblock']['strength'] > 0 && !this.attr['intblock']['main']['attr']['intblock']['removed']);
},

is_static() {
    return (this.has_gem() && this.attr['gem']['mc'].is_static());
},

is_grass() {   
    return this.attr['grass']['id'] > 0;    
},	

is_chest() {
    return (this.has_gem() && this.attr['gem']['mc'].is_chest());
},

is_extra_moves() {
    return (this.has_gem() && this.attr['gem']['mc'].is_chest());
},

is_portal() {
    return ('exists' in this.attr['portal'] && this.attr['portal']['exists'] > 0);
},

is_top_portal() {
    return this.is_portal() && this.attr['portal']['id'] === 'top';
},

is_bottom_portal() {
    return this.is_portal() && this.attr['portal']['id'] === 'bottom';
},

set_freezed(_is_freezed) {
    this.attr['freezed'] = _is_freezed;
},		

is_major_big_bottom() {
    return ((this.has_gem() && this.attr['gem']['mc'].is_major_big_bottom()) || this.attr['major_big_bottom']);
},

set_major_big_bottom(state) {
    this.attr['major_big_bottom'] = state

},

is_minor_big_bottom() {
    return this.attr['minor_big_bottom'];
},

set_minor_big_bottom(state) {
    this.attr['minor_big_bottom'] = state

},

add_lightning() {
    //var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());    
    //this.lightning_point = this.scene.add.sprite( pt.x,  pt.y).play('lightning_point');
    //this.moving_holder.add(this.lightning_point);
    if (!this.lightning_point) {
        var pt = game_data['utils'].toLocal(this.moving_holder, this.get_center_pt());    
        this.lightning_point = this.scene.add.sprite(pt.x,  pt.y).play('lightning_point');
        this.light_holder.add(this.lightning_point);
    }
    
},

hide_lightning() {
    if (this.lightning_point)
        this.lightning_point.destroy();
},

collapse_gem() {

},

destroy_gem() {
    var gem = this.remove_gem();
    if (gem) {		
        //gem.unset_interactive();		
        gem.destroy_gem();
        // gem.destroy(true);               
    }
},	


destroy_block() {
    
    var block = this.attr['block']['mc'];
    block.alpha = 1;
    block.destroy();
    //blocks_holder.removeChild(block);
    //game_data['utils'].recycle(block);
    
},	

destroy_lock() {
    var lock = this.attr['lock']['mc'];
    lock.alpha = 1;			
    lock.destroy();    
},	

destroy_tile() {
    if (this.attr['tile']['mc'] && this.attr['tile']['mc'].tween) this.attr['tile']['mc'].tween.stop();
    var tile = this.attr['tile']['mc'];
    tile.alpha = 1;
    tile.destroy();		
},


destroy_field_item(is_smooth) {
    var _this = this;
    var disappear_timeout = 500;
    var timeout = disappear_timeout;
    
    if (this.has_gem()) {				
        var gem = this.attr['gem']['mc'];				
        if (is_smooth) {
            this.scene.tweens.add({targets: gem, alpha: 0, duration: timeout, onComplete: function () { 
                    _this.destroy_gem(true);
                }            
            });
        }
        else {
            this.destroy_gem(true);
        }
    }
    if (this.is_blocked()) {
        var block = this.get_block();
        if (is_smooth) {
            this.scene.tweens.add({targets: block, alpha: 0, duration: timeout, onComplete: function () { 
                    _this.destroy_block();
                }            
            });
        }
        else {
            this.destroy_block();
        }					
    }
    if (this.is_locked()) {
        var lock = this.get_lock();
        if (is_smooth) {
            this.scene.tweens.add({targets: lock, alpha: 0, duration: timeout, onComplete: function () { 
                    _this.destroy_lock();
                }            
            });					
        }
        else {
            this.destroy_lock();
        }
    }
    if (this.is_tiled()) {
        var tile = this.get_tile();
        if (is_smooth) {
            this.scene.tweens.add({targets: tile, alpha: 0, duration: timeout, onComplete: function () { 
                _this.destroy_tile();
                }            
            });					
        }
        else {
            this.destroy_tile();
        }
    }				
    //clearTimeout(freeze_timeout_id);
    this.timer_shake.paused = true;
    this.timer_shake.remove()
    this.timer_shake.destroy(true)
    if (this.freeze_timeout_id) this.freeze_timeout_id.destroy();
},

add_tint() {
    var _this = this;
    if (_this.scene) game_data['scene'].tweens.add({targets: _this.field_flash, alpha: 0.3, duration: 300,  onComplete: function () {        
        if (_this.scene) game_data['scene'].tweens.add({targets: _this.field_flash, alpha: 0, delay: 300, duration: 300}); 
    }}); 
    this.has_tint_anim = true;
    setTimeout(() => {
        _this.has_tint_anim = false;
    }, 900);
},

delayed_show() {
    var _this = this;
    if (this.delay > 0) {
        this.alpha = 0;
        if (this.attr['tile']['mc']) this.attr['tile']['mc'].alpha = 0
        if (this.attr['block']['mc']) this.attr['block']['mc'].alpha = 0;
        if (this.attr['lock']['mc']) this.attr['lock']['mc'].alpha = 0;
        setTimeout(() => {
            game_data['scene'].tweens.add({targets: this, alpha: 1, duration: 200});
            if (this.attr['tile']['mc']) game_data['scene'].tweens.add({targets: this.attr['tile']['mc'], alpha: 1, duration: 200});
            if (this.attr['block']['mc']) game_data['scene'].tweens.add({targets: this.attr['block']['mc'], alpha: 1, duration: 200});
            if (this.attr['lock']['mc']) game_data['scene'].tweens.add({targets: this.attr['lock']['mc'], alpha: 1, duration: 200});
        }, this.delay);
    }
},

dummy_function() {},

/*
destroy_field_item() {
    if (this.is_blocked())
        this.destroy_block();
    this.destroy_gem();
}
*/


});



