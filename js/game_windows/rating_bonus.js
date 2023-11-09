var RatingBonus = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function RatingBonus ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		var temp;
		var res;
		this.money_pt = game_data['game_map'].get_money_pt();
		this.allow_add = true;
		this.r_type = 'day';
		var user_info = params['user_info']
		if (!user_info) user_info = game_data['user_data']['rating_info']['bonus'];
		this.player_place = user_info['place']
		this.amount = user_info['amount']
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setInteractive();
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);

		var button_close = new CustomButton(this.scene, 229, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
		this.add(button_close);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'rating_bonus', 'phrase_id': '1', 'values': [], 'base_size': 28});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y + 4, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000'});			
		temp.setOrigin(0.5);
		this.add(temp);


		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'rating_bonus', 'phrase_id': '2', 'values': [this.player_place], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, 100, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0',
					 stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 500}});			
		temp.setLineSpacing(-4);
		temp.setOrigin(0.5);
		this.add(temp);

		var panel = new Phaser.GameObjects.Image(this.scene, 0, 185, "common1", "panel1");
		panel.scaleY = 1.4;
		this.add(panel);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'rating_bonus', 'phrase_id': '3', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 30, panel.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(1,0.5);
		this.add(temp);

		this.txt_amount = new Phaser.GameObjects.Text(this.scene, 50, panel.y, this.amount, { fontFamily: 'font1', fontSize: 35, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		this.txt_amount.setOrigin(0,0.5);
		this.add(this.txt_amount);

		this.logo = new Phaser.GameObjects.Image(this.scene, 0, panel.y, "common1", "coin");	
		this.logo.setOrigin(0.5);
		this.logo.x = this.txt_amount.x + this.txt_amount.width + this.logo.width/2;
		this.add(this.logo);

		this.add_cup(user_info)
		
		this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_continue, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'rating_bonus', 'phrase_id': '4', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -4, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.button_continue.add(temp);
		this.add(this.button_continue);

	},	

	add_cup(user_info){
		var current_league = game_data['user_data']['rating_info']['league_id'];
		var prev_league = user_info['league_id'];
		var with_move_result = (prev_league != current_league);
		var y_pos = -40
		var temp = new Phaser.GameObjects.Image(this.scene, 0, y_pos, 'common2', 'league_icon_' + current_league);
		temp.scale = 180/temp.height;
		this.add(temp);
		if (with_move_result) {
			temp.x += 130;
			temp = new Phaser.GameObjects.Image(this.scene, -130, y_pos, 'common2', 'league_icon_' + prev_league);
			temp.scale = 180/temp.height;
			this.add(temp);
			temp = new Phaser.GameObjects.Image(this.scene, 10, y_pos, 'common1', 'tutorial_arrow');
			temp.scaleX = -1;
			this.add(temp);
			var order_prev = game_data['rating_settings']['leagues'][prev_league]['order'];
			var order_now = game_data['rating_settings']['leagues'][current_league]['order'];
			var phrase_id = order_prev < order_now ? 'promotion' : 'knockout';
			var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'move_result', 'phrase_id': phrase_id, 'values': [], 'base_size': 30});		
			temp = new Phaser.GameObjects.Text(this.scene, 0, y_pos - 100, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3, align:'center', wordWrap:{width: 500}});			
			temp.setOrigin(0.5,1);
			temp.setLineSpacing(-5);
			this.add(temp)
		}
		else {
			var res = game_data['utils'].generate_string({'scene_id': 'game_rating', 'item_id': 'move_result', 'phrase_id': 'stable', 'values': [], 'base_size': 30});		
			temp = new Phaser.GameObjects.Text(this.scene, 0, y_pos - 100, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FEDC9C', stroke: '#000000', strokeThickness: 3, align:'center', wordWrap:{width: 500}});			
			temp.setOrigin(0.5,1);
			temp.setLineSpacing(-5);
			this.add(temp)
		}
	},

handler_continue() {
	if (this.allow_add) {
		var _this = this;
		this.allow_add = false;
		var pt_start = new Phaser.Geom.Point(this.logo.x, this.logo.y);
		pt_start = game_data['utils'].toGlobal(this, pt_start);
		game_request.request({'collect_rating_prize': true, 'amount': this.amount}, function(res){
			game_data['scene'].tweens.add({targets: _this.tip, alpha: 0, duration: 200});
			if ('success' in res && res['success']) {
				game_data['utils'].update_stat({'collect_rating_prize': true, 'amount': _this.amount});
				setTimeout(function() {
					game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
				},game_data['utils'].get_sound_delay(4));
				if (_this.scene) game_data['utils'].fly_items({'amount': 4,								
										'holder': _this,
										'item_atlas': 'common1',
										'item_name': 'coin',
										'pt_start': pt_start,
										'pt_end': _this.money_pt
										}, 
				function(){
					if (_this.scene) {
						_this.emitter.emit('EVENT', {'event': 'update_money'});
						_this.close_window();
					} 
				});				
			}
			else {
				_this.allow_add = true;
				_this.emitter.emit('EVENT', {'event': 'update_money'});
				_this.emitter.emit('EVENT', {'event': 'window_close'});
			}										 
		});	
	}
},

handler_close(params) {  
	this.handler_continue();
},

close_window(params) {  	
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	


});