var WaitDuel = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function WaitDuel ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	var i;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'cup_bg2');
	temp.setScale = 1.2;
	this.add(temp)
	game_data['error_history'].push('wd1');
	temp = new Phaser.GameObjects.Image(this.scene, 0, -25, 'common1', 'prize_chest_bg');
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, -25, 'common2', 'cup_tournament_big');
	this.add(temp);
	

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_competitors', 'phrase_id': '3', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	this.waiting_text = new Phaser.GameObjects.Container(this.scene,  0, 263);
	this.waiting_text.alpha = 0;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "panel1");
	this.waiting_text.add(temp);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_competitors', 'phrase_id': '4', 'values': [], 'base_size': 24});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.waiting_text.add(temp);

	this.settings = params['settings'];
	this.settings['duel'] = true;
	this.ids = this.settings['competitors_ids'];

	if ('loosers' in params) {this.loosers = params['loosers'];}
	else {this.loosers = [];}
	if ('winners' in params) {this.winners = params['winners'];}
	else {this.winners = [];}
	
	this.cancelled = false;

	this.from_map = !('is_challenge' in game_data &&  game_data['is_challenge'])
	this.wait_mode = ('start' in params && params['start'] == true);
	button_close.visible = this.wait_mode && game_data['user_data']['levels_passed'].length > 0;

	this.id1 = this.ids[1];
	this.id2 = this.ids[0];
	this.player_pos = 1;
	if (this.from_map) {
		this.id1 = this.ids[0];
		this.id2 = this.ids[1];
		this.player_pos = 0;
	}
	this.visual_ids = [this.id1, this.id2];
	this.photo_loaded = [null, null];
	

	this.coords = [
		{'x': -200, 'y': 70},{'x': 200, 'y': 70},
		{'x': 0, 'y': -120}
	];
	this.check_tutorial();
	
	setTimeout(() => {
		this.create_items();
	}, 5)
	setTimeout(() => {
		this.prepare_start_anim();
		this.add(this.waiting_text);
		if (this.wait_mode) {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tournament_start', 'sound_type': 'tournament_start', 'audio_kind': 'music'});
			if (this.player_pos + 1 < this.visual_ids.length) game_data['scene'].tweens.add({targets: this.waiting_text,  alpha: 1, duration: 500});	
			for (i = 0; i < this.visual_ids.length; i++) {
				this.first_load_photo(i);
			}
			this.photo_timer = this.scene.time.addEvent({
				delay: 500,
				callback: this.check_photo_loading,
				callbackScope: this,
				loop: true
			});
		}
		else {		
			this.init2();
		}
	}, 10)
},

check_tutorial() {

},

first_load_photo(_i)  {
	var _this = this;
	this.items[_i].show_spinner();
	var _tid;
	var _item;
	_item = this.items[_i];
	_tid = setTimeout(function(){
		_this.photo_loaded[_i] = true;
		_item.photo_loaded = true;			
	},9000)
	_item.add_photo(function() {
		clearTimeout(_tid);
		_this.photo_loaded[_i] = true;
	});
},

check_photo_loading() {
	var i, j;
	var loaded = true;
	for (i = 0; i < this.photo_loaded.length; i++) {
		if (this.photo_loaded[i] == null) {
			loaded - false;
			break;
		}
	}
	if (loaded || this.photo_timer.getElapsedSeconds() >= 10) {
		for (j = 0; j < this.photo_loaded.length; j++) {
			if (this.photo_loaded[j] == null) {
				this.photo_loaded[j] = true;
			}
		}
		this.photo_timer.paused = true;
		this.init2();
	}
},

create_items() {
	this.item0 = new CompetitorItem();
	this.item1 = new CompetitorItem();
	
	this.all_items = [this.item0, this.item1 ];
	this.items = [this.item0, this.item1];

	for (var i = 0; i < this.items.length; i++) {
		this.items[i].init({'user_id': this.visual_ids[i], 'with_spinner': this.wait_mode, 'with_photo': !this.wait_mode});
		this.items[i].x = this.coords[i].x;
		this.items[i].y = this.coords[i].y;
		this.add(this.items[i]);
	}
	
},


init2() {
	var i,j;
	game_data['error_history'].push('wc3');
	if (this.wait_mode) {
		for (i = 0; i <= this.player_pos; i++) {
			this.items[i].hide_spinner();
			this.items[i].show_photo(true);
		}
		var time_min = 1; 
		var time_step = 0.8;
		var time_gap = 0.8;
		for (i = this.player_pos + 1; i < this.items.length; i++) {
			var delay = time_min + time_step * (i + 1 - this.player_pos) + Math.random() * time_gap;
			this.items[i].show_spinner();
			this.show_competitor(this.items[i], (delay+5) * 1000, i == this.items.length - 1);
		}
		
		if (this.player_pos + 1 == this.visual_ids.length) this.countdown();
	}
	else {
		this.waiting_text.visible = false;
		for (i = 0; i < this.items.length; i++) {
			this.items[i].show_photo();
		}
		this.show_preparations()
	}
},


