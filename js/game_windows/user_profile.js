var UserProfile = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function UserProfile (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		var temp;
		var res;
		
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setSize(temp.width, temp.height);
		temp.setInteractive();
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);
	
		var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
		this.add(button_close);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'user_profile', 'phrase_id': '8', 'values': [], 'base_size': 32});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.add(temp);
		
		var cont1 = new Phaser.GameObjects.Container(this.scene, 0, -130);
		this.add(cont1);
		var graphics;
		var key = 'profile1';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x39352a, 0.75);
			graphics.lineStyle(2, 0xb6924b, 1);
			graphics.fillRoundedRect(10, 10, 416, 100, 15);
			graphics.strokeRoundedRect(10, 10, 416, 100, 15);
			
			graphics.generateTexture(key, 436, 120);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			cont1.add(t);
		}

		var photo_cont = new Phaser.GameObjects.Container(this.scene,  -140, -9);
		cont1.add(photo_cont);

		game_data['utils'].load_user_photo(loading_vars['user_id'], function(res){
			if (res['success'] && res['photo']) {
				var photo = res['photo'];
				var scale = 65 / photo.width;
				photo.setScale(scale);
				photo_cont.add(photo);
			}
		});	

		key = 'profile2';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.lineStyle(4, 0xfef0a1, 1);
			graphics.strokeRoundedRect(5, 5, 68, 68, 8);
			graphics.generateTexture(key, 78, 78);
		}
		var t = new Phaser.GameObjects.Image(this.scene, photo_cont.x, photo_cont.y, key);
		if (t) {
			game_data['graphics'][key] = true;
			cont1.add(t);
		}


		temp = new Phaser.GameObjects.Text(this.scene, photo_cont.x, 36, game_data['users_info'][loading_vars['user_id']]['first_name'], { fontFamily: 'font1', fontSize: 20, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		cont1.add(temp);

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'user_profile', 'phrase_id': '9', 'values': [], 'base_size': 24});		
		temp = new Phaser.GameObjects.Text(this.scene, 50, -20, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#000000', strokeThickness: 3, align: 'center', wordWrap:{width: 350}});
		temp.setLineSpacing(-4);
		temp.setOrigin(0.5);
		cont1.add(temp);

		var _dx = 50;
		temp = new Phaser.GameObjects.Image(this.scene, 0, 15, "common1", "score_icon");
		temp.setOrigin(0, 0.5);
		cont1.add(temp);
		var temp2 = new Phaser.GameObjects.Text(this.scene, 0, 15, game_data['user_rating_score'], { fontFamily: 'font1', fontSize: 30, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
		temp2.setOrigin(0, 0.5);
		cont1.add(temp2);
		var w = temp.width + temp2.width + 5;
		temp.x = _dx - w/2;
		temp2.x = temp.x + temp.width;

		var cont2 = new Phaser.GameObjects.Container(this.scene, 0, 90);
		this.add(cont2);


		key = 'profile3';
		if (!game_data['graphics'][key]) {
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x39352a, 0.75);
			graphics.lineStyle(2, 0xb6924b, 1)
			graphics.fillRoundedRect(10, 10, 416, 310, 15);
			graphics.strokeRoundedRect(10, 10, 416, 310, 15);
			graphics.generateTexture(key, 436, 330);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			cont2.add(t);
		}

		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'user_profile', 'phrase_id': '1', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -130, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		cont2.add(temp);

		var info = [
			{y: -80, phrase: 3, num: game_data['user_data']['profile']['days']},
			{y: -30, phrase: 4, num: game_data['user_data']['profile']['win_amount'] + game_data['user_data']['profile']['lost_amount']},
			{y: 20, phrase: 5, num: game_data['user_data']['profile']['win_amount']},
			{y: 70, phrase: 6, num: game_data['user_data']['profile']['lost_amount']},
			{y: 120, phrase: 7, num: game_data['friends'].length - 1},
		];
		for (var i = 0; i < info.length; i++) {
			temp =  new Phaser.GameObjects.Image(this.scene, 0, info[i].y, "common1", "panel7");
			cont2.add(temp);
			res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'user_profile', 'phrase_id': info[i].phrase, 'values': [], 'base_size': 24});		
			temp = new Phaser.GameObjects.Text(this.scene, -185, info[i].y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
			temp.setOrigin(0,0.5);
			cont2.add(temp);
			temp = new Phaser.GameObjects.Text(this.scene, 185, info[i].y, info[i].num, { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
			temp.setOrigin(1,0.5);
			cont2.add(temp);
		}

	},	


handler_close(params) {  
	this.close_window();
},

close_window(params) {  	
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});