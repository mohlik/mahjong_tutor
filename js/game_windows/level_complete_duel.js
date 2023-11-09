var LevelCompleteDuel = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelCompleteDuel ()
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
	this.score = params['score'];
	this.error = params['error'];
	this.passing = params['passing'];

	if (loading_vars['net_id'] == 'ig' || is_localhost) {
		this.wall_post_cont = game_data['utils'].check_wall_post(this, {x: -2, y: 215});
		this.tournament_cont = game_data['utils'].check_new_tournament(this, {x: -2, y: 215}, this.score, !this.wall_post_cont)
	}
	let has_social = this.wall_post_cont || this.tournament_cont;

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	temp = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common1', 'prize_chest_bg');
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common2', 'cup_tournament_big');
	this.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete_duel', 'phrase_id': '2', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);
	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete_duel', 'phrase_id': '1', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -160, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	this.anim_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.anim_cont);
	if (has_social) {
		this.anim_cont.y -= 45;
		temp.y -= 20
		this.anim_cont.scale = 0.75;
	}


	var temp1,temp2,temp3;
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '9', 'values': [], 'base_size': 26});		
	temp1 = new Phaser.GameObjects.Text(this.scene, -205, 190, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp1.setOrigin(0,0.5);
	this.add(temp1);
	temp2 = new Phaser.GameObjects.Text(this.scene, 135, temp1.y, this.score, { fontFamily: 'font1', fontSize: 28, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp2.setOrigin(0,0.5);
	this.add(temp2);
	temp3 = new Phaser.GameObjects.Image(this.scene, 175, temp1.y, 'common1', 'score_icon');
	temp3.setOrigin(0,0.5)
	var w = temp1.width + temp2.width + temp3.width + 10;
	this.add(temp3);
	this.icon_rating_score = temp3;
	
	temp1.x = -w/2;
	temp2.x = temp1.x + temp1.width + 5;
	temp3.x = temp2.x + temp2.width + 5;
	this.rating_ico = temp3;
	if (has_social) {
		this.rating_ico.y -= 35;
		temp1.y -= 35
		temp2.y -= 35
	}

	this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_complete', 'phrase_id': '6', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);
	this.add(this.button_continue);

	game_data['audio_manager'].sound_event({'play': true, 'loop': true, 'sound_type': 'music', 'sound_name': 'win_window_music', 'audio_kind': 'music'});
	
	if (this.passing) game_data['task_manager'].update_tasks({'type': 'tournaments', 'amount':1});
	game_data['task_manager'].update_tasks({'type': 'rating_score', 'amount':this.score});
	
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
		this.fly_rating(delay);
		var delay = 800;
		setTimeout(() => {
			this.close_window(params);
		}, delay);
	}
},


fly_rating(delay) {
	var _this = this;
	game_data['game_map'].show_rating();
	var start_pt = game_data['utils'].toGlobal(this.icon_rating_score, new Phaser.Geom.Point(0,0));
	start_pt = game_data['utils'].toLocal(game_data['moving_holder'], start_pt);
	var end_pt = game_data['rating_manager'].get_player_pt();
	end_pt = game_data['utils'].toLocal(game_data['moving_holder'], end_pt); 
	var icon = new Phaser.GameObjects.Image(this.scene, start_pt.x, start_pt.y, "common1", "score_icon");
	game_data['moving_holder'].add(icon);
	game_data['scene'].tweens.add({targets: icon, x: end_pt.x, y: end_pt.y, duration: 500, delay: delay, onComplete: function() {
		game_data['utils'].add_light_stars(end_pt, game_data['moving_holder'], function(){});
		icon.destroy();
	}});
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'rating_add'});
		// game_data['utils'].user_score_updated();	
		game_data['rating_manager'].user_score_updated();
	}, 300 + delay);
},

close_window(params) {  
	if (this.wall_post_cont) game_data['utils'].show_make_wall_post(this.wall_post_cont);
	if (this.tournament_cont)  game_data['utils'].show_new_tournament(this.tournament_cont);
	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'music', 'audio_kind': 'music'});
	if (this.passing) this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'complete': true, 'level_id': this.level_id
		,'first_complete': game_data['user_data']['levels_passed'].length == this.level_id + 1});
	else this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP'});
	this.emitter.emit('EVENT', {'event': 'window_close'});
	if (!game_data['utils'].check_more_games()) game_data['utils'].check_ads('level_win');
},	


});