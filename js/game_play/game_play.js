var GamePlay = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GamePlay (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
	},

	init(params) {   
		var pt;
		game_data['error_history'].push('gp1');
		game_data['game_play'] = this;
		this.is_relax = false;
		this.allow_sound = true;
		this.bg_container = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.add(this.bg_container);

		this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);







		// Game Engine !!!!!!!!!!









		pt = game_data['graphics_manager'].get_pos('game_engine');
		this.game_engine = new GameEngine(this.scene);

		console.log(this.scene);
		console.log(this.game_engine);

		this.game_engine.x = -100;
		this.game_engine.y = 0;
		this.game_engine.dx = 0;
		this.game_engine.dy = 0;
		this.game_engine.init({
			'first_gems_moving_holder': this.first_gems_moving_holder
		});

		this.attr = {
			'booster_id': null,
			'state': false,
			'field_booster_id': null,
			'field_state': false
		};
		
		var _y = 38;
		var _x = [loading_vars['W']/2 - 160, loading_vars['W']/2, loading_vars['W']/2 + 160, loading_vars['W']/2 + 240];
						
		//button money
		this.money_container = new Phaser.GameObjects.Container(this.scene,  _x[0], _y);
		this.add(this.money_container);
		this.money_button = new CustomButton(this.scene, 0, 3, this.handler_buy_money, 'common1', 'but_out', 'but_over', 'but_down', this);
		this.money_container.add(this.money_button);
		let temp = new Phaser.GameObjects.Image(this.scene, -30, -5, "common1", "money_ico");
		this.money_container.add(temp);
		this.user_money_plus = new CustomButton(this.scene, -18, -18, this.handler_buy_money, 'common1', 'plus1', 'plus2', 'plus3', this);
		this.money_container.add(this.user_money_plus);
		this.money_txt = new Phaser.GameObjects.Text(this.scene, 30, -3, '0', {fontFamily:"font1", fontSize: 24, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
		this.money_txt.setOrigin(0.5);
		this.money_container.add(this.money_txt);
		this.update_money();
		
		this.container_money_box = new Phaser.GameObjects.Container(this.scene, _x[1], _y - 110);
		temp = new Phaser.GameObjects.Image(this.scene, 0, 3, 'common1', 'but_out');
		this.container_money_box.add(temp);
		this.money_box_amount_txt = new Phaser.GameObjects.Text(this.scene, 30, -3, '0', {fontFamily:"font1", fontSize: 24, color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
		this.money_box_amount_txt.setOrigin(0.5);
		this.container_money_box.add(this.money_box_amount_txt);   
		temp = new Phaser.GameObjects.Image(this.scene, -28, -5, "common1", "icon_pig_out");   
	
		this.container_money_box.add(temp); 
		
		this.container_score = new Phaser.GameObjects.Container(this.scene, _x[1], _y);
		temp = new CustomButton(this.scene, 0, 3, this.handler_score_tip, 'common1', 'but_out', 'but_out', 'but_out', this);
		this.container_score.add(temp);
		temp = new Phaser.GameObjects.Image(this.scene, -30, 0, 'common1', 'score_icon_big');
		this.container_score.add(temp);
		this.score_txt = new Phaser.GameObjects.Text(this.scene, 32, -3, '', {fontFamily:"font1", fontSize: 32, color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
		this.score_txt.setOrigin(0.5);
		this.container_score.add(this.score_txt);

		//round
		this.container_round = new Phaser.GameObjects.Container(this.scene, _x[2], _y);
		temp = new CustomButton(this.scene, 0, 3, this.handler_round_tip, 'common1', 'but_out', 'but_out', 'but_out', this);
		this.container_round.add(temp);
		this.round_txt = new Phaser.GameObjects.Text(this.scene, 0, -5, '', {fontFamily: "font1", fontSize: 22, color:"#f6caa0", stroke: '#000000', strokeThickness: 3, align: 'center'});
		this.round_txt.setLineSpacing(-6);
		this.round_txt.setOrigin(0.5);        
		this.container_round.add(this.round_txt);   

		//button options
		var pt = game_data['graphics_manager'].get_pos('options');
		this.options_button = new CustomButton(this.scene, pt.x, pt.y, this.handler_options, 'common1', 'but_options1', 'but_options2', 'but_options3', this);
		this.add(this.options_button);
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "options");
		//_scale = 40 / temp.height;
		//temp.setScale(_scale);
		this.options_button.add(temp);
		
		pt = game_data['graphics_manager'].get_pos('competitors_panel');
		this.competitors_panel = this.game_engine.bots;
		// this.competitors_panel.init({'game_engine': this.game_engine});
		// this.competitors_panel.emitter.on('EVENT', this.handler_event, this);	
		// this.competitors_panel.x = pt.x;
		// this.competitors_panel.y = pt.y;

		this.winner_name = new Phaser.GameObjects.Container(this.scene, loading_vars['W']/2, loading_vars['H']/2);
		this.winner_name.alpha = 0;
		this.winner_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, '', {fontFamily:"font1", fontSize: 70, color:"#f4df7c",  stroke: '#8a4e09', strokeThickness: 5
													,align: 'center', wordWrap: {'width': 1000}});
		this.winner_txt.setOrigin(0.5);
		this.winner_name.add(this.winner_txt);
		
		this.add(this.money_container);
		this.add(this.container_score);
		this.add(this.container_round);
		this.add(this.options_button);
		this.add(this.container_money_box);
		// this.add(this.competitors_panel);
		this.add(this.game_engine);
		this.add(this.winner_name);
		this.add(this.moving_holder);
		this.game_engine.emitter.on('EVENT', this.handler_event, this);

		this.default_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.default_overlay.setOrigin(0,0);
		this.default_overlay.alpha = 0.01;
		this.default_overlay.setInteractive();
		this.add(this.default_overlay);
		this.default_overlay.visible = false;

		this.level_active = false;
		this.tid_fail_window = -1;
		this.tid_auto_hint = -1;
		this.user_id = loading_vars['user_id'];
		this.init_particles();
		this.update_difficulty_mode(this.is_relax);

		game_data['utils'].preload_field_anims();
},

click_bg() {
	if (this.attr && this.attr.state)
		this.handler_set_booster_state({'state': false, 'booster_id': this.attr.booster_id})
},

handler_set_booster_state({booster_id, state}) {
	if (state) {
		this.attr.booster_id = booster_id;
		this.attr.state = state;
		this.rt = this.fill_screen()
		this.add(this.rt);
		

		this.field_items = this.game_engine.playing_field.get_field_items();

		this.field_items.forEach(by_y => {
			
			if (by_y ) {
				by_y.forEach(field_item => {
					if (field_item) {
						this.erase_field_item(field_item)
						
					}
				});
			}
		});

		let booster_hole = this.game_engine.playing_field.boosters_panel.get_booster_hole(booster_id);
		
		let pt = game_data['utils'].toLocal(this, new Phaser.Geom.Point(booster_hole.pt.x, booster_hole.pt.y));
		
		let graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x000000, 1);
		graphics.fillRect(0, 0,  booster_hole['width'] ,  booster_hole['height'] );
		this.rt.erase(graphics, pt.x - booster_hole['width']/2, pt.y - booster_hole['height']/2);
		this.rt.alpha = 0;

		if (this.scene && this.scene.tweens) {
			this.scene.tweens.add({
				targets: [this.rt],
				duration: 250,
				alpha: 1
			});
		}
		
		game_data['utils'].show_booster_info({booster_id});
		if (booster_id === 'booster2') {
			setTimeout(() => {
				this.game_engine.playing_field.gems_manager.add_web_shake();
			}, 0)
			
		}
	} else {
		this.game_engine.playing_field.gems_manager.selected_gem = null;
		this.game_engine.playing_field.gems_manager.bonus_manager
		game_data['utils'].hide_booster_info();
		this.hide_screen_fill();
		this.attr.booster_id = null;
		this.attr.state = false;
		this.game_engine.playing_field.gems_manager.boosters_panel.booster_items.forEach(item => {
			item.remove_particles()
		})
		if (booster_id === 'booster2') {
			this.game_engine.playing_field.gems_manager.remove_web_shake();
		}
	}
},

set_booster_holes({booster_id, state, pos_x, pos_y, gem}) {
	if (state) {
		
		this.attr.field_booster_id = booster_id;
		this.attr.field_state = state;
		this.attr.field_pos_x = pos_x;
		this.attr.field_pos_y = pos_y;
		this.attr.gem = gem;

		this.rt = this.fill_screen()
		this.add(this.rt);

		let target_fields = [
			{pos_x, pos_y},
			{pos_x: pos_x - 1, pos_y},
			{pos_x: pos_x + 1, pos_y},
			{ pos_y: pos_y - 1, pos_x,},
			{ pos_y: pos_y + 1, pos_x,},
		]
		this.attr.target_fields = target_fields
		this.field_items = this.game_engine.playing_field.get_field_items();

		target_fields.forEach(({pos_x, pos_y}) => {
			let field_item = this.field_items[pos_y] && this.field_items[pos_y][pos_x] && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_locked() && (this.field_items[pos_y][pos_x].is_normal() || this.field_items[pos_y][pos_x].is_bonus()) ? this.field_items[pos_y][pos_x] : null
			if (field_item) {
				this.erase_field_item(field_item)
			}
		})
		this.erase_targets_panel()
	}
	else {
		this.hide_screen_fill();
		this.attr.field_booster_id = null;
		this.attr.field_state = false;
		this.attr.field_pos_x = null;
		this.attr.field_pos_y = null;
		this.attr.target_fields = null;
		this.attr.gem = null;
	}
},

fill_screen() {
	let dark = new Phaser.GameObjects.Graphics(game_data['scene']);  

	dark.fillStyle(0x000000, 0.8);
	dark.fillRect(0, 0, loading_vars['W'], loading_vars['H']);

	let rt = new Phaser.GameObjects.RenderTexture(game_data['scene'], 0, 0, loading_vars['W'], loading_vars['H']);
	rt.draw(dark, 0, 0);

	return rt;
},

erase_field_item(field_item) {
	let pt = game_data['utils'].toGlobal(field_item.parentContainer, new Phaser.Geom.Point(field_item.x, field_item.y));
	pt = game_data['utils'].toLocal(this, new Phaser.Geom.Point(pt.x, pt.y));

	let graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
	graphics.fillStyle(0x000000, 1);
	graphics.fillRect(0, 2,  (game_data['dim']['item_width']) * this.game_engine.playing_field.level_scale,  (game_data['dim']['item_height'] ) * this.game_engine.playing_field.level_scale);
	this.rt.erase(graphics, pt.x - game_data['dim']['item_width'] * this.game_engine.playing_field.level_scale/2, pt.y - game_data['dim']['item_height'] * this.game_engine.playing_field.level_scale/2);
},

erase_targets_panel() {
	let pt = new Phaser.Geom.Point(this.targets_panel.x - 60, this.targets_panel.y - 20)
	let height_counter = this.targets.length
	let height = 80 * height_counter

	let graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
	graphics.fillStyle(0x000000, 1);
	graphics.fillRect(0, 2,  180,  height);
	this.rt.erase(graphics, pt.x, pt.y);

},

hide_screen_fill() {
	if (this.rt) {
		if (this.scene && this.scene.tweens) {
			this.scene.tweens.add({
				targets: [this.rt],
				duration: 250,
				alpha: 0,
				onComplete: () => {
					this.remove(this.rt);
					this.rt.destroy();
				}
			});
		} else {
			this.remove(this.rt);
			this.rt.destroy();
		}
	}
},


update_money_box(val = -1) {
	var max_amount = game_data['money_box']['capacity'];
	var amount = 0;
	amount = game_data['utils'].get_moneybox();
	// var amount = Math.min(game_data['user_data']['money_box']['amount'], max_amount);
	if (val > 0) amount = val;
	if (amount > max_amount) amount = max_amount;
	this.money_box_amount_txt.text = amount;
},

update() {
	if (this.game_engine) this.game_engine.update();  
},

load_bg(level_id, on_complete) {
	on_complete();

},

show_overlay() {
	this.default_overlay.visible = true;
},

hide_overlay() {
	this.default_overlay.visible = false;
},


clear_level() {
	clearTimeout(this.tid_fail_window);
	this.moving_holder.removeAll(true);
	this.hide_overlay();
	this.competitors_panel.pause();
	this.handler_no_moves_hide(true);
	clearTimeout(this.tid_auto_hint);
	this.game_engine.destroy_level(); ///////////////////////////
},

start_music(_id) {
	var pos = parseInt(game_data['music_tracks'].length * Math.random());
	if ('music_tracks_pos' in game_data) pos = game_data['music_tracks_pos'];
	var track = game_data['music_tracks'][pos];
	game_data['music_tracks_pos'] = pos;
	game_data['audio_manager'].sound_event({'play': true, 'loop': true, 'sound_type': 'music', 'sound_name': track, 'audio_kind': 'music'});
	this.add				
},

start_level(_params) {     
	
	console.log(_params)

	var play_ids = [];
	var i = 0;
	this.tournament_settings = _params;
	this.duel = 'duel' in _params && _params['duel'];
	this.container_round.visible = !this.duel;
	this.loosers = [];
	this.winners = [];
	this.ids = _params['ids'];
	this.competitors_ids = this.ids.map(e => e !== 0);
	this.visual_ids = _params['visual_ids'];
	this.level_id = _params['level_id'];
	this.container_score.visible = this.level_id > 0;
	game_data['current_level_id'] = this.level_id;
	this.level = game_data['current_level'];
	this.extra_cards = this.level['extra_cards'];
	this.score = 0;
	this.update_score();
	this.is_setting_next_field = true;
	game_data['block_aheading'] = false;
	
	if ( this.level_id <= 6) {
		this.auto_hint_delay = 5000 + game_data['user_data']['levels_passed'].length * 2000;
		game_data['block_aheading'] = this.level_id <= 2;
	}
	else this.auto_hint_delay = 20000;
	for (i = 0; i < this.ids.length; i++) play_ids.push(this.ids[i]);
	_params['play_ids'] = play_ids;
	this.user_stars = 0
	clearTimeout(this.tid_auto_hint);
	if (this.duel) game_data['utils'].update_stat({'type': 'duel_start', 'duel_start': true, 'level': game_data['current_level']['level_id']});
	else {
		game_data['utils'].update_stat({'round_start': true, 'level': this.level_id + 1, 'sub_action': this.loosers.length + 1});
		game_data['utils'].update_stat({'level_start': true, 'level': this.level_id + 1});
	}

	this.passing = 'passing' in this.tournament_settings && this.tournament_settings['passing']; //дуэли и 2х2 по кнопкам должны давать false
	play_ids.unshift(this.user_id);

	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music', 'audio_kind': 'music'});
	
				
	this.prize = _params['prize'];
	this.clear_level();
	this.show_overlay();
	this.update_money();
	if (game_data['last_game_mode'] != 'offline') this.update_money_box();
  
	this.field_appeared = false
	this.is_level_finished = false;

	if (this.level_id <= 1) this.auto_hint_delay = 2000;
	else if (this.level_id == 2) this.auto_hint_delay = 4000;
	else if (this.level_id == 3) this.auto_hint_delay = 6000;
	else this.auto_hint_delay = 10000;
	

	clearTimeout(this.tid_auto_hint);
					
	this.secret_deck_empty = false;		
	this.total_fields = this.level['fields'].length;
	this.current_field = 1;
	var field = this.level['fields'][this.current_field - 1];
	this.check_tutorial(field);	
	this.game_engine.start_level({
		data: {
			stones: game_data['arr_stones'],
			level: this.scene.cache.json.get(`level_${this.level_id}`)
		},
		level_id: this.level_id,
		ids: this.ids
	});	
	
	this.is_setting_next_field = false;
	
	if (!(game_data['loaded_anims']) && !(game_data['loaded_anims']['tornado'])) {
        game_data['utils'].preload_field_anims();
    }
	// this.competitors_panel.update_competitors({
	// 	'ids': this.tournament_settings['play_ids'],
	// 	//'ais': this.tournament_settings['opponents'],
	// 	'duel': this.duel
	// });  
	this.set_round_text();
},

check_tutorial(field) {
	this.is_tutorial = false;
	if (!this.duel && !game_data['utils'].is_extending_game()) {
		var f = 0 //this.current_field - 1

		if ('tutorial' in field['fields'][f]) {
			var tut_obj = field['fields'][f]['tutorial'];
			
			if (!(tut_obj['id'] in game_data['user_data']['tutorial'])) {
				this.is_tutorial = true;
				
				this.tut_start_object = {'event': 'START_TUTORIAL', 'tutorial_type':'learning', 'info': tut_obj};
				
				//this.button_options.visible = this.level_id > 1;
			}
		}	
	}
},

set_next_field(params) {

	var _this = this;
	var _delay = 300;
	if (!this.is_setting_next_field) {
		this.field_appeared = false;
		
		this.game_engine.level_complete(true);
		
		this.is_setting_next_field = true;
		clearTimeout(this.tid_auto_hint);
		this.show_overlay();
		
		setTimeout(function() {
			// _this.handler_no_moves_hide(true);
				if (_this.current_field < _this.total_fields) {
					// _this.secret_deck_empty = false;
					// _this.secret_cards_left = 0;
					_this.current_field++;
					_this.set_round_text();
					//_this.check_tutorial();
					var play_ids = _this.ids.filter(function(el, index, arr) {
						var match = true;
						var k = 0;
						for (k = 0; k < _this.loosers.length; k++) {if (_this.loosers[k] == el) match = false; }
						if (el == _this.user_id)  match = false;
						return match;
					});
					play_ids.unshift(_this.user_id);
					var fill_rate = _this.level['fill_rate'][_this.current_field - 1];
					var field = _this.level['fields'][_this.current_field - 1];

					game_request.update_stat({'round_start': true, 'level': _this.level_id + 1, 'sub_action': _this.loosers.length + 1});
					_this.game_engine.start_level({
						data: {
							stones: game_data['arr_stones'],
							level: _this.scene.cache.json.get(`level_${_this.level_id}`)
						},
						level_id: _this.level_id,
						ids: _this.ids
					});		

					_this.is_setting_next_field = false;
					// _this.competitors_panel.update_competitors({'ids': play_ids});  
					_this.is_setting_next_field = false;
					 
				}
				else {
					_this.is_setting_next_field = false;
				}
		},_delay)
				
	}
},

freeze_field() {
	this.game_engine.playing_field.gems_manager.field_items.forEach(by_y => {
		if (by_y) {
			by_y.forEach(by_x => {
				if (by_x) by_x.set_freezed(true);
			});
		}
	});
},


handler_level_finished(e) {
	var i = 0;
	var looser_pos = 0;                                 ////////// TUT!!!
	var looser_id = '';
	var win_ids = [];
	var winner_id = '';
	clearTimeout(this.tid_auto_hint);
	looser_pos = e['ids'] - 1;
	looser_id = e['results'][looser_pos];
	winner_id = e['results'][0];
	if (winner_id == this.user_id) {
		this.user_stars++;
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'level_stage_done'});
		game_data['task_manager'].update_tasks({'type': 'win_round', 'amount':1});
	}
	else if (looser_id == this.user_id) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'not_win_last'});
	else game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'not_win'});
	this.game_engine.level_complete(true);
	this.field_appeared = false;
	clearTimeout(this.tid_auto_hint);
	this.loosers.push(looser_id);
	this.winners.push(winner_id);
	this.emitter.emit('EVENT', {'event': 'CLEAN_WINDOWS', 'immediate':true});
	this.kick_looser({
				'looser_id': looser_id
				,'win_ids': win_ids
				,'winner_id': winner_id				
	});
	//this.game_engine.after_show(function() {});
},

