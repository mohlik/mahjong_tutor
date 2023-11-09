var GameMap = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GameMap (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
	},


init(params) {
	game_data['game_map'] = this;
	this.rating_sprite = params['rating_sprite'];
	this.wait_paid = false;
	this.is_wait_started = false;
	this.tid_level_auto_start = 0;
	this.create_assets();
	
	if (!('wait' in game_data['user_data']))  game_data['user_data']['wait'] = {};
	if (!('timeout' in game_data['user_data']['wait'])) game_data['user_data']['wait']['timeout'] = 0;
	this.wait_timestamp = game_data['utils'].get_time();
	this.timer_wait = this.scene.time.addEvent({
		delay: 1000,
		callback: this.timer_wait_handler,
		callbackScope: this,
		loop: true
	});
	this.challenge_timer = this.scene.time.addEvent({
		delay: game_data['challenges']['timeout'] * 1000,
		callback: this.handler_challenge,
		callbackScope: this,
		loop: true
	});
	this.update_language();
	this.tid_loading = null;
	this.sales = [];
	
	//setTimeout(() => {game_data['game_tutorial'].start_tutorial({'tutorial_type': 'game_map', 'tutorial_id': '5' })}, 5000);
},



handler_play(e) {
	game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'continue'});	
	let total_levels = game_data['total_levels'];
	let level_id = (game_data['utils'].get_passed_amount() < total_levels) ? game_data['utils'].get_passed_amount() : total_levels - 1;
	let extended_level_id = level_id % game_data['original_levels_amount']

	if (game_data['levels'] && extended_level_id in game_data['levels']) {
		this.start_level({'level_id': level_id});
	}
},

handler_replay() {
	if (this.auto_start_obj) {
		var _obj = Object.assign({}, this.auto_start_obj)
		this.auto_start_obj = null;
		level_id = _obj['level_id'];
		
		if ('type' in _obj && _obj['type'] == 'duel') {
			this.start_duel(_obj);
		}
		else {
			this.start_level({'level_id': level_id});
		}
	}
	
},

block_interface() {
	if (this.wnd_overlay) this.wnd_overlay.visible = true;
},
unblock_interface() {
	if (this.wnd_overlay) this.wnd_overlay.visible = false;
},

reset_music() {
	game_data['audio_manager'].sound_event({'stop_all': true});	
	game_data['audio_manager'].sound_event({'play': true, 'loop': true, 'sound_type': 'music', 'sound_name': 'music_map', 'audio_kind': 'music', 'map': true});	
},

show_map(obj) {
	if (!('fail' in obj)) this.reset_music();
	if ('destroy_timer' in obj || obj['complete']) this.clear_wait(false);
	this.block_interface();
	if (obj['init']) {
		this.map_manager.update_user_data();
		
	}

	var passed = game_data['utils'].get_passed_amount();
	
	if (passed === 0) {
		var tut_obj = {'id': 'map1', "text_type": "game_play", "text_id": "map1", 'steps': game_data['tutorial']['map1']};
		game_data['game_tutorial'].start_tutorial({'tutorial_type':'learning', 'info': tut_obj});
		this.start_on_finish_tutorial = {'success':true};
		this.tid_level_auto_start = setTimeout(() => {
			if (this.start_on_finish_tutorial) {
				game_data['game_tutorial'].finish_tutorial();
				this.start_level({'level_id': 0});
			}
		}, 8000);
	}
	else if (passed == 1 && 'complete' in obj) {
		this.map_manager.hide_arrow();
		this.map_manager.update_map(obj);
		setTimeout(() => {
			var tut_obj = {'id': 'map2', "text_type": "game_play", "text_id": "map2", 'steps': game_data['tutorial']['map2']}
			
			game_data['game_tutorial'].start_tutorial({'tutorial_type':'learning', 'info': tut_obj});
		}, 1000);
	}
	else if (passed == 2 && 'complete' in obj) {
		this.map_manager.update_map(obj);
		var tut_obj = {'id': 'map3', "text_type": "game_play", "text_id": "map3", 'steps': game_data['tutorial']['map3']};
		game_data['game_tutorial'].start_tutorial({'tutorial_type':'learning', 'info': tut_obj});
		this.map_manager.hide_arrow();
	}
	else {
		this.map_manager.update_map(obj);
	}

	if (obj['complete']) {
		this.map_manager.show_arrow();
		if (!game_data['user_data']['tutorial']['shortcut'] && loading_vars['net_id'] == 'ig' && passed >= 3) {
			game_data['utils'].check_create_shortcut()
		}
	}

	var tut_id = -1;
	if (obj['first_complete']) {
		
		tut_id = passed + 1;
		if (tut_id in game_data['tutorial']) {
			var tut_obj = {'id': tut_id, "text_type": "game_map", "text_id": "5", 'steps': game_data['tutorial']['5']};
			var timeout = 200;
			setTimeout(() => {
				game_data['game_tutorial'].start_tutorial({'tutorial_type': 'game_map', 'info': tut_obj })
			}, timeout);
			
		}
	}
	game_data['utils'].try_subscribe();
	
	/*setTimeout(() => {
		game_data['game_tutorial'].start_tutorial({'tutorial_type': 'game_map', 'tutorial_id': 8})
	}, 5000);*/
	
	if (!obj['not_update_bonus']) game_data['utils'].check_bonuses();
	this.update_buttons(obj['first_complete']);
	this.unblock_interface();
	setTimeout(() => {
		this.update_sale(true);
	}, 1000)
	
	// game_data['utils'].clean_gem_timers()
},

