var Sales = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Sales ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	this.tweens = []
	this.updated_boosters = {};
	this.show_bag = false;
	this.icons = {
		'money': 'sale_icon1',
		'rating_score': 'sale_icon2',
		'booster1': 'sale_icon4',
		'booster2': 'sale_icon6',
		'booster4': 'sale_icon3',
		'booster6': 'sale_icon5',
	};
	this.sale_id = params['sale_id'];
	this.timer_info = params['timer_info'];
	let temp, res, logo, key;

	this.allow_buy = true;
	let base_size = 40;
	
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, this.sale_id, 'window_back');
	
	temp.setInteractive();
	// game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);
	
	var button_close = new CustomButton(this.scene, 230, -270, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);
	if (this.sale_id === 'sale_looser_pack') {
		button_close.y = -280
	}

	let shop_list = game_data['shop'].filter(function(el, index, arr){
		return (el['sale_id'] == params['sale_id']);
	});	
	
	this.shop_item = shop_list[0];
	

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'sales', 'phrase_id': this.sale_id, 'values': [], 'base_size': base_size});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -265, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3,wordWrap: {'width': 500}, align: 'center'});	
	temp.setLineSpacing(-13);		
	temp.setOrigin(0.5);
	this.add(temp);
	if (this.sale_id == 'sale_looser_pack') {
		temp.y = -280;
	}
	this.title = temp;

	this.timer_cont = new Phaser.GameObjects.Container(this.scene, 240, 290);
	this.add(this.timer_cont);
	this.clock_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);

	this.timer_back = new Phaser.GameObjects.Image(this.scene, 0, 0, this.sale_id, 'timer');
	this.timer_cont.add(this.timer_back);
	// this.timer_clock = new Phaser.GameObjects.Image(this.scene, -41, 0, this.sale_id, 'timer_clock');
	// this.clock_cont.add(this.timer_clock);

	// this.timer_arrow = new Phaser.GameObjects.Image(this.scene, -41, 2, 'common1', 'timer_arrow');
	// this.timer_arrow.setOrigin(0.5, 1)
	// let tween = game_data['utils'].move_around(this.timer_arrow, {duration: 2000})
	// this.tweens.push(tween)
	// this.clock_cont.add(this.timer_arrow);
	// this.timer_arrow2 = new Phaser.GameObjects.Image(this.scene, -41, 2, 'common1', 'timer_arrow');
	// this.timer_arrow2.setOrigin(0.5, 1)
	// tween = game_data['utils'].move_around(this.timer_arrow2, {duration: 120000})
	// this.tweens.push(tween)
	// this.clock_cont.add(this.timer_arrow2);
	this.timer_txt = new Phaser.GameObjects.Text(this.scene, 17, 1, '', { fontFamily: 'font1', fontSize: 18, color: '#ffffff', stroke: '#000000', strokeThickness: 3});			
	this.timer_txt.setOrigin(0.5);
	this.timer_cont.add(this.timer_txt)
	this.timer_cont.add(this.clock_cont);
	// this.shake_clock()
	temp = new Phaser.GameObjects.Image(this.scene, 0, -160, this.sale_id, 'percent');
	this.add(temp);
	if (this.sale_id === 'sale_looser_pack') {
		temp.x = 70
		temp.y = -140
	}
	if (this.sale_id === 'sale_hint_pack') {
		temp.x = 70
	}
	if (this.sale_id === 'sale_energy_pack') {
		temp.x = 70
		temp.y = -145
	}
	

	this.button_buy = new CustomButton(this.scene, 0, 285, this.handler_buy, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	this.add(this.button_buy);	

	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, this.shop_item['price'], { fontFamily: 'font1', stroke: '#000000', strokeThickness: 3, fontSize: 30});			
	temp.setOrigin(0.5);
	this.button_buy.add(temp);

	//loading_vars['net_id'] = 'ok';
	if ('net_id' in loading_vars && (loading_vars['net_id'] == 'ok' || loading_vars['net_id'] == 'vk')) {

		this.currency = new Phaser.GameObjects.Image(this.scene, 0, temp.y, loading_vars['net_id'] + '_currency');
		var scale = 40 / this.currency.height;
		// this.currency.setScale(scale, scale);
		temp.x -= this.currency.width  * scale / 2;
		this.currency.x = temp.x + temp.width / 2 + this.currency.width * scale / 2;
		this.currency.y = temp.y;
		this.button_buy.add(this.currency);
	}
	else {
		temp.text = "$" + temp.text;
	}
	
	this.timer = this.scene.time.addEvent({
		delay: 300,
		callback: this.handler_timer,
		callbackScope: this,
		loop: true
	});
	this.handler_timer();

	this.money_icon = null;
	this.rating_icon = null;
	this.has_boosters = false;
	this.stat_amount = 0;
	let pos = this.get_amount_pos(this.sale_id);
	let id = 0; 
	if (this.shop_item['type'] == 'pack') {
		let amount = this.shop_item['amount'];
		let resourses_amount = Object.keys(amount).length
		
		if (pos.length) for (let s in amount) {
			if (id < pos.length) {
				let panel = new Phaser.GameObjects.Container(this.scene, pos[id].x, pos[id].y)
				this.add(panel)

				let panelImg = new Phaser.GameObjects.Image(this.scene, 0, 0, this.sale_id, 'panel');
               
				panel.add(panelImg);
				this.panel = panel;
				
				temp = new Phaser.GameObjects.Image(this.scene, -65, 0, 'common1', this.icons[s]);
				panel.add(temp);
				this.updated_boosters[s] = true;
				if (s == 'money') this.money_icon = temp;
				if (s == 'rating_score') this.rating_icon = temp;
				if (s == 'energy') this.energy_icon = temp;
				temp = new Phaser.GameObjects.Text(this.scene, 55, 0, amount[s], { fontFamily: 'font1', stroke: '#000000', strokeThickness: 3, fontSize: 50});
				temp.setOrigin(0.5);
				panel.add(temp);
				
				if (resourses_amount == 4) {
					temp.x = 25
				}
				id += 1;
				if (s == 'money') this.stat_amount += amount[s];
				else if (s == 'booster1' || s == 'booster2' || s == 'booster4' || s == 'booster6') {
					this.has_boosters = true;
				}
			}
		}
	}
	else if (this.shop_item['type'] == 'chest') {
		this.show_chest = true;
		let amount = game_data['paid_chest_prize'][this.shop_item['item_id']];
		if (pos.length) {
			for (let s in amount) {
				let panel = new Phaser.GameObjects.Container(this.scene, pos[id].x, pos[id].y)
				this.add(panel)
				let panelImg = new Phaser.GameObjects.Image(this.scene, 0, 0, this.sale_id, 'panel');
				panel.add(panelImg);
				this.panel = panel;
				this.updated_boosters[s] = true;
				temp = new Phaser.GameObjects.Image(this.scene, -83, 0, 'common1', this.icons[s]);
				panel.add(temp);
				let _size = 40;
				if (this.sale_id === 'sale_chest_2') _size = 25
				if (s == 'energy') _size = 30
				if (s == 'rating_score') _size = 22
				temp = new Phaser.GameObjects.Text(this.scene, 40, 0, amount[s]['min'] + ' - ' + amount[s]['max'], { fontFamily: 'font1', stroke: '#000000', strokeThickness: 3, fontSize: _size});
				if (s == 'energy') temp.x -= 10
				if (s == 'rating_score') temp.x -= 15
				temp.setOrigin(0.5,0.5);
				panel.add(temp);
				id += 1;
			}
		}
	}
	else this.close_window();	
},	

