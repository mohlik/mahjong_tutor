var ChestManager = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function ChestManager ()
    {
        this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);    
		this.emitter = new Phaser.Events.EventEmitter();    
	},

	init() {
		this.chests = [];
		this.user_chests = [null,null,null,null];
		this.create_assets();
		this.update_manager(false, -1, true);
		this.has_anim = false;
		this.hided = true;
		this.chest_timer = this.scene.time.addEvent({
			delay: 1000,
			callback: this.handler_chest_timer,
			callbackScope: this,
			loop: true
		});
		this.chest_timer.type_timer = 'chest'
	},

	create_assets() {
		var pos = [0, 157, 314, 471];
		this.pos = pos;
		var i, temp,res;
		for (i = 0; i < pos.length; i++) {
			var chest = new Phaser.GameObjects.Container(this.scene, 0, pos[i]);
			this.add(chest);
			this.chests.push(chest);
			chest.bg = new CustomButton(this.scene, 0, 0, null, 'common1', 'chest_place_bg', 'chest_place_bg', 'chest_place_bg', this);
			chest.add(chest.bg);
			
			chest.shine = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'box_glow');
			chest.shine.alpha = 0.01;
			chest.add(chest.shine);

			chest.box = new Phaser.GameObjects.Container(this.scene, 0, 0);
			chest.add(chest.box);
			chest.wait = new Phaser.GameObjects.Container(this.scene, 0, -60);
			chest.add(chest.wait);
			temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'timer_panel2');
			chest.wait.add(temp);
			chest.wait.txt = new Phaser.GameObjects.Text(this.scene, 0, 0, '', {fontFamily:"font1", fontSize: 18, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
			chest.wait.txt.setOrigin(0.5);
			chest.wait.add(chest.wait.txt);

			chest.button = new Phaser.GameObjects.Container(this.scene, 0, 50);
			chest.add(chest.button)
			chest.button_open = new CustomButton(this.scene, 0, 0, ()=> {}, 'common1', 'button_mini1', 'button_mini2', 'button_mini3', this);
			chest.button.add(chest.button_open);
			chest.button_txt = new Phaser.GameObjects.Text(this.scene, 0, -1, '', {fontFamily:"font1", fontSize: 18, color:"#f6caa0",  stroke: '#000000', strokeThickness: 3});
			chest.button_txt.setOrigin(0.5);
			chest.button.add(chest.button_txt);
			this.add_listeners(chest, i);
		}
	},

	show_tip(no) {
		var pt = this.get_chest_pt(no);
		game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'chest_empty', 'phrase_id': '1', 'values': []});
	},

	add_listeners(chest, no) {
		chest.button_open.set_handler(() => {this.chest_clicked(no)});
		chest.shine.setInteractive();
		chest.shine.on('pointerdown', () => {this.chest_clicked_no = no}, this);
		chest.shine.on('pointerup', () => {if (this.chest_clicked_no == no) this.chest_clicked(no); else this.chest_clicked_no = -1}, this);
		chest.shine.on('pointerover', () => {
			game_data['scene'].tweens.add({targets: chest.shine, alpha: 1, duration: 200});
		}, this);
		chest.shine.on('pointerout', () => {
			game_data['scene'].tweens.add({targets: chest.shine, alpha: 0.01, duration: 200});
		}, this);
		//chest.bg.setInteractive();
		//chest.bg.on('pointerup', () => {this.show_tip(no)}, this);
		chest.bg.set_handler(() => {this.show_tip(no)});

	},


	update_language() {
		var res;
		var obj;
		var timeout;
		
		for (var i = 0; i < this.chests.length; i++) {
			obj = this.user_chests[i];
			var chest = this.chests[i];
			if (obj) {
				
				var phrase = '3';
				var phrase_val = [parseInt(game_data['chest']['timeout']['default'] / 3600)];
				
				if (obj['time_show'] > 0) phrase = '2';
				else if (obj['time_show'] == 0 || obj['timeout'] == 0) phrase = '7';
				else {
					timeout = game_data['chest']['timeout']['default'];
					var lvl = String(obj['level_id']);
					if (lvl && String(lvl) in game_data['chest']['timeout']) timeout = game_data['chest']['timeout'][lvl];
					if (timeout <= 60) {
						phrase = '4';
						phrase_val = [timeout];
					}
					else if (timeout <= 3600) {
						phrase = '5';
						phrase_val = [Math.ceil(timeout / 60)];
					}
					else {
						phrase = '3';
						phrase_val = [Math.ceil(timeout / 3600)];
					}
				}
				
				res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'chest_open', 'phrase_id': phrase, 'values': phrase_val, 'base_size': 18});
				chest.button_txt.setStyle({fontFamily:"font1", fontSize: res['size'], color:"#FFFFFF",  stroke: '#000000', strokeThickness: 3})
				chest.button_txt.text = res['text'];
			}
		}
	},

	handler_chest_timer() {
		var time_show = 0;
		var current_time = Math.round(game_data['utils'].get_time() / 1000);
		var obj;
		for (var i = 0; i < this.user_chests.length; i++) {
			obj = this.user_chests[i];
			if (obj && (obj['timeout'] > 0 || obj['time_show'] > 0)) {
				var prev_time_show = obj['time_show'];
				obj['time_prev'] = obj['time_show'];
				time_show = obj['timeout'] - (current_time - obj['timestamp']);
				if (time_show <= 0) time_show = 0;
				obj['time_show'] = time_show;
				if (time_show <= 0 && prev_time_show > 0) {
					this.update_language();
				}
			}
			
		}
		this.display();
	},

	update_manager(with_anim = false, _id = -1, is_init = false) {
		var i;
		var j;
		var obj;
		this.user_chests = [null,null,null,null];

		var current_time = Math.round(game_data['utils'].get_time() / 1000);
		for (i = 0; i < game_data['user_data']['chest'].length; i++) {
			obj = game_data['user_data']['chest'][i];
			this.user_chests[obj['id']] = obj;
			if (is_init || !('time_show' in obj)) {
				if ('timestamp' in obj) obj['timestamp'] = current_time;
				obj['time_show'] = obj['timeout'];
				obj['time_prev'] = obj['time_show'];
			}
		}

		for (i = 0; i < this.user_chests.length; i++) {
			var is_obj = this.user_chests[i] != null;
			var chest = this.chests[i];
			chest.shine.visible = is_obj;
			chest.box.visible = is_obj;
			chest.button.visible = is_obj;
			chest.wait.visible = is_obj && obj['time_show'] > 0;
			//chest.bg_txt.visible = !is_obj;
			if (is_obj) {
				var level_id = this.user_chests[i]['level_id'];
				var progress = game_data['chest']['prize']['progress'];
				for (j = progress.length - 1; j >= 0; j--) {
					if (level_id >= progress[j]['level_id']) {
						chest.box.removeAll(true);
						var temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'chest_mini1'); // + progress[j]['type']
						this.user_chests[i]['type'] = progress[j]['type'];
						chest.box.add(temp);
						break;
					}
				}
			}
		}

		this.display(with_anim, _id, is_init);
		this.update_language();
	},

	display(with_anim = false, _id = -1, is_init = false) {
		var i;
		var s;
		var obj;
		var mc;
		var hour;
		var min;
		var sec;
		var res;
		var upd_lang = false;;
		var left;
		var startable = true;
		var has_chests = false;
		for (i = 0; i < this.user_chests.length; i++) {
			obj = this.user_chests[i];
			var chest = this.chests[i];
			if (obj) {
				chest.wait.visible = (obj['time_show'] > 0);
				has_chests = true;
				if (obj['time_show'] > 0) {
					res = '';
					left = obj['time_show'];
					startable = false;
					hour = parseInt(left / 3600);
					if (hour > 0) res += String(hour) + ':'
					
					left = left - hour * 3600;
					
					min = parseInt(left / 60);
					sec = left % 60;
					if (min < 10) res += '0' + String(min) + ':';
					else res += String(min) + ':';
					
					if (sec < 10) res += '0' + String(sec);
					else res += String(sec);
					chest.wait.txt.text = res;
				}
				if ((obj['time_show'] == 0 && obj['time_prev'] && obj['time_prev'] > 0) || (obj['time_show'] == 0 && is_init)) {
					if (obj['time_show'] == 0 && obj['time_prev'] && obj['time_prev'] > 0)
						game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_end'});	
					obj['time_prev'] = obj['time_show'];
					game_data['notification_manager'].set_notification(chest, 'chest');
					upd_lang = true;
				}
			}
			else {
				game_data['notification_manager'].remove_notification(chest);
			}
		}
		if (upd_lang) this.update_language();
	},

	chest_clicked(no) {
		var _this = this;
		var obj = this.user_chests[no];

		if (obj && game_data['game_tutorial'].allow_action({'event': 'chest'})) {
			
			if (obj['time_show'] >= 0) {
				var delay = game_data['game_tutorial'].active_tutorial ? 400 : 10;
				setTimeout(() => {
					this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'chest_open', 'chest': obj
						,'rating_type': game_data['rating_manager'].get_current_rating()['type']});	
				}, delay);
				game_data['notification_manager'].remove_notification(_this.chests[no]);
			}
			else if (obj['timeout'] < 0) {
				game_data['game_request'].request( {'chest_start': true, 'id': obj['id']},function(res){
					if (res['success']) {
						var current_chest;
						for (var i = 0; i < res['chest'].length; i++) 
							if (res['chest'][i]['id'] == obj['id']) current_chest = res['chest'][i];
						current_chest['time_show'] = current_chest['timeout'];
						current_chest['time_prev'] = current_chest['time_show'];
						current_chest['timestamp'] = Math.round(game_data['utils'].get_time() / 1000);
						game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'chest_start'});
						_this.chests[no].wait.alpha = 0;
						_this.chests[no].wait.visible = true;
						game_data['scene'].tweens.add({targets: _this.chests[no].wait, alpha: 1, duration: 500});
						_this.update_manager();
						
					}
					else {
						_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'chest_wait'});
						_this.update_manager();
					}
				});
			}
		}
	},

	get_chest_pt(_id) {
		return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,this.pos[_id]));;
	},

	get_holes() {
		var pt = this.get_chest_pt(0);
		var chest = this.chests[0].bg.out;
		pt.y += 3;
		return [{'type': 'rect', 'pt': pt, 'w': chest.displayWidth + 2, 'h':  chest.displayHeight + 5, 'arrow': true, 'arrow_orientation': 'right' }]
	},

	show_anim(pt, on_complete = null) {
		if (!this.has_anim && !this.visible) {
			this.hided = false;
			this.has_anim = true;
			pt = game_data['utils'].toLocal(this, pt);
			var i;
			this.visible = true;
			var info = [
				{duration: 600, delay1: 450, delay2: 500},
				{duration: 450, delay1: 300, delay2: 350},
				{duration: 300, delay1: 150, delay2: 200},
				{duration: 150, delay1: 0, delay2: 50}
			];
			for (i = 0; i < this.chests.length; i++) {
				var chest = this.chests[i];
				chest.y = pt.y;
				chest.alpha = 0;
				chest.scale = 0.8;
				chest.visible = true;
				game_data['scene'].tweens.add({targets: chest, alpha: 1, scale: 1, duration: 50, delay: info[i].delay1});
				game_data['scene'].tweens.add({targets: chest, y: this.pos[i], duration: info[i].duration});
			}
			setTimeout(() => {
				if (on_complete) on_complete();
				this.has_anim = false;
			}, 700);
		}	
	},

	hide_anim(pt = null, on_complete = null, delay = 10) {
		if (!this.has_anim && this.visible) {
			this.hided = true;
			this.has_anim = true;
			var i;
			if (pt == null) {
				if (on_complete) on_complete();
				this.visible = false;
				for (i = 0; i < this.chests.length; i++) this.chests[i].visible = false;
				this.has_anim = false;
			}
			else {
				setTimeout(() => {
					pt = game_data['utils'].toLocal(this, pt);
					var i;
					var info = [
						{duration: 600, delay1: 100, delay2: 0},
						{duration: 450, delay1: 250, delay2: 150},
						{duration: 300, delay1: 400, delay2: 300},
						{duration: 150, delay1: 550, delay2: 450}
					];
					for (i = 0; i < this.chests.length; i++) {
						var chest = this.chests[i];
						chest.y = this.pos[i];
						chest.alpha = 1;
						chest.scale = 1;
						chest.visible = true;
						game_data['scene'].tweens.add({targets: chest, alpha: 0, scale: 0.8, duration: 50, delay: info[i].delay1});
						game_data['scene'].tweens.add({targets: chest, y: pt.y, duration: info[i].duration, delay: info[i].delay2});
					}
					setTimeout(() => {
						for (i = 0; i < this.chests.length; i++) this.chests[i].visible = false;
						this.visible = false;
						if (on_complete) on_complete();
						this.has_anim = false;
					}, 600);
				}, delay);
			}
		}
	}

});