cancel_tournament(obj = null) {			
	this.unblock_interface();
	this.await_mark = 0;
	game_data['user_data']['wait']['timeout'] = 0;
	this.wait_timestamp = game_data['utils'].get_time();
	this.wait_before_start.visible = false;
	if (obj && 'get_level_fail' in obj && obj['get_level_fail'])
		game_data['game_request'].request({'cancel_tournament':true, 'get_level_fail': true}, function(obj) {});
	else
		game_data['game_request'].request({'cancel_tournament':true}, function(obj) {});
	game_data['utils'].update_stat({'cancel_tournament': true});
},


timer_wait_handler(e) {	
	var timestamp = game_data['utils'].get_time();	
	var diff = parseInt((timestamp - this.wait_timestamp) / 1000);
	this.wait_timestamp += diff * 1000;
	var allow_stat = this.wait_before_start.visible;
	this.wait_before_start.visible = (game_data['user_data']['wait']['timeout'] > 0);
	if (game_data['user_data']['wait']['timeout'] > 0) {
		game_data['user_data']['wait']['timeout'] -= diff;
		let wait_current = game_data['user_data']['wait']['timeout'];
		var min, sec = 0;
		var txt = ''
		min = Math.floor(wait_current / 60);
		sec = wait_current - (min * 60);
		txt = String(min) + ':';
		if (sec < 10) txt += '0';
		txt += String(sec);
		if (game_data['user_data']['wait']['timeout'] < 0) txt = '0:00';
		this.wait_txt.text = txt;
	}
	else {
		if (allow_stat) game_data['utils'].update_stat({'type': 'wait_recovered'});
		this.wait_txt.text = '0:00';
	}
	game_data['wait_txt'] = this.wait_txt.text;
	let current_timestamp = game_data['utils'].get_time()
	this.update_sale_timer();
	// if (this.sale_container.visible)  this.sale_container.visible = (Math.round(game_data['day_end_time'] - ((current_timestamp - game_data['start_timestamp']) / 1000)) > 0);
},

clear_wait(paid = true) {			
	game_data['user_data']['wait']['timeout'] = 0;
	this.wait_before_start.visible = false;
	if (paid) {
		this.wait_paid = true;
	}
	else this.auto_start_obj = null;
},

clear_wait_paid() {			
	this.wait_paid = false;
},

set_wait(params) {			
	if (!this.is_wait_started) {
		game_data['game_request'].request({'set_wait': true},function(){});
		game_request.update_stat({'set_wait': true});
		this.is_wait_started = true;
		game_data['user_data']['wait']['timeout'] = game_data['wait_before_start'];
	}
	
},

update_money_box(is_init = false) {
	var amount = 0;
	var prev_amount = 0;
	//if (game_data['last_game_mode'] != 'offline') {
		if (is_init) {
			if (!('money_box' in game_data['user_data']))
				game_data['user_data']['money_box'] = {};
			if (!('amount' in game_data['user_data']['money_box']))
				game_data['user_data']['money_box']['amount'] = 0;
		}
		if (this.money_box_amount_txt && this.money_box_amount_txt.text != '') 
			prev_amount = parseInt(this.money_box_amount_txt.text);
		
		var max_amount = game_data['money_box']['capacity'];
		var user_amount = game_data['utils'].get_moneybox();
		
		// amount = Math.min(game_data['user_data']['money_box']['amount'], max_amount);
		amount = Math.min(user_amount, max_amount);
		this.container_money_box.amount = amount;
		this.money_box_amount_txt.text = amount;	
		
		if ((is_init && amount >= max_amount) || (amount > prev_amount && amount >= max_amount)) {
			game_data['notification_manager'].set_notification(this.container_money_box, 'money_box');
		}
	//}
	
},



update_money(with_anim = false) {	
	if (with_anim) {
		var _this = this;
		if (game_data['user_data']['money'] != parseInt(this.money_txt.text))
			game_data['scene'].tweens.add({targets: _this.money_txt, scale: 1.3, duration: 250, onComplete: function(){
				_this.money_txt.text = game_data['user_data']['money'];
				game_data['scene'].tweens.add({targets: _this.money_txt, scale: 1, duration: 250});
			}});
	}
	else {
		if (this.money_txt) this.money_txt.text = game_data['user_data']['money'];
	}
},


handler_money_box() {	
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'money_box', 'direct_click': true});
	game_data['notification_manager'].remove_notification(this.container_money_box);
},


handler_event(params) {
	switch (params['event']) {
		case 'start_level': 
			
			this.auto_start_obj = null;
			this.start_level(params)
			break;
		default:
			this.emitter.emit('EVENT', params);
			break;
	}
},

handler_options(params) {	
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'options'});
	// this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'social_reward', 'type': 'wall_post'});
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'boosters_info'});
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'challenge_duel', 'settings': {'level_id': 20, 'challenge': true}});
	//game_data['user_data']['wait']['timeout'] = 1000
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_failed', 'level_id': 5});
	//game_data['sales_manager'].sale_event('game_loaded');
	
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'no_sales'});
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'purchase_failed'});
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_complete', 'stars': 2, 'level_id':1, 'score': 555, 'chest_id': -1 });
	// this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_complete', 'score': 33, 
	// 							'level_id': 20, 'stars': 3, 'passing': true, 'replay': false,
	// 							'chest_id': 3,
	// 							'new_chest_stars': 2,
	// 							'error': []
	// 						 });
	// this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_complete_duel', 'score': 33, 
	// 							'level_id': 20, 'stars': 3, 'passing': true, 'replay': false,
	// 							'chest_id': 3,
	// 							'new_chest_stars': 2,
	// 							'error': []
	// 						 });

},

