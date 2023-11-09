﻿class GemsManager{
	constructor(){

    }


init(params) {
	game_data['gem_timers'] = []
	this.recycled_gems = [];
	this.emitter = new Phaser.Events.EventEmitter();
	
	this.scene = game_data['scene'];
	this.gems_holder = params['gems_holder'];
	this.moving_holder = params['moving_holder'];
	this.explosion_holder = params['explosion_holder'];	

	this.hint_holder = params['hint_holder'];
	this.field_items = params['field_items'];
	this.boosters_panel = params['boosters_panel'];
	this.targets_manager = params['targets_manager'];
		
	this.bonus_manager = new BonusManager();
	this.bonus_manager.init({
		'scene': this.scene, 
		'moving_holder': this.explosion_holder, 
		'boosters_panel': this.boosters_panel,
		'gems_manager': this,
	});			
	this.bonus_manager.emitter.on('EVENT', this.handler_event, this);    
	this.level_scale = 1;

	this.tutorial_manager = new TutorialManager();		
	game_data['tutorial_manager'] = this.tutorial_manager;
	this.tutorial_manager.init({
		'scene': this.scene,								
		'field_items': this.field_items,
		'boosters_panel': this.boosters_panel
	});
	this.tutorial_manager.emitter.on('EVENT', this.handler_event, this);    

				
	this.gems_utils = new GemsUtils();				
	this.gems_utils.init({
		'scene': this.scene,
		'targets_manager': this.targets_manager,
		'gems_manager': this
	});
	this.gems_utils.emitter.on('EVENT', this.handler_event, this);    

	this.hint_arrows = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", 'hint_arrows');
	this.hint_arrows.visible = false;

	this.attr = {};
	this.exploding_items = [];
	this.selected_gem = null;
	this.active_booster = {'active': false};
	this.clean_attr();

	this.scene.input.on('pointermove', this.handler_mouse_move, this);
	this.scene.input.on('pointerup', this.handler_mouse_up, this);
	
	this.empty_field_items = [];
	this.allow_update_items = false;
	this.bonus_block_update = false;
	this.uno_swap_bonus = false;
	this.allow_reshuffle = true

	this.big_bonus_radius = loading_vars['big_booster_radius'] ? true : false;
	this.switched_gems = []
	this.timer_empty_field_items = this.scene.time.addEvent({delay: 3000, callback: this.handler_check_empty_field_items, callbackScope: this, loop: true});
	this.timer_empty_field_items.paused = true
}	

handler_check_empty_field_items() {
	for (let pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (let pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++) {
			let field_item = this.field_items[pos_y][pos_x];
			if (field_item && field_item.is_empty() && !this.empty_field_items.some(el => el.pos_x == pos_x && el.pos_y == pos_y)) {
				
				this.empty_field_items.push({ 'pos_x': pos_x, 'pos_y': pos_y });
			}
		}
	}
}

update() {
	var time = game_data['utils'].get_time(); 
	var dt;
	var g = 40;
	for (var i = this.exploding_items.length - 1; i >= 0; i--) {
		dt = time - this.exploding_items[i]['t'];

		this.exploding_items[i]['item'].x += this.exploding_items[i]['Vx'] * dt / 10;
		this.exploding_items[i]['item'].y += this.exploding_items[i]['Vy'] * dt / 10;
		this.exploding_items[i]['item'].angle += this.exploding_items[i]['angle'] * dt / 10;
	

		if (this.exploding_items[i]['item'].y > loading_vars['H']) {
			this.exploding_items[i]['item'].destroy();
			this.exploding_items.splice(i, 1);                
		}
		else {			
			this.exploding_items[i]['Vy'] += g * dt / 1000;            
			this.exploding_items[i]['t'] = time;            
		}
	}
	
	if (this.allow_update_items && !this.bonus_block_update && !this.uno_swap_bonus)
		this.check_empty_field_items();
}

add_new_gems({items}) {	
	let block_row = this.block_row
	items.forEach(({pos_y, pos_x}) => {
		if (this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_locked() && this.field_items[pos_y][pos_x].is_empty() && !this.field_items[pos_y][pos_x].is_minor_big_bottom()) {
			if (pos_y < block_row) {
				let gem = this.create_gem({pos_y, pos_x});
				this.field_items[pos_y][pos_x].add_gem(gem);
				this.field_items[pos_y][pos_x].update_gem_visibility();
			}
			else if (!this.field_items[pos_y][pos_x].is_trapped()){
				
				this.empty_field_items.push({pos_y, pos_x})
			}
			
		}
		
	});

}
get_empty_field_items() {
	return this.empty_field_items;
}

check_empty_field_items() {
	var key;
	var obj;		
	var pos_x;
	var pos_y;
	var gem;
	var i;
	var item;
	var vertical_items = [];
	var left_items = [];
	var right_items = [];
		
	
	while(this.empty_field_items.length) {
		item = this.empty_field_items.pop();
		vertical_items.push(item);	
				
	}
	
	while ((vertical_items.length > 0 || right_items.length > 0 || left_items.length > 0) ) {
		
		while (vertical_items.length > 0) {
			if (!this.attr.level_active) {
				vertical_items = [];
				right_items = [];
				left_items = [];
			} else {
				
				obj = vertical_items.shift();
				pos_x = obj['pos_x'];
				pos_y = obj['pos_y'];
				
				if (this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].has_gem() && this.field_items[pos_y][pos_x].is_top_portal()) {
					let top_portal = game_data['game_engine']['playing_field']['field_items_manager'].top_portal
					let bottom_portal = game_data['game_engine']['playing_field']['field_items_manager'].bottom_portal
					let index = top_portal.findIndex(item => item === this.field_items[pos_y][pos_x])
					let target_field = bottom_portal[index] ?  bottom_portal[index] :  bottom_portal[bottom_portal.length - 1]
					let boot_field = top_portal[index] ?  top_portal[index] :  top_portal[top_portal.length - 1]
					
					if (target_field && target_field.has_gem()) {
						gem = target_field.remove_gem();
						this.field_items[pos_y][pos_x].add_gem(gem)
						vertical_items.push({'pos_x': target_field.pos_x, 'pos_y': target_field.pos_y});
						
						if (target_field)
							target_field.play_portal_anim()	
						if (boot_field)
							boot_field.play_portal_anim()	
					}
					else
						this.empty_field_items.push({pos_y, pos_x})
				}
				else if (this.peak_cell(obj) && (this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].has_gem() && !this.field_items[pos_y][pos_x].is_locked() && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_minor_big_bottom())) {
					gem = this.create_gem(obj);
					this.field_items[pos_y][pos_x].add_gem(gem);	
				}
				else if (pos_y > 0 && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_intblocked() && !this.field_items[pos_y][pos_x].is_locked() && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x] && 
				!this.field_items[pos_y - 1][pos_x].is_empty() &&
				this.field_items[pos_y - 1][pos_x].get_gem().parentContainer &&
				!this.field_items[pos_y - 1][pos_x].is_static() &&
				!this.field_items[pos_y - 1][pos_x].is_dynamical() &&
				!this.field_items[pos_y - 1][pos_x].is_blocked() && 
				!this.field_items[pos_y - 1][pos_x].is_intblocked() && 
				!this.field_items[pos_y - 1][pos_x].is_locked() && !this.field_items[pos_y - 1][pos_x].is_minor_big_bottom() && !this.field_items[pos_y - 1][pos_x].is_major_big_bottom() && !this.field_items[pos_y - 1][pos_x].is_freezed() && !this.field_items[pos_y][pos_x].has_gem() && !this.field_items[pos_y][pos_x].is_minor_big_bottom()) {
					
					gem = this.field_items[pos_y - 1][pos_x].remove_gem();
					this.field_items[pos_y][pos_x].add_gem(gem);
					vertical_items.push({'pos_x': pos_x, 'pos_y': pos_y - 1});

				}
				else if (pos_y > 0 && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x] && 						
						!this.is_deep_empty({'pos_x': pos_x, 'pos_y': pos_y - 1}) && !this.field_items[pos_y - 1][pos_x].is_static() && !this.field_items[pos_y - 1][pos_x].is_locked() && !this.field_items[pos_y - 1][pos_x].is_minor_big_bottom() && !this.field_items[pos_y - 1][pos_x].is_major_big_bottom() && !this.field_items[pos_y][pos_x].is_minor_big_bottom()) {
							
					this.empty_field_items.push(obj);
				}
				else if (
					pos_y > 0 && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x] && this.field_items[pos_y - 1][pos_x].is_major_big_bottom()
					&& this.field_items[pos_y][pos_x + 1] && this.field_items[pos_y][pos_x + 1].is_empty() && !this.field_items[pos_y][pos_x + 1].is_locked() && !this.field_items[pos_y][pos_x + 1].is_blocked() 
					&& this.field_items[pos_y - 1][pos_x + 1] && this.field_items[pos_y - 1][pos_x + 1].is_minor_big_bottom() && this.field_items[pos_y - 2] && this.field_items[pos_y - 2][pos_x] && this.field_items[pos_y - 2][pos_x + 1] && this.field_items[pos_y - 2][pos_x + 1] && this.field_items[pos_y - 2][pos_x].is_minor_big_bottom() && this.field_items[pos_y - 2][pos_x].is_minor_big_bottom()
				) {
					// console.log('major')
					gem = this.field_items[pos_y - 1][pos_x].remove_gem();
					this.field_items[pos_y][pos_x].add_gem(gem);
					vertical_items.push({'pos_x': pos_x, 'pos_y': pos_y - 2});
					vertical_items.push({'pos_x': pos_x + 1, 'pos_y': pos_y - 2});
					this.field_items[pos_y - 2][pos_x].set_minor_big_bottom(false)
					this.field_items[pos_y - 2][pos_x + 1].set_minor_big_bottom(false)
					this.field_items[pos_y - 1][pos_x].set_minor_big_bottom(true)
					this.field_items[pos_y - 1][pos_x + 1].set_minor_big_bottom(true)
					this.field_items[pos_y][pos_x + 1].set_minor_big_bottom(true)
					this.field_items[pos_y][pos_x].set_major_big_bottom(true)
					this.field_items[pos_y - 1][pos_x].set_major_big_bottom(false)
				}
				else {
					
					right_items.push(obj);
				}
			}
			
				

		}
			
			
		while (right_items.length > 0) {
			if (!this.attr.level_active) {
				vertical_items = [];
				right_items = [];
				left_items = [];
			} else {
				obj = right_items.shift();
				pos_x = obj['pos_x'];
				pos_y = obj['pos_y'];
				if (pos_y > 0 && this.field_items[pos_y - 1] && pos_x < this.field_items[pos_y - 1].length - 1 && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_blocked()  && !this.field_items[pos_y][pos_x].is_intblocked() && !this.field_items[pos_y][pos_x].is_locked() && this.field_items[pos_y - 1][pos_x + 1] &&
						!this.field_items[pos_y - 1][pos_x + 1].is_empty() &&
						this.field_items[pos_y - 1][pos_x + 1].get_gem().parentContainer &&
						!this.field_items[pos_y - 1][pos_x + 1].is_static() &&
						!this.field_items[pos_y - 1][pos_x + 1].is_dynamical() &&
						!this.field_items[pos_y - 1][pos_x + 1].is_blocked() && !this.field_items[pos_y - 1][pos_x + 1].is_intblocked() && !this.field_items[pos_y - 1][pos_x + 1].is_big_bottom() && !this.field_items[pos_y - 1][pos_x + 1].is_freezed() && !this.field_items[pos_y][pos_x].has_gem() && !this.field_items[pos_y][pos_x].is_minor_big_bottom())  {
					gem = this.field_items[pos_y - 1][pos_x + 1].remove_gem();
					this.field_items[pos_y][pos_x].add_gem(gem, true);
					vertical_items.push({'pos_x': pos_x + 1, 'pos_y': pos_y - 1});
				}
				else {
					left_items.push(obj);
				}
			}
			
				
		}			
			
		while (left_items.length > 0) {
			if (!this.attr.level_active) {
				vertical_items = [];
				right_items = [];
				left_items = [];
			} else {
				obj = left_items.shift();
				pos_x = obj['pos_x'];
				pos_y = obj['pos_y'];
				if (pos_y > 0 && pos_x > 0 && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x - 1] && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_intblocked() && !this.field_items[pos_y][pos_x].is_locked() &&
						!this.field_items[pos_y - 1][pos_x - 1].is_empty() &&
						this.field_items[pos_y - 1][pos_x - 1].get_gem().parentContainer &&
						!this.field_items[pos_y - 1][pos_x - 1].is_static() &&
						!this.field_items[pos_y - 1][pos_x - 1].is_dynamical() &&
						!this.field_items[pos_y - 1][pos_x - 1].is_blocked() && !this.field_items[pos_y - 1][pos_x - 1].is_intblocked() && !this.field_items[pos_y - 1][pos_x - 1].is_big_bottom() && !this.field_items[pos_y - 1][pos_x - 1].is_freezed() && !this.field_items[pos_y][pos_x].has_gem() && !this.field_items[pos_y][pos_x].is_minor_big_bottom()) {
					gem = this.field_items[pos_y - 1][pos_x - 1].remove_gem();
					this.field_items[pos_y][pos_x].add_gem(gem, true);
					vertical_items.push({'pos_x': pos_x - 1, 'pos_y': pos_y - 1});
				}
				else {
					this.empty_field_items.push(obj);
				}
			}
			
				
		}
	}

	this.empty_field_items = this.empty_field_items.filter(({pos_x, pos_y}) => (this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].has_gem()));
	this.allow_update_items = false;
}