shake_clock() {
	game_data['utils'].shake(this.clock_cont, {delay: 1500, sound: 'clock_shake'})
	clearTimeout(this.tid_shake)
	this.tid_shake = setTimeout(() => {
		this.shake_clock()
	}, 10000)
},
get_amount_pos(sale_id) {
	switch (sale_id) {
		case 'sale_starter_pack':		
			return [{x:-145,y:-25}, {x:145,y:-25}, {x:-145,y:70}, {x:145,y:70}];
		case 'sale_winner_pack':
			return [{x:-145,y:-25}, {x:145,y:-25}, {x:-145,y:70}, {x:145,y:70}];
		case 'sale_looser_pack':
			return [{x:-135,y:-25}, {x:135,y:-25}, {x:-135,y:70}, {x:135,y:70}];
		case 'sale_chest_1':
			return [{x:-145,y:-25}, {x:145,y:-25}, {x:-145,y:70}, {x:145,y:70}];	
		case 'sale_chest_2':
			return [{x:-145,y:-25}, {x:145,y:-25}, {x:-145,y:70}, {x:145,y:70}];	
		case 'sale_game_play_pack':
			return [{x:-145,y:-25}, {x:145,y:-25}, {x:-145,y:70}, {x:145,y:70}];
		case 'sale_hammer_pack':
			return [{x:0,y:-50}, {x:0,y:50}];
		case 'sale_magnet_pack':
			return [{x:0,y:-50}, {x:0,y:50}];
		case 'sale_cross_pack':
			return [{x:0,y:-50}, {x:0,y:50}];
		case 'sale_short_hammer_pack':
			return [{x:0,y:-50}, {x:0,y:50}];
		default:
			return [];
		
	}

},

handler_timer() {
	let t = '00:00';
	let timeout = 0;
	if (this.timer_info && this.timer_info.text) {
		t = String(this.timer_info.text);
		timeout = this.timer_info.time_left;
	}
	if (this.scene && this.timer_txt) this.timer_txt.text = t;
	
	if (this.scene && timeout <= 0) this.close_window();
},

