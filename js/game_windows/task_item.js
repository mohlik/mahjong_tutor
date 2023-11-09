var TaskItem = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function TaskItem()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(info, pos) {  
	var temp;
	this.pos = pos;
	this.info = info;
	info['progress'] = game_data['user_data']['tasks']['progress'][this.pos];
	this.allow_skip = true;
	temp = new Phaser.GameObjects.Image(this.scene,0, 0, "common1", "panel2");
	this.add(temp);

	this.task_icon = new Phaser.GameObjects.Container(this.scene, -277, 0); 
	this.add(this.task_icon)
	var values = [];
	var phrase = info['task_id'];
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common2", "task_icon_" + info['task_id']);
	this.task_icon.add(temp);

	if (info['task_id'] == 'rating_place') values = [info['type']];

	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': phrase, 'values': values, 'base_size': 22});		
	temp = new Phaser.GameObjects.Text(this.scene, -58, -20, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
	,align: 'left', wordWrap: {'width': 345}});			
	temp.setLineSpacing(-6);
	temp.setOrigin(0.5);
	this.add(temp);

	this.progress_bar = new Phaser.GameObjects.Container(this.scene, -228, 20); 
    this.add(this.progress_bar);
    this.progress_bar_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'pb_freeze_back');
    this.progress_bar_top = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'pb_freeze_top');
    this.progress_bar_line = new Phaser.GameObjects.Image(this.scene, 4, 0, 'common1', 'pb_freeze_line');
    this.progress_bar_bg.setOrigin(0,0.5);
    this.progress_bar_top.setOrigin(0,0.5);
    this.progress_bar_line.setOrigin(0,0.5);
	var scale = 340 / (this.progress_bar_bg.width);

    this.progress_bar_bg.setScale(scale, 1);
    this.progress_bar_top.setScale(scale + 0.01, 1);
    this.progress_bar_line.scaleY = 1;
    this.line_scale = (this.progress_bar_bg.displayWidth - 4) / this.progress_bar_line.width;
	this.progress_bar_line.scaleX = 0.01

	this.progress_bar.add(this.progress_bar_bg);
    this.progress_bar.add(this.progress_bar_line);
	this.progress_bar.add(this.progress_bar_top);

	this.progress_txt = new Phaser.GameObjects.Text(this.scene, 170, -1, '', { fontFamily: 'font1', fontSize: 24, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	this.progress_txt.setOrigin(0.5);
	this.progress_bar.add(this.progress_txt);

	if (!('progress' in info)) info['progress'] = 0;
	if (!('old_progress' in info)) info['old_progress'] = 0;
	this.skip_cost = game_data['tasks_settings']['default_skip_cost'];
	if ('skip_cost' in info) this.skip_cost = info['skip_cost'];
	
	
	this.button_skip = new CustomButton(this.scene, 190, 0, this.handler_skip, 'common1', 'shop_but1', 'shop_but2', 'shop_but3', this, null, null, 1);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'tasks_daily', 'phrase_id': '4', 'values': [], 'base_size': 26});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_skip.add(temp);

	temp = new Phaser.GameObjects.Text(this.scene, 103, 10, this.skip_cost, { fontFamily: 'font1', fontSize: 24, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});				
	temp.setOrigin(0.5);
	
	
	this.logo = new Phaser.GameObjects.Image(this.scene, temp.x + 2, -20, "common1", "money_ico_btn");
	this.logo.setOrigin(0.5)
	//this.logo.setScale(1.2);
	this.button_skip.add(this.logo);
	this.button_skip.add(temp);
	//temp.x -= this.logo.displayWidth / 2;
	//this.logo.x = temp.x + temp.width / 2 + this.logo.displayWidth / 2;
	this.add(this.button_skip);
	
	this.task_checkbox = new Phaser.GameObjects.Container(this.scene, 200, 0); 
	this.add(this.task_checkbox)
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'check_box_bg');
	this.task_checkbox.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'checkbox_icon');
	this.task_checkbox.add(temp);
	
	this.update_task();

	this.use_money_tip = false;
	if ((game_data['last_game_mode'] == 'video_only' || game_data['last_game_mode'] == 'offline')
		&& this.skip_cost > game_data['user_data']['money']) {
		this.use_money_tip = true
	}

},	