show_preparations() {
	game_data['error_history'].push('wd4');
	var i, j;
	if (this.loosers.length){
		/*this.item_winner.init({'user_id': loading_vars['user_id'], 'with_photo': true});
		this.item_winner.x = this.items[this.player_pos].x
		this.item_winner.y = this.items[this.player_pos].y
		this.item_winner.visible = true;*/
		this.anim_progress(this.items[this.player_pos]);
	}
	
},


anim_progress(_item) {
	var _this = this;
	
	var _x = this.coords[2].x;
	var _y = this.coords[2].y;
	
	setTimeout(() => {
		if (this.scene) {
			if (this.scene && _item) game_data['scene'].tweens.add({targets: _item, x: _x, duration: 400});	
			if (this.scene && _item) game_data['scene'].tweens.add({targets: _item, y: _y, duration: 400, delay: 500});	
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'user_win'});	
			this.countdown();
		}
	}, 1000);
},


show_competitor(mc, timeout, _coundtown) {
	setTimeout(() => {
		mc.hide_spinner();
		mc.show_photo(true);
		if (_coundtown) this.countdown();
	}, timeout);
},

prepare_start_anim() {
	var i;
	var res;
	var temp;
	this.coundown_items = [];
	for (i = 3; i > 0; i--) {
		temp = new Phaser.GameObjects.Text(this.scene, 0, 0, String(i), { fontFamily: 'font1', fontSize: 110, color: '#f6e406', stroke: '#673a11', strokeThickness: 10});
		temp.setOrigin(0.5);
		temp.alpha = 0;
		temp.setScale(0.05,0.05);
		this.coundown_items.push(temp);
	}

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_competitors', 'phrase_id': '8', 'values': [], 'base_size': 110});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6e406', stroke: '#673a11', strokeThickness: 10});
	temp.setOrigin(0.5);
	temp.alpha = 0;
	temp.setScale(0.05,0.05);
	this.coundown_items.push(temp);
},

countdown() {
	this.waiting_text.visible = false;
	if (this.loosers.length) {  
		setTimeout(() => {this.close_window(null)},1500);
	}
	else {
		if (!this.cancelled) {
			setTimeout(() => { this.play_countdown();}, 300);
		}
	}
},

play_countdown() {
	var _this = this;
	var sc1 = 1;
	var sc2 = 1.1;
	var sc3 = 1.3;
	var t1 = 250;
	var t2 = 400;
	var t3 = 250;
	var mc = this.coundown_items[0];
	this.add(mc);
	this.coundown_items.splice(0, 1);
	var delay = t1 + t2 + t3 + 100;
	game_data['scene'].tweens.add({targets: mc, alpha: 1, duration: 200});
	if (_this.coundown_items.length)
		game_data['scene'].tweens.add({targets: mc, scaleX: sc1, scaleY: sc1, duration: t1, onComplete: function() {
			if (!_this.cancelled) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'count_321'});
			if (_this.scene) game_data['scene'].tweens.add({targets: mc, scaleX: sc2, scaleY: sc2, duration: t2, onComplete: function() {
				if (_this.scene) game_data['scene'].tweens.add({targets: mc, scaleX: sc3, scaleY: sc3, alpha: 0, duration: t3, onComplete: function() {
					if (_this.scene  && !_this.cancelled) {
						if (_this.coundown_items.length) _this.play_countdown();
					}
				}});
			}});
		}});
	else {
		mc.setScale(sc3, sc3);
		if (_this.scene) game_data['scene'].tweens.add({targets: mc, scaleX: sc2, scaleY: sc2, duration: t3, onComplete: function() {
			if (_this.scene  && !_this.cancelled) {
				game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'tournament_start'});
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'count_go'});
				setTimeout(() => {
					if (!_this.wait_mode)  _this.close_window(null);
					else if (!_this.cancelled) {
						game_data['audio_manager'].sound_event({'stop_all': true});	
						_this.emitter.emit('EVENT', {'event': 'start_tournament', 'settings':_this.settings});
						setTimeout(() => {
							_this.emitter.emit('EVENT', {'event': 'window_close'});
						}, 300);
					}
				}, 200);
			}
		}});
	}
},

handler_close(params) {  
	if (this.wait_mode && game_data['user_data']['levels_passed'].length > 0) this.close_window();
},

close_window(event = {}) {  
	if (!this.wait_mode) { 
		if (this.loosers.length) this.emitter.emit('EVENT', {'event': 'win_tournament', 'duel': true}); 
		game_data['audio_manager'].sound_event({'stop_all': true});	
		if (event == null) setTimeout(() => {
				this.emitter.emit('EVENT', {'event': 'window_close'});
			}, 300);
	}
	else if (event != null){ 		
		this.cancelled = true;
		this.emitter.emit('EVENT', {'event': 'cancel_tournament', 'duel': true}); 
		this.emitter.emit('EVENT', {'event': 'window_close'});	
		game_data['audio_manager'].sound_event({'stop_all': true});	
	}

	
	
},	

});