get_money_pt() {
	return game_data['utils'].toGlobal(game_data['game_map'], 
				new Phaser.Geom.Point(game_data['game_map'].money_container.x, game_data['game_map'].money_container.y));
},

update_language() {	
	var res;
	res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'button_play', 'phrase_id': '1', 'values': [], 'base_size': 38});	
	this.button_play_txt.setStyle({fontFamily:"font1", fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 4});
	this.button_play_txt.text = res['text'];

	res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'button_free', 'phrase_id': '1', 'values': [], 'base_size': 24});		
	this.free_txt.setFontSize(res['size']);
	this.free_txt.text = res['text'];

	this.rating.update_language();
	this.chest_manager.update_language();
},


update_chests() {
	this.chest_manager.update_manager();
},

update_free_money_button() {
	var passed = game_data['user_data']['levels_passed'].length;
	this.container_free.visible = passed >= game_data['tasks_start_level'] || (allow_rewarded_ads && (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'video_only'));
},
update_buttons(first_complete = false, game_mode = false) {

	this.update_free_money_button();
	this.update_money_box(game_mode);
	this.update_star_chest(0);
	this.challenge_buttons_update();
	this.container_money_box.visible = this.container_money_box.amount > 0 || game_data['utils'].get_passed_amount() >= game_data['level_coins']['start_level'];
	this.user_money_plus.visible = (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only');
	var btns = [this.money_container];
	if (this.container_money_box.visible) btns.push(this.container_money_box);
	if (this.container_star_chest.visible) btns.push(this.container_star_chest);

	if (this.container_free.visible) btns.push(this.container_free);
	var pos = this.btn_pos[btns.length - 1];
	for (var i = 0; i < Math.min(pos.length,btns.length); i++) {
		btns[i].x = pos[i];
	}
	
	if (first_complete) this.update_show_tutorials();
	
},

update_show_tutorials() {
	var tutorial_showed = false;
	var passed = game_data['utils'].get_passed_amount();
	if (this.container_free.visible) {
		if (!game_data['user_data']['tutorial']['tasks'] && passed >= game_data['tasks_start_level']) {
			//tutorial_showed = true;
			game_data['user_data']['tutorial']['tasks'] = true;
			var pt = game_data['utils'].toGlobal(this.container_free, new Phaser.Geom.Point(35,35)); 
			game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'tasks', 'values': []});
			game_data['game_request'].request({'update_tutorial': true, 'tutorial_id': 'tasks'}, function(){});
			this.tutorial_tab = 'tasks';
		}
	}
	if (!tutorial_showed && this.container_star_chest.visible && !game_data['user_data']['tutorial']['star_chest']) {
		this.handler_star_chest();
		game_data['user_data']['tutorial']['star_chest'] = true;
		game_data['game_request'].request({'update_tutorial': true, 'tutorial_id': 'star_chest'}, function(){});
	}
},

handler_free_money() {
	var task_warning = this.container_free && this.container_free.notification && this.container_free.notification.active;
	var obj = {'event': 'show_window', 'window_id': 'free_money', 'task_warning': task_warning};
	if (this.tutorial_tab) obj['tab'] = String(this.tutorial_tab);
	this.tutorial_tab = null;
	this.emitter.emit('EVENT', obj);
	game_data['notification_manager'].remove_notification(this.container_free);

},

