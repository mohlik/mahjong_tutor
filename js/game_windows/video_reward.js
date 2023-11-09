var VideoReward = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function VideoReward (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	
	this.allow_click = true;
	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'video_reward', 'phrase_id': '6', 'values': [], 'base_size': 40});		
	var temp = new Phaser.GameObjects.Text(this.scene, 0, -145, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});	
	temp.setOrigin(0.5);
	this.add(temp);

	this.prize_content = new Phaser.GameObjects.Container(this.scene, 0, -30); 
	this.add(this.prize_content);
	this.cards_holder = new Phaser.GameObjects.Container(this.scene, 0, 0); 
	this.prize_content.add(this.cards_holder);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'star_chest_open', 'phrase_id': '1', 'values': [], 'base_size': 40});
	this.info_txt = new Phaser.GameObjects.Text(this.scene, 0, 110, res['text'], {fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3});
	this.info_txt.setOrigin(0.5);
	this.prize_content.add(this.info_txt);		
	this.prize_content.visible = false;

	this.prize_header = new Phaser.GameObjects.Container(this.scene, 0, -30); 
	this.add(this.prize_header);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'video_icon2');
	this.prize_header.add(temp);
	temp.setInteractive({useHandCursor: true})
	temp.on('pointerdown', this.handler_watch, this);
	this.header_logo = new Phaser.GameObjects.Image(this.scene, 0, 30, 'common1', 'money_ico');
	this.prize_header.add(this.header_logo);


	var button_txt
	this.button_watch = new CustomButton(this.scene, 0, 250, this.handler_watch, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	this.add(this.button_watch);	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'video_reward', 'phrase_id': '4', 'values': [], 'base_size': 23});
	button_txt = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3, 'align': 'center', wordWrap:{'width': 220}});			
	button_txt.setOrigin(0.5);
	button_txt.setLineSpacing(-5);
	this.button_watch.add(button_txt);
	
	this.progress_bar = new Phaser.GameObjects.Container(this.scene, -212, 130); 
	this.progress_bar_top = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'video_reward_progressbar1');
	this.progress_bar_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'video_reward_progressbar2');
    this.progress_bar_line = new Phaser.GameObjects.Image(this.scene, 4, 1, 'common2', 'video_reward_progressbar3');
    this.progress_bar_bg.setOrigin(0,0);
	this.progress_bar_line.setOrigin(0,0);
	this.progress_bar_top.setOrigin(0,0);
    this.progress_bar.max_scale = (this.progress_bar_bg.width - 8) / this.progress_bar_line.width
    this.progress_bar_line.scaleX =  1;// this.line_scale;
    
    this.progress_bar.add(this.progress_bar_bg);
    this.progress_bar.add(this.progress_bar_line);
	this.progress_bar.add(this.progress_bar_top);
	this.progress_bar.txt = new Phaser.GameObjects.Text(this.scene, 212, 28, '', { fontFamily: 'font1', fontSize: 40, color: '#FEDC9C', stroke: '#000000', strokeThickness: 5});
	this.progress_bar.txt.setOrigin(0.5);
	this.progress_bar.add(this.progress_bar.txt);
	
	this.add(this.progress_bar);
	temp = new Phaser.GameObjects.Image(this.scene, 245, 160, 'common1', 'booster1_active');
	temp.scale = 0.9;
	this.add(temp);
	this.update_progress(true);
},	

update_progress(quick = false) {
	var new_scale = game_data['user_data']['rewarded_video']['amount'] / game_data['rewarded_video_settings']['max_per_day'] * this.progress_bar.max_scale;
	if (new_scale < 1) new_scale = 1;
	if (quick) this.progress_bar_line.scaleX = new_scale;
	else game_data['scene'].tweens.add({targets: this.progress_bar_line, scaleX: new_scale, duration: 300});
	var delay = quick ? 10 : 250;
	setTimeout(() => {
		if (this.scene && this.progress_bar && this.progress_bar.txt) {
			var s = String(game_data['user_data']['rewarded_video']['amount']) + ' / ' + String(game_data['rewarded_video_settings']['max_per_day']);
			this.progress_bar.txt.text =  s
		}
	}, delay);
	this.button_watch_avail = game_data['user_data']['rewarded_video']['amount'] < game_data['rewarded_video_settings']['max_per_day'];
	if (quick) this.button_watch.visible = this.button_watch_avail;
	if (!this.button_watch_avail && !this.has_update_progress) {
		var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'video_reward', 'phrase_id': '5', 'values': [], 'base_size': 50});
		var txt = new Phaser.GameObjects.Text(this.scene, 0, this.button_watch.y, res['text'], {fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3});				
		txt.setOrigin(0.5);
		this.add(txt);

	}
	this.has_update_progress = true;
},

