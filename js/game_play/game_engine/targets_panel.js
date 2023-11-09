var TargetsPanel = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function TargetsPanel (scene)
	{
		
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
	},

	init(params) {
		game_data['error_history'].push('gptp1');
		this.moving_holder = params['moving_holder'];        
		this.spine_holder = params['spine_holder'];
		//this.targets_x = [270, 440, 610];
		//this.targets_y = [0, 80, 160];
		//this.monster_x = 40;
		//this.monster_y = 90;
		this.delay = 0;
		this.panel_items = [];
		this.level_scale = 1;
	},
	

	update_targets(_targets) {
		game_data['error_history'].push('gptp2');
		this.targets = _targets;
		var targets_panel_item;        
		var total = this.targets.length;
		var targets_pos = game_data['graphics_manager'].get_data('targets_panel_items_pos');

		for (var i = 0; i < total; i++) {
			
			if (this.targets[i]['type'] == 'fireball') {
				targets_panel_item = new TargetsPanelItemMonster(this.scene);
				var pt = game_data['graphics_manager'].get_pos('targets_panel_item_monster');
				targets_panel_item.x = pt.x;
				targets_panel_item.y = pt.y;
			}
			else  {
				targets_panel_item = new TargetsPanelItem(this.scene);
				targets_panel_item.x = targets_pos[i].x;
				targets_panel_item.y = targets_pos[i].y;
			}
			targets_panel_item.init(this.targets[i], this.spine_holder);    
			targets_panel_item.emitter.on("EVENT", this.handler_event, this);
			targets_panel_item.alpha = 0;
			this.add(targets_panel_item);
			this.panel_items.push(targets_panel_item);            
		}

		this.is_complete = false;

	},

	field_appeared() {
		for (var i = 0; i < this.panel_items.length; i++)
			this.scene.tweens.add({targets: this.panel_items[i], alpha: 1, duration: 200});
	},

	display_targets_panel_items(params) {
		game_data['error_history'].push('gptp3');
		for (var i = 0; i < this.panel_items.length; i++) {
			this.panel_items[i].display_panel_item();
		}
	},
	
	move_target_gem(obj) {			
		var _this = this;
		var start_pt = game_data['utils'].toLocal(this.moving_holder, obj['pt']);			
		var end_pt;			
		var pos;
  // console.log('move_target_gem', obj['ind'], obj['amount'])     
		var gem_copy =  obj['gem_copy'];
		var ind = obj['ind'];
		var amount = obj['amount']			
		var panel_item = this.panel_items[ind];				
		var is_fireball = panel_item.get_type() == 'fireball';

		//fail_tasks[ind]['amount'] = amount;
		pos = panel_item.get_target_panel_pos();
		end_pt = game_data['utils'].toLocal(this.moving_holder, pos['icon']['pt']);
		
		gem_copy.x = start_pt.x;
		gem_copy.y = start_pt.y;
		gem_copy.setScale(this.level_scale);
		
		var gem_shadow = obj['gem_shadow'];
		gem_shadow.setTintFill(0x000000);
		var _shadow_shift = 30;
		gem_shadow.x = start_pt.x + _shadow_shift;
		gem_shadow.y = start_pt.y + _shadow_shift;
		gem_shadow.alpha = 0;
		gem_shadow.setScale(this.level_scale);
		this.moving_holder.add(gem_shadow);
		this.moving_holder.add(gem_copy);

		var move_target_sound = this.delay == 0;
		this.delay += 40;
		var _delay = this.delay;
		var _fly_time = 500;
		setTimeout(() => {
			_this.delay = 0;
		}, 100);

		if (_this.scene) {
			this.scene.tweens.add({ targets: gem_copy, scaleX: this.level_scale * 1.2, scaleY: this.level_scale * 1.2, y: start_pt.y - 50, angle: 45, duration: 250, onComplete: function () { 
				if (move_target_sound) {
					setTimeout(() => {
						game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'move_target'});	
					}, 200);
				}
				if (_this.scene) {
					_this.add_particle({'pt_start': start_pt, 'pt_end': end_pt, 'holder': _this.moving_holder});
					panel_item.display_amount(amount, _fly_time);  
					_this.check_for_finish();  
					_this.scene.tweens.add({ targets: gem_copy, scaleX: _this.level_scale, scaleY: _this.level_scale,  duration: 150, delay: _fly_time - 200, });
					_this.scene.tweens.add({targets: gem_copy, x: end_pt.x, y: end_pt.y, angle: 0,  duration: _fly_time, delay: _delay, ease: 'Sine.easeInOut',
						onComplete: function () { 
							if (_this.scene) {
								gem_copy.destroy();                            
								if (is_fireball) {
									panel_item.monster_blink();
									_this.emitter.emit('EVENT', {'event': 'MONSTER_HURT'});
								}
							}      
						}            
					});
				}
			}}); 
			this.scene.tweens.add({ targets: gem_shadow, y: start_pt.y + _shadow_shift - 50, angle: 45, alpha: 0.5,
							scaleX: this.level_scale * 0.9, scaleY: this.level_scale * 0.9, duration: 250, onComplete: function () {
				if (_this.scene) {
					_this.scene.tweens.add({ targets: gem_shadow, scaleX: _this.level_scale, scaleY: _this.level_scale, alpha: 0.1,  duration: 150, delay: _fly_time - 200, });
					_this.scene.tweens.add({ targets: gem_shadow, x: end_pt.x, y: end_pt.y, angle: 0,   ease: 'Sine.easeInOut',
											duration: _fly_time, delay: _delay, onComplete: function () {
						gem_shadow.destroy();
					}});
				}
			}}); 
		}    
	},

	add_particle(params) {
		var pt_start = params['pt_start'];
		var pt_end = params['pt_end'];
		params['curve'] = new Phaser.Geom.Line(pt_start.x, pt_start.y - 50, pt_end.x, pt_end.y)

		var config = {
			alpha: { start: 1, end: 0.3 },
			scale: { start: 0.6, end: 0.3 },
			speed: { min: -15, max: 15 },
			blendMode: 'NORMAL',
			frequency: 50,
			maxParticles: 15,
			lifespan: 300,
			emitZone: { type: 'edge', source: params['curve'], quantity: 15, yoyo: false }
		};
		var prtcl = game_data['scene'].add.particles('game_windows', 'light_star');
	   
		prtcl.createEmitter(config);
		params['holder'].add(prtcl);
		setTimeout(() => {
			prtcl.destroy();
		}, 500);
	},
	
	update_scale(scale) {
		this.level_scale = scale;
	},

	tile_destroyed(params) {
		for (var i = 0; i < this.panel_items.length; i++)
			if (this.panel_items[i].get_type() == 'tiles') {                
				this.panel_items[i].display_amount(params['amount']);
				this.check_for_finish();										
				break;
			}    
	},

	
	check_target_bonus(bonus_id) {
		/*
		for (var i = 0; i < total_items; i++) {
			if (panel_items[i].type == 'bonus' && bonus_id == panel_items[i]['id'] && !panel_items[i].finished)
				return true;				
		}
		*/			
		return false;
	},


	
	check_for_finish() {	
		var i;
		for (i = 0; i < this.panel_items.length; i++)
			if (!(this.panel_items[i].is_finished()))
				return;
		 
		if (!this.is_complete) {                       
			this.is_complete = true;
			this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
		}  
	},			
	
	get_panel_items_pts() {
		
		var arr = new Array()
		for (var i = 0; i < this.panel_items.length; i++)
			arr.push(this.panel_items[i].get_pts());
		
		return arr;
		
	},
	
	is_level_complete() {    
		return this.is_complete;
	},


	handler_event(params) {
		switch (params['event']) {
			case '':
				this.handler_update_moves(params);
		  break;
		  
		default:
		  this.emitter.emit('EVENT', params);
		  break;
	  }
	},
	
	destroy_level() {
		for (var i = 0; i < this.panel_items.length; i++) {
			this.panel_items[i].visible = false;
			this.panel_items[i].destroy();
		}	
		this.panel_items = [];		
	},	

	get_task_hole() {
		/*
		var pt: Point = localToGlobal(new Point(panel_item1.x + panel_item1.width / 2, panel_item1.y + panel_item1.height / 2 - 10));
		return [{'pt': pt, 'rect': true, 'w': panel_item1.width, 'h': panel_item1.height - 40}];
		*/
	}
});