kick_looser(obj) {
	this.default_overlay.visible = true;
	var phrase = '2';
	var winner_val = [''];
	if (obj['winner_id'] in game_data['users_info'] && game_data['users_info'][obj['winner_id']] && game_data['users_info'][obj['winner_id']]['first_name']) 
		winner_val = [game_data['users_info'][obj['winner_id']]['first_name']];

	this.competitors_panel.kick_looser(obj['looser_id']);

	var txt = game_data['utils'].generate_string({
		'scene_id': 'game_play',
		'item_id': 'round',
		'phrase_id': phrase,
		'base_size': 50,
		'values': winner_val
	});	
	
	this.default_overlay.alpha = 0.05;
	this.winner_txt.text = txt['text'];
	this.winner_txt.setFontSize = 70;	
	this.winner_name.alpha = 1;
	this.winner_name.scaleX = 0.01;
	this.winner_name.scaleY = 0.01;	

	// this.game_engine.level_complete(true);
	// this.game_engine.destroy_level();
	// console.log(this.game_engine.playing_field.list)
	game_data['scene'].tweens.add({targets: this.winner_name, scale: 1.3, duration: 400, onComplete: () => {
		game_data['scene'].tweens.add({targets: this.winner_name, alpha: 0, scale: 2, delay: 1600, duration: 300, onComplete: () => {
			this.default_overlay.alpha = 0.01;
			this.winner_name.scaleX = 0.01;
			this.winner_name.scaleY = 0.01;	
		}});
	}});
	if (!this.is_level_finished) {
		
		if (this.user_id == obj['looser_id']) this.is_level_finished = true;
		game_data['game_windows'].close_window();
		setTimeout(() => {
			if (this.user_id != obj['looser_id']) {
				var window_id = 'wait_competitors';
				if (this.duel) window_id = 'wait_duel';
				else game_data['utils'].update_stat({'type': 'round_complete',  'round_complete': true, 'level': this.level_id + 1, 'sub_action': this.loosers.length});
				if (this.level_id <= 2 && loading_vars['new_user']) {
					if (this.level_id == 1) {
						if (this.current_field == 1)
							game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 17, 'description': 'finish_round_1_1'});
						else 
							game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 25, 'description': 'finish_round_1_2'});
					}
					if (this.level_id == 2) {
						if (this.current_field == 1)
							game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 34, 'description': 'finish_round_2_1'});
						else 
							game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 43, 'description': 'finish_round_2_2'});
					}
				}
				setTimeout(() => {
					console.log(this.winners)
					console.log(this.loosers)
					this.emitter.emit('EVENT', {'event': 'show_window', 
											'window_id': window_id,
											'settings': this.tournament_settings,
											'competitors_ids' : this.tournament_settings['competitors_ids'],
											'visual_ids': this.tournament_settings['visual_ids'],
											'winners': this.winners,
											'loosers': this.loosers	
					});		
				},1500);
				
			}
			else {
				game_request.update_stat({'type': 'level_fail', 'level_fail': true, 'level': this.level_id, 'sub_action': this.loosers.length, 'reason': 'speed'});
				this.tournament_failed();
			}
		},500);
	}
},

