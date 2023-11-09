class GameUtils {
	constructor() {		        
	}
	
	init(scene) {
		this.Timelines = {};
		this.scene = game_data['scene'];
		this.emitter = new Phaser.Events.EventEmitter();
		this.create_overlay();
		this.more_games_allow_popup = true;
		game_data['game_request'] = new GameRequest();
		game_data['game_request'].init();
		this.wall_post_popups = 0;
		this.tournament_popups = 0;

		this.left_table = [
			{x: -1, y: -0.5},
			{x: -1, y: 0},
			{x: -1, y: 0.5}
		];
		
		this.right_table = [
			{x: 1, y: -0.5},
			{x: 1, y: 0},
			{x: 1, y: 0.5}
		];
		
		this.top_table = [
			{x: -0.5, y: -0.5},
			{x: 0, y: -0.5},
			{x: 0.5, y: -0.5},
			{x: -0.5, y: 0},
			{x: 0, y: 0},
			{x: 0.5, y: 0},
			{x: -0.5, y: 0.5},
			{x: 0, y: 0.5},
			{x: 0.5, y: 0.5}
		]; 

		this.bomb_table = [
			{x: -1, y: 0},
			{x: 1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
			{x: 1, y: -0.5},
			{x: -1, y: -0.5},
			{x: -1, y: 0.5},
			{x: 1, y: 0.5},
			{x: -0.5, y: -1},
			{x: -0.5, y: 1},
			{x: 0.5, y: 1},
			{x: 0.5, y: -1},
		]
	}

	checkOverlap(spriteA, spriteB, mode) {
		var boundsA = spriteA.getBounds();
		
		var boundsB = spriteB.getBounds();
		// return Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB).height;
		// if (Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB).height) 
		// console.log(Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB).height);
		if (mode === 'vertical') return Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB).height;
		else if (mode === 'horizontal') return Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB).width;
		else return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
	
	}
	
	show_booster_info({booster_id}) {
		this.booster_info = new Phaser.GameObjects.Container(this.scene, 150, 150);
		game_data.game_play.add(this.booster_info);
	
		let glow = new Phaser.GameObjects.Image(this.scene, 0,0, 'common1', 'gem_bottom_glow');
		glow.setScale(3);
		this.booster_info.add(glow);
		this.scene.tweens.add({
			targets: [glow],
			angle: 360,
			duration: 7000,
			repeat: -1
		});
	
		let booster = new Phaser.GameObjects.Image(this.scene, 0,0, 'common1', `${booster_id}_active`);
		this.booster_info.add(booster);
	
	
		var style = {fontFamily:"font1", fontSize: 40, align: 'center', color: '#fff', stroke: '#000', strokeThickness: 2, wordWrap: {'width': 250}}
	
		
		var res = game_data['utils'].generate_string({'scene_id': 'game_play', 'item_id': booster_id, 
															'phrase_id': 1, 'base_size': 38});
	
		style.fontSize = res['size']
		let text = new Phaser.GameObjects.Text(this.scene, 10, 120, res['text'], style);
		this.booster_info.add(text);
		text.setOrigin(0.5, 0);
	}
	
	hide_booster_info() {
		
		game_data.game_play.remove(this.booster_info);
		this.booster_info.destroy();
	}

	turn_around({item, repeat, duration = 600, ease = 'Sine.easeOut'}, on_complete = () => {}) {
		game_data['scene'].tweens.add({
			targets: item,
			duration,
			angle: 360,
			ease,
			repeat,
			onComplete: () => {
				on_complete()
			}
		})
	}
	
	load_game_play_bg(level_id, on_complete) {
		game_data['error_history'].push('gu12');
		var _this = this;
		var landscape = loading_vars['orientation'] == 'landscape';
		var total_maps = landscape ? 32 : 29;
		var path_part = landscape ? 'bgs_landscape/bg' : 'bgs/bg';
		if (level_id < 0) level_id = parseInt(Math.random() * (total_maps * 5));
		var no = (parseInt(level_id / 20) % total_maps) + 1;
		if (no < 1) no = 1;
		if (no > total_maps) no = total_maps
	
		if (!('loaded_game_play_bg' in game_data)) game_data['loaded_game_play_bg'] = {};
		var key = 'game_play_bg' + String(no);
		var temp;
		if (key in game_data['loaded_game_play_bg']) {
			temp = new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
			on_complete(temp);
		}
		else if (is_localhost || navigator.onLine){
			this.scene.load.image(key, game_data['urls']['assets'] + path_part + String(no) + '.jpg');
			this.scene.load.once('complete', function(){
				temp = new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
				game_data['loaded_game_play_bg'][key] = true;
				on_complete(temp);
			});
			this.scene.load.start();
		}
		else on_complete(null);
	}

	obj_neighbour = (obj, x, y, pool, depth) => {
		return pool.find((o) => { 
			const objX = (obj.x + x * 39.9 + depth.x),
				  objY = (obj.y + y * 57.4 + depth.y);
	
			return (o.x - objX > -1 && o.x - objX < 1) && (o.y - objY > -1 && o.y - objY < 1)
		})
	};
	
	create_overlay() {
		var rect = new Phaser.Geom.Rectangle(0, 0, loading_vars['W'], loading_vars['H']);
		var graphics = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } })
		graphics.fillRectShape(rect);
		graphics.generateTexture('dark_overlay', loading_vars['W'], loading_vars['H']);
		graphics.destroy();

		var rect2 = new Phaser.Geom.Rectangle(0, 0, game_data['dim']['photo'], game_data['dim']['photo']);
		var graphics2 = this.scene.add.graphics({ fillStyle: { color: 0x000000, alpha: 1 } })
		graphics2.fillRectShape(rect2);
		graphics2.generateTexture('looser_overlay', game_data['dim']['photo'], game_data['dim']['photo']);
		graphics2.destroy();
	}

	init_ads() {
		if ('ads_settings' in game_data && 'interstitial' in game_data['ads_settings']) {
			var start_level = game_data['ads_settings']['interstitial']['start_level'];; 
			if (loading_vars['platform'] && loading_vars['platform'] == 'IOS')
				start_level = game_data['ads_settings']['interstitial']['start_level_ios'];

			game_data['ads_settings']['interstitial']['start_level'] = start_level;
		}
	}
	
	init_loading() {
		this.loading_overlay = new LoadingOverlay(this.scene);
		this.scene.add.existing(this.loading_overlay);
		this.loading_overlay.visible = false;
		this.loading_overlay.alpha = 0;
		this.create_missclick();
	}

	
	create_missclick() {
		var config = {
			key: 'mistake_anim',
			frames: this.scene.anims.generateFrameNames('common1', { prefix: 'mistake_anim', end: 28, zeroPad: 4 }),
			repeat: 0,   
			showOnStart: true,
			hideOnComplete: true
		};
		this.scene.anims.create(config);
		this.mistake_anim = this.scene.add.sprite(-20,-20, 'mistake_anim');
		this.mistake_anim.setOrigin(0.5, 0.8);
		this.global_missclick_down = null
		this.global_missclick_up = null;
		this.global_missclick_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.scene.add.existing(this.global_missclick_holder);

	}


	
	add_orientation_notifier() {
		if (loading_vars['orientation'] == 'landscape' && !is_localhost && loading_vars['mobile']) {
			var _this = this;

			this.orientation_notifier = new Phaser.GameObjects.Container(this.scene, 0, 0);
			this.orientation_notifier.visible = false;
			if (game_data['scene'].sys.game.device.os.desktop) {}
			else {
				this.orientation_notifier_bg = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
				this.orientation_notifier_bg.setOrigin(0,0);
				this.orientation_notifier.add(this.orientation_notifier_bg)
				this.scene.add.existing(this.orientation_notifier);
				this.orientation_notifier_img = new Phaser.GameObjects.Image(this.scene, loading_vars['W']/2, loading_vars['H']/2, 'orientation_notifier');
				this.orientation_notifier.add(this.orientation_notifier_img)
				this.orientation_notifier_bg.setInteractive();
				window.onresize = function (){
					if(window.innerWidth > window.innerHeight){
						_this.hide_orientation_notifier();
					}
					else{
						_this.show_orientation_notifier();
					}
				};
				if(window.innerWidth < window.innerHeight) this.show_orientation_notifier();
			}
		}
	}

	show_orientation_notifier() {
		this.orientation_notifier.alpha = 0;
		this.orientation_notifier.visible = true;
		game_data['scene'].tweens.add({targets: this.orientation_notifier, alpha: 1, duration: 400});
	}

	hide_orientation_notifier() {
		this.orientation_notifier.visible = false;
	}
	
	add_loading(on_complete = null, alpha = 1) {
		this.loading_overlay.visible = true;
		this.loading_overlay.start(alpha);
		game_data['loading_last_time'] = this.get_time();
		game_data['scene'].tweens.add({targets: this.loading_overlay, alpha: 1, duration: 100, onComplete: function(){
			if (on_complete) on_complete();
		}});
	}
	remove_loading(on_complete = null, quick = false) {
		var def_time = 1000;
		var _this = this;
		var timeout = this.get_time() - game_data['loading_last_time'];
		if (timeout < def_time) timeout = def_time - timeout;
		else if (timeout > def_time) timeout = 10;
		if (quick) timeout = 10;
		setTimeout(() => {
			game_data['scene'].tweens.add({targets: this.loading_overlay, alpha: 0, duration: 100, onComplete: function(){
				_this.loading_overlay.visible = false;
				_this.loading_overlay.stop();
			}});
			if (on_complete) on_complete();
		}, timeout);
	}
	
	
	assign_to_global_missclick(obj) {
		var _this = this;
		obj.on('pointerdown', function(pointer) {  
			var _id = parseInt(Math.random() * 1000000);
			_this.global_missclick_down = _id;
			if (_this.global_missclick_up == null) _this.global_missclick_up = _id;
		});
		obj.on('pointerup', function(_pointer) { 
			if (_pointer && _this.mistake_anim && _this.global_missclick_up == _this.global_missclick_down) {
				_this.make_global_missclick(_pointer);
			}
			_this.global_missclick_up = null;
		});
	}
	make_global_missclick(pointer = null) {
		if (pointer == null) pointer = this.scene.input.activePointer;
		var pt = new Phaser.Geom.Point(pointer['worldX'], pointer['worldY']);
		this.mistake_anim.x = pt.x;
		this.mistake_anim.y = pt.y;
		this.global_missclick_holder.add(this.mistake_anim);
		this.mistake_anim.play('mistake_anim');
		game_data['audio_manager'].sound_event({'event': 'sound_event', 'play': true, 'sound_name': 'wrong_click'});
	}


	load_xmls_preloaded(on_complete) {
		setTimeout(() => {
		this.read_tutorial()
		this.read_levels();
		this.read_language();
		this.read_tournaments();
		on_complete();	
		}, 20);
	}

	read_tutorial() {
		game_data['error_history'].push('gu3');
		var i;
		var j;
		var k;
		var item_id;
		var pers_id;
		var langs = game_data['langs'];
		var lang_id;			
		var game_text = {
			'game_map': {},            
			'game_play': {},  
			'story': {}
		};
		var tutorial_xml = phaser_game.cache.xml.get('tutorial_xml'); 
		var game_map_tags = tutorial_xml.getElementsByTagName("GAME_MAP");
		var game_play_tags = tutorial_xml.getElementsByTagName("GAME_PLAY");
		var story_tags = tutorial_xml.getElementsByTagName("STORY");
		
		for(i = 0; i < game_map_tags.length; i++){
			item_id = game_map_tags[i].getAttributeNode("id").textContent;
			pers_id = game_map_tags[i].getAttributeNode("pers_id").textContent;
			game_text['game_map'][item_id] = {};
			if (pers_id)
			game_text['game_map'][item_id]['pers_id'] = pers_id;
			for (j = 0; j < langs.length; j++) {
				lang_id = langs[j].toUpperCase();
				game_text['game_map'][item_id][lang_id] = new Array();
				for (k = 0; k < game_map_tags[i].getElementsByTagName(lang_id).length; k++)
					game_text['game_map'][item_id][lang_id].push(game_map_tags[i].getElementsByTagName(lang_id)[k].textContent);
			}
		}
		for(i = 0; i < game_play_tags.length; i++){
			
			item_id = game_play_tags[i].getAttributeNode("id").textContent;
			game_text['game_play'][item_id] = {};
			
			for (j = 0; j < langs.length; j++) {
				lang_id = langs[j].toUpperCase();
				game_text['game_play'][item_id][lang_id] = new Array();
				for (k = 0; k < game_play_tags[i].getElementsByTagName(lang_id).length; k++)
					game_text['game_play'][item_id][lang_id].push(game_play_tags[i].getElementsByTagName(lang_id)[k].textContent);
			}
			
		}     
		
		for(i = 0; i < story_tags.length; i++){
			item_id = story_tags[i].getAttributeNode("id").textContent;
			game_text['story'][item_id] = {};
			
			for (j = 0; j < langs.length; j++) {
				lang_id = langs[j].toUpperCase();
				game_text['story'][item_id][lang_id] = new Array();
				for (k = 0; k < story_tags[i].getElementsByTagName(lang_id).length; k++)
					game_text['story'][item_id][lang_id].push(story_tags[i].getElementsByTagName(lang_id)[k].textContent);
			}
		}
		game_data['tutorials'] = game_text;        							
	}   
	
	is_map() {
		return game_data['current_scene'] === 'MAP'
	}

	is_gameplay() {
		return game_data['current_scene'] === 'GAMEPLAY'
	}
	
	
  	read_language() {
		game_data['error_history'].push('gu2');
		var i;
		var j;
		var game_text = {};
		var langs = game_data['langs'];
		var scene_id;
		var phrase_id;
		var item_id;	
		var lang_id;
		var _lang;
		var language_xml = phaser_game.cache.xml.get('language_xml'); 

		var phrases = language_xml.getElementsByTagName("DYNAMIC_PHRASE");
		for(i = 0; i < phrases.length; i++){			
			scene_id = phrases[i].getAttributeNode("scene_id").textContent;
			item_id = phrases[i].getAttributeNode("item_id").textContent;
			phrase_id = phrases[i].getAttributeNode("phrase_id").textContent;	

			if (!(scene_id in game_text))
				game_text[scene_id] = {};
			if (!(item_id in game_text[scene_id]))
				game_text[scene_id][item_id] = {};
			if (!(phrase_id in game_text[scene_id][item_id]))
				game_text[scene_id][item_id][phrase_id] = {};
			
			
			for (j = 0; j < langs.length; j++) {
				lang_id = langs[j].toUpperCase();		
				if (phrases[i].getElementsByTagName(lang_id)[0]) _lang = lang_id;
				else _lang = 'EN';
				game_text[scene_id][item_id][phrase_id][lang_id] = {
					'text':  phrases[i].getElementsByTagName(_lang)[0].getElementsByTagName("TEXT")[0].textContent,
					'size':  parseInt(phrases[i].getElementsByTagName(_lang)[0].getElementsByTagName("SIZE")[0].textContent)
				};				
			}																
		}	
	 
		game_data['language'] = game_text;							
} 
	
	read_tournaments() {
			var tournament = {}
			var i,j;
			var ret = []
			var tournament_id;
			var tournaments_xml = phaser_game.cache.xml.get('tournaments_xml'); 
			var tags = tournaments_xml.getElementsByTagName("T");
			
			for(i = 0; i < tags.length; i++){	
				tournament_id = tags[i].getAttributeNode("id").textContent;
				tournament = {};
				tournament['id'] = tournament_id;
				var _tags;
				_tags = tags[i].getElementsByTagName("LVL");
				tournament['levels'] = _tags[0].textContent.split(",");
				tournament['fill_rate'] = [];
				tournament['speed'] = [];
				for (j = 0; j < tournament['levels'].length; j++) {
					tournament['fill_rate'].push(game_data['fill_rate_default'])
					tournament['speed'].push(game_data['competitor_mult']['default_speed']);
				}
				
				if (tags[i].getElementsByTagName("FILL_RATE")[0]) {
					_tags = tags[i].getElementsByTagName("FILL_RATE");
					var extra = _tags[0].textContent.split(",");
					for (j = 0; j < extra.length; j++) {
						if (j < tournament['fill_rate'].length)
							tournament['fill_rate'][j] = parseFloat(extra[j]);
					}
				}
				if (tags[i].getElementsByTagName("SPEED")[0]) {
					_tags = tags[i].getElementsByTagName("SPEED");
					var extra = _tags[0].textContent.split(",");
					for (j = 0; j < extra.length; j++) {
						if (j < tournament['speed'].length)
							tournament['speed'][j] = parseFloat(extra[j]);
					}
				}
				ret.push(tournament);
			}

			game_data['levels'] = ret;
			game_data['original_levels_amount'] = game_data['levels'].length
			game_data['total_levels'] = game_data['original_levels_amount']
	}


	read_levels() {
		var i;
		var level;
		var levels = {};

		var levels_xml = phaser_game.cache.xml.get('levels_xml'); 

		var level_tags = levels_xml.getElementsByTagName("LEVEL");

		game_data['levels_xml'] = levels_xml;
		
		var limit = game_data['is_standalone'] && loading_vars['net_id'] != 'steam' ? game_data['standalone_level_limit'] : level_tags.length;
		var level_type = 'match3';
		var generate = game_data['generate_levels'] && game_data['generate_levels']['active'];
		game_data['levels_to_write'] = [];
		for(i = 0; i < limit; i++){	
			level = {};
			level['level_id'] = level_tags[i].getAttributeNode("level_id").textContent;
			
			level['tag_pos'] = i;
			level['level_type'] = level_type;
			if (level_tags[i].getAttributeNode("type"))
				level['level_type'] = level_tags[i].getAttributeNode("type").textContent;
			level['parsed'] = false;      
			levels[String(level['level_id'])] = level;

			if (parseInt(level['level_id']) >= game_data['generate_levels']['id_start']) {
				if (level['level_type'] == level_type && !(level_tags[i].getElementsByTagName("MONSTER_ID")[0])) {
					game_data['levels_to_write'].push(parseInt(level['level_id']));
				}
			}
		}   
		game_data['global_level_type'] = level_type;
		game_data['levels_data'] = levels;       
		if (generate) this.generate_levels();
	}
	
	generate_levels() {
		var arr = this.get_generate_copy();
		var start = game_data['generate_levels']['start'];
		var end = game_data['generate_levels']['end'];
		var b_base = game_data['generate_levels']['b_base'];
		var i,j;
		var res = '';
		var t = '';
		var lvl = '';
		var pos;
		var ds = game_data['competitor_mult']['default_speed'];
		var sp = String(ds - 0.05) + ',' + String(ds) + ',' + String(ds + 0.05) + ',';
		for (i = start; i <= end; i++) {
			lvl = '';
			t = '<T id="' + String(i) + '">\n';
				for (j = 1; j <= 3; j++) {
					if (arr.length < 1) arr = this.get_generate_copy();
					pos = parseInt(Math.random() * arr.length);
					lvl = lvl + String(arr[pos]);
					
					if (j < 3) {
						lvl = lvl + ',';
					}
					arr.splice(pos,1);
				}
				
			t = t + '<LVL>' + lvl + '</LVL>\n';
			t = t + '<SPEED>' + sp + '</SPEED>\n';
			t = t + '</T>\n';
			res = res + t;
		}
		console.log(res);
	}

	get_generate_copy() {
		var arr = [];
		for (var i = 0; i < game_data['levels_to_write'].length; i++) {
			arr.push(game_data['levels_to_write'][i]);
		}
		return arr;
	}

	parse_level(level_id, is_extending_game) {
		var levels = game_data['levels_data'];
		var orientation = loading_vars['orientation'].toUpperCase();
		if (!levels[level_id]['parsed']) {
			var levels_xml = game_data['levels_xml']; 
			var level_tags = levels_xml.getElementsByTagName("LEVEL");                   
			var level = levels[level_id];
			var LEVEL = level_tags[level['tag_pos']]; 
			

			var FIELDS;
			var k;
			var i;
			var j;
			var arr;
			var field;

				level['moves'] = parseInt(LEVEL.getElementsByTagName("MOVES")[0].textContent);
				level['possible_normal_orig'] = this.int_array(LEVEL.getElementsByTagName("POSSIBLE_NORMAL")[0].textContent.split(','));
				level['possible_normal'] = [];
				for (i = 0; i < level['possible_normal_orig'].length; i++) {//используем только 5 фишек
					level['possible_normal'][i] = i + 1;
				}

					level['possible_mark'] = [];


				if (LEVEL.getElementsByTagName("POSSIBLE_BONUS")[0] && 
					LEVEL.getElementsByTagName("POSSIBLE_BONUS")[0].textContent != '0' &&
					LEVEL.getElementsByTagName("POSSIBLE_BONUS")[0].textContent.length > 0)

					level['possible_bonus'] = this.int_array(LEVEL.getElementsByTagName("POSSIBLE_BONUS")[0].textContent.split(','));
				else if (is_extending_game)
					level['possible_bonus'] = [1]
				else
					level['possible_bonus'] = [];

					
				// Потом убрать!!!!!!!!
				if ( level['possible_bonus'].includes(2))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(2), 1);
				if ( level['possible_bonus'].includes(4))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(4), 1);
				if ( level['possible_bonus'].includes(7))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(7), 1);
				if ( level['possible_bonus'].includes(8))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(8), 1);
				if ( level['possible_bonus'].includes(9))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(9), 1);
				if ( level['possible_bonus'].includes(10))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(10), 1);
				if ( level['possible_bonus'].includes(11))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(11), 1);
				if ( level['possible_bonus'].includes(12))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(12), 1);
				if ( level['possible_bonus'].includes(13))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(13), 1);
				if ( level['possible_bonus'].includes(14))  level['possible_bonus'].splice(level['possible_bonus'].indexOf(14), 1);
				
				if (LEVEL.getElementsByTagName("REPRODUCTIVITY")[0]) {
					level['reproductivity'] = {};
					if (LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("D")[0])
						level['reproductivity']['D'] = parseInt(LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("D")[0].textContent);
					if (LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("E")[0])
						level['reproductivity']['E'] = parseInt(LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("E")[0].textContent);
					if (LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("F")[0])
						level['reproductivity']['F'] = parseInt(LEVEL.getElementsByTagName("REPRODUCTIVITY")[0].getElementsByTagName("F")[0].textContent);
					

				}	

				level['fields'] = [];
				FIELDS = LEVEL.getElementsByTagName("FIELD");
				var use_tiles = level_id == '1_1' || level_id == '1_2' || level_id == '1_3' 
								|| level_id == '2_1' || level_id == '2_2' || level_id == '2_3'
								|| level_id == '3_1' || level_id == '3_2' || level_id == '3_3'
				let not_allowed_bonus = [2, 4, 7, 8, 9, 10, 11, 12, 13, 14];
				for(i = 0; i < FIELDS.length; i++){
					var total_tiles = 0;
					field = {
						'cells': new Array(),
						'items': new Array(),
						'blocks': new Array(),
						'tiles': new Array(),
						'locks': new Array(),
						'tutorial1': new Array(),
						'tutorial2': new Array()
					};
					if (FIELDS[i].getElementsByTagName("TUTORIAL")[0]) {
						var tut_info = FIELDS[i].getElementsByTagName("TUTORIAL")[0];
						var tut_obj = tut_info.getElementsByTagName(orientation)[0].textContent;
						tut_obj = JSON.parse(tut_obj);
						field['tutorial'] = tut_obj;
					}
					
					for(j = 0; j < FIELDS[i].getElementsByTagName("CELLS").length; j++) {
						arr = FIELDS[i].getElementsByTagName("CELLS")[j].textContent.split(",");
						field['cells'].push(arr);

						if (FIELDS[i].getElementsByTagName("ITEMS")[0])   {
							var line = FIELDS[i].getElementsByTagName("ITEMS")[j].textContent.split(",");
							for (k = 0; k < line.length; k++) {

								not_allowed_bonus.forEach(nab => {
									if (line.includes(`Q${nab}`)) {
										line.splice(line.indexOf(`Q${nab}`), 1, '-');
									}
								});

								var spl = line[k].split('N');
								if (spl.length > 1) {
									var gem = parseInt(spl[1]);
									var def = 'N1';
									if (level['possible_normal_orig'].indexOf(gem) >= 0) {
										def = 'N' + String(level['possible_normal_orig'].indexOf(gem) + 1);
									}
									line[k] = def;
								}
							}
							field['items'].push(line);
						}
						else
							field['items'].push(this.empty_line(arr.length));

						if (FIELDS[i].getElementsByTagName("BLOCKS")[0])   
							field['blocks'].push(FIELDS[i].getElementsByTagName("BLOCKS")[j].textContent.split(","));
						else
							field['blocks'].push(this.empty_line(arr.length));

						if (FIELDS[i].getElementsByTagName("TILES")[0] && use_tiles) {
							field['tiles'].push(FIELDS[i].getElementsByTagName("TILES")[j].textContent.split(","));
						}
						else field['tiles'].push(this.fill_line(arr,'1'));
						total_tiles += arr.length;
							
						if (FIELDS[i].getElementsByTagName("LOCKS")[0])   
							field['locks'].push(FIELDS[i].getElementsByTagName("LOCKS")[j].textContent.split(","));
						else
							field['locks'].push(this.empty_line(arr.length));

						if (FIELDS[i].getElementsByTagName("TUTORIAL1")[0])   
							field['tutorial1'].push(FIELDS[i].getElementsByTagName("TUTORIAL1")[j].textContent.split(","));
						else
							field['tutorial1'].push(this.empty_line(arr.length));

						if (FIELDS[i].getElementsByTagName("TUTORIAL2")[0])   
							field['tutorial2'].push(FIELDS[i].getElementsByTagName("TUTORIAL2")[j].textContent.split(","));
						else
							field['tutorial2'].push(this.empty_line(arr.length));
					  
					}
					field['total_tiles'] = total_tiles;
					level['fields'].push(field);
					
				}
				// console.log(level)
				levels[level_id]['total_tiles'] = total_tiles;
				levels[level_id]['parsed'] = true;
		}
	}

	zeros(num) {
		var arr = [];
		for (var i = 0; i < num; i++) arr.push(0);
		return arr;
	}
	
	int_array(arr) {
		var res = [];
		for (var i = 0; i < arr.length; i++)
			if (arr[i] == '-')
				res.push(-1);
			else	
				res.push(parseInt(arr[i]));
		return res;
	}    

	empty_line(len) {
		var res = []
		for (var i = 0; i < len; i++)
			res.push('-');
		return res;
	} 
	
	fill_line(arr,val) {
		var res = []
		for (var i = 0; i < arr.length; i++)
			res.push(arr[i] == '-' ? '-' : val);
		return res;
	} 


	toLocal(container, pt) {
		var containers = [];
		var parent_contaiter = container;
		var holder;
		if (pt) var new_pt = new Phaser.Geom.Point(pt.x, pt.y);
		else var new_pt = new Phaser.Geom.Point(0,0);
		
		
		while (parent_contaiter && parent_contaiter != this.scene) {
			containers.push(parent_contaiter);
			parent_contaiter = parent_contaiter.parentContainer;
		}
		
		while(containers.length > 0) {
			holder = containers.pop();
			new_pt.x = (new_pt.x - holder.x) / holder.scaleX;
			new_pt.y = (new_pt.y - holder.y) / holder.scaleY;			
		}
		
		 return new_pt;
		}
		
	toGlobal(container, pt) {
			if (pt) var new_pt = new Phaser.Geom.Point(pt.x, pt.y);
			else var new_pt = new Phaser.Geom.Point(0,0);
	
			var parent_contaiter = container;
			while (parent_contaiter && parent_contaiter != this.scene) {
					new_pt.x = new_pt.x * parent_contaiter.scaleX + parent_contaiter.x;
					new_pt.y = new_pt.y * parent_contaiter.scaleY + parent_contaiter.y;
					parent_contaiter = parent_contaiter.parentContainer;
			}
			return new_pt;		
	}

	fly_items(params, on_complete) {
		game_data['error_history'].push('gu6');
		game_data['allow_fly'] = true;
		var i;
		var amount = params['amount'];
		var delay = 50;			
		var func;

		for (i = 0; i < amount; i++) {
				func = (i == amount - 1) ? on_complete : function(){};
				this.show_moving_item(params, delay * i, func);
		}
	}

	get_sound_delay(num) {
			//время когда выдавать звук гуську
			var delay = 600;
			if (num > 2) delay += 50 * (num - 2);
			return delay;
	}

	show_moving_item(params, delay, on_complete) {
		var item_atlas = params['item_atlas'];
		var item_name = params['item_name'];
		var holder = params['holder'];
		var pt_start = this.toLocal(holder, params['pt_start']);
		var pt_end = this.toLocal(holder, params['pt_end']);

		var item = new Phaser.GameObjects.Image(this.scene, 0, 0, item_atlas, item_name);
		item.x = pt_start.x;
		item.y = pt_start.y;
		if (holder && holder.scene) {
			holder.add(item);
			//if (item_name == 'coin') item.setScale(0.6, 0.6);

			var _this = this;

			var temp_pt = this.toGlobal(holder, pt_start);
			var _x = loading_vars['W'] / 2;
			var _y = loading_vars['H'] / 2;
			if (temp_pt.y  > _y) _y = loading_vars['H'] * 0.2;
			if (temp_pt.x > _x) _x = temp_pt.x;
			var pt_mid = new Phaser.Geom.Point(_x, _y);
			pt_mid = this.toLocal(holder, pt_mid);
			setTimeout(() => {
				game_data['utils'].bezier(pt_start, pt_mid, pt_end, item, 500, 'Sine.easeOut', _this, function(){
					_this.add_light_stars(params['pt_end'], holder, on_complete);
					item.destroy();
				});   


			}, delay);
		}		
	}

	add_light_stars(_pt, holder, on_complete) {
		if (!('allow_fly' in game_data)) game_data['allow_fly'] = true;
		if (game_data['allow_fly']) {
			game_data['error_history'].push('gu7');
			var star_light;
			var diff_x;
			var diff_y;
			var radius = 30;
			var light_stars_number = 15;	
			var pt = this.toLocal(holder, _pt);
			var func;
			
			for (var i = 0; i < light_stars_number; i++) {
					star_light = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'light_star');
					star_light.x = pt.x - (Math.random() - 0.5) * 20;
					star_light.y = pt.y - (Math.random() - 0.5) * 20;
					diff_x = 2 * radius * Math.random() - radius;
					diff_y = Math.sqrt(radius * radius - diff_x * diff_x) * (2 * Math.floor(2 * Math.random()) - 1);
					func = (i == light_stars_number - 1) ? on_complete : null;
					this.move_light_star(star_light, new Phaser.Geom.Point(star_light.x + diff_x, star_light.y + diff_y), holder, func);
			}
		}
	}

	move_light_star(star_light, pt, holder, on_complete = null) {
			if (holder && holder.scene) holder.add(star_light);			
			var _this = this;
			game_data['scene'].tweens.add({targets: star_light, x: pt.x, y: pt.y, duration: 100 + 150 * Math.random(), onComplete: function(){
					game_data['scene'].tweens.add({targets: star_light, alpha: 0, duration: 100, onComplete: function(){
							star_light.destroy();
							if (on_complete) {
								game_data['error_history'].push('gu7e');
								on_complete();
							}
					}});
			}});					
	}
	bezier(start_pt, mid_pt, end_pt, item, _duration, _ease, scope, on_complete = null, extra_mid_pt = null, delay = 0, emitter = null, emitter_pos_mod = {x: 0, y: 0}) {
		var curve;
		let allow_stop_emitter = false;
		let stop_emitter_level = 0.9;
		if (emitter) {
			emitter.stop();
			allow_stop_emitter = true;
		}
		if (extra_mid_pt != null) curve = new Phaser.Curves.CubicBezier(start_pt, extra_mid_pt, mid_pt, end_pt);
		else curve = new Phaser.Curves.QuadraticBezier(start_pt, mid_pt, end_pt);
		item.bezier_val = 0;
		
		game_data['scene'].tweens.add({
			targets: item, bezier_val: 1,
			duration: _duration,
			delay: delay,
			ease: _ease,
			callbackScope: scope,
			onUpdate: function(tween, target){
				var position = curve.getPoint(item.bezier_val);
				item.x = position.x;
				item.y = position.y;
				if (allow_stop_emitter && item.bezier_val > stop_emitter_level) {
					emitter.stop();
					allow_stop_emitter = false;
				}
				else if (emitter) {
					emitter.setPosition(item.x + emitter_pos_mod.x, item.y + emitter_pos_mod.y);
				}
			},
			onComplete: function(){
				item.x = end_pt.x;
				item.y = end_pt.y;
				
				if (allow_stop_emitter) emitter.stop();
				
				
				if (on_complete) on_complete();
			}
		});
		if (emitter) emitter.start();
	}

	add_tween(config) {
		if (this && this.scene)
		return this.scene.tweens.add(config);
	}
	
	init_tips() {
		this.tip_overlay = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.tip_overlay.visible = false;
		this.scene.add.existing(this.tip_overlay);
		this.tip_dark = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.tip_dark.setOrigin(0,0);
		this.tip_dark.alpha = 0.4;
		this.tip_overlay.add(this.tip_dark)
		
		this.tip_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tip_bg');
		this.tip_bg_origin = 0.04;
		this.tip_bg.setOrigin(this.tip_bg_origin, 0);
		this.tip_overlay.add(this.tip_bg);
		this.tip_dark.setInteractive();
		this.tip_dark.on('pointerup', this.hide_tip, this);


		this.money_tip_overlay = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.money_tip_overlay.visible = false;
		this.scene.add.existing(this.money_tip_overlay);
		this.money_tip_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tip_bg');
		this.money_tip_bg_origin = 0.04;
		this.money_tip_bg.setOrigin(this.money_tip_bg_origin, 0);
		this.money_tip_bg.scale = 0.7;
		this.money_tip_overlay.add(this.money_tip_bg);
		this.money_tip_bg.setInteractive({pixelPerfect: true});
		this.money_tip_bg.on('pointerdown', this.hide_money_tip, this);
	}

	place_tip(type, bg, holder, _pt) {

		var origin = this.tip_bg_origin;
		
		var w = bg.displayWidth;;
		var h = bg.displayHeight;
		var pt = this.toLocal(holder, _pt);
		var shift_mod_y = 8;
		var shift_mod_x = 4;
		if (type == 'money_tip') {
			origin = this.money_tip_bg_origin;			
			shift_mod_y = 5;
			shift_mod_x = 2;
		}
		var tx = pt.x;
		var ty = pt.y;
		var pos1 = (pt.y < loading_vars['H'] - h) ? 'top' : 'down';
		var pos2 = (pt.x < loading_vars['W'] - w) ? 'left' : 'right';
		var position = pos1 + '_' + pos2;
		var scaleX = Math.abs(bg.scaleX);
		var scaleY = Math.abs(bg.scaleY);
		if (position == 'top_left') {
			tx += w * (0.5 - origin) + shift_mod_x;
			ty += h * 0.5 + shift_mod_y;

		}
		if (position == 'top_right') {
			scaleX *= -1;
			tx -= w * (0.5 - origin) - shift_mod_x;
			ty += h * 0.5 + shift_mod_y;
		}
		if (position == 'down_left') {
			scaleY *= -1;
			tx += w * (0.5 - origin) + shift_mod_x;
			ty -= h * 0.5 + shift_mod_y;
		}
		if (position == 'down_right') {
			scaleX *= -1;
			scaleY *= -1;
			tx -= w * (0.5 - origin) - shift_mod_x;
			ty -= h * 0.5 + shift_mod_y;
		}
		bg.setScale(scaleX,scaleY);
		bg.x = pt.x;
		bg.y = pt.y;

		return {tx: tx, ty: ty};
	}

	show_money_tip(params) {
		var _this = this;
		var holder = this.money_tip_overlay;
		if (holder.tween) holder.tween.stop();
		if (this.money_tip_text) this.money_tip_text.destroy();
		var txt_pos = this.place_tip('money_tip', this.money_tip_bg, holder, params['pt']);
		var tx = txt_pos.tx;
		var ty = txt_pos.ty;
		var style = {fontFamily: 'font1', fontSize: 24, align: 'center', color:"#f6caa0", stroke: "#000000", strokeThickness: 3, wordWrap: {'width': 210}}
		
		var res = game_data['utils'].generate_string({'scene_id': params['scene_id'], 'item_id': params['item_id'], 
															'phrase_id': params['phrase_id'], 'values': params['values'], 'base_size': 24});
		
		this.money_tip_text = new Phaser.GameObjects.Text(this.scene, tx, ty, res['text'], style);
		var txt = this.money_tip_text;
		txt.setFontSize(res['size']);
		txt.setLineSpacing(-5);
		txt.setOrigin(0.5);
		holder.add(txt);
		holder.alpha = 0;
		holder.visible = true;
		holder.tween = game_data['scene'].tweens.add({targets: holder, alpha: 1, duration: 150, onComplete: function(){
			holder.tid = setTimeout(() => {
				_this.hide_money_tip();
			}, 1000);
		}}); 
	}
	
	hide_money_tip() {
		var _this = this;
		var holder = this.money_tip_overlay;
		if (holder.tween) holder.tween.stop();
		if (holder.tid) {
			clearTimeout(holder.tid);
			holder.tid = null;
		}
		holder.tween = game_data['scene'].tweens.add({targets: holder, alpha: 0, duration: 150, onComplete: function(){
			holder.visible = false;
			if (_this.money_tip_text) _this.money_tip_text.destroy();
			_this.money_tip_text = null;
		}});
	}

	show_tip(params, on_hide = null) {
		if (params['forced'] || (!this.tip_showing && !game_data['game_tutorial'].has_tutorial && !game_data['game_windows'].game_window)) {
			var _this = this;
			var holder = this.tip_overlay;
			holder.on_hide = on_hide;
			this.tip_showing = true;
			this.tip_hidable = false;
			var res;
			if (this.tip_text) this.tip_text.destroy();
			var txt_pos = this.place_tip('common', this.tip_bg, holder, params['pt']);
			var tx = txt_pos.tx;
			var ty = txt_pos.ty;

			var style = {fontFamily:"font1", fontSize: 24, align: 'center', color:"#f6caa0", stroke: "#000000", strokeThickness: 3, wordWrap: {'width': 270}}
			// if (params['item_id'] == 'all_stars') {
			// 	this.tip_bg.scaleY *= 1.1;
			// 	ty += 6 * this.tip_bg.scaleY;
			// }
			// else this.tip_bg.scaleY *= 1;

				res = this.generate_string({'scene_id': params['scene_id'], 'item_id': params['item_id'], 'phrase_id': params['phrase_id'], 'values': params['values'], 'base_size': 24});		
				style.fontSize = res['size'];
				this.tip_text = new Phaser.GameObjects.Text(this.scene, tx, ty, res['text'], style);
				this.tip_text.setLineSpacing(-5);
				this.tip_text.setOrigin(0.5);

			this.paused_tip = null;
			
			this.tip_overlay.add(this.tip_text);
			holder.alpha = 0;
			holder.visible = true;
			game_data['scene'].tweens.add({targets: holder, alpha: 1, duration: 150}); 
			setTimeout(() => {
				_this.tip_hidable = true;
			}, 150);
		}
		else this.paused_tip = {'params': params, 'on_hide': on_hide};
	}
	resume_tip() {
		if (this.paused_tip) {
			this.show_tip(this.paused_tip['params'], this.paused_tip['on_hide']);
		}
	}
	hide_tip() {
		if (this.tip_hidable) {
			this.tip_hidable = false;
			var holder = this.tip_overlay;
			var _this = this;
			this.scene.tweens.add({targets: holder, alpha: 0, duration: 150, onComplete: function(){
					holder.visible = false;
					if (_this.tip_text) _this.tip_text.destroy();
					_this.tip_text = null;
					if (holder.on_hide) holder.on_hide();
					holder.on_hide = null;
					_this.tip_showing = false;
					_this.resume_tip();
			}}); 
		}
	}

	generate_string(params) {			
		var i;
		var lang_id = game_data['user_data']['lang'].toUpperCase();
		if (game_data['langs'].indexOf(game_data['user_data']['lang']) < 0) lang_id = 'EN';
		var scene_id = params['scene_id'];
		var item_id = params['item_id'];
		var phrase_id = params['phrase_id'];
		var base_size = params['base_size']
		var start_index = 0;
		var res = {};
		try {
			res['size'] = base_size + game_data['language'][scene_id][item_id][phrase_id][lang_id]['size'];
		
			var txt = game_data['language'][scene_id][item_id][phrase_id][lang_id]['text'];
			if ('values' in params && params['values'].length) {
				var values = params['values'];
				var output = txt;
				var pattern = /%val/;
				for (i = 0; i < values.length; i++) {
					output = output.replace(pattern, values[i]);
					if (output.indexOf("[") >= 0) {
						output = this.replace_correct_word(output, values[i], lang_id);					
					}
				}
				txt = output;	
			}
			var myPattern = /\\n/gi; 
			txt = txt.replace(myPattern,'\n');
			res['text'] = txt;
			return res;
		} catch {
			console.log(scene_id);
			console.log(item_id);
			console.log(phrase_id);
			console.log(lang_id);
		}
		
	}

		
	replace_correct_word(txt, val, lang_id) {
		var start_index;
		var ind;
		var ind1;
		var ind2;
		var str;
		var str_all;
		var correct_word; 
		var arr;
		
		start_index = 0;
		ind = 0;
		ind1 = txt.indexOf("[", start_index);
		ind2 = txt.indexOf("]", start_index);
		if (ind1 >= 0 && ind2 >= 0 && ind2 > ind1) {
			str_all = txt.substr(ind1, ind2 - ind1 + 1);
			str = txt.substr(ind1 + 1, ind2 - ind1 - 1);
			arr = str.split(',');
		}
		
		correct_word = '';
		if (lang_id == 'RU' && arr.length == 3) {
			if (val % 100 > 10 && val % 100 < 20) {
				correct_word = arr[2];
			}
			else {
				switch (val % 10) {
					case 0: correct_word = arr[2]; break;
					case 1: correct_word = arr[0]; break;
					case 2: correct_word = arr[1]; break;
					case 3: correct_word = arr[1]; break;
					case 4: correct_word = arr[1]; break;
					case 5: correct_word = arr[2]; break;
					case 6: correct_word = arr[2]; break;
					case 7: correct_word = arr[2]; break;
					case 8: correct_word = arr[2]; break;
					case 9: correct_word = arr[2]; break;
				}
			}				
		}	
		else if (arr.length == 2) {
			correct_word = (val == 1 ? arr[0] : arr[1]);
		}			
		
		if (correct_word.length > 0)
			txt = txt.replace(str_all, correct_word);
		
		return txt;
	}		
		
	get_time() {
		return new Date().getTime();
	}
		
	chest_jump(item, on_complete) {
		var dy = item.y;
		game_data['scene'].tweens.add({targets: item, y: dy + 10,  duration: 150, onComplete: function(){
			game_data['scene'].tweens.add({targets: item, y: dy - 80, duration: 300, ease: 'Sine.easeInOut', onComplete: function(){
				game_data['scene'].tweens.add({targets: item, y: dy + 10, duration: 350, ease: 'Sine.easeInOut', onComplete: function(){
					on_complete();					
					game_data['scene'].tweens.add({targets: item, y: dy, duration: 150});
				}});
			}});
		}});
	}
	update_stat(obj) {	
		game_data['game_request'].update_stat(obj);
	}


	get_field_scale(params) {
		var field = params['field'];
		var unlocked_cells = params['unlocked_cells'];
		
		var pos_y;
		var pos_x;
		var start_x;
		var start_y;
		var end_x;
		var end_y;
	
		var level_scale;
		var orient = loading_vars['orientation'];
	
		//var is_smooth = params['is_smooth'];
		
		
		if (orient == 'landscape') {
			start_x = field['cells'][0].length - 1;
			start_y = field['cells'].length - 1;
			end_x = 0;
			end_y = 0;
			for (pos_y = 0; pos_y < field['cells'].length; pos_y++) {				
				for (pos_x = 0; pos_x < field['cells'][pos_y].length; pos_x++) {
					if (field['cells'][pos_y][pos_x] == 'E' || (field['cells'][pos_y][pos_x] in unlocked_cells)) {
						if (pos_x < start_x)
							start_x = pos_x;
						if (pos_y < start_y)
							start_y = pos_y;
						if (pos_x > end_x)
							end_x = pos_x;
						if (pos_y > end_y)
							end_y = pos_y;												
					}
						
				}
			}
	
			var orig_w =  (end_x - start_x + 1) * game_data['dim']['item_width'];
			var orig_h =  (end_y - start_y + 1) * game_data['dim']['item_height'];
			
			var level_scale = Math.min(
				game_data['dim'][loading_vars['orientation']]['fieldW'] / orig_w, 
				game_data['dim'][loading_vars['orientation']]['fieldH'] / orig_h, 
				1
			);
	
			//console.log('level_scale', level_scale);
	
			//var new_x = (game_data['dim']['fieldW'] - (end_x - start_x + 1) * game_data['dim']['item_width']* this.level_scale) / 2;
			//var new_y = (game_data['dim']['fieldH'] - (end_y - start_y + 1) * game_data['dim']['item_height']* this.level_scale) / 2;
	
			game_data['level_scale'] = level_scale;
			return level_scale;
		}
		else {
			game_data['level_scale'] = 1;
			return 1;
		}
		
	}
	count_stars() {
		var common_stars = 0;
		var i = 0;
		for (i = 0; i < game_data['utils'].get_passed_amount(); i++) 
			common_stars += game_data['user_data']['levels_passed'][i];
		
		game_data['user_data']['stars_total'] = common_stars;
	}

	get_passed_amount() {
		if (game_data['user_data'] && game_data['user_data']['levels_passed'])
			return game_data['user_data']['levels_passed'].length;
		else return 0;
	}

	toDataURL(src, callback, outputFormat = 'image/jpeg') {
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function() {
				var canvas = document.createElement('CANVAS');
				var ctx = canvas.getContext('2d');
				var dataURL;
				canvas.height = this.naturalHeight;
				canvas.width = this.naturalWidth;
				ctx.drawImage(this, 0, 0);
				dataURL = canvas.toDataURL(outputFormat);
				callback(dataURL);
		};
		img.src = src;
		if (img.complete || img.complete === undefined) {
				img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
				img.src = src;
		}
}

