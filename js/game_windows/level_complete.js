var LevelComplete = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelComplete ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp, res;
	var i;
	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music', 'audio_kind': 'music'});
	this.bg_anim_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.bg_anim_cont);
	this.add_bg_anim();
	
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'cup_bg');
	this.add(temp)

	this.level_id = params['level_id'];
	this.stars = params['stars'];
	this.score = params['score'];
	this.chest_id = params['chest_id'];
	this.error = params['error'];
	this.new_chest_stars = params['new_chest_stars'];
	var replay = params['replay'];
	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': String(this.stars + 1), 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	if (loading_vars['net_id'] == 'ig' || is_localhost) {
		this.wall_post_cont = game_data['utils'].check_wall_post(this, {x: -2, y: 230});
		this.tournament_cont = game_data['utils'].check_new_tournament(this, {x: -2, y: 230}, this.score, !this.wall_post_cont)
	}
	let has_social = this.wall_post_cont || this.tournament_cont;
	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '10', 'values': [this.level_id + 1], 'base_size': 40});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -170, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	this.anim_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.anim_cont);
	if (has_social) {
		this.anim_cont.y -= 35;
		this.anim_cont.scale = 0.75;
	}

	this.stars_coord = [{'x': -140, 'y': -85, 'scale': 1}, {'x': 0, 'y': -85, 'scale': 1}, {'x': 140, 'y': -85, 'scale': 1}];
	this.stars_img = [];
	this.stars_shine = [];
	for (i = 0; i < this.stars_coord.length; i++) {
		temp = new Phaser.GameObjects.Image(this.scene, this.stars_coord[i]['x'], this.stars_coord[i]['y'], 'common2', 'star_bg');
		temp.setScale(this.stars_coord[i]['scale']);
		this.anim_cont.add(temp);
		temp = new Phaser.GameObjects.Image(this.scene, this.stars_coord[i]['x'], this.stars_coord[i]['y'], 'common1', 'wind_win3');
		temp.setScale(this.stars_coord[i]['scale'] * 0.6);
		temp.alpha = 0;
		this.anim_cont.add(temp);
		this.stars_shine.push(temp);
	}
	for (i = 0; i < this.stars_coord.length; i++) {
		temp = new Phaser.GameObjects.Image(this.scene, 0, -120, 'common2', 'star_top');
		temp.setScale(this.stars_coord[i]['scale']*2);
		temp.angle = 0;
		temp.alpha = 0;
		if (i == 1) temp.x = -200;
		if (i == 2) temp.x = 200;
		this.anim_cont.add(temp);
		this.stars_img.push(temp);
	}
	this.rating_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.rating_cont);

	if (this.level_id > 0) {
		var temp1,temp2,temp3;
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '9', 'values': [], 'base_size': 26});		
		temp1 = new Phaser.GameObjects.Text(this.scene, -205, 223, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp1.setOrigin(0,0.5);
		this.rating_cont.add(temp1);
		temp2 = new Phaser.GameObjects.Text(this.scene, 135, temp1.y, this.score, { fontFamily: 'font1', fontSize: 28, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp2.setOrigin(0,0.5);
		this.rating_cont.add(temp2);
		temp3 = new Phaser.GameObjects.Image(this.scene, 175, temp1.y, 'common1', 'score_icon');
		temp3.setOrigin(0,0.5)
		var w = temp1.width + temp2.width + temp3.width + 10;
		this.rating_cont.add(temp3);
		this.icon_rating_score = temp3;
		
		temp1.x = -w/2;
		temp2.x = temp1.x + temp1.width + 5;
		temp3.x = temp2.x + temp2.width + 5;
		this.rating_ico = temp3;
	}
	this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '6', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);
	this.add(this.button_continue);

	if (has_social) this.button_continue.y += 10;

	this.chest_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.chest_cont);
	var graphics;
	var key = 'level_complete1';
		if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x000000, 0.5);
		graphics.fillRoundedRect(5, 5, 272, 174, 10);
		graphics.generateTexture(key, 282, 184);
	}
	var t = new Phaser.GameObjects.Image(this.scene, 0, 100, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.chest_cont.add(t);
	}

	if (this.chest_id < 0) {
		temp = new Phaser.GameObjects.Image(this.scene, 0, 60, 'common2', 'no_chest_icon');
		this.chest_cont.add(temp);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 
			'phrase_id': replay ? '13' : '12', 'values': [], 'base_size': 22});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, 140, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
			,align:'center', wordWrap: {width: 260}});
		temp.setLineSpacing(-4);	
		temp.setOrigin(0.5);
		this.chest_cont.add(temp);
	}
	else {
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '11', 'values': [], 'base_size': 20});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -2, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
			,align:'center', wordWrap: {width: 350}});
		temp.setOrigin(0.5);
		this.chest_cont.add(temp);
		var progress = game_data['chest']['prize']['progress'];
		var type = '1';
		for (var j = progress.length - 1; j >= 0; j--) {
			if (this.level_id >= progress[j]['level_id']) {
				type = progress[j]['type'];
				break;
			}
		}
		this.chest_ico = new Phaser.GameObjects.Image(this.scene, 0, 92, 'common2', 'chest_level1');
		this.chest_ico.setScale(170/this.chest_ico.height)
		this.chest_cont.add(this.chest_ico);
	}

	if (has_social) {
		this.chest_cont.y -= 35;
		this.rating_cont.y -= 44;
	}
	
	
	this.show_stars();

	game_data['audio_manager'].sound_event({'play': true, 'loop': true, 'sound_type': 'music', 'sound_name': 'win_window_music', 'audio_kind': 'music'});
	
	game_data['task_manager'].update_tasks({'type': 'tournaments', 'amount':1});
	game_data['task_manager'].update_tasks({'type': 'rating_score', 'amount':this.score});
	
},	

