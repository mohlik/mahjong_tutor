var StarChest = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function StarChest (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	this.allow_click = false;
	this.allow_close = false;
	game_data['prize_mod'] = true;
	this.prize_mod = true;
	var res = params['result'];
	this.prizes = res['prizes'];
	this.prize_pos = 0;
	var _this = this;

	if ('tasks' in res) game_data['user_data']['tasks'] = res['tasks'];
	if ('money' in res) {
		game_data['user_data']['money'] = res['money'];
		_this.add_money = true;
	}
	if ('boosters' in res) {
		game_data['user_data']['boosters'] = res['boosters'];
		_this.add_boosters = true;
	}
	

	this.button_take = new CustomButton(this.scene, 0, 320, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this); 
	this.add(this.button_take);
	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'map_prize', 'phrase_id': '1', 'values': [], 'base_size': 30});		
	var temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_take.add(temp);
	this.button_take.visible = false;
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tree_prize'});
		if (_this.scene) _this.show_chest(function() {
			if (_this.scene) _this.show_cards();
		});
	}, 100);
	

	
},	

show_chest(on_complete) {
	var _this = this;
	this.chest_cont = new Phaser.GameObjects.Container(this.scene, -370, -60);
	this.chest_cont.alpha = 0;
	this.add(this.chest_cont);
	var box = this.chest_cont;
	var bg =  new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'stars_box1');
	this.chest_cont.add(bg);
	var top =  new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'stars_box2');
	this.chest_cont.add(top);
	top.alpha = 0;
	top.visible = false;
	this.chest_pt = new Phaser.Geom.Point(box.x, box.y);
	var pt_start = game_data['utils'].toLocal(this, game_data['game_map'].get_star_chest_pt());
	var pt_end = new Phaser.Geom.Point(box.x, box.y);
	var pt_mid = new Phaser.Geom.Point(pt_start.x + 200, pt_start.y + 500);
	box.x = pt_start.x;
	box.y = pt_start.y;
	box.scale = 0.2;
	game_data['scene'].tweens.add({targets: box, alpha: 1, duration: 20});
	game_data['scene'].tweens.add({targets: box, scale: 1, duration: 550});
	game_data['utils'].bezier(pt_start, pt_mid, pt_end, box, 700, 'Sine.easeInOut', _this, function(){
		game_data['utils'].chest_jump(box, function() {
			top.visible = true;
			game_data['scene'].tweens.add({targets: bg, alpha: 0, duration: 50, delay: 150});
			game_data['scene'].tweens.add({targets: top, alpha: 1, duration: 200, onComplete: function() {
				on_complete();
			}});
		})
	});

},

show_cards() {
	pos = [
		{'x': 460, 'y': 70}, {'x': 460, 'y': -130}, {'x': 330, 'y': 70}, {'x': 330, 'y': -130}, {'x': 200, 'y': 70},
		{'x': 200, 'y': -130}, {'x': 70, 'y': 70}, {'x': 70, 'y': -130}, {'x': -60, 'y': 70}, {'x': -60, 'y': -130}
	];
	var i;
	this.cards = [];
	var y_mod = -30;
	for (i = 0; i < pos.length; i++) {
		pos[i].y += y_mod;
		var card = new Phaser.GameObjects.Container(this.scene, this.chest_pt.x, this.chest_pt.y);
		card.holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
		card.add(card.holder);
		card.shirt = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card_shirt');
		card.holder.add(card.shirt);
		card.closed = true;
		card.has_prize = false;
		card.scale = 0;
		this.add(card);
		this.cards.push(card);
		this.bind_card(pos, i, card);
	}

	this.info = new Phaser.GameObjects.Container(this.scene, 0, 155);
	this.info.alpha = 0;
	this.add(this.info);
	var res = res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'star_chest_open', 'phrase_id': '1', 'values': [], 'base_size': 50});	
	var temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], {fontFamily: 'font1', fontSize: res['size'], color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	this.info.add(temp);
	
	this.info.txt = new Phaser.GameObjects.Text(this.scene, 0, 70, '(0/3)', {fontFamily: 'font1', fontSize: 55, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});
	this.info.txt.setOrigin(0.5);
	this.info.add(this.info.txt);
	setTimeout(() => {
		game_data['scene'].tweens.add({targets:this.info, alpha: 1, duration: 300});
		this.allow_click = true;
	}, 2000);
	game_data['game_map'].update_star_chest();
},

