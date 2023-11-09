var TasksDaily = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function TasksDaily ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	var pos = [-120, -10, 100];
	this.items = [];
	for (var i = 0; i < pos.length; i++) {
		var item = new TaskItem();
		item.init(game_data['tasks']['set'][i], i);
		item.x = 0; item.y = pos[i];
		this.add(item);
		this.items.push(item);
		item.emitter.on('EVENT', this.handler_event, this); 
	}

	this.button_take = new CustomButton(this.scene, 0, 240, this.handler_take, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': '2', 'values': '', 'base_size': 28});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_take.add(temp)
	this.add(this.button_take);	

	this.time_left = new Phaser.GameObjects.Container(this.scene, 0, 195); 
	this.add(this.time_left)
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': '3', 'values': '', 'base_size': 28});		
	temp = new Phaser.GameObjects.Text(this.scene, -60, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.time_left.add(temp);
	var graphics;  
	var _x = temp.x + temp.width / 2 + 5;
	var key = 'tasks_daily4';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0xFFFFFF, 1);
		graphics.fillRoundedRect(5, 5, 130, 30, 10);
		graphics.generateTexture(key, 140, 40);
	}
	var t = new Phaser.GameObjects.Image(this.scene, _x + 63, 0, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.time_left.add(t);
    }

	temp = new Phaser.GameObjects.Image(this.scene, _x + 15, 0, 'common2', 'task_clock');
	this.time_left.add(temp);
	this.time_txt = new Phaser.GameObjects.Text(this.scene, _x + 76, 0, '23:59:59', { fontFamily: 'font1', fontSize: 24, color: '#000000'});			
	this.time_txt.setOrigin(0.5);
	this.time_left.add(this.time_txt);
	

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': '5', 'values': '', 'base_size': 30});		
	this.no_prize = new Phaser.GameObjects.Text(this.scene, 0, 195, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {width: 520}});			
	this.no_prize.setOrigin(0.5);
	this.no_prize.setLineSpacing(-4);
	this.add(this.no_prize);

	this.tip = new Phaser.GameObjects.Image(this.scene, 290, 195, 'common2', 'tip_icon');
	this.add(this.tip);
	this.init_tip();
	

	this.update_tasks();
	this.timer = this.scene.time.addEvent({
		delay: 200,
		callback: this.handler_timer,
		callbackScope: this,
		loop: true
	});

},	

update_tasks() {
	var finished = game_data['task_manager'].check_tasks_completed();
	this.button_take.visible = finished && game_data['user_data']['tasks']['allow_reward'];
	this.time_left.visible = !finished;
	this.no_prize.visible = (!this.button_take.visible && !this.time_left.visible);
},

handler_event(params) {

	switch (params['event']) {
		case 'update_tasks':
			this.update_tasks(params);
			break;
		default:
			this.emitter.emit('EVENT', params);
			break;
	}
},

init_tip() {
	var mobile = loading_vars['mobile'];
	this.tip_showed = false;
	this.tip.setInteractive();
	this.tid_tip = -1;
	if (mobile) this.tip.on('pointerup', this.show_tip_mobile, this)
	else {
		this.tip.on('pointerover', this.show_tip, this)
		this.tip.on('pointerout', this.hide_tip, this);
		this.tip.on('pointerup', ()=> {
			if (this.tip_showed) this.hide_tip(); 
			else this.show_tip();
		}, this);
	}

	this.tip_cont = new Phaser.GameObjects.Container(this.scene, 235, 75);
	this.add(this.tip_cont);
	this.tip_cont.alpha = 0;

	var graphics;
	var key = 'tasks_daily1';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x39352a, 0.9);
		graphics.lineStyle(3, 0xe3cc69, 1);
		graphics.fillRoundedRect(5, 5, 405, 320, 10);
		graphics.strokeRoundedRect(5, 5, 405, 320, 10);
		graphics.generateTexture(key, 415, 330);
	}
	var t = new Phaser.GameObjects.Image(this.scene, -130, -60, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.tip_cont.add(t);
    }
	
	var key = 'tasks_daily2';
	if (!game_data['graphics'][key]) {
		graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
		graphics.fillStyle(0x39352a, 0.5);
		graphics.lineStyle(2, 0xe3cc69, 1);
		graphics.fillRoundedRect(5, 5, 160, 190, 10);
		graphics.strokeRoundedRect(5, 5, 160, 190, 10);
		graphics.generateTexture(key, 170, 200);
	}
	var t = new Phaser.GameObjects.Image(this.scene, -20, -5, key);
    if (t) {
        game_data['graphics'][key] = true;
        this.tip_cont.add(t);
    }

	var icon = new Phaser.GameObjects.Image(this.scene, -200, 0, 'common2', game_data['tasks_settings']['daily_reward']);
	this.tip_cont.add(icon);

	var info = game_data['paid_chest_prize'][game_data['tasks_settings']['daily_reward']];
	var temp,s;

	var x1 = -63;
	var x2 = -40;
	var i = 0;
	var pos = [ -70, -28, 14, 56];
	var keys = {'money': 'coin', 'rating_score': 'score_icon_big' }
	for (s in info) {
		if (s in keys) temp = new Phaser.GameObjects.Image(this.scene, x1, pos[i], 'common1', keys[s]);
		else temp = new Phaser.GameObjects.Image(this.scene, x1, pos[i], 'common1', s + '_active');
		temp.setScale(40/temp.height)
		this.tip_cont.add(temp);
		temp = new Phaser.GameObjects.Text(this.scene, x2, pos[i], info[s]['min'] + ' - ' + info[s]['max'], 
					{fontFamily:"font1", fontSize: 20, color:'#FFFFFF', stroke: '#000000', strokeThickness: 3});				
		temp.setOrigin(0,0.5);
		this.tip_cont.add(temp);
		i += 1;
	}

	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': '8', 'values': [], 'base_size': 30});		
	var temp = new Phaser.GameObjects.Text(this.scene, -100, -155, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3,  align: 'center', wordWrap:{width: 370}});
	temp.setLineSpacing(-6);
	temp.setOrigin(0.5);
	this.tip_cont.add(temp);
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

handler_take() {
	if (game_data['user_data']['tasks']['allow_reward']) {
		game_data['utils'].update_stat({'type': 'task_reward', 'amount_inc': 1});
		this.handler_close(null);
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'paid_chest_open','chest_id': game_data['tasks_settings']['daily_reward'],
								'from_tasks': true, 'rating_type': game_data['rating_manager'].get_current_rating()['type']});
		
	}	
},

handler_timer() {
	if (this.scene) {
	let current_timestamp = game_data['utils'].get_time()
	// console.log((current_timestamp - game_data['start_timestamp']) / 1000, game_data['day_end_time'])
	// var timeout = game_data['day_end_time']
	var timeout = Math.round(game_data['day_end_time'] - ((current_timestamp - game_data['start_timestamp']) / 1000));
	var h = 0;
	var m = 0;
	var s = 0;
	var res = '';
	h = parseInt(timeout / 3600);
	timeout = timeout % 3600;
	m = parseInt(timeout / 60);
	s = timeout % 60;
	if (h > 0) res += String(h) + ':';
	if (h > 0 && m < 10) res += '0';
	res += String(m) + ':';
	if (s < 10) res += '0';
	res += String(s);
	if (this.scene) this.time_txt.text = res;
	}
},


handler_close(params) {  
	this.close_window(params);
},

close_window(params) {  
	this.timer.paused = true;
	this.timer.destroy();
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

destroy_window() {
	if (this.scene) {
		this.timer.paused = true;
		this.timer.destroy();
		this.removeAll(true);
	}
}
});