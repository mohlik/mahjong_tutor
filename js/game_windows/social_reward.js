var SocialReward = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function SocialReward ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var temp;
		var res;
		this.money_pt = game_data['game_map'].get_money_pt();
		this.r_type = params['type'];
		this.reward = this.r_type == 'wall_post' ? game_data['wall_post_reward'] : game_data['tournament_start_reward'];
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setInteractive();
		this.add(temp);

		var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
		button_close.scale = 1.2;
		this.add(button_close);

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'social_reward', 'phrase_id': '1', 'values': [], 'base_size': 36});
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 4});
		temp.setOrigin(0.5);
		this.add(temp);

		this.allow_add = true;


		temp = new Phaser.GameObjects.Image(this.scene, 0, 40, "common2", "shop_slot1");
		this.add(temp);

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'social_reward', 'phrase_id': this.r_type, 'values': [], 'base_size': 36});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -105, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 520}});			
		temp.setLineSpacing(-4);
		temp.setOrigin(0.5);
		this.add(temp);

		var panel = new Phaser.GameObjects.Image(this.scene, 0, 180, "common1", "panel1");
		this.add(panel);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'social_reward', 'phrase_id': '2', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 15, panel.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(1,0.5);
		this.add(temp);

		this.txt_amount = new Phaser.GameObjects.Text(this.scene, 35, panel.y, this.reward, { fontFamily: 'font1', fontSize: 35, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		this.txt_amount.setOrigin(0,0.5);
		this.add(this.txt_amount);

		this.logo = new Phaser.GameObjects.Image(this.scene, 0, panel.y, "common1", "money_ico");	
		this.logo.scale = 0.7;
		this.logo.setOrigin(0.5);
		this.logo.x = this.txt_amount.x + this.txt_amount.width + this.logo.displayWidth/2;
		this.add(this.logo);


		this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_continue, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'social_reward', 'phrase_id': '3', 'values': [], 'base_size': 30});
		temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
		temp.setOrigin(0.5);
		this.button_continue.add(temp);
		this.add(this.button_continue);

	},	


handler_continue() {
	if (this.allow_add) {
		this.allow_add = false;
		let pt_start = game_data['utils'].toGlobal(this.logo);

		setTimeout(()=> {
			game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'add_diamond'});
		},game_data['utils'].get_sound_delay(4));
		game_data['utils'].fly_items({'amount': 3,								
								'holder': this,
								'item_atlas': 'common1',
								'item_name': 'money_ico',
								'pt_start': pt_start,
								'pt_end': this.money_pt
								}, 
		()=>{
			if (this.scene) {
				this.emitter.emit('EVENT', {'event': 'update_money'});
				this.close_window();
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