make_share(_type) {
	game_data['socialApi'].make_share(_type);
}

check_ads(event_type) {
	if (game_data['ads'] && game_data['ads']['interstitial'] && game_data['ads']['interstitial']['available']) {
		let mults = game_data['ads']['interstitial']['event_mult']
		let probabilities = game_data['ads']['interstitial']['probabilities'];
		// console.log(mults)
		// console.log(probabilities)
		if (mults && probabilities) {
			let passed = this.get_passed_amount();
			for (let i = probabilities.length - 1; i >= 0; i--) {
				let obj = probabilities[i];
				// console.log(passed)
				// console.log(obj['level_id'])
				if (obj['level_id'] < passed) {
					let prob = (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') ? obj['normal'] : obj['insolvent'];
					if (event_type in mults) prob *= mults[event_type]
					let rand = Math.random() * 100
					// console.log(prob)
					// console.log(rand)
					if (rand < prob) this.show_interstitial_ad();
					break;
				}
			}
		}
	}
}

check_more_games() {
	var mg = game_data['more_games_settings'];
	var result = false;
	var rnd = Math.random();
	if (allow_more_games && 'more_games' in game_data && game_data['more_games'].length && mg['allow_popup'] && this.more_games_allow_popup &&
		game_data['utils'].get_passed_amount() >= mg['start_level'] && rnd < mg['chance']) {
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'more_games', 'flag': 1});
		this.more_games_allow_popup = false;
		result = true;
	}
	return result;
}