handler_watch() {
	var _this = this;
	if (this.allow_click && game_data['user_data']['rewarded_video']['amount'] < game_data['rewarded_video_settings']['max_per_day']) {
		this.allow_click = false;
		//alert('handler_watch')
		var tid = setTimeout(() => {this.allow_click = true;}, 2000);
		
		game_data['utils'].show_rewarded_ad(function(res){
			clearTimeout(tid);
			_this.allow_click = true;
			//alert('watch_result ' + JSON.stringify(res))
			if (res['success']) {
				_this.switch_interface(false);
				game_data['game_request'].request( {'collect_video_reward': true}, function(obj) 	{
					if ('success' in obj && obj['success']) { 
						if (obj['boosters']) {
							_this.show_boosters = true;
							_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'boosters_info'});
						}
						if (obj['rewarded_video']) game_data['user_data']['rewarded_video'] = obj['rewarded_video'];
						if (game_data['user_data']['rewarded_video']['amount'] >= game_data['rewarded_video_settings']['max_per_day']) _this.max_per_day = true;
						
						var prize = obj['prize'];
						var amount = prize['amount'];
						if (_this.max_per_day) {
							var prize = game_data['rewarded_video_settings']['prize']['special'];
							amount = game_data['boosters'][prize['type']]['price'] * prize['amount'];
							_this.emitter.emit('EVENT', {'event': 'unblock_close'});
						}
						else {
							if (_this.scene) _this.show_cards(prize)
						}
						if (_this.scene) {
							_this.update_progress();
							if (_this.max_per_day) setTimeout(() => {_this.handler_close();}, 350);
						}
						game_data['utils'].update_stat({'type': 'video_money', 'collect_video_reward': true, 'amount_inc': amount, 'prize_amount': prize['amount'], 'prize_type': prize['type']});
					}
					else {
						if (obj['rewarded_video']) game_data['user_data']['rewarded_video'] = obj['rewarded_video'];
						_this.handler_close();
					}
					//game_data['game_map'].update_video_button();
				});
			}
			else if (res['cancel_video']) {
				_this.switch_interface(true);
			}
			else {
				var pt = game_data['utils'].toGlobal(_this.header_logo, new Phaser.Geom.Point(0, 0));
				game_data['utils'].show_tip({'pt': pt, 'forced': true, 'scene_id': 'game_windows', 'item_id': 'no_video', 'phrase_id': '2', 'values': []});
			}
		});
	}
},

show_cards(prize) {
	this.prize_pos = 0;
	var prizes_array = game_data['rewarded_video_settings']['prize']['common']['amount'];
	var pos;
	this.prizes = [prize['amount']];
	while (this.prizes.length < 3) {
		pos = parseInt(Math.random() * prizes_array.length);
		this.prizes.push(prizes_array[pos]);
	}
	this.cards_holder.removeAll(true);
	this.prize_content.visible = true;
	this.prize_content.alpha = 0;
	game_data['scene'].tweens.add({targets:this.prize_content, alpha: 1, duration: 100});
	//this.prize_content.scale = 0.01;
	var prize_x = [-140, 140, 0];
	var i;
	this.cards = [];
	for (i = 0; i < prize_x.length; i++) {
		var card = new Phaser.GameObjects.Container(this.scene, 0, 0);
		card.holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
		card.add(card.holder);
		card.shirt = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card_shirt');
		card.holder.add(card.shirt);
		card.closed = true;
		card.has_prize = false;
		//card.amount = this.prizes[i];
		card.scale = 0.05;
		card.alpha = 0;
		this.cards_holder.add(card);
		this.cards.push(card);
		this.bind_card(prize_x[i], i, card);
	}
},

bind_card(_x, _i, card) {
	setTimeout(() => {
		if (this.scene) {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'select_card'});
			game_data['scene'].tweens.add({targets:card, alpha: 1, duration: 100});
			game_data['scene'].tweens.add({targets:card, scale: 1, duration: 600, ease: 'Back.easeOut'});
			game_data['scene'].tweens.add({targets:card, x: _x, duration: 500, ease: 'Sine.easeOut'});
		}
	}, _i * 200 + 300);
	card.shirt.setInteractive({useHandCursor: true});
	card.shirt.on('pointerdown', ()=>{if (this.prize_pos < 1) this.open_card(card)}, this);
},

