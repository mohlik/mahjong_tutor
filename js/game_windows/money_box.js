var MoneyBox = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function MoneyBox ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	
	var temp;
	var _this = this;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);
	var i;
	var logo;
	
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'money_box_panel');
	this.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'money_box', 'phrase_id': '1', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	this.money_pt = params['money_pt']
	this.item_info = null;
	for (i = 0; i < game_data['shop'].length; i++) {
		if (game_data['shop'][i]['type'] == 'money_box') {
			this.item_info = game_data['shop'][i];
			break;
		}
	}

	var current_amount = game_data['utils'].get_moneybox();
	var max_amount = game_data['money_box']['capacity'];
	var create_free = !game_data['in_app_items']
	if (create_free) {
		this.button_break = new CustomButton(_this.scene, 0, 290, _this.handler_break_free, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		this.add(this.button_break);	
		var res = game_data['utils'].generate_string({'scene_id': 'game_windows','item_id': 'money_box','phrase_id': '31','values': [],'base_size': 22});	
		var button_txt = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], {fontFamily:"font1", fontSize: res['size'], color:'#f6caa0', stroke: '#000000', strokeThickness: 3});				
		button_txt.setOrigin(0.5);
		this.button_break.add(button_txt);
		this.allow_break = current_amount >= max_amount;
		//this.button_break.alpha = current_amount >= max_amount ? 1 : 0.5;
		this.button_break.visible = current_amount >= max_amount
	} 
	else {
		this.button_break = new CustomButton(_this.scene, 0, 290, _this.handler_break, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		this.add(this.button_break);	
		var res = game_data['utils'].generate_string({'scene_id': 'game_windows','item_id': 'money_box','phrase_id': '3','values': [this.item_info['price']],'base_size': 22});	
		var button_txt = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], {fontFamily:"font1", fontSize: res['size'], color:'#f6caa0', stroke: '#000000', strokeThickness: 3});				
		button_txt.setOrigin(0.5);
		this.button_break.add(button_txt);
		//loading_vars['net_id'] = 'vk';
		if ('net_id' in loading_vars && (loading_vars['net_id'] == 'ok' || loading_vars['net_id'] == 'vk')) {
			var currency = new Phaser.GameObjects.Image(this.scene, 0, 0, loading_vars['net_id'] + '_currency');
			var scale = 30 / currency.height;
			currency.setScale(scale, scale);
			button_txt.x -= currency.width  * scale / 2;
			currency.x = button_txt.x + button_txt.width / 2 + currency.width * scale / 2;
			currency.y = button_txt.y ;
			this.button_break.add(currency);
		}
		else {
			button_txt.text = button_txt.text + " $";
		}
		this.allow_break = current_amount > 0;
		this.button_break.visible = current_amount > 0;
	}
	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows','item_id': 'money_box','phrase_id': '4','values': [current_amount],'base_size': 32});
	var info_txt = new Phaser.GameObjects.Text(this.scene, 0, -102, res['text'], {fontFamily:"font1", fontSize: res['size'], color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
	info_txt.setOrigin(0.5);			
	this.add(info_txt);	

	logo = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'diamond_ico_big');	
	info_txt.x -= logo.width / 2;	
	logo.x = info_txt.x + info_txt.width / 2 + logo.width / 2;
	logo.y = info_txt.y;
	info_txt.x += 20;
	this.add(logo);

	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows','item_id': 'money_box','phrase_id': '2','values': [max_amount],'base_size': 26});
	var info2_txt = new Phaser.GameObjects.Text(this.scene, 0, 220, res['text'], {fontFamily:"font1", fontSize: res['size'], color:'#f6caa0', stroke: '#000000', strokeThickness: 3});
	info2_txt.setOrigin(0.5);	
	this.add(info2_txt);	

	logo = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'money_ico_btn');
	info2_txt.x -= logo.width / 2;	
	logo.x = info2_txt.x + info2_txt.width / 2  + logo.width / 2;
	logo.y = info2_txt.y;
	this.add(logo);

	this.pig = new Phaser.GameObjects.Image(this.scene, 0, 25, 'common2', 'pig_big');
	this.add(this.pig);
	if (current_amount > 0) setTimeout(() => {
		this.shake_pig(this.pig);
	}, 500);


	var _this = this;
	this.get_anim(function(anim) {
		anim.visible = false;
		anim.x = 0;
		anim.y = 25;
		_this.add(anim);
		_this.anim = anim;
	});


},

get_anim(on_complete) {
	if (!(game_data['loaded_anims'] && game_data['loaded_anims']['money_box_pig']) ) { 
		var loader = new Phaser.Loader.LoaderPlugin(this.scene);
		loader.spine('money_box_pig', game_data['urls']['assets'] + 'money_box_pig.json', game_data['urls']['assets'] + 'money_box_pig.atlas');   
		loader.once('complete', function(){
			game_data['loaded_anims']['money_box_pig'] = true;
			var anim = game_data['scene'].add.spine(-200,-200, 'money_box_pig');
			on_complete(anim);
			loader.destroy();
		});
		loader.start();
	}
	else if (game_data['loaded_anims'] && game_data['loaded_anims']['money_box_pig']) {
		var anim = game_data['scene'].add.spine(-500,-500, 'money_box_pig');
		on_complete(anim);
	}
},