is_deep_empty(obj) {
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];
			
	if ((this.field_items[pos_y] && this.field_items[pos_y][pos_x]) && (this.field_items[pos_y][pos_x].is_blocked() || this.field_items[pos_y][pos_x].is_locked()))
		return true;
	else if ((this.field_items[pos_y] && this.field_items[pos_y][pos_x]) && (!this.field_items[pos_y][pos_x].is_empty() || this.peak_cell(obj)))
		return false;
	else {
		var res = true;
		var i;
		var arr = [];
		if (pos_y > 0 && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x])
			arr.push({'pos_x': pos_x, 'pos_y': pos_y - 1});
		if (pos_y > 0 && pos_x > 0 && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x - 1])
			arr.push({'pos_x': pos_x - 1, 'pos_y': pos_y - 1});
		if (pos_y > 0 && this.field_items[pos_y - 1] && pos_x < this.field_items[pos_y - 1].length - 1 && this.field_items[pos_y - 1][pos_x + 1])
			arr.push({'pos_x': pos_x + 1, 'pos_y': pos_y - 1});
	
		for (i = 0; i < arr.length; i++)
			res = res && this.is_deep_empty(arr[i]);
		return res;
	}
}


peak_cell(obj) {
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];
	
	if (pos_y == 0)
		return true;
	else {
		if (this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x])
			return false;
		if (pos_x > 0 && this.field_items[pos_y - 1] && this.field_items[pos_y - 1][pos_x - 1])
			return false;
		if (this.field_items[pos_y - 1] && (pos_x < this.field_items[pos_y - 1].length - 1) && this.field_items[pos_y - 1][pos_x + 1])				
			return false;									
			
		return true;
	}	
}		



create_pieces(params) {
	var pt = game_data['utils'].toLocal(this.moving_holder, params['pt']);
	var key = params['key'];


	var pt_parts = [{'x': 0, 'y': 0}, {'x': 30, 'y': 0}, {'x': 0, 'y': 30}, {'x': 20, 'y': 37}, {'x': 47, 'y': 27}];
	
	var time = game_data['utils'].get_time();

	params['w'] = 80;
	params['h'] = 80;

		var part1 = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", key + '_1');
		part1.x = pt.x - params['w'] / 2 +  part1.width / 2 + pt_parts[0].x;
		part1.y = pt.y - params['h'] / 2 +  part1.height / 2 + pt_parts[0].y;
		part1.setOrigin(0.5, 0.5);
		this.moving_holder.add(part1);		
		this.exploding_items.push({'item': part1, 'Vx': -Phaser.Math.Between(2000, 6000) / 1000, 'Vy': -Phaser.Math.Between(3000, 7000) / 1000, 't': time, 't0': time, 'angle': -2, 'scale': 1});

		var part2 = new Phaser.GameObjects.Image(this.scene, 100, 100, "common1", key + '_2');
		part2.setOrigin(0.5, 0.5);
		part2.x = pt.x - params['w'] / 2 +  part2.width / 2 + pt_parts[1].x;
		part2.y = pt.y - params['h'] / 2 +  part2.height / 2 + pt_parts[1].y;
		this.moving_holder.add(part2);
		this.exploding_items.push({'item': part2, 'Vx': Phaser.Math.Between(2000, 7000) / 1000, 'Vy': -Phaser.Math.Between(3000, 7000) / 1000, 't': time, 't0': time, 'angle': -3, 'scale': 1});

		var part3 = new Phaser.GameObjects.Image(this.scene, 100, 100, "common1", key + '_3');
		part3.setOrigin(0.5, 0.5);
		part3.x = pt.x - params['w'] / 2 +  part3.width / 2 + pt_parts[2].x;
		part3.y = pt.y - params['h'] / 2 +  part3.height / 2 + pt_parts[2].y;
		this.moving_holder.add(part3);
		this.exploding_items.push({'item': part3, 'Vx': Phaser.Math.Between(-2000, -4000) / 1000, 'Vy': -Phaser.Math.Between(500, 1500) / 1000, 't': time, 't0': time, 'angle': 4, 'scale': 1});

		var part4 = new Phaser.GameObjects.Image(this.scene, 100, 100, "common1", key + '_4');
		part4.setOrigin(0.5, 0.5);
		part4.x = pt.x - params['w'] / 2 +  part4.width / 2 + pt_parts[3].x;
		part4.y = pt.y - params['h'] / 2 +  part4.height / 2 + pt_parts[3].y;
		this.moving_holder.add(part4);
		this.exploding_items.push({'item': part4, 'Vx': Phaser.Math.Between(-4000, -2000) / 1000, 'Vy': Phaser.Math.Between(500, 1500) / 1000, 't': time, 't0': time, 'angle': 2, 'scale': 1});

		var part5 = new Phaser.GameObjects.Image(this.scene, 100, 100, "common1", key + '_5');
		part5.setOrigin(0.5, 0.5);
		part5.x = pt.x - params['w'] / 2 +  part5.width / 2 + pt_parts[4].x;
		part5.y = pt.y - params['h'] / 2 +  part5.height / 2 + pt_parts[4].y;
		this.moving_holder.add(part5);
		this.exploding_items.push({'item': part5, 'Vx': Phaser.Math.Between(2000, 4000) / 1000, 'Vy': Phaser.Math.Between(500, 1500) / 1000, 't': time, 't0': time, 'angle': 1, 'scale': 1});
	

	this.add_particle({'pt': pt, 'holder': this.moving_holder});
}

add_particle(params){
	var pt_start = params['pt'];
	var prtcl = game_data['scene'].add.particles('common1', 'l10000');
	var timeout = 500;
	var _quantity = 3 + parseInt(Math.random() * 3);
	params['holder'].add(prtcl);
	prtcl.createEmitter({
			x: pt_start.x,
			y: pt_start.y,
			
			angle: { min: 0, max: 360 },
			speed: 80,
			lifespan: timeout,
			quantity: _quantity,
			maxParticles: _quantity,
			scale: { start: 1.5, end: 0.5 },
			alpha: { start: 1, end: 0.4 },
			blendMode: 'NORMAL'
	});
	setTimeout(() => {
			prtcl.destroy();
	}, timeout);
}
  
		
update_level(_params) {						
	this.level_id = _params['level_id'];	
	this.level = _params['level'];	
	this.gems_utils.update_utils({'field_items': this.field_items,							 
		'level':this.level,	'level_id': this.level_id});
	
	this.bonus_manager.update_manager({'field_items': this.field_items,
		'level':this.level,	'level_id': this.level_id});
	
	this.clean_attr();
	this.selected_gem = null;						
}

