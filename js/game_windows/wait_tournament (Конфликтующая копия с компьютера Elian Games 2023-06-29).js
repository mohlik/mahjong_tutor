var WaitTournament = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function WaitTournament ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var _this = this;
	var temp;
	var res;
	var i;
	this.allow_add = true;
	this.money_pt = params['money_pt'];
	this.level_id = params['level_id'];
	this.prev_params = params;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);
	game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tic-tac', 'sound_type': 'tic-tac', 'loop': true});

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_tournament', 'phrase_id': '3', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_tournament', 'phrase_id': '1', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -130, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0'
									, stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 400}});			
	temp.setOrigin(0.5);
	this.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_tournament', 'phrase_id': '4', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 195, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0'
									, stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 400}});			
	temp.setLineSpacing(-6);
	temp.setOrigin(0.5);
	this.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 0, 50, 'common2', 'wait_clock');
	this.add(temp);
	
	this.add_timer();

	this.allow_add = true;
	this.button_play = new CustomButton(this.scene, 0, 290, this.handler_replay, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_tournament', 'phrase_id': '2', 'values': [game_data['tournament_price']], 'base_size': 24});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_play.add(temp);
	var temp2 =  new Phaser.GameObjects.Image(this.scene, temp.width / 2 + 3, 0, 'common1', 'money_ico_btn');
	this.logo = temp2;
	temp.x -= temp2.width / 2;
	this.button_play.add(temp2);
	this.add(this.button_play);

	this.use_money_tip = false;
	if ((game_data['last_game_mode'] == 'video_only' || game_data['last_game_mode'] == 'offline')
		&& game_data['tournament_price'] > game_data['user_data']['money']) {
		this.use_money_tip = true
	}
},	

add_timer() {
	temp = new Phaser.GameObjects.Image(this.scene, -120, 100, 'common2', 'wait_time_bg');
	this.add(temp);
	this.time_txt = new Phaser.GameObjects.Text(this.scene, temp.x, temp.y, '00:00', { fontFamily: 'font1', fontSize: 26, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
	this.time_txt.setOrigin(0.5);
	this.add(this.time_txt);

	this.timer_wait = this.scene.time.addEvent({
		delay: 250,
		callback: this.timer_wait_handler,
		callbackScope: this,
		loop: true
	});
},

timer_wait_handler() {
	var min;
	var zero = '';
	var sec;
	if (game_data['user_data']['wait']['timeout'] > 0) {
		min = parseInt(game_data['user_data']['wait']['timeout'] / 60);
		sec = game_data['user_data']['wait']['timeout'] % 60;
		if (sec < 10) zero = '0';
		if (this.scene) this.time_txt.text = String(min) + ':' + zero + String(sec)
		
	}
	else {
		this.timer_wait.paused = true;
		this.close_window();
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
	game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'tic-tac'});
	this.emitter.emit('EVENT', {'event': 'window_close'});	
},	
});