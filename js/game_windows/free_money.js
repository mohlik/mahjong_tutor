var FreeMoney = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function FreeMoney (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var i;
	this.prev_params = null;
	this.has_task_warning = params['task_warning'];
	this.allow_close = true;
	
	this.coins_pt = game_data['game_map'].get_money_pt();

	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'free_coins', 'phrase_id': '1', 'values': [], 'base_size': 60});		
	var title = new Phaser.GameObjects.Text(this.scene, 0, -295, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#F5F75E', stroke: '#000000', strokeThickness: 3, align: 'center'});			
	title.setOrigin(0.5);
	this.add(title);
	

	var button_close = new CustomButton(this.scene, 450, -290, this.handler_close, 'common2', 'close_big1', 'close_big2', 'close_big3', this);
	this.add(button_close);
	var y_pos = title.y + 120;
	var x_pos = [[0], [-100, 100], [-200, 0, 200] ] ;

	var cont;
	this.tab_info = [];
	
	if (allow_rewarded_ads && (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'video_only')) {
		cont = new Phaser.GameObjects.Container(this.scene, 0, y_pos);
		this.add(cont);
		this.tab_info.push({'type': 'video', 'cont': cont});
	}

	if (game_data['utils'].get_passed_amount() >= game_data['tasks_start_level']) {
		this.task_warning = params['task_warning'];
		cont = new Phaser.GameObjects.Container(this.scene, 0, y_pos);
		this.add(cont);
		this.tab_info.push({'type': 'tasks', 'cont': cont});
	}

	var pos = x_pos[this.tab_info.length - 1];
	for (i = 0; i < this.tab_info.length; i++) {
		this.tab_info[i]['cont'].x = pos[i];
		this.add_button(this.tab_info[i]);
	}

	this.frame = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'bg_light');
	if (this.tab_info.length) {
		var default_tab = this.tab_info[0]['type'];
	//	if ('tab' in params) default_tab = params['tab'];
		for (i = 0; i < this.tab_info.length; i++) {
			if (this.tab_info[i]['type'] == default_tab) {
				var handler = this.tab_info[i]['handler']
				handler.apply(this, arguments); 
				break;
			}
		}
	}
	else this.handler_close();
	
},	

add_button(info) {
	var content = new Phaser.GameObjects.Container(this.scene, 0, 80);
	this.add(content);
	info.cont.content = content;
	content.type = info.type;
	if (info.type == 'video') this.add_video_button(info);
	if (info.type == 'tasks') this.add_tasks_button(info);
},

get_content(type) {
	for (var i = 0; i < this.tab_info.length; i++) {
		if (this.tab_info[i]['type'] == type) {
			return this.tab_info[i]['cont'].content;
		}
	}
},

show_content(type) {
	var show_content = null;
	for (var i = 0; i < this.tab_info.length; i++) {
		var content = this.tab_info[i]['cont'].content;
		if (this.tab_info[i]['type'] == type) {
			show_content = content;
			this.tab_info[i]['cont'].add(this.frame);
		}
		else game_data['scene'].tweens.add({targets: content, alpha: 0, duration: 200, onComplete: function(_tween, _target) {
			_target.visible = false;
		}});
	}
	if (show_content.alpha < 1 || !show_content.visible) {
		show_content.alpha = 0;
		show_content.visible = true;
		game_data['scene'].tweens.add({targets: show_content, alpha: 1, duration: 200, delay: 100});
	}
},

add_video_button(info) {
	var cont = info.cont;
	info.handler = this.handler_video;
	cont.panel = new CustomButton(this.scene, 0, 0, info.handler, 'common2', 'sales_bg_out', 'sales_bg_over', 'sales_bg_out', this);	
	cont.add(cont.panel);

	var temp = new Phaser.GameObjects.Image(this.scene, 0, -20, 'common2', 'free_coins_icon');
	cont.add(temp);

	var logo = new Phaser.GameObjects.Image(this.scene, 0, -4, 'common1', 'coin');
	logo.scale = 0.7;
	cont.add(logo);

	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'free_coins', 'phrase_id': '2', 'values': [], 'base_size': 26});
	temp = new Phaser.GameObjects.Text(this.scene, 0, 67, res['text'], {fontFamily: 'font1', fontSize: res['size'], color: '#F5F75E', stroke: '#000000', strokeThickness: 3, align:'center', wordWrap: {width:170}});
	temp.setLineSpacing(-5);
	cont.add(temp);
	temp.setOrigin(0.5,1);
},

