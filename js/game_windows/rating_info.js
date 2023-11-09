var RatingInfo = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function RatingInfo ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		this.visible = false;
		var temp;
		var res;
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setInteractive();
		temp.on('pointerup', this.stop_drag, this);
		var scaleX = 1.3;
		var scaleY = 1.21;
		temp.setScale(scaleX, scaleY);
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);

		var button_close = new CustomButton(this.scene, 229 * scaleX, -261 * scaleY, this.handler_close, 'common2', 'close1', 'close2', 'close3', this, null, null, 1.2);

		this.add(button_close);

		this.league_id = game_data['user_data']['rating_info']['league_id'];
		this.league_info = game_data['rating_settings']['leagues'][this.league_id];

		temp = new Phaser.GameObjects.Image(this.scene, -205, button_close.y + 5, 'common2', 'league_icon_' + this.league_id);
		temp.scale = 55/temp.height;
		this.add(temp)
		temp = new Phaser.GameObjects.Image(this.scene, 205 - 2, button_close.y + 5, 'common2', 'league_icon_' + this.league_id);
		temp.scale = 55/temp.height;
		this.add(temp);

		var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'league_name', 'phrase_id': this.league_id, 'values': [], 'base_size': 40});
		this.league_name = new Phaser.GameObjects.Text(this.scene, -4, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000'});
		this.league_name.setOrigin(0.5);
		this.add(this.league_name);

		var hx = -106;
		var hy = -260;
		var hw = 450;
		var hh = 565;
		this.holder_width = hw;
		this.holder_height = hh;
		

		this.holder = new Phaser.GameObjects.Container(this.scene, hx + 8, hy);
		
		this.holder_min = this.holder.y;
		this.holder_last_pos = this.holder.y;
		this.holder_max = 0;
		var key = 'rating_dragger';
		if (!game_data['graphics'][key]) {
			var rect = new Phaser.Geom.Rectangle(0, 0, hw, hh);
			var graphics = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 0 } })
			graphics.fillRectShape(rect);
			graphics.generateTexture(key, hw, hh);
			graphics.destroy();
		}
		
		this.dragger = new Phaser.GameObjects.Image(this.scene, hx, hy, key);
		this.dragger.setOrigin(0,0);
		this.add(this.dragger)			
		this.dragger.setInteractive({ draggable: true });
		this.is_dragging = false;
		this.dragger.on('drag', function(pointer, dragX, dragY) {
			if (!_this.is_dragging) {
				_this.is_dragging = Math.abs(_this.holder_min - dragY) > 5;
				if (_this.is_dragging) {
					_this.timer_photos_load.paused = false;	
					_this.block_buttons = true;
				}
			}
			if (_this.is_dragging && _this.holder_max ) {
				var new_pos = dragY - _this.dragger.y + _this.holder_last_pos;
				if (new_pos > _this.holder_min) new_pos = _this.holder_min;
				if (new_pos < _this.holder_max) new_pos = _this.holder_max;
				_this.holder.y = new_pos;
				_this.update_scroll();
			}
		});
		this.dragger.on('pointerup', this.stop_drag, this);
		
		this.timer_photos_load = this.scene.time.addEvent({delay: 500, callback: this.display_unloaded_photos, callbackScope: this, loop: true});
		this.timer_photos_load.paused = true;
		this.block_buttons = true;

		
		this.create_scroll();
		this.create_items();
		this.create_sidebar();
		this.add(this.holder);
		setTimeout(() => {
			if (this.scene) this.create_bottom_bar();
		}, 20);
	},
	
	window_shown() {
		setTimeout(() => {
			if (this.scene) {
				this.set_mask();
				this.find_user();
				this.block_buttons = false;
				this.update_visibility();
				this.alpha = 0;
				this.visible = true;
				game_data['scene'].tweens.add({targets: this, alpha: 1, duration: 100});
			}
		}, 20);
		
	},

	update_visibility(){
		var i, item, pos;
		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];
			pos = item.y + this.holder.y;
			item.visible = pos >= this.vis_min && pos <= this.vis_max;
		}
	},

	stop_drag() {
		if (this.is_dragging) {
			this.is_dragging = false;
			this.block_buttons = false;
			this.holder_last_pos = this.holder.y;
			this.update_scroll();
			
			this.timer_photos_load.paused = true;
			this.display_unloaded_photos();
		}
	},

	update_scroll() {
		var rating_max_shift = this.rating_size > this.holder_height ? this.rating_size - this.holder_height : 0;
		this.scroll_percentage = (rating_max_shift == 0) ? 0 :(this.holder_min - this.holder.y) / rating_max_shift * 100;		
		this.scroll_button.y = this.scroll_min_y + this.scroll_percentage * this.scroll_max_y / 100;
		this.update_visibility();
	},

	create_items() {
		var i, item, info;
		var temp;
		this.items = [];
		var graphics;
		var key = 'rating_info3';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x2F261B, 0.8);
			graphics.lineStyle(3, 0x7A7672, 1);
			graphics.fillRoundedRect(5 , 5, 460, 570, 10);
			graphics.strokeRoundedRect(5, 5, 460, 570, 10);
			graphics.generateTexture(key, 470, 580);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 120, 27, key);
		if (t) {
			game_data['graphics'][key] = true;
			this.add(t);
		}

		var template = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'panel2');
		var divider_template = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'rating_item_up');
		var shift = template.displayHeight;
		this.shift = shift;
		var add_shift = 0; //upd-down leagues info
		game_data['user_data']['rating'].sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
		for (i = 0; i < game_data['user_data']['rating'].length; i++) {
			info = game_data['user_data']['rating'][i];
			info['place'] = i+1;
			var item = new Phaser.GameObjects.Container(this.scene,0, i * shift + add_shift);
			this.holder.add(item);
			this.items.push(item);
			item.info = info;
			item.visible = false;
			item.user_id = info['user_id'];
			item.player = item.user_id == loading_vars['user_id'];
			if (item.player) this.player_item = item;
			
			
			if ( i+1 < game_data['user_data']['rating'].length && 
				(i+1 == this.league_info['promotion_rank'] || i+1 == this.league_info['knockout_rank'])) {				
				item = new Phaser.GameObjects.Container(this.scene, 0, i * shift + add_shift + shift);
				add_shift += divider_template.displayHeight;
				this.holder.add(item);
				this.items.push(item);
				item.visible = false;
				this.create_divider_item(item, i + 1 == this.league_info['promotion_rank'])
			}
		}

		var player_place = this.player_item.info.place;
		for (i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if (!item.divider) {
				var place_diff = player_place - item.info.place;
				var timeout = Math.abs(place_diff) * 15 + (place_diff > 0 ? 10 : 0);
				if (player_place > 4 && player_place < 47 && Math.abs(place_diff) > 3) timeout += 300;
				this.create_item_assets(item, timeout);
			}
		}
		this.holder_max = this.holder_min - game_data['user_data']['rating'].length * shift + this.holder_height - add_shift;
		this.rating_size = Math.abs(this.holder_max) + this.holder_height / 2 + shift / 2 - divider_template.displayHeight / 2;
		this.vis_min = this.holder_min - shift;
		this.vis_max = this.holder_min + this.holder_height + shift;
	},

	create_item_assets(item, timeout) {
		var info = item.info;
		setTimeout(() => {
			if (this.scene) {
				var temp;
				temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', item.player ? 'panel2': 'panel2');
				temp.setOrigin(0)
				item.add(temp);
				
				item.photo_cont = new Phaser.GameObjects.Container(this.scene, 49, 49);
	
				item.place_txt = new Phaser.GameObjects.Text(this.scene, 15, 75,  info['place'], { fontFamily: 'font1', fontSize: 18, color: '#FFFFFF', stroke: '#000000', strokeThickness: 2});
				item.place_txt.setOrigin(0, 0.5);	
				
				item.add(item.photo_cont);
				temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'competitor_bg');
				temp.setScale(70 / temp.width);
				item._bg = temp;
				item.photo_cont.add(temp);
				item.photo_loaded = false;
				
				temp = new Phaser.GameObjects.Image(this.scene, item.photo_cont.x, item.photo_cont.y, 'common1', item.player ? 'ava_competitor_player' : 'ava_competitor');
				temp.setScale(84 / temp.width);
				item.add(temp);
				item.add(item.place_txt);
	
				item.name_txt = new Phaser.GameObjects.Text(this.scene, 105, item.photo_cont.y, '-', { fontFamily: 'font1', fontSize: 22, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
				item.name_txt.setOrigin(0, 0.5);
				item.add(item.name_txt);
				
				
				var user_info = game_data['users_info'][info['user_id']];		
				if (user_info && 'first_name' in user_info) item.name_txt.text = user_info['first_name'];
	
				item.score_bg = new Phaser.GameObjects.Image(this.scene, 365, item.photo_cont.y - 4, 'common1', 'but_down');
				item.score_bg.scale = 0.9;
				item.add(item.score_bg);
				temp = new Phaser.GameObjects.Image(this.scene, item.score_bg.x + 40, item.score_bg.y - 5, 'common1', 'score_icon');
				item.add(temp);
				item.score_txt = new Phaser.GameObjects.Text(this.scene, item.score_bg.x + 20, item.score_bg.y - 8, info['score'], { fontFamily: 'font1', fontSize: 25, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
				item.score_txt.setOrigin(1, 0.5);
				item.add(item.score_txt);
	
				item.has_assets = true;
				item.photo_loaded = false;
			}
		}, timeout);
	},

	create_divider_item(item, promotion) {
		var bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', promotion ? 'rating_item_up' : 'rating_item_down');
		item.add(bg);
		bg.setOrigin(0);
		item.info = {};
		item.info.user_id = -1;
		item.photo_loaded = true;
		item.divider = true;
		var temp = new Phaser.GameObjects.Image(this.scene, 36, -1 + bg.height/2, 'common2', 'arrow_icon');
		temp.setScale(0.7)
		temp.scaleY = promotion ? 0.7 : 0.7;
		item.add(temp);
		temp = new Phaser.GameObjects.Image(this.scene, bg.width - 36, -1 + bg.height/2, 'common2', 'arrow_icon');
		temp.setScale(0.7)
		temp.scaleY = promotion ? 0.7 : 0.7;
		item.add(temp);

		var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'rating', 'phrase_id': promotion ? '5' : '6', 'values': [], 'base_size': 16});
		item.txt = new Phaser.GameObjects.Text(this.scene, bg.width/2, bg.height/2, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap:{width: 360}});
		item.txt.setOrigin(0.5);
		item.txt.setLineSpacing(-4);
		item.add(item.txt);

	},

	create_scroll() {
		var _this = this;
		var scroll_bar = new Phaser.GameObjects.Container(this.scene, this.holder.x + 11 + this.holder_width, this.holder.y);
		this.add(scroll_bar);
		var btn_extra = 1;
		var scroll_line = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'scroll_bg_rating');
		scroll_line.setOrigin(0.5,0);
		scroll_line.setScale(1, this.holder_height / scroll_line.height);
		scroll_bar.add(scroll_line);
		
		this.scroll_button = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'scroller_rating');
		this.scroll_button.setOrigin(0.5,0);
		this.scroll_min_y = -this.scroll_button.height * (1 - btn_extra);
		scroll_bar.add(this.scroll_button);                    
		var rect = new Phaser.Geom.Rectangle(-this.scroll_button.width *0.5, -this.scroll_button.height *0.3, this.scroll_button.width*2, this.scroll_button.height* 1.5);
		this.scroll_button.setInteractive({ 
			hitArea: rect,
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		});		
		this.scroll_max_y = parseInt(this.holder_height - this.scroll_button.height * btn_extra);	
		this.scroll_button.on('drag', function(pointer, dragX, dragY){	
			if (!_this.block_buttons) {
				var pos_y;
				if (dragY > _this.scroll_max_y) pos_y = _this.scroll_max_y;
				else if (dragY < _this.scroll_min_y) pos_y = _this.scroll_min_y;
				else pos_y = dragY;
					
				_this.scroll_button.y = pos_y;
				_this.scroll_percentage = pos_y / _this.scroll_max_y * 100;
				_this.scroll_rating(false);
			}
		});
		this.scroll_button.on('dragstart', function(){ 
			_this.timer_photos_load.paused = false;			
		});
		this.scroll_button.on('dragend', function(){ 
			_this.timer_photos_load.paused = true;
			_this.display_unloaded_photos();
		});		
	},

	scroll_rating(is_smooth, on_complete = null, is_quick = false) {
		var _this = this;
		
		var rating_max_shift = this.rating_size > this.holder_height ? this.rating_size - this.holder_height : 0;			
		var _dur = is_quick ? 200 : 1000;
		if (is_smooth) {
			this.block_buttons = true;
			this.timer_photos_load.paused = false;
			var delta = Math.abs(this.holder.y - (this.holder_min - rating_max_shift * this.scroll_percentage / 100));
			
			if (delta < 250 && _dur > 200) _dur = 300;
			if (delta > 1) this.scene.tweens.add({
				targets: this.holder,            
				y: this.holder_min - rating_max_shift * this.scroll_percentage / 100,
				duration: _dur,                        
				onComplete: function () { 
					_this.block_buttons = false;
					_this.timer_photos_load.paused = true;	
					_this.holder_last_pos = _this.holder.y;				
					if (on_complete) on_complete();					
				}
			});	
			else {
				_this.block_buttons = false;
				_this.timer_photos_load.paused = true;				
				if (on_complete) on_complete();
			}			
		}
		else {
			this.holder.y = this.holder_min - rating_max_shift * this.scroll_percentage / 100;			
			_this.holder_last_pos = _this.holder.y;
			this.update_visibility();
			if (on_complete) on_complete();
		}	
		return 	_dur;
	},

	display_unloaded_photos() {
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if (item.visible && item.has_assets && !item.photo_loaded) this.load_photo(item);
		}
	},

	find_user() {
		var item = this.player_item;
		var new_pos = this.holder_min - item.y + this.holder_height / 2 - this.shift / 2;
		if (new_pos > this.holder_min) new_pos = this.holder_min;
		if (new_pos < this.holder_max) new_pos = this.holder_max;
		this.holder.y = new_pos;
		this.holder_last_pos = this.holder.y;
		this.update_scroll();
		this.update_visibility();

		setTimeout(() => {
			if (this.scene) this.display_unloaded_photos();
		}, 600);
	},

	set_mask() {
		var pt = game_data['utils'].toGlobal(this.dragger, new Phaser.Geom.Point(0,5));

		var shape = this.scene.add.graphics({ fillStyle: { color: 0xFFFFFF, alpha: 0.3 } });
		var rect = new Phaser.Geom.Rectangle(pt.x, pt.y, this.holder_width, this.holder_height);
		shape.fillRectShape(rect);
		var mask = shape.createGeometryMask();
		this.holder.setMask(mask);
		this.holder.mask_item = shape;
		shape.visible = false;
	},

	load_photo(item) {
		var user_id = item.user_id;
		item.photo_loaded = true;
		var _this = this;
		game_data['utils'].load_user_photo(user_id, function(res){
			if (_this.scene) {
				if (res['success'] && res['photo']) {
					item.photo = res['photo'];
					var scale = 68 / item.photo.width;
					item.photo.setScale(scale);
					item.photo_cont.add(item.photo);
					if (item._bg) item._bg.destroy();
	
				}
				var user_info = game_data['users_info'][user_id];		
				if (user_info && 'first_name' in user_info) item.name_txt.text = user_info['first_name'];
			}
		});	
	},

	create_sidebar() {
		var player_info = this.get_player_stat();
		var stat_cont = new Phaser.GameObjects.Container(this.scene, -235, -160);
		this.add(stat_cont);
		var reward_cont = new Phaser.GameObjects.Container(this.scene, -235, 130);
		this.add(reward_cont);
		var graphics;
		var key = 'rating_info1';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x194143, 0.8);
			graphics.lineStyle(3, 0x7A7672, 1);
			graphics.fillRoundedRect(5 , 5, 230, 190, 10);
			graphics.strokeRoundedRect(5, 5, 230, 190, 10);
			graphics.generateTexture(key, 240, 200);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			stat_cont.add(t);
		}
		key = 'rating_info2';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x194326, 0.8);
			graphics.lineStyle(3, 0x7A7672, 1);
			graphics.fillRoundedRect(5 , 5, 230, 370, 10);
			graphics.strokeRoundedRect(5, 5, 230, 370, 10);
			graphics.generateTexture(key, 240, 380);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			reward_cont.add(t);
		}
 
		var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '1', 'values': [player_info['place']], 'base_size': 20});
		var txt = new Phaser.GameObjects.Text(this.scene, 0, -75, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		txt.setOrigin(0.5);
		stat_cont.add(txt);

		var y_pos = -16;
		var temp = new Phaser.GameObjects.Image(this.scene, 82, y_pos -5, 'common2', 'league_icon_' + player_info['move_league']);
		temp.scale = 65/temp.height;
		stat_cont.add(temp);

		if (player_info['move_status'] != 'stable') {
			temp = new Phaser.GameObjects.Image(this.scene, temp.x, temp.y + 43, 'common2', 'arrow_icon');
			temp.scale = 0.5;
			temp.scaleY *=  player_info['move_status'] == 'promotion' ? 1 : -1;

			stat_cont.add(temp);
		}

		res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'move_status', 'phrase_id': player_info['move_status'], 'values': [this.player_item.info.place], 'base_size': 14});
		txt = new Phaser.GameObjects.Text(this.scene, -28, y_pos, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2, align: 'center', wordWrap:{width: 170}});
		txt.setOrigin(0.5);
		txt.setLineSpacing(-4);
		stat_cont.add(txt);

		res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '2', 'values': [], 'base_size': 18});
		txt = new Phaser.GameObjects.Text(this.scene, 0, 55, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2, align: 'center', wordWrap:{width: 220}});
		txt.setOrigin(0.5, 1);
		txt.setLineSpacing(-4);
		stat_cont.add(txt);

		txt = new Phaser.GameObjects.Text(this.scene, 0, 73, player_info['prize'], { fontFamily: 'font1', fontSize: 30, color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		txt.setOrigin(0.5);
		stat_cont.add(txt);
		var icon = new Phaser.GameObjects.Image(this.scene, txt.x, txt.y, 'common1', 'money_ico_btn');
		icon.scale = 0.65;
		stat_cont.add(icon);
		txt.x -= icon.displayWidth/2;
		icon.x = txt.x + txt.width/2 + icon.displayWidth/2;


		var prizes = game_data['rating_settings']['prizes'];
		setTimeout(() => {
			if (this.scene) {
				y_pos = -60;
				for (var i = 0; i < prizes.length; i++) {
					var item = new Phaser.GameObjects.Image(this.scene, 0, y_pos, 'common1', 'panel7');
					item.setScale(220/item.width, 32/item.height);
					reward_cont.add(item);
					var s = String(prizes[i]['from']);
					if (prizes[i]['from'] != prizes[i]['to']) s += '-' + String(prizes[i]['to'])
					txt = new Phaser.GameObjects.Text(this.scene, item.x - 100, item.y, s, { fontFamily: 'font1', fontSize: 24, color: '#feea8f', stroke: '#000000', strokeThickness: 2});
					txt.setOrigin(0, 0.5);
					reward_cont.add(txt);
	
					icon = new Phaser.GameObjects.Image(this.scene, item.x + 100, item.y - 1, 'common1', 'money_ico_btn');
					icon.scale = 0.55;
					icon.setOrigin(1,0.5);
					reward_cont.add(icon);
					txt = new Phaser.GameObjects.Text(this.scene, icon.x - 30, item.y, prizes[i]['amount'] * this.league_info['rating_prize_coef'], { fontFamily: 'font1', fontSize: 24, color: '#feea8f', stroke: '#000000', strokeThickness: 2});
					txt.setOrigin(1, 0.5);
					reward_cont.add(txt);
	
	
					y_pos += 32;
				}
			}
		}, 50);
		

		res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '3', 'values': [], 'base_size': 20});
		txt = new Phaser.GameObjects.Text(this.scene, 0, -90, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		txt.setOrigin(0.5);
		reward_cont.add(txt);

		var y_shift = -30;
		res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '4', 'values': [], 'base_size': 16});
		txt = new Phaser.GameObjects.Text(this.scene, -29, -135 + y_shift, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		txt.setOrigin(0.5);
		reward_cont.add(txt);

		var temp = new Phaser.GameObjects.Image(this.scene, 82, -115 + y_shift, 'common2', 'league_icon_' + this.league_id);
		temp.scale = 75/temp.height;
		reward_cont.add(temp);
/*
		res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '6', 'values': [], 'base_size': 18});
		txt = new Phaser.GameObjects.Text(this.scene, 0, -60, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		txt.setOrigin(0.5);
		reward_cont.add(txt);
*/
		
		this.day_text = new Phaser.GameObjects.Text(this.scene, -29, -88 + y_shift, '', { fontFamily: 'font1', fontSize: 22, color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		this.day_text.setOrigin(0.5);
		reward_cont.add(this.day_text);
		this.day_text.def_y = this.day_text.y

		this.time_text = new Phaser.GameObjects.Text(this.scene, -29, -111 + y_shift, '', { fontFamily: 'font1', fontSize: 16, color: '#feea8f', stroke: '#000000', strokeThickness: 2});
		this.time_text.setOrigin(0.5);
		reward_cont.add(this.time_text);
		this.time_text.def_y = this.time_text.y;
		this.text_shifted = false;
		this.timer = this.scene.time.addEvent({
			delay: 500,
			callback: this.handler_timer,
			callbackScope: this,
			loop: true
		});
		this.handler_timer();
	},

	handler_timer() {
		var day = game_data['rating_manager'].end_days;
		var time = game_data['rating_manager'].end_time;
		if (day <= 0 && !this.text_shifted) {
			this.text_shifted = true;
			this.day_text.visible = false;
			this.time_text.setFontSize(20);
			// this.time_text.y = -105 - 30;
		}
		else if (day > 0) {
			var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '5', 'values': [day], 'base_size': 22});
			this.day_text.text = res['text'];
		}
		this.time_text.text = time;
	},

	get_player_stat() {
		var obj = {};
		var place = this.player_item.info.place;
		obj['place'] = place;
		obj['move_status'] = 'stable'
		obj['move_league'] = this.league_id;
		var order = game_data['rating_settings']['leagues'][this.league_id]['order'];
		if (place <= this.league_info['promotion_rank'] && order < 4) {
			obj['move_status'] = 'promotion';
			order += 1;
		}
		else if (place > this.league_info['knockout_rank'] && order > 0) {
			obj['move_status'] = 'knockout';
			order -= 1;
		}
		for (var s in game_data['rating_settings']['leagues']) {
			if (game_data['rating_settings']['leagues'][s]['order'] == order) {
				obj['move_league'] = s;
				break;
			}
		}
		var prizes = game_data['rating_settings']['prizes'];
		var prize = 0;
		for (var i = 0; i < prizes.length; i++) {
			var item = prizes[i];
			if (place >= item['from'] && place <= item['to']) {
				prize = item['amount'];
				break;
			}
		}
		obj['prize'] = parseInt(prize * this.league_info['rating_prize_coef']);

		return obj;
	},

	create_bottom_bar() {
		var i, s, temp;
		var cont = new Phaser.GameObjects.Container(this.scene, 0, 338);
		
		this.add(cont);
		this.bottom_bar = cont;
		var leagues = []
		for (s in game_data['rating_settings']['leagues']) {
			leagues.push({'id':s, 'order': game_data['rating_settings']['leagues'][s]['order']});
		}
		leagues.sort((a,b) => (a.order < b.order) ? -1 : ((b.order < a.order) ? 1 : 0));
		var pos = [];
		var x_pos = -130;
		var step = 65;
		
		for (i = 0; i < leagues.length; i++) {
			pos.push({'x': x_pos, 'type': leagues[i]['id']});
			if (i+1 < leagues.length) pos.push({'x': x_pos + step / 2, 'type': null});
			x_pos += step;
		}
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'panel1');
		cont.add(temp);
		
		for (i = 0; i < pos.length; i++) {
			if (pos[i]['type']) {
				s = pos[i]['type'];
				temp = new Phaser.GameObjects.Image(this.scene, pos[i].x, 0, 'common1', (s == this.league_id ? 'league_mini_bg1' : 'league_mini_bg2'));
				// temp.scale = 0.45;
				cont.add(temp);
				this.bind_hint(temp, s)
				temp = new Phaser.GameObjects.Image(this.scene, pos[i].x, 0,  'common1', 'league_mini_' + s);
				temp.scale = 45/temp.height;
				cont.add(temp);
			}
			else {
				temp = new Phaser.GameObjects.Image(this.scene, pos[i].x, 0, 'common1', 'league_mini_arrow');
				// temp.setScale(-0.5,0.5);
				cont.add(temp);
			}
		}
	},

	bind_hint(item, league) {
		var _this = this;
		item.setInteractive({ useHandCursor: true});
		item.on('pointerdown',()=>{_this.show_tip(item, league)}, this);
		item.on('pointerup',()=>{
			if (_this.tip && _this.tip.league == league)
				_this.hide_tip()
		}, this);
	},

	show_tip(item, league) {
		var _this = this;
		if (!this.tip) this.init_tip();
		var tip = this.tip;
		var bottom_bar = this.bottom_bar;
		this.hide_tip(tip.visible, function(){
			tip.alpha = 0;
			tip.visible = true;
			tip.x = item.x;
			tip.y = item.y;
			bottom_bar.add(tip);

			_this.update_tip(league);

			game_data['scene'].tweens.add({targets: tip, alpha: 1, duration: 50});

		})
		
	},

	hide_tip(quick = false, on_complete = null) {
		var _this = this;
		var tip = this.tip;
		if (this.tid_tip) {
			clearTimeout(this.tid_tip);
			this.tid_tip = null;
		}
		if (!tip.visible) {
			if (on_complete) on_complete();
		}
		else this.tid_tip = setTimeout(() => {
			if (this.scene) game_data['scene'].tweens.add({targets: tip, alpha: 0, duration: quick ? 30 : 100, onComplete: function(){
				if (!quick) {
					tip.visible = false;
				}
				if (on_complete) on_complete();
			}});
		}, quick ? 10 : 2000);
	},

	init_tip() {
		this.tip = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.tip.league = '';
		this.tip.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tip_bg');
		this.tip.bg.setOrigin(0.05, 0);
		this.tip.bg.scaleY = -1;
		var x_center = this.tip.bg.width/2 * 0.9;
		this.tip.x_center = x_center;
		this.tip.add(this.tip.bg);
	
		this.tip.league_name = new Phaser.GameObjects.Text(this.scene, x_center, -130, '', { fontFamily: 'font1', fontSize: 30, color: '#3f2618'});
		this.tip.league_name.setOrigin(0.5);
		this.tip.add(this.tip.league_name);


		var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'sidebar', 'phrase_id': '7', 'values': [], 'base_size': 28});
		var txt = new Phaser.GameObjects.Text(this.scene, x_center, -68, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#3f2618'});
		txt.setOrigin(0.5, 1);
		this.tip.add(txt);

		this.tip.prize = new Phaser.GameObjects.Text(this.scene, x_center, -47, '', { fontFamily: 'font1', fontSize: 30, color: '#3f2618'});
		this.tip.prize.setOrigin(0.5);
		this.tip.add(this.tip.prize);
		this.tip.icon = new Phaser.GameObjects.Image(this.scene, this.tip.prize.x, this.tip.prize.y, 'common1', 'money_ico_btn');
		this.tip.icon.scale = 0.65;
		this.tip.add(this.tip.icon);
		
		
	},

	update_tip(league) {
		this.tip.league = league;
		var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'league_name', 'phrase_id': league, 'values': [], 'base_size': 35});
		this.tip.league_name.text = res['text'];
		var prize = game_data['rating_settings']['prizes'][0]['amount'] * game_data['rating_settings']['leagues'][league]['rating_prize_coef'];
		this.tip.prize.x = this.tip.x_center;
		this.tip.prize.text = String(prize);
		this.tip.prize.x -= this.tip.icon.displayWidth/2;
		this.tip.icon.x = this.tip.prize.x + this.tip.prize.width/2 + this.tip.icon.displayWidth/2;
	},

	handler_close(params) {  
		this.timer.paused = true;
		this.timer.destroy();
		this.timer_photos_load.paused = true;
		this.timer_photos_load.destroy();
		this.holder.clearMask(true);
		for (var i = 0; i < this.items.length; i++) this.items[i].destroy();
		this.emitter.emit('EVENT', {'event': 'window_close', 'immediate': true});
	},	


});