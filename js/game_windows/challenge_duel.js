var ChallengeDuel = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function ChallengeDuel ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	var i;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	this.settings = params['settings'];
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '1', 'values': [], 'base_size': 27});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '2', 'values': [], 'base_size': 34});		
	temp = new Phaser.GameObjects.Text(this.scene, 0,-160, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 0, -70, 'common1', 'challenge_icon');
	this.add(temp);

	this.item = new CompetitorItem();
	this.item.x = -100;
	this.item.y = -70;
	this.add(this.item);
	this.item.init({'user_id': game_data['challenge_user_id'], 'with_spinner': false, 'with_photo': true});

	this.item_user = new CompetitorItem();
	this.item_user.x = 100;
	this.item_user.y = -70;
	this.add(this.item_user);
	this.item_user.init({'user_id': loading_vars['user_id'], 'with_spinner': false, 'with_photo': true});


	this.button_continue = new CustomButton(this.scene, -158, 290, this.handler_continue, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '3', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);
	this.add(this.button_continue);

	this.button_cancel = new CustomButton(this.scene, 158, 290, this.handler_close, 'common1', 'button_big_red1', 'button_big_red2', 'button_big_red3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '4', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_cancel.add(temp);
	this.add(this.button_cancel);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '7', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 15, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);


	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '6', 'values': [], 'base_size': 24});
	this.share_container = new Phaser.GameObjects.Container(this.scene, 0, 210);
	this.add(this.share_container);
	this.share_txt = new Phaser.GameObjects.Text(this.scene, 0, 1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});	
	this.share_txt.setOrigin(0.5)	
	this.share_container.add(this.share_txt);
	this.share_check_bg = new Phaser.GameObjects.Image(this.scene, this.share_txt.width / 2 + 30, 0, 'common2', 'check_box_bg');
	this.share_container.add(this.share_check_bg);
	this.share_check = new Phaser.GameObjects.Image(this.scene, this.share_txt.width / 2  + 30, 0, 'common2', 'checkbox_icon');
	this.share_container.add(this.share_check);
	this.share_container.x -= this.share_check_bg.displayWidth / 2 + 5;
	this.share_check.visible = false;
	var w = (this.share_txt.displayWidth + this.share_check_bg.displayWidth) / 2 + 10;
	var h = (this.share_check_bg.displayHeight) / 2 + 10
	var rect = new Phaser.Geom.Rectangle(-w, -h, w*2.5, h*2);
	this.share_container.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
	this.share_container.on('pointerup', () => {this.share_check.visible = !this.share_check.visible;})

	setTimeout(() => {
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'challenge'});	
	}, 300);


	temp = new Phaser.GameObjects.Image(this.scene, -140, 115, 'common2', 'watch1');
	this.add(temp);
	var graphics;
	var w = 280;
	var h = 80;

	var key = 'challenge1';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x39352a, 0.9);
		graphics.lineStyle(2, 0xb6924b, 1)
		graphics.strokeRoundedRect(5, 5, w, h, 10);
		graphics.fillRoundedRect(5, 5, w, h, 10);
		graphics.generateTexture(key, w + 10, h + 10);
	}
	var t = new Phaser.GameObjects.Image(this.scene, temp.x + 192, temp.y - 1, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.add(t);
	}

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'challenge_duel', 'phrase_id': '5', 'values': [], 'base_size': 24});		
	temp = new Phaser.GameObjects.Text(this.scene, 50, temp.y - 19, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 2});			
	temp.setOrigin(0.5);
	this.add(temp);
	this.wait = parseInt(game_data['challenges']['accept_timeout']);

	this.time_left = new Phaser.GameObjects.Text(this.scene, 50, temp.y + 34, this.wait, { fontFamily: 'font1', fontSize: 32, color: '#f6caa0', stroke: '#000000', strokeThickness: 2});			
	this.time_left.setOrigin(0.5);
	this.add(this.time_left);

	this.timer_wait = this.scene.time.addEvent({
		delay: 1000,
		callback: this.timer_wait_handler,
		callbackScope: this,
		loop: true
	});

},

timer_wait_handler() {
	this.wait -= 1;
	this.time_left.text = this.wait;
	if (this.wait <= 0) this.close_window();
},

handler_continue() {
	this.handler_close(null);
	game_data['game_map'].start_duel(this.settings);
},

handler_close(params) {  
	this.close_window();
},

close_window() {  
	if (this.timer_wait) {
		this.timer_wait.paused = true;
		this.timer_wait.destroy();
	}
	this.emitter.emit('EVENT', {'event': 'window_close'});	
	if (this.share_check.visible) {
		game_data['user_data']['allow_challenge'] = false;
		game_data['game_request'].request( {'set_allow_challenge': true, 'allow_challenge': false},function(res){}); 
	}
},	

});