show_stars() {
	var i;
	var pt1, pt2;
	for (i = 0; i < this.stars; i++) {
		var pt = new Phaser.Geom.Point(this.stars_coord[i]['x'], this.stars_coord[i]['y']);
		game_data['scene'].tweens.add({targets: this.stars_img[i], scale: this.stars_coord[i]['scale'], x: pt.x, y: pt.y, angle: 360, alpha:1, 
		duration: 500, delay: 1000 + i*300, ease: 'Back.easeOut', onComplete: function(){
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'star_add'});
		}});
		game_data['scene'].tweens.add({targets: this.stars_shine[i], alpha:1, duration: 200, delay: 1500 + i*300});
		this.start_shine(this.stars_shine[i], i*300)
	}

},

start_shine(item, delay = 0) {
	var _this = this;
	var _scale = item.scale;
	game_data['scene'].tweens.add({targets: item, scale: _scale * 0.7, duration: 2450, delay: delay, onComplete: function(){
		if (_this.scene) game_data['scene'].tweens.add({targets: item, scale: _scale, duration: 2450});
	}});
	game_data['scene'].tweens.add({targets: item, angle: 360, duration: 5000, delay: delay, onComplete: function(){
		item.scale = _scale;
		if (_this.scene) _this.start_shine(item);
	}});
},

add_bg_anim() {
	var temp;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'luchi1');
	temp.setScale(2.5);
	this.bg_anim_cont.add(temp);
	this.start_bg_anim1(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'luchi1');
	temp.setScale(2.5);
	temp.angle = 22.5;
	this.bg_anim_cont.add(temp);
	this.start_bg_anim1(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 4, -305, 'common2', 'cup_tournament');
	temp.setScale(0.8);
	this.add(temp);

},

start_bg_anim1(item, delay = 0) {
	var _this = this;
	var _scale = item.scale;
	game_data['scene'].tweens.add({targets: item, scale: _scale * 1.3, duration: 2470, delay: delay, onComplete: function(){
		if (_this.scene) game_data['scene'].tweens.add({targets: item, scale: _scale * 1, duration: 2470, onComplete: function(){
			if (_this.scene) game_data['scene'].tweens.add({targets: item, scale: _scale * 1.3, duration: 2470, onComplete: function(){
				if (_this.scene) game_data['scene'].tweens.add({targets: item, scale: _scale, duration: 2470});
			}});
		}});
	}});
	game_data['scene'].tweens.add({targets: item, angle: item.angle + 360, duration: 10000, delay: delay, onComplete: function(){
		item.scale = _scale;
		if (_this.scene) _this.start_bg_anim1(item);
	}});
	if (_this.scene) game_data['scene'].tweens.add({targets: item, scale: _scale, duration: 4960});
},

