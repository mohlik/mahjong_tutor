var WaitCompetitors = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function WaitCompetitors ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	var i;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_big');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'cup_bg2');
	temp.setScale(1.2);
	this.add(temp)
	game_data['error_history'].push('wc1');
	this.glow = new Phaser.GameObjects.Image(this.scene, 245, -60, 'common1', 'prize_chest_bg');
	this.glow.alpha = 0;
	this.glow.setScale(0.8)
	this.add(this.glow);
	temp = new Phaser.GameObjects.Image(this.scene, 252, -50, "common2", "cup_tournament");
	temp.setScale(0.8);
	this.add(temp);

	this.arrow_cont = new Phaser.GameObjects.Container(this.scene,  0, 0);
	this.add(this.arrow_cont);
	this.items_cont = new Phaser.GameObjects.Container(this.scene,  0, 0);

	var button_close = new CustomButton(this.scene, 280, -248, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_competitors', 'phrase_id': '1', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	this.waiting_text = new Phaser.GameObjects.Container(this.scene,  0, 236);
	this.waiting_text.alpha = 0;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "panel1");
	this.waiting_text.add(temp);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'wait_competitors', 'phrase_id': '2', 'values': [], 'base_size': 28});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.waiting_text.add(temp);

	this.ids = params['competitors_ids'];
	this.visual_ids = params['visual_ids'];
	if ('loosers' in params) {this.loosers = params['loosers'];}
	else {this.loosers = [];}
	if ('winners' in params) {this.winners = params['winners'];}
	else {this.winners = [];}
	this.settings = params['settings'];
	this.cancelled = false;

	var user_id = loading_vars['user_id'];
	for(i = 0; i < this.visual_ids.length; i++) {
		if (this.visual_ids[i]  == user_id) {
			this.player_pos = i; 
			break;
		}
	}

	this.wait_mode = ('start' in params && params['start'] == true);
	button_close.visible = this.wait_mode && game_data['user_data']['levels_passed'].length > 0;

	this.photo_loaded = [null, null, null, null];
	this.all_ids = [ [], [], [] ];

	this.coords = [
		{'x': -390, 'y': -121},{'x': -390, 'y': -15},{'x': -390, 'y': 91},{'x': -390, 'y': 197},
		{'x': -208, 'y': -68},{'x': -208, 'y': 38},{'x': -208, 'y': 144},
		{'x': -26, 'y': -15},{'x': -26, 'y': 91},
		{'x': 156, 'y': 38}
		];
		for (i =0; i < this.coords.length; i++) {
			this.coords[i].x += 95;
			this.coords[i].y -= 12;
		}
	
	setTimeout(() => {
		try {
			this.create_items();
		}
		catch(e) {

		}
		
	}, 5)
	setTimeout(() => {
		try {
			this.create_arrows();
		}
		catch(e) {

		}
		
	}, 10)
	setTimeout(() => {
		this.prepare_start_anim();
		this.add(this.waiting_text);
		if (this.wait_mode) {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tournament_start', 'sound_type': 'tournament_start', 'audio_kind': 'music'});
			if (this.player_pos + 1 < this.visual_ids.length && this.waiting_text) game_data['scene'].tweens.add({targets: this.waiting_text,  alpha: 1, duration: 500});	
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
	}, 15)
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
	this.item2 = new CompetitorItem();
	this.item3 = new CompetitorItem();
	this.item1_1 = new CompetitorItem();
	this.item1_2 = new CompetitorItem();
	this.item1_3 = new CompetitorItem();
	this.item2_1 = new CompetitorItem();
	this.item2_2 = new CompetitorItem();
	this.item_winner = new CompetitorItem();
	this.all_items = [this.item0, this.item1, this.item2, this.item3,  this.item1_1, this.item1_2, this.item1_3, this.item2_1, this.item2_2, this.item_winner ];
	this.items = [this.item0, this.item1, this.item2, this.item3];
	this.items1 = [this.item1_1, this.item1_2, this.item1_3];
	this.items2 = [this.item2_1, this.item2_2];
	var _scale = 1;
	for (let i = this.items.length; i < this.all_items.length; i++) {
		let temp = new Phaser.GameObjects.Image(this.scene, this.coords[i].x, this.coords[i].y, "common1", "competitor_bg");
		temp.setScale((72 * _scale) / temp.width);
		this.add(temp);
		temp = new Phaser.GameObjects.Image(this.scene, this.coords[i].x, this.coords[i].y, "common1", "ava_frame");
		temp.setScale((76 * _scale) / temp.width);
		this.add(temp);
		this.all_items[i].x = this.coords[i].x;
		this.all_items[i].y = this.coords[i].y;
		this.items_cont.add(this.all_items[i]);
		this.all_items[i].visible = false;
	}
	for (let i = 0; i < this.all_items.length; i++) this.all_items[i].scale = _scale;

	for (let i = 0; i < this.items.length; i++) {
		this.items[i].init({'user_id': this.visual_ids[i], 'with_spinner': this.wait_mode, 'with_photo': !this.wait_mode});
		this.items[i].x = this.coords[i].x;
		this.items[i].y = this.coords[i].y;
		this.items_cont.add(this.items[i]);
	}
	this.add(this.items_cont);
	
},

