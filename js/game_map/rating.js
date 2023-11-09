var Rating = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Rating ()
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();    
										
	},
	
	init(_sprite, _moving) {  
		var _this = this;
		this.rating_sprite = _sprite;
		var i;
		if (!('gift_users' in game_data['user_data'])) game_data['user_data']['gift_users'] = {};
		game_data['rating_manager'] = this;
		this.attr = {'w': 242, 'h': 570, 'holderX': 10, 'holderY': 242, 'holderW': 215, 'holderH': 315, 'itemW': 205, 'itemH': 48};
		this.items = [];

		var start_pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.attr['holderX'], this.attr['holderY']));
		this.rating_sprite.x = start_pt.x;
		this.rating_sprite.y = start_pt.y;
		this.attr['ratingY'] = start_pt.y;
		this.escalating_item = null;
		this.timer_photos_load = this.scene.time.addEvent({delay: 500, callback: this.display_unloaded_photos, callbackScope: this, loop: true});
		this.timer_photos_load.paused = true;
		var suffix = '';
		this.bg = new Phaser.GameObjects.Image(this.scene, -17, -70, "common1", "rating_bg" + suffix);
		this.bg.setOrigin(0);
		this.add(this.bg);
		this.bg.setInteractive();

		var rating_mask = new Phaser.GameObjects.Graphics(this.scene);
		rating_mask.fillStyle(0xffffff, 1);
		
		rating_mask.fillRect(start_pt.x - 5, start_pt.y, this.attr['holderW'] * this.scale, this.attr['holderH']  * this.scale);
		var mask = new Phaser.Display.Masks.GeometryMask(this.scene, rating_mask);    
		
		this.rating_sprite.setMask(mask);
		this.rating_holder = this.rating_sprite;	

		var drag_dispatcher = new Phaser.GameObjects.Container(this.scene, 0, this.attr['holderY']);						
		this.add(drag_dispatcher);		
		
		let temp = new Phaser.GameObjects.Image(this.scene, this.attr['w'] / 2 + 3, 165, "common1", "rating_name" + suffix);
		this.add(temp);
		
		this.title_txt = new Phaser.GameObjects.Text(this.scene, this.attr['w'] / 2, temp.y - 2,  '', { fontFamily: 'font1', fontSize: 24, color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
		this.title_txt.setOrigin(0.5);
		this.add(this.title_txt);	
		
		res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_stand', 'phrase_id': 'all', 'values': [], 'base_size': 18});
		this.ending_header = new Phaser.GameObjects.Text(this.scene, this.attr['w'] / 2, 95, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#e3c5aa', stroke: '#3e3d3d', strokeThickness: 3});	
		this.ending_header.setOrigin(0.5);
		this.add(this.ending_header);
		
		this.buttons_info = {
			'style': { fontFamily: 'font1', fontSize: 17, color: '#FFFFFF', stroke: '#000000', strokeThickness: 2, wordWrap: {'width': 105}},
			'rating_id': ['day', 'week', 'all'],
			'containers': [],
			'handlers': [],
			'coords': [	{'x': 52, 'y': 181}, 
						{'x': 123, 'y': 181}, 
						{'x': 194, 'y': 181}]
		}

		// temp = new Phaser.GameObjects.Image(this.scene, 123, 181, "common1", "rating_buttons_panel" + suffix);
		// this.add(temp);
		// for (i = 0; i < 3; i ++) {
		// 	var info = this.buttons_info;
		// 	var cont = info['containers'][i];
		// 	this.add(cont);
		// 	cont.x = info['coords'][i]['x'];
		// 	cont.y = info['coords'][i]['y'];
		// 	cont.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "but_rating_out" + suffix);
		// 	cont.add(cont.bg);
		// 	cont.bg_over = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "but_rating_over" + suffix);
		// 	cont.add(cont.bg_over);
		// 	cont.bg_over.alpha = 0;
		// 	cont.selected = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "but_rating_down" + suffix);
		// 	cont.selected.visible = false;
		// 	cont.add(cont.selected);
		// 	cont.title = new Phaser.GameObjects.Text(this.scene, 0, 0, '', info['style']);
		// 	cont.title.setOrigin(0.5);
		// 	cont.add(cont.title);
		// 	cont.bg.setInteractive();
		// 	cont.bg.on('pointerdown', info['handlers'][i], this);
		// 	this.bind_rating_buttons(cont);
		// }

		this.button_findme = new CustomButton(this.scene, this.attr['w'] / 2 + 1, 572, this.handler_findme, 'common1', 'where_out' + suffix, 'where_over' + suffix, 'where_down' + suffix, this);
		this.button_findme.y += this.button_findme.height / 2;
		this.add(this.button_findme);

		this.button_findme_title = new Phaser.GameObjects.Text(this.scene, 0, 0, '', { fontFamily: 'font1', fontSize: 20, color: '#FFFFFF', stroke: '#4F2811', strokeThickness: 3});
		this.button_findme_title.setOrigin(0.5);
		this.button_findme.add(this.button_findme_title);
		
		
		// this.friends_check_box = new Phaser.GameObjects.Container(this.scene, this.attr['w'] / 2 + 3, this.attr['holderY'] - 20);
		// this.add(this.friends_check_box);
		// this.button_friends = new CustomButton(this.scene, 0, 0, this.handler_friends, 'common1', 'among_friends_button1' + suffix, 'among_friends_button2' + suffix, 'among_friends_button3' + suffix, this);
		// this.friends_check_box.add(this.button_friends);
		// var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_friends', 'phrase_id': '1', 'values': [], 'base_size': 20});
		// this.friends_txt = new Phaser.GameObjects.Text(this.scene, -15, 2, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3});	
		// this.friends_txt.setOrigin(0.5)	
		// this.friends_check_box.add(this.friends_txt);
		
		// this.friends_check_bg = new Phaser.GameObjects.Image(this.scene, 89, 0, 'common1', 'friends_off');
		// this.friends_check_box.add(this.friends_check_bg);
		// this.friends_check = new Phaser.GameObjects.Image(this.scene, 89, 0, 'common1', 'friends_on');
		// this.friends_check_box.add(this.friends_check);
		// this.friends_check.visible = false;

		this.button_detail = new CustomButton(this.scene, this.attr['w'] / 2 + 3, this.attr['holderY'] - 20, this.handler_detail, 'common1', 'among_friends_button1', 'among_friends_button2', 'among_friends_button3', this);
		this.add(this.button_detail);
		var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_details', 'phrase_id': '1', 'values': [], 'base_size': 20});
		this.detail_txt = new Phaser.GameObjects.Text(this.scene, 0, 2, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3});	
		this.detail_txt.setOrigin(0.5)	
		this.button_detail.add(this.detail_txt);

		this.is_rating_friends = false;
		// this.friends_check.visible = this.is_rating_friends;	

		var scroll_bar = new Phaser.GameObjects.Container(this.scene, this.attr['w'] - 12, this.attr['holderY']);
		this.add(scroll_bar);
		
		var scroll_line = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'scroll_bg_rating' + suffix);
		scroll_line.setOrigin(0.5,0);
		scroll_line.setScale(1, this.attr['holderH'] / scroll_line.height);
		scroll_bar.add(scroll_line);
		
		this.scroll_button = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'scroller_rating' + suffix);
		this.scroll_button.setOrigin(0.5,0);
		scroll_bar.add(this.scroll_button);                    
		var rect = new Phaser.Geom.Rectangle(-this.scroll_button.width * 1.5 , -this.scroll_button.height *0.3, this.scroll_button.width*3.8, this.scroll_button.height* 1.5);
		this.scroll_button.setInteractive({ 
			hitArea: rect,
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		});		
		this.scroll_max_y = parseInt(this.attr['holderH'] - this.scroll_button.height * 1);	
		this.scroll_button.on('drag', function(pointer, dragX, dragY){	
			if (!_this.block_buttons) {
				var pos_y;
				
				if (dragY > _this.scroll_max_y)
					pos_y = _this.scroll_max_y;
				else if (dragY < 0)
					pos_y = 0;
				else {
					pos_y = dragY;
				}
					
				_this.scroll_button.y = pos_y;
				_this.scroll_percentage = pos_y / _this.scroll_max_y * 100;
				_this.scroll_rating(false, _this.dummy_function);
			}
		});
		this.scroll_button.on('dragstart', function(){ 
			_this.timer_photos_load.paused = false;			
		});
		this.scroll_button.on('dragend', function(){ 
			_this.timer_photos_load.paused = true;
			_this.display_unloaded_photos();
		});		
		
					  
		drag_dispatcher.setInteractive(new Phaser.Geom.Rectangle(this.attr['holderX'] - 5, 0, this.attr['holderW'], this.attr['holderH']), Phaser.Geom.Rectangle.Contains);
		drag_dispatcher.input.draggable = true;
		drag_dispatcher.on('drag', function(pointer, dragX, dragY){	
			// var rating_kind = (_this.is_rating_friends) ? 'friends' : 'general';
			// var rating_id = _this.active_rating;
			// var rating_items = _this.rating_items_all[rating_kind][rating_id];			
			// if (!_this.block_buttons && rating_items) {
			// 	var dy = pointer['position'].y - pointer['prevPosition'].y;				
				
						
			// 	var rating_size = (_this.attr['itemH'] * rating_items.length + _this.spacing * (rating_items.length - 1)) //* _this.scale;		
			// 	var rating_max_shift = rating_size > _this.attr['holderH'] ? rating_size - _this.attr['holderH'] : 0;				
			// 	rating_max_shift = rating_max_shift * _this.scale;					
			// 	var pos_y = _this.rating_holder.y + dy;
			// 	if (pos_y > _this.attr['ratingY'])
			// 		pos_y = _this.attr['ratingY'];
			// 	else if (pos_y < _this.attr['ratingY'] - rating_max_shift)
			// 		pos_y = _this.attr['ratingY'] - rating_max_shift;
															
			// 	_this.rating_holder.y  = pos_y;						
			// 	_this.scroll_percentage = (rating_max_shift == 0) ? 0 :(_this.attr['ratingY'] - _this.rating_holder.y) / rating_max_shift * 100;		
			// 	_this.scroll_button.y = _this.scroll_percentage * _this.scroll_max_y / 100;	
			// 	_this.check_avail();
			// }
			var rating_items = _this.items;
			if (!_this.block_buttons && rating_items) {
				var dy = pointer['position'].y - pointer['prevPosition'].y;				
						
				var rating_size = (_this.attr['itemH'] * rating_items.length + _this.spacing * (rating_items.length - 1)) 	
				var rating_max_shift = rating_size > _this.attr['holderH'] ? rating_size - _this.attr['holderH'] : 0;				
				rating_max_shift = rating_max_shift * _this.scale;					
				var pos_y = _this.rating_holder.y + dy;
				if (pos_y > _this.attr['ratingY'])
					pos_y = _this.attr['ratingY'];
				else if (pos_y < _this.attr['ratingY'] - rating_max_shift)
					pos_y = _this.attr['ratingY'] - rating_max_shift;
															
				_this.rating_holder.y  = pos_y;						
				_this.scroll_percentage = (rating_max_shift == 0) ? 0 :(_this.attr['ratingY'] - _this.rating_holder.y) / rating_max_shift * 100;		
				_this.scroll_button.y = _this.scroll_percentage * _this.scroll_max_y / 100;	
				// _this.check_avail();
			}
		});

		drag_dispatcher.on('dragstart', function(){ 
			_this.timer_photos_load.paused = false;			
		});
		
		drag_dispatcher.on('dragend', function(){ 
			_this.timer_photos_load.paused = true;
			_this.display_unloaded_photos();
		});		
		
		this.moving_holder = game_data['moving_holder'];
		//this.moving_holder = new Phaser.GameObjects.Container(this.scene);
		//this.add(this.moving_holder);

		this.error_holder = new Phaser.GameObjects.Container(this.scene, this.attr['w'] / 2, this.attr['holderY'] + this.attr['holderH'] / 2);
		this.add(this.error_holder);
		this.error_panel = new Phaser.GameObjects.Text(this.scene, 0, 0,  '', { fontFamily: 'font1', fontSize: 25, color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3, wordWrap:{width: 220}});	
		this.error_panel.setOrigin(0.5);
								
		this.waiting_holder = new Phaser.GameObjects.Container(this.scene, this.attr['w'] / 2, this.attr['holderY'] + this.attr['holderH'] / 2);
		this.add(this.waiting_holder);
		this.add_spinner();
				
		this.spacing = 3;
		this.visible_items = (this.attr['holderH'] / (this.attr['itemH'] + this.spacing));
		//this.spacing = (this.attr['holderH'] - this.attr['itemH'] * this.visible_items) / (this.visible_items - 1);
		
		this.scroll_percentage = 0;		
				
		this.block_buttons = false;		
		this.rating_items_all = {'friends': {}, 'general': {}};
		this.current_rating = 'none';	
		this.active_rating = 'week';
		
		// this.stand = new Stand();
		// this.stand.x = this.attr['w'] / 2;
		// this.stand.y = -36;
		// this.stand.init();
		// this.add(this.stand);
		this.init_timers();
		this.update_language();
		// if (is_localhost) {
		// 	this.display_rating(this.active_rating);
		// 	_this.update_scroll_percentage();
		// 	_this.display_unloaded_photos();
		// }
		// else if (navigator.onLine) {
		// 	var timeout = 100;
		// 	if (loading_vars['net_id'] == 'ig') timeout = 2000;
		// 	setTimeout(() => {
		// 		game_data['utils'].update_user_rating(function() {
		// 			if (navigator.onLine) _this.display_rating(_this.active_rating);
		// 			_this.update_scroll_percentage();
		// 			_this.display_unloaded_photos();
		// 		});
		// 	}, timeout);
		// }
		this.init_stand();
		if (is_localhost && 0) {
			this.display_rating(this.active_rating);
			_this.update_scroll_percentage();
			_this.display_unloaded_photos();
		}
		else if (navigator.onLine) {
			var timeout = 100;
			if (loading_vars['net_id'] == 'ig') timeout = 2000;
			setTimeout(() => {
				if (game_data['user_data']['rating'] && game_data['user_data']['rating'].length) this.first_rating_show();
				else game_request.request({'get_rating': true}, function(res) {
					game_data['user_data']['rating'] = res['rating'];
					_this.first_rating_show();
					
				});
			}, timeout);
		}
		
	},

	first_rating_show() {
		var _this = this;
		this.show_loading();
		this.block_buttons = true;
		var waiting_loading = true;
		this.scene.time.delayedCall(5000, function(){
			if (waiting_loading) {
				_this.block_buttons = false;
				_this.hide_loading();	
				_this.error_holder.add(_this.error_panel);
			}
		}, [], this);
		this.display_endings();
		game_data['utils'].get_map_rating(function(rating){
			waiting_loading = false;
			setTimeout(() => {
				_this.current_rating = rating;
				_this.error_holder.removeAll();
				_this.hide_loading();
				_this.block_buttons = false;
				for (var i = 0; i < rating.length; i++) _this.create_rating_item(rating[i], i * 50 + 100);				

				_this.sort_rating_items();
				_this.arrange_rating_items();
				_this.find_user(false);		
				_this.show_rating();
				setTimeout(() => {
					_this.update_stand();	
				}, 150);
				setTimeout(() => {_this.display_unloaded_photos();}, 1000);
				_this.items_created = true;
				//_this.test_rating();
			}, 500);
			
		});
		
	},

	init_stand() {
		this.stand = new Phaser.GameObjects.Container(this.scene, 3 + this.attr['w'] / 2, -50);
		this.add(this.stand);
		this.stand_info = { 'coords': [{'x': 0, 'y': 65, 'y2': 32}, {'x': -80, 'y': 72, 'y2': 30}, {'x': 80, 'y': 72, 'y2': 30}], 'items': []};

		for (var i = 0; i < 3; i++) {
			var pos = this.stand_info['coords'][i];
			var item = new Phaser.GameObjects.Container(this.scene, pos.x, pos.y);		
			this.stand.add(item);
			var bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "competitor_bg");
			bg.setScale(( i == 0 ? 68 : 62) /bg.width);
			item.add(bg);
			item.photo_cont = new Phaser.GameObjects.Container(this.scene, 0, 1);
			item.add(item.photo_cont);
			item.photo_size = ( i == 0 ? 68 : 50)
			bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "stand_place" + String(i+1));
			item.add(bg);

			bg = new Phaser.GameObjects.Image(this.scene, 0, pos['y2'], "common1", "stand_place_add" + String(i+1));
			item.add(bg);

			item.name_txt = new Phaser.GameObjects.Text(this.scene, 0, (i == 0 ? -44 : -36),  '', { fontFamily: 'font1', fontSize: 13, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
			item.name_txt.setOrigin(0.5);
			item.add(item.name_txt);

			item.photo = null;
			this.stand_info['items'].push(item);
		}
	},

	update_stand() {
		var rating = game_data['user_data']['rating'];
		rating.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
		var items = this.stand_info['items'];
		if (rating && rating.length >= items.length)
			for (var i = 0; i < items.length; i++) {
				if (items[i].user_id != rating[i].user_id) {
					if (items[i].photo) items[i].photo.destroy();
					items[i].name_txt.text = '';
					var user_id = rating[i]['user_id'];
					items[i].user_id = user_id;
					var first_name = '';
					if (user_id in game_data['users_info'] && 'first_name' in game_data['users_info'][user_id]) 
						first_name = game_data['users_info'][user_id]['first_name'];
					items[i].name_txt.text = first_name.substring(0, 11);
					this.load_photo(items[i], user_id, 1000);
				}
			}
	},

	user_score_updated() {
		var _this = this;
		game_data['utils'].get_map_rating(function(rating) {
			_this.merge_rating(rating)
			_this.update_rating(_this.current_rating);
			setTimeout(() => {
				_this.update_stand();	
			}, 150);
			
		});
	},

	merge_rating(rating) {
		var i,j;
		var ids = [];
		var new_rating = [];
		var user_place = 0;
		for (i = 0; i < this.current_rating.length; i++) {
			var user_id = this.current_rating[i]['user_id'];
			if (ids.indexOf(user_id) < 0) ids.push(user_id);
		}
		for (i = 0; i < rating.length; i++) {
			var user_id = rating[i]['user_id'];
			if (ids.indexOf(user_id) < 0) ids.push(user_id);
			if (user_id == loading_vars['user_id']) user_place = rating[i]['place']
		}
		var current = game_data['user_data']['rating'];
		for (i = 0; i < current.length; i++) {
			var user_id = current[i]['user_id'];
			if (ids.indexOf(user_id) >= 0) {
				new_rating.push(Object.assign({}, current[i]));
			}
		}

		new_rating.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
		
		var splice_pos = 0;
		var prev_place = -1;
		for (i = 0; i < new_rating.length; i++) {
			var place = new_rating[i]['place'];
			if (place == user_place) prev_place = place;
			else if (place > user_place) {
				if (place - prev_place > 1) {
					splice_pos = i;
					break;
				}
				else prev_place = place;
			}
		}
		if (splice_pos > 0) new_rating.splice(splice_pos, new_rating.length - splice_pos)
		this.current_rating = new_rating;
		//console.log('mmm',user_place,splice_pos,ids )
		//console.log('mmm1',rating )
		//console.log('mmm2',new_rating )
	},

	load_photo(item, user_id, timeout = 0) {
		setTimeout(() => {
			game_data['utils'].load_user_photo(user_id, function(res){
				if (item && res['success'] && res['photo']) {
					if (res['first_name'] && game_data['users_info'][user_id] && game_data['users_info'][user_id]['first_name']) item.name_txt.text = game_data['users_info'][user_id]['first_name'].substring(0, 11);
					item.photo = res['photo'];
					var scale = item.photo_size / item.photo.width;
					item.photo.setScale(scale);
					item.photo_cont.add(item.photo);
				}
			});		
		}, timeout);
							
	},

	hide() {
		this.rating_holder.visible = false;
	},

	show() {
		this.rating_holder.visible = true;
	},
	
	display_rating(rating_id) {
		var _this = this;
		this.active_rating = rating_id;	
		var rating_kind = (this.is_rating_friends) ? 'friends' : 'general';
		this.display_endings();
		if (!(rating_id in this.rating_items_all[rating_kind] && this.rating_items_all[rating_kind][rating_id].length > 0)) {
			this.show_loading();
			this.block_buttons = true;
			var waiting_loading = true;
			game_data['utils'].delayed_call(5000, () => {
				if (waiting_loading) {
					this.block_buttons = false;
					this.hide_loading();	
					this.error_holder.add(_this.error_panel);
				}
			})
			game_data['utils'].load_rating(rating_id, this.is_rating_friends, function(rating){
				waiting_loading = false;
				_this.error_holder.removeAll();
				_this.hide_loading();
				_this.block_buttons = false;
				for (var i = 0; i < rating.length; i++)
					_this.create_rating_item(rating[i], rating_id);				
				
								
				if (_this.active_rating == rating_id) {
					_this.sort_rating_items(rating_id);
					_this.arrange_rating_items(rating_id);
					_this.find_user(false);	
					_this.display_unloaded_photos();				
					_this.show_rating(_this.dummy_function);
				}
				// _this.stand.display_stand(rating_id, _this.get_all_top3(rating_id));
			});
		}
		else {
			this.arrange_rating_items(rating_id);
			this.find_user(false);
			this.display_unloaded_photos();				
			this.show_rating(this.dummy_function);	
			// this.stand.display_stand(rating_id, this.get_all_top3(rating_id));					
		}
	},

	get_all_top3(rating_id) {
		if (rating_id == 'all' && this.all_top3 && this.all_top3.length == 3) return this.all_top3;
		else return null;
	},
	
	show_rating(on_complete = null) {
		var _this = this;
		var rating_items = this.items;
		var rating_item;
		var i;
		var start = this.get_visible_ind_start();
		var delay = 0;
		var delta_delay = 50;		
		
		this.block_buttons = true;
		for (i = 0; i < rating_items.length; i++) {			
			rating_item = rating_items[i];
			if (i >= start && i < start + this.visible_items + 2) {							
				rating_item.x = -(20 + this.attr['itemW'] * this.scale);	
				this.scene.time.delayedCall(delay, this.move_item, [rating_item, 0], this);
				delay += delta_delay;
			}
			else
				rating_item.x = 0;
		}
	//	game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'rating_change'});
		this.scene.time.delayedCall(delay, function(){
			_this.block_buttons = false;
			if (on_complete) on_complete();
		}, [], this);
		
	},

	hide_rating(on_complete, is_friends) {
		var _this = this;
		var rating_id = this.active_rating;
		var rating_kind;
		if (is_friends)
			rating_kind = (!this.is_rating_friends) ? 'friends' : 'general';
		else
			rating_kind = (this.is_rating_friends) ? 'friends' : 'general';
		
		var rating_items = (rating_id in this.rating_items_all[rating_kind]) ? this.rating_items_all[rating_kind][rating_id] : [];
		var rating_item;
		var i;
		var start = this.get_visible_ind_start();
		var delay = 0;
		var delta_delay = 50;		
		
		this.block_buttons = true;
		
		this.error_holder.removeAll();		
		for (i = 0; i < rating_items.length; i++) {			
			rating_item = rating_items[i];
			if (i >= start && i < start + this.visible_items + 1) {				
				this.scene.time.delayedCall(delay, this.move_item, [rating_item, -(20 + this.attr['itemW'] * this.scale)], this);
				delay += delta_delay;
			}
			else
				rating_item.x = -(20 + this.attr['itemW'] * this.scale);
		}		
	
		game_data['utils'].delayed_call(delay + 200, () => {
			this.block_buttons = false;
			on_complete();
		})
	},



	move_item(rating_item, pos_x) {
		this.scene.tweens.add({
			targets: rating_item,            
			x: pos_x,
			duration: 200,                        
			onComplete: function () {   
									
			}            
		});					
	},
	
	update_rating(rating) {	
		var i;
		var j;
		var item;
		var flag;
		var rating_item;
		var do_user_escalate = false;

		var rating_items = this.items;
		
		for (i = 0; i < rating_items.length; i++) rating_items[i].set_dead();
		
		for (i = 0; i < rating.length; i++) {
			item = rating[i];
			if (item['user_id'] == loading_vars['user_id']) {				
				this.remove_twin_item(rating_items, item['place']);				
				rating_item = this.get_rating_user_item();		
				
				if (rating_item) {
					rating_item.update_item_without_place(item);
					do_user_escalate = true;
				}
				else
					this.create_rating_item(item);														
			}
			else {
				flag = true;
				for (j = 0; j < rating_items.length; j++) {
					if (rating_items[j].get_place() == item['place'] && rating_items[j].get_user_id() != loading_vars['user_id']) {
						//console.log('upd item', JSON.stringify(item), JSON.stringify(rating_items[j].info))
						rating_items[j].update_item(item);
						flag = false;
						break;
					}
				}
				if (flag) {
					this.create_rating_item(item);
					//console.log('create item', JSON.stringify(item))
				}
					
			}
		}
		this.error_holder.removeAll();
		this.remove_dead_items();
		this.sort_rating_items();
		this.arrange_rating_items();
		this.find_user(false);
		

		
		if (do_user_escalate) {	
			this.escalate_user();
		}
		else if (game_data['delayed_event']) {
			this.emitter.emit('EVENT', game_data['delayed_event']);	
			game_data['delayed_event'] = null
		}
	},
	

	scroll_rating(is_smooth, on_complete, is_quick = false) {
		var _this = this;
		var rating_id = this.active_rating;
		var rating_items = this.items;
		var rating_size = (this.attr['itemH'] * rating_items.length + this.spacing * (rating_items.length - 1)) //* this.scale;		
		var rating_max_shift = rating_size > this.attr['holderH'] ? rating_size - this.attr['holderH'] : 0;	
		rating_max_shift = rating_max_shift * this.scale;			
		var _dur = is_quick ? 200 : 1000;
		if (is_smooth) {
			this.block_buttons = true;
			this.timer_photos_load.paused = false;
			var delta = this.rating_holder.y - (this.attr['ratingY']- rating_max_shift * this.scroll_percentage / 100)
			if (Math.abs(delta) > 1) this.scene.tweens.add({
				targets: this.rating_holder,            
				y: this.attr['ratingY']- rating_max_shift * this.scroll_percentage / 100,            
				duration: _dur,                        
				onComplete: function () { 
					_this.block_buttons = false;
					_this.timer_photos_load.paused = true;	
					_this.check_avail();				
					on_complete();					
				}            
			});	
			else {
				_this.block_buttons = false;
				_this.timer_photos_load.paused = true;	
				_this.check_avail();				
				on_complete();	
			}			
		}
		else {
			this.rating_holder.y = this.attr['ratingY'] - rating_max_shift * this.scroll_percentage / 100;	
			_this.check_avail();		
			on_complete();
		}		
	},

	handler_detail() {
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'rating_info', 'immediate': true});
	},

	switch_rating(rating_id, is_friends) {
		if (this.active_rating != rating_id || is_friends) {
			var _this = this;		
			this.hide_rating(function(){
				_this.rating_holder.removeAll();
				_this.display_rating(rating_id);			
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'rating_show'});	
			}, is_friends);			
			game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'rating_hide'});
		}		
	},	
	
	shift_rating_items(old_pos, new_pos, on_complete) {
		var rating_id = this.active_rating;
		var rating_items = this.items;
		
		var delay = 1000;
		var arr = [];
		var rating_item;		
		var sign = (old_pos > new_pos ? -1 : 1);		
		var dy = (this.spacing + this.attr['itemH']) * this.scale;				
		var i = old_pos;

		this.block_buttons = true;
		while (i != new_pos) {						
			rating_item = rating_items[i];			
			if (rating_item) this.scene.tweens.add({
				targets: rating_item,            
				y: rating_item.y - dy * sign,            
				duration: delay,                        
				onComplete: function () {   
				}
			});
			i += sign;
		}		

		game_data['utils'].delayed_call(delay, () => {
			this.block_buttons = false;
			on_complete();
		})
		
	},
		
	insert_rating_item(rating_item, new_pos, on_complete) {				
		var _this = this;
		var pt = game_data['utils'].toLocal(this.rating_holder, game_data['utils'].toGlobal(this.moving_holder, new Phaser.Geom.Point(rating_item.x, rating_item.y)));
		rating_item.x = pt.x;
		rating_item.y = pt.y;
		this.rating_holder.add(rating_item);
		
		var pos_y = (this.attr['itemH'] + this.spacing) * new_pos * this.scale;
		
		this.block_buttons = true;
		this.scene.tweens.add({
			targets: rating_item,            
			y: pos_y,
			x: 0,
			scaleX: 1,
			scaleY: 1,
			duration: 1000,                        
			onComplete: function () {   
				_this.block_buttons = false;
				on_complete();
			}
		});
	},

	shift_user_item() {
		var ind = this.get_user_item_ind();
		var rating_item = this.rating_items[ind];
		var pt = game_data['utils'].toLocal(this.moving_holder, game_data['utils'].toGlobal(this.rating_holder, new Phaser.Geom.Point(rating_item.x, rating_item.y)));
				
		rating_item.x = pt.x;
		rating_item.y = pt.y;
		this.moving_holder.add(rating_item);
	},


	handler_findme() {
		if (!this.block_buttons)
			this.find_user(true);
	},
	
	find_user(is_smooth, is_quick = false) {
		var _this = this;
		
		this.update_scroll_percentage();				
		this.scroll_rating(is_smooth, function() {
			var rating_items = _this.items;
			if (is_smooth && rating_items) for (var i = 0; i < rating_items.length; i++) {
				if (rating_items[i].is_player) {
					rating_items[i].anim_find_me();
					break;
				}
			}
		}, is_quick);
		this.move_scroll_button(is_smooth, is_quick);		
	},
	
	update_scroll_percentage() {
		var rating_items = this.items;
		
		var ind = this.get_user_item_ind();
		var percentage;
		
		if ((ind + 1) < this.visible_items / 2)
			percentage = 0;
		else if ((ind + 1) > rating_items.length - this.visible_items / 2)
			percentage = 100;
		else
			percentage = (ind + 1 - this.visible_items / 2) / (rating_items.length - this.visible_items) * 100;
		this.scroll_percentage = percentage;		
	},
	
	
	get_user_item_ind() {			
		var ind = -1;
		var rating_items = this.items;
		
		if (rating_items) {
			for (var i = 0; i < rating_items.length; i++)
				if (rating_items[i].get_user_id() == loading_vars['user_id']) {
					ind = i;
					break;
				}
		}	
		return ind;
	},
		
	move_scroll_button(is_smooth, is_quick = false) {
		
		if (is_smooth) {
			var _dur = is_quick ? 200 : 1000;
		   	this.scene.tweens.add({
				targets: this.scroll_button,            
				y: this.scroll_percentage * this.scroll_max_y / 100,            
				duration: _dur,                        
				onComplete: function () {   
				}            
			});
		}
		else {
			//this.scroll_button.y = this.scroll_percentage / 100 * this.attr['holderH'];		
			this.scroll_button.y = this.scroll_percentage * this.scroll_max_y / 100
		}
	},
	
	create_rating_item(info, timeout = 0) {	
		var rating_items = this.items;
		var rating_item;
		rating_item = new RatingItem();
		rating_item.init();
		rating_item.update_item(info, true, true, timeout);			
		rating_items.push(rating_item);		
	},
	
	arrange_rating_items() {
		var rating_items = this.items;
		if (rating_items) for (var i = 0; i < rating_items.length; i++) {
			rating_items[i].x = 0;
			rating_items[i].y = (this.attr['itemH'] + this.spacing) * this.scale * i;
			this.rating_holder.add(rating_items[i]);
		}
	},

	check_avail() {
		var rating_kind = (this.is_rating_friends) ? 'friends' : 'general';				
		var rating_items = this.rating_items_all[rating_kind][this.active_rating];
		if (rating_items) for (var i = 0; i < rating_items.length; i++) {
			var pos = this.rating_holder.y + rating_items[i].y
			var avail = pos >= this.attr['ratingY'] -this.attr['itemH'] * 0.2  && pos <= this.attr['ratingY'] + this.attr['holderH'] - this.attr['itemH'] * 0.8;
			rating_items[i].available(avail);
			//console.log(avail,this.attr['ratingY'],this.rating_holder.y, rating_items[i].y)
		}
	},

	get_rating_user_item() {
		var rating_items = this.items;
		for (var i = 0; i < rating_items.length; i++) {
			if (rating_items[i].get_user_id() == loading_vars['user_id']) {
				return rating_items[i];
			}			
		}
		return null;
	},
	
	sort_rating_items() {
		var rating_item = this.get_rating_user_item();
		if (rating_item) {
			var current_place = rating_item.get_place();
			var mod = this.last_user_place && this.last_user_place < current_place ? -1 : 1;
			var rating_items = this.items;
			if (rating_items) rating_items.sort(
				(a,b) => (a.get_place() < b.get_place()) ? -1 : 
				(
					(b.get_place() < a.get_place()) ? 1 : 
					(a.get_user_id() == loading_vars['user_id'] ? 1 * mod : (b.get_user_id() == loading_vars['user_id'] ? -1 * mod : 0))
				)
			);
		}
	},
	
	display_unloaded_photos() {			
		var rating_items = this.items;
		var start = parseInt(this.get_visible_ind_start());
		for (var i = start; i < rating_items.length && i < this.visible_items + start + 2; i++) {
			if (rating_items[i]) {
				rating_items[i].load_photo();
			}	
		}
	},		
	
	get_visible_ind_start() {
		var rating_items = this.items;	
		
		var start;
		var rest = rating_items.length > this.visible_items ? rating_items.length - this.visible_items - 1: 0;				
		
		if (this.scroll_percentage == 100)
			start = rest;
		else
			start = Math.ceil(this.scroll_percentage * rest / 100);
		return start;
	},
	
	escalate_user() {		
		var _this = this;		
		var rating_item = this.get_rating_user_item();
		var old_pos = this.get_user_item_ind();
			
		rating_item.update_correct_place();
		this.sort_rating_items(this.active_rating);
		var new_pos = this.get_user_item_ind();		
		this.update_scroll_percentage();	
	
		if (old_pos != new_pos) {
			
			var pt = game_data['utils'].toLocal(this.moving_holder, game_data['utils'].toGlobal(this.rating_holder, new Phaser.Geom.Point(rating_item.x, rating_item.y)));				
			rating_item.x = pt.x;
			rating_item.y = pt.y;
			this.escalating_item = rating_item;
			if (this.rating_holder.visible && this.rating_holder.alpha == 1) this.moving_holder.add(rating_item);
			
			var scale = 1.1;
			this.timer_photos_load.paused = false;
			this.block_buttons = true;
			this.scene.tweens.add({
				targets: rating_item,            
				x: rating_item.x + (1 - scale) * this.attr['itemW'] / 2 * this.scale,            
				y: rating_item.y + (1 - scale) * this.attr['itemH'] / 2 * this.scale,  
				scaleX: scale,
				scaleY: scale,
				duration: 500,                        
				onComplete: function () {
					_this.block_buttons = false;
					_this.scroll_rating(true, function(){						
						_this.shift_rating_items(old_pos, new_pos, function(){
							_this.insert_rating_item(rating_item, new_pos, function(){
								rating_item.visible = true;
								_this.escalating_item = null;								
								_this.remove_dead_items();		
								if (game_data['delayed_event']) {
									_this.emitter.emit('EVENT', game_data['delayed_event']);	
									game_data['delayed_event'] = null
								}
							});						
							_this.timer_photos_load.paused = true;
							_this.display_unloaded_photos();
							rating_item.display_place();						
						});				
					});					
					_this.move_scroll_button();																
				}
			});
		}
		else {
			rating_item.display_place();
			this.remove_dead_items();
			this.display_unloaded_photos();
		}
	},

	check_hide_escalating() {
		if (this.escalating_item != null) {
			this.escalating_item.visible = false;
		}
	},
		
	show_loading() {
		this.waiting_circle.visible = true;
		//this.waiting_holder.add(this.waiting_circle);
	},

	hide_loading() {
		this.waiting_circle.visible = false;
		//this.waiting_holder.removeAll();
	},

	remove_dead_items() {
		var rating_items = this.items;
		var flag = true;		
		var rating_item;
		if (rating_items) {
			for (var i = rating_items.length - 1; i >=0; i--) {
				if (rating_items[i].get_dead()) {
					rating_item = rating_items[i];
					rating_item.destroy();
					rating_items.splice(i, 1);
				}				
			}
		}
		this.sort_rating_items();
		this.arrange_rating_items();
		this.find_user(false);
		this.display_unloaded_photos();				
	},
	
	remove_twin_item(rating_items, place) {
		var rating_item;
		for (var i = 0; i < rating_items.length; i++) {
			if (rating_items[i].get_place() == place && rating_items[i].get_user_id() != loading_vars['user_id']) {
				rating_item = rating_items[i];
				rating_items.splice(i, 1);
				rating_item.destroy();		
				break;						
			}
		}			
	},
	
	delete_not_relevant_ratings() {
		var rating_kind = (this.is_rating_friends) ? 'friends' : 'general';
		var rating_id = this.active_rating;
		var rating_items;
		var rating_item;
		
		for (var key in this.rating_items_all[rating_kind]) {
			if (key != rating_id) {
				rating_items = this.rating_items_all[rating_kind][key];
				while(rating_items.length) {
					rating_item = rating_items.pop();
					rating_item.destroy();
				}
			}
		}		
	},
	
	handler_friends() {
		if (!this.block_buttons) {
			this.is_rating_friends = !this.is_rating_friends;
			this.friends_check.visible = this.is_rating_friends;
			this.switch_rating(this.active_rating, true);
		}
	},
	
	get_current_rating() {
		return {'type': this.active_rating, 'is_friends': this.is_rating_friends};
	},

	get_player_pt() {
		var rating_items = this.items;
		var i;
		if (rating_items) {
			for (i = 0; i < rating_items.length; i++) {
				if (rating_items[i].is_player) {
					var pt = game_data['utils'].toGlobal(rating_items[i].score_ico, new Phaser.Geom.Point(0,0));
					return pt;
				}
			}
		}
		else return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,0));
	},

	bind_rating_buttons(cont) {
		cont.bg.on('pointerover', ()=> cont.bg_over.alpha = 1, this);
		cont.bg.on('pointerout', ()=> cont.bg_over.alpha = 0.01, this);
	},

	update_language() {
		var res;
		res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_header', 'phrase_id': '1', 'values': [], 'base_size': 24});	
		this.title_txt.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
		this.title_txt.text = res['text'];

		res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_where', 'phrase_id': '1', 'values': [], 'base_size': 20});	
		this.button_findme_title.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3});
		this.button_findme_title.text = res['text'];

		// res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_friends', 'phrase_id': '1', 'values': [], 'base_size': 20});
		// this.friends_txt.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3});	
		// this.friends_txt.text = res['text'];

		res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'no_rating', 'phrase_id': '1', 'values': [], 'base_size': 25});
		this.error_panel.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#7F5841', strokeThickness: 3, align: 'center', wordWrap:{width: 220}});	
		this.error_panel.text = res['text'];
		
		// var info = this.buttons_info;
		// for (i = 0; i < 3; i++) {
		// 	res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_rating_type', 'phrase_id': String(i+1), 'values': [], 'base_size': 20});
		// 	var cont = info['containers'][i];
		// 	cont.title.setStyle(info['style']);
		// 	cont.title.setFontSize(res['size']);
		// 	cont.title.text = res['text'];
		// }
		// this.stand.update_language();
		this.display_endings();
	},

	add_spinner() {
		this.waiting_circle = new Phaser.GameObjects.Image(this.scene, 0, 0, "common2", "lupa_mini");
		this.waiting_circle.setOrigin(0.4,0.4);
		this.waiting_holder.add(this.waiting_circle);
		this.timer_spinner = this.scene.time.addEvent({
			delay: 40,
			callback: this.handler_timer_spinner,
			callbackScope: this,
			loop: true
		});
		this.waiting_circle.visible = false;
		this.spinner_angle = 0;
	},

	handler_timer_spinner() {
		if (this.waiting_circle.visible) {
			var radius = 20;
			this.waiting_circle.x = radius * Math.cos(this.spinner_angle);
			this.waiting_circle.y = radius * Math.sin(this.spinner_angle);
			this.spinner_angle += 0.2;
		}
	},

	init_timers() {
		if (!('rating_end_time' in game_data)) game_data['rating_end_time'] = 0;
		if (!('day_end_time' in game_data)) game_data['day_end_time'] = 0;
		if (!('week_end_time' in game_data)) game_data['week_end_time'] = 0;
		this.timer_endings = this.scene.time.addEvent({
			delay: 1000,
			callback: this.handler_timer_endings,
			callbackScope: this,
			loop: true
		});

		var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_ending', 'phrase_id': '1', 'values': [], 'base_size': 15});
		this.ending_title = new Phaser.GameObjects.Text(this.scene, 0, 121, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});	
		this.ending_title.setOrigin(0, 0.5);
		this.add(this.ending_title);

		this.ending_week = new Phaser.GameObjects.Text(this.scene, 0, this.ending_title.y, '', { fontFamily: 'font1', fontSize: 16, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});	
		this.ending_week.setOrigin(0, 0.5);
		this.add(this.ending_week);
		this.ending_day = new Phaser.GameObjects.Text(this.scene, 0, this.ending_title.y, '', { fontFamily: 'font1', fontSize: 16, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});	
		this.ending_day.setOrigin(0, 0.5);
		this.add(this.ending_day);

		// this.ending_title.visible = false;
		// this.ending_week.visible = false;
		// this.ending_day.visible = false;
		
		
	},

	handler_timer_endings() {
// 		let current_timestamp = game_data['utils'].get_time()
// 		if ((current_timestamp - game_data['start_timestamp']) / 1000 >= game_data['day_end_time']) {
// // if ('day_end_time' in game_data && game_data['day_end_time'] > 0) {
// 			// game_data['day_end_time'] -= 1;
// 			// if (game_data['day_end_time'] == 0)  {
// 				var _this = this;
// 				game_data['utils'].check_day_related_data(function() {
// 					_this.rating_items_all = {'friends': {}, 'general': {}};
// 					_this.display_rating(_this.active_rating);
// 					_this.update_scroll_percentage();
// 					_this.display_unloaded_photos();
// 				});
// 		// 	}
// 		// }
// 		}
		
		// if ('week_end_time' in game_data && game_data['week_end_time'] > 0) game_data['week_end_time'] -= 1;
		this.display_endings();
	},

	display_endings() {
		var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_ending', 'phrase_id': '1', 'values': [], 'base_size': 15 });
		this.ending_title.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
		this.ending_title.text = res['text'];
		var d, h, m, s, w, shift;
		var d_str = '';
		// var d_time = parseInt(game_data['day_end_time']);
		let current_timestamp = game_data['utils'].get_time()
		// var d_time = parseInt(Math.round(game_data['day_end_time'] - ((current_timestamp - game_data['start_timestamp']) / 1000)));
		// h = parseInt(d_time / 3600);
		// d_time -= h * 3600;
		// m = parseInt(d_time / 60);
		// s = parseInt(d_time % 60);
		
		// d_str = (h > 0) ? String(h) + ':' : '';
		// d_str += ((m >= 10) ? '' : '0') + String(m) + ':';
		// d_str += ((s >= 10) ? '' : '0') + String(s);
		// this.end_days = d;
		// this.end_time = d_str;

		// this.ending_day.text = d_str;
		
		var d_week = parseInt(Math.round(game_data['rating_end_time'] - ((current_timestamp - game_data['start_timestamp']) / 1000)));
		d = parseInt(d_week / 86400);
		d = parseInt(d_week / 86400);
		var d_time = d_week % 86400;
		h = parseInt(d_time / 3600);
		d_time -= h * 3600;
		m = parseInt(d_time / 60);
		s = parseInt(d_time % 60);

		d_str = (h > 0) ? String(h) + ':' : '';
		d_str += ((m >= 10) ? '' : '0') + String(m) + ':';
		d_str += ((s >= 10) ? '' : '0') + String(s);
		this.end_days = d;
		this.end_time = d_str;
		if (d_week <= 0) d_str = '00:00'
		if (d > 0) {
			res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'week_end', 'phrase_id': '1', 'values': [d, d_str], 'base_size': 16});
			this.ending_week.setFontSize(res['size']);
			this.ending_week.text = res['text'];
		}
		else this.ending_week.text = d_str;

		if (this.ending_week.visible) {
			w = this.ending_title.width + this.ending_week.width + 3;
			shift = (this.attr['w'] - w) / 2;
			this.ending_title.x = shift;
			this.ending_week.x = this.ending_title.width + shift + 3;
		}
		
	},

	get_holes() {
		var pt = new Phaser.Geom.Point(this.bg.width / 2 - 15, this.bg.height / 2 - 75);
		pt = game_data['utils'].toGlobal(this, pt);
		return [{'type': 'rect', 'pt': pt, 'w': this.bg.width - 20, 'h':  this.bg.height - 20, 'arrow': true, 'arrow_orientation': 'left' }]
	},
	dummy_function(){}
});