open_card(card) {
	if (this.prize_pos < this.prizes.length) {
		var _this = this;
		this.assign_card(card);
		if (this.prize_pos == 1) {
			this.pt_start = game_data['utils'].toGlobal(card, new Phaser.Geom.Point(0, -20));
			game_data['scene'].tweens.add({targets:card, scale: 1.2, delay: 500, duration: 400, ease: 'Back.easeOut'});
			setTimeout(() => { 
				this.open_all_cards(); 
			}, 300);
			this.display_firework(this.pt_start);
			setTimeout(() => {
				if (this.scene) this.fly_money();
			}, 1000);
		}
		card.closed = false;
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'open_card'});
		
		game_data['scene'].tweens.add({targets:card.holder, scaleX: 0, duration: 200, ease: 'Sine.easeIn', onComplete: function(){
			card.holder.removeAll();
			card.holder.add(card.content);
			game_data['scene'].tweens.add({targets:card.holder, scaleX: 1, duration: 200, ease: 'Sine.easeOut', onComplete: function(){
			}});
		}});
	}
},

display_firework(pt) {
	var pt_start = game_data['utils'].toLocal(game_data['moving_holder'], pt);
	//pt_start.y -= 20;
	var prtcl = game_data['scene'].add.particles('common1', 'particle11');
	var timeout = 700;
	
	game_data['moving_holder'].add(prtcl);
	prtcl.createEmitter({
		x: pt_start.x,
		y: pt_start.y,
		
		angle: { min: 0, max: 360 },
		speed: 300,
		gravityY: 300,
		gravityX: 0,
		lifespan: timeout,
		quantity: 4,
		maxParticles: 60,
		scale: { start: 2, end: 0.1 },
		//blendMode: 'ADD'
	});
	setTimeout(() => {
		prtcl.destroy();
	}, timeout * 2);

},

open_all_cards() {
	for (var i = 0; i < this.cards.length; i++) {
		if (this.cards[i].closed) this.open_card(this.cards[i]);
	}
	
},

assign_card(card) {
	var prize = this.prizes[this.prize_pos];
	
	var key;
	card.content = new Phaser.GameObjects.Container(this.scene, 0, 0);
	var temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card_money');
	card.content.add(temp);
	temp = new Phaser.GameObjects.Text(this.scene, 0, 43, String(prize), {fontFamily: 'font1', fontSize: 28, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	card.content.add(temp);
	card.prize = prize;
	this.prize_pos += 1;
	if (this.prize_pos <= 1) {
		card.has_prize = true;
		
	}
	else {
		temp =  new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card');
		temp.alpha = 0.85;
		card.content.add(temp);
	}
	
	
},

fly_money() {
	var _this = this;
	setTimeout(function() {
		game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
	},game_data['utils'].get_sound_delay(1));
	var start_pt = this.pt_start;
	//start_pt = game_data['utils'].toGlobal(_this, start_pt);
	game_data['utils'].fly_items({'amount': 1,								
							'holder': _this,
							'item_atlas': 'common1',
							'item_name': 'money_ico',
							'pt_start': start_pt,
							'pt_end': game_data['game_map'].get_money_pt()
							}, 
	function(){
		_this.emitter.emit('EVENT', {'event': 'update_money'});
		setTimeout(() => {
			_this.switch_interface(true);	
		}, 500);
		
	});
	
},
switch_interface(show_button = true) {
	if (this.scene) {
		if (show_button) {
			var _this = this;
			game_data['scene'].tweens.add({targets:this.prize_content, alpha: 0, duration: 100, onComplete: function(){
				if (_this.scene) {
					_this.prize_content.visible = false;
					_this.button_watch.alpha = 0;
					_this.prize_header.alpha = 0;
					_this.button_watch.visible = _this.button_watch_avail;
					_this.prize_header.visible = true;
					game_data['scene'].tweens.add({targets:_this.button_watch, alpha: 1, duration: 100});
					game_data['scene'].tweens.add({targets:_this.prize_header, alpha: 1, duration: 100});
				}
				
			}});
		}
		else {
			this.button_watch.visible = false;
			this.prize_header.visible = false;
			this.emitter.emit('EVENT', {'event': 'block_close', 'timeout': 1000});
		}
	}
},

handler_close(params) {  
	this.close_window();
},

close_window(params) { 
	this.emitter.emit('EVENT', {'event': 'window_close'});
	this.emitter.emit('EVENT', {'event': 'update_money'});
},	

destroy_window() {
	if (this.scene) this.removeAll(true)
}

});