create_arrows() {
	var i;
	var temp;
	var suffix = '';
	var dummy = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'wc_arrow' + suffix);
	var sx = dummy.width - 14;
	var sy = dummy.height/2 - 1;
	var arrow0_1, arrow0_2, arrow0_3, arrow0_4, arrow0_5, arrow0_6, arrow1_1, arrow1_2, arrow1_3, arrow1_4, arrow2_1, arrow2_2;
	arrow0_1 = new Phaser.GameObjects.Image(this.scene, this.coords[0].x + sx, this.coords[0].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow0_1.setScale(1,-1);
	arrow0_2 = new Phaser.GameObjects.Image(this.scene, this.coords[1].x + sx, this.coords[1].y - sy, 'common2', 'wc_arrow' + suffix);
	arrow0_3 = new Phaser.GameObjects.Image(this.scene, this.coords[1].x + sx, this.coords[1].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow0_3.setScale(1,-1);
	arrow0_4 = new Phaser.GameObjects.Image(this.scene, this.coords[2].x + sx, this.coords[2].y - sy, 'common2', 'wc_arrow' + suffix);
	arrow0_5 = new Phaser.GameObjects.Image(this.scene, this.coords[2].x + sx, this.coords[2].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow0_5.setScale(1,-1);
	arrow0_6 = new Phaser.GameObjects.Image(this.scene, this.coords[3].x + sx, this.coords[3].y - sy, 'common2', 'wc_arrow' + suffix);

	arrow1_1 = new Phaser.GameObjects.Image(this.scene, this.coords[4].x + sx, this.coords[4].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow1_1.setScale(1,-1);
	arrow1_2 = new Phaser.GameObjects.Image(this.scene, this.coords[5].x + sx, this.coords[5].y - sy, 'common2', 'wc_arrow' + suffix);
	arrow1_3 = new Phaser.GameObjects.Image(this.scene, this.coords[5].x + sx, this.coords[5].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow1_3.setScale(1,-1);
	arrow1_4 = new Phaser.GameObjects.Image(this.scene, this.coords[6].x + sx, this.coords[6].y - sy, 'common2', 'wc_arrow' + suffix);	

	arrow2_1 = new Phaser.GameObjects.Image(this.scene, this.coords[7].x + sx, this.coords[7].y + sy, 'common2', 'wc_arrow' + suffix);
	arrow2_1.setScale(1,-1);
	arrow2_2 = new Phaser.GameObjects.Image(this.scene, this.coords[8].x + sx, this.coords[8].y - sy, 'common2', 'wc_arrow' + suffix);

	this.arrows = [arrow0_1, arrow0_2, arrow0_3, arrow0_4, arrow0_5, arrow0_6, arrow1_1, arrow1_2, arrow1_3, arrow1_4, arrow2_1, arrow2_2, dummy];
	this.arrows2 = [];
	this.arrows3 = [];
	this.arrows4 = [];
	for (i = 0; i < this.arrows.length - 1; i++) {
		this.arrow_cont.add(this.arrows[i]);
		this.arrows[i].visible = false;
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'wc_arrow2' + suffix);
		temp.x = this.arrows[i].x;
		temp.y = this.arrows[i].y;
		temp.setScale(1, this.arrows[i].scaleY);
		temp.visible = false;
		this.arrow_cont.add(temp);
		this.arrows2.push(temp);
		

		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'wc_arrow3' + suffix);
		temp.x = this.arrows[i].x;
		temp.y = this.arrows[i].y;
		temp.setScale(1, this.arrows[i].scaleY);
		temp.visible = false;
		this.arrow_cont.add(temp);
		this.arrows3.push(temp);

		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'wc_arrow4' + suffix);
		temp.x = this.arrows[i].x;
		temp.y = this.arrows[i].y;
		temp.setScale(1, this.arrows[i].scaleY);
		temp.visible = false;
		this.arrow_cont.add(temp);
		this.arrows4.push(temp);
		
	}
	this.arrows2.push(dummy);
	this.arrows3.push(dummy);
	this.arrows4.push(dummy);

	this.arr_map = [	[ //dummy = 12
							[ 12, 0 ],
							[	1, 2 ],
							[	3, 4 ],
							[	5, 12 ]
						],
						[ 
							[ 12, 6 ],
							[	7, 8 ],
							[	9, 12 ]
						],
						[ 
							[ 12, 10 ],
							[	11, 12 ]
						]
					];
	this.arrow_progress();
},

rotate_arrow(_i, sx,sy) {
	var items = [this.arrows[_i], this.arrows2[_i], this.arrows3[_i], this.arrows4[_i]]
	for (var i = 0; i < items.length; i++) {
		var dir = items[i].scaleY;
		if (dir > 0) {
			items[i].angle = -90;
			items[i].x -= 108;
			items[i].y -= 45;
		}
		else {
			items[i].angle = -90;
			items[i].x -= 26;
			items[i].y -= 134;
		}
	}
},

arrow_progress() {
	var i, j, k, dir;//direction - 0=left arrow, 1 = right arrow
	var a = [];
	var items_arr = [this.items, this.items1, this.items2];
	var pos;

	for (i = 0; i < this.items.length; i++) this.all_ids[0][i] = this.visual_ids[i];
	if (this.loosers.length >= 1) {
		j = 0;
		for (i = 0; i < this.visual_ids.length; i++) {
			if (this.loosers[0] != this.visual_ids[i]) {
				this.all_ids[1][j] = this.visual_ids[i];
				j++;
			}
		}
	}
	if (this.loosers.length >= 2) {
		j = 0;
		for (i = 0; i < this.visual_ids.length; i++) {
			if (this.loosers[1] != this.visual_ids[i] && this.loosers[0] != this.visual_ids[i]) {
				this.all_ids[2][j] = this.visual_ids[i];
				j++;
			}
		}
	}
	if (this.loosers.length == 3){
		if (this.all_ids[2][0] == loading_vars['user_id']) pos = this.arr_map[2][0][1];
		else pos = this.arr_map[2][1][0];
		this.arrows[pos].visible = true;
	}
	
	if (this.loosers.length < 3) {
		
		for (k = this.loosers.length; k < items_arr.length; k++) {
			a = this.arr_map[k];
			for (i = 0; i < this.all_ids[k].length; i++) {
				this.arrows[a[i][0]].visible = true;
				this.arrows[a[i][1]].visible = true;
			}
		}
		a = this.arr_map[2];
		this.arrows[a[1][0]].visible = true;
		this.arrows[a[0][1]].visible = true;
	}

	for (k = 0; k < this.loosers.length; k++) {		
		
		a = this.arr_map[k];
		dir = 1;
		
		for (i = 0; i < this.all_ids[k].length; i++) {
			if (this.loosers[k] == this.all_ids[k][i]) {
				dir = 0;
			}
			else {
				pos = a[i][dir];
				if (k+1 == this.loosers.length) this.arrows[pos].visible = true;
				else this.arrows4[pos].visible = true;					
			}
		}
	}

	if (this.loosers.length == 0) {
		for (i = 0; i < this.arrows.length; i++) {
			this.arrows[i].visible = true;
		}
	}
	if (this.winners.length >= 1) {
		k = 0;
		//if (this.winners.length == 1) k = 1;
		for (i = 0; i < this.all_ids[k].length; i++) 
			if (this.winners[0] == this.all_ids[k][i]) items_arr[k][i].set_winner(k == 0);
	}
	if (this.winners.length >= 2) {
		k = 1;
		//if (this.winners.length == 2) k = 2;
		for (i = 0; i < this.all_ids[k].length; i++) 
			if (this.winners[1] == this.all_ids[k][i]) items_arr[k][i].set_winner(k == 1);
	}
	if (this.winners.length == 3) {
		k = 2;
		for (i = 0; i < this.all_ids[k].length; i++) 
			if (this.winners[2] == this.all_ids[k][i]) items_arr[k][i].set_winner(k == 2);
		//this.item_winner.set_winner(false);
	}

},

init2() {
	var i,j;
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
			this.show_competitor(this.items[i], delay*1000, i == this.items.length - 1);
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
	var i, j;
	this.visual_ids1 = [];
	if (this.loosers.length >= 1) {
		j = 0;
		for (i = 0; i < this.visual_ids.length; i++) {
			if (this.loosers[0] != this.visual_ids[i]) {
				this.visual_ids1[j] = this.visual_ids[i];
				this.items1[j].init({'user_id': this.visual_ids[i], 'with_photo': true});
				if (this.loosers.length == 1) {
					this.items1[j].x = this.items[i].x;
					this.items1[j].y = this.items[i].y;
				}
				j++;
			}
		}
		for (i = 0; i < this.items1.length; i++) this.items1[i].visible = true;
	}

	if (this.loosers.length >= 2) {
		j = 0;
		
		for (i = 0; i < this.visual_ids.length; i++) {
			if (this.loosers[1] != this.visual_ids[i] && this.loosers[0] != this.visual_ids[i]) {
				this.items2[j].init({'user_id': this.visual_ids[i], 'with_photo': true});
				j++;
			}
		}
		if (this.loosers.length == 2) {
			j = 0;
			for (i = 0; i < this.items1.length; i++) {
				if (this.loosers[1] != this.visual_ids1[i] ) {
					this.items2[j].x = this.items1[i].x;
					this.items2[j].y = this.items1[i].y;
					j++;
				}
			}
		}
		for (i = 0; i < this.items2.length; i++) this.items2[i].visible = true;
	}

	if (this.loosers.length == 3){
		//winner_anim.play();
		this.item_winner.init({'user_id': loading_vars['user_id'], 'with_photo': true});
		if (this.all_ids[2][0] == loading_vars['user_id']) j = 0;
		else j = 1;
		this.item_winner.x = this.items2[j].x
		this.item_winner.y = this.items2[j].y
		this.item_winner.visible = true;

	}

	this.show_prorgess();
	
},

show_prorgess() {
	var i, k, j, dir; //direction - 0=left arrow, 1 = right arrow
	var a = [];
	var items_arr = [this.items, this.items1, this.items2, [this.item_winner]];
	var allow_sound = true;
	for (k = 0; k < this.loosers.length; k++) {		
		a = this.arr_map[k];
		dir = 1;
		j = 0;
		for (i = 0; i < this.all_ids[k].length; i++) {
			
			if (this.loosers[k] == this.all_ids[k][i]) {
				dir = 0;
				items_arr[k][i].set_looser((k+1 == this.loosers.length));
			}
			else {
				if (k+1 == this.loosers.length) {
					this.anim_progress(items_arr[k+1][j], a[i][dir], dir); 
					if (allow_sound) setTimeout(() => {
						game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'round_finish_move_photo'});
					}, 1500);
					allow_sound = false;
				}	
				j++;			
			}
		}
		if (k+1 == this.loosers.length) {
			setTimeout(() => {
				this.countdown();
			}, 3000);
		}
	}
},