create_assets() {
	var _this = this;
	var temp;
	var pt;
	var i;
	this.map_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.map_holder);

	this.shadows = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.shadows)
	temp = new Phaser.GameObjects.Image(this.scene, -10, 0, 'common1', 'button_shadow');	
	temp.setOrigin(0,0);
	temp.setScale((loading_vars['W'] + 20) / temp.width, 1);
	this.shadows.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, -10, loading_vars['H'], 'common1', 'button_shadow');	
	temp.setOrigin(0,0);
	temp.setScale((loading_vars['W'] + 20) / temp.width, -1);
	this.shadows.add(temp);

	pt = game_data['graphics_manager'].get_pos('btn_invite');
	this.button_invite = new CustomButton(this.scene, pt.x, pt.y, this.handler_invite, 'common1', 'but_options1', 'but_options2', 'but_options3', this, null, null, 0.9);
	this.add(this.button_invite);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'icon_invite');
	temp.scale = 0.7
	this.button_invite.add(temp);
	if (loading_vars['net_id'] != 'ig') this.button_invite.visible = false

	//profile
	pt = game_data['graphics_manager'].get_pos('profile');
	this.profile_cont = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
	this.add(this.profile_cont);
	this.profile_cont.photo = new Phaser.GameObjects.Container(this.scene, 0,0);
	this.profile_cont.add(this.profile_cont.photo);
	temp = new CustomButton(this.scene, 0, 0, this.handler_profile, 'common1', 'ava_user_frame', 'ava_user_frame', 'ava_user_frame', this);
	/*temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'ava_user_frame');
	temp.setInteractive();
	temp.on('pointerup', this.handler_profile, this)*/
	this.profile_cont.add(temp);
	var txt = new Phaser.GameObjects.Text(this.scene, 0, 45, '', {fontFamily:"font1", fontSize: 16, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
	txt.setOrigin(0.5);
	this.profile_cont.add(txt);
	game_data['utils'].load_user_photo(loading_vars['user_id'], function(res){
		if (res['success'] && res['photo']) {
			var photo = res['photo'];
			var scale = 70 / photo.width;
			photo.setScale(scale);
			_this.profile_cont.photo.add(photo);
		}
		if (res['first_name']) { 
			txt.text =  game_data['users_info'][loading_vars['user_id']]['first_name'].substring(0, 14);
		}
	});	

	//chest_manager
	pt = game_data['graphics_manager'].get_pos('chest_manager');
	this.chest_manager = new ChestManager();
	this.chest_manager.x = pt.x;
	this.chest_manager.y = pt.y;
	this.chest_manager.init();
	this.chest_manager.emitter.on('EVENT', this.handler_event, this);

	var _y = 38;
	var _x = [loading_vars['W']/2 - 240, loading_vars['W']/2 - 80, loading_vars['W']/2 + 80, loading_vars['W']/2 + 240];

		pt = game_data['graphics_manager'].get_pos('container_play');
		var _default_x = pt.x; //loading_vars['W']/2
		this.btn_pos = [
			[_default_x],
			[_default_x - 80, _default_x + 80],
			[_default_x - 160, _default_x, _default_x + 160],
			[_default_x - 240, _default_x - 80, _default_x + 80, _default_x + 240]
		]

	//button money
	this.money_container = new Phaser.GameObjects.Container(this.scene,  _x[0], _y);
	this.add(this.money_container);
	this.money_button = new CustomButton(this.scene, 0, 3, this.handler_buy_money, 'common1', 'but_out', 'but_over', 'but_down', this);
	this.money_container.add(this.money_button);
	temp = new Phaser.GameObjects.Image(this.scene, -30, -4, "common1", "money_ico");
	this.money_container.add(temp);
	this.user_money_plus = new CustomButton(this.scene, -18, -18, this.handler_buy_money, 'common1', 'plus1', 'plus2', 'plus3', this);
	this.money_container.add(this.user_money_plus);
	this.money_txt = new Phaser.GameObjects.Text(this.scene, 30, -3, '0', {fontFamily:"font1", fontSize: 24, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
	this.money_txt.setOrigin(0.5);
	this.money_container.add(this.money_txt);

	// Button money box
	this.container_money_box = new Phaser.GameObjects.Container(this.scene, _x[1], _y);
	this.add(this.container_money_box);
	this.container_money_box.dx = _x[1];
	
	this.container_money_box.pig_out = new Phaser.GameObjects.Image(this.scene, -28, -4, "common1", "icon_pig_out");
	this.container_money_box.pig_over = new Phaser.GameObjects.Image(this.scene, -28, -4, "common1", "icon_pig_over");
	this.container_money_box.pig_over.visible = false;

	this.button_money_box = new CustomButton(_this.scene, 0, 3, this.handler_money_box, 'common1', 'but_out', 'but_over', 'but_down', this, 
		function(){_this.container_money_box.pig_over.visible = true}, function(){_this.container_money_box.pig_over.visible = false});	
	this.container_money_box.add(this.button_money_box);
	this.container_money_box.add(this.container_money_box.pig_out);
	this.container_money_box.add(this.container_money_box.pig_over);

	this.money_box_amount_txt = new Phaser.GameObjects.Text(this.scene, 30, -3, '0', {fontFamily:"font1", fontSize: 24, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
	this.money_box_amount_txt.setOrigin(0.5);
	this.container_money_box.add(this.money_box_amount_txt);
	//star_chest
	this.container_star_chest = new Phaser.GameObjects.Container(this.scene, _x[2], _y);
	this.add(this.container_star_chest)
	this.container_star_chest.visible = false;
	if (game_data['allow_star_chest']) {	
		this.star_chest_panel = new CustomButton(this.scene, 0, 3, this.handler_star_chest, 'common1', 'but_out', 'but_over', 'but_down', this);
		this.container_star_chest.add(this.star_chest_panel);
		
		this.star_chest_logo = new Phaser.GameObjects.Image(this.scene, -42, -4, 'common2', 'stars_box_icon');
		this.star_chest_logo.scale = 0.8;
		this.container_star_chest.add(this.star_chest_logo);	

		this.star_chest_txt = new Phaser.GameObjects.Text(this.scene, 30, -3, '20/20', {fontFamily: 'font1', fontSize: 24, color:"#F7CA9D",  stroke: '#000000', strokeThickness: 3});
		this.star_chest_txt.setOrigin(0.5);
		this.container_star_chest.add(this.star_chest_txt);
		this.star_chest_amount = 0;
		if (game_data['user_data']['star_chest']) this.star_chest_amount = game_data['user_data']['star_chest']['stars'];
	}


	this.container_free = new Phaser.GameObjects.Container(this.scene, _x[3], _y);
	this.add(this.container_free);
	this.free_panel = new CustomButton(this.scene, 0, 3, this.handler_free_money, 'common1', 'but_out', 'but_over', 'but_down', this);
	this.container_free.add(this.free_panel);
	this.free_logo = new Phaser.GameObjects.Image(this.scene, -46, -4, 'common2', 'free_coins');
	this.free_logo.scale = 0.9;
	//this.free_logo.scaleX = -1;
	//this.free_logo.scale = 75 / this.free_logo.height;
	this.container_free.add(this.free_logo);		
	
	this.free_txt = new Phaser.GameObjects.Text(this.scene, 24, -3, '', {fontFamily: 'font1', fontSize: 24, color:"#F7CA9D",  stroke: '#000000', strokeThickness: 3});
	this.free_txt.setOrigin(0.5);
	this.container_free.add(this.free_txt);

//buttons play
	pt = game_data['graphics_manager'].get_pos('container_play');
	this.container_play = new Phaser.GameObjects.Container(this.scene,  pt.x, pt.y);
	this.button_play = new CustomButton(this.scene, 0, 0, this.handler_play, 'common1', 'button_play1', 'button_play2', 'button_play3', this);
	this.button_play_txt = new Phaser.GameObjects.Text(this.scene, 0, -1, '', {fontFamily:"font1", fontSize: 38, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
	this.button_play_txt.setOrigin(0.5);
	this.button_play.add(this.button_play_txt);	
	
	this.wait_before_start = new Phaser.GameObjects.Container(this.scene, this.button_play.x, this.button_play.y - 50);
	
	this.wait_before_start.visible = false;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'timer_panel');
	this.wait_before_start.add(temp);
	this.wait_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, '14:59', {fontFamily:"font1", fontSize: 25, color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
	this.wait_txt.setOrigin(0.5);
	this.wait_before_start.add(this.wait_txt);
	this.container_play.add(this.button_play);
	this.container_play.add(this.wait_before_start);

	this.button_duel = new CustomButton(this.scene, 230, 0, this.handler_duel, 'common1', 'but_mini1_1', 'but_mini1_2', 'but_mini1_3', this);
	this.container_play.add(this.button_duel);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'duel_icon');
	this.button_duel.add(temp);

	//sale icon
	this.sale_container = new Phaser.GameObjects.Container(this.scene,  450, 605);
	this.add(this.sale_container);
	

	//options
	pt = game_data['graphics_manager'].get_pos('options');
	this.options_button = new CustomButton(this.scene, pt.x, pt.y, this.handler_options, 'common1', 'but_options1', 'but_options2', 'but_options3', this);
	this.add(this.options_button);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "options");
	this.options_button.add(temp);

	pt = game_data['graphics_manager'].get_pos('rating');
	this.rating_container = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
	
	this.rating = new Rating();
	this.rating.emitter.on('EVENT', this.handler_event, this);	
	this.rating_container.add(this.rating);
	
	this.add(this.rating_container);
	this.add(this.chest_manager);
	this.add(this.container_play);
	this.buttons_holder = new Phaser.GameObjects.Container(this.scene, this.container_play.x, this.container_play.y);
	this.add(this.buttons_holder);
	this.rating.init(this.rating_sprite);

	this.map_manager = new MapManager(this.scene);
	this.map_manager.init({'load_first_bg': game_data['user_data']['levels_passed'].length < 20, 'buttons_holder': this.buttons_holder,
		'moving_holder': this.moving_holder, 'map_holder': this.map_holder});
	this.map_manager.emitter.on('EVENT', this.handler_event, this);


	this.update_buttons(false,true);
	/////////block
	this.wnd_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
	this.wnd_overlay.setOrigin(0,0);
	this.wnd_overlay.alpha = 0.2;
	this.add(this.wnd_overlay);
	this.wnd_overlay.setInteractive();
	this.wnd_overlay.visible = false;
	this.bringToTop(this.sale_container)

},

hide_rating() {
	if (this.rating) this.rating.hide();
},

show_rating() {
	if (this.rating) this.rating.show();
},

update() {
	
},

handler_duel() {
	var total_levels = game_data['total_levels'];
	var level_id = (game_data['utils'].get_passed_amount() < total_levels) ? game_data['utils'].get_passed_amount() : total_levels - 1;
	this.start_duel({'level_id': level_id, 'level_type': 'duel'});
},


start_level(_obj) {
	var _this = this;
	this.block_interface();
	game_data['utils'].add_loading(null, 0.3);
	clearTimeout(this.tid_level_auto_start);
	var level_id;
	if (this.auto_start_obj) {
		level_id = this.auto_start_obj['level_id'];
		this.auto_start_obj = null;
	}
	else level_id = _obj['level_id'];
	if (level_id == 1 && loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 6, 'description': 'before_level_1'});
	
	var res1 = this.map_manager.check_locked(level_id);
	if (game_data['game_tutorial'].allow_action({'event': 'level', 'info': level_id}) && 'success' in res1 && res1['success']) {
		
		_this.map_manager.hide_arrow();
		if (_this.tid_loading) {
			clearTimeout(_this.tid_loading);
			_this.tid_loading = null;
		}
		_this.tid_loading = setTimeout(() => {
			game_data['utils'].remove_loading();
		}, 15000);
		
		game_data['utils'].level_start(level_id, 'common', function(res){
			if (_this.tid_loading) {
				clearTimeout(_this.tid_loading);
				_this.tid_loading = null;
			}
			if ('success' in res && res['success']) {
				game_data['utils'].get_competitors_info(false, function(info_users) {
					
					_this.is_wait_started = false;
					var opp = [];
					opp = info_users['user_ids'];
					if (info_users['success']) {
						if (level_id == 1 && loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 7, 'description': 'level_1_loaded'});
						
						var tournament_settings = {};
						tournament_settings['ids'] = opp;			
						var visual_ids = [];
						var competitors_ids = [];
						var pos = 0;
						for (let i = 0; i <  opp.length; i++) {competitors_ids[i] = opp[i]}
						competitors_ids.unshift(loading_vars['user_id']);
						tournament_settings['competitors_ids'] = competitors_ids;	
						for (let i = 0; i <  competitors_ids.length; i++) {visual_ids[i] = competitors_ids[i]}
						pos = parseInt(Math.random() * visual_ids.length);
						if (pos > 0) {
							visual_ids[0] = competitors_ids[pos];
							visual_ids[pos] = competitors_ids[0];
						}
						tournament_settings['visual_ids'] = visual_ids;
						tournament_settings['rating_type'] = 'all';
						tournament_settings['passing'] = true;
						tournament_settings['level_id'] = level_id;
						game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music'});	
						game_data['utils'].remove_loading(() => {
							if (level_id == 2  && loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 27, 'description': 'level_2_wait_competitors'});

							_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'wait_competitors',
																	'settings': tournament_settings,
																	'competitors_ids' : opp,
																	'visual_ids': visual_ids,
																	'start':true,
																	'loosers': []});
							_this.unblock_interface();
						},true);
						_this.auto_start_obj = {'auto_start': true, 'level_id':level_id};
					}
					else {
						_this.cancel_tournament();
						game_data['utils'].remove_loading(null,true);
					}
				});
			}
			else if ('error' in res){
				if ('wait' in res) game_data['user_data']['wait'] = res['wait'];
				_this.unblock_interface();
				game_data['utils'].remove_loading(null,true);
				if (game_data['user_data']['wait']['timeout'] > 0) {
					_this.auto_start_obj = {'auto_start': true, 'level_id':level_id};
					_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'wait_tournament', 'level_id': level_id});
				}
			}
			
		});
	}
	else if ('error' in res1) {
		this.unblock_interface();
		game_data['utils'].remove_loading(null,true);
		game_data['utils'].show_tip({'pt': res1['pt'], 'scene_id': 'game_windows', 'item_id': 'all_stars', 'phrase_id': '2', 'values': []});
	}
	else {
		this.unblock_interface();
		game_data['utils'].remove_loading(null,true);
	}
},