start_level() {
	this.attr['level_active'] = true;
	this.attr['moves_blocked'] = false;
	this.attr['update_gems_position'] = true;
	//this.check_update_gems();			
	this.gems_utils.start_level();	
	this.timer_empty_field_items.paused = false		
	this.check_reshuffle({'level_start': true});

}

start_tutorial(obj) {		
	this.tutorial_manager.update_tutorial({'level_id': this.level_id, 'level':this.level });			
	return this.tutorial_manager.check_tutorial();
}
		
update_field(field_id) {
	var gem;
	this.gems_utils.update_init_types(this.level['fields'][field_id]);
	var pos_x;
	var pos_y;
	
	
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {	
			if (this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_locked()) {
				gem = this.create_gem({'pos_x': pos_x, 'pos_y': pos_y}, true);
				this.field_items[pos_y][pos_x].add_gem(gem);
				this.field_items[pos_y][pos_x].update_gem_visibility();
			}
		}
	}
}	

clean_candidates() {
	this.gems_utils.clean_candidates();
}

check_update_gems() {
	var _this = this;
	this.attr['timeouts']['update_gems']  = game_data['utils'].delayed_call(50, function(){
		if (_this.attr['update_gems_position'])
			_this.update_gems_position();				
		
		if (_this.attr['level_active'])
			_this.check_update_gems();
	});		
}		
		

handler_apply_bonus(params) {
	this.bonus_manager.apply_bonus(params);			
}

apply_candies() {
	this.bonus_manager.apply_candies();
}

apply_dracula() {
	this.bonus_manager.apply_dracula();
}

apply_resuffle() {
	this.bonus_manager.apply_resuffle();		
	this.reset_hint();
}
	
create_combo_bonus(bonus1, bonus2) {
	this.bonus_manager.apply_combo_bonus({bonus1, bonus2});
}

swap_items(gem1, gem2) {
	let empty = !gem1.get_pos
	var item1 = gem1.get_pos ? gem1.get_pos() : gem1;
	var item2 = gem2.get_pos ? gem2.get_pos() : gem2;
	var pt1 = this.field_items[item1['pos_y']][item1['pos_x']].get_target_gem_pt();
	var pt2 = this.field_items[item2['pos_y']][item2['pos_x']].get_target_gem_pt();
	this.allow_reshuffle = false
	if (!empty) {
		if (!(gem1.is_static() || gem2.is_static())) {
			let fireball1 = gem1.is_bonus() && gem1.get_id() === 15 && (gem2.is_normal() || gem2.get_type() === 'mark')
			let fireball2 = gem2.is_bonus() && gem2.get_id() === 15 && (gem1.is_normal() || gem1.get_type() === 'mark')
			
			let allow_swap = this.gems_utils.check_swap(item1, item2) 
			if ((allow_swap || (gem1.is_bonus() && gem1.get_id() !== 15 &&  !(gem2.is_big_bottom())) || (gem2.is_bonus() && gem2.get_id() !== 15 && !(gem1.is_big_bottom())) || (gem1.get_id() === 15 && gem2.get_id() === 15) || fireball1 || fireball2) && this.tutorial_manager.is_allowed({'item1': item1, 'item2': item2, 'type': 'swap'}) && !(gem1.is_bonus() && gem1.get_id() === 15 && gem2.is_bonus() && gem2.get_id() === 15)) {
				// if (gem1.is_bonus() && gem2.is_bonus()) {
				// 	this.field_items[item1['pos_y']][item1['pos_x']].add_gem(gem2);
				// 	this.field_items[item2['pos_y']][item2['pos_x']].add_gem(gem1);
				// 	gem1.move_swap(pt2, () => {
				// 		setTimeout(() => {
				// 			this.allow_reshuffle = true
				// 		}, 300)
				// 	}, false, gem2, false);
		
				// 	gem2.move_swap(pt1, () => {
				// 		this.create_combo_bonus(gem1, gem2);
				// 		this.switched_gems.forEach(g => {
				// 			if (g.is_switched())
				// 				g.switch_gem()
				// 		})
				// 	}, false, gem1, false);
				// }
				// else {
					this.field_items[item1['pos_y']][item1['pos_x']].add_gem(gem2);
					this.field_items[item2['pos_y']][item2['pos_x']].add_gem(gem1);
					let gem1_candidate = true
					let gem2_candidate = true
					if (gem1.is_bonus() && gem1.get_id() === 15 && gem2.is_bonus() && gem1.get_id() !== 15) {
						gem1_candidate = false
					}
					if (gem2.is_bonus() && gem2.get_id() === 15 && gem1.is_bonus() && gem1.get_id() !== 15) {
						gem2_candidate = false
					}
					gem2.move_swap(pt1, () => {
						setTimeout(() => {
							this.allow_reshuffle = true
						}, 300)
					}, false, gem1, true, gem2_candidate);	
					gem1.move_swap(pt2, () => {
						this.switched_gems.forEach(g => {
							if (g.is_switched())
								g.switch_gem()
						})
					}, false, gem2, true, gem1_candidate);
		
				// }
				
				this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
				let delay = 0
				if (gem1.is_bonus() || gem2.is_bonus()) delay = 1000
				this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": delay});
				if (!(gem1.is_bonus() && gem2.is_bonus())) {
					this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'});
				}
											
				this.update_tutorial_iteration();
				this.gems_utils.reset_combo();	
				// this.check_reshuffle({'move': true});		
			}
			else {
				setTimeout(() => {
					this.allow_reshuffle = true
				}, 300)
				gem1.move_fail(pt2, pt1);
				gem2.move_fail(pt1, pt2);		
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bad_move'});
			}
		}
		else {
			setTimeout(() => {
				this.allow_reshuffle = true
			}, 300)
			gem1.setPosition(pt1.x, pt1.y)
			gem2.setPosition(pt2.x, pt2.y)
		}
	}
	else {
		if (!(gem2.is_static())) {
			let field_item = this.field_items[item1['pos_y']][item1['pos_x']]
			if ((this.gems_utils.check_swap(item1, item2) ||  gem2.is_bonus()) && this.tutorial_manager.is_allowed({'item1': item1, 'item2': item2, 'type': 'swap'}) && !field_item.is_minor_big_bottom() && !field_item.is_major_big_bottom()) {
				
				this.field_items[item2['pos_y']][item2['pos_x']].remove_gem()
				if (gem2.is_bonus()) {
					this.uno_swap_bonus = true
					this.field_items[item1['pos_y']][item1['pos_x']].add_gem(gem2);
		
					gem2.move_swap(pt1, () => {
						setTimeout(() => {
							this.allow_reshuffle = true
							this.uno_swap_bonus = false
						}, 300)
						this.switched_gems.forEach(g => {
							if (g.is_switched())
								g.switch_gem()
						})
					}, false, gem1, true);
					
					
				}
				else {
					
					this.field_items[item1['pos_y']][item1['pos_x']].add_gem(gem2);
					gem2.move_swap(pt1, () => {
						this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'}); 
						setTimeout(() => {
							this.allow_reshuffle = true
						}, 300)
					}, false, null);	
		
				}	
				gem2.set_uno_swap(true)
				game_data["utils"].delayed_call(1000, () => {
					if (gem2)
						gem2.set_uno_swap(false)
				})						
				this.empty_field_items.push({
					pos_x: item2['pos_x'],
					pos_y: item2['pos_y'],
				})
				this.update_tutorial_iteration();
				this.gems_utils.reset_combo();	
				// this.check_reshuffle({'move': true});	
				this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
				let delay = 0
				if (gem2.is_bonus()) delay = 1000
				this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": delay});
			}
			else {
				setTimeout(() => {
					this.allow_reshuffle = true
				}, 300)
				gem2.move_fail(pt1, pt2);		
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bad_move'});
			}
		}
		else {
			setTimeout(() => {
				this.allow_reshuffle = true
			}, 300)
			gem1.setPosition(pt1.x, pt1.y)
			gem2.setPosition(pt2.x, pt2.y)
		}
	}
}


update_tutorial_iteration() {
	var _this = this;
	if (this.tutorial_manager.check_active()) {
		this.reset_hint();
		this.tutorial_manager.hide_tutorial();	
		if ('tutorial' in this.attr['timeouts'])				
				this.attr['timeouts']['tutorial'].destroy();

		this.attr['timeouts']['tutorial'] = game_data['utils'].delayed_call(500, function(){
			
			_this.wait_for_quiet(function(){
				_this.tutorial_manager.check_tutorial();
			});
		});
	}
	
}				


handler_remove_gem(params) {	
	this.check_remove_gem(params);
}

handler_remove_bonus_candidate(params) {
	this.check_remove_gem(params);
}

handler_remove_money(params) {
	var _this = this;
	var pos_x = params['pos_x'];
	var pos_y = params['pos_y'];
	var field_item = this.field_items[pos_y][pos_x];
	
	
	var gem = field_item.get_gem();
	gem.set_money_removing(true);
	gem.animate_disappear(function() {
		if (gem && gem.is_money_removing()) 
			_this.destroy_gem(params);
	});
	
}

