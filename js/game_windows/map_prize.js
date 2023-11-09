var MapPrize = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function MapPrize (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	this.allow_close = true;
	game_data['prize_mod'] = true;
	this.prize_mod = true;
	this.params = params;
	this.info = params['info'];
	var res = params['info'];
	var _this = this;
	_this.prizes = res['prizes'];
	if ('collected_map_prizes' in res) game_data['user_data']['collected_map_prizes'] = res['collected_map_prizes']
	if ('money' in res) {
		game_data['user_data']['money'] = res['money'];
		_this.add_money = true;
	}
	if ('boosters' in res) {
		game_data['user_data']['boosters'] = res['boosters'];
		_this.add_boosters = true;
	}
	_this.open_start = true;
	_this.allow_close = false;

	this.button_take = new CustomButton(this.scene, 0, 320, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this); 
	this.add(this.button_take);
	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'map_prize', 'phrase_id': '1', 'values': [], 'base_size': 30});		
	var temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_take.add(temp);
	this.button_take.visible = false;
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'tree_prize'});
		if (_this.scene) _this.show_gift(function() {
			_this.allow_close = true;
			_this.open_complete = true;
			_this.button_take.alpha = 0;
			_this.button_take.visible = true;
			game_data['scene'].tweens.add({targets:_this.button_take, alpha: 1, duration: 300});
		});
	}, 500);
	

	
},	


show_gift(on_complete) {
	var _this = this;
	this.logos = [];
	var pref = this.prizes.length == 1 ? 'gift1' : 'gift2';
	var box = new Phaser.GameObjects.Container(this.scene, 0, 70);
	var dx = box.x;
	var dy = box.y;
	this.add(box);
	box.alpha = 0;
	box.part1 = new Phaser.GameObjects.Image(this.scene, 0, -61, 'common2', pref + '_3');
	box.add(box.part1)
	box.shine = new Phaser.GameObjects.Image(this.scene, 0, -45, 'common2', 'gift1_2');
	box.shine.alpha = 0;
	box.shine.scale = 0.2;
	box.add(box.shine)
	box.part2 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', pref + '_1');
	box.add(box.part2)
	var _y = this.prizes.length == 1 ? -90 : -70;
	box.cap = new Phaser.GameObjects.Image(this.scene, 0, _y, 'common2', pref + '_4');
	box.add(box.cap);

	game_data['scene'].tweens.add({targets:box, alpha: 1, duration: 150, onComplete: function() {
		game_data['scene'].tweens.add({targets:box, x: dx + Math.random() * 10, y: dy + Math.random() * 8 - 4, duration: 80, yoyo: true});
		game_data['scene'].tweens.add({targets:box, x: dx - Math.random() * 10, y: dy + Math.random() * 8 - 4, duration: 80, yoyo: true, delay: 170});
		game_data['scene'].tweens.add({targets:box, x: dx + Math.random() * 10, y: dy + Math.random() * 8 - 4, duration: 80, yoyo: true, delay: 340});
		game_data['scene'].tweens.add({targets:box, x: dx - Math.random() * 10, duration: 80, yoyo: true, delay: 510});
		game_data['scene'].tweens.add({targets:box, y: dy + 30, scaleY: 0.9, delay: 600, duration: 120, onComplete: function() {
			game_data['scene'].tweens.add({targets:box, y: dy - 30, scaleY: 1.1, duration: 200, onComplete: function() {
				game_data['scene'].tweens.add({targets:box, y: dy, scaleY: 1, duration: 100});
				game_data['scene'].tweens.add({targets:box.cap, y: box.cap.y - 200, duration: 400});
				var _x =box.cap.x + Math.random() * 260 - 130;
				var _a = 0;
				if (_x > 0) _a = 30;
				else _a = -30; 
				game_data['scene'].tweens.add({targets:box.cap, x: _x, angle: _a, duration: 350, delay: 100});
				game_data['scene'].tweens.add({targets:box.cap, alpha: 0, duration: 100, delay: 350});

				game_data['scene'].tweens.add({targets:box.shine, alpha: 1, duration: 100, delay: 200});
				game_data['scene'].tweens.add({targets:box.shine, y: box.shine.y - 20, scale: 1.2, duration: 400, delay: 200, onComplete: function() {
					game_data['scene'].tweens.add({targets:box.shine, scale: 1, duration: 200, onComplete: function() {
						game_data['scene'].tweens.add({targets:box, alpha: 0, duration: 200});
					}});
					if (_this.scene) {
						var timeout = 0;
						var pos = [{'x': 0, 'y': -40}];
						if (_this.prizes.length > 1) pos = [{'x': -300, 'y': -60}, {'x': 300, 'y': -60}, {'x': 0, 'y': -60}]
						//if (_this.prizes.length > 1) pos = [{'x': 0, 'y': -250}, {'x': -150, 'y': 70}, {'x': 150, 'y': 70}]
						for (var i = 0; i < _this.prizes.length; i++) {
							var func = (i + 1 == _this.prizes.length) ? on_complete : null;
							var prize = _this.prizes[i];
							
							_this.anim_new_gift(prize, pos[i], timeout, func);
							timeout += 200;
						}
					}
				}});
			}});
		}});
	}});

},

