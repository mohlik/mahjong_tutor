var LevelFailed = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelFailed ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	game_data['audio_manager'].sound_event({'stop_all': true});	
	var temp;
	var res;
	this.paid_replay = false;
	this.level_id = params['level_id'];
	this.duel = params['duel'];
	this.money_pt = params['money_pt'];
	this.auto_start_obj = {'auto_start': true, 'level_id':this.level_id, 'type': this.duel ? 'duel': 'common'};
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed2', 'phrase_id': '1', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	this.allow_auto_close = game_data['user_data']['wait']['timeout'] > 1;

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed2', 'phrase_id': '2', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -150, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0'
									, stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 600}});			
	temp.setLineSpacing(-4);
	temp.setOrigin(0.5);
	
	this.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 0, 10, 'common2', 'cup_fail1');
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 10, 'common2', 'cup_fail2');
	this.add(temp);

	this.time_cont_base = new Phaser.GameObjects.Container(this.scene, 0, 170);
	var graphics;
	var key = 'level_failed1';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x39352a, 0.75);
		graphics.lineStyle(3, 0xe3cc69, 1)
		graphics.fillRoundedRect(5, 5, 320, 110, 10);
		graphics.strokeRoundedRect(5, 5, 320, 110, 10);
		graphics.generateTexture(key, 330, 120);
	}
	var t = new Phaser.GameObjects.Image(this.scene, 0, 5, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.time_cont_base.add(t);
	}



	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed2', 'phrase_id': '3', 'values': [], 'base_size': 22});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -20, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0'
									, stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 290}});	
	temp.setLineSpacing(-6);		
	temp.setOrigin(0.5);
	this.time_cont_base.add(temp);
	this.add(this.time_cont_base);
	this.add_timer();

	this.allow_add = true;
	this.button_play = new CustomButton(this.scene, 0, 290, this.handler_replay, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_tournament', 'phrase_id': '2', 'values': [game_data['tournament_price']], 'base_size': 24});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_play.add(temp);
	var temp2 =  new Phaser.GameObjects.Image(this.scene, temp.width / 2 + 5, 0, 'common1', 'money_ico_btn');
	this.logo = temp2;
	temp.x -= temp2.width / 2;
	this.button_play.add(temp2);
	this.add(this.button_play);

	game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tournament_lose'});

	this.use_money_tip = false;
	if ((game_data['last_game_mode'] == 'video_only' || game_data['last_game_mode'] == 'offline')
		&& game_data['tournament_price'] > game_data['user_data']['money']) {
		this.use_money_tip = true
	}
},	

add_timer() {
	this.timer_cont = new Phaser.GameObjects.Container(this.scene, -30, 30);
	this.time_cont_base.add(this.timer_cont);
	this.timer_cont.icon1 = new Phaser.GameObjects.Image(this.scene, -10, 0, 'common2', 'timer_ico1');
	this.timer_cont.add(this.timer_cont.icon1);
	this.arrow1 = new Phaser.GameObjects.Image(this.scene, -10, 0, 'common2', 'timer_ico2');
	this.arrow1.setOrigin(0.5, 0.9);
	this.timer_cont.add(this.arrow1);
	this.arrow2 = new Phaser.GameObjects.Image(this.scene, -10, 0, 'common2', 'timer_ico2');
	this.arrow2.setOrigin(0.5, 0.9);
	this.timer_cont.add(this.arrow2);
	this.time_txt = new Phaser.GameObjects.Text(this.scene, 15, 30, '00:00', { fontFamily: 'font1', fontSize: 30, color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
	this.time_txt.setOrigin(0.5);
	this.time_cont_base.add(this.time_txt);
	this.anim_arrows();
	this.timer_wait = this.scene.time.addEvent({
		delay: 250,
		callback: this.timer_wait_handler,
		callbackScope: this,
		loop: true
	});
},

anim_arrows() {
	var _this = this;
	_this.tween1 = game_data['scene'].tweens.add({targets: _this.arrow1, angle:-360, duration: 6000});
	_this.tween2 = game_data['scene'].tweens.add({targets: _this.arrow2, angle:-1080, duration: 6000, onComplete: function () {
		_this.anim_arrows();
	}});
},

timer_wait_handler() {
	var min;
	var zero = '';
	var sec;
	if (game_data['user_data']['wait']['timeout'] > 0) {
		min = parseInt(game_data['user_data']['wait']['timeout'] / 60);
		sec = game_data['user_data']['wait']['timeout'] % 60;
		if (sec < 10) zero = '0';
		this.time_txt.text = String(min) + ':' + zero + String(sec)
	}
	else {
		this.timer_wait.paused = true;
		if (this.allow_auto_close) this.close_window();
	}
},

handler_replay() {
	if (this.use_money_tip) {
		var pt = game_data['utils'].toGlobal(this.logo, new Phaser.Geom.Point(0,0));
		game_data['utils'].show_money_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'no_money', 'phrase_id': '1', 'values': []});
	}
	else if (this.allow_add) {
		game_data['error_history'].push('R_buy_tournament');
		var _this = this;
		this.allow_add = false;
		var pt_start = new Phaser.Geom.Point(this.logo.x, this.logo.y);
		pt_start = game_data['utils'].toGlobal(this.button_play, pt_start);
		this.timer_wait.paused = true;
		game_data['game_request'].request({'buy_tournament': true}, function(res){
			if ('success' in res && res['success']) {
				_this.paid_replay = true;
				setTimeout(function() {
					game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'diamond_use'});
				},game_data['utils'].get_sound_delay(1));
				if (_this.scene) game_data['utils'].fly_items({'amount': 1,								
										'holder': _this,
										'item_atlas': 'common1',
										'item_name': 'money_ico',
										'pt_start': _this.money_pt,
										'pt_end': pt_start	
										}, 
				function(){
					if (_this.scene) {
						_this.emitter.emit('EVENT', {'event': 'update_money'});
						_this.emitter.emit('EVENT', {'event': 'clear_wait'});
						_this.handler_close();
					} 
				});
				setTimeout(() => {
					game_data['game_map'].auto_start_obj = _this.auto_start_obj;
					game_data['game_map'].handler_replay();
				}, 1500);

				var stat_obj = {'type': 'buy_wait', 'buy_tournament': true, 'amount_inc': 1, 'amount_dec': game_data['tournament_price'], 'level': _this.level_id}
				game_data['utils'].update_stat(stat_obj);
			}
			else {
				_this.allow_add = true;
				_this.emitter.emit('EVENT', {'event': 'update_money'});
				_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': "buy_money", 'prev_params': _this.prev_params, 'money_pt' : _this.money_pt});
				_this.emitter.emit('EVENT', {'event': 'window_close'});
			}										 
		});	
	}
},

handler_close(params) {  
	this.close_window();
},

close_window(event = {}) {  
	this.timer_wait.paused = true;
	if (this.tween1) this.tween1.stop();
	if (this.tween2) this.tween2.stop();
	this.emitter.emit('EVENT', {'event': 'window_close'});	
	if (!this.paid_replay && !game_data['utils'].check_more_games()) game_data['utils'].check_ads('level_lost');
	game_data['game_map'].reset_music();
},	
});