game_mode() {
		var changed = false;
		var ret = 'offline';
		var ads = (game_data['ads']['rewarded'] && game_data['ads']['rewarded']['preloaded'] != null) || (game_data['ads']['interstitial'] && game_data['ads']['interstitial']['preloaded'] != null);
		var purchases = game_data['in_app_items'];
		
		if (ads && purchases) ret = 'full';
		else if (ads && !purchases) ret = 'video_only';
		else if (!ads && purchases) ret = 'purchases_only';
		else if ('standalone' in game_data && game_data['standalone']['active']) ret = 'offline';
		
		if (game_data['last_game_mode'] && !ads) { //на случай если вдруг сейчас не загрузилась реклама, но была
				if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only')
						ret = game_data['last_game_mode'];
		}
		if (game_data['last_game_mode'] && game_data['last_game_mode'] != ret) changed = true;
			 
		//ret = 'video_only';
		game_data['last_game_mode'] = ret;
		if (changed) {
				this.emitter.emit('EVENT', {'event': 'GAME_MODE_CHANGE'});
				game_data['utils'].update_stat({'type': 'change_game_mode', 'description': ret});
				game_data['error_history'].push('mode_'+ret);
		}
		return ret;
}

get_pers(_name, on_complete) {
	game_data['error_history'].push('gu11');
	var _this = this;
	if (!('loaded_pers' in game_data)) game_data['loaded_pers'] = {};
	_name = 'monster' + String(_name);
	var key = 'pers_' + _name;
	var temp;
	if (key in game_data['loaded_pers']) {
		temp = new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
		on_complete(temp);
	}
	else if (is_localhost || navigator.onLine){
		var loader = new Phaser.Loader.LoaderPlugin(this.scene);
		loader.image(key, game_data['urls']['assets'] + 'pers/' + _name + '.png');
		loader.once('complete', function(){
			temp = new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
			game_data['loaded_pers'][key] = true;
			on_complete(temp);
			loader.destroy();
		});
		loader.start();
	}
	else on_complete(null);
}