tournament_failed(no_moves = false) {
	var _this = this;
	_this.is_level_finished = true;
	_this.competitors_panel.pause();
	_this.competitors_panel.bots_display_array.forEach(bot => {
		bot.destroy();
	})
	_this.competitors_panel.bots_display_array = [];
	// _this.game_engine.level_complete(true);
	_this.game_engine.player_display.move(['player'])
	// _this.game_engine.destroy_level();
	// console.log(_this.game_engine.playing_field.list)
	_this.game_engine.round = -1;
	var round = _this.loosers.length;
	if (no_moves) round += 1;
	if (this.duel) game_data['utils'].update_stat({'type': 'duel_fail', 'duel_fail': true, 'level': game_data['current_level']['level_id'] + 1, 'amount_inc': no_moves ? 1 : 0});
	else game_data['utils'].update_stat({'type': 'level_fail', 'level_fail': true, 'level': _this.level_id + 1, 'sub_action': round, 'amount_inc': no_moves ? 1 : 0, 'reason': no_moves ? 'no_moves' : 'speed'});
	game_data['task_manager'].level_result({'win': false});
	game_data['sales_manager'].level_finished(true, _this.level_id);
	game_data['game_request'].request({'tournament_failed': true, 'round': _this.loosers.length, 'level_id': _this.level_id}, function(resp){
		game_data['game_windows'].close_window();
		_this.tid_fail_window = setTimeout(function() {
			_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_failed', 'level_id': _this.level_id, 'duel': _this.duel });
			if (game_data['tornado']) {
				game_data['tornado'].alpha = 0
			}
			setTimeout(function() {
				_this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'fail': true});
				setTimeout(() => {
					// game_data['sales_manager'].sale_event('level_lost');
				}, 500);
				_this.clear_level();	
			}, 500);
		}, 500);
	});
},