check_remove_gem(obj) {	
	let pos_x = obj['pos_x'];
	let pos_y = obj['pos_y'];	
	let create_grass = obj['create_grass'];
	
	if (pos_y < this.field_items.length && pos_x < this.field_items[pos_y].length && this.field_items[pos_y][pos_x]) {
		let field_item = this.field_items[pos_y][pos_x];		
		let gem = field_item.get_gem();

		if (!field_item.check_obstacle_remove(obj['booster']) ) {
			
			if (create_grass && gem && !field_item.is_grass() && !field_item.is_tiled() && !field_item.is_blocked()) {
				this.create_grass(field_item)
			}
			// if (gem.get_type() == 'bonus' && gem.get_id() === 15) debugger
			if (gem && gem.get_type() == 'normal' && obj['collapsed']) {
				if (pos_x !== -1 && pos_y !== -1) { 
					this.remove_gem(obj);
				}
				if (!obj['bonus_type']) {
					this.empty_field_items.push(obj);
				}
				
			}		
			else if (gem && (gem.get_type() == 'normal' || gem.get_type() == 'mark' || (gem.get_type() == 'bonus' && ((gem.get_id() === 15 && !obj['plane']) || gem.get_id() !== 15 )) || gem.get_type() == 'passive' || (gem.is_embedded() && gem.attr['strength'] === 1))) {	
				if (gem.is_marked()) {
					let id = gem.get_id()
					if (id === 2)
						this.get_secret_prize(this.field_items[pos_y][pos_x])
					let type = gem.get_type()
					let res = this.targets_manager.update_target({'type': type, 'id': id, 'marked': type === 'mark'});
					if (res) {
						this.emitter.emit("EVENT", {
							'event': "UPDATE_PANEL", 
							...res
						});
					}
				}
				if (pos_x !== -1 && pos_y !== -1) { 
					
					this.remove_gem(obj);
				}
				this.empty_field_items.push(obj);	
			}
			else if (gem && gem.is_embedded() && gem.attr['strength'] > 1 && !field_item.is_blocked()) {
				--gem.attr['strength'];
				
				this.play_embedded_anim(gem)
			}
			else if (gem && gem.is_hog() && gem.attr['strength'] > 1 && !field_item.is_blocked()) {
				gem.attr['id'] = --gem.attr['strength'];
				let part1 = new Phaser.GameObjects.Image(this.scene, -17, 17, 'common1', 'gem_part' + 7)
				let part2 = new Phaser.GameObjects.Image(this.scene, 11, 17, 'common1', 'gem_part' + 7)
				part2.scaleX = -1
				gem.broke({imgs: [part1, part2]})
				gem.change_frame(`gem_booster${gem.attr['id']}`)
			}
			else if (gem && (gem.get_type() == 'bottom' || gem.get_type() == 'fireball')) {
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': (gem.is_fireball() ? 'fireball_complete' : 'bottom_complete')});
				if (pos_x !== -1 && pos_y !== -1) { 
					this.remove_gem(obj);
				}					
				this.empty_field_items.push(obj);
				
			}
			else if (gem && gem.is_big_bottom()) {
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': (gem.is_fireball() ? 'fireball_complete' : 'bottom_complete')});
				if (pos_x !== -1 && pos_y !== -1) { 
					this.remove_gem(obj);
				}	
				this.empty_field_items.push(obj);
				this.empty_field_items.push({pos_x: pos_x + 1, pos_y: pos_y});
				this.empty_field_items.push({pos_x: pos_x + 1, pos_y: pos_y - 1});
				this.empty_field_items.push({pos_x: pos_x, pos_y: pos_y - 1});
				this.field_items[pos_y - 1][pos_x].set_minor_big_bottom(false)
				this.field_items[pos_y - 1][pos_x].set_major_big_bottom(false)
				this.field_items[pos_y - 1][pos_x + 1].set_minor_big_bottom(false)
				this.field_items[pos_y - 1][pos_x + 1].set_major_big_bottom(false)
				this.field_items[pos_y ][pos_x + 1].set_minor_big_bottom(false)
				this.field_items[pos_y ][pos_x + 1].set_major_big_bottom(false)
			}
			else if (gem && gem.is_hog() && obj['booster'] && !field_item.is_blocked()) {
				if (pos_x !== -1 && pos_y !== -1) { 
					this.remove_gem(obj);
				}				
				
				this.empty_field_items.push(obj);
				this.allow_update_items = true;
			}	
			else if (gem && gem.is_rucksack() && !field_item.is_blocked()) {
				this.get_bag_prize(gem);
				if (!(gem.attr.strength > 0)) {
					this.empty_field_items.push({pos_x: gem.attr.pos_x, pos_y: gem.attr.pos_y});
					if (gem.attr.pos_x !== -1 && gem.attr.pos_y !== -1) { 
						this.remove_gem({pos_x: gem.attr.pos_x, pos_y: gem.attr.pos_y});
					}
					
				}
			}
			else if (gem && gem.is_switched() && gem.is_switch_opened() && !field_item.is_blocked()) {
				if (gem.attr.pos_x !== -1 && gem.attr.pos_y !== -1) { 
					this.remove_gem({pos_x: gem.attr.pos_x, pos_y: gem.attr.pos_y});
				}
				this.empty_field_items.push({pos_x: gem.attr.pos_x, pos_y: gem.attr.pos_y});
			}
			else if (gem && gem.is_extra_moves() && !field_item.is_blocked()) {
				let icon = gem.get_copy()
				
				this.move_extra_moves_gem({icon, pos_x, pos_y}, () => {
					this.add_extra_moves()
				})
				
				if (pos_x !== -1 && pos_y !== -1) { 
					this.remove_gem(obj);
				}	
				this.empty_field_items.push(obj);
				this.allow_update_items = true;
			}
			else if (gem && gem.is_chest() && !field_item.is_blocked()) {
				this.check_chest_prize(gem)
			}
			else if (!gem) {
				if (field_item.is_tiled())
					field_item.remove_tile();
			}	
		}
	}
}

remove_gem(obj) {
	var _this = this;
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];			
	var field_item = this.field_items[pos_y][pos_x];
	var gem = field_item.get_gem();
	var pt = field_item.get_center_pt();

	this.display_score(obj);

	if (field_item.is_tiled())
		field_item.remove_tile();

	if (field_item.is_blocked())
		field_item.explode_block();
	
	if (gem.get_type() == 'normal') {
		game_data['task_manager'].update_tasks({'type': 'gem'+String(gem.get_id()), 'amount':1});
		this.check_level_coin(pt);
	}
	
	if ((gem.get_type() == 'normal' || gem.get_type() == 'mark') && !('soft' in obj))
		this.check_neighbours(obj);

	if (obj['collapsed']) {
		_this.destroy_gem(obj);
		
	}
	else if (gem.get_type() == 'bottom' || gem.get_type() == 'fireball' || this.targets_manager.check_target_gem(gem)) {					
		this.move_target_gem({'gem': gem, 'pt': pt});
		if (gem.get_type() == 'bottom')
			this.show_bottom_particles({'pt': pt});
		this.destroy_gem(obj);						
	}
	else {				
		if (gem.get_type() == 'bonus') {		
			var bonus_id = gem.get_id();
			let swapped_id;
			let swapped_type;
			if (obj['swapped_gem'] && obj['swapped_gem'].get_id) {
				swapped_id = obj['swapped_gem'].get_id()
				swapped_type = obj['swapped_gem'].get_type()
			}
			
			this.gems_utils.candidates.forEach(el => {
				if (el && el.swapped_id && el.swapped_id != bonus_id) swapped_id = el.swapped_id;
			});
			if (bonus_id !== 15) this.destroy_gem(obj);
			this.bonus_manager.apply_bonus({'bonus': obj['bonus'], 'pos_x': pos_x, 'pos_y': pos_y, 'id': bonus_id, 'swapped_id': swapped_id, 'swapped_type': swapped_type, 'swapped_gem': obj['swapped_gem'], 'gem': gem, destroy_gem: () => {
				if (bonus_id === 15) this.destroy_gem(obj);
			}});
		}
		else {	
			if (obj['wave_config'] && obj['wave_config'].wave_destroy) {
				if (gem) {
					this.gem_disappear(gem, obj['wave_config'], () => {
						
					});
				}
				this.destroy_gem(obj);
			}
			else {
				//game_data['scene'].tweens.add({targets: gem, scaleX: 1.1, scaleY: 1.1, duration: 200, onComplete: function () {
					if (gem) _this.create_pieces({'pt': field_item.get_center_pt(), 
					'key': field_item.get_key(),
					'w': gem.width,
					'h': gem.height
				});
				_this.destroy_gem(obj);
				//}});  
			}
			
		}
	}
}

check_level_coin(pt) {
	var rnd = Math.random() * game_data['level_coins']['frequency'];
	if (this.level_id + 1 >= game_data['level_coins']['start_level'] && rnd < 1) {
		this.emitter.emit('EVENT', {'event': 'MOVE_MONEY_GEM', 'pt': pt});
	}
}

move_target_gem(obj) {
	
	var gem = obj['gem'];
	var pt = obj['pt'];
	//var gem_copy = game_data['utils'].copy_bitmap(gem.content.gem, gem.content);
	var gem_copy = gem.get_copy();
	var gem_shadow = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, 'common1', 'shadow_gem');//gem.get_copy();
	var res = this.targets_manager.update_target({'type': gem.get_type(), 'id': gem.get_id(), 'marked': gem.is_marked()});
	
	this.emitter.emit("EVENT", {
		'event': "MOVE_TARGET_GEM", 
		'type': gem.get_type(),
		'gem_copy': gem_copy, 
		'gem_shadow': gem_shadow,
		'pt': pt,
		'ind': res['ind'],
		'amount': res['amount']
	});
}		


move_gem_money(obj) {

	
}		

bonus_appear(gem, create_gem = () => {}) {
	create_gem();
	if (this && this.scene) {
		gem.setScale(0);

		this.scene.tweens.add({
			targets: gem, 
			delay: 0,
			duration: 100, 
			scale: {from: 0, to: 1.5},
			onComplete: () => {
				if (this && this.scene)
				this.scene.tweens.add({
					targets: gem, 
					duration: 100, 
					scale: 1,
					onUpdate: (a,b ,c) => {
						
					},
					onComplete: () => {
					}
				});
				else {
					gem.setScale(1);
				}
			},
		});
	}
}