preload_field_anims() {
	var _this = this;
	this.field_anims = [];
	var i;
	if (!('loaded_anims' in game_data)) game_data['loaded_anims'] = {};
	var loader = new Phaser.Loader.LoaderPlugin(this.scene);
	loader.spine('tornado', game_data['urls']['assets'] + 'tornado.json', game_data['urls']['assets'] + 'tornado.atlas');            
	loader.once('complete', function(){
		game_data['loaded_anims']['tornado'] = true;
		loader.destroy();
	});
	loader.start();
   
}


save_prev_boosters() {
	var prev_boosters = {};
	for(var s in game_data['user_data']['boosters']) {
		prev_boosters[s] = parseInt(game_data['user_data']['boosters'][s]);
	}
	game_data['prev_boosters'] = prev_boosters;
}

check_matrix_empty(arr) {
	for (var i = 0; i < arr.length; i++)
		for (var j = 0; j < arr[i].length; j++)
			if (arr[i][j] != '-' && arr[i][j] != '0')
				return false;
				
	return true;			
}


level_start(level_id, _type = 'common', on_complete = null) {
	var i;
	var lvl;
	var limit = 3;
	game_data['tiles_mod'] = game_data['golden_tiles_mod'];
	if (level_id < game_data['utils'].get_passed_amount()) {
		game_data['tiles_mod'] = game_data['golden_tiles_replay_mod'];
	}
	if (_type == 'duel') {
		limit = 1;
		var pos = parseInt(Math.random() * game_data['levels_to_write'].length);
		lvl = String(game_data['levels_to_write'][pos]);
		
		game_data['tiles_mod'] = game_data['golden_tiles_duel_mod'];
		this.parse_level(lvl);
		game_data['current_level'] = {'fields' : [game_data['levels_data'][lvl]]};
		game_data['current_level']['fill_rate'] = [game_data['fill_rate_default']];
		game_data['current_level']['speed'] = [game_data['competitor_mult']['default_speed']];
		for (i = game_data['duel_settings'].length - 1; i >= 0; i--) {
			if (level_id >= game_data['duel_settings'][i]['level_id']) {
				game_data['current_level']['speed'] = [game_data['duel_settings'][i]['speed']];
				break;
			}
		}
		
		
	}
	else {
		game_data['current_level'] = {'fields' : []};
		let extended_level_id = level_id % game_data['original_levels_amount']
		var tournament = game_data['levels'][extended_level_id];
		
		var levels_info = tournament['levels'];
		
		for (i = 0; i < levels_info.length; i++) {
			this.parse_level(levels_info[i], this.is_extending_game());
			game_data['current_level']['fields'].push(game_data['levels_data'][String(levels_info[i])]);
			
		}
		game_data['current_level']['fill_rate'] = tournament['fill_rate'];
		game_data['current_level']['speed'] = tournament['speed'];
		
	}
	var req_obj = {'tournament_start': true, 'level_id':level_id, 'type': _type};
	
	
	game_data['game_request'].request(req_obj, function(resp) {
		if (on_complete) on_complete(resp);		
	});


}


	get_competitors_info(is_duel, on_complete) {
		var i;
		var ids = [];
		var user_ids = [];
		var user_id = '';
		var ind = 0;
		var success = true;
		for (user_id in game_data['users_info']) if (user_id != '0' && game_data['users_info'][user_id]['atlas']) ids.push(user_id);
		var limit = is_duel ? 1 : 3;
		if (game_data['is_challenge'] && game_data['challenge_user_id'] != null) user_ids.push(game_data['challenge_user_id']);
		if (is_localhost || !navigator.onLine) {
			for (i = user_ids.length; i < limit; i++)	{
				ind = Math.floor(Math.random() * ids.length);
				user_id = ids[ind];
				ids.splice(ind,1);
				user_ids.push(user_id);
			}
			if (user_ids == null || user_ids.length < limit) {
				success = false;
				console.log("Error: can't find opponents")
			}
			on_complete({'success':success, 'user_ids':user_ids});    
		}
		else {
			this.get_possible_competitors(function() {
				var pos, i;
				while (user_ids.length < limit) {
					if (game_data['competitors_list'].length > 0) {
						pos = parseInt(Math.random() * game_data['competitors_list'].length);
						var _id = game_data['competitors_list'][pos];
						if (user_ids.indexOf(_id) < 0) user_ids.push(_id);						
						game_data['competitors_list'].splice(pos, 1);
					}
					else if (ids.length > 0){
						ind = Math.floor(Math.random() * ids.length);
						user_id = ids[ind];
						ids.splice(ind,1);
						user_ids.push(user_id);
					}
					else {
						user_ids.push(null);
						success = false;
					}
				}
				
				on_complete({'success':success, 'user_ids':user_ids});  
			});
		}
	}

	get_possible_competitors(on_complete) {
		if (!('competitors_list' in game_data)) game_data['competitors_list'] = [];
		if (game_data['competitors_list'].length > 2) on_complete();
		else {
			game_data['socialApi'].get_competitors_list(function(temp_entries) {
				var entries = [];
				var i;
				for (i = 0; i < temp_entries.length; i++) {
					var _id = temp_entries[i]['user_id'];
					game_data['users_info'][_id] = {};
					if (game_data['friends'].indexOf(_id) < 0) entries.push(_id);
				}
				game_data['competitors_list'] = entries;
				on_complete();
			});
		}
	}

	check_save_user_info() {
		var user_info = game_data['users_info'][loading_vars['user_id']];
		var has_info = user_info && user_info['first_name'] && user_info['photo_url'] && game_data['users_photo_settings'];
		let need_save = game_data['user_data']['request_user_info'];
		if (need_save && (loading_vars['net_id'] == 'ig' || loading_vars['net_id'] == 'fb') && has_info) {
			var size = game_data['users_photo_settings']['size'];
			var src = user_info['photo_url'];
			var outputFormat = 'image/jpg';
			var img = new Image(size,size);
			img.crossOrigin = 'Anonymous';
			img.onload = function() {
				var canvas = document.createElement('CANVAS');
				var dataURL;
				canvas.height = size;
				canvas.width = size;
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, size, size);
				dataURL = canvas.toDataURL(outputFormat);
				setTimeout(() => {
					if (dataURL) game_request.request({'save_user_info': true, 'base64_url': dataURL, 'first_name': user_info['first_name']}, function(obj){
						if (obj['success']) {
							game_data['utils'].update_stat({'action': true , 'action_id': 'save_user_info', 'info': 'save_user_info'});
						}
					});
				}, 50);
			};
			img.src = src;
			if (img.complete || img.complete === undefined) {
				// Flush cache
				img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
				// Try again
				img.src = src;
			}
		}
	}

	load_user_photo(user_id, on_complete) {
		var _this = this;
		var allow_create = user_id in game_data['users_info'] && game_data['users_info'][user_id] && ('photo_url' in game_data['users_info'][user_id] || 'base64_url' in game_data['users_info'][user_id])
		if (allow_create) {
			this.create_user_photo(user_id, on_complete)
		}
		else {
			game_data['socialApi'].load_missing_users([user_id], function() {
				_this.create_user_photo(user_id, on_complete)
			});
		}
	}

	create_user_photo(user_id, on_complete) {
		var has_first_name = user_id in game_data['users_info'] && 'first_name' in game_data['users_info'][user_id]
		var _this = this;
		var key = 'user' + user_id; 
		var photo; 
		if (user_id in game_data['users_info']) {
			if (game_data['users_info'][user_id]['photo'] && game_data['users_info'][user_id]['photo'] != '')     {
				if (game_data['users_info'][user_id]['atlas'])
					photo = new Phaser.GameObjects.Image(this.scene, 0, 0, game_data['users_info'][user_id]['atlas'], game_data['users_info'][user_id]['photo']);
				else
					photo = new Phaser.GameObjects.Image(this.scene, 0, 0, game_data['users_info'][user_id]['photo']);
				on_complete({'success': true, 'key': game_data['users_info'][user_id]['photo'], 'photo': photo, 'first_name': has_first_name})
			}
			else if (game_data['users_info'][user_id]['base64_url']) {
				this.scene.textures.addBase64(key, game_data['users_info'][user_id]['base64_url']);
				setTimeout(() => {
					game_data['users_info'][user_id]['photo'] = key;
					photo = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
					on_complete({'success': true, 'key': key, 'photo': photo, 'first_name': has_first_name});
				}, 50);
			}
			else if (game_data['users_info'][user_id]['photo_url'] && (is_localhost || navigator.onLine)) {
				var url = game_data['users_info'][user_id]['photo_url']
				var loader = new Phaser.Loader.LoaderPlugin(this.scene);
				loader.image(key, url);
				loader.once('complete', function(){
						game_data['users_info'][user_id]['photo'] = key;
						photo = new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
						on_complete({'success': true, 'key': key, 'photo': photo, 'first_name': has_first_name});
						loader.destroy();
				});
				loader.start();
			}
			else  on_complete({'success': false});
		}
		else  on_complete({'success': false});
	}

	update_user_rating(on_complete) {
		var r_type = game_data['rating_manager'].get_current_rating()['type'];
		var boards = game_data['current_leaderboards'];
		var scores = [];
		var board_names = [];

		for (var i = 0; i < boards.length; i++) {
			var _type = boards[i]['type'];
			var _name = boards[i]['name'];
			board_names.push(_name);
			scores.push(game_data['user_data']['score'][_type]);

		}
		if (is_localhost || navigator.onLine) game_data['socialApi'].set_score(
			{'scores': scores, 'boards': board_names}, on_complete
		);
	}

	user_score_updated(on_complete = null) {
		if (game_data['rating_manager'] && navigator.onLine) {
			game_data['rating_manager'].set_current_leaderboards();
			game_data['utils'].update_user_rating(function() {
				var r_info = game_data['rating_manager'].get_current_rating();
				if (navigator.onLine) 
					game_data['utils'].load_rating(r_info['type'], r_info['is_friends'], function(new_rating) {
						game_data['rating_manager'].update_rating(new_rating);
						if (on_complete != null) on_complete();
					});
			});
			if (game_data['task_manager'].get_task('rating_place') != null) {
				var boards = game_data['current_leaderboards'];
				for (var i = 0; i < boards.length; i++) {
					if (boards[i]['type'] == 'day') {
						var _name = 'day';
						game_data['socialApi'].get_user_rank(_name, function(rank) {
							if (rank > 0) game_data['task_manager'].update_tasks({'type': 'rating_place', 'amount':rank});
						});
						break;
					}
				}
			}



		}
	}

	check_rating_bonus() {
		if (get_passed_amount() >= 3 && 'rating_info' in game_data['user_data'] && 'bonus' in game_data['user_data']['rating_info']
			&& game_data['user_data']['rating_info']['bonus']['available']) {
				let user_info = game_data['user_data']['rating_info']['bonus']
				this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'rating_bonus', 'user_info': user_info});
		}
	}
	
	create_outline({img, custBtn, parentCont, key = img.frame.name, color = 0xf4ea7a, scaleConfig = {start: 1.05, end: 1.1}, alphaConfig = {start: 0, end: 0.8}, interactiveParentCont = false, atlasKey}) {
		let interactiveTarget;
		if (interactiveParentCont) {
			interactiveTarget = parentCont;
		}
		else {
			interactiveTarget = custBtn;
		}
		
		// key = key || img.frame.name;
		// let color = 0xd5740d;
		// let color = 0xe2aa13;
		// let color = 0xca8d0a;
		// let color = 0xcaa24b;
		// let color = 0xcaaa65;
		// let key = img.frame.name;
		let {start: scaleStart, end: scaleEnd} = scaleConfig;
		let {start: alphaStart, end: alphaEnd} = alphaConfig;
	
		let copy = new Phaser.GameObjects.Image(this.scene, custBtn.x, custBtn.y, (img.texture.key && !atlasKey) ? img.texture.key : 'common1', key);
		
		parentCont.add(copy);
		// custBtn.setInteractive();
		copy.setScale(scaleStart);
		copy.alpha = alphaStart;
		copy.setTintFill(color, color, color, color);
		parentCont.moveTo(copy, parentCont.getIndex(custBtn));
		interactiveTarget.on('pointerover', () => {
			if (!custBtn.forbidOutline) {
				this.scene.tweens.add({
					targets: copy, 
					// alpha: 0.8,
					scale: scaleEnd,
					duration: 100,
					onComplete: () => {
		
					}
				});
				this.scene.tweens.add({
					targets: copy, 
					alpha: alphaEnd,
					// scale: 1.2,
					duration: 150,
					onComplete: () => {
		
					}
				});
			}
			
		});
		interactiveTarget.on('pointerout', () => {
			if (!custBtn.forbidOutline) {
				this.scene.tweens.add({
					targets: copy, 
					// alpha: 0.8,
					scale: scaleStart,
					duration: 100,
					onComplete: () => {
		
					}
				});
				this.scene.tweens.add({
					targets: copy, 
					alpha: alphaStart,
					// scale: 1.1,
					duration: 150,
					onComplete: () => {
						
					}
				});
			}
			
		});
		
		return copy;
	}

	move_around(icon, config = {duration: 2000}) {
		return game_data['scene'].tweens.add({
			targets: icon,
			angle: 360,
			repeat: -1,
			duration: config.duration,
			ease: 'Sine.easeInOut',
			onComplete: () => {

			}
		})
	}

	shake(icon, config = {delay: 0}, on_complete = () => {}) {
		let angles = [0, 0, 0, 0, 0, 0]
		if (icon.type === 'Container') angles = [5, -2, 3, -1, 2, 0]
		else if (icon.type === 'Image') angles = [15, -15, 12, -12, 10, 0]
		if (config.sound) {
			setTimeout(() => {
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': config.sound})
			}, config.delay)
		}
		game_data['scene'].tweens.add({targets: icon, angle: angles[0], delay: config.delay, duration: 100, onComplete: function(){
			game_data['scene'].tweens.add({targets: icon, angle: angles[1], duration: 100, onComplete: function(){
				 game_data['scene'].tweens.add({targets: icon, angle: angles[2], duration: 80, onComplete: function(){
					game_data['scene'].tweens.add({targets: icon, angle: angles[3], duration: 80, onComplete: function(){
						game_data['scene'].tweens.add({targets: icon, angle: angles[4], duration: 80, onComplete: function(){
							game_data['scene'].tweens.add({targets: icon, angle: angles[5], duration: 80, onComplete: function() {on_complete()}});  
						}});  
					}});  
				}});  
			}});  
		}});  
	}

	get_map_rating(on_complete = null) {
		var i;
		var user_pos = -1;
		game_data['user_data']['rating'].sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
		var current = game_data['user_data']['rating'];
		
		for (i = 0; i < current.length; i++) {
			current[i]['place'] = i+1;
			if (current[i]['user_id'] == loading_vars['user_id']) user_pos = i;;
		}
		
		if (game_data['task_manager'] && game_data['task_manager'].update_tasks && user_pos >= 0) {
			game_data['task_manager'].update_tasks({'type': 'rating_place', 'amount': user_pos + 1});
		}
		
		var visual_pos = [0,1,2];
		var add = 0;
		if (user_pos <= 2) add = 3 - user_pos;
		for (i = user_pos - 3; i < user_pos + 6 + add; i++) {
			if (i >= 0 && i < current.length && visual_pos.indexOf(i) < 0) visual_pos.push(i);
		}
		var rating = [];
		var ids = [];
		// console.log(game_data, visual_pos, current)
		for (i = 0; i < visual_pos.length; i++) {
			if (current[visual_pos[i]]) {
				rating.push(Object.assign({}, current[visual_pos[i]]));
				ids.push(current[visual_pos[i]]['user_id']);
			}
		}
		game_data['socialApi'].load_missing_users(ids, function(){
			if (on_complete) on_complete(rating);				
	
		});
		
	}

	load_rating(rating_id, is_friends, on_complete) {
		var _this = this;	
		if (is_localhost && loading_vars['user_id'] == '0') {
			on_complete([
				{'user_id': 1, 'place': 1, 'score': 523456},
				{'user_id': 6, 'place': 2, 'score': 200000},
				{'user_id': 2, 'place': 3, 'score': 100000},
				{'user_id': 3, 'place': 20, 'score': 40000},
				{'user_id': 4, 'place': 123, 'score': 3000},
				{'user_id': 5, 'place': 4320, 'score': 200},
				{'user_id': 0, 'place': 5000, 'score': 150},
				{'user_id': 7, 'place': 5555, 'score': 20},
				{'user_id': 8, 'place': 7777, 'score': 10},
				{'user_id': 9, 'place': 88888, 'score': 5},
				{'user_id': 10, 'place': 999999, 'score': 0},
			]);
		}
		else {
			var i;
			var boards = game_data['current_leaderboards'];
			var _name = '';
			
			for (var i = 0; i < boards.length; i++) {
				if (rating_id == boards[i]['type']) _name = boards[i]['name'];
			}
			if (_name != '') game_data['socialApi'].get_entries_near_user(_name, is_friends, function(obj) {
				if (obj['success'] && obj['rating']) {
					on_complete(obj['rating']);
				}
			});
		}
	}

	get_stand(rating_id, on_complete) {
		if (is_localhost || navigator.onLine) game_data['socialApi'].get_stand(rating_id, on_complete);
	}

	load_rating_test(rating_id, is_friends, on_complete) {
		
		//generate fake rating
		var rating_size = 5;
		var score_range = {
			'day': {'min': 900, 'max': 8000},
			'week': {'min': 10000, 'max': 40000},
			'all': {'min': 50000, 'max': 500000},
		};
		var max_place = 100000;
		
		var all_users = [];
		var rating = [];
		var user;
		
		for (var key in game_data['users_info']) {			
			user = game_data['users_info'][key];
			user['user_id'] = key;
			if (!is_friends || ('friend' in user))
				all_users.push(user);			
		}
		if (is_friends) {
			rating_size = all_users.length;
			max_place = all_users.length;
		}
				
		var ind;
		var score;		
		var low = 0;
		var high = 0;
		var max_iter = 1000;
		var iter = 0;
		
		var user_score = score_range[rating_id]['min'] + Math.floor(Math.random() * (score_range[rating_id]['max'] - score_range[rating_id]['min']) / 10) * 10;
		rating.push({'user_id': loading_vars['user_id'], 'score': user_score});
		
		while (all_users.length > 0 && rating.length < rating_size && iter < max_iter) {
			ind = Math.floor(Math.random() * all_users.length);
			user = all_users[ind];
			
			
			if (user['user_id'] != loading_vars['user_id']) {
				score = score_range[rating_id]['min'] + Math.floor(Math.random() * (score_range[rating_id]['max'] - score_range[rating_id]['min']) / 10) * 10;
				
				if (is_friends) {
					rating.push({'user_id': user['user_id'], 'score': score});
					all_users.splice(ind, 1);					
				}				
				else if (score < user_score && low < (rating_size - 1) / 2) {
					rating.push({'user_id': user['user_id'], 'score': score});
					all_users.splice(ind, 1);
					low++;
				}
				else if (score > user_score && high < (rating_size - 1) / 2) {
					rating.push({'user_id': user['user_id'], 'score': score});
					all_users.splice(ind, 1);
					high++;
				}
			}
			iter++;
		}
		
		rating.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
		
		var start_place = 1 + Math.floor(Math.random() * (max_place - rating_size));
		for (var i = 0; i < rating.length; i++)
			rating[i]['place'] = start_place + i;
	
		
		var delay = 100 + Math.floor(Math.random() * 1000)
		
		if (rating_id == 'all')
			delay += 8000;
		
		game_data['scene'].time.delayedCall(delay, function(){				
			on_complete(rating);
		}, [], this);
	}


	load_anim_monster(id, on_complete, suffix = '') {				
		game_data['error_history'].push('gu10');
		var mark = parseInt(game_data['tutorial_mark']);
		var _this = this;
		if (!('loaded_anims' in game_data)) game_data['loaded_anims'] = {};
		var key = 'monster' + String(id) + '_anim' + suffix;
		if (key in game_data['loaded_anims']) {
			on_complete(true);
		}
		else if (is_localhost || navigator.onLine){
			var loader = new Phaser.Loader.LoaderPlugin(this.scene);
			loader.spine(key, game_data['urls']['assets'] + 'monsters/' + key + '.json', game_data['urls']['assets'] + 'monsters/' + key + '.atlas');            
			loader.once('complete', function(){
				game_data['error_history'].push('gu10_1 '+ key);

				game_data['loaded_anims'][key] = true;
				var result = game_data['tutorial_mark'] == mark;
				on_complete(result);          
				loader.destroy();
			});
			loader.start();
		}
		else on_complete(null);
	}

	check_pending_purchases() {
		var _this = this;
		var i;
		
		game_data['socialApi'].check_pending_purchases(function(items){
			if (items.length > 0) {
				var item_ids = [];
				for (i = 0; i < items.length; i++)
					if (items[i] && 'productID' in items[i]) item_ids.push(items[i]['productID']);
				
				if (item_ids.length) game_data['game_request'].request({'update_purchases': true, 'item_ids': item_ids}, function(res) {
					if ('success' in res && res['success']) {
						if ('money' in res) {
							game_data['user_data']['money'] = res['money'];
							_this.emitter.emit('EVENT', {'event': 'update_money'});
						}
						if ('boosters' in res) {
							game_data['user_data']['boosters'] = res['boosters'];
							if (game_data['game_engine'] && game_data['game_engine'].booster_panel)
								game_data['game_engine'].booster_panel.update_boosters();
							
						}
						if ('money_box' in res) {
							game_data['user_data']['money_box'] = res['money_box'];
							_this.emitter.emit('EVENT', {'event': 'update_money_box'});
						}
						if ('paid_chest' in res) game_data['user_data']['paid_chest'] = res['paid_chest']
						if ('payments' in res) game_data['user_data']['payments'] = res['payments'];
					}
					for (i = 0; i < items.length; i++)
						game_data['socialApi'].consume_item(items[i]['purchaseToken']);
				});
				
			}
		})
	}
	show_loader(pt, holder) {
		var total = 9;
		var radius = 30;
		var r = 8;
		var circle;
		var rot_angle = 360 / total;
		var circles = [];
		var tweens = [];
		var graphics;
		var period = 1000;
				
		if (!('loader_anims' in game_data))
			game_data['loader_anims'] = {'total': 0, 'period': period, 'circles': {}, 'hidden': {}};					
		
		var id = game_data['loader_anims']['total'];
		game_data['loader_anims']['circles'][id] = [];

		
		for (var i = 0; i < total; i++) {			
			graphics = new Phaser.GameObjects.Graphics(this.scene); 
			graphics.fillStyle(0x999999, 1);						
			graphics.fillCircle(pt.x + Math.cos(rot_angle * i / 180 * Math.PI) * radius, pt.y + Math.sin(rot_angle * i / 180 * Math.PI) * radius, r);			
			holder.add(graphics);	
			circles.push(graphics);
			game_data['loader_anims']['circles'][id].push(graphics);
			this.show_circle_fade(id, i, period / total * i);						
		}	
	
		game_data['loader_anims']['total']++;	
		return id;
	}

	show_circle_fade(id, i, timeout) {
		var circle = game_data['loader_anims']['circles'][id][i];
		var period = game_data['loader_anims']['period'];
		var _this = this;
		
		this.scene.tweens.add({targets: circle, alpha: 0, duration: period, delay: timeout, onComplete: function(){
			if ((id in game_data['loader_anims']['hidden'])) {
				circle.destroy();
			}
			else {
				circle.alpha = 1;
				_this.show_circle_fade(id, i, 0);
			}			
		}});		
		
	}

	hide_loader(id) {
		for (var i = 0; i < game_data['loader_anims']['circles'][id].length; i++)
			game_data['loader_anims']['circles'][id][i].visible = false;		
		
		game_data['loader_anims']['hidden'][id] = true;				
	}
	preload_interstitial_ad() {
		if (!is_localhost && navigator.onLine && game_data['user_data']['payments']['total'] == 0 && game_data['ads']['interstitial']['available']) 
			game_data['socialApi'].preload_interstitial_ad();
	}
	
	show_interstitial_ad(cheater = false) {
		if (!is_localhost && navigator.onLine && game_data['user_data']['payments']['total'] == 0) {
			
			game_data['socialApi'].show_interstitial_ad(cheater);
			game_data['game_request'].update_stat({'ad_show': true ,'type': 'interstitial'});	
		}
	}    
	
	preload_rewarded_ad() {
		if (!is_localhost && navigator.onLine && game_data['ads']['rewarded']['available'] && allow_rewarded_ads) 
			game_data['socialApi'].preload_rewarded_ad();
	}    
	
	show_rewarded_ad(on_complete) {
		if (is_localhost) on_complete({'success': true}); 
		else if (navigator.onLine && allow_rewarded_ads && game_data['ads']['rewarded']['available']) {
			game_data['socialApi'].show_rewarded_ad(on_complete);
			game_data['game_request'].update_stat({'ad_show': true ,'type': 'rewarded'});		
		}
		else on_complete({'success': false});
	}

	start_purchase_item(obj, on_complete) {
		game_data['socialApi'].start_purchase_item(obj, on_complete);
		//game_data['game_request'].update_stat({'action_id': 'start_purchase_item', 'info': obj['item_info']['item_id']});
	}
	update_language() {
		game_data['game_request'].update_language();
	}

	check_day_related_data(on_complete) {
		setTimeout(() => {
			var _this = this;
			game_data['game_request'].request({'update_day_related_data': true}, function(result){
				if (result['success']) {
					if (result['day_id']) loading_vars['day_id'] = result['day_id'];
					if (result['week_id']) game_data['week_id'] = result['week_id'];
					if (result['day_end_time']) game_data['day_end_time'] = result['day_end_time'];
					if (result['week_end_time']) game_data['week_end_time'] = result['week_end_time'];
				
					if (result['user_day_bonus']) game_data['user_data']['user_day_bonus'] = result['user_day_bonus'];
					if (result['rewarded_video']) game_data['user_data']['rewarded_video'] = result['rewarded_video'];
					if (result['user_rating_bonus']) game_data['user_data']['user_rating_bonus'] = result['user_rating_bonus'];
					if (result['tasks']) game_data['user_data']['tasks'] = result['tasks'];
					if (result['payments']) game_data['user_data']['payments'] = result['payments'];
					_this.check_bonuses();
					on_complete();
				}
			});
		}, 5000);
	}

	check_bonuses() {
		var _this = this;
		if ('user_day_bonus' in game_data['user_data'] && game_data['user_data']['user_day_bonus']['available']) {
			if (game_data['utils'].get_passed_amount() > 0) {
				_this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'day_bonus'});
			}
			else {
				game_data['game_request'].request( {'collect_day_bonus': true}, function(obj) 	{
					if (obj['success']) { 
						game_data['user_data']['user_day_bonus']['available'] = false;
						var day = game_data['user_data']['user_day_bonus']['day'];
						var prize = parseInt(game_data['day_bonus'][String(day)]);
						_this.emitter.emit('EVENT', {'event': 'update_money'});
						game_data['utils'].update_stat({'type': 'day_bonus', 'amount_inc': prize['amount']});
					}
				});
			}	
		}
		else {
			game_data['game_map'].update_star_chest();
			
		}
		this.check_rating_bonus()
	}

	check_cheated_interstitial() {
		let user_data = game_data['user_data']
		if ('interstitial_flag' in user_data && user_data['interstitial_flag'] === 1) {
			this.show_interstitial_ad(true);
		}
	}

	get_moneybox() {
		var amount = game_data['user_data']['money_box']['amount'];
		if (!game_data['in_app_items']) 
			amount = game_data['user_data']['money_box']['free_amount'];
		return amount;
	}

	check_levels_extending() {
		let base_total_levels = parseInt(game_data['total_levels']);
		let passed = get_passed_amount() + 30;
		
		if (passed >= base_total_levels) {
			let iters = parseInt(passed / base_total_levels);
			// console.log('qqq', game_data['total_levels'], map_data['maps'].length, map_data['levels'].length);
			let base_levels = map_data['levels'].slice();
			let base_maps = map_data['maps'].slice();
			let x_add = map_data['maps'].length * map_data['map_w'];
			for (let i = 0; i < iters; i++) {
				game_data['total_levels'] += base_total_levels;
				map_data['maps'] = map_data['maps'].concat(base_maps);
				for (let j = 0; j < base_levels.length; j++) {
					base_levels[j] = Object.assign({}, base_levels[j])
					base_levels[j].x += x_add;
				}
				map_data['levels'] = map_data['levels'].concat(base_levels);
			}
			// console.log('qqq2', game_data['total_levels'], map_data['maps'].length, map_data['levels'].length);
		}

	}

	is_extending_game() {
		return Math.floor(get_passed_amount() / game_data['original_levels_amount']) > 0
	}

	get_loader(use_suffix = true) {
		var loader = new Phaser.Loader.LoaderPlugin(game_data['scene']);
		if (use_suffix && (loading_vars['net_id'] == 'ig' || loading_vars['test2'])) loader.setPath(loading_vars['assets_suffix'] + '/');

		return loader;
	}

	get_privacy_policy(parent_holder) {
		let _this = this;
		let holder = new Phaser.GameObjects.Container(this.scene, 0, 10);
		parent_holder.add(holder);
		let overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		overlay.alpha = 1;
		holder.add(overlay);
		overlay.setInteractive({draggable: true});

		let step_y = 600;
		holder.def_y = -360;
		holder.min_y = -360;
		holder.max_y = 0;
		holder.def_x = -540;
		holder.txt_cont = new Phaser.GameObjects.Container(this.scene, holder.def_x, holder.def_y);
		holder.add(holder.txt_cont);
		holder.init_text = new Phaser.GameObjects.Text(this.scene, 0, 0, 'Loading...', {fontFamily: 'font1', fontSize: 60, color:"#FFFFFF",  stroke: '#000000', strokeThickness: 3, wordWrap: {width: 1000}});
		holder.init_text.setOrigin(0.5);
		holder.add(holder.init_text);

		if (!this.privacy_textures_created) {
			let graphics;
			let size = 45;
			graphics = new Phaser.GameObjects.Graphics(this.scene); 
			graphics.lineStyle(4, 0xF0F0F0, 1);		
			graphics.strokeCircle(size, size, size - 5);

			graphics.lineStyle(6, 0xF0F0F0, 1);	
			graphics.lineBetween(size - size * 0.5, size - size * 0.5, size + size * 0.5, size + size * 0.5)
			graphics.lineBetween(size + size * 0.5, size - size * 0.5, size - size * 0.5, size + size * 0.5)
			graphics.generateTexture('privacy_close_out', size * 2, size * 2);

			graphics = new Phaser.GameObjects.Graphics(this.scene); 
			graphics.fillStyle(0x22BB22, 1);
			graphics.lineStyle(2, 0xF0F0F0, 1);		
			graphics.fillTriangle(5, 5, 55, 5, 30, 65);
			graphics.strokeTriangle(5, 5, 55, 5, 30, 65)
			graphics.generateTexture('privacy_arrow_out', 60, 70);

			this.privacy_textures_created = true;
		}

		let button_close = new Phaser.GameObjects.Image(this.scene, 590, -310, 'privacy_close_out');
		holder.add(button_close);
		button_close.setInteractive({useHandCursor: true});
		button_close.on('pointerup', ()=>{
			//setTimeout(() => {
				holder.removeAll(true);
				holder.destroy();
			//}, 50);
			
		});

		let btn_up = new Phaser.GameObjects.Image(this.scene, 500, -60, 'privacy_arrow_out');
		btn_up.setInteractive({useHandCursor: true});
		btn_up.on('pointerdown', ()=>{
			this.privacy_move_text(holder, step_y)
		});
		let btn_dn = new Phaser.GameObjects.Image(this.scene, 500, 60, 'privacy_arrow_out');
		btn_dn.setInteractive({useHandCursor: true});
		btn_dn.on('pointerdown', ()=>{
			this.privacy_move_text(holder, -step_y)
		});
		holder.add(btn_up);
		holder.add(btn_dn);
		btn_up.angle = 180;


		overlay.on('dragend', function(pointer, dragX, dragY){
			holder.def_y = holder.txt_cont.y;
		});
		overlay.on('drag', function(pointer, dragX, dragY){ 
			_this.privacy_move_text(holder, dragY, true);
		});

		holder.allow_move = true;

		let promise = new Promise(function(resolve, reject) {
			if (game_data['privacy_policy_arr']) resolve();
			else {
				let loader = game_data['utils'].get_loader(false);
				let url = game_data['privacy_policy_url'] ? game_data['privacy_policy_url'] : 'https://serv5.elian-games.com/privacy_policy/privacy_policy.txt';
				loader.text('privacy_policy_txt', url + '?' + String(parseInt(Math.random()*1000000)) );
				let success = true;
				loader.on('loaderror', ()=> {
					success = false;
				});
				loader.once('complete', ()=>{
					loader.off('loaderror');
					if (success) {
						let str = String(game_data['scene'].cache.text.get('privacy_policy_txt'));
						game_data['privacy_policy_arr'] = str.split('<<>>');
						resolve();
					}
					else {
						holder.init_text.text += '\n\n' + "      Error: Couldn't load file";
						reject();
					}
					loader.destroy();
				}, this);
				loader.start();
			}
		});

		
		promise.then(
			function(result) { 
				holder.init_text.text = '';
				let last_y = 0;
				for (let i = 0; i < game_data['privacy_policy_arr'].length; i++) {
					let txt = new Phaser.GameObjects.Text(game_data['scene'], 0, last_y, game_data['privacy_policy_arr'][i], {fontFamily: 'font1', fontSize: 26, color:"#FFFFFF",  stroke: '#000000', strokeThickness: 3, wordWrap: {width: 1000}});
					holder.txt_cont.add(txt);
					last_y += txt.height;
				}
				holder.max_y = holder.min_y - last_y + loading_vars['H'];  
			},
			function(error) {  }
		);
		
	}

	privacy_move_text(holder, dy, drag = false) {
		if (holder.allow_move) {
			holder.allow_move = false;
			let new_y = (drag ? holder.def_y : holder.txt_cont.y) + dy;
			if (new_y > holder.min_y) new_y = holder.min_y;
			if (new_y < holder.max_y) new_y = holder.max_y;
			if (drag) {
				holder.txt_cont.y = new_y;
				holder.allow_move = true;
			}
			else {
				game_data['scene'].tweens.add({targets: holder.txt_cont, y: new_y, duration: 200, onComplete: ()=> {
					holder.def_y = holder.txt_cont.y;
					holder.allow_move = true;
				}});
			}
		}	
	}

	show_components(cont) {
		if (cont && cont.type === 'Container') {
			console.log(cont.list)
			cont.each(el => this.show_components(el))
		}
	}

	delayed_call(delay, on_complete = () => {}) {
		let timer = game_data['scene'].time.delayedCall(delay, () => {
			on_complete()
			setTimeout(() => {
				timer.remove()
				timer.destroy(true);
			}, 10)
		});
		return timer
	}

	clean_gem_timers() {
		game_data['gem_timers']?.forEach(timer => {
			timer.remove()
			timer.destroy(true)
			game_data['gem_timers'].splice(timer, 1)
		})
	}

	check_create_shortcut() {
		if (!this.was_shortcut) {
			let passed = this.get_passed_amount();
			if (passed === 3 || (passed % 50 === 0 && passed !== 0)) {
				this.was_shortcut = true;
				game_data['socialApi'].create_shortcut();
			}
		}
	}

	test_anim() {
		let a = null
		game_data['scene'].tweens.add({
			targets: [a],
			alpha: 1,
			duration: 500
		})
	}

	try_subscribe() {
		let total_wins = this.get_passed_amount()
		if (canSubscribeBot && ((total_wins >= 3 && total_wins < 6) || total_wins % 50 == 0) && total_wins != 0) {
			game_request.update_stat({'bot_event': true, 'action_id': 'try_subscribe'});
			FBInstant.player.subscribeBotAsync().then(()=> {
				game_request.update_stat({'bot_event': true, 'action_id': 'subscribe_success'});
			}).catch((e)=> {
				game_request.update_stat({'bot_event': true, 'action_id': 'subscribe_fail'});
			});
			canSubscribeBot = false;
		}
	}

	check_wall_post(holder, pt) {
		if (!('wall_post_day_id' in game_data['user_data'])) game_data['user_data']['wall_post_day_id'] = 0;
		let info = game_data['wall_post_settings'];
		let passed = get_passed_amount();
		let allow = (loading_vars['net_id'] == 'ig' || is_localhost) && info['share_active'] && !game_data['game_tutorial'].has_tutorial 
				&& passed > 5 && ((passed + 1) % 5 != 0);
		let no_spam = this.wall_post_popups <= 2 && Math.random() < info['rnd'] 
				&& loading_vars['day_id'] - parseInt(game_data['user_data']['wall_post_day_id']) >= info['day_delay'];
		if (is_localhost) {no_spam = true; allow = false;}
		
		if (allow && no_spam) {
			let cont = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
			holder.add(cont);
			this.wall_post_popups += 1;
			let no = String(parseInt(Math.random() * info['total_images']) + 1);
			let url = game_data['urls']['assets'] + 'wall_post/' + info['prefix'] + no + info['suffix'];
			cont.url = url;
			cont.bg = new Phaser.GameObjects.Image(this.scene, 2, 0, 'common1', 'panel2');
			cont.bg.setScale(300 / cont.bg.width, 66 / cont.bg.height);
			cont.bg.setInteractive();
			cont.add(cont.bg);
			cont.cb_bg = new Phaser.GameObjects.Image(this.scene, 0, -2, 'common2', 'check_box_bg');
			cont.add(cont.cb_bg);
			cont.cb_icon = new Phaser.GameObjects.Image(this.scene, cont.cb_bg.x, cont.cb_bg.y, 'common2', 'checkbox_icon');
			cont.add(cont.cb_icon);
			cont.cb_icon.visible = false;
			cont.bg.on('pointerdown', ()=> {
				cont.cb_icon.visible = !cont.cb_icon.visible;
			})
			
			let res = game_data['utils'].generate_string({'scene_id': 'share', 'item_id': 'share', 'phrase_id': '1', 'values': [game_data['wall_post_reward']], 'base_size': 26});
			let temp = new Phaser.GameObjects.Text(this.scene, 0, -2, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#ffffff', stroke: '#000000', strokeThickness: 3});
			temp.setOrigin(0.5);
			cont.add(temp);
			cont.icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'money_ico');
			cont.icon.scale = 0.6;
			temp.x = -cont.icon.displayWidth / 2;
			let cb_w = cont.cb_bg.displayWidth / 2;
			temp.x += cb_w;
			temp.x += 9;
			cont.icon.x = -12 + temp.x + temp.width / 2 +cont.icon.displayWidth / 2;
			cont.add(cont.icon);
			
			cont.cb_bg.x = -6 + temp.x - temp.width / 2 - cb_w;
			cont.cb_icon.x = cont.cb_bg.x
			return cont;
		}
	}
	
	show_make_wall_post(cont) {
		if (cont.cb_icon.visible) {
			game_data['socialApi'].create_wall_post({'url': cont.url}, (res)=>{
				if (res['success']) {
					let req_obj = {'collect_wall_post_reward': true, 'with_reward': true};
					game_request.request( req_obj, (obj)=> {
						if (obj['success']) {
							this.wall_post_popups = 3;
							game_data['utils'].update_stat({'collect_wall_post_reward': true, 'with_reward': true});
							this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'social_reward', 'type': 'wall_post'});
						}
					});
				}
			});
		}
	}
	
	check_existing_tournament(init = false) {
		if (init && !this.existing_tournament_checked) {
			this.existing_tournament_checked = true;
			game_data['socialApi'].get_current_tournament((tournament)=>{
				game_data['current_tournament'] = tournament;
			});
		}
		if (!init) {
			if (game_data['current_tournament']) {
				let current_time = Math.ceil(game_request.get_time() / 1000);
				if (current_time >= game_data['current_tournament'].getEndTime()) return false;
				else return true;
			}
			else return false;
		}
	
	}
	
	check_new_tournament(holder, pt, _score, allow_new) {
		if (!game_data['user_data']['ig_tournament']) game_data['user_data']['ig_tournament'] = {'score': 0, 'day_id': 0};
		let info = game_data['tournament_settings'];
		let day_id = parseInt(game_data['user_data']['ig_tournament']['day_id']);
		let has_tournament = this.check_existing_tournament();
	
		if (is_localhost) {has_tournament = false; allow_new = false;}
		
		if (has_tournament) {
			let new_score = game_data['user_data']['ig_tournament']['score'] + _score;
			let with_share = !this.share_tournament_shown && Math.random() < info['rnd'] 
				&& loading_vars['day_id'] - day_id >= info['share_delay'] && !game_data['game_tutorial'].has_tutorial;
	
			if (with_share) this.share_tournament_shown = true;
				
			game_data['socialApi'].share_tournament({'score': new_score, 'share': with_share}, (success)=>{
				let req_obj = {'update_ig_tournament': true, 'score': new_score};
				if (with_share) req_obj['day_id'] = loading_vars['day_id'];
				if (game_data['current_tournament']) req_obj['context_id'] = String(game_data['current_tournament'].getID());
				game_request.request( req_obj, (obj)=> {});
				
			});
			return false;
		}
		else if (allow_new) {
			let passed = get_passed_amount();
			let allow_btn = (loading_vars['net_id'] == 'ig' || is_localhost) && passed > 5 && ((passed + 1) % 5 != 0) && !game_data['game_tutorial'].has_tutorial && 
				Math.random() < info['rnd'] && loading_vars['day_id'] - day_id >= info['day_delay'] && this.tournament_popups <= 2;
			
			if (is_localhost) allow_btn = true;
			
			if (allow_btn) {
				let cont = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
				holder.add(cont);
				this.tournament_popups += 1;
				cont.score = _score;
	
				cont.bg = new Phaser.GameObjects.Image(this.scene, 2, 0, 'common1', 'panel2');
				cont.bg.setScale(300 / cont.bg.width, 66 / cont.bg.height);
				cont.bg.setInteractive();
				cont.add(cont.bg);
				cont.cb_bg = new Phaser.GameObjects.Image(this.scene, 0, -2, 'common2', 'check_box_bg');
				cont.add(cont.cb_bg);
				cont.cb_icon = new Phaser.GameObjects.Image(this.scene, cont.cb_bg.x, cont.cb_bg.y, 'common2', 'checkbox_icon');
				cont.add(cont.cb_icon);
				cont.cb_icon.visible = false;
				cont.bg.on('pointerdown', ()=> {
					cont.cb_icon.visible = !cont.cb_icon.visible;
				})
				
				let res = game_data['utils'].generate_string({'scene_id': 'tournament', 'item_id': 'tournament', 'phrase_id': '1', 'values': [], 'base_size': 19});
				let txt = new Phaser.GameObjects.Text(this.scene, 0, -13, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#ffffff', stroke: '#000000', strokeThickness: 3});
				txt.setOrigin(0.5);
				cont.add(txt);
	
				let cb_w = cont.cb_bg.displayWidth / 2;
				txt.x += cb_w;
				cont.cb_bg.x = txt.x - txt.width / 2 - cb_w;
				cont.cb_icon.x = cont.cb_bg.x;
				txt.x += 1;
				
				let temp = new Phaser.GameObjects.Text(this.scene, 0, 12, String(game_data['tournament_start_reward']), { fontFamily: 'font1', fontSize: 24, color: '#ffffff', stroke: '#000000', strokeThickness: 3});
				temp.setOrigin(0.5);
				cont.add(temp);
	
				cont.icon = new Phaser.GameObjects.Image(this.scene, 0, temp.y, 'common1', 'money_ico');
				cont.icon.scale = 0.6;
				temp.x = txt.x - cont.icon.displayWidth / 2;
				cont.icon.x = -5 + temp.x + temp.width / 2 +cont.icon.displayWidth / 2;
				cont.add(cont.icon);
				return cont;
			}
			else return false;
		}
		else return false;
	}
	
	show_new_tournament(cont) {
		if (cont && cont.score && cont.cb_icon.visible) {
			let score = cont.score;
			game_data['socialApi'].share_tournament({'score': score}, (success)=>{
				if (success) {
					let req_obj = {'update_ig_tournament': true, 'score': score, 'with_reward': true, 'day_id': loading_vars['day_id']};
					if (game_data['current_tournament']) req_obj['context_id'] = String(game_data['current_tournament'].getID());
					game_request.request( req_obj, (obj)=> {
						if (obj['success']) {
							this.tournament_popups = 3;
							game_data['utils'].update_stat({'update_ig_tournament': true, 'score': score, 'with_reward': true, 'day_id': loading_vars['day_id']});
							this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'social_reward', 'type': 'ig_tournament'});
						}
					});
				}
			});
		}
	}

	test_remove_gem(pos_y, pos_x) {
		game_data.game_engine.playing_field.gems_manager.gems_utils.emitter.emit('EVENT', {'event': 'REMOVE_GEM', 'pos_x': pos_x, 'pos_y': pos_y});
	}

	check_tiles() {
		this.parse_all_levels()
		for (let level in game_data['levels_data']) {
			let total_tiles = 0
			if (game_data['levels_data'][level]['fields']) {
				let tiles = game_data['levels_data'][level]['fields'][0]['tiles']
				if (tiles) {
					for (let y = 0; y < tiles.length; y++) {
						for (let x = 0; x < tiles[y].length; x++) {
							if (tiles[y][x] === '1' || tiles[y][x] === '2') total_tiles++
						}
					}
				}
			}
			
			if (total_tiles === 0)
			console.log(level, total_tiles)
		}
	}
	parse_all_levels() {
		let ids = Phaser.Utils.Array.NumberArray(12, 601)
		ids = [
			'1_1', '1_2', '1_3',
			'2_1', '2_2', '2_3',
			'3_1', '3_2', '3_3',
			'4_1', '4_2', '4_3',
			'5_1', '5_2', '5_3',
			'6_1', '6_2', '6_3',
			'7_1', '7_2', '7_3',
			'8_1', '8_2', '8_3',
			'9_1', '9_2', '9_3',
			'10_1', '10_2', '10_3',
			'11_1', '11_2', '11_3',
			...ids
		]
		ids.forEach(id => {
			if (game_data['levels_data'][id] && game_data['levels_data'][id]['level_type'] !== 'hidden')
				this.parse_level(id, this.is_extending_game(), 0);
		})
	}
}