level_finished() {
	var i = 0;
	var _this = this;
	if (!this.is_level_finished) {
		this.is_level_finished = true;				
		clearTimeout(this.tid_auto_hint);
		var _stars = this.user_stars;
		if (_this.duel) {
			_stars = 3;
			game_data['utils'].update_stat({'type': 'duel_complete', 'duel_complete': true, 'level': game_data['current_level']['level_id']});
		}
		else game_data['utils'].update_stat({'type': 'level_complete', 'level_complete': true, 'stars': _stars, 'level': _this.level_id + 1});
		game_data['task_manager'].level_result({'win': true, 'duel': this.duel});

		var replay = this.passing && this.level_id < game_data['user_data']['levels_passed'].length
		game_data['game_request'].request({'tournament_finished': true, 'passing': this.passing, 'stars': _stars,
					'score': _this.score, 'level_id': _this.level_id}, function(resp){	
			clearTimeout(_this.tid_loading);
			if ('week_id' in resp) game_data['week_id'] = resp['week_id'];
			var new_chest_stars = 'new_chest_stars' in resp ? resp['new_chest_stars'] : 0;
			
			var window_id = 'level_complete';
			if (_this.duel) window_id = 'level_complete_duel';
			_this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'not_update_bonus': true});
			setTimeout(function() {
				
				_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': window_id, 'score': _this.score, 
								'level_id': _this.level_id, 'stars': _stars, 'passing': _this.passing, 'replay': replay,
								'chest_id': resp['chest_id'],
								'new_chest_stars': new_chest_stars,
								'error': resp['error']
							 });	
				_this.destroy_level();
				setTimeout(() => {
					game_data['sales_manager'].level_finished(false);
				}, 500);

				_this.game_engine.round = -1;
			}, 500);
			// game_data['utils'].user_score_updated();
		});			
	}
},