update_task(timeout = 500) {
	var info = this.info;
	var old_progress = info['old_progress'];
	var new_progress = info['progress'];
	var goal = info['goal'];

	this.button_skip.visible = info['progress'] < info['goal'];
	this.task_checkbox.visible = info['progress'] >= info['goal'];

	if (info['task_id'] == 'playtime') {
		new_progress = parseInt(info['progress'] / 60);
		old_progress = parseInt(info['old_progress'] / 60);
		goal = parseInt(info['goal'] / 60);
	}
	if (new_progress > goal) new_progress = goal;

	if (new_progress > old_progress) {
		this.progress_txt.text = String(old_progress) + '/' + String(goal);
		this.progress_bar_line.scaleX = (old_progress / goal) * this.line_scale;
		setTimeout(() => {
			this.anim_task_icon();
			setTimeout(() => { this.make_progress_anim(new_progress, goal); }, 300);
		}, timeout);
	}
	else {
		this.progress_txt.text = String(new_progress) + '/' + String(goal);
		this.progress_bar_line.scaleX = (new_progress / goal) * this.line_scale;
		
	}
	info['old_progress'] = info['progress'];
},

handler_skip() {
	var pt = game_data['utils'].toGlobal(this.logo, new Phaser.Geom.Point(0,0));
	if ((game_data['last_game_mode'] == 'video_only' || game_data['last_game_mode'] == 'offline') && this.skip_cost > game_data['user_data']['money']) {
		this.use_money_tip = true
	}
	if (this.use_money_tip) {
		game_data['utils'].show_money_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'no_money', 'phrase_id': '1', 'values': []});
	}
	else if (this.allow_skip) {
		var _this = this;
		this.allow_skip = false;
		var task_id = this.info['task_id'];
		
		var progress_old = game_data['user_data']['tasks']['progress'];
		var progress_new = [];
		var i;
		for (i = 0; i < progress_old.length; i++) {
			progress_new[i] = progress_old[i];
		}
		var task = this.info;
		progress_new[this.pos] = task['goal'];
		game_data['game_request'].request( {'skip_task': true, 'task_id': task_id, 'progress': progress_new, 'skip_cost': this.skip_cost},function(res){
			if ('success' in res && res['success']) {
				game_data['utils'].update_stat({'type': 'buy_skip_task', 'skip_task': true, 'amount_dec': _this.skip_cost, 'description': task_id});
				game_data['utils'].update_stat({'type': 'task_completed', 'amount_inc': 1});
				_this.info['progress'] = res['tasks']['progress'][_this.pos];
				game_data['utils'].fly_items({'amount': 3, 'holder': game_data['moving_holder'], 
							'item_atlas': 'common1', 'item_name': 'money_ico',
							'pt_start': game_data['game_map'].get_money_pt(), 'pt_end': pt}, 
				function(){
					_this.update_task(50);
					_this.emitter.emit('EVENT', {'event': 'update_money'});
				});
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'diamond_use'});
				_this.emitter.emit('EVENT', {'event': 'update_tasks'});
				
			}
			else {
				_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money'});
				_this.emitter.emit('EVENT', {'event': 'window_close'});
			}
		});
	}
},

anim_task_icon() {
	var _this = this;
	if (_this.scene) {
		game_data['scene'].tweens.add({targets: this.task_icon, scale: 1.1, duration: 200});
		game_data['scene'].tweens.add({targets: this.task_icon, scale: 1, duration: 200, delay: 250});
		game_data['scene'].tweens.add({targets: this.task_icon, scale: 1.1, duration: 200, delay: 500});
		game_data['scene'].tweens.add({targets: this.task_icon, scale: 1, duration: 200, delay: 750});
	}
},

make_progress_anim(new_progress, goal) {
	if (this.scene) {
		game_data['scene'].tweens.add({targets: this.progress_bar_line, scaleX: (new_progress / goal) * this.line_scale, duration: 500});
		setTimeout(() => {
			if (this.scene) this.progress_txt.text = String(new_progress) + '/' + String(goal);
		}, 250);
	}
	
	
}


});