start_duel(_obj) {
	var level_id;
	var _this = this;
	this.block_interface();
	game_data['utils'].add_loading();
	var challenge = 'challenge' in _obj && _obj['challenge'];
	var passing = false
	game_data['is_challenge'] = challenge;

	var _type = 'duel';
	_obj['type'] = _type;
	if (this.auto_start_obj) {
		level_id = this.auto_start_obj['level_id'];
		this.auto_start_obj = null;
	}
	else level_id = _obj['level_id'];
	
	game_data['utils'].add_loading();
	var tid_loading = setTimeout(() => {
		game_data['utils'].remove_loading();
	}, 10000);
	
	var res1 = {'success': true}
	
	if (game_data['game_tutorial'].allow_action({'event': 'level', 'info': level_id}) && 'success' in res1 && res1['success']) {
		_this.map_manager.hide_arrow();
		if (_this.tid_loading) {
			clearTimeout(_this.tid_loading);
			_this.tid_loading = null;
		}
		_this.tid_loading = setTimeout(() => {
			game_data['utils'].remove_loading();
		}, 15000);
		game_data['utils'].level_start(level_id, _type, function(res){
			if (_this.tid_loading) {
				clearTimeout(_this.tid_loading);
				_this.tid_loading = null;
			}
			if ('success' in res && res['success']) {
				game_data['utils'].get_competitors_info((_type == 'duel'), function(info_users) {
					_this.is_wait_started = false;
					var opp = [];
					opp = info_users['user_ids'];
					game_data['error_history'].push('play7');
					
					if (info_users['success']) {
						var tournament_settings = {};
						tournament_settings['ids'] = opp;			
						var visual_ids = [];
						var competitors_ids = [];
						var pos = 0;
						for (let i = 0; i <  opp.length; i++) {competitors_ids[i] = opp[i]}
						competitors_ids.unshift(loading_vars['user_id']);
						tournament_settings['competitors_ids'] = competitors_ids;	
						for (let i = 0; i <  competitors_ids.length; i++) {visual_ids[i] = competitors_ids[i]}
						pos = parseInt(Math.random() * visual_ids.length);
						if (pos > 0) {
							visual_ids[0] = competitors_ids[pos];
							visual_ids[pos] = competitors_ids[0];
						}

						tournament_settings['visual_ids'] = visual_ids;
						tournament_settings['rating_type'] = 'all';
						tournament_settings['passing'] = false;
						tournament_settings['level_id'] = level_id;

						game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music'});	
						game_data['utils'].remove_loading(function() {
							_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'wait_duel',
																	'settings': tournament_settings,
																	'competitors_ids' : opp,
																	'visual_ids': visual_ids,
																	'start':true,
																	'loosers': []});
							_this.unblock_interface();
						}, true);
						_this.auto_start_obj = {'auto_start': true, 'type': 'duel', 'level_id':level_id};
					}
					else {
						_this.cancel_tournament();
						game_data['utils'].remove_loading();
					}
				});

			}
			else if ('error' in res){
				if ('wait' in res) game_data['user_data']['wait'] = res['wait'];
				_this.unblock_interface();
				game_data['utils'].remove_loading(null,true);
				if (game_data['user_data']['wait']['timeout'] > 0) {
					_this.auto_start_obj = {'auto_start': true, 'level_id':level_id, 'type': 'duel'};
					_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'wait_tournament', 'level_id': level_id});
				}
			}
		});
	}
	else if ('error' in res1) {
		this.unblock_interface();
		game_data['utils'].remove_loading(null,true);
		game_data['utils'].show_tip({'pt': res1['pt'], 'scene_id': 'game_windows', 'item_id': 'all_stars', 'phrase_id': '2', 'values': []});
	}
	else {
		this.unblock_interface();
		game_data['utils'].remove_loading(null,true);
	}
},
	


