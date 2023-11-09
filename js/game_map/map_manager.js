class MapManager {
	constructor(scene){
		this.scene = game_data['scene'];
		this.emitter = new Phaser.Events.EventEmitter();
	}

	init(params) {		
		this.holder_scale = 1;
		this.display_w =  map_data['map_w'] * this.holder_scale;
		this.holder_x_min = 0;
		this.holder_x_max = this.display_w - loading_vars['W'];
		this.holder = params['map_holder'];
		this.holder.y = 1;
		this.holder.scale = this.holder_scale;
		this.need_remove_loading = true;
		this.moving_holder = params['moving_holder'];
		this.buttons_holder = params['buttons_holder'];
		
		this.tid_arrow = 0;
		this._holder_no_drag_x = this.holder.x;

		this.page = 0;
		this.page_changing = false;
		this.level_items = [];
			this.button_right = new CustomButton(this.scene, 355, 0, this.next_page, 'common1', 'but_page1', 'but_page2', 'but_page3', this);
			this.buttons_holder.add(this.button_right);
			this.button_left = new CustomButton(this.scene, -355, 0, this.prev_page, 'common1', 'but_page1', 'but_page2', 'but_page3', this);
			this.button_left.setScale(-1,1);
			this.button_left.dx = this.button_left.x;
			this.buttons_holder.add(this.button_left);
		this.tid_arrow = 0;
		this.page = 0;
		this.page_changing = false;
		
		setTimeout(() => {
			this.init_maps();
			if (params['load_first_bg']) {
				this.load_map_with_delay(0,10);
				this.load_map_with_delay(1,100);
			}

			this.level_items = [];
			this.level_items = this.get_level_items();
			var pos = Math.min(game_data['utils'].get_passed_amount(), this.level_items.length - 1)

			this.current_level = this.level_items[pos];
			
			this.init_user_avatar();
			var _this = this;

			var rect = new Phaser.Geom.Rectangle(0, 0, map_data['map_w'] * (map_data['maps'].length), map_data['map_h']);

			this.holder.setInteractive({ 
				hitArea: rect,
				hitAreaCallback: Phaser.Geom.Rectangle.Contains,
				draggable: true  
			});


			this.holder.on('pointerdown', function(pointer){ 
				if (_this.dragY_tween) _this.dragY_tween.stop();
				if (_this.dragX_tween) _this.dragX_tween.stop();
			});
			this.holder.on('drag', function(pointer, dragX, dragY){ 
				if (!game_data['game_tutorial'].active_tutorial) _this.set_holder_pos(dragX, dragY);
			});
			this.holder.on('dragstart', function(pointer, dragX, dragY){ 
				if (!game_data['game_tutorial'].active_tutorial) _this.map_dragstart();
			});
			this.holder.on('dragend', function(pointer, dragX, dragY){
				if (!game_data['game_tutorial'].active_tutorial) _this.map_dragend();
			});
			this.scene.input.on('pointerup', () => {
				if (!game_data['game_tutorial'].active_tutorial && game_data['map_dragging']) {
					_this.map_dragend();
				}
			});

			this.cloud_holder = new Phaser.GameObjects.Container(this.scene, loading_vars['extra_W'] / 2,0);
			this.holder.add(this.cloud_holder);
			//this.cloud_holder = this.holder
			setTimeout(() => {
				this.init_clouds();
			}, 50);

			this.inited = true;
			if (this.wait_update_user_data) {
				this.wait_update_user_data = false;
				this.update_user_data();
			}
			if (this.wait_update_map) {
				this.update_map(this.wait_update_map);
				this.wait_update_map = null;
			}
			this.show_arrow();
		}, 10);

		/*setTimeout(() => {
			game_data['user_data']['levels_passed'].push({'stars':3, 'score': 100});
			this.update_map({'first_complete': true})
		}, 5000);
		setTimeout(() => {
			game_data['user_data']['levels_passed'].push({'stars':3, 'score': 100});
			this.update_map({'first_complete': true})
		}, 10000);*/
	}

	init_maps() {
		var i = 0;
		this.map_loaded = [];
		this.active_clouds = [];
		var px = loading_vars['extra_W'] / 2;
		var temp;
		for (i = 0; i < map_data['maps'].length; i++) {
			temp = new Phaser.GameObjects.Container(this.scene, px, 0);
			this.map_loaded.push({'i': i, 'loaded': false, 'pending': false, 'container': temp});            
			this.holder.add(temp);
			px += map_data['map_w'];
			this.active_clouds.push(true)
		}
	}

	scroll_avatar(with_anim = true) {
		var _this = this;
		var lvl = this.current_level;
		var time = 500;
		
		this.check_create_levels_assets();
		if (lvl) {
			if (_this.scene && with_anim && _this.user_avatar.x && (_this.user_avatar.x != lvl.x || _this.user_avatar.y != lvl.y)) {
				if (lvl.level_id % map_data['levels_per_map'] == 0) {
					var pos = parseInt(game_data['utils'].get_passed_amount() / map_data['levels_per_map']);
					this.active_clouds[pos] = false;
					this.move_clouds(true);
					game_data['scene'].tweens.add({targets: _this.user_avatar, alpha: 0, duration: 200, onComplete: function(){
						_this.next_page();
						_this.user_avatar.x = lvl.x;
						_this.user_avatar.y = lvl.y;
						setTimeout(() => {
							game_data['scene'].tweens.add({targets: _this.user_avatar, alpha: 1, duration: 300});
						}, 700);
					}});
				}
				else game_data['scene'].tweens.add({targets: _this.user_avatar, x: lvl.x, y: lvl.y, duration: time, onComplete: function(){
						_this.check_map_prize();
				}});
			}
			else if (!with_anim && lvl) {
					this.user_avatar.x = lvl.x;
					this.user_avatar.y = lvl.y;
					setTimeout(() => {
						_this.check_map_prize();    
					}, 1000);
			}
		}
	}

	check_create_levels_assets() {
		var pos = Math.min(game_data['utils'].get_passed_amount(), this.level_items.length - 1);
		for (var i = pos; i < Math.min(pos +  map_data['show_map_levels'] + 1, this.level_items.length - 1); i++) this.level_items[i].check_create();
	}

	load_map_with_delay(no, delay) {
		var _this = this;
		var url = game_data['urls']['assets'] + 'maps/' + map_data['maps'][no];
		setTimeout(function() {
			var obj = _this.map_loaded[no];
			if (!(obj['pending'] || obj['loaded'])) {
				if (is_localhost || navigator.onLine) {
					obj['pending'] = true;
					var loader1 = new Phaser.Loader.LoaderPlugin(_this.scene);
					loader1.image(map_data['maps'][no], url);
					loader1.once('complete', function() {
						obj['pending'] = false;
						obj['loaded'] = true;
						var img = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, map_data['maps'][no]);
						console.log('loaded', map_data['maps'][no], no)
						img.setOrigin(0, 0);
						obj['container'].add(img);
						if (_this.need_remove_loading) {
							_this.need_remove_loading = false;
							game_data['utils'].remove_loading();
						}
						loader1.destroy();
					}, _this);
					loader1.start();
				}
			}
		},delay);
	}

	update_user_data() { 
		if (this.inited) {     
			var i;
			var pos = Math.min(game_data['utils'].get_passed_amount(), this.level_items.length - 1);
			if (pos < 0) pos = 0;
			if (pos < this.level_items.length) this.current_level = this.level_items[pos];
			this.page = parseInt(pos / map_data['levels_per_map']);
			for (i = 0; i <= this.page; i++) this.active_clouds[i] = false;
			this.move_page(false, null, true);
			for (i = 0; i < this.level_items.length; i++) 
				this.level_items[i].update_user_data();
			this.scroll_avatar(false);
			this.load_current_map();
		}
		else this.wait_update_user_data = true;
	}


	load_current_map() {
		var i = 0;
		var p = [this.page, this.page - 1, this.page + 1];
		
		var delay = 100;
		for (i = 0; i < p.length; i++) {
			if (p[i] >= 0 && p[i] < this.map_loaded.length && !this.map_loaded[p[i]]['loaded']) {
				this.load_map_with_delay(p[i], delay);
				delay += 1000;
			}
		}
	}

	check_load_map_full() {
		var i;
		var delay = 10;
		for (i = 0; i < this.map_loaded.length; i++) {
			if (!this.map_loaded[i]['loaded']) {
				this.load_map_with_delay(i, delay);
				delay += 10;
			}
		}
	}

	get_level_items() {
		var res = [];
		var i = 0;
		var level_item;	
		var limit = game_data['total_levels'];
		// var limit = game_data['levels'].length;
		var pos = map_data['levels'];
		

		for (i = 0; i < limit && i < pos.length; i++) {
			//if (i > 0 && i % pos.length == 0) shift_y += pos_cycle_y;










			// LEVEL_ITEM !!!!!!!!












			level_item = new LevelItem(this.scene);
			level_item.x = pos[i].x - map_data['pos_shift_x'] + loading_vars['extra_W'] / 2;  // pos[i % pos.length]['x'] - map_data['pos_shift_x'];
		level_item.y = pos[i].y; //pos[i % pos.length]['y'] + shift_y;
			level_item.init({'level_id':i});
			res.push(level_item);
			level_item.emitter.on('EVENT', this.handler_event, this);
		}
		for (i = res.length - 1; i >= 0; i--)
			this.holder.add(res[i]);
		return res;
	}

	update_map(obj) {
		if (this.inited) {
			var _this = this;
			var level_id = obj['level_id'] != null ? obj['level_id'] : game_data['utils'].get_passed_amount() - 1;
		var pos = Math.min(game_data['utils'].get_passed_amount(), this.level_items.length - 1)
			this.current_level = this.level_items[pos];
			if (obj && !obj['init']) this.level_items[level_id].update_item();
			if (level_id > 0) this.level_items[level_id-1].update_item(false);
			if (level_id+1 < this.level_items.length) this.level_items[level_id+1].update_item(false);
			if (obj && obj['first_complete']) this.check_appear_new_items(function(){
				_this.scroll_avatar();
				_this.load_current_map();
			});
			if (obj && 'new_chest_stars' in obj && obj['new_chest_stars'] > 0) this.fly_stars(obj['new_chest_stars'], this.level_items[level_id])
		}
		else this.wait_update_map = obj;
	}

	fly_stars(amount, level_item) {
		game_data['game_map'].update_star_chest(0);
		var end_pt = game_data['game_map'].get_star_chest_pt();
		var start_pt = level_item.get_star_chest_pt();
		for (var i = 0; i < amount; i++) {
			this.fly_star(start_pt, end_pt, i * 500 + 500, i == amount - 1);
		}
	}

	fly_star(pt_start, pt_end, delay, is_last) {
		setTimeout(() => {
			var _this = this;
			var item = new Phaser.GameObjects.Image(this.scene, pt_start.x, pt_start.y, 'common1', 'starbar_icon');
			item.scale = 0.1;
			game_data['moving_holder'].add(item);
			var pt_mid = new Phaser.Geom.Point(pt_start.x - 50, pt_end.y + 100);
			this.scene.tweens.add({targets: item, scale: 1, duration: 250});
			this.scene.tweens.add({targets: item, angle: 360, duration: 700, delay: 200});
			game_data['utils'].bezier(pt_start, pt_mid, pt_end, item, 1000, 'Sine.easeOut', this, function(){
				game_data['scene'].tweens.add({targets: item, alpha: 0, duration: 100, onComplete: function(){
					item.destroy();
				}});
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'add_star'});
				if (is_last) game_data['game_map'].update_star_chest();
				else game_data['game_map'].update_star_chest(1);
				
			});            
		}, delay);
	}

	show_arrow() {
		clearTimeout(this.tid_arrow);
		if (game_data['utils'].get_passed_amount() <= 10) {
			this.tid_arrow = setTimeout(() => {
					if (!this.hint_arrow) {
						this.hint_arrow = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'arrow1');
						this.hint_arrow.angle = -210;
						this.holder.add(this.hint_arrow);
						this.move_arrow();
					}  
					this.hint_arrow.alpha = (game_data['game_tutorial'].active_tutorial) ? 0 : 1;
					this.hint_arrow.visible = true;
				
			}, 5000);
		}
		else if (this.hint_arrow) this.hint_arrow.visible = false;
	}

	move_arrow() {
		var _this = this;
		if (this.current_level) {
				var _x = this.current_level.x + 30;
				var _y = this.current_level.y + 50;
				this.hint_arrow.x = _x;
				this.hint_arrow.y = _y;
				this.hint_arrow.alpha = (game_data['game_tutorial'].active_tutorial) ? 0 : 1;
				game_data['scene'].tweens.add({targets: _this.hint_arrow, x: _x + 30, y: _y + 50, duration: 700, ease: 'Sine.easeInOut', onComplete: function () { 
					game_data['scene'].tweens.add({targets: _this.hint_arrow, x: _x, y: _y, duration: 700, ease: 'Sine.easeInOut', onComplete: function () { 
						_this.move_arrow();
					}});
				}});
		}
	}

	hide_arrow() {
		clearTimeout(this.tid_arrow);
		if (this.hint_arrow) this.hint_arrow.visible = false;
	}

	reset_level_text() {
		
		var delay = 10;
		var batch_size = 20;
		var batches = Math.ceil(this.level_items.length / batch_size);
		for (var i = 0; i < batches; i++) {
			this.reset_delayed_batch(i * batch_size, (i+1) * batch_size, delay)
			delay += 20;
		}
	}
	reset_delayed_batch(_from, _to, timeout) {
		setTimeout(() => {
			var txt;
			for (var i = _from; i < Math.min(_to, this.level_items.length); i++) {
				if (this.level_items[i] && this.level_items[i].no_txt) {
					txt = this.level_items[i].no_txt.text;
					this.level_items[i].no_txt.setFontFamily(game_data['font_family']);
					this.level_items[i].no_txt.text = '';
					this.level_items[i].no_txt.text = txt;
				}
			}
		}, timeout);
	}

	handler_event(params) {
		/*
			level_item.addEventListener('SET_STARS_ANIM', handler_event);
			level_item.addEventListener('AFTER_STARS_ANIM', handler_event);
			level_item.addEventListener('DISPLAY_MAP_ARTIFACT', handler_show_map_artifact);			
		*/
		switch (params['event']) {
			case 'start_level':
				if (!game_data['map_dragging']) this.emitter.emit('EVENT', params);
				break;
			case 'level_drag':
				this.handler_level_drag(params);
				break;
			case 'level_dragend': 
				this.map_dragend();
				break;
			case 'level_dragstart': 
				this.map_dragstart();
				break;
			case 'level_to_top':
				this.level_to_top(params);
				break;
			default:
				this.emitter.emit('EVENT', params);
				break;
		}
	}

	level_to_top(params) {
		setTimeout(() => {
			var level = params['level'];
			if (level && this.holder.exists(level))	this.holder.bringToTop(level);
			if (this.user_avatar && this.holder.exists(this.user_avatar))	this.holder.bringToTop(this.user_avatar);
		}, 20);
		
	}
	check_locked(level_id) {
		if (this.level_items && this.level_items[level_id])
			return this.level_items[level_id].check_locked();
		else    
			return {'success': false};
	}


	init_user_avatar() {
		var _this = this;
		this.user_avatar = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.move_avatar = new Phaser.GameObjects.Container(this.scene, 0, -50);
		this.user_avatar.add(this.move_avatar);
		if (this.current_level) {
			this.user_avatar.x = this.current_level.x;
			this.user_avatar.y = this.current_level.y;
		}
		this.holder.add(this.user_avatar);
		this.move_avatar.photo = new Phaser.GameObjects.Container(this.scene, 0,0);
		
		this.user_avatar_icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'ava_user_bg');
		this.move_avatar.add(this.user_avatar_icon); 
		this.move_avatar.add(this.move_avatar.photo);
		var temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'ava_user_frame');
		this.move_avatar.add(temp);
		temp.setInteractive();
		temp.on('pointerup', ()=>{
			if (_this.current_level && !game_data['map_dragging']) _this.emitter.emit('EVENT', {'event': 'start_level', 'level_id': _this.current_level.level_id, 'level_type': _this.current_level.level_type});
		}, this);
		temp.on('pointerover', ()=>{
			if (_this.current_level && !game_data['map_dragging']) _this.current_level.item_over();
		}, this);
		temp.on('pointerout', ()=>{
			if (_this.current_level && !game_data['map_dragging']) _this.current_level.item_out();
		}, this);
			var timeout = 100;
			if (loading_vars['net_id'] == 'ig') timeout = 2000;
			setTimeout(() => {
				game_data['utils'].load_user_photo(loading_vars['user_id'], function(res){
					if (res['success'] && res['photo']) {
						var photo = res['photo'];
						var scale = 70 / photo.width;
						photo.setScale(scale);
						_this.move_avatar.photo.add(photo);
					}
				});	
			}, timeout);
		this.run_avatar_anim();
	}

	run_avatar_anim() {
		var _this = this;
		game_data['scene'].tweens.add({targets: this.move_avatar, y: -40, duration: 2000, yoyo: true, onComplete: function () { 
			_this.run_avatar_anim();
		}});
	}

	check_appear_new_items(on_complete) {
		var arr = this.get_new_level_items();
		var i = 0;
		if (arr.length > 0) {
			for (i = 0; i < arr.length; i++) {
				var func = (i == arr.length - 1) ? on_complete: function(){};
				arr[i].appear(500 + i*200, func)
			}		
		}
		else {
			setTimeout(() => {
				on_complete();    
			}, 1000);
		}
			
	}


	get_new_level_items() {					
		var i;
		var arr = [];			
		var max_forward = (Math.floor(game_data['utils'].get_passed_amount() / map_data['show_map_levels']) + 1) * map_data['show_map_levels'];
		var current_len = game_data['utils'].get_passed_amount();

		if (max_forward - current_len == map_data['show_map_levels']) {
			
			for (i = current_len; i < current_len + map_data['show_map_levels']; i++) 
				if (i < game_data['total_levels'] && i < this.level_items.length) arr.push(this.level_items[i]);
				// if (i < game_data['levels'].length && i < this.level_items.length) arr.push(this.level_items[i]);
		}
		return arr;
	}
	
	get_level_pt(level_id) {
		var pt = game_data['utils'].toGlobal(this.holder, new Phaser.Geom.Point(this.level_items[level_id].x, this.level_items[level_id].y));
		return pt;
	}

	handler_level_drag(params) {
		var _this = this;
		var dragX = _this._holder_no_drag_x - params['x'];
		this.set_holder_pos(dragX); 
	}

	set_holder_pos(dragX) {
		//console.log('set',dragX ,this._holder_no_drag_x - dragX, this._holder_no_drag_x, this.holder_scale)

			if (this._holder_no_drag_x - dragX > 80) {
				this.next_page(dragX);
			}
			else if (this._holder_no_drag_x - dragX < -80) {
				this.prev_page(dragX);
			}

	}

	update_visibility(page1, timeout) {
		this.map_loaded[page1]['container'].visible = true;
		setTimeout(() => {
			for (var i = 0; i < this.map_loaded.length; i++) 
				if (i != page1)
					this.map_loaded[i]['container'].visible = false; 
		}, timeout);

	}

	next_page(dragX) {
		if (!this.page_changing) {
			var allow_cloud_next = this.active_clouds[this.page] == false;
			if (allow_cloud_next && this.page < this.map_loaded.length - 1) {
				this.page += 1;
				this.move_page(true, dragX, true);
			}
			else {
				this.holder.disableInteractive();
				this.holder.setInteractive({ draggable: true });
			}
		}
	}

	prev_page(dragX) {
		if (!this.page_changing) {
			if (this.page > 0) {
				this.page -= 1;
				this.move_page(true, dragX);
			}
			else {
				this.holder.disableInteractive();
				this.holder.setInteractive({ draggable: true });
			}
		}
		
	}

	move_page(with_anim = true, dragX = null, next = false) {
		if (!this.page_changing) {
			var _this = this;
			this.page_changing = true;
			this.holder.disableInteractive();
			this.map_dragend();
			var add_x = 0;
			//console.log('page', this.page,_this.holder.x, -map_data['map_w'] * this.page * this.holder_scale - add_x, add_x)
			if (with_anim) game_data['scene'].tweens.add({targets: _this.holder, x: -map_data['map_w'] * this.page * this.holder_scale - add_x, duration: 700, ease: 'Sine.easeInOut', onComplete: function () { 
				_this.page_changing = false;
				_this.move_clouds();
				_this.holder.setInteractive({ draggable: true });
				if (dragX) _this._holder_no_drag_x = dragX;
				_this.update_buttons(true, next);
			}});
			else {
				_this.holder.x = -map_data['map_w'] * this.page * this.holder_scale - add_x;
				if (dragX) _this._holder_no_drag_x = dragX;
				_this.page_changing = false;
				_this.move_clouds();
				_this.holder.setInteractive({ draggable: true });
				_this.update_buttons(true, next);
			};
			this.update_visibility(this.page, 700);
			this.load_current_map();
			
		}
	}

	update_buttons(from_paging = false, next = false) {

			this.button_left.visible = this.page > 0;
			this.button_right.visible = this.page < this.map_loaded.length && this.active_clouds[this.page] == false;
	}



	map_dragstart() {        
		this._holder_no_drag_x = this.holder.x;
		game_data['map_dragging'] = true;
		
	}

	map_dragend() {
		setTimeout(() => {
			game_data['map_dragging'] = false;     
		}, 100);
	}

	init_clouds() {
		this.clouds = [new Phaser.GameObjects.Container(this.scene, (this.page - 1) * map_data['map_w'], 0)
					,new Phaser.GameObjects.Container(this.scene, (this.page) * map_data['map_w'], 0)
					,new Phaser.GameObjects.Container(this.scene, (this.page + 1) * map_data['map_w'], 0)];
		var i, j, item, temp;
		var pos = [
			{'type':'1', 'x':-126, 'y':-13, 'sx': -1}
			,{'type':'3', 'x':62, 'y':257}
			,{'type':'2', 'x':739, 'y':177}
			,{'type':'3', 'x':159, 'y':410}
			,{'type':'1', 'x':276, 'y':145}
			,{'type':'2', 'x':-95, 'y':-40}
			,{'type':'3', 'x':894, 'y':-58}
			,{'type':'1', 'x':-181, 'y':377}
			,{'type':'3', 'x':476, 'y':434}
			,{'type':'2', 'x':774, 'y':519}
			,{'type':'1', 'x':735, 'y':-71}
			,{'type':'2', 'x':356, 'y':62}
			,{'type':'3', 'x':-78, 'y':350}
			,{'type':'1', 'x':238, 'y':396}
			,{'type':'2', 'x':418, 'y':-50}
			,{'type':'1', 'x':775, 'y':220, 'sx': -1}
		];
		for (i = 0; i < this.clouds.length; i++) {
			item = this.clouds[i];
			item.anim_info = [];
			item.page = this.page + (i - 1);
			item.visible = this.active_clouds[item.page];
			this.cloud_holder.add(item);
			for (j = 0; j < pos.length; j++) {
				temp = new Phaser.GameObjects.Image(this.scene, pos[j].x, pos[j].y, 'common1', 'cloud'+pos[j].type);
				temp.setOrigin(0);
				item.add(temp);
				item.anim_info.push({'img': temp, 
					'alpha': Math.random() * 0.4 + 0.6, 
					'delay': parseInt(Math.random() * 4000),
					'phase1': parseInt(Math.random() * 2000 + 2000),
					'phase2': parseInt(Math.random() * 2000 + 2000)
				});
			}
			this.anim_cloud(item);
		}
		
	}

	anim_cloud(item) {
		var _this = this;
		if (item.visible && item.page == this.page)  {
			var i, info;
			
			for (i = 0; i < item.anim_info.length; i++) {
				info = item.anim_info[i];
				game_data['scene'].tweens.add({targets: info.img, alpha: info.alpha, duration: info.phase1, ease: 'Sine.easeInOut', delay: info.delay});
				game_data['scene'].tweens.add({targets: info.img, alpha: 1, duration: info.phase2, ease: 'Sine.easeInOut', delay: info.delay + info.phase1});
			}
		}
		setTimeout(() => {
			this.anim_cloud(item);
		}, 10000);
	}

	move_clouds(avatar_to_next = false) {
		if (this.clouds) {
			var i, item;
			for (i = 0; i < this.clouds.length; i++) {
				item = this.clouds[i];
				if (item.page - this.page < -1 ) {
					item.x = map_data['map_w'] * (this.page + 1);
					item.page = this.page + 1;
				}
				else if (item.page - this.page > 1 ) {
					item.x = map_data['map_w'] * (this.page - 1);
					item.page = this.page - 1;
				}
				if (avatar_to_next && item.page - this.page == 0) {
					var _item = item;
					var _this =this;
					game_data['scene'].tweens.add({targets: _item, alpha: 0, duration: 500, onComplete: function () { 
						_item.visible = _this.active_clouds[_item.page];
						_item.alpha = 1;
					}});
				}
				else item.visible = this.active_clouds[item.page];
			}
		}
	}

	start_anim_buttons() {
		var _this = this;
		game_data['scene'].tweens.add({targets: this.button_right, scale: 1.9, duration: 1000, yoyo: true});
		game_data['scene'].tweens.add({targets: this.button_left, scaleX: -1.9, scaleY: 1.9, duration: 1000, yoyo: true, onComplete: function () { 
			_this.start_anim_buttons();
		}});
	}

	delayed_prize() {
		if (this.try_delayed_prize) {
			this.try_delayed_prize = false;
			this.check_map_prize();
		}
	}

	check_map_prize() {
		
		if (game_data['prize_mod'] || game_data['game_tutorial'].active_tutorial) {
			this.try_delayed_prize = true;
		}
		else {
			this.try_delayed_prize = false;
			var lvl = this.current_level;
			var user_prizes = game_data['user_data']['collected_map_prizes'];
			
			if (lvl && lvl.prize && user_prizes) {
				var _this = this;
				var _module = (lvl.level_id+1) % game_data['map_prizes']['levels_period'];
				if (game_data['map_prizes']['levels'].indexOf(_module) >= 0 && user_prizes.indexOf(lvl.level_id+1) < 0) {
					var prizes_limit = lvl.super_prize ? 3 : 1;
					game_data['game_request'].request({'collect_map_prize': true, 'level_id': lvl.level_id+1, 'prizes_limit': prizes_limit}, function(res){
						if (res['success'] && 'prizes' in res) {
							_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'map_prize', 'info':res});
							if (res['prizes']) {
								var stat_amount = 0;
								var sub_type = 0;
								for (var i = 0; i < res['prizes'].length; i++) {
									var prize = res['prizes'][i];
									if (prize['type'] == 'money') stat_amount += prize['amount'];
									if (prize['type'] in game_data['user_data']['boosters']) {
										stat_amount += prize['amount'] * game_data['boosters'][prize['type']]['price'];
									}
									game_data['utils'].update_stat({'type': 'map_prize', 'collect_map_prize': true, 'prizes': res['prizes']});
								}
							}
						// game_data['daily_task_manager'].update_tasks({'type': 'map_prize', 'amount':1});
						}
					});
					lvl.hide_prize();
					
				}
				else if (user_prizes.indexOf(lvl.level_id+1) >= 0)  lvl.hide_prize(true);
			}
		}
	}


	get_holes(type) {
		return this.current_level.get_tutorial_holes();
		/*
var data = this.current_level.get_tutorial_holes();
		return data;
		if (this.current_level) return this.current_level.get_tutorial_holes();
		else return [{"pt":{"x":934,"y":503},"w":102,"h":171,"arrow":true,"arrow_orientation":"up"}]
		*/
	}

};