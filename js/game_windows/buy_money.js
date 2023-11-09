var BuyMoney = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function BuyMoney ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var i;
	this.prev_params = null;
	if ('prev_params' in params) this.prev_params = params['prev_params'];
	this.no_buy = true;
	var with_chests = true;
	var y_add = with_chests ? 0 : 115;
	var button_close = new CustomButton(this.scene, 307, -290, this.handler_close, 'common2', 'close_big1', 'close_big2', 'close_big3', this);
	this.add(button_close);

	this.money_pt = params['money_pt'];
	var pts = [{x:-270, y:-115}, {x:-90, y:-115}, {x:90, y:-115}, {x:270, y:-115}];
	var _item;
	this.game_mode = game_data['last_game_mode'];
	this.shop_list = [];
	if (this.game_mode == 'full' || this.game_mode == 'purchases_only') {
		this.shop_list = game_data['shop'].filter(function(el, index, arr){
			return (el['category'] == 'shop' && el['type'] == 'money' && el['game_mode'] != 'video_only');
		});	
	}
	else {
		this.shop_list = game_data['shop'].filter(function(el, index, arr){
			return (el['category'] == 'shop' && el['type'] == 'money' && el['game_mode'] == 'video_only');
		});	
		pts = [{x: 0, y: -100}];
	}
	
	this.shop_list.sort((a,b) => (a.amount < b.amount) ? -1 : ((b.amount < a.amount) ? 1 : 0));	
	pts = pts.reverse();
	for (i = 0; i < this.shop_list.length && i < pts.length; i++) {
		_item = new BuyMoneyItem(this.scene);
		_item.x = pts[i].x;
		_item.y = pts[i].y + y_add;		
		this.add(_item);
		
		_item.init({'item_info': this.shop_list[i], 
						'free': false,
						'no': String(i+1),
						'icon': 'shop_slot' + String(i+1),
						'money_pt': this.money_pt,
						'holder': this
					});	
		
		_item.emitter.on('EVENT', this.handler_event, this);	
	};	

	temp = new Phaser.GameObjects.Image(this.scene, 0 , -275 + y_add, 'common2', 'shop_panel_name');
	this.add(temp);

	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'buy_money', 'phrase_id': '8', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -275 + y_add, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	this.no_money_text = new Phaser.GameObjects.Container(this.scene, 0, 28);
	this.add(this.no_money_text);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'panel4');
	temp.setScale(1.17, 1);
	this.no_money_text.add(temp);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'shop', 'phrase_id': '2', 'values': [], 'base_size': 20});	
	this.no_money_text.txt = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	this.no_money_text.txt.setOrigin(0.5);
	this.no_money_text.add(this.no_money_text.txt);
	if ('direct_click' in params) this.no_money_text.visible = false;


	if (with_chests) {
		temp = new Phaser.GameObjects.Image(this.scene, 0 , 80, 'common2', 'shop_panel_name');
		this.add(temp);
		var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'buy_money', 'phrase_id': '9', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, 80, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.add(temp);
		var pts = [{x:-270, y:240}, {x:-90, y:240}, {x:90, y:240}, {x:270, y:240}];
		var _item;
		this.shop_list = game_data['shop'].filter(function(el, index, arr){
			return (el['category'] == 'shop' && el['type'] == 'chest');
		});	
		pts = pts.reverse();		
		this.shop_list.sort((a,b) => (a.price < b.price) ? -1 : ((b.price < a.price) ? 1 : 0));	
		for (i = 0; i < this.shop_list.length ; i++) {
			_item = new BuyChestItem(this.scene);
			_item.x = pts[i].x;
			_item.y = pts[i].y;			
			this.add(_item);
			
			_item.init({'item_info': this.shop_list[i], 
							'no': String(i+1),
							'icon': 'chest_' + String(i+1),
							'money_pt': this.money_pt
						});	
			
			_item.emitter.on('EVENT', this.handler_event, this);	
		};	
	}

	this.no_ads_cont = new Phaser.GameObjects.Container(this.scene, -30, -288)
	this.add(this.no_ads_cont)
	temp = new Phaser.GameObjects.Image(this.scene, 30, 320, 'common1', 'panel2');
	temp.setScale(0.65)
	temp.scaleY = 0.5
	// temp.scaleX = 2
	this.no_ads_cont.add(temp);

	str_obj = {'scene_id': 'game_windows', 'item_id': 'buy_money', 'phrase_id': 'tip', 'values': [], 'base_size': 20}
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'buy_money', 'phrase_id': 'tip', 'values': [], 'base_size': 20});		
	temp = new Phaser.GameObjects.Text(this.scene, -105, 320, res['text'], { fontFamily: 'font1', fontSize: res['size'], color:'#f6caa0', stroke: '#886D13', strokeThickness: 3});			
	temp.setOrigin(0, 0.5);
	this.no_ads_cont.add(temp);
	this.no_ads_txt = temp
	temp = new Phaser.GameObjects.Image(this.scene, temp.x - 30, 320, 'common1', 'no_ads');
	this.no_ads_cont.add(temp);
	this.no_ads_ico = temp
	if (game_data['user_data']['lang'] === 'EN') {
		this.no_ads_txt.x = -70
		this.no_ads_ico.x = this.no_ads_txt.x - 30
	}

	let total_payments = game_data['user_data']['payments']['total'];
	this.no_ads_cont.setVisible(total_payments === 0 && this.no_money_text.visible === false)
},	

first_show() {

},

on_every_show() {

},

handler_event(params) {  
	switch (params['event']) {
		case 'shop_click':
			this.no_buy = false;
			break;
		case 'window_close': 
			this.close_window(params)
			break;
		default:
			this.emitter.emit('EVENT', params);
			break;
	}
	
},

handler_close(params) {  
	this.close_window();
},

close_window(params) {  
	if (this.prev_params) this.emitter.emit('EVENT', this.prev_params);
	this.emitter.emit('EVENT', {'event': 'window_close'});
	game_data['game_map'].update_sale();
},	

});