destroy_gem(obj){
	var _this = this;
	var remove_delay = 300;
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];				
	this.allow_update_items = false;

	if (obj['collapsed']) {
		if ('bonus_type' in obj) {
			
			let gem = this.field_items[pos_y][pos_x].get_gem();
			gem.collapse_gem(gem.x, gem.y, [], () => {
				this.bonus_appear(gem, () => {
					
				});
			}, true);
			
			this.field_items[pos_y][pos_x].destroy_gem();
			gem = _this.create_gem({...obj, 'invulnerable': true}, true);
			gem.setScale(0);
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_create'});
		} else {
			
			let gem = this.field_items[pos_y][pos_x].remove_gem();
			let x, y;
			let abutting_gem = this.field_items[obj['target_gem_pos_y']][obj['target_gem_pos_x']].get_gem();
			if (abutting_gem) {
				x = abutting_gem.x;
				y = abutting_gem.y;
			}
			
			else {
				x = gem.x;
				y = gem.y;
			}
			if (this.field_items[pos_y-1] && this.field_items[pos_y-1][pos_x])
			this.field_items[pos_y-1][pos_x].set_freezed(true);

			gem.collapse_gem(x, y, [], () => {
				gem.destroy_gem();
				// gem.destroy(true);
				if (this.field_items[pos_y-1] && this.field_items[pos_y-1][pos_x])
				this.field_items[pos_y-1][pos_x].set_freezed(false);
				this.allow_update_items = true;
				
			});

			// this.field_items[pos_y][pos_x].destroy_gem();
		}


	} else {
		this.field_items[pos_y][pos_x].destroy_gem();

	setTimeout(() => {
		_this.allow_update_items = true;
		_this.attr['update_gems_position'] = true;
	}, remove_delay);
	}
}	


display_score(obj) {
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];			
	var gem = this.field_items[pos_y][pos_x].get_gem();
	var pt = this.field_items[pos_y][pos_x].get_center_pt();

	var score;
	var arr = game_data['score']['normal'];			
	var combo = this.gems_utils.get_combo_coef();
	if (combo < arr.length)
		score = arr[combo - 1];
	else
		score = arr[arr.length - 1];

	this.emitter.emit("EVENT", {'event': "SHOW_SCORE", 'pt': this.field_items[pos_y][pos_x].get_center_pt(), 'score': score});
}

check_neighbours(obj) {	
	var i;
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];
	var neighbours = [];
	var gem;
				
	
	if (pos_x > 0 && this.field_items[pos_y][pos_x - 1])
		neighbours.push(this.field_items[pos_y][pos_x - 1]);
	if (pos_y > 0 && this.field_items[pos_y - 1][pos_x])
		neighbours.push(this.field_items[pos_y - 1][pos_x]);
	if (pos_x < this.field_items[pos_y].length - 1 && this.field_items[pos_y][pos_x + 1])
		neighbours.push(this.field_items[pos_y][pos_x + 1]);
	if (pos_y < this.field_items.length - 1 && this.field_items[pos_y + 1][pos_x])
		neighbours.push(this.field_items[pos_y + 1][pos_x]);			
	
	for (i = 0; i < neighbours.length; i++) {
		gem = neighbours[i].get_gem();
		if (gem && gem.is_passive() && !neighbours[i].is_blocked()) {
			this.update_empty_field_items(gem.get_pos());
			this.remove_gem(gem.get_pos());
			
		}
		else {
			
			neighbours[i].explode_neighbour_block();
		}
				
	}
}		

handler_check_stability(params) {
	if (!this.check_stability(params))
		this.attr['update_gems_position'] = true;
}

handler_update_candidate(params) {
	this.gems_utils.update_candidates(params);
	this.reset_hint();
}		

check_stability(pos) {
	var pos_x = pos['pos_x'];
	var pos_y = pos['pos_y'];
	if (pos_x != -1 && pos_y != -1) {
		if (pos_y < this.field_items.length - 1 &&
			this.field_items[pos_y + 1][pos_x] &&
			this.field_items[pos_y + 1][pos_x].is_empty() &&
			!this.field_items[pos_y + 1][pos_x].is_freezed() &&
			!this.field_items[pos_y + 1][pos_x].is_extrusive())
			return false;
			
		if (pos_y < this.field_items.length - 1 && pos_x > 0 &&
			this.field_items[pos_y + 1][pos_x - 1] &&
			this.field_items[pos_y + 1][pos_x - 1].is_empty() &&
			!this.field_items[pos_y + 1][pos_x - 1].is_freezed() &&
			!this.field_items[pos_y + 1][pos_x - 1].is_extrusive())
			return false;

		if (pos_y < this.field_items.length - 1 && pos_x < this.field_items[pos_y].length - 1 &&
			this.field_items[pos_y + 1][pos_x + 1] &&
			this.field_items[pos_y + 1][pos_x + 1].is_empty() &&
			!this.field_items[pos_y + 1][pos_x + 1].is_freezed() &&
			!this.field_items[pos_y + 1][pos_x + 1].is_extrusive())
			return false;
	}
	return true;
}

handler_set_exploded_gems(params) {
	this.set_exploded_gems();
}

set_exploded_gems() {
	this.attr['update_gems_position'] = true;
}		
		
	
switch_allow_update_items(value = false) {
	this.allow_update_items = value;
}

create_gem(obj, is_nested = false){ 
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];
	var gem_info = this.gems_utils.get_gem_info(obj);
	gem_info['is_nested'] = is_nested;
	let gem;
	let recycled_gem = this.recycled_gems.splice(0, 1)[0];
	
	if (recycled_gem && recycled_gem.scene && recycled_gem.attr.pos_y !== pos_y && recycled_gem.attr.pos_x !== pos_x && gem_info['type'] === 'normal') {
		gem = recycled_gem;
		gem.visible = true;
	} else {
		gem = new Gem();
		gem.init();		
		gem.emitter.on('EVENT', this.handler_event, this);
	}
		
	gem.update_gem(gem_info);
	if (obj['invulnerable']) gem.set_invulnerable(true);

	this.field_items[pos_y][pos_x].add_gem(gem);
	///////////////////
	var pt = this.field_items[pos_y][pos_x].get_target_gem_pt();	
	var dy = is_nested ? 0 : game_data['dim']['item_height'];
	gem.x = pt.x;
	gem.y = pt.y - dy;	
	this.gems_holder.add(gem);

	return gem;
}

			

get_top_cell(obj) {
	
	var pos_x = obj['pos_x'];
	var pos_y = obj['pos_y'];
	for (var i = pos_y; i >= 0; i--)								
		if (i == 0 || this.field_items[i - 1][pos_x] == null)
			return {'pos_y': i, 'pos_x': pos_x};
			
	return obj;								
	
}		

update_fall_delay(obj, gem) {
	var fall_timeout = 200;
	var pos_y = obj['pos_y'];
	var pos_x = obj['pos_x'];
	var delay;
	var time = game_data['utils'].get_time();
	
	if (!(pos_y in this.attr['fall_map']))
		this.attr['fall_map'][pos_y] = {};
	if (pos_x in this.attr['fall_map'][pos_y] && (time - this.attr['fall_map'][pos_y][pos_x] < fall_timeout)) {
		delay = fall_timeout - (time - this.attr['fall_map'][pos_y][pos_x]);				
	}
	else 
		delay = 0;
				
	this.attr['fall_map'][pos_y][pos_x] = time + delay;
	gem.update_fall_delay(delay);
}		
update_gems_position() {
	// if (game_data['allow_create_gems']) {
	// 	var pos_x;
	// 	var pos_y;			
	// 	for (pos_y = 0; pos_y < this.field_items.length; pos_y++)
	// 		for (pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++)
	// 			if (this.field_items[pos_y][pos_x] && 						
	// 				this.field_items[pos_y][pos_x].is_empty() &&
	// 				!this.field_items[pos_y][pos_x].is_freezed() &&
	// 				!this.field_items[pos_y][pos_x].is_extrusive()) {
	// 				this.create_falling_gem({'pos_x': pos_x, 'pos_y': pos_y});
	// 			}
				
	// 	this.start_falling_gems();
	// 	this.attr['update_gems_position'] = false;	
	// }
}

pointer_is_down() {
	return (this.attr['down_info'] && Object.keys(this.attr['down_info']).length !== 0);
}

is_ready_reshuffle() {
	return this.empty_field_items.every(({ pos_y, pos_x }) => this.is_deep_empty({ pos_y, pos_x }))
}

check_reshuffle(params = {}) {
	let condition = false;
	let event = game_data['utils'].delayed_call(100, () => {
		// console.log(this.bonus_manager.is_bonus_playing())
		
		// let dynamic = this.gems_holder.list.find(g => (g && g.is_dynamical && g.is_dynamical()));
		// console.log(this.allow_reshuffle)
		if (this.is_ready_reshuffle() && !this.bonus_manager.is_bonus_playing() && this.allow_reshuffle && this.check_no_activity() && !this.tutorial_manager.check_active() && this.attr['level_active'] && 
		!this.attr['moves_blocked'] && !this.allow_update_items &&  !this.pointer_is_down() && !this.gems_holder.list.find(g => (g && g.is_dynamical && g.is_dynamical()))) {
			this.wait_for_quiet(() => {
				if (this.is_ready_reshuffle() && !this.bonus_manager.is_bonus_playing() && this.allow_reshuffle) {
					var pair = this.gems_utils.get_hint_pair();
					if (pair.length == 0)				
					{
						this.bonus_manager.shuffle_gems();
					}
				}
				// var pair = this.gems_utils.get_hint_pair();
				// if (pair.length == 0)				
				// this.bonus_manager.shuffle_gems();
				// if (params['level_start'] || params['move'] || params['pointer_up'] || params['booster_click'] || params['falling'])	
				// condition = this.gems_utils.get_hint_pair().length === 0;	
				// else condition = true;	
				// if (this.pointer_is_down()) condition = true;	
				this.allow_update_items = true;
			});
		}	
		
		if (this.attr['level_active'])
		this.check_reshuffle();
	}, [], this);	

}		

apply_post_level_candies(on_complete) {
	var _this = this;
	var on_field = this.bonus_manager.get_bonuses()['items'].length;
	var max_candies = 5 - on_field;
	var num_to_explode;
	if (max_candies < 1) max_candies = 1;
	num_to_explode = max_candies + on_field;

	if (this.level['possible_bonus'].length > 0) {
		this.block_moves();
		this.bonus_manager.apply_candy(max_candies, true, function(){
			_this.attr['timeouts']['post_level1'] = setTimeout(function(){
				_this.bonus_manager.explode_bonuses(num_to_explode, function(){
					_this.attr['timeouts']['post_level2'] = setTimeout(function(){
						//_this.wait_for_quiet(on_complete); 
						_this.block_moves();
						setTimeout(() => {
							on_complete();
						}, 1000);
					}, 1000);											  
				}); 						   					   
			}, 500);
		});
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'post_level_show'});
	}
	else {
		on_complete();
	}

}