anim_progress(_item, _pos, dir) {
	var shiftY = 53;
	var shiftX = 182;
	var _delay = 400;
	var durX = 300;
	var durY = 200;
	if (dir == 1) {
		shiftY *= -1;
	}
	var _this = this;
	setTimeout(() => {
		if (this.scene) {
			if (this.scene && _item) game_data['scene'].tweens.add({targets: _item, x: _item.x + shiftX / 2, duration: durX});	
			if (this.scene && _item) game_data['scene'].tweens.add({targets: _item, y: _item.y - shiftY, duration: durY, delay: _delay});
			if (this.scene && _item) game_data['scene'].tweens.add({targets: _item, x: _item.x + shiftX, duration: durX, delay: _delay * 2});

			setTimeout(() => { if (_this.scene) _this.arrows2[_pos].visible = true; }, 250);	
			setTimeout(() => { if (_this.scene) _this.arrows3[_pos].visible = true; }, 600);	
			setTimeout(() => { if (_this.scene) _this.arrows4[_pos].visible = true; }, 850);	

			if (this.scene && this.loosers.length == 3) {
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'user_win'});
				if (this.scene && this.glow) game_data['scene'].tweens.add({targets: this.glow, alpha: 1, duration: 100});
				if (this.scene && this.glow) game_data['scene'].tweens.add({targets: this.glow, scaleX: 1.5, scaleY: 1.5, duration: 300});
				if (this.scene && this.glow) game_data['scene'].tweens.add({targets: this.glow, angle: 360, duration: 1500, delay: 200});			
			}
		}
	}, 1500);
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
	// this.emitter.emit('EVENT', {'event': 'cancel_level'});
	
	if (this.loosers.length == 3) {  
		setTimeout(() => {this.close_window(null)},1000);
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
	if (mc) game_data['scene'].tweens.add({targets: mc, alpha: 1, duration: 200});
	if (_this.coundown_items.length && mc)
		game_data['scene'].tweens.add({targets: mc, scaleX: sc1, scaleY: sc1, duration: t1, onComplete: function() {
			if (!_this.cancelled) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'count_321'});
			if (_this.scene && mc) game_data['scene'].tweens.add({targets: mc, scaleX: sc2, scaleY: sc2, duration: t2, onComplete: function() {
				if (_this.scene && mc) game_data['scene'].tweens.add({targets: mc, scaleX: sc3, scaleY: sc3, alpha: 0, duration: t3, onComplete: function() {
					if (_this.scene  && !_this.cancelled) {
						if (_this.coundown_items.length) _this.play_countdown();
					}
				}});
			}});
		}});
	else {
		mc.setScale(sc3, sc3);
		if (_this.scene && mc) game_data['scene'].tweens.add({targets: mc, scaleX: sc2, scaleY: sc2, duration: t3, onComplete: function() {
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
						}, 200);
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
		if (this.loosers.length < 3 ) this.emitter.emit('EVENT', {'event': 'continue_tournament'}); 
		else this.emitter.emit('EVENT', {'event': 'win_tournament'}); 
		game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'tournament_start'});
		if (event == null) setTimeout(() => {
				this.emitter.emit('EVENT', {'event': 'window_close'});
			}, 300);
	}
	else if (event != null){ 		
		this.cancelled = true;
		this.emitter.emit('EVENT', {'event': 'cancel_tournament'}); 
		this.emitter.emit('EVENT', {'event': 'window_close'});	
		game_data['audio_manager'].sound_event({'stop': true, 'sound_type': 'tournament_start'});
		setTimeout(() => {
			game_data['game_map'].reset_music();	
		}, 300);
	}

	
	
},	

});