handler_field_appeared(params) {
	//if (!(this.is_tutorial && this.level_id == 2))
	this.hide_overlay();
	this.cards_total = params['total'];
	this.field_appeared = true;		
	setTimeout(() => {
		// if (!this.is_level_finished) this.competitors_panel.StartBots();
	}, 1000);
	
	if (this.is_tutorial && this.tut_start_object) {
		
		// game_data['game_tutorial'].start_tutorial(this.tut_start_object);
	}
	//else this.reset_hint();
	this.tut_start_object = null;
},

reset_hint() {
	if (this.auto_hint_delay > 0) {
		clearTimeout(this.tid_auto_hint);
		this.tid_auto_hint = setTimeout(()=> { this.show_hint();}, this.auto_hint_delay);
	}
},

show_hint() {
	
	this.reset_hint();
	if (this.level_id <= 10 && this.field_appeared && (!game_data['game_tutorial'].has_tutorial || game_data['game_tutorial'].hiding())) {
		this.game_engine.show_hint();
	}
},


handler_no_moves_preafail (params) { 

},
handler_no_moves_hide (quick = false, id = null) { 

},


handler_no_moves() { 
	
},

	
start_fail_events(obj) {
	
},


tutorial_finished() {
	
	//this.reset_hint();
},

handler_activate_booster() {
	var delta = 5;
	var pt1, pt2, pt3, pt4;
	var _x = this.game_engine.dx;
	var _y = this.game_engine.dy;
	pt1 = new Phaser.Geom.Point(_x + (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1), _y - (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1) );
	pt2 = new Phaser.Geom.Point(_x - (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1), _y + (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1) );
	pt3 = new Phaser.Geom.Point(_x - (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1), _y - (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1) );
	pt4 = new Phaser.Geom.Point(_x + (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1), _y + (Math.random() * delta ) * (Math.random() > 0.5 ? -1 : 1) );
	game_data['scene'].tweens.add({targets: this.game_engine, x: pt1.x, y: pt1.y, duration: 40});
	game_data['scene'].tweens.add({targets: this.game_engine, x: pt2.x, y: pt2.y, delay: 40, duration: 80});
	game_data['scene'].tweens.add({targets: this.game_engine, x: pt3.x, y: pt3.y, delay: 120, duration: 80});
	game_data['scene'].tweens.add({targets: this.game_engine, x: pt4.x, y: pt4.y, delay: 200, duration: 80});
	game_data['scene'].tweens.add({targets: this.game_engine, x: _x, y: _y, delay: 280, duration: 80});
},


