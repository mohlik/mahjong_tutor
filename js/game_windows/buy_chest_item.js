var BuyChestItem = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function BuyChestItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	this.item_info = params['item_info'];
	this.icon = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common2', params['icon']);
	var w = params['no'] == 2 ? 145 : 165
	this.icon.setScale(w/this.icon.width);
	this.money_pt = params['money_pt'];	
	this.allow_buy = true;
	
	this.bg = new CustomButton(this.scene, 0, 0, this.handler_buy, 'common2', 'shop_panel_out'+params['no'], 'shop_panel_over'+params['no'], 'shop_panel_out'+params['no'], this);
    this.add(this.bg);	
	this.add(this.icon);
	
	
	this.button_buy = new CustomButton(this.scene, 0, 100, this.handler_buy, 'common1', 'shop_but1', 'shop_but2', 'shop_but3', this);
	this.button_buy.setScale(0.8)
    this.add(this.button_buy);	
	
	var button_txt;
	button_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, this.item_info['price'], {fontFamily:"font1", fontSize: 23, color:'#f6caa0', stroke: '#000000', strokeThickness: 3});				
	button_txt.setOrigin(0.5);
	button_txt.x = this.button_buy.x;
	button_txt.y = this.button_buy.y - 1;
	this.add(button_txt);
	
	//loading_vars['net_id'] = 'vk';
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
	
	this.tip = new Phaser.GameObjects.Image(this.scene, 45, -85, 'common2', 'tip_icon');
	this.add(this.tip);
	this.init_tip();
},

handler_buy(params) {  
	var _this = this;

	if (this.allow_buy) {
		this.allow_buy = false;
		this.emitter.emit('EVENT', {'event': 'shop_click'});
		setTimeout(() => {this.allow_buy = true;}, 2000);

		game_data['utils'].update_stat({'type': 'purchase_start', 'description': _this.item_info['item_id']});
		game_data['utils'].start_purchase_item({'item_info': this.item_info}, function(payment_info){
			if ('success' in payment_info && payment_info['success']) {	
				game_data['utils'].update_stat({'update_purchase': true, 'item_info': _this.item_info});
				// game_data['utils'].update_stat({'type': 'purchase_complete', 'description': _this.item_info['item_id']
				// 							,'amount_inc': _this.item_info['amount'], 'amount_dec': _this.item_info['price']});				
				game_data['game_request'].request({'update_purchase': true, 'item_info': _this.item_info}, function(res){	
			
					_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'paid_chest_open','chest_id': _this.item_info['item_id'], 
								'rating_type': game_data['rating_manager'].get_current_rating()['type']});
					_this.close_window();
				});
			}
			else {
				var _id = (is_localhost || navigator.onLine)? 'purchase_failed' : 'no_connection';
				game_data['utils'].update_stat({'type': 'purchase_failed', 'description': _this.item_info['item_id']});
				_this.emitter.emit('EVENT', {'events': [{'event': 'window_close', 'immediate': true}, 
												{'event': 'show_window', 'window_id': _id, 'center_pt': this.center_pt}
				]});
			}			
		});
	}
},

init_tip() {
	var mobile = loading_vars['mobile'];
	this.tip_showed = false;
	this.tip.setInteractive();
	if (mobile) this.tip.on('pointerup', this.show_tip_mobile, this)
	else {
		this.tip.on('pointerover', this.show_tip, this)
		this.tip.on('pointerout', this.hide_tip, this);
		this.tip.on('pointerup', ()=> {
			if (this.tip_showed) this.hide_tip(); 
			else this.show_tip();
		}, this);
	}
	this.tip_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.tip_cont);
	this.tip_cont.alpha = 0;
	var graphics;
	var key = 'chest_tip1';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x39352a, 0.5);
		graphics.lineStyle(2, 0xB5F0FF, 1);
		graphics.fillRoundedRect(5 , 5, 160, 190, 10);
		graphics.strokeRoundedRect(5, 5, 160, 190, 10);
		graphics.generateTexture(key, 170, 200);
	}
	var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			this.tip_cont.add(t);
		}

	var info = game_data['paid_chest_prize'][this.item_info['item_id']];
	var temp,s;
	var x1 = -52;
	var x2 = -30;
	var i = 0;
	var pos = [ -60, -18, 24, 66];
	var keys = {'money': 'coin', 'rating_score': 'score_icon_big' }
	for (s in info) {
		if (s in keys) temp = new Phaser.GameObjects.Image(this.scene, x1, pos[i], 'common1', keys[s]);
		else temp = new Phaser.GameObjects.Image(this.scene, x1, pos[i], 'common1', s + '_active');
		temp.setScale(Math.min(40/temp.height, 45/temp.width))
		this.tip_cont.add(temp);
		temp = new Phaser.GameObjects.Text(this.scene, x2, pos[i], info[s]['min'] + ' - ' + info[s]['max'], 
					{fontFamily:"font1", fontSize: 18, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});				
		temp.setOrigin(0,0.5);
		this.tip_cont.add(temp);
		i += 1;
	}
},

show_tip_mobile() {
	clearTimeout(this.tid_tip);
	if (this.tip_showed) this.hide_tip();
	else {
		this.tid_tip = setTimeout(() => {
			this.hide_tip();
		}, 5000);
		this.show_tip();
	}
},

show_tip() {
	if (!this.tip_showed) {
		this.tip_showed = true;
		game_data['scene'].tweens.add({targets: this.tip_cont, alpha: 1, duration: 200});
	}
},
hide_tip() {
	if (this.tip_showed) {
		this.tip_showed = false;
		game_data['scene'].tweens.add({targets: this.tip_cont, alpha: 0, duration: 200});
	}
},

handler_close(params) {  
	this.close_window(params)
},

close_window(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});