handler_close(params) {  
	if (!this.block_close) {
		this.block_close = true;
		var delay = 10;
		if (this.level_id > 0) this.fly_rating(delay);
		delay += this.chest_id < 0 ? 500 : 300;
		if (this.chest_id >= 0) {
			this.fly_chest(delay);
			delay += 500;
		}
		setTimeout(() => {this.close_window(params);}, delay);
	}
},

fly_chest(delay) {
	var _this = this;
	var end_pt = game_data['game_map'].chest_manager.get_chest_pt(this.chest_id);
	end_pt = game_data['utils'].toLocal(game_data['moving_holder'], end_pt);
	var start_pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.chest_ico.x, this.chest_ico.y));
	start_pt = game_data['utils'].toLocal(game_data['moving_holder'], start_pt);
	game_data['moving_holder'].add(this.chest_ico);
	this.chest_ico.x = start_pt.x;
	this.chest_ico.y = start_pt.y;
	var mid_pt = new Phaser.Geom.Point(end_pt.x -200,100)
	this.bezierCurve = new Phaser.Curves.CubicBezier(start_pt, mid_pt, end_pt, end_pt);
	var tweenObject = {val: 0}
	game_data['scene'].tweens.add({
			targets: tweenObject,
			val: 1,
			duration: 700,
			delay: delay,
			ease: "Sine.easeInOut",
			callbackScope: _this,
			onUpdate: function(tween, target){
					var position = _this.bezierCurve.getPoint(target.val);
					_this.chest_ico.x = position.x;
					_this.chest_ico.y = position.y;
			},
			onComplete: function(){
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_add'});
				game_data['scene'].tweens.add({targets: _this.chest_ico, alpha: 0, duration: 250, scale: 80/_this.chest_ico.height});
				_this.emitter.emit('EVENT', {'event': 'UPDATE_CHESTS'});
			}
	});
	
},

fly_rating(delay) {
	var _this = this;
	var start_pt = game_data['utils'].toGlobal(this.icon_rating_score, new Phaser.Geom.Point(this.icon_rating_score.width/2, 0));
	start_pt = game_data['utils'].toLocal(game_data['moving_holder'], start_pt);
	var end_pt = game_data['rating_manager'].get_player_pt();
	end_pt = game_data['utils'].toLocal(game_data['moving_holder'], end_pt); 
	var icon = new Phaser.GameObjects.Image(this.scene, start_pt.x, start_pt.y, "common1", "score_icon");
	game_data['moving_holder'].add(icon);
	game_data['scene'].tweens.add({targets: icon, x: end_pt.x, y: end_pt.y, duration: 500, delay: delay, onComplete: function() {
		var pt = game_data['rating_manager'].get_player_pt();
		game_data['utils'].add_light_stars(pt, _this, function(){});
		icon.destroy();
	}});
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'rating_add'});
		// game_data['utils'].user_score_updated();	
		game_data['rating_manager'].user_score_updated();
	}, delay + 300);
},

close_window(params) {
	if (this.wall_post_cont) game_data['utils'].show_make_wall_post(this.wall_post_cont);
	if (this.tournament_cont)  game_data['utils'].show_new_tournament(this.tournament_cont);
	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music', 'audio_kind': 'music'});
	this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'complete': true, 'level_id': this.level_id
		,'first_complete': game_data['user_data']['levels_passed'].length == this.level_id + 1, 'new_chest_stars': this.new_chest_stars});
	this.emitter.emit('EVENT', {'event': 'window_close'});
	if (!game_data['utils'].check_more_games()) game_data['utils'].check_ads('level_win');
	game_data['utils'].check_rating_bonus();
},	


});