bind_card(pos, _i, card) {
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'select_card'});
		game_data['scene'].tweens.add({targets:card, scale: 1, duration: 600, ease: 'Back.easeOut'});
		game_data['scene'].tweens.add({targets:card, x: pos[_i].x, y: pos[_i].y, duration: 500, ease: 'Sine.easeOut'});
	}, _i * 200);
	card.shirt.setInteractive({useHandCursor: true});
	card.shirt.on('pointerdown', ()=>{if (card.closed && this.allow_click && this.prize_pos < 3) this.open_card(card)}, this);
},

open_card(card) {
	if (this.prize_pos < this.prizes.length) {
		var _this = this;
		this.assign_card(card);
		if (this.prize_pos == 3) {
			setTimeout(() => {
				this.open_all_cards();
			}, 300);
		}
		card.closed = false;
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'open_card'});
		
		game_data['scene'].tweens.add({targets:card.holder, scaleX: 0, duration: 200, ease: 'Sine.easeIn', onComplete: function(){
			if (_this.prize_pos <= 3) _this.info.txt.text = '(' + String(_this.prize_pos) + '/3)';
			card.holder.removeAll();
			card.holder.add(card.content);
			game_data['scene'].tweens.add({targets:card.holder, scaleX: 1, duration: 200, ease: 'Sine.easeOut', onComplete: function(){
			}});
		}});
	}
	else this.allow_close = true;

	if (this.prize_pos >= this.prizes.length) {
		this.allow_close = true;
		this.open_complete = true;
		this.button_take.alpha = 0;
		this.button_take.visible = true;
		game_data['scene'].tweens.add({targets:this.button_take, alpha: 1, duration: 300});
		
	}
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
	var temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card_' + prize['type']);
	card.content.add(temp);
	var txt_y = 45;
	temp = new Phaser.GameObjects.Text(this.scene, 0, txt_y, prize['amount'], {fontFamily: 'font1', fontSize: 28, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	card.content.add(temp);
	card.prize = prize;
	this.prize_pos += 1;
	if (this.prize_pos <= 3) {
		card.has_prize = true;
		
	}
	else {
		temp =  new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'locked_card');
		temp.alpha = 0.85;
		card.content.add(temp);
	}
	
	
},

handler_take() {
	var _this = this;
	var pt_end;
	
	if (this.add_money) {
		var first = true;
		pt_end = game_data['game_map'].get_money_pt();
		for (var i = 0; i < this.prizes.length; i++) {
			var card = this.cards[i]
			if (card.has_prize && card.prize['type'] == 'money') {
				setTimeout(function() {
					game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
				},game_data['utils'].get_sound_delay(2));
				var pt_start = game_data['utils'].toGlobal(card, new Phaser.Geom.Point(0,-40));
				game_data['utils'].fly_items({'amount': 2,
											'holder': game_data['moving_holder'],
											'item_atlas': 'common1',
											'item_name': 'coin',
											'pt_start': pt_start,
											'pt_end':pt_end								
											}, 
				function(){
					if (_this.scene && first) {
						first = false;
						var arr = [{'event': 'window_close'}, {'event': 'update_money'}];
						if (_this.add_boosters) arr.push({'event': 'show_window', 'window_id': 'boosters_info'});
						_this.emitter.emit('EVENT', {'events': arr});
					}
				});
			}
		}
		
		
	}
	else if (this.add_boosters) {
		this.emitter.emit('EVENT', {'events': [{'event': 'window_close'}, {'event': 'show_window', 'window_id': 'boosters_info'}]});
	}
	
},

handler_close(params) {  
	this.close_window(params);
},

close_window(params) {  
	if (this.allow_close) {
		this.allow_close = false;
		if (this.open_complete) this.handler_take();
		else {
			this.emitter.emit('EVENT', {'event': 'window_close'});
		}
	}
},	

});