handler_tasks() {
	if (game_data['game_tutorial'].allow_action({'event': 'tasks'})) {
		if (game_data['game_tutorial'].active_tutorial) {
			setTimeout(() => {
				this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'tasks_daily'});
			}, 300);
		}
		else this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'tasks_daily'});
		game_data['notification_manager'].remove_notification(this.tasks_container);
	}
},

handler_profile() {
	//console.log('handler_profile');
	//this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_help'});
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'user_profile'});
	/*this.rating.update_rating([
		{'user_id': 10, 'place': 1, 'score': 191234560},
		{'user_id': 9, 'place': 2, 'score': 10000000},
		{'user_id': 8, 'place': 3, 'score': 5000000},
		{'user_id': 7, 'place': 4, 'score': 400000},
		{'user_id': 6, 'place': 5, 'score': 30000},
		{'user_id': 5, 'place': 6, 'score': 2000},
		{'user_id': 0, 'place': 7, 'score': 1500},
		{'user_id': 4, 'place': 8, 'score': 200},
		{'user_id': 3, 'place': 9, 'score': 100},
		{'user_id': 2, 'place': 10, 'score': 50},
		{'user_id': 1, 'place': 11, 'score': 10}
	])*/
	
},

add_sale(sale_id, pending = false) {
	let item = null;
	let active_sales = game_data['user_data']['sales']['active'];
	for (let i = 0; i < active_sales.length; i++) {
		if (active_sales[i].sale_id == sale_id) {
			item = active_sales[i];
			break;
		}
	}
	
	if (item && game_data['show_sale']) {
		let cont = new Phaser.GameObjects.Container(this.scene, 0, this.sales.length * 170);
		let obj = {'cont': cont, 'info': item}
		this.sale_container.add(cont);
		this.sales.push(obj);
		
		let bg = new Phaser.GameObjects.Image(this.scene, 0, 0, item.sale_id, "icon");
		cont.add(bg);
		
		cont.back = new Phaser.GameObjects.Image(this.scene, 0, 71, 'common1', 'but_mini1_1');	
		cont.add(cont.back);
		cont.back.setInteractive()
		
		
		cont.txt = new Phaser.GameObjects.Text(this.scene, 0, 72, '-', { fontFamily: 'font1',  fontSize: 15, stroke: '#000000', strokeThickness: 3, fontFamily: 'font1', align: 'center'});				
		cont.txt.setOrigin(0.5);
		cont.add(cont.txt);

		bg.setInteractive({ useHandCursor: true});
		if (pending) setTimeout(() => {
			bg.on('pointerdown', ()=> {this.show_sale(item.sale_id, cont.txt)}, this);
			cont.back.on('pointerdown', () => {this.show_sale(item.sale_id, cont.txt)}, this)
			this.show_sale(item.sale_id, cont.txt);
		}, 2000);
		else bg.on('pointerdown', ()=> {this.show_sale(item.sale_id, cont.txt)}, this);
		
		game_data['utils'].create_outline({
			img: bg,
			custBtn: bg,
			parentCont: cont
		});
	}
	
},

