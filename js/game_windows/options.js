var Options = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Options ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	this.active = true;
	var temp, temp1, temp2;
	var lang = game_data['user_data']['lang'];
	var shift = (params['with_exit']) ?  105: 0;
	var _exit_x = 288;
	var txt
	var pts = [
		{'x': -216 - shift, 'y': 0, 'music': true, 'pref': 'icon_music', 'handler': this.handler_music, 'xi': -2, 'yi': 0},
		{'x': -72 - shift, 'y': 0, 'sound': true, 'pref': 'icon_sound', 'handler': this.handler_sound, 'xi': -4, 'yi': 0},
		{'x': 72 - shift, 'y': 0, 'lang': true, 'pref': lang, 'handler': this.handler_lang, 'xi': 0, 'yi': 0},
		{'x': 216 - shift, 'y': 0, 'help': true, 'handler': this.handler_info, 'xi': 0, 'yi': 0}
	];
	if (loading_vars['net_id'] == 'ig' || loading_vars['mobile']) {
		pts = [
			{'x': -315 - shift, 'y': 0, 'music': true, 'pref': 'icon_music', 'handler': this.handler_music, 'xi': -2, 'yi': 0},
			{'x': -105 - shift, 'y': 0, 'sound': true, 'pref': 'icon_sound', 'handler': this.handler_sound, 'xi': -4, 'yi': 0},
			{'x': 105 - shift, 'y': 0, 'lang': true, 'pref': lang, 'handler': this.handler_lang, 'xi': 0, 'yi': 0},

			{'x': 315 - shift, 'y': 0, 'help': true, 'handler': this.handler_info, 'xi': 0, 'yi': 0},
		];
		_exit_x = 415;
	}
	else {
		pts = [
			{'x': -420 - shift, 'y': 0, 'music': true, 'pref': 'icon_music', 'handler': this.handler_music, 'xi': -2, 'yi': 0},
			{'x': -210 - shift, 'y': 0, 'sound': true, 'pref': 'icon_sound', 'handler': this.handler_sound, 'xi': -4, 'yi': 0},
			{'x': 0 - shift, 'y': 0, 'lang': true, 'pref': lang, 'handler': this.handler_lang, 'xi': 0, 'yi': 0},
			{'x': 210 - shift, 'y': 0, 'full': true, 'pref': 'icon_fullscreen_', 'handler': this.handler_fullscreen, 'xi': 0, 'yi': 0},
			{'x': 420 - shift, 'y': 0, 'help': true, 'handler': this.handler_info, 'xi': 0, 'yi': 0},
		];
		_exit_x = 525;
	}
	
	if (params['with_exit']) {
		this.reduce_wait = params['reduce_wait'];
		this.level_id = params['level_id'];
		this.round = params['round'];
		this.duel = params['duel'];
		pts.push({'x': _exit_x, 'y': 0, 'exit': true, 'handler': this.handler_exit, 'xi': 0, 'yi': 0});
	} 
	

	for (var i = 0; i < pts.length; i++) {
		temp = new CustomButton(this.scene, pts[i]['x'], pts[i]['y'], pts[i]['handler'], 'common1', 'but_round1', 'but_round2', 'but_round3', this);
		this.add(temp);	
		if (pts[i]['lang']) {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common1', 'icon_' + lang);
			temp.add(temp1);
		}
		else if (pts[i]['help']) {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common2', 'icon_help');
			temp.add(temp1);
		}
		else if (pts[i]['exit']) {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common2', 'game_exit_icon_small');
			temp.add(temp1);
		}
		else if (pts[i]['music']) {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common1', pts[i]['pref']);
			temp2 = new Phaser.GameObjects.Image(this.scene, 0, pts[i]['yi'], 'common1', 'options_off');
			temp.add(temp1);
			temp.add(temp2);
			this.music_off = temp2;
		}
		else if (pts[i]['sound']) {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common1', pts[i]['pref']);
			temp2 = new Phaser.GameObjects.Image(this.scene, 0, pts[i]['yi'], 'common1', 'options_off');
			temp.add(temp1);
			temp.add(temp2);
			this.sound_off = temp2;
		}
		else {
			temp1 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common1', pts[i]['pref'] + 'on');
			temp.add(temp1);
			temp2 = new Phaser.GameObjects.Image(this.scene, pts[i]['xi'], pts[i]['yi'], 'common1', pts[i]['pref'] + 'off');
			temp.add(temp2);
			this.full_on = temp1;
			this.full_off = temp2;
		}
	}
	this.update_buttons();

	var _y = 250;
	var res = game_data['utils'].generate_string({'scene_id': 'game', 'item_id': 'email', 'phrase_id': '1', 'values': [game_data['support_email'], this.get_user_id()], 'base_size': 40});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, _y, res['text'], 
			{ fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3, align: 'center'});
	temp.setOrigin(0.5);
	temp.alpha = 0;
	this.add(temp);
	this.scene.tweens.add({targets: temp, alpha: 1, delay: 500, duration: 300});
	if ('more_games' in game_data && game_data['more_games'].length && allow_more_games) {
		_y = -loading_vars['H'] * 0.25;
		this.button_more_games = new CustomButton(this.scene, 0, _y, this.handler_more_games, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		this.add(this.button_more_games);	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'options', 'phrase_id': '7', 'values': [], 'base_size': 32});		
		txt = new Phaser.GameObjects.Text(this.scene, 0, -3, res['text'], {fontFamily: 'font1', fontSize: res['size'], color:"#FFFFFF",  stroke: '#000000', strokeThickness: 3});		
		txt.setOrigin(0.5);
		this.button_more_games.add(txt);
	}

	if (is_localhost || loading_vars['net_id'] == 'ig') {
		// let policy_btn = new CustomButton(this.scene, 520, 250, ()=> {game_data['utils'].get_privacy_policy(this);}, skin_id, 'button_big_out', 'button_big_over', 'button_big_down', this, null, null, 0.7);
		// this.add(policy_btn);	
		let _size = 30;
		if (loading_vars['assets_suffix'] == 'athens') _size = 24;
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'privacy_policy', 'phrase_id': '1', 'values': [], 'base_size': _size});		
		txt = new Phaser.GameObjects.Text(this.scene, 520, 315, res['text'], {fontFamily: 'font1', fontSize: res['size'], color:"#fbf7dc", stroke: '#3d0902', strokeThickness: 3, 
			wordWrap: {width: 200}, align:'center'});
		txt.setLineSpacing(-3);
		txt.setOrigin(0.5);
		let shape = new Phaser.Geom.Rectangle(-35, -35, 300, 200)
		txt.setInteractive(shape, Phaser.Geom.Rectangle.Contains)
		txt.on('pointerdown', () => {game_data['utils'].get_privacy_policy(this)})
		// policy_btn.add(txt);
		this.add(txt)
	}
},	
	
