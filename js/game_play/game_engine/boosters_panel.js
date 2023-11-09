var BoostersPanel = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function BoostersPanel (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 480, 670);        
				this.emitter = new Phaser.Events.EventEmitter();
    },

		init(params) {
			var i;
			var booster_item;
			this.booster_items = [];
		//	this.active_boosters = [];
		//	this.inactive_boosters = [];
			this.boosters = {};
			this.booster_ids = ['booster1', 'booster2', 'booster4', 'booster6'];
			// this.booster_ids = ['hammer', 'broom', 'magnet', 'cross'];
			var booster_id;
			this.engine = game_data['game_engine'];
		/*	this.pos_x = [
				[360]
				,[300, 420]
				,[240, 360, 480]
				,[180, 300, 420, 540]
				,[120, 240, 360, 480, 600]
				,[60, 180, 300, 420, 540, 660]
			]*/
			this.pos_x = game_data['graphics_manager'].get_data('boosters_panel_items_pos');

			// this.moving_holder = params['moving_holder'];
			// this.pt_field = params['pt_field'];
			//this.field_w = params['field_w'];
			

			this.background = new Phaser.GameObjects.Image(this.scene, this.pos_x[2] - 75, landscape ? 10 : 20, "common1", "booster_bg");
			this.add(this.background);
			for (i = 0; i < this.booster_ids.length; i++) {
				booster_id = this.booster_ids[i];
				booster_item = new BoosterItem(this.scene);				
				booster_item.init({'booster_id': this.booster_ids[i], 'moving_holder': game_data['game_engine']});
				booster_item.emitter.on('EVENT', this.handler_event, this);
				booster_item.x = this.pos_x[i];
				booster_item.y = 0;				
				this.booster_items.push(booster_item);
				this.boosters[booster_id] = booster_item;
				this.add(booster_item);
			}

			this.allow_pointer_move = false;
			this.scene.input.on("pointermove", this.handler_pointermove, this);
			game_data['paid_bonus_anim'] = false

			this.booster_start = new BoosterStartEvents(this.scene, params.engine);
        	this.booster_effect = new BoosterEffectEvents(this.scene, params.engine);
			this.booster_start.init();
        	this.booster_effect.init();
			this.add([this.booster_effect, this.booster_start]);
		},	
		handler_pointermove(pointer) {
			if (this.allow_pointer_move) {
				var pt = {'x': pointer['worldX'] - this.dx, 'y': pointer['worldY'] - this.dy};
				this.moving_icon.x = pt.x;
				this.moving_icon.y = pt.y;
				if (this.prtcl && this.move_emitter) {
					this.move_emitter.setPosition(pt.x, pt.y);
    }
			}
			
		},

		disable_boosters() {
			Object.keys(this.boosters).forEach(key => {
				this.boosters[key].disable();
			})
		},

		enable_boosters() {
			Object.keys(this.boosters).forEach(key => {
				this.boosters[key].enable();
			})
		},

		disable_booster(booster) {
			this.boosters[booster].disable();
		},
	
		enable_booster(booster) {
			this.boosters[booster].enable();
		},

		apply_booster (params) {
			this.boosters[params['booster_id']].apply_booster(params);
			// for (var i = 0; i < this.booster_items.length; i++)
			// 	this.booster_items[i].apply_booster(params);

		},

		return_booster(params) {
			game_data['error_history'].push('gpbp2'); 
			for (var i = 0; i < this.booster_items.length; i++)
				this.booster_items[i].return_booster(params);
		},
		
		update_panel(obj) {
			this.level_id = obj['level_id'];
			//this.update_visible_bonuses();
			this.update_boosters();
		},	

		booster_used(params) {
			var _this = this;
			var is_free = this.boosters[params['booster_id']].is_free;
			var no = 0;
			switch (params['booster_id']) {
				case 'booster1': no = 1; break;
				case 'booster2': no = 2; break;
				case 'booster3': no = 3; break;
				case 'booster4': no = 4; break;
				case 'booster5': no = 5; break;
				case 'booster6': no = 6; break;
			}
			console.log(game_data['boosters'][params['booster_id']])
			var amount_dec = game_data['boosters'][params['booster_id']]['price'];
			if (game_data['user_data']['boosters'][params['booster_id']] > 0 || is_free) amount_dec = 0;
			if (is_free) {
				_this.engine.emitter.emit('ACTION', {event: 'BOOSTER_END'});
				game_data['utils'].update_stat({'type': 'buy_booster', 'booster_buy': true, 'amount_inc': 1, 'level': _this.level_id,
											'amount_dec': amount_dec, 'sub_action': params['booster_id']});
			}
			else {
				if (game_data['user_data']['boosters'][params['booster_id']] <= 0 ) 
						_this.emitter.emit('EVENT', {'event': 'remove_booster_money', 'amount': amount_dec});
				game_data['game_request'].request({'booster_use': true, 'booster_id': params['booster_id'], 'level_id':this.level_id, 'amount': 1}, function(res){
					if ('boosters' in res) game_data['user_data']['boosters'] = res['boosters'];
					if ('money' in res) game_data['user_data']['money'] = res['money'];
					_this.emitter.emit('EVENT', {'event': 'update_money', 'booster': true, 'amount': amount_dec});
					_this.update_boosters();
					if (res['success']) {
						
						game_data['utils'].update_stat({'type': 'buy_booster', 'booster_buy': true, 'amount_inc': 1, 'level': _this.level_id,
															'amount_dec': amount_dec, 'sub_action': params['booster_id']});
					}
				});	
			}

			console.log('money: ' + game_data['user_data']['money'])
        	game_data['game_play'].update_money();
		},
		
		get_booster_hole(booster_id) {
			return this.boosters[booster_id].get_hole();
		},

		handler_hammer(event) {		
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['hammer']['level_id'] - 1) || all_bonuses_show)
        start_cursor_bonus({'bonus_id': 'hammer', 'button': button_hammer});			
        */
		},

		handler_broom(event) {
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['broom']['level_id'] - 1) || all_bonuses_show)			
        start_cursor_bonus({'bonus_id': 'broom', 'button': button_broom});			
        */
		},

		handler_color(event) {
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['color']['level_id'] - 1) || all_bonuses_show)			
        start_cursor_bonus({'bonus_id': 'color', 'button': button_color});			
       */ 
		},

		handler_reshuffle(event) {
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['reshuffle']['level_id'] - 1) || all_bonuses_show) {	
				if (game_data['user_data']['bonuses']['reshuffle'] == 0 && free_use_id != 'reshuffle')
					show_no_bonus_window('reshuffle');	
				else {
					dispatchEvent(new ExtendedEvent('TRY_RESHUFFLE', {'free_id':free_use_id}));
				}
      }
      */
		},
		
		handler_candies(event) {
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['candies']['level_id'] - 1) || all_bonuses_show) {			
				if (game_data['user_data']['bonuses']['candies'] == 0 && free_use_id != 'candies') {
					show_no_bonus_window('candies');			
				}
				else {
					if (free_use_id == 'candies') {
						set_free_id('');
						dispatchEvent(new ExtendedEvent('APPLY_CANDIES', {}));		
					}
					else 
					game_data['utils'].game_request({'bonus_use': true, 'bonus_id': 'candies'}, function(res: Object){
						if ('success' in res && res['success'])  {
							dispatchEvent(new ExtendedEvent('APPLY_CANDIES', {}));						
							game_data['user_data']['bonuses'] = res['bonuses'];
							update_boosters();
							game_data['utils'].update_stat({'type': 'use_booster', 'bonus_id': 'candies', 'amount_dec':1});
						}
						else show_no_bonus_window('candies');
					});		
				}
      }
      */
		},
		
		handler_dracula(event) {
      /*
			var level_id = game_data['user_data']['levels_passed'].length;
			if (level_id >= (game_data['bonuses']['dracula']['level_id'] - 1) || all_bonuses_show) {						
				if (game_data['user_data']['bonuses']['dracula'] == 0 && free_use_id != 'dracula') {
					show_no_bonus_window('dracula');			
				}
				else {
					if (free_use_id == 'dracula') {
						set_free_id('');
						dispatchEvent(new ExtendedEvent('APPLY_DRACULA', {}));		
					}
					else 
					game_data['utils'].game_request({'bonus_use': true, 'bonus_id': 'dracula'}, function(res: Object){
						if ('success' in res && res['success'])  {
							dispatchEvent(new ExtendedEvent('APPLY_DRACULA', {}));										
							game_data['user_data']['bonuses'] = res['bonuses'];
							update_boosters();
							game_data['utils'].update_stat({'type': 'use_booster', 'bonus_id': 'dracula', 'amount_dec':1});
						}
						else show_no_bonus_window('dracula');	
					});		
				}
      }
      */
		},
		
		/*
		update_visible_bonuses() {
			var i;
			this.active_boosters = [];
			for (i = 0; i < this.booster_ids.length; i++) {
				if (this.level_id >= game_data['boosters'][this.booster_ids[i]]['level_id']) {
					this.active_boosters.push(this.booster_items[i]);
				}
				this.booster_items[i].visible = false;
			}
			for (i = 0; i < this.active_boosters.length; i++) {
				this.active_boosters[i].x = this.pos_x[this.active_boosters.length - 1][i];
				this.active_boosters[i].visible = true;
			}

		},
		*/
		
		update_boosters() {
			var i;
			for (i = 0; i < this.booster_items.length; i++) 
				this.booster_items[i].update_booster(this.level_id);
		},

		get_booster_info(id) {
			var _id = 'booster' + String(id);
			var i = 0;
			var booster = null;
			var ret = {'pt': null, 'size': 0};
			for (i = 0; i < this.booster_ids.length; i++) {
				if (this.booster_ids[i] == _id) {
					booster = this.booster_items[i];
					break;
				}
			}
			if (booster){
				var pt =  new Phaser.Geom.Point(booster.x, booster.y);
				pt = game_data['utils'].toGlobal(this, pt);
				ret['pt'] = pt;
				ret['w'] = booster.bg.width * booster.scaleX;
				ret['h'] = booster.bg.height * booster.scaleY;
			}
			return ret;
		},


		show_no_bonus_window(bonus_id) {
      /*
			var i: int;
			var button: MovieClip = null;
			for (i = 0; i < buttons.length; i++) {
				if (buttons[i]['id'] == bonus_id) {
					button = buttons[i]['mc'];
					break;
				}
			}
			if (button) {
				var icon = game_data['utils'].copy_bitmap(button.icon, button);
				var pt: Point = button.localToGlobal(new Point(button.icon.x, button.icon.y));
				dispatchEvent(new ExtendedEvent("SHOW_WINDOW", {'window_id': "buy_boosters", 'bonus_id': bonus_id, 'icon': icon, 'pt':pt}));
      }
      */
		},


		handler_show_booster_particles(params) {
			var pt = game_data['utils'].toLocal(this, params['pt']);

			var prtcl = this.scene.add.particles('common1', 'particle_explode');
			this.add(prtcl);
	
			var emitter = prtcl.createEmitter({
					x: pt.x,
					y: pt.y,
					lifespan: 250,
					blendMode: 'SCREEN',
					alpha: 1,
					scale: { start: 0.2, end: 0 },
					speed: { min: -100, max: 100 },
					quantity: 40
			});
	
			
		 var count = 0;
			
	
			this.timer = this.scene.time.addEvent({
					delay: 30,
					repeat: 5,
					callbackScope: this,        
					callback: function(){
							count++;
							var emitZone = {
									source: new Phaser.Geom.Circle(0, 0, 70 + 3 * count),
									type: 'edge',
									quantity: 40
							};							
							emitter.setEmitZone(emitZone);
							emitter.explode();
							
					},
			});
			this.timer.paused = false;
			this.timer.type_timer = 'booster_particles'
	
			var emitZone = {
					source: new Phaser.Geom.Circle(0, 0, 65),
					type: 'edge',
					quantity: 20
			};
			emitter.setEmitZone(emitZone);
			emitter.explode();
			setTimeout(() => {
				emitter.on = false
				emitter.stop()
				emitter.killAll()
				prtcl.destroy(true)
				this.timer.paused = true;
				this.timer.remove()
				this.timer.destroy(true)
			}, 200)
		},

		switch_pointer_move({value}) {
			this.allow_pointer_move = value;
		},

		transfer_booster_information({icon, move_emitter, dx, dy, prtcl}) {
			
			this.moving_icon = icon;
			this.move_emitter = move_emitter;
			this.dx = dx;
			this.dy = dy;
			this.prtcl = prtcl;
			
		},

		handler_event(params) {
			switch (params['event']) {
				case 'SHOW_BOOSTER_PARTICLES':
					if (!game_data['active_tornado']) this.handler_show_booster_particles(params);
				break;			  
				case 'SWITCH_POINTER_MOVE':
					this.switch_pointer_move(params);
					break;
				case 'TRANSFER_BOOSTER_INFORMATION':
					this.transfer_booster_information(params);
					break;
				default:
					this.emitter.emit('EVENT', params);
					
				break;
			}
		},

		reboot_states() {
			this.booster_start.states = {
				'booster1': true,
				'booster2': true,
				'booster4': true,
				'booster6': true,
			};
			this.booster_effect.highlight_state = false;
			Object.keys(this.boosters).forEach(key => {
				this.boosters[key].remove_particles();
			});
			clearInterval(this.booster_effect.highlight_interval);
		},

		show_overlay(booster_id) {
			if(booster_id) {
				this.boosters[booster_id].show_overlay();
			} else {
				this.list.forEach(e => {
					try {
						e.show_overlay();
					} catch {
						e.setTint(0x666666);
					}
				});
			}
		},

		hide_overlay(booster_id) {
			if(booster_id) {
				this.boosters[booster_id].hide_overlay();
			} else {
				this.list.forEach(e => {
					try {
						e.hide_overlay();
					} catch {
						e.clearTint();
					}
				});
			}
		}


});