handler_video() {
	var content = this.get_content('video');
	if (!content.has_assets) this.add_video_content(content);
	this.show_content('video');
},

add_video_content(content) {
	var wnd = new VideoReward(this.scene); 
	wnd.init({});
	wnd.emitter.on('EVENT', this.handler_event, this);
	content.add(wnd);
	content.wnd = wnd;
	content.has_assets = true;
},

add_tasks_button(info) {
	var cont = info.cont;
	info.handler = this.handler_tasks;
	cont.panel = new CustomButton(this.scene, 0, 0, info.handler, 'common2', 'piggy_bank_bg_out', 'piggy_bank_bg_over', 'piggy_bank_bg_out', this);	
	cont.add(cont.panel);

	var temp = new Phaser.GameObjects.Image(this.scene, 0, -20, 'common1', 'tasks_button');
	temp.scale = 1.2;
	cont.add(temp);
	
	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'free_coins', 'phrase_id': '4', 'values': [], 'base_size': 26});
	temp = new Phaser.GameObjects.Text(this.scene, 0, 67, res['text'], {fontFamily: 'font1', fontSize: res['size'], color: '#F5F75E', stroke: '#000000', strokeThickness: 3, align:'center', wordWrap: {width:170}});
	temp.setLineSpacing(-5);
	cont.add(temp);
	temp.setOrigin(0.5, 1);

	if (this.task_warning) {
		this.warning = new Phaser.GameObjects.Image(this.scene, 50, -40, 'common1', 'warning_icon');
		this.warning.setOrigin(0.5, 0.8);
		cont.add(this.warning);
		this.start_warning(this.warning);
	}
},

handler_tasks() {
	var content = this.get_content('tasks');
	if (!content.has_assets) this.add_tasks_content(content);
	this.show_content('tasks');
	if (this.warning) this.stop_warning(this.warning);
},

add_tasks_content(content) {
	var wnd = new TasksDaily(this.scene); 
	wnd.init({});
	wnd.y += 10;
	wnd.emitter.on('EVENT', this.handler_event, this);
	content.add(wnd);
	content.wnd = wnd;
	content.has_assets = true;
},


handler_event(params) {  
	switch (params['event']) {
		case 'unblock_close':
			this.allow_close = true;
			break;
		case 'block_close':
			this.set_block_close(params);
			break;
		case 'window_close': 
			this.handler_close(params)
			break;
		default:
			this.emitter.emit('EVENT', params);
			break;
	}
	
},

set_block_close(params) {
	this.allow_close = false;
	var timeout = params['timeout'];
	setTimeout(() => {
		this.allow_close = true;
	}, timeout);
},

handler_close(params) {  
	if (this.allow_close) this.close_window();
},

close_window(params) {  
	setTimeout(() => {
		if (this.scene) for (var i = 0; i < this.tab_info.length; i++) {
			var item = this.tab_info[i]['cont']
			if (item && item.content && item.content.wnd) item.content.wnd.destroy_window()
		}
		
	}, 250);
	this.emitter.emit('EVENT', {'event': 'update_money'});
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	


start_warning(mc) {
	if (!mc.visible) {
		mc.alpha = 0;
		mc.visible = true;
		game_data['scene'].tweens.add({targets: mc, alpha: 1, duration: 300});  
	}
	setTimeout(() => {this.run_anim(mc);}, 5000);
},

run_anim(mc) {
	var _this = this;
	if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: 15, duration: 100, onComplete: function(){
		if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: -15, duration: 100, onComplete: function(){
			if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: 12, duration: 80, onComplete: function(){
				if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: -12, duration: 80, onComplete: function(){
					if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: 10, duration: 80, onComplete: function(){
						if (_this.scene) game_data['scene'].tweens.add({targets: mc, angle: 0, duration: 80, onComplete: function(){
		
						}});  
					}});  
				}});  
			}});  
		}});  
	}});  
	if (mc.visible) {
		setTimeout(() => {this.run_anim(mc);}, 5000);
	}	
},


stop_warning(mc) {	
	game_data['scene'].tweens.add({targets: mc, alpha: 0, duration: 300, onComplete: function(){
		mc.visible = false;
	}});  
},


});