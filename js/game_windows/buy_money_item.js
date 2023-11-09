var BuyMoneyItem = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function BuyMoneyItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	this.holder = params['holder'];
	this.item_info = params['item_info'];
	this.icon = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common2', params['icon']);
	this.money_pt = params['money_pt'];	
	this.allow_buy = true;
	
	this.bg = new CustomButton(this.scene, 0, 0, this.handler_buy, 'common2', 'shop_panel_out'+params['no'], 'shop_panel_over'+params['no'], 'shop_panel_out'+params['no'], this);
    this.add(this.bg);	
	this.add(this.icon);

	
	var txt = new Phaser.GameObjects.Text(this.scene, this.item_info['amount'] >= 10000 ? -3 : -1, -87, this.item_info['amount'], {fontFamily:"font1", fontSize: 45, color:'#f6caa0', stroke: '#886D13', strokeThickness: 8});				
	txt.setOrigin(0.5);
	this.add(txt);

	this.button_buy = new CustomButton(this.scene, 0, 100, this.handler_buy, 'common1', 'shop_but1', 'shop_but2', 'shop_but3', this);
	this.button_buy.setScale(0.8)
    this.add(this.button_buy);	
	
	var button_txt;
	
		button_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, this.item_info['price'], {fontFamily:"font1", fontSize: 23, color:'#f6caa0', stroke: '#000000', strokeThickness: 3});				
		button_txt.setOrigin(0.5);
		button_txt.x = this.button_buy.x;
		button_txt.y = this.button_buy.y - 1;
		this.add(button_txt);
		
		// loading_vars['net_id'] = 'vk';
		if ('net_id' in loading_vars && (loading_vars['net_id'] == 'ok' || loading_vars['net_id'] == 'vk')) {
			var currency = new Phaser.GameObjects.Image(this.scene, 0, 0, loading_vars['net_id'] + '_currency');
			var scale = 35 / currency.height;
			currency.setScale(scale, scale);
			button_txt.x -= currency.width * scale / 2;
			currency.x = button_txt.x + button_txt.width / 2 + currency.width * scale / 2;
			currency.y = button_txt.y;
			this.add(currency);
		}
		else {
			button_txt.text = button_txt.text + " $";
		}

},


handler_buy(params) {  
	var _this = this;

	if (this.allow_buy) {
		this.allow_buy = false;
		this.emitter.emit('EVENT', {'event': 'shop_click'});
		setTimeout(() => {this.allow_buy = true;}, 2000);

			game_data['utils'].start_purchase_item({'item_info': this.item_info}, function(payment_info){
				if ('success' in payment_info && payment_info['success']) {	
					game_data['utils'].update_stat({'update_purchase': true, 'item_info': _this.item_info});			
					game_data['game_request'].request({'update_purchase': true, 'item_info': _this.item_info}, function(res){	
						if (_this.scene) _this.display_add_money();
					});
				}
				else {
					var _id = (is_localhost || navigator.onLine)? 'purchase_failed' : 'no_connection';
					_this.emitter.emit('EVENT', {'events': [{'event': 'window_close', 'immediate': true}, 
													{'event': 'show_window', 'window_id': _id, 'center_pt': this.center_pt}
					]});
				}			
			});
		}
},

display_add_money() {
	var _this = this;	
	//var pt = this.toGlobal(new Phaser.Point(this.coins_icon.x + this.coins_icon.width / 2, this.coins_icon.y));
	var pt = new Phaser.Geom.Point(this.icon.x, this.icon.y);
	pt = game_data['utils'].toGlobal(this, pt);
	setTimeout(function() {
		game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
	},game_data['utils'].get_sound_delay(2));
	game_data['utils'].fly_items({'amount': 5,						
								'holder': this.holder,
								'item_atlas': 'common1',
								'item_name': 'money_ico',
								'pt_start': pt,
								'pt_end': this.money_pt	
								}, 
	function(){	
		if (_this.scene) {
			_this.emitter.emit('EVENT', {'event': 'update_money'});
			_this.emitter.emit('EVENT', {'event': 'window_close'});
		}
	});
},


handler_close(params) {  
	this.close_window(params)
},

close_window(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});