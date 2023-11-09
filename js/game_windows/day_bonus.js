var DayBonus = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function DayBonus ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp, panel;
	var res;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'day_bonus', 'phrase_id': '1', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	var day = parseInt(game_data['user_data']['user_day_bonus']['day']);
	if (!(String(day) in game_data['day_bonus'])) day = '1';
	this.bonus_amount = game_data['day_bonus'][String(day)]['amount'];

	var panel = new Phaser.GameObjects.Image(this.scene, 0, 0, "common2", "shop_slot2");
	this.add(panel);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'day_bonus', 'phrase_id': '3', 'values': [], 'base_size': 30});		
	var temp1 = new Phaser.GameObjects.Text(this.scene, 0, 160, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp1.setOrigin(1,0.5);
	this.add(temp1);
	var w1 = temp1.width;
	temp = new Phaser.GameObjects.Text(this.scene, 5, temp1.y, String(this.bonus_amount), { fontFamily: 'font1', fontSize: 35, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0,0.5);
	this.add(temp);
	this.logo = new Phaser.GameObjects.Image(this.scene, temp.x + temp.width, temp1.y, "common1", "coin");
	this.logo.x += this.logo.width/2 + 5;
	this.logo.setOrigin(0.5);
	this.add(this.logo);
	var w2 = temp.width + this.logo.width;
	var delta = (w1 - w2) / 2;
	temp1.x += delta;
	temp.x += delta;
	this.logo.x += delta;
	
	this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'day_bonus', 'phrase_id': '4', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);
	this.add(this.button_continue);

	var current_prize = game_data['day_bonus'][String(day)];
	this.current_prize = current_prize;
	
},	

handler_close(params) {  
	game_data['game_request'].request( {'collect_day_bonus': true}, obj => {
		if (this.scene && 'success' in obj && 'money' in obj && obj['success']) { 
			game_data['user_data']['user_day_bonus']['available'] = false;
			setTimeout(() => {
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
			}, game_data['utils'].get_sound_delay(2));
			var start_pt = new Phaser.Geom.Point(this.logo.x, this.logo.y);
			start_pt = game_data['utils'].toGlobal(this, start_pt);
			game_data['utils'].update_stat({'type': 'day_bonus', 'collect_day_bonus': true,
			'day': game_data['user_data']['user_day_bonus']['day'], 
			'amount': this.current_prize['amount'], 'prize_type': this.current_prize['type'],
			'amount_inc': this.bonus_amount});
			game_data['utils'].fly_items({'amount': 2,								
									'holder': this,
									'item_atlas': 'common1',
									'item_name': 'coin',
									'pt_start': start_pt,
									'pt_end': game_data['game_map'].get_money_pt()	
									}, 
			() => {
				this.close_window(params)
			});
		}
		else {
			this.close_window(params)
		}
	});
	
},

close_window(params) {  
	if (this.scene) {
		this.emitter.emit('EVENT', {'event': 'update_money'});	
		this.emitter.emit('EVENT', {'event': 'window_close'});
	}
	setTimeout(() => {
		game_data['game_map'].update_star_chest();
	}, 500);
},	

});