reset_hint() {	
	this.hide_hint();
	this.reset_gems_shake();
	this.show_hint();
}

reset_gems_shake() {
	this.field_items.forEach(y=> {
		y.forEach(x => x ? x.remove_shake() : null);
	});
}

hide_hint() {
	// this.hint_arrows.visible = false;
	if ('hint_appear_timeout_id' in this.attr['timeouts'] && this.attr['timeouts']['hint_appear_timeout_id'])
		this.attr['timeouts']['hint_appear_timeout_id'].destroy();
	if (this.gems)
		this.gems.forEach(gem => {
			gem.stop_hint()
		})
}		

show_hint() {
	
	var _this = this;

	var delay = game_data['hint_delay'];
	if (this.level_id == 0) delay = 3100;
	else if (this.level_id == 1) delay = 3500;
	else if (this.level_id == 2) delay = 4000;
	else if (this.level_id == 3) delay = 5000;
	
	
	this.attr['timeouts']['hint_appear_timeout_id'] = game_data['utils'].delayed_call(delay, function(){
		if (!_this.tutorial_manager.check_active() && !game_data['game_tutorial'].has_tutorial && !_this.attr['moves_blocked']) {
			var pair = _this.gems_utils.get_hint_pair();
			
			if (_this.attr['level_active'] && pair.length > 0 && !_this.attr['moves_blocked']) {
				// _this.display_hint(pair);	
				_this.display_hint(pair[4])	
				
			}
					
		}				   
	});
}
	
display_hint(holes) {
	
	if (holes) {
		let field_items = game_data['game_engine']?.['playing_field']?.field_items 
		let filtered = holes.filter(({type}) => ['1', '2'].includes(type))
		let move_from = holes.find(({type}) => ['2'].includes(type))
		let move_to = holes.find(({type}) => ['3'].includes(type))
		let direction = null
		
		if (move_from && move_to) {
			move_from['pos_y']
			move_from['pos_x']
			move_to['pos_y']
			move_to['pos_x']
			if (move_to['pos_y'] > move_from['pos_y']) {
				direction = 'down'
			}
			else if (move_to['pos_y'] < move_from['pos_y']) {
				direction = 'up'
				
			}
			else if (move_to['pos_x'] < move_from['pos_x']) {
				direction = 'left'
				
			}
			else if (move_to['pos_x'] > move_from['pos_x']) {
				direction = 'right'
				
			}
			
		}
		this.gems = []
		filtered.forEach(({pos_x, pos_y, type}) => {
			let field_item = field_items?.[pos_y]?.[pos_x]
			if (field_item) {
				let gem = field_item.get_gem()
				if (gem) {
					this.gems.push(gem)
					
					gem.show_hint(type, direction, (gem.get_id() === 15 && gem.is_bonus()))
				}
			}
		})
		// this.gems.forEach(gem => gem.show_hint())
	}
	
}

// display_hint(pair) {	
// 	var pt1 = this.field_items[pair[0]['pos_y']][pair[0]['pos_x']].get_center_pt();
// 	var pt2 = this.field_items[pair[1]['pos_y']][pair[1]['pos_x']].get_center_pt();
// 	var pt = game_data['utils'].toLocal(this.hint_holder, new Phaser.Geom.Point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2));
// 	let gem1 = this.field_items[pair[0]['pos_y']][pair[0]['pos_x']].get_gem();
// 	let gem2 = this.field_items[pair[1]['pos_y']][pair[1]['pos_x']].get_gem();
		
// 	this.hint_arrows.x = pt.x;
// 	this.hint_arrows.y = pt.y;
// 	this.hint_holder.add(this.hint_arrows);
// 	this.hint_arrows.visible = true;
// 	this.hint_arrows.alpha = 0;
// 	this.hint_arrows.angle = 0;
// 	this.hint_arrows.setScale(0);

// 	game_data['scene'].tweens.add({targets: this.hint_arrows, alpha: 1, duration: 500});		
// 	this.rotate_hint_arrows(pt, gem1, gem2, 3);
// 	gem1.add_shake();
// 	gem2.add_shake();
// }


rotate_hint_arrows(pt, gem1, gem2, ind) {
	var _this = this;
	game_data['scene'].tweens.add({targets: _this.hint_arrows, angle: 120, scaleX: 1.15, scaleY: 1.15, duration: 300, onComplete: function () { 
		if (_this.hint_arrows.visible) {
			game_data['scene'].tweens.add({targets: _this.hint_arrows, angle: 240, scaleX: 0.85, scaleY: 0.85, duration: 300, onComplete: function () { 
				if (_this.hint_arrows.visible) {
					game_data['scene'].tweens.add({targets: _this.hint_arrows, angle: 0, scaleX: 1, scaleY: 1, duration: 300, onComplete: function () { 
						if (_this.hint_arrows.visible && ind > 0) {
							_this.rotate_hint_arrows(pt, gem1, gem2, ind - 1) 
						}
						else {
							_this.hint_arrows.visible = false;	
							_this.reset_hint();
						}
					}});		
				}
			}});			
		}
	}});
}


wait_for_quiet(on_complete) {
	var _this = this;
	this.attr['timeouts']['wait_for_quiet'] = game_data['utils'].delayed_call(200, function(){
		if (_this.check_no_activity() &&  game_data['allow_wait_for_quiet'])
			on_complete();
		else if (_this.attr['level_active'])
			_this.wait_for_quiet(on_complete);					   
	});
}		

check_no_activity() {	
	var pos_x;
	var pos_y;
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
			if (this.field_items[pos_y][pos_x] && (this.field_items[pos_y][pos_x].is_dynamical() || this.field_items[pos_y][pos_x].is_freezed()))
				return false;				
		}
	}			
	return true;
}		

handler_create_bonus_gem(params) {
	
	var pos_x = params['pos_x'];
	var pos_y = params['pos_y'];
	this.field_items[pos_y][pos_x].destroy_gem();
	
	this.field_items[pos_y][pos_x].show_candy_light();			
	this.create_gem(params, true);			
}	

handler_mouse_move(pointer){
	if ('active' in this.attr['down_info'] && this.attr['down_info']['active'] && 'gem' in this.attr['down_info'] && !this.attr['moves_blocked']) {
		var gem = this.attr['down_info']['gem'];		
		var pt_global = new Phaser.Geom.Point(pointer['worldX'], pointer['worldY']);		
		var pt_start = game_data['utils'].toLocal(this.gems_holder, this.attr['down_info']['pt']);
		var pos = gem.get_pos();


			if ('pos_x' in pos && 'pos_y' in pos && pos['pos_x'] >=0 && pos['pos_y'] >= 0) {
				var pos_x = pos['pos_x'];
				var pos_y = pos['pos_y'];

				var pt = game_data['utils'].toLocal(this.gems_holder, pt_global);
				var pt_gem = this.field_items[pos_y][pos_x].get_target_gem_pt();
				var dx = (pt.x - pt_start.x);
				var dy = (pt.y - pt_start.y);

				if (Math.abs(dx) < game_data['dim']['item_width'] / 2 && Math.abs(dy) < game_data['dim']['item_height'] / 2) {
					if (Math.abs(dx) > Math.abs(dy)) {					
						gem.x = pt_gem.x + dx;
						gem.y = pt_gem.y;
					}
					else {
						gem.x = pt_gem.x;
						gem.y = pt_gem.y + dy;					
					}		
				}
				else if (Math.abs(dx) >= game_data['dim']['item_width'] / 2) {
					gem.set_down(false);
					if (dx > 0) { 
						if (pos_y < this.field_items.length && pos_x < this.field_items[pos_y].length - 1
							&& this.field_items[pos_y][pos_x + 1] && !this.field_items[pos_y][pos_x + 1].is_locked()) {
							this.item_down(!this.field_items[pos_y][pos_x + 1].is_empty() ? this.field_items[pos_y][pos_x + 1].get_gem() : {pos_y: pos_y, pos_x: pos_x + 1});
						}
						else {
							
							this.item_up();
						}
					}
					else {						
						if (pos_x > 0 && this.field_items[pos_y][pos_x - 1] && !this.field_items[pos_y][pos_x - 1].is_locked()) {							
							this.item_down(!this.field_items[pos_y][pos_x - 1].is_empty() ? this.field_items[pos_y][pos_x - 1].get_gem() : {pos_y: pos_y, pos_x: pos_x - 1});
						}
						else {		
											
							this.item_up();	
						}
					}
				}
				else if (Math.abs(dy) >= game_data['dim']['item_height'] / 2){	
					gem.set_down(false);

					if (dy > 0) {
						if (pos_y < this.field_items.length - 1 && this.field_items[pos_y + 1][pos_x] && !this.field_items[pos_y + 1][pos_x].is_locked()) {
							this.item_down(!this.field_items[pos_y + 1][pos_x].is_empty() ? this.field_items[pos_y + 1][pos_x].get_gem() : {pos_y: pos_y + 1, pos_x: pos_x});
						}
						else {
							
							this.item_up();
						}
					}
					else {
						if (pos_y > 0 && this.field_items[pos_y - 1][pos_x] && this.field_items[pos_y - 1][pos_x] && !this.field_items[pos_y - 1][pos_x].is_locked()) {
							this.item_down(!this.field_items[pos_y - 1][pos_x].is_empty() ? this.field_items[pos_y - 1][pos_x].get_gem() : {pos_y: pos_y - 1, pos_x: pos_x});
						}
						else {		
												
							this.item_up();
						}
					}					
				}
			}
	}

}


