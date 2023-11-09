class Game {
	constructor(_scene) {
		this.scene = _scene;
	}
	get_social_api() {	
		let socialApi;	
		if (loading_vars['net_id'] == 'ok') socialApi = new OkApi();
		else if (loading_vars['net_id'] == 'fb') socialApi = new FbApi();
		else if (loading_vars['net_id'] == 'ig') socialApi = new IgApi();
		else if (loading_vars['net_id'] == 'vk') socialApi = new VkApi();		
		else socialApi = new DefaultApi();
		return socialApi;
	}	

	prepare_game() {
		var _this = this;
		game_data['socialApi'] = this.get_social_api();
		game_data['utils'] = new GameUtils();

		game_data['audio_manager'] = new AudioManager(game_data['scene']);
		window.onerror = function(msg, url, lineNo, columnNo, error) {
			_this.report_error(msg, url, lineNo, columnNo, error);
		};	
		
		this.bg_holder = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		game_data['scene'].add.existing(this.bg_holder);
		game_data['socialApi'].extra_start_actions(function(){
			if (loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 3, 'description': 'create_game1'});
			if (is_localhost) {
				_this.create_main_game();
			}
			else {	
				update_stat_init(2);			
				_this.create_main_game();								
			}
		});
	}

	update(){
		if (this.game_play) this.game_play.update();
	}
	create_main_game(){
		var _this = this;
		game_data['utils'].init(game_data['scene']);	
		game_data['utils'].emitter.on('EVENT', this.handler_event, this);
		game_data['graphics_manager'] = new GraphicsManager();
		game_data['graphics_manager'].init(game_data['scene']);
		game_data['global_scene_click'] = new Date().getTime();
		
		window.addEventListener("resize", function(){
			game_data['socialApi'].set_game_size();			
		});		
		game_data['audio_manager'].init();
		game_data['sales_manager'] = new SalesManager();
		game_data['sales_manager'].emitter.on('EVENT', this.handler_event, this);
		if (loading_vars['net_id'] == 'fb') { 
			game_data['share_active'] = false;
		}

		phaser_game.events.on('hidden',function(){ },this);
		phaser_game.events.on('visible',function(){},this);
	
		var temp = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, 'game_play_bg1');
		temp.setScale((loading_vars['W']/temp.width), (loading_vars['H']/temp.height));
		temp.setOrigin(0,0);
		_this.bg_holder.add(temp);
		game_data['utils'].assign_to_global_missclick(temp);




		this.game_map = new GameMap(game_data['scene']);		
		this.game_play = new GamePlay(game_data['scene']);
		this.game_windows = new GameWindows(game_data['scene']);
		this.game_play.visible = false;
		this.game_tutorial = new GameTutorial(game_data['scene']);





		var rating_sprite = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		game_data['scene'].add.existing(this.game_map);
		game_data['scene'].add.existing(rating_sprite);

		var first_gems_moving_holder = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		this.game_play.first_gems_moving_holder = first_gems_moving_holder;
		game_data['scene'].add.existing(this.game_play);
		game_data['scene'].add.existing(first_gems_moving_holder);	

		game_data['scene'].add.existing(_this.game_windows);
		var moving_holder = new Phaser.GameObjects.Container(game_data['scene'], 0,0);
		game_data['scene'].add.existing(moving_holder);
		game_data['moving_holder'] = moving_holder;
		game_data['scene'].add.existing(_this.game_tutorial);

		game_data['utils'].init_loading();
		game_data['utils'].add_loading();
		game_data['utils'].add_orientation_notifier();
		game_data['utils'].load_xmls_preloaded(function(){
			update_stat_init(3);
			game_data['game_request'].create_server_request_loader();
			if (game_data['user_data']['tutorial'] == null) game_data['user_data']['tutorial'] = {};
			setTimeout(() => {


				_this.game_tutorial.init({});    //game_engine.init(TUTOR) !!!!!!


				game_data['utils'].count_stars();	
				game_data['utils'].update_stat({'type': 'started'});
				game_data['utils'].init_ads();	
				var lang = game_data['user_data']['lang'].toLowerCase();
				if (game_data['langs'].indexOf(lang) < 0) game_data['user_data']['lang'] = 'en';
				if (loading_vars['new_user']) {
					game_data['utils'].update_stat({'type': 'start_money', 'amount_inc': game_data['user_data']['money']});
					if (loading_vars['locale']) {
						lang = loading_vars['locale'].substring(0,2).toLowerCase();
						game_data['user_data']['lang'] = (game_data['langs'].indexOf(lang) < 0) ? 'en' : lang;
						game_data['game_request'].request( {'select_language': true,'lang': game_data['user_data']['lang']},function(obj) {});
					}
				}
				game_data['notification_manager'] = new NotificationManager();
				_this.game_map.visible = false;
					
				if (loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 4, 'description': 'create_game2'});
				game_data['utils'].check_levels_extending();
				setTimeout(() => {
					_this.game_map.init({'rating_sprite':rating_sprite});	
					_this.game_map.update_money();	
					_this.start_game();	
					_this.game_map.visible = true;
					game_data['socialApi'].get_friends(function() {});
					if (loading_vars['urls']['ads']) {
						$.ajax({
							type: 'post',
							url: loading_vars['urls']['ads'],
							data: {'game_id': loading_vars['game_id'], 'net_id':loading_vars['net_id']},
							//data: {'game_id': loading_vars['game_id'], 'net_id':'fb'},
							success: function(data) {
								var res = JSON.parse(data);
								if (res['success'] && 'more_games' in res) {
									game_data['more_games'] = res['more_games'];
								}
							}
						});	
					}
				}, 300);		
			}, 50);
		});

	}

	

	start_game() {
		var _this = this;
		game_data['start_timestamp'] = game_data['utils'].get_time()
		game_data['utils'].init_tips();
		game_data['utils'].save_prev_boosters();
		_this.game_map.emitter.on('EVENT', _this.handler_event, _this);
		game_data['current_scene'] = 'MAP';
		_this.game_tutorial.emitter.on('EVENT', _this.handler_event, _this);
		if (loading_vars['new_user']) game_request.update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 5, 'description': 'show_map'});
		setTimeout(() => {
			game_data['socialApi'].set_game_size();	
			setTimeout(() => { game_data['scene'].scale.refresh(); }, 1000);

			if (loading_vars['start_engine']) {
				var level_id = loading_vars['tournament_id'];
				game_data['utils'].Timelines = {"2":[{},{},{}],"3":[{},{},{}],"9":[{},{},{}]}
				game_data['utils'].level_start(level_id);
				var obj = {"opponents":{"2":{},"3":{},"9":{}},"ids":["3","9","2"],"competitors_ids":["0","3","9","2"],"visual_ids":["9","3","0","2"],"rating_type":"all","passing":true}
				obj['level_id'] = String(level_id);
				this.handler_start_tournament({'settings': obj});
			}
			else _this.show_map({'init': true});	
		}, 250);
		
		_this.game_windows.init({});
		_this.game_windows.emitter.on('EVENT', _this.handler_event, _this);
		_this.game_play.init();
		_this.game_play.emitter.on('EVENT', _this.handler_event, _this);
		game_data['task_manager'] = new TaskManager();
		game_data['task_manager'].init();
		
		// game_data['utils'].check_bonuses();

		if ('paid_chest' in game_data['user_data'] && game_data['user_data']['paid_chest'].length) {
			for (var i = 0; i < game_data['user_data']['paid_chest'].length; i++) {
				var chest_id = game_data['user_data']['paid_chest'][i];
				if (chest_id in game_data['paid_chest_prize']) {
					var wnd_obj = {'event': 'show_window', 'window_id': 'paid_chest_open','chest_id': chest_id, 'rating_type': game_data['rating_manager'].get_current_rating()['type']}
					this.handler_event(wnd_obj);
				}
			}
		}

		game_data['utils'].check_pending_purchases();

		setTimeout(() => {
			game_data['utils'].game_mode();
			game_data['sales_manager'].init();
		}, 800)
		setTimeout(() => {
			game_data['utils'].remove_loading();
			game_data['utils'].game_mode();
			this.game_map.update_buttons(true);
		}, 2000);
		setTimeout(() => {
			game_data['utils'].check_save_user_info();
		}, 4000);
		game_data['scene'].input.on('pointerdown', function() {
			if ('unpaused' in game_data && game_data['unpaused'] == 0) {
				game_data['unpaused'] = 1;
				game_data['audio_manager'].update_volume();
			}
		}, this);

		(function() {
			var hidden = "hidden";
  
			// Standards:
			if (hidden in document)
			  document.addEventListener("visibilitychange", onchange);
			else if ((hidden = "mozHidden") in document)
			  document.addEventListener("mozvisibilitychange", onchange);
			else if ((hidden = "webkitHidden") in document)
			  document.addEventListener("webkitvisibilitychange", onchange);
			else if ((hidden = "msHidden") in document)
			  document.addEventListener("msvisibilitychange", onchange);
			// IE 9 and lower:
			else if ("onfocusin" in document)
			  document.onfocusin = document.onfocusout = onchange;
			// All others:
			else
			  window.onpageshow = window.onpagehide
			  = window.onfocus = window.onblur = onchange;
  
			function onchange (evt) {
			  var v = "visible", h = "hidden",
				  evtMap = {
					focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
				  };
  
			  evt = evt || window.event;

			  if (evt.type in evtMap) {
				document.body.className = evtMap[evt.type];
			  }
			  else {
				document.body.className = document['hidden'] ? "hidden" : "visible";
			  }
			   
			   
			   if (document.body.className == "hidden") {
				  game_data['unpaused'] = 0;
				  game_data['audio_manager'].update_volume();				 
			   }
			   else {
				  game_data['unpaused'] = 1;
				  game_data['audio_manager'].update_volume();				 				 
			   }
			}
  
			// set the initial state (but only if browser supports the Page Visibility API)
			if( document['hidden'] !== undefined )
			  onchange({type: document['hidden'] ? "blur" : "focus"});
		  })();

		if (allow_rewarded_ads) game_data['utils'].preload_rewarded_ad();
		if (allow_intersitial_ads) game_data['utils'].preload_interstitial_ad();

		game_data['utils'].check_cheated_interstitial()
	}


	handler_event(params) {
	  switch (params['event']) {
		  	case 'show_scene': 
			  this.show_scene(params)
			break;
			case 'show_window': 
			
				this.show_window(params);
				break;
			case 'window_closed': 
				if (!params['pending_length']) {
					this.game_map.show_play();
					game_data['utils'].resume_tip();
				}
				this.game_map.check_delayed_prize();
				break;
			case 'window_shown': 
				this.game_map.hide_play();
				break;
			case 'start_game_play':
				this.show_gameplay(params);
				break;
			case 'update_money_box':
				this.game_map.update_money_box(params);
				this.game_play.update_money_box(params);
				break;
			case 'update_money': 
				this.game_map.update_money();
				this.game_play.update_money(params);
				break;
			case 'update_language':
				this.game_play.update_language();
				this.game_map.update_language();
				game_data['utils'].update_language();
				break;
			case 'destroy_level':				
				this.game_play.clear_level();				
				break;											
			case 'start_tournament':
				this.handler_start_tournament(params);
				break;
			case 'continue_tournament':
				this.handler_continue_tournament(params);
				break;
			case 'cancel_level':
				this.handler_cancel_level(params);
				break;
			case 'cancel_tournament':
				this.handler_cancel_tournament(params);
				break;
			case 'win_tournament':
				this.handler_win_tournament(params);
				break;
			case 'clear_wait':
				this.handler_clear_wait(params);
				break;
			case 'delayed_unblock':
				this.game_map.check_delayed_unblock();
				break;
			case 'GAME_MODE_CHANGE': 
				this.game_map.game_mode_change(params);
				this.game_play.game_mode_change(params);
				break;
			case 'tutorial_finished':
				this.game_play.tutorial_finished();
				this.game_map.check_delayed_prize();
				setTimeout(() => {
					game_data['utils'].resume_tip();
				}, 150);
				break;
			case 'UPDATE_CHESTS':
				this.game_map.update_chests();
				break;
	  default:
		//console.log('Unknown event=',params['event'])
		break;
		}
	}

	handler_cancel_level() {
		this.game_play.game_engine.level_complete(true);
	}

	show_window(params) {
		if (!('money_pt' in params)) params['money_pt'] = this.game_map.get_money_pt();
		if (!this.game_tutorial.has_tutorial || params['window_id'] == 'wait_competitors' || params['window_id'] == 'chest_open' || params['window_id'] == 'map_prize') this.game_windows.show_window(params);
	}
	
	show_scene(params) {
		game_data['utils'].update_stat({'type': 'scene_shown', 'description': params['scene_id']});
		game_data['utils'].hide_tip();
		game_data['current_scene'] = params['scene_id'];
		switch (params['scene_id']) {
			case 'GAMEPLAY': 
				this.show_gameplay(params)
				break;
				case 'MAP': 
				this.show_map(params)
				break;
			default:
				console.log('Unknown scene_id=',params['scene_id'])
				break;
		}
	}

	handler_start_tournament(params) {
		game_data['is_gameplay'] = true;
		var _this = this;
		//game_data['utils'].add_loading(null, 0.3);
		
		game_data['current_scene'] = 'GAMEPLAY';
		this.game_play.load_bg(params['settings']['level_id'], function(){
			// if (game_data['user_data']['levels_passed'].length > 3) _this.game_map.set_wait();
			_this.game_play.alpha = 0;
			_this.game_play.visible = true;
			_this.game_map.hide_rating();			
			game_data['scene'].tweens.add({targets: _this.game_map, alpha: 0, duration: 600});
			game_data['scene'].tweens.add({targets: _this.game_play, alpha: 1, duration: 500, delay: 300, onComplete: function(){
				_this.game_map.visible = false;	
				_this.game_map.alpha = 1;
			}});
			setTimeout(() => {
				
				_this.game_play.start_level(params['settings']);
				_this.game_play.start_music();
			}, 700);
			//game_data['utils'].remove_loading();
		});
	}

	handler_continue_tournament(params) {		
		this.game_play.set_next_field();
	}

	handler_cancel_tournament() {		
		this.game_map.cancel_tournament();
	}

	handler_win_tournament() {		
		this.game_play.level_finished();
		this.game_map.clear_wait(false);
	}

	handler_clear_wait() {
		this.game_map.clear_wait(true);
	}

	show_gameplay(params) {
		game_data['is_gameplay'] = true;
		game_data['current_scene'] = 'GAMEPLAY';
	}
	
	show_map(params) {
		this.game_map.visible = true;
		this.game_play.visible = false;
		this.game_map.show_map(params);
		game_data['is_gameplay'] = false;
		game_data['current_scene'] = 'MAP';
		this.game_map.show_rating();
	}

	update_user_data() {
		if (this.game_map) this.game_map.update_user_data();
	}

	report_error(msg, url, line, col, error) {
		var stack = error ? error.stack : 'no_stack';
		game_data['game_request'].update_stat_error({'msg': msg, 'url': url, 'line': line, 'col': col, 'stack': stack});		
	}

	
}