remove_sale(sale_id) {
	let i, obj;
	for (i = 0; i < this.sales.length; i++) {
		obj = this.sales[i];
		if (obj.info.sale_id == sale_id) {
			
			obj.cont.txt.text = null;
			obj.cont.txt.time_left = 0;
			obj.cont.removeAll(true);
			this.sales.splice(i, 1);
			break;
		}
	}
	for (i = 0; i < this.sales.length; i++) {
		obj = this.sales[i];
		obj.cont.y = i * 150;
	}
},

show_sale(sale_id, timer_info) {
	if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only' && game_data['utils'].is_map() && game_data['show_sale'])
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'sales', 'sale_id': sale_id, 'timer_info': timer_info});
},

update_sale_timer() {
	for (let item of this.sales) {
		let time_left = item.info.timeout - item.info.time_spend;
		let s = '';
		if (time_left > 86400) {
			s = String(Math.ceil(time_left / 86400));
			let res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'game_map', 'phrase_id': 'sale', 'values': [s], 'base_size': 20});
			item.cont.txt.text = res['text'];
		}
		else if (time_left > 0){
			let hh = parseInt(time_left / 3600)
			s = hh > 0 ? (String(hh) + ':') : '';
			time_left = time_left % 3600;
			let mm = parseInt(time_left / 60)
			let ss = time_left % 60;
			s += (mm < 10 ? '0' : '') + String(mm) + ':' + (ss < 10 ? '0' : '') + String(ss);
			item.cont.txt.text = s;
		}
		// if (item.cont.txt.text.length <= 5) {
		// 	item.cont.txt.x = -10
		// }
		// else if (item.cont.txt.text.length <= 6) {
		// 	item.cont.txt.x = -16
		// }
		// else if (item.cont.txt.text.length <= 8) {
		// 	item.cont.txt.x = -20
		// }
		item.cont.txt.time_left = time_left;
	}
},

update_sale() {
	if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only' && game_data['utils'].is_map() && game_data['show_sale']) {
		game_data['sales_manager'].check_sale();
		game_data['sales_manager'].receive_sale();
	}
	
},

handler_buy_money() {
	if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') 
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'direct_click': true});
	else game_data['utils'].show_tip({'pt': this.get_money_pt(), 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'money', 'values': []}); 
},

handler_invite() {
	game_data['socialApi'].show_invite();
},

game_mode_change(params) {
	this.update_buttons(false, true);
}

,get_holes(type) {
	if (type == 'level') return this.map_manager.get_holes('level');
	if (type == 'chest') return this.chest_manager.get_holes();
	if (type == 'rating') return this.rating.get_holes();
	if (type == 'tasks') {
		var pt = new Phaser.Geom.Point(this.tasks_button.x, this.tasks_button.y);
		pt = game_data['utils'].toGlobal(this.tasks_container, pt);
		pt.y -= 3;
		return [{'type': 'rect', 'pt': pt, 'w': this.tasks_button.width-8, 'h':  this.tasks_button.height-5, 'arrow': true, 'arrow_orientation': 'up' }]
	}
},