handler_mouse_up(pointer){
	if (navigator.onLine || is_localhost) {
		if (game_data['game_play'].attr.state) {
			
			if (this.active_booster['current_item'] && game_data['game_play'].attr.booster_id) {
				
				let duration = 0
				let current_item = this.active_booster['current_item'];
				let pos_x = current_item['pos_x']
				let pos_y = current_item['pos_y']
				let create_grass = this.field_items[pos_y][pos_x].is_grass()
				let pt = current_item.get_center_pt();
				this.prepare_booster({'booster_id': game_data['game_play'].attr.booster_id, pos_x: current_item['pos_x'], pos_y: current_item['pos_y']});
	
					this.emitter.emit('EVENT', {'event': 'APPLY_BOOSTER', 'booster_id': game_data['game_play'].attr.booster_id, 'pt': pt, pos_x, pos_y, create_grass, 'items': [...this.active_booster['items']]});
					if (game_data['game_play'].attr.booster_id === 'magnet') duration = 1300
					setTimeout(() => {
						game_data['game_play'].attr.state = false;
					
						this.active_booster = {};
						game_data['game_play'].rt.destroy();
						game_data['utils'].hide_booster_info();
						
						if (game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id]) {
							game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id].state_particle.destroy();
							game_data['game_play'].game_engine.playing_field.boosters_panel.boosters[game_data['game_play'].attr.booster_id].attr.state = false;
						}
						
						game_data['game_play'].attr.booster_id = null;
					}, duration)
					
			}
			
				
		}
		else if (game_data['game_play'].attr.field_state) {
			
			let current_item =  this.active_booster['current_item']
			
			if (!current_item || (current_item['pos_x'] === game_data['game_play'].attr['field_pos_x'] && current_item['pos_y'] === game_data['game_play'].attr['field_pos_y']) || current_item.is_blocked() || current_item.is_locked()) {
				this.emitter.emit('EVENT', {'event': 'SET_BOOSTER_HOLES', 'state': false});
				this.attr['down_info'] = {};
				if (this.selected_gem)
					this.selected_gem.switch_state();
				
			}
			else {
				let cur_pos_x = current_item['pos_x']
				let cur_pos_y = current_item['pos_y']
				let current_gem = current_item.get_gem()
				let res = game_data['game_play'].attr.target_fields.find(({pos_x, pos_y}) => (cur_pos_x === pos_x && cur_pos_y === pos_y))
				
				if (res && (current_gem && (current_gem.is_normal() || current_gem.is_bonus()))) {
					this.remove_booster({pos_x: game_data['game_play'].attr['field_pos_x'], pos_y: game_data['game_play'].attr['field_pos_y'], gem:this.field_items[res['pos_y']][res['pos_x']].get_gem(), bonus:this.field_items[res['pos_y']][res['pos_x']].is_bonus(), id: this.field_items[res['pos_y']][res['pos_x']].get_gem_id()});
					this.emitter.emit('EVENT', {'event': 'SET_BOOSTER_HOLES', 'state': false});
					
				}
				else {
					this.emitter.emit('EVENT', {'event': 'SET_BOOSTER_HOLES', 'state': false});
					this.attr['down_info'] = {};
					if (this.selected_gem)
						this.selected_gem.switch_state();
				}
			}
			this.active_booster['current_item'] = null
			
		}
		else if ('active' in this.attr['down_info'] && this.attr['down_info']['active']) {
			
			this.item_up();
		}
		
		game_data['pressed_booster'] = ''; //для бага с бустерами
	}
	else if (game_data.current_scene === 'GAMEPLAY' && !game_data['no_connection_showed']) {
		game_data['no_connection_showed'] = true
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'no_connection'});
	}
}

remove_booster({pos_x, pos_y, id, bonus, gem}) {
	let passed_amount = get_passed_amount()
	if (isNaN(pos_x) || isNaN(pos_y) || pos_x === undefined || pos_y === undefined) {
		pos_x = this.selected_gem.attr['pos_x'];
		pos_y = this.selected_gem.attr['pos_y'];
		
	} 
	let sec_gem = this.check_combo_bonus({pos_x, pos_y}); // потенциональная комбинация
	
	if (bonus && passed_amount >= game_data['allow_combine']) {
		this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
		this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": 1000});
			
			this.create_combo_bonus(game_data.game_play.attr.gem, gem, () => {
			
			this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'}); 

		});
	}
	else if (!bonus && gem && gem.is_normal()) {
		
		this.handler_remove_gem({'pos_x': pos_x, 'pos_y': pos_y, 'id': id});
	}
	else if (passed_amount >= game_data['allow_combine'] && (!bonus && sec_gem )) {
		
		this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
		this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": 1000});
			
		this.create_combo_bonus(this.selected_gem, sec_gem, () => {
		
		this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'}); 

	});
	}
	else {
		this.emitter.emit('EVENT', {'event': "UPDATE_MOVES"});
		this.emitter.emit('EVENT', {'event': "UPDATE_REPRO", "delay": 1000});
		this.emitter.emit('EVENT', {'event': 'CHECK_NO_MOVES'}); 
		this.handler_remove_gem({'pos_x': pos_x, 'pos_y': pos_y, 'id': id});
	}
}

prepare_booster({pos_x, pos_y, booster_id}) {
	let gem;
	switch (booster_id) {
		case 'booster1':
			if (this.field_items[pos_y][pos_x].is_hammer_applicable()) {
				this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
				this.active_booster['items'] = [this.field_items[pos_y][pos_x]];
				
				if (this.big_bonus_radius) {
					
					this.active_booster['items'] = this.enlarge_bonus_items(this.active_booster['items'], pos_x, pos_y);
					this.active_booster['items'] = this.active_booster['items'].filter(i => {
						if (i && i.is_hammer_applicable()) {
							return i;
						} else return false;
					});
					
					
				}

			}
		break;
		case 'booster2':
			if (this.field_items[pos_y][pos_x].is_broom_applicable()) {
				this.active_booster['current_item'] = this.field_items[pos_y][pos_x];					
				this.active_booster['items'] = [this.field_items[pos_y][pos_x]];
				if (this.big_bonus_radius) {
					this.active_booster['items'] =  this.enlarge_bonus_items(this.active_booster['items'], pos_x, pos_y);

					this.active_booster['items'] = this.active_booster['items'].filter(i => {
						if (i && i.is_broom_applicable()) {
							return i;
						} else return false;
					});
					
				}
				
			}
		break;
		case 'booster4':
					this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
					
					gem = this.field_items[pos_y][pos_x].get_gem();
					var gem_id = gem.get_id();
					var gem_type = gem.get_type();
					this.active_booster['items'] = [];
					for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
						for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
							if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].get_gem_id() == gem_id && gem_type === this.field_items[pos_y][pos_x].get_gem_type()) {
								this.active_booster['items'].push(this.field_items[pos_y][pos_x]);
							}
						}
					}
		break;
		case 'booster6':
				this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
				gem = this.field_items[pos_y][pos_x].get_gem();
				if (gem) {
					var gem_pos_x = gem.get_pos();
					this.active_booster['items'] = [];
	
					let arr = [...this.field_items[pos_y]].filter(elem => elem);
					this.field_items.forEach(by_y => {
						if (by_y) {
							let arr2 = by_y.filter(by_x => by_x && by_x.pos_x === gem_pos_x.pos_x);
							arr = [...arr, ...arr2];
						}
					});
					this.active_booster['items'] = [...arr];
				}
			break;
	}
	
}


item_up() {
	if (this && this.selected_gem && this.selected_gem.is_down()) {
		var pos = this.selected_gem.get_pos();
		if (this && pos['pos_x'] >= 0 && pos['pos_y'] >= 0 && this.field_items[pos['pos_y']] && this.field_items[pos['pos_y']][pos['pos_x']]) {
			var pt_gem = this.field_items[pos['pos_y']][pos['pos_x']].get_target_gem_pt();
			this.selected_gem.x = pt_gem.x;
			this.selected_gem.y = pt_gem.y;		
			this.selected_gem.set_down(false);	
		}
		this.attr['down_info'] = {};
		// if (!this.allow_update_items)
		// this.check_reshuffle({'pointer_up': true});
	}
	
}

handler_item_down(params) {	
	if (this) {
		this.attr['down_info'] = {'active': false, 'pt': params['pt'], 'gem': params['gem']};	
		var gem = params['gem'];
		gem.set_down(true);
		this.item_down(gem);
	}
	
}

item_down(gem) {
	let empty = !gem.get_pos
	var pos = !empty ? gem.get_pos() : gem;
	var pos_x = pos['pos_x'];
	var pos_y = pos['pos_y'];
	

	if (pos_x >= 0 && pos_y >= 0 && this.field_items[pos_y] && this.field_items[pos_y][pos_x])
		this.field_items[pos_y][pos_x].handler_item_down();

	if (pos_x >= 0 && pos_y >= 0 && (!empty ? !gem.is_dynamical() : true) && this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_intblocked() && !this.attr['moves_blocked']) {			
		this.attr['down_info']['active'] = true;
		
		if (this.selected_gem && !this.selected_gem.is_dynamical() && this.gems_utils.neighbours(gem, this.selected_gem)) {			
			this.swap_items(gem, this.selected_gem);								
			this.selected_gem.hide_selection();				
			this.selected_gem = null;
			this.attr['down_info'] = {};	
		}
		else {						
			if (this.selected_gem)
				this.selected_gem.hide_selection();

			if (!empty) {
				gem.show_selection();
				this.selected_gem = gem;
				this.selected_gem.set_down(true);	
			}
					
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'gem_click'});


		}
	}

	this.reset_hint();
}

add_web_shake() {
	var pos_x;
	var pos_y;
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
			if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_broom_applicable()) {
				this.field_items[pos_y][pos_x].add_shake();
				
			}
					
		}
	}			
	return true;
}

remove_web_shake() {
	var pos_x;
	var pos_y;
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
			if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_broom_applicable())
					this.field_items[pos_y][pos_x].remove_shake();
		}
	}			
	return true;
}



remove_shakes() {
	var pos_x;
	var pos_y;
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
			if (this.field_items[pos_y][pos_x])
					this.field_items[pos_y][pos_x].remove_shake();
		}
	}			
	return true;


}

