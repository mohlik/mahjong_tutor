var RatingItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function RatingItem ()
    {
        this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);    
		this.emitter = new Phaser.Events.EventEmitter();    
	},
	
	init(params) {  
		var suff = '';
		this.allow_coin_click = true;
		// this.attr = params['attr'];	
		// this.friends = params['friends'];
		this.shine_cont = new Phaser.GameObjects.Container(this.scene, 0,0);
		this.add(this.shine_cont)
		this.bg_cont = new Phaser.GameObjects.Container(this.scene, 0,0);
		this.add(this.bg_cont)
		this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "panel8" + suff);
		this.shine_cont.x = this.bg.width/2;
		this.shine_cont.y = this.bg.height/2;
		this.has_anim = false;
		this.bg.setOrigin(0, 0);
		this.bg_cont.add(this.bg);	
		
		this.name_txt = new Phaser.GameObjects.Text(this.scene, 130, 15,  '-', { fontFamily: 'font1', fontSize: 18, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
		this.name_txt.setOrigin(0.5);

        this.add(this.name_txt);
		
		this.score_ico = new Phaser.GameObjects.Image(this.scene, 80, 35, "common1", "score_icon");
		this.score_ico.scale = 0.7;
		this.add(this.score_ico);
		this.score_txt = new Phaser.GameObjects.Text(this.scene, 130, 34,  '-', { fontFamily: 'font1', fontSize: 20, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
		this.score_txt.setOrigin(0.5);
        this.add(this.score_txt);
		
		
		
		this.photo_cont = new Phaser.GameObjects.Container(this.scene, 26, 27);
		this.add(this.photo_cont);
		let bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "competitor_bg");
		bg.setScale(42/bg.width);
		this._bg = bg;
		this.photo_cont.add(bg);
		
		bg = new Phaser.GameObjects.Image(this.scene, this.photo_cont.x, this.photo_cont.y, "common1", "ava_frame");
		bg.setScale(46/bg.width);
		this.add(bg);

		this.place_txt = new Phaser.GameObjects.Text(this.scene, 26, 41,  '-', { fontFamily: 'font1', fontSize: 13, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
		this.place_txt.setOrigin(0.5);
		this.add(this.place_txt);
		
		this.photo_load_started = false;
		this.photo = null;
		this.info = {};
		this.correct_place = -1;

		this.coins = null;
		
	},

	update_item(info){
		this.info = info;
		var suff = '';
		if (this.info['user_id'] == loading_vars['user_id']) {
			game_data['user_rating_score'] = this.info['score'];
			this.is_player = true;
			this.bg_cont.removeAll(true);
			this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "panel9" + suff);
			this.bg.setOrigin(0, 0);
			this.bg_cont.add(this.bg);	
			this.name_txt.setStyle({ fontFamily: 'font1', fontSize: 18, color: '#333300', stroke: '#f6caa0', strokeThickness: 3});
		}
		else {
			if (this.friends) this.init_friends_money();
			this.is_player = false;
		}
		this.display_place();
		this.display_score();
		this.display_name();		
		if (this.photo) this.photo.destroy();
		this.photo_load_started = false;
		this.is_dead = false;
	},
	
	update_item_without_place(info) {
		var previous_place = ('place' in this.info) ? this.info['place'] : -1;
		this.correct_place = info['place'];
		info['place'] = previous_place;
		this.update_item(info);
	},
	
	
	display_score() {
		this.score_txt.text = this.info['score'];	
	},

	display_place() {
		this.place_txt.text = this.info['place'];
	},

	display_name() {
		var user_id = this.info['user_id'];
		var user_info = game_data['users_info'][user_id];		
		if (this.scene && user_info && user_info['first_name']) this.name_txt.text = user_info['first_name'].substring(0, 12);
	},


	update_correct_place() {
		this.info['place'] = this.correct_place;
	},

	load_photo() {
		var _this = this;
		if (!this.photo_load_started) {
			this.photo_load_started = true;
			game_data['utils'].load_user_photo(this.info['user_id'], function(res){
				if (res['first_name']) _this.display_name();
				if (res['success'] && res['photo']) {
					_this.photo = res['photo'];
					_this.display_photo();
					if (_this._bg) _this._bg.destroy();
				}
			});							
		}
	},
	
	display_photo() {
        var scale = 44 / this.photo.width;
        this.photo.setScale(scale);
        this.photo_cont.add(this.photo);
	},
	
	get_user_id() {
		return this.info['user_id'];
	},

	get_place() {
		return this.info['place'];
	},

	set_dead() {
		this.is_dead = true;
	},
	
	get_dead() {
		return this.is_dead;
	},

	init_friends_money() {		
		this.friend_item = true;
		if (this.info['user_id'] == loading_vars['user_id'] || (this.info['user_id'] in game_data['user_data']['gift_users'] &&
        game_data['user_data']['gift_users'][this.info['user_id']] >= loading_vars['day_id'])) {
			if (this.coins) this.coins.visible = false;
        }
        else {
			if (this.coins) this.coins.destroy();
			var _this = this;
			this.coins = new Phaser.GameObjects.Image(this.scene, 180, 32, 'common1', 'coin');
			this.add(this.coins);
			this.coins.alpha = 0;
			this.coins.setScale(0.1);
			this.coins.visible = true;
			var sc1 = 1;
			var sc2 = 0.7;
			var sc3 = 0.8;
			setTimeout(() => {
				game_data['scene'].tweens.add({targets: _this.coins, alpha: 1, duration: 100});
				game_data['scene'].tweens.add({targets: _this.coins, scale: sc1, duration: 300, onComplete: function(){
					game_data['scene'].tweens.add({targets: _this.coins, scale: sc2, duration: 150, onComplete: function(){
						game_data['scene'].tweens.add({targets: _this.coins, scale: sc3, duration: 100});
					}});
				}});	
			}, 500);
			
			this.bg.on('pointerdown', this.check_click, this)
        }
	},

	available(status) {
		if (this.friend_item) {
			if (status) this.bg.setInteractive();
			else this.bg.removeInteractive();
		}
	},

	check_before_show() {
		if (this.friends) {
			if (this.info['user_id'] == loading_vars['user_id'] || (this.info['user_id'] in game_data['user_data']['gift_users'] &&
			game_data['user_data']['gift_users'][this.info['user_id']] >= loading_vars['day_id'])) {
				if (this.coins) {
					this.coins.visible = false;
					this.bg.removeInteractive();
				}
			}
		}
	},

	check_click() {
		if (this.allow_coin_click && this.coins && this.coins.visible) {
			var _this = this;
			this.allow_coin_click = false;
			var user_id = this.info['user_id'];
			game_data['socialApi'].make_challenge(user_id, function(res) {
				if (res['success']) {
					_this.bg.removeInteractive();
					game_data['game_request'].request( {'collect_gift_friend': true,'user_id': user_id}, function(obj) 	{
						if (obj['success']) {
							game_request.update_stat({'collect_gift_friend': true, 'amount_inc': game_data['gift_friend_prize']});
							var pt_start = game_data['utils'].toGlobal(_this, new Phaser.Geom.Point(_this.coins.x, _this.coins.y));
							var pt_end = game_data['game_map'].get_money_pt();
							game_data['utils'].update_stat({'type': 'gift_friend', 'amount_inc': game_data['gift_friend_prize']});
							game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'add_diamond'});
							
							if (_this.scene) game_data['utils'].fly_items({'amount': 1,								
													'holder': game_data['moving_holder'],
													'item_atlas': 'common1',
													'item_name': 'coin',
													'pt_start': pt_start,
													'pt_end': pt_end	
													}, 
							function(){
								game_data['game_map'].emitter.emit('EVENT', {'event': 'update_money'});
							});
							if (_this.scene) _this.scene.tweens.add({targets: _this.coins, alpha:0, duration: 400, onComplete: function(){
								_this.coins.visible = false;
							}});
						}
					});
				}
				else _this.allow_coin_click = true;
			});
		}
	},

	anim_find_me() {
		if (this.is_player && !this.has_anim) {
			this.has_anim = true;
			var comp = this;
			this.parentContainer.bringToTop(comp);
			var shine = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'luchi');
			shine.scale = 0.2;
			shine.alpha = 0;
			comp.shine_cont.add(shine);
			var w = this.bg.width;
			var h = this.bg.height;
			var _y = this.y;
			var _x = this.x;
			var _sc = 1.5;

			game_data['scene'].tweens.add({targets: shine, scale: _sc, alpha: 1, duration: 300});
			game_data['scene'].tweens.add({targets: shine, angle: 180, delay: 100, duration: 900});
			game_data['scene'].tweens.add({targets: shine, scale: 0.01, duration: 300, delay: 900, onComplete: function () { 
				shine.destroy();
			}});
			var scale = 1.07;
			game_data['scene'].tweens.add({targets: comp, scale: scale, x: _x + (1 - scale) * w / 2, y: _y + (1 - scale) * h / 2,
				duration: 300, ease: "Sine.easeInOut",yoyo: true, onComplete: function () { 
				game_data['scene'].tweens.add({targets: comp, scale: scale, x: _x + (1 - scale) * w / 2, y: _y + (1 - scale) * h / 2,
					duration: 300, ease: "Sine.easeInOut", yoyo: true, onComplete: function () { 
						comp.has_anim = false;
				}});
			}});
		}
	}

});
