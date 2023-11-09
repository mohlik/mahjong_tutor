var PaidChestOpen = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function PaidChestOpen (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		var temp;
		var res;
		this.allow_close = true;
		this.chest_id = params['chest_id'];
		this.rating_type = params['rating_type'];
		this.from_tasks = ('from_tasks' in params && params['from_tasks']);
		boosters = {'undo': true, 'joker': true, 'bomb': true, 'remix': true};
		this.flag = this.from_tasks ? 0 : 1;
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_big');
		temp.setInteractive();
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);
	
		var button_close = new CustomButton(this.scene, 280, -248, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);


		this.add(button_close);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_open', 'phrase_id': '1', 'values': [], 'base_size': 32});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.add(temp);

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_open', 'phrase_id': '5', 'values': [], 'base_size': 28});		
		this.info_txt = new Phaser.GameObjects.Text(this.scene, 0, -120, res['text'], { fontFamily: 'font1', fontSize: res['size'], 
					color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 560}});	
		this.info_txt.setOrigin(0.5);
		this.add(this.info_txt);
	

		

		this.prize_bg = new Phaser.GameObjects.Container(this.scene, 110, 50);
		this.add(this.prize_bg);
		this.prize_bg.alpha = 0;
		var graphics;
		var key = 'open_chest1';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x39352a, 0.5);
			graphics.lineStyle(2, 0xe3cc69, 1);
			graphics.fillRoundedRect(5, 5, 400, 200, 10);
			graphics.strokeRoundedRect(5, 5, 400, 200, 10);
			graphics.generateTexture(key, 410, 210);
			game_data['graphics'][key] = true;
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
    	if (t) {
    	    game_data['graphics'][key] = true;
    	    this.prize_bg.add(t);
    	}
		
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'prize_line');
		temp.setScale(1,0.5);
		this.prize_bg.add(temp);
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'prize_line');
		temp.angle = 90;
		this.prize_bg.add(temp);

		this.prize_pos = [
				 new Phaser.Geom.Point(this.prize_bg.x + 50, this.prize_bg.y + 57)
				,new Phaser.Geom.Point(this.prize_bg.x - 150, this.prize_bg.y + 57)
				,new Phaser.Geom.Point(this.prize_bg.x + 50, this.prize_bg.y - 43)
				,new Phaser.Geom.Point(this.prize_bg.x - 150, this.prize_bg.y - 43)												
		]

		this.chest = new Phaser.GameObjects.Container(this.scene, 0, 50);
		this.add(this.chest);
		this.chest.shine = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'prize_chest_bg');
		this.chest.shine.setScale(1.5);
		this.chest.add(this.chest.shine);
		this.start_shine(this.chest.shine);
		
		let chest_skin = this.chest_id
		if (['sale_chest_1', 'sale_chest_2'].includes(this.chest_id)) chest_skin = 'chest_1'
		this.chest.closed = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', chest_skin);
		this.chest.opened = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', chest_skin + '_open');
		this.chest.add(this.chest.closed);
		this.chest.add(this.chest.opened);
		this.chest.opened.alpha = 0.01;
		this.chest.opened.setInteractive();
		this.chest.opened.on('pointerup', this.handler_chest_open, this);
		this.chest_y = this.chest.y;
		this.is_opened = false;
		this.is_anim = false;

		this.button_continue = new CustomButton(this.scene, 0, 262, this.handler_continue, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_open', 'phrase_id': '2', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.button_continue.visible = false;
		this.button_continue.alpha = 0;
		this.button_continue.add(temp);
		this.add(this.button_continue);
		this.allow_continue = true;
	},	

	handler_chest_open() {	
		var _this = this;
		if (this.is_opened) {
			if (!this.is_anim) {
				_this.is_anim = true;
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_click'});
				game_data['utils'].chest_jump(_this.chest, function() {
					if (_this.scene) _this.show_next_prize();
					if (_this.prizes.length == 0) {
						_this.chest.opened.off('pointerup', _this.handler_chest_open, _this);
						setTimeout(()=> {
							_this.is_anim = true;
							_this.button_continue.alpha = 0;
							_this.button_continue.visible = true;
							game_data['scene'].tweens.add({targets: _this.info_txt, alpha: 0, duration: 300, onComplete: function(){
								var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_open', 'phrase_id': '6', 'values': [], 'base_size': 38});
								_this.info_txt.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, 
									align: 'center', wordWrap: {'width': 560}});
								_this.info_txt.text = res['text'];
								game_data['scene'].tweens.add({targets: _this.info_txt, alpha: 1, duration: 300});
							}});
							game_data['scene'].tweens.add({targets: _this.button_continue, alpha: 1, duration: 300, onComplete: function(){
								game_data['scene'].tweens.add({targets: _this.chest.opened, alpha: 0, duration: 200, delay: 60});
								game_data['scene'].tweens.add({targets: _this.chest.closed, alpha: 1, duration: 200});
							}});
						},400);
					}
				});
			}
		}
		else {
			if (!this.is_anim) {
				this.is_anim = true;
				this.get_chest_info(function() {	
					game_data['scene'].tweens.add({targets: _this.prize_bg, alpha: 1, duration: 300, delay: 100});
					game_data['scene'].tweens.add({targets: _this.chest, x: _this.chest.x - 220, duration: 400, onComplete: function(){
						game_data['utils'].chest_jump(_this.chest, function() {
							game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_click'});
							game_data['scene'].tweens.add({targets: _this.chest.opened, alpha: 1, duration: 200});
							game_data['scene'].tweens.add({targets: _this.chest.closed, alpha: 0, duration: 200, delay: 60});
							setTimeout(() => {
								_this.is_opened = true;
								_this.is_anim = false;
								if (_this.scene) _this.show_next_prize();
							}, 200);
						});
					}});
				});
			}
		}
	},

	show_next_prize(){
		var _this = this;
		this.is_anim = true;
		var start_pt = game_data['utils'].toGlobal(this.chest.shine, new Phaser.Geom.Point(0,0));
		start_pt = game_data['utils'].toLocal(this, start_pt);
		var end_pt = this.prize_pos.pop();
		var current_prize = this.prizes.pop();

		var cont = new Phaser.GameObjects.Container(this.scene, start_pt.x, start_pt.y);
		this.add(cont);
		cont.alpha = 0;
		cont.scale = 0.1;
		var keys = {'money': 'money_ico', 'rating_score': 'score_icon_big' }
		if (current_prize['type'] in keys) cont.icon =  new Phaser.GameObjects.Image(this.scene, 0, -3, 'common1', keys[current_prize['type']]);
		else {
			cont.icon = new Phaser.GameObjects.Image(this.scene, 0, -3, 'common1', current_prize['type'] + '_active');
			cont.icon.scale = 0.8;
		}
		cont.add(cont.icon);
		cont.txt = new Phaser.GameObjects.Text(this.scene, 86, -4, current_prize['amount'], {fontFamily:"font1", fontSize: 45, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});
		cont.txt.setOrigin(0.5);
		cont.add(cont.txt);
		cont.txt.alpha = 0;

		if (current_prize['type'] == 'money') this.icon_money = cont.icon;
		if (current_prize['type'] == 'rating_score') this.icon_rating_score = cont.icon;

		game_data['scene'].tweens.add({targets: cont, alpha: 1, duration: 100});
		game_data['scene'].tweens.add({targets: cont, scale: 1, duration: 200});
		
		var mid_pt = new Phaser.Geom.Point(0,-120)
		this.bezierCurve = new Phaser.Curves.CubicBezier(start_pt, mid_pt, end_pt, end_pt);
		var tweenObject = {val: 0}
		game_data['scene'].tweens.add({
				targets: tweenObject,
				val: 1,
				duration: 500,
				ease: "Sine.easeInOut",
				callbackScope: _this,
				onUpdate: function(tween, target){
						var position = _this.bezierCurve.getPoint(target.val);
						cont.x = position.x;
						cont.y = position.y;
				},
				onComplete: function(){
					game_data['scene'].tweens.add({targets: cont.txt, alpha: 1, duration: 200});
					_this.is_anim = false;
					game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_bonus_got'});
				}
		});
	},

	get_chest_info(on_complete) {
		var _this = this;
		let req_obj = {'paid_chest_open': true, 'chest_id': this.chest_id, 'rating_type': this.rating_type}
		if (this.from_tasks) req_obj['from_tasks'] = true
		game_data['game_request'].request(req_obj, function(res){
			var i;
			var s;
			
			if ('success' in res && res['success']) {
				if ('rating' in res) _this.new_score = true;
				if ('money' in res)  _this.new_money = true;
				if ('boosters' in res) _this.new_boosters = true;	
								
				var pr = res['prize'];
				prizes = [];
				for (s in pr) {
					prizes.push({'type': s, 'amount': pr[s]});
				}
				game_request.update_stat({'paid_chest_open': true, 'prizes': prizes, 'task_chest': _this.from_tasks});
				var sub_type = 0;
				for (i = 0; i < prizes.length; i++) {
					s = prizes[i]['type'];
					if (s in game_data['user_data']['boosters']) {
						if (s == 'undo') sub_type = 1;
						if (s == 'joker') sub_type = 2;
						if (s == 'bomb') sub_type = 3;
						if (s == 'remix') sub_type = 4;
						game_data['utils'].update_stat({'type': 'chest_booster', 'description': s, 'sub_action':sub_type
							, 'amount_inc': prizes[i]['amount'], 'flag':this.flag});
					}
					else if (s == 'rating_score') {
						game_data['task_manager'].update_tasks({'type': 'rating_score', 'amount':prizes[i]['amount']});
						game_data['utils'].check_new_tournament(null, null, prizes[i]['amount'], false)
					}
					else if (s == 'money') {
						game_data['utils'].update_stat({'type': 'chest_money', 'amount_inc': prizes[i]['amount'], 'flag':this.flag});
					}
				}
				_this.prizes = prizes;
				on_complete();
			}
			else {
				if (!_this.was_request_fail) {
					_this.was_request_fail = true;
					_this.handler_close(null);
				}
				else _this.close_window();
			}
		});
	},
	
	handler_continue() {
		if (this.allow_continue) {
			this.allow_continue = false;
			var delay = 10;
			if (this.new_money) {
				this.fly_money(delay, true);
				delay += 200;
			}
			if (this.new_score) {
				this.fly_rating(delay);
				delay += 200;
			}
			delay += 1000;
			setTimeout(() => {
				this.handler_close();
			}, delay);
		}
		
	},

	fly_rating(delay) {
		var _this = this;
		var start_pt = game_data['utils'].toGlobal(this.icon_rating_score, new Phaser.Geom.Point(0,0));
		var icon = new Phaser.GameObjects.Image(this.scene, start_pt.x, start_pt.y, "common1", "score_icon_big");
		start_pt = game_data['utils'].toLocal(game_data['moving_holder'], start_pt);
		game_data['moving_holder'].add(icon);
		var end_pt = game_data['rating_manager'].get_player_pt();
		end_pt = game_data['utils'].toLocal(game_data['moving_holder'], end_pt); 
		
		game_data['scene'].tweens.add({targets: icon, scale: 0.5, x: end_pt.x, y: end_pt.y, duration: 500, delay: delay, onComplete: function() {
			game_data['utils'].add_light_stars(end_pt, game_data['moving_holder'], function(){});
			icon.destroy();
		}});
		setTimeout(() => {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'rating_add'});
			// game_data['utils'].user_score_updated();
			game_data['rating_manager'].user_score_updated();	
		}, delay + 300);
	},

	fly_money(delay, raise_update = false) {
		var _this = this;
		setTimeout(() => {
			var start_pt = game_data['utils'].toGlobal(this.icon_money, new Phaser.Geom.Point(0,0));
			var end_pt = game_data['game_map'].get_money_pt();
			game_data['utils'].fly_items({'amount': 5, 'holder': game_data['moving_holder'], 
							'item_atlas': 'common1', 'item_name': 'money_ico',
							'pt_start': start_pt, 'pt_end': end_pt}, 
			function(){
				if (_this.scene && raise_update) _this.emitter.emit('EVENT', {'event': 'update_money'});
			});
			setTimeout(function() {
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
			},game_data['utils'].get_sound_delay(2));
		}, delay);
	},


	handler_close(params) {  
		var _this = this;
		if (this.is_opened || this.was_request_fail) this.close_actions();
		else {
			if (this.allow_close) {
				this.allow_close = false;
				this.get_chest_info(function() {
					// if (_this.new_score) game_data['utils'].user_score_updated();
					if (_this.new_score) game_data['rating_manager'].user_score_updated();
					setTimeout(() => {
						game_data['game_map'].update_money(true);
					}, 500);
					_this.close_actions();
				})
			}
		}
	},

	close_actions() {
		if (this.new_boosters) {
			var delay = 10;
			setTimeout(() => {
				this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'boosters_info'});	
			}, delay);
			
		}
		this.close_window();
	},

	close_window(params) {  	
		this.emitter.emit('EVENT', {'event': 'window_close'});
		game_data['utils'].check_rating_bonus();
	},	

	start_shine(item) {
		var _this = this;
		game_data['scene'].tweens.add({targets: item, angle: 360, duration: 5000, onComplete: function(){
			if (_this.scene) _this.start_shine(item);
		}});
	}

});