handler_more_games() {
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'more_games'});
	this.handler_close();
},

get_user_id() {
	var def = String(loading_vars['user_id']);
	var mod = 4;
	var ret = game_data['game_id_short'] + '-';
	for (var i = 0; i < def.length; i++) {
		if (i > 0 && i % mod == 0) ret += '-';
		ret += def[i];
	}
	return ret;
},

update_buttons() {
	this.music_off.visible = !game_data['user_data']['music'];
	this.sound_off.visible = !game_data['user_data']['sound'];

	if (this.scene && this.full_on && this.full_off) {
		this.full_on.visible = !this.scene.scale.isFullscreen;
		this.full_off.visible = this.scene.scale.isFullscreen;
	}
},

handler_fullscreen() {
	if (this && this.active) game_data['scene'].scale.toggleFullscreen();
		
	setTimeout(() => {

		game_data['scene'].scale.refresh();
		this.close_window();
	}, 500);


},

handler_music() {
	game_data['user_data']['music'] = 1 - game_data['user_data']['music'];
	this.update_buttons();
	game_data['game_request'].request({'set_options': true, 'sound': game_data['user_data']['sound'] , 'music': game_data['user_data']['music']}, function(){});
	game_data['audio_manager'].update_volume();
	game_request.update_stat({'set_options': true, 'music': game_data['user_data']['music']});
},

handler_sound() {
	game_data['user_data']['sound'] = 1 - game_data['user_data']['sound'];
	this.update_buttons();
	game_data['game_request'].request({'set_options': true, 'sound': game_data['user_data']['sound'] , 'music': game_data['user_data']['music']}, function(){});
	game_data['audio_manager'].update_volume();
	game_request.update_stat({'set_options': true, 'sound': game_data['user_data']['sound']});
},

handler_info() {
	if (this.active) this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_help'});
	this.handler_close();
},

handler_lang() {
	if (this.active) this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'select_language'});
	this.handler_close();
},

handler_exit() {
	if (this.active) this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'quit_yes_no', 'reduce_wait': this.reduce_wait, 'round': this.round, 'level_id': this.level_id, 'duel': this.duel});
	this.close_window();
},

handler_close(params) {  
	this.close_window();
},

close_window(params) {  
	this.active = false;
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});