shake_pig(mc) {
	var _this = this;
	game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'pig_shake'});
	game_data['scene'].tweens.add({targets: mc, y: mc.y - 10, duration: 50, onComplete: function(){
		_this.shake_to_left(mc, function() {
			_this.shake_to_right(mc, function() {
				_this.shake_to_left(mc, function() {
					_this.shake_to_right(mc, function() {
						game_data['scene'].tweens.add({targets: mc, y: mc.y + 10, duration: 50});
					});
				});
			});
		})
	}}); 

},

shake_to_left(mc, on_complete) {
	var _this = this;
	var half_time = 100;
	var _x, _y;
	_x = mc.x;
	_y = mc.y;
	game_data['scene'].tweens.add({targets: mc, x: _x - 15, y: _y + 8, angle: -8, duration: half_time, onComplete: function(){
		game_data['scene'].tweens.add({targets: mc, x: _x, y: _y, angle: 0, duration: half_time, onComplete: function(){
			on_complete();
		}}); 
	}}); 

},
shake_to_right(mc, on_complete) {
	
	var half_time = 100;
	var _x, _y;
	_x = mc.x;
	_y = mc.y;
	game_data['scene'].tweens.add({targets: mc, x: _x + 15, y: _y + 8, angle: 8, duration: half_time, onComplete: function(){
		game_data['scene'].tweens.add({targets: mc, x: _x, y: _y, angle: 0, duration: half_time, onComplete: function(){
			on_complete();
		}}); 
	}}); 
	
},


handler_break_free() {
	var _this = this;	
	if (this.allow_break) {
		this.allow_break = false;
		game_data['utils'].update_stat({ 'money_box_free': true, 'amount_inc': game_data['utils'].get_moneybox(), });
		game_data['game_request'].request({ 'money_box_free': true, 'amount': game_data['utils'].get_moneybox() }, function(res) {
			if ('success' in res && res['success']) {
				_this.display_pig_break();
				game_data['task_manager'].update_tasks({'type': 'buy_moneybox', 'amount':1});
			}
			else _this.handler_close();
		});
	}
},

handler_break() { 
	var _this = this;	
	if (this.allow_break) {
		this.allow_break = false;
		game_data['utils'].update_stat({'type': 'purchase_start', 'description': _this.item_info['item_id']});
		game_data['utils'].start_purchase_item({		
			'item_info': this.item_info}, function(payment_info){
				if ('success' in payment_info && payment_info['success']) {		
					game_data['utils'].update_stat({'update_purchase': true, 'item_info': _this.item_info});
					// game_data['utils'].update_stat({'type': 'purchase_complete', 'description': _this.item_info['item_id']
					// 								,'amount_inc': game_data['utils'].get_moneybox(), 'amount_dec': _this.item_info['price']});			
					game_data['game_request'].request({'update_purchase': true, 'item_info': _this.item_info}, function(res){	

						game_data['task_manager'].update_tasks({'type': 'buy_moneybox', 'amount':1});
						if (_this.scene) _this.display_pig_break();
						game_data['game_map'].update_sale();
					});					
				}
				else {
					var _id = (is_localhost || navigator.onLine)? 'purchase_failed' : 'no_connection';
					game_data['utils'].update_stat({'type': 'purchase_failed', 'description': _this.item_info['item_id']});
					_this.allow_break = true;
					_this.emitter.emit('EVENT', {'events': [{'event': 'window_close', 'immediate': true}, 
															{'event': 'show_window', 'window_id': _id}
					]});
				}			
		});
	}
},


display_pig_break() {	
	var _this = this;
	if (this.anim) {
		this.anim.visible = true;
		var pt = new Phaser.Geom.Point(_this.pig.x - 20, _this.pig.y + _this.pig.height / 3);







		pt = game_data['utils'].toGlobal(_this, pt);
		this.pig.destroy();
		this.anim.on('complete', ()=> {
			setTimeout(function() {
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
			},game_data['utils'].get_sound_delay(3));
			if (_this.scene) game_data['utils'].fly_items({'amount': 8,								
									'holder': _this,
									'item_atlas': 'common1',
									'item_name': 'money_ico',
									'pt_start': pt,
									'pt_end': _this.money_pt	
									}, 
			function(){
				// if (game_data['share_active']) game_data['utils'].make_share('money_box');
				if (_this.scene) _this.emitter.emit('EVENT', {'events': [{'event': 'window_close'}, 												 
													{'event': 'update_money'},
													{'event': 'update_money_box'},
													]});		
			});
		});
		this.anim.play('animation', false);
		setTimeout(() => {
			game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'break_pig'});
		}, 1200);
		
	}
	else {
		if (_this.scene) _this.emitter.emit('EVENT', {'events': [{'event': 'window_close'}, 												 
													{'event': 'update_money'},
													{'event': 'update_money_box'}
													]});
	}

},

handler_close(params) {  
	this.close_window();
},


close_window(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});