handler_event(params) {
	switch (params['event']) {
		case 'FIELD_APPEARED':
			this.handler_field_appeared(params);
		break;
		case 'NO_MOVES_PREFAIL':
			this.handler_no_moves_preafail(params);
		break;
		case 'NO_MOVES_HIDE':
			this.handler_no_moves_hide();
		break;
		case 'NO_MOVES':
			this.handler_no_moves(params);
		break;
		case 'ACTIVATE_BOOSTER':
			this.handler_activate_booster(params);
		break;
		case 'LEVEL_COMPLETE':
			this.handler_level_complete(params);
		break;    
		case 'MOVE_MONEY_GEM':
			this.handler_level_coin(params);
		break;
		case 'LEVEL_FINISHED_2':
			this.handler_level_finished(params)
		break;
		case 'GOLDEN_REMOVE':
			this.handler_golden_remove(params)
			break;
		case 'GOLDEN_RECOVER':
			this.handler_golden_recover(params)
			break;
		case 'use_booster': 
			// this.competitors_panel.blink_booster(params['id']);
			break;
		case 'SET_BOOSTER_STATE':
			this.handler_set_booster_state(params);
		break;
		case 'BOT_FINISHED':
			console.log(params.bot, params.id, 'bot finished');
			break;
		case 'PLAYER_FINISHED':
			console.log('player finished');
			break;
		default:
			this.emitter.emit('EVENT', params);
		break;
	}
},

get_money_pt() {
	return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.money_container.x, this.money_container.y));
},

destroy_level() {
	game_data['error_history'].push('gp10');
	this.game_engine.level_complete(true);
	//this.game_engine.destroy_level();
	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'steps'});    
	this.clear_level();
},

update_money(obj) {
	if (obj && obj['booster']) this.handler_remove_booster_money(obj);
	if (this.money_txt) this.money_txt.text = String(game_data['user_data']['money']);
	if (obj && obj['ig_init']) {
		var txt = this.money_txt.text;
		this.money_txt.text = '';
		this.money_txt.text = txt;
	}
},

handler_buy_money() {    
	if (!game_data['game_tutorial'].has_tutorial) {
		if ((game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') && game_data['inapp_payments']) 
			this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'direct_click': true});
		else game_data['utils'].show_tip({'pt': this.get_money_pt(), 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'money', 'values': []}); 
	}
},

handler_options() {
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'options', 'with_exit': true, 'level_id': this.level_id, 'duel': this.duel, 'round': this.current_field});
},

update_language() {
	this.set_round_text();
	// this.competitors_panel.update_language();
},

game_mode_change(params) {
	this.user_money_plus.visible = (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only');
},

init_particles() {
	this.allow_particles_move = true;
	this.particles = []
	
	var i = 0;
	var half = 20;
	for (i = 0; i < half; i++) {
		this.particles.push({'mc': new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'particle11'), 'tween': null});
	}
	for (i = 0; i < this.particles.length; i++) 
		this.start_particle(this.particles[i]);
},

stop_particle() {
	this.allow_particles_move = false;
	for (i = 0; i < this.particles.length; i++) 
		this.particles[i]['mc'].visible = false;
},