booster_click(params) {
	let booster_id = params['booster_id']
	let create_grass = params['create_grass']
	if (!this.attr['moves_blocked']) {
		this.reset_hint();
			
			if (params['items'].length > 0) {
				if (booster_id !== 'cross')
				this.bonus_manager.remove_iteration_items(params['items'], null, null, create_grass);
				else {
					let {pos_x, pos_y} = params
					this.bonus_manager.apply_bonus_rockets({ pos_x, pos_y, create_grass});
				}
				this.emitter.emit('EVENT', {'event': 'BOOSTER_USED', 'booster_id': params['booster_id']});
				game_data['game_play'].attr.state = false;		
			}
	}
}

finish_tutorial() {
	this.reset_hint();
}

block_moves() {
	
	this.attr['moves_blocked'] = true;
	
}

unblock_moves() {
	
	this.attr['moves_blocked'] = false;
	
}

handler_bonus_used(event) {

}

show_bottom_particles(obj) {
				
}

handler_star_stopped(event) {

}		

booster_drag_start(params) {
	this.active_booster = {'booster_id': params['booster_id'], 'items': [], 'active': true};
	this.update_tutorial_iteration();
}

booster_drag_end(params) {

	if ('items' in this.active_booster && this.active_booster['items'].length > 0) {
		var current_item = this.active_booster['current_item'];
		var pt = current_item.get_center_pt();
		this.emitter.emit('EVENT', {'event': 'APPLY_BOOSTER', 'booster_id': params['booster_id'], 'pt': pt});
	
	}
	else {
		this.emitter.emit('EVENT', {'event': 'RETURN_BOOSTER', 'booster_id': params['booster_id']});
	}


	this.remove_shakes();
	this.active_booster['active'] = false;
}


handler_event(params) {
	switch (params['event']) {

		case 'ITEM_DOWN':
			this.handler_item_down(params);
    	break;
		case 'ITEM_UP':
			this.handler_item_up(params);
			break;
		case 'ITEM_MOVE':
			this.handler_item_move(params);
    	break;			
		case 'UPDATE_CANDIDATE':
			this.handler_update_candidate(params);
    	break;
		case 'CHECK_STABILITY':
			this.handler_check_stability(params);
		break;
		case 'NEW_GEM_STOPPED':
			this.handler_new_gem_stopped(params);
		break;
		case 'GEM_OVER':
			this.handler_item_over(params);
		break;
		case 'GEM_OUT':
			this.handler_item_out(params);
		break;		

		case 'REMOVE_MONEY':
			this.handler_remove_money(params);
    	break;
		case 'CREATE_BONUS_GEM':
			this.handler_create_bonus_gem(params);
    	break;
    	case 'REMOVE_GEM':
			this.handler_remove_gem(params);
		break;
		case 'REMOVE_BONUS_CANDIDATE':
			this.handler_remove_bonus_candidate(params);
    	break;
    	case 'SET_EXPLODED_GEMS':
			this.handler_set_exploded_gems(params);
    	break;
    	case 'UNSET_CURSOR':
			this.handler_unset_cursor(params);
		break;
	  case 'BONUS_USED':
	  		this.handler_bonus_used(params);
		break;			  
	  case 'UPDATE_GEMS_POSITION':
	  		this.update_gems_position(params);
		break;			  
	  case 'DISPLAY_FADE':
	  		this.handler_display_fade(params);
		break;	
		case 'STOP_FALL':
			this.handler_stop_fall(params)
		break;
		case 'SWITCH_BONUS_BLOCK':
			this.switch_bonus_block();
			break;
		case 'CHECK_RESHUFFLE':
			let type = params['type'];
			if (type === 'falling')
			this.check_reshuffle({ 'falling': true});
			break;
		default:
		  this.emitter.emit('EVENT', params);
		break;
	}
}

update_empty_field_items(item) {
	this.empty_field_items.push(item);
	this.allow_update_items = true;
	// this.allow_reshuffle = true
	// setTimeout(() => {
	// 	this.allow_reshuffle = false
	// }, 100)
}

switch_bonus_block() {
	this.bonus_block_update = !this.bonus_block_update;
}

handler_stop_fall(params) {
	// if (this.check_no_activity()) {
	// 	this.check_reshuffle(params);
	// }
	this.allow_update_items = true;
}

field_item_exists(params){
	return game_data['game_engine']['playing_field']['field_items_manager'].is_exists({...params});
}

enlarge_bonus_items(items, pos_x, pos_y) {
	items = [
		...items,
		this.field_item_exists({'pos_x': pos_x - 1, 'pos_y': pos_y - 1}),
		this.field_item_exists({'pos_x': pos_x, 'pos_y': pos_y - 1}),
		this.field_item_exists({'pos_x': pos_x + 1, 'pos_y': pos_y - 1}),
		this.field_item_exists({'pos_x': pos_x - 1, 'pos_y': pos_y}),
		this.field_item_exists({'pos_x': pos_x + 1, 'pos_y': pos_y}),
		this.field_item_exists({'pos_x': pos_x - 1, 'pos_y': pos_y + 1}),
		this.field_item_exists({'pos_x': pos_x, 'pos_y': pos_y + 1}),
		this.field_item_exists({'pos_x': pos_x + 1, 'pos_y': pos_y + 1}),
	];

	

	return items;
}

handler_item_over(params) {
	if (game_data['game_play'].attr.state) {
		switch (game_data['game_play'].attr.booster_id) {
			case 'booster1':
				var pos_x = params['pos_x'];
				var pos_y = params['pos_y'];
				if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_hammer_applicable()) {
					this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
					this.active_booster['items'] = [this.field_items[pos_y][pos_x]];
					if (this.big_bonus_radius) {
						this.active_booster['items'] = this.enlarge_bonus_items(this.active_booster['items'], pos_x, pos_y);
						this.active_booster['items'] = this.active_booster['items'].filter(i => {
							if (i && i.is_hammer_applicable()) {
								return i;
							} else return false;
						});
						
						
					}

				}
			break;
			case 'booster2':
				var pos_x = params['pos_x'];
				var pos_y = params['pos_y'];
				if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_broom_applicable()) {
					this.active_booster['current_item'] = this.field_items[pos_y][pos_x];					
					this.active_booster['items'] = [this.field_items[pos_y][pos_x]];
					if (this.big_bonus_radius) {
						this.active_booster['items'] =  this.enlarge_bonus_items(this.active_booster['items'], pos_x, pos_y);

						this.active_booster['items'] = this.active_booster['items'].filter(i => {
							if (i && i.is_broom_applicable()) {
								return i;
							} else return false;
						});
						
					}
					
				}
			break;
			case 'booster4':
					if ('gem' in params) {
						let pos_x = params['pos_x'];
						let pos_y = params['pos_y'];
						if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_magnet_applicable()) {
							this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
						
							let gem_id = params['gem'].get_id();
							let gem_type = params['gem'].get_type();
							this.active_booster['items'] = [];
							for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
								for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
									if (this.field_items[pos_y][pos_x] && (this.field_items[pos_y][pos_x].get_gem_id() == gem_id) && (gem_type === this.field_items[pos_y][pos_x].get_gem_type())) {
										this.active_booster['items'].push(this.field_items[pos_y][pos_x]);
									}
								}
							}
						}
						
					}			


			break;
			case 'booster6':
				if ('gem' in params) {
					let pos_x = params['pos_x'];
					let pos_y = params['pos_y'];
					if (this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_cross_applicable()) {
						this.active_booster['current_item'] = this.field_items[pos_y][pos_x];

						let gem_pos_x = params['gem'].get_pos();
						
						this.active_booster['items'] = [];

						let arr = [...this.field_items[pos_y]].filter(elem => elem);
						this.field_items.forEach(by_y => {
							if (by_y) {
								let arr2 = by_y.filter(by_x => by_x && by_x.pos_x === gem_pos_x.pos_x);
								arr = [...arr, ...arr2];
							}
						});
						this.active_booster['items'] = [...arr];
					}
					

				}	
				break;
		}
}
else if (game_data['game_play'].attr.field_state) {
	let pos_x = params['pos_x'];
	let pos_y = params['pos_y'];
	this.active_booster['current_item'] = this.field_items[pos_y][pos_x];
}

	// this.check_atachment(params)
}


handler_item_out(params) {
	// if (this.active_booster['active']) {
	// 	this.active_booster['items'] = [];
	// 	if ('pos_x' in params && 'pos_y' in params) {
	// 		var pos_x = params['pos_x'];
	// 		var pos_y = params['pos_y'];
	// 		if (this.field_items[pos_y] && this.field_items[pos_y][pos_x])		
	// 			this.field_items[pos_y][pos_x].remove_shake();
	// 	}
	// }
	if (game_data['game_play'].attr.state) {
		this.active_booster['items'] = [];
		this.active_booster['current_item'] = null;
	}
}


handler_display_fade(params) {
	var time_swap = 200;
	var pt = params['pt'];
	var key = params['key'];

	var fade = new Phaser.GameObjects.Image(game_data['scene'], pt.x, pt.y, "common1", key);
	fade.setOrigin(0.5, 0.5);
	fade.alpha = 0.6;

	this.gems_holder.add(fade);	

	this.scene.tweens.add({targets: fade, alpha: 0, duration: time_swap, onComplete: function () {
		fade.destroy();
	}});
}

remove_shakes() {
	var pos_x;
	var pos_y;
	for (pos_y = 0; pos_y < this.field_items.length; pos_y++) {
		for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++) {				
			if (this.field_items[pos_y][pos_x])
					this.field_items[pos_y][pos_x].remove_shake();
		}
	}			
	return true;
}


handler_new_gem_stopped(params) {	
	this.gems_holder.add(params['gem']);
}

clean_attr() {	
	this.attr['hint_appear_timeout_id'] = -1;
	this.attr['hint_disappear_timeout_id'] = -1;			
	this.attr['fall_map'] = {'items': [], 'map': {}};
	this.attr['moves_blocked'] = true;
	this.attr['level_active'] = false;
	this.attr['update_gems_position'] = false;
	this.attr['timeouts'] = {};
	this.attr['hint_appear_timeout_id'] = null;
	this.attr['down_info'] = {};
	
}


destroy_level() {	
	this.timer_empty_field_items.paused = true
	this.hide_hint();				
	this.clean_attr();
	// this.empty_field_items = [];
	this.gems_utils.destroy_level();
	this.bonus_manager.destroy_level();
}		

}