anim_new_gift(prize, pos, timeout, on_complete) {
	setTimeout(() => {
		var _this = this;
		var logo, logo2, txt_amount, txt_desc;
	var phrase = prize['type'];
	var desc_val = '';
	var cont = new Phaser.GameObjects.Container(this.scene, 0, 10);
	this.add(cont);
	cont.alpha = 0;
	cont.scale = 0.2;
	var bg = new Phaser.GameObjects.Image(this.scene, 0, 30, 'common2', 'shop_panel_over3');
	cont.add(bg);
	txt_amount = new Phaser.GameObjects.Text(this.scene, 0, 100, String(prize['amount']), {fontFamily: 'font1', fontSize: 60, color:'#F5F75E', stroke: '#B0880D', strokeThickness: 3});				
	txt_amount.setOrigin(0.5);
	switch (prize['type']) {
		case 'money':
			logo = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'money_ico');
			txt_amount.text = '+' + txt_amount.text;
			desc_val = prize['amount'];
			this.logos.push(logo);
		break;
		default:
			if (prize['type'] in game_data['user_data']['boosters']) {
				phrase = 'booster';
				logo = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', prize['type'] + '_active');
				txt_amount.text = '+' + txt_amount.text;
			}
		break;
	}
	var res = game_data['utils'].generate_string({'scene_id': 'event', 'item_id': 'prize_desc', 'phrase_id': phrase, 'values': [desc_val], 'base_size': 50});
	txt_desc = new Phaser.GameObjects.Text(this.scene, 0, 170, res['text'], {fontFamily: 'font1', fontSize: res['size'], color:'#A4280E', align: 'center', wordWrap: {width: 300}, stroke: '#f6f39c', strokeThickness: 4});
	txt_desc.setOrigin(0.5, 0);
	
	this.logo = logo;
	this.prize_cont = cont;
	cont.add(logo);
	if (logo2) cont.add(logo2);
	cont.add(txt_amount);
	cont.add(txt_desc);
	txt_amount.alpha = 0;
	txt_desc.alpha = 0;
		game_data['scene'].tweens.add({targets:cont, alpha: 1, duration: 150});
		game_data['scene'].tweens.add({targets:cont, x: pos.x, duration: 450});
		game_data['scene'].tweens.add({targets:cont, scale: 1.1, y: pos.y - 20, duration: 300, onComplete: function(){
			game_data['scene'].tweens.add({targets:cont, scale: 0.9, y: pos.y, duration: 200, onComplete: function(){
				game_data['scene'].tweens.add({targets:cont, scale: 1, duration: 150});
			}});
			game_data['scene'].tweens.add({targets:txt_amount, alpha: 1, duration: 200, delay: 500});
			game_data['scene'].tweens.add({targets:txt_desc, alpha: 1, duration: 200, delay: 800});
			setTimeout(() => {
				if (on_complete) on_complete();
			}, 800);
		}});
	}, timeout);
	

},

handler_take() {
	var _this = this;
	var pt_end;
	
	var events =  [{'event': 'window_close'}, {'event': 'update_money'}];
	if (this.add_boosters) events.push({'event': 'show_window', 'window_id': 'boosters_info'})
	if (this.add_money) {
		pt_end = game_data['game_map'].get_money_pt();
		setTimeout(function() {
			game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_hearts'});
		},game_data['utils'].get_sound_delay(2));

		for (i = 0; i < _this.logos.length; i++) {
			var logo = _this.logos[i];
			var pt_start = game_data['utils'].toGlobal(logo, new Phaser.Geom.Point(0, 0));
			game_data['utils'].fly_items({'amount': 2,
									'holder': game_data['moving_holder'],
									'item_atlas': 'common1',
									'item_name': 'coin',
									'pt_start': pt_start,
									'pt_end':pt_end								
									}, 
			i == _this.logos.length - 1 ? 
			function(){
				
				if (_this.scene) _this.emitter.emit('EVENT', {'events': events});
			} : function() {});
		}
		
	}
	else if (this.add_boosters) {
		this.emitter.emit('EVENT', {'events': events});
	}
	
},

handler_close(params) {  
	this.close_window(params);
},

close_window(params) {  
	if (this.allow_close) {
		this.allow_close = false;
		if (this.open_complete) this.handler_take();
		else if (this.open_start) this.emitter.emit('EVENT', {'events': [{'event': 'window_close'},  {'event': 'update_money'}]});
		else this.emitter.emit('EVENT', {'event': 'window_close'});
	}
},	

});