start_particle(obj) {    
	this.particle_speed = 30;
	var mc = obj['mc'];
	mc.setScale(0.6,0.6);
	mc.visible = true;
	if (obj['tween']) obj['tween'].stop();

	mc.x = parseInt(Math.random() * loading_vars['W']);
	mc.y = parseInt(Math.random() * loading_vars['H']);
	this.add(mc);
	var dx = ((Math.random() * this.particle_speed) + 5) * (Math.random() < 0.5 ? -1 : 1);
	var dy = ((Math.random() * this.particle_speed) + 5) * (Math.random() < 0.5 ? -1 : 1);
	this.move_particle(obj, dx, dy);
},
move_particle(obj, dx, dy) {
	var _this = this;
	var mc = obj['mc'];
	if (obj['tween']) obj['tween'].stop();
	obj['tween'] = game_data['scene'].tweens.add({targets: mc, x: mc.x + dx, y: mc.y + dy, duration: 2000, onComplete: function () {
		obj['tween'] = null;
		dx += (Math.random() - 0.5) * 20;
		dy += (Math.random() - 0.5) * 20;
		if (dx > _this.particle_speed) dx = _this.particle_speed;
		else if (dx < -_this.particle_speed) dx = -_this.particle_speed;
		if (dy > _this.particle_speed) dy = _this.particle_speed;
		else if (dy < -_this.particle_speed) dy = -_this.particle_speed;

		if (mc.x > loading_vars['W']) mc.x = 0;
		else if (mc.x < 0) mc.x = loading_vars['W'];
		if (mc.y > loading_vars['H']) mc.y = 0;
		else if (mc.y < 0) mc.y = loading_vars['H'];
		
		if (_this.allow_particles_move) _this.move_particle(obj, dx, dy);
	}});
},



update_difficulty_mode(relax) {
	this.is_relax = relax;
},


handler_level_coin(params) {
	var _this = this;
	
	var start_pt = game_data['utils'].toLocal(this.moving_holder, params['pt']);
	var end_pt;
	game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'coin_clicked'});
	var coin = new Phaser.GameObjects.Image(this.scene, start_pt.x, start_pt.y, "common1", "gem_money"); 
	coin.scale = 0.3;
	coin.alpha = 0;
	game_data['scene'].tweens.add({targets: coin, alpha: 1, duration: 50});
	game_data['scene'].tweens.add({targets: coin, scale: 1, ease: 'Back.easeOut', duration: 150});
	this.moving_holder.add(coin);
	end_pt = game_data['utils'].toLocal(this.moving_holder, new Phaser.Geom.Point(loading_vars['W']/2, 35));
		
	var hide_delay = 300;
	var amount = game_data['level_coins']['amount'];
	if (!game_data['in_app_items']) amount = game_data['level_coins']['free_amount'];
	var _y = this.money_container.y;
	this.scene.tweens.add({targets: this.container_money_box, y: _y + 10, duration: 300, onComplete: function () {
		_this.scene.tweens.add({targets: _this.container_money_box, y: _y, duration: 100,});
	}});

	game_data['scene'].tweens.add({targets: coin, x: end_pt.x, y: end_pt.y, duration: 500, delay: 200, onComplete: function () {
		game_data['utils'].add_light_stars(end_pt, _this.moving_holder, function() {});
		_this.update_money_box(game_data['utils'].get_moneybox() + amount);
		game_data['utils'].update_stat({'find_coin': true, 'amount_inc': amount,});
		let obj = {'find_coin': true}
		game_data['in_app_items'] ? obj['amount'] = amount : obj['free_amount'] = amount
		game_data['game_request'].request(obj, function(res){
			_this.emitter.emit('EVENT', {'event': 'update_money_box'});
			_this.update_money_box();
		});	
		game_data['scene'].tweens.add({targets: coin, alpha: 0, duration: hide_delay, onComplete: function () {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'coin_to_pig'});
			game_data['scene'].tweens.add({targets: _this.container_money_box, y: _y + 10, duration: 200, onComplete: function () {                                          
				game_data['scene'].tweens.add({targets: _this.container_money_box, y: -110, duration: 300, onComplete: function () {            
					coin.destroy();
				}});    
			}});
		}});
	}});
	setTimeout(() => {
		this.add_money_particle({'pt_start': start_pt, 'pt_end': end_pt, 'holder':this.moving_holder })	
	}, 200);
	
},

add_money_particle(params) {
	var pt_start = params['pt_start'];
	var pt_end = params['pt_end'];
	if (!('curve' in params)) params['curve'] = new Phaser.Geom.Line(pt_start.x, pt_start.y, pt_end.x, pt_end.y)
	var duration = 'duration' in params ? params['duration'] : 500;
	var max_part = 'silver' in params ? 4 : 10;
	var freq = 'silver' in params ? 110 : 50;
	var start_scale = 'silver' in params ? 1.5 : 0.8;
	var end_scale = 'silver' in params ? 0.8 : 0.4;
	var config = {
		alpha: { start: 0.8, end: 0.1 },
		scale: { start: start_scale, end: end_scale },
		speed: { min: -15, max: 15 },
		gravityY: 200,
		//blendMode: 'ADD',
		frequency: freq,
		maxParticles: max_part,
		lifespan: duration,
		emitZone: { type: 'edge', source: params['curve'], quantity: max_part, yoyo: false }
	};
	var key = 'tile' in params ? params['tile'] : 'coin';
	var prtcl = game_data['scene'].add.particles('common1', key);
   
	prtcl.createEmitter(config);
	params['holder'].add(prtcl);
	setTimeout(() => {
		prtcl.destroy();
	}, 900);
},



