var ChestWait = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function ChestWait ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		var temp;
		var res;
		this.prev_params = params;
		this.money_pt = params['money_pt'];
		this.level_id = params['level_id'];
		this.allow_add = true;
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setInteractive();
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);
	
		var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
		this.add(button_close);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_wait', 'phrase_id': '1', 'values': [], 'base_size': 32});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.add(temp);

		temp = new Phaser.GameObjects.Image(this.scene, 0, -40, 'common2', 'chest_wait_icon');
		this.add(temp);

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_wait', 'phrase_id': '2', 'values': [], 'base_size': 28});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, 140, res['text'], { fontFamily: 'font1', fontSize: res['size'], 
					color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 500}});	
		//temp.setLineSpacing(-4);
		temp.setOrigin(0.5);
		this.add(temp);

		this.button_play = new CustomButton(this.scene, 0, 290, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'chest_wait', 'phrase_id': '3', 'values': [], 'base_size': 26});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.button_play.add(temp);
		this.add(this.button_play);

	},	

handler_close(params) {  
	this.close_window();
},

close_window(params) {  	
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});