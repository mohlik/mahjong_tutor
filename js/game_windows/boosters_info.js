var BoostersInfo = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function BoostersInfo (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


	init(params) {  
		var _this = this;
		var temp;
		var res;
		
		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
		temp.setInteractive();
		game_data['utils'].assign_to_global_missclick(temp);
		this.add(temp);
	
		var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
		this.add(button_close);
	
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'purchase_complete_boosters', 'phrase_id': '1', 'values': [], 'base_size': 32});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.add(temp);

		
		this.prize_bg = new Phaser.GameObjects.Container(this.scene, 0, 30);
		this.add(this.prize_bg);

		var key = 'boosters_info1';
		if (!game_data['graphics'][key]) {
			let graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x39352a, 0.5);
			graphics.lineStyle(2, 0xe3cc69, 1);
			graphics.fillRoundedRect(5, 5, 500, 240, 10);
			graphics.strokeRoundedRect(5, 5, 500, 240, 10);
			graphics.generateTexture(key, 510, 250);
		}
		var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
		if (t) {
			game_data['graphics'][key] = true;
			this.prize_bg.add(t);
		}

		temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'prize_line');
		temp.angle = 90;
		this.prize_bg.add(temp);

		var prize_pos = [
			new Phaser.Geom.Point(-85, -55)
		   ,new Phaser.Geom.Point(85, -55)
		   ,new Phaser.Geom.Point(-85, 57)
		   ,new Phaser.Geom.Point(85, 57)
		//    ,new Phaser.Geom.Point(170, 57)												
		   ];
		var boosters = ['booster1', 'booster2', 'booster4', 'booster6'];
		var amounts = game_data['prev_boosters'];
		var new_amounts = game_data['user_data']['boosters'];
		var delay = 700;
		for (var i = 0; i < prize_pos.length; i++) {
			var start_pt = prize_pos[i];
			var cont = new Phaser.GameObjects.Container(this.scene, start_pt.x, start_pt.y);
			this.prize_bg.add(cont);
			cont.icon =  new Phaser.GameObjects.Image(this.scene, -20, 0, 'common1',  boosters[i] + '_active');
			cont.add(cont.icon);
			cont.txt = new Phaser.GameObjects.Text(this.scene, 50, 0, amounts[boosters[i]], 
						{fontFamily:"font1", fontSize: 45, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});
			cont.txt.setOrigin(0.5);
			cont.add(cont.txt);
			if (amounts[boosters[i]] < new_amounts[boosters[i]]) {
				this.anim_text(cont.txt, new_amounts[boosters[i]], delay);
				delay += 300;
			}
		}
	

		this.button_continue = new CustomButton(this.scene,  0, 290, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
		res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'purchase_complete', 'phrase_id': '3', 'values': [], 'base_size': 30});		
		temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
		temp.setOrigin(0.5);
		this.button_continue.add(temp);
		this.add(this.button_continue);
		
	},	

	anim_text(txt, val, timeout) {
		var _this = this;
		setTimeout(() => {
			if (_this.scene) game_data['scene'].tweens.add({targets: txt, scale: 1.2, duration: 300, onComplete: function(){
				if (_this.scene) {
					_this.counter_text(txt,val, function(){
						if (_this.scene) txt.text = val;
						if (_this.scene) game_data['scene'].tweens.add({targets: txt, scale: 1, duration: 300});
					})
				}
				
			}});
		}, timeout);
	},
	
	counter_text(txt, new_val, on_complete) {
		var _this = this;
		var _delay = (new_val - parseInt(txt.text)) > 5 ? 50 : 100
		//var obj = {'star': star, 'iter': iter, count: 0, 'old_val': old_val, 'new_val': new_val};
		var timer = this.scene.time.addEvent({
			delay: _delay,
			callback: ()=>{
				if (_this.scene) {
					var old_val = parseInt(txt.text);
					if (old_val < new_val) {
						old_val += 1;
						txt.text = old_val;
					}
					if (old_val >= new_val) {
						timer.paused = true;
						on_complete();
					}
				}
			},
			callbackScope: this,
			loop: true
		});
	},

handler_close(params) {  
	this.close_window();
},

close_window(params) {  	
	game_data['utils'].save_prev_boosters();
	game_data['game_engine'].boosters_panel.update_boosters();
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});