handler_remove_booster_money(params) {
	var _this = this;
	var amount = params['amount'];
	if (!this.remove_money) {
		this.remove_money = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.remove_money.visible = false;
		this.remove_money_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, '', {fontFamily:"font1", fontSize: 40, color:"#f6caa0", stroke: '#07404e', strokeThickness: 3});
		this.remove_money_txt.setOrigin(1, 0.5);
		var temp = new Phaser.GameObjects.Image(this.scene, 20, 0, 'common1', 'coin');
		temp.setScale(0.6,0.6);
		this.remove_money.add(this.remove_money_txt);
		this.remove_money.add(temp);
		this.add(this.remove_money);
	}
	if (amount > 0) {
		this.remove_money_txt.text = String(amount);
		this.remove_money.alpha = 0;
		this.remove_money.visible = true;
		this.remove_money.x = this.money_container.x;
		this.remove_money.y = this.money_container.y;
		game_data['scene'].tweens.add({targets: _this.remove_money, alpha: 1, duration: 100});
		game_data['scene'].tweens.add({targets: _this.remove_money, alpha: 0, delay: 500, duration: 150});
		game_data['scene'].tweens.add({targets: _this.remove_money, y: _this.remove_money.y + 150, duration: 650, onComplete: function () {
			_this.remove_money.alpha = 0;
			_this.remove_money.visible = false;
		}});
	}
},

pause_game() {
	this.game_engine.pause_game();
},
resume_game() {
	this.game_engine.resume_game();
},

get_tutorial_holes(obj) {
	var holes = [];
	var _type = '';

	if (this.is_tutorial) {
		_type = obj['type']				
		if (_type == 'competitors') {
			// holes = this.competitors_panel.get_holes();
		}
		else holes = this.game_engine.get_tutorial_holes(obj);
		return holes;
	}
},

handler_golden_remove(params) {
	this.score += 1;
	var timeout = 10;
	
	if (params.pt) {
		timeout = 250;
		this.fly_gold_particle(params.pt);
	}
	setTimeout(() => {
		this.update_score(); 
	}, timeout);
	if (this.allow_sound) {
		this.allow_sound = false;
		setTimeout(() => {
			game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_golden'});
			this.allow_sound = true;
		}, timeout);
	}
},
handler_golden_recover(params) {
	if (this.score > 0) {
		this.score -= 1;
		this.update_score();
	}
},

fly_gold_particle(pt_start) {
	var pt_end = game_data['utils'].toGlobal(this.score_txt, new Phaser.Geom.Point(0,0));
	var curve = new Phaser.Geom.Line(pt_start.x, pt_start.y, pt_end.x, pt_end.y);
	var timeout = 1500;
	var prtcl = game_data['scene'].add.particles('common1', 'particle11');
	var prtcl2, prtcl3;
	prtcl.createEmitter({
		scale: { start: 1.5, end: 0.1 },
		speed: { min: -15, max: 15 },
		frequency: 20,
		maxParticles: 20, //30 , 25
		//blendMode: 'ADD',
		emitZone: { type: 'edge', source: curve, quantity: 20, yoyo: false }
	});
	this.moving_holder.add(prtcl);
	setTimeout(() => {
		prtcl2 = game_data['scene'].add.particles('common1', 'particle12');
		prtcl2.createEmitter({
			scale: { start: 1.5, end: 0.1 },
			speed: { min: -15, max: 15 },
			frequency: 20,
			maxParticles: 18,
			//blendMode: 'ADD',
			emitZone: { type: 'edge', source: curve, quantity: 18, yoyo: false }
		});
		this.moving_holder.add(prtcl2);
	}, 30);
	setTimeout(() => {
		prtcl3 = game_data['scene'].add.particles('common1', 'particle13');
		prtcl3.createEmitter({
			scale: { start: 1.5, end: 0.1 },
			speed: { min: -15, max: 15 },
			frequency: 20,
			maxParticles: 18,
			//blendMode: 'ADD',
			emitZone: { type: 'edge', source: curve, quantity: 18, yoyo: false }
		});
		this.moving_holder.add(prtcl3);
	}, 70);
	setTimeout(() => {
		if (prtcl) prtcl.destroy();
		if (prtcl2) prtcl2.destroy();
		if (prtcl3) prtcl3.destroy();
	}, timeout);

},

update_score() {
	if (!this.score_updating) {
		this.score_updating = true;
		this.need_score_update = false;
		var _this = this;
		game_data['scene'].tweens.add({targets: _this.score_txt, scale: 1.2, duration: 250, onComplete: function () {
			_this.score_txt.text = String(_this.score);
			game_data['scene'].tweens.add({targets: _this.score_txt, scale: 1, duration: 250, onComplete: function () {
				_this.score_updating = false;
				if (_this.need_score_update && _this.score_txt.text != String(_this.score)) _this.update_score();
			}});
		}});
	}
	else this.need_score_update = true;
},
set_round_text() {

	var val = String(this.current_field) + '/' + String(this.total_fields);
	var res = game_data['utils'].generate_string({'scene_id': 'game_play', 'item_id': 'round', 'phrase_id': '1', 'values': [val], 'base_size': 22});	
	this.round_txt.setStyle({fontFamily:"font1", fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3, align: 'center'});
	this.round_txt.text = res['text'];

},
handler_score_tip() {
	var pt = new Phaser.Geom.Point(this.container_score.x, this.container_score.y+20);
	pt = game_data['utils'].toGlobal(this, pt);
	game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'golden', 'values': []});
},
handler_round_tip() {
	var pt = new Phaser.Geom.Point(this.container_round.x, this.container_round.y+20);
	pt = game_data['utils'].toGlobal(this, pt);
	game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'round', 'values': []});
},

show_overlay() {
	
}

});