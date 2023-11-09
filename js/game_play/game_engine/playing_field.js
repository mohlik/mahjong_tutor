var PlayingField = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function PlayingField (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init: function (params){  
  this.boosters_panel = params['boosters_panel'];
  this.targets_manager = params['targets_manager'];
  
  this.border_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.border_holder);

  this.field_items_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.field_items_holder);

  this.tiles_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.tiles_holder);

  this.blick_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.blick_holder);

  this.light_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.light_holder);

  this.gems_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.gems_holder);

  this.locks_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.locks_holder);
  
  this.blocks_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.blocks_holder);

  this.hint_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.hint_holder);      

  this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.moving_holder);      
  
  this.explosion_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
  this.add(this.explosion_holder);  



  this.field_items = new Array();
  
  this.gems_manager = new GemsManager(this.scene);	
  this.gems_manager.init({
    'scene': this.scene,
    'gems_holder': this.gems_holder,
    'moving_holder': this.moving_holder,
    'hint_holder': this.hint_holder,
    'boosters_panel': this.boosters_panel,
    'field_items': this.field_items,
    'explosion_holder':this.explosion_holder,
    'targets_manager': this.targets_manager,
    
  });	  
  this.gems_manager.emitter.on("EVENT", this.handler_event, this);
  this.field_items_manager = new FieldItemsManager(this.scene);

  this.field_items_manager.init({
    'scene': this.scene,
    'field_items_holder': this.field_items_holder,
    'border_holder': this.border_holder,    
    'gems_holder': this.gems_holder,
    'blocks_holder': this.blocks_holder,
    'locks_holder': this.locks_holder,
    'blick_holder': this.blick_holder,
    'tiles_holder': this.tiles_holder,
    'light_holder': this.light_holder,
    'point_light_holder': this.point_light_holder,
    'moving_holder': this.moving_holder,
    'field_items': this.field_items,
    'targets_manager': this.targets_manager,    
  });			

  this.field_items_manager.emitter.on("EVENT", this.handler_event, this);	    
  this.game_active = false;
  this.game_paused = true;
},

get_field_items() {
	return this.field_items;
},

update() {
  this.gems_manager.update();  
},


start_level(params) {
  var _this = this;
  this.level_id = params['level_id'];
  this.level = params['level'];
  this.field_id = 0;
  this.gems_holder.removeAll(true);
  this.gems_manager.recycled_gems = [];

  while (this.field_items.length)
    this.field_items.pop();							
  
  this.field_items_manager.update_level({'level_id': this.level_id, 'level':this.level});
  this.gems_manager.update_level({'level_id': this.level_id, 'level':this.level});
  
  
  this.update_field();
  this.selected_item = {};
  this.field_items_manager.start_level();		
  this.gems_manager.start_level();
},

update_field() {
  var _this = this;
  this.level_scale = game_data['utils'].get_field_scale({
      'field': this.level['fields'][this.field_id], 
      'unlocked_cells': this.field_items_manager.get_unlocked_cells(),
    });
  this.emitter.emit('EVENT', {'event': 'UPDATE_LEVEL_SCALE', 'level_scale': this.level_scale});
  
  this.gems_manager.clean_candidates();
  this.gems_manager.set_exploded_gems();

  this.field_items_manager.update_field(this.field_id);

  this.field_items_manager.unlock_field({'lock_id': 0, 'level_scale': this.level_scale});
  this.gems_manager.update_field(this.field_id);
  
  this.appear_field(function(){
      _this.game_active = true; 					
      _this.emitter.emit('EVENT', {'event': 'FIELD_APPEARED'});      	  
  });  
},

animate_appear({resourse, duration, delay}) {
  resourse.alpha = 0;
  this.scene.tweens.add({targets: resourse, alpha: 1, duration: duration, delay: delay ,onComplete: function(){}});
},

appear_field(on_complete) {
console.log('appear field');	

	var pos_x;
	var pos_y;	
	var field_item;
	var duration = 300;
	var delay = 0;
	var gem;
	var gem;
	var tile;
	var block;
	var lock;
	
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {	
			field_item = this.field_items[pos_y][pos_x];
			if (field_item) {				
				field_item.alpha = 0;
				delay += 30;
				this.scene.tweens.add({targets: field_item, alpha: 1, duration: duration, delay: delay ,onComplete: function(){}});
				gem = field_item.get_gem();
				tile = field_item.get_tile();
				block = field_item.get_block();
				lock = field_item.get_lock();
				if (gem) {
          this.animate_appear({'resourse': gem, duration, delay});
        }
        
        if (tile) {
          this.animate_appear({'resourse': tile, duration, delay});
        }

        if (block) {
          this.animate_appear({'resourse': block, duration, delay});
        }

        if (lock) {
          this.animate_appear({'resourse': lock, duration, delay});
        }
			}				
		}
	}		
	on_complete();
},

update_scale(level_scale) {
  this.level_scale = level_scale;
  this.gems_manager.tutorial_manager.update_scale(this.level_scale);
},

level_completed() {
  this.gems_manager.reset_hint();
},

start_tutorial(params) {
  this.gems_manager.start_tutorial(params);
},
    
handler_create_gem(params) {
  this.gems_manager.create_gem(params['item']);			
},

finish_tutorial() {
  this.gems_manager.finish_tutorial();
},

apply_candies() {
  this.gems_manager.apply_candies();
},

apply_dracula() {
  this.gems_manager.apply_dracula();
},	