handler_buy() {
	var _this = this;
    
	if (this.allow_buy) {
		this.allow_buy = false;
		this.timer.paused = true;
		setTimeout(() => {this.allow_buy = true;}, 2000);
		
		game_data['utils'].start_purchase_item({'item_info': this.shop_item, 'og_base_url': game_data['urls']['og']}, function(payment_info){
				_this.allow_buy = false;
                
				if ('success' in payment_info && payment_info['success']) {		
						
					// game_data['game_request'].update_stat({'type': 'purchase_complete', 'description': _this.shop_item['item_id']
					// 				,'update_purchase': true, 'item_type': _this.shop_item['type'], 'item_info': _this.shop_item
					// 				,'amount_inc': _this.stat_amount, 'amount_dec': _this.shop_item['price']});	
					game_data['utils'].update_stat({'update_purchase': true, 'item_info': _this.shop_item});
                    game_data['game_request'].request({'update_purchase': true, 'item_info': _this.shop_item}, function(res){
						
						game_data['task_manager'].update_tasks({'type': 'purchase', 'amount':1});
						if (_this.show_chest) {

							_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'paid_chest_open','chest_id': _this.shop_item['item_id'], 'sale_id': _this.sale_id});
							
							_this.close_window();
						}
						else {
							_this.show_bag = true;
							
							if (_this.money_icon || _this.energy_icon || _this.rating_icon) {
								if (_this.money_icon) {
									let pt = game_data['utils'].toGlobal(_this.money_icon, new Phaser.Geom.Point(0, 0));
									setTimeout(function() {
										game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
									},game_data['utils'].get_sound_delay(3));
									game_data['utils'].fly_items({'amount': 5,								
															'holder': _this,
															'item_atlas': 'common1', 
															'item_name': 'coin',
															'pt_start': pt,
															'pt_end': game_data['game_map'].get_money_pt()
															}, 
									function(){
										_this.emitter.emit('EVENT', {'event': 'update_money'});
										_this.emitter.emit('EVENT', {'event': 'update_energy'},);
										_this.emitter.emit('EVENT', {'event': 'update_boosters'},);
										_this.emitter.emit('EVENT', {'event': 'update_rating'},);
												
									});
								}
								if (_this.energy_icon) {
									
									let pt = game_data['utils'].toGlobal(_this.energy_icon, new Phaser.Geom.Point(0, 0));
									setTimeout(function() {
										game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
									},game_data['utils'].get_sound_delay(3));
									game_data['utils'].fly_items({'amount': 5,								
															'holder': _this,
															'item_atlas': 'common1', 
															'item_name': 'lightning_gold_mini',
															'pt_start': pt,
															'pt_end': game_data['game_map'].get_energy_pt()
															}, 
									function(){
										_this.emitter.emit('EVENT', {'event': 'update_money'});
										_this.emitter.emit('EVENT', {'event': 'update_energy'},);
										_this.emitter.emit('EVENT', {'event': 'update_boosters'},);
										_this.emitter.emit('EVENT', {'event': 'update_rating'},);
											
									});
								}
								if (_this.rating_icon) {
									this.fly_rating()
								}
								
								setTimeout(() => {
									_this.close_window()
								}, 1000)
							}
							
							else _this.close_window();

							
							if (_this.has_boosters) {
								_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'boosters_info'});	
							}
						}
						 
						game_data['game_request'].request(  {'remove_user_sale': true, 'sale_id': _this.sale_id},function(res) {
							if (res['success']) {
								game_data['sales_manager'].update_active_sales(game_data['user_data']['sales']);
								game_data['game_map'].remove_sale(_this.sale_id);

								
							}
						});	
					});	
								
				}
				else {
					_this.allow_buy = true;
					_this.close_window();
					_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'purchase_failed'});
				}			
		});
	}
},

fly_rating() {
	var start_pt = game_data['utils'].toGlobal(this.rating_icon, new Phaser.Geom.Point(0,0));
	var icon = new Phaser.GameObjects.Image(this.scene, start_pt.x, start_pt.y, "common2", "icon6");
	game_data['moving_holder'].add(icon);
	var end_pt = game_data['rating_manager'].get_player_pt();
	
	game_data['scene'].tweens.add({targets: icon, scale: 1, x: end_pt.x, y: end_pt.y, duration: 500, delay: delay, onComplete: function() {
		game_data['utils'].add_light_stars(end_pt, game_data['moving_holder'], function(){});
		icon.destroy();
	}});
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'rating_add'});
		game_data['rating_manager'].user_score_updated();	
	}, 300);
},

handler_close(params) {  
	this.close_window(params);
},

close_window(params) {  
	clearTimeout(this.tid_shake)
	if (this.timer) {
		this.timer.paused = true;
		this.timer.destroy();
	}
	this.tweens.forEach(el => {
		game_data.scene.tweens.remove(el)
	})
	game_data['game_map'].update_sale();
	this.emitter.emit('EVENT', {'event': 'window_close'});
	
},	

});