update_user_data() {    
	game_data['error_history'].push('gm3');
	this.count_stars();
	this.total_stars = game_data['user_data']['stars_total'];    
	this.map_manager.update_user_data();
},


check_subscribe(location_id) {
	if (loading_vars['net_id'] == 'ig') {
		if (location_id != game_data['first_location']) game_data['socialApi'].subscribe_bot();
	}
},

challenge_buttons_update() {
	var visibility = game_data['utils'].get_passed_amount() >= game_data['challenges']['start_level'];
	this.button_duel.visible = visibility;
},

handler_challenge() {
	var passed_amount = game_data['utils'].get_passed_amount();
	if (passed_amount >= game_data['challenges']['start_level'] && 
		!game_data['game_tutorial'].active_tutorial && game_data['user_data']['allow_challenge'] && !game_data['utils'].tip_showing
		&& game_data['user_data']['wait']['timeout'] <= 0 && this.visible && !this.wnd_overlay.visible) {
		var rnd = Math.random();
		var _this = this;
		if (rnd < game_data['challenges']['chance']) {
			var t_sum = game_data['challenges']['c_duel'];
			rnd = parseInt(Math.random() * t_sum);
			var total_levels = this.map_manager.level_items.length;
			var level_id = (passed_amount < total_levels) ? passed_amount : total_levels - 1;
			if (rnd <= game_data['challenges']['c_duel']) {
				game_data['utils'].get_competitors_info(true, function(res) {
					if (res['success'] && res['user_ids']) {
						game_data['challenge_user_id'] = res['user_ids'][0];
						_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'challenge_duel', 'settings': {'level_id': level_id, 'challenge': true}});
					}
				});
			}
			else {
				
			}
		}
	}
},

handler_star_chest() {
	var pt = game_data['utils'].toGlobal(this.container_star_chest, new Phaser.Geom.Point(0, 40)); 
	game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'star_chest', 'values': []});
},

get_star_chest_pt() {
	return game_data['utils'].toGlobal(this.container_star_chest, new Phaser.Geom.Point(-30,0)); 
},

update_star_chest(delta = -1) {
	if (!('star_chest' in game_data['user_data'])) game_data['user_data']['star_chest'] = {'chests': 0, 'stars': 0};
	var obj = game_data['user_data']['star_chest'];
	
	this.container_star_chest.visible = game_data['allow_star_chest'] && obj && game_data['star_chest'] 
									&& (game_data['utils'].get_passed_amount() >= game_data['star_chest']['start_level']);

	if (this.container_star_chest.visible) {
		if (delta < 0) this.star_chest_amount = obj['stars'];
		else this.star_chest_amount += delta;
		var required = obj['chests'] < game_data['star_chest']['stars_amount'].length 
				? game_data['star_chest']['stars_amount'][obj['chests']] : game_data['star_chest']['stars_amount'][game_data['star_chest']['stars_amount'].length - 1];

		if (this.star_chest_amount > required) this.star_chest_amount = required;
		
		this.star_chest_txt.text = this.star_chest_amount + '/' + required;

		if (obj['stars'] >= required && delta < 0) {
			if (game_data['prize_mod'] || game_data['game_tutorial'].active_tutorial) {
				this.try_delayed_prize = true;
			}
			else this.star_chest_open();
		}
	}
},

delayed_prize() {
	if (this.try_delayed_prize) {
		this.try_delayed_prize = false;
		this.star_chest_open();
	}
},

check_delayed_prize() {
	setTimeout(() => {
		game_data['prize_mod'] = false;
		this.map_manager.delayed_prize();
		this.delayed_prize();	
	}, 100);
	
},

star_chest_open() {
	var _this = this;

	game_data['game_request'].request({'collect_star_chest_reward': true, 'total_prizes': 3}, function(res){
		if (res['success'] && res['prizes'] && res['prizes'].length) {
			if ('star_chest' in res) {
				game_data['task_manager'].update_tasks({'type': 'star_chest', 'amount':1});
			}
			var all_prizes = game_data['star_chest']['prizes']['common'];
			if (game_data['star_chest']['predefined_chests_amount'] >= game_data['user_data']['star_chest']['chests']) 
				all_prizes = game_data['star_chest']['prizes']['predefined'];

			var i;
			var stat_amount = 0;
			for (i = 0; i < res['prizes'].length; i++) {
				if (res['prizes'][i]['type'] == 'money') stat_amount += res['prizes'][i]['amount'];
				else if (res['prizes'][i]['type'] in game_data['boosters']){
					var booster_id = res['prizes'][i]['type'];
					stat_amount += game_data['boosters'][booster_id]['price'] * res['prizes'][i]['amount'];
				}
			}
			
			game_data['utils'].update_stat({'collect_star_chest_reward': true, 'prizes': res['prizes']});
			for (i = res['prizes'].length; i < 10; i++) {
				var pos = parseInt(Math.random() * all_prizes.length);
				res['prizes'].push(all_prizes[pos]);
			}
			_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'star_chest', 'immediate': true, 'result': res});

			
		}
	});
},

hide_play() {
	game_data['scene'].tweens.add({targets: this.container_play, alpha: 0, duration: 200, onComplete: function(){
		
	}}); 
},
show_play() {
	game_data['scene'].tweens.add({targets: this.container_play, alpha: 1, duration: 200, onComplete: function(){
		
	}}); 
},

});