handler_update_moves(params) { 

  // var _this = this;
  // this.emitter.emit('EVENT', {'event': 'UPDATE_MOVES'});
  
  // game_data['utils'].delayed_call(500, function(){
  //   if (_this.scene) _this.gems_manager.wait_for_quiet(function(){
  //     if (_this.scene) {
  //       _this.field_items_manager.update_reproduction();
  //       _this.field_items_manager.reset_destroyed_blocks();
  //     }
  //   });					   
  // });
},

handler_update_reproduction({delay = 0}) {

	game_data['utils'].delayed_call(500 + delay, () => {
		this.field_items_manager.update_reproduction();
		this.field_items_manager.reset_destroyed_blocks();
		// if (_this.scene) _this.gems_manager.wait_for_quiet(function(){
		// 	if (_this.scene) {
				
				
		// 	}
		// });					   
	}, [], this);
},

update_score(gem_type) {
  var gem_score =  this.get_score(gem_type);
  this.emitter.emit('EVENT', {'event': 'UPDATE_SCORE', 'score': gem_score});  
},
	
handler_show_score(params) {
  var score = params['score'];
  this.emitter.emit('EVENT', {'event': 'UPDATE_SCORE', 'score': score}); 
},

monster_hurt() {
  var _this = this;

  if (this.field_id < this.level['fields'].length - 1) {
    this.field_id++;
    if (_this.scene) _this.scene.tweens.add({targets:_this, alpha: 0, duration: 500, onComplete: function(){
      if (_this.scene){
        _this.update_field();
        _this.scene.tweens.add({targets:_this, alpha: 1, duration: 500, onComplete: function(){
        }});
      } 
    }});
    											     
  }			
},

apply_reshuffle() {
  this.gems_manager.apply_resuffle();
},

set_score(score) {
  this.user_score = score;
},

apply_post_level_candies(on_complete) {
  this.gems_manager.apply_post_level_candies(on_complete);
},

check_no_activity() {
  return this.gems_manager.check_no_activity();
},

block_moves() {
  this.gems_manager.block_moves();  
},

unblock_moves() {
  this.gems_manager.unblock_moves();
},	

get_field_item_pt(obj) {
  var field_item = this.field_items[obj['pos_y']][obj['pos_x']];
  return game_data['utils'].toGlobal(this.field_items_holder, new Phaser.Geom.Point(field_item.x, field_item.y));
},

get_score(gem_id) {
  var score;
  if (gem_id <= 0)
    score =  game_data['gems_score'][0];
  else if (gem_id > game_data['gems_score'].length - 1)
    score =  game_data['gems_score'][game_data['gems_score'].length - 1];
  else
    score =  game_data['gems_score'][gem_id];
  
  return score;
},

wait_for_quiet(on_complete) {		
  this.gems_manager.wait_for_quiet(on_complete);	
},			


booster_drag_start(params) {    
    this.gems_manager.booster_drag_start(params);
},

booster_drag_end(params) {
  this.gems_manager.booster_drag_end(params);
},

create_mask() {
  this.field_items_manager.create_mask();
},

game_pause() {
  this.gems_manager.hide_hint();
  this.game_paused = true;
},

game_resume() {
  this.game_paused = false;
  if (this.game_active)
    this.gems_manager.reset_hint();				
},

booster_click (params) {
  this.gems_manager.booster_click(params);
},

handler_create_pieces(params) {
  this.gems_manager.create_pieces(params);
},

handler_field_item_over(params) {
  this.gems_manager.handler_item_over(params);
},

handler_field_item_out(params) {
  this.gems_manager.handler_item_out(params);
},

update_tutorial_iteration() {
  this.gems_manager.update_tutorial_iteration()
},

handler_event(params) {
	switch (params['event']) {
    case 'GAME_PLAY_TUTORIAL_FINISHED':
      this.finish_tutorial();
	  break;
	case 'UPDATE_MOVES':
	  this.handler_update_moves(params);
      break;
    case 'UPDATE_REPRO':
			this.handler_update_reproduction(params);
			break;
    case 'UPDATE_TUTORIAL_ITERATION':
      this.update_tutorial_iteration()
      break;
    case 'SHOW_SCORE':
			this.handler_show_score(params);
      break;
    case 'CREATE_GEM':
			this.handler_create_gem(params);
      break;
    case 'CREATE_PIECES':
			this.handler_create_pieces(params);
      break;
    case 'FIELD_ITEM_OVER':
			this.handler_field_item_over(params);
      break;
      case 'FIELD_ITEM_OUT':
			this.handler_field_item_out(params);
      break;
	case 'ADD_NEW_GEMS': 
		this.handler_add_new_gems(params);
      break;
  case 'UPDATE_EMPTY_FIELD_ITEMS':
      this.handler_update_empty_field_items(params);
        break;
  case 'ALLOW_UPDATE_ITEMS':
    this.handler_allow_update_items(params);
    break;
  case 'UPDATE_CANDIDATE':
      
      this.gems_manager.handler_update_candidate(params);
      break;  
    default:
      
      this.emitter.emit('EVENT', params);
	break;
  }
},
handler_allow_update_items() {
  this.gems_manager.switch_allow_update_items(true);
},

handler_update_empty_field_items(params) {
  this.gems_manager.update_empty_field_items(params['item']);
  
},
get_empty_field_items() {
  return this.gems_manager.get_empty_field_items();
},


handler_add_new_gems(params) {
	this.gems_manager.add_new_gems(params);
},

is_allow_touch_gem(params) {
	
	return (!this.level['water'] || this.block_water['pos_y'] > params['pos']['pos_y'])
},

destroy_level() {						
  this.gems_manager.destroy_level();		
  this.field_items_manager.destroy_level();		
  this.game_active = false;
  this.gems_holder.removeAll(true);
}
});