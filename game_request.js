
class GameRequest {
	constructor() {
		// game_data['scene'] = game_data['scene'];		
		this.game_data_exists = false;
		this.emitter = new Phaser.Events.EventEmitter();		
	}

	init() {
		// game_data['scene'] = game_data['scene'];		
		this.game_data_exists = true;
		// this.emitter = new Phaser.Events.EventEmitter();
		//this.reset_test_no_connection();
	}

	get_time() {
		return new Date().getTime();
	}

	request(obj, on_complete) {
		var _this = this;
		var use_server = ('use_server' in loading_vars && loading_vars['use_server']);
		if (this.test_no_connection) {
			var request_obj = {'obj': obj, 'on_complete': on_complete};
			this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'no_connection', 'request_obj': request_obj});
			this.test_no_connection = false;
			this.reset_test_no_connection();
			game_data['utils'].unblock_screen('no_connection');	
		}
		else if (use_server) {
			var allow_complete = true;
			if (navigator.onLine) {
				var tid = setTimeout(() => {
					allow_complete = false;
				}, 15000);
				
				if (!('get_game_info' in obj)) this.show_request_loader();
				this.server_request(obj, function(res) {
					clearTimeout(tid);
					if (allow_complete) {		
						if (!('get_game_info' in obj)) _this.hide_request_loader();
						_this.update_user_data(res, on_complete);
					}
				});
			}
			else {
				allow_complete = false;
				var request_obj = {'obj': obj, 'on_complete': on_complete};
				this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'no_connection', 'request_obj': request_obj});
			}
		}
		else {
			this.local_request(obj, function(res){				
				_this.update_user_data(res, on_complete);
			});
		}
	}

	update_user_data(res, on_complete) {
		var key;
		for (key in res)
			if (key in game_data['user_data'])
				game_data['user_data'][key] = res[key];		
		//setTimeout(() => {
			on_complete(res);	
		//}, 1000);
		
		this.save_user_data();		
	}

	update_stat_error(error) {
		if (!('total_errors' in game_data))
			game_data['total_errors'] = 0;
		game_data['total_errors']++;
		if (game_data['total_errors'] < 10) { 
			var obj = {'error_report': true, 'error': error};
			this.update_stat(obj);	
		}
	}

	save_user_data() {
		if (!is_localhost) {
			if (game_data['is_standalone']) {
				if (game_data['game_menu']) 
					game_data['game_menu'].save_user_data()
			}
			else {
				//localStorage.setItem(loading_vars['game_id'], JSON.stringify(game_data['user_data']));
			}
		}
	}

	get_browser(obj) {

		var nAgt = navigator.userAgent;
		var browserName  = navigator.appName;
		var fullVersion  = ''+parseFloat(navigator.appVersion); 
		var majorVersion = parseInt(navigator.appVersion,10);
		var nameOffset,verOffset,ix;
		
		// In Opera 15+, the true version is after "OPR/" 
		if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
		 browserName = "Opera";
		 fullVersion = nAgt.substring(verOffset+4);
		}
		// In older Opera, the true version is after "Opera" or after "Version"
		else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
		 browserName = "Opera";
		 fullVersion = nAgt.substring(verOffset+6);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
		 browserName = "Microsoft Internet Explorer";
		 fullVersion = nAgt.substring(verOffset+5);
		}
		// In Chrome, the true version is after "Chrome" 
		else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
		 browserName = "Chrome";
		 fullVersion = nAgt.substring(verOffset+7);
		}
		// In Safari, the true version is after "Safari" or after "Version" 
		else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
		 browserName = "Safari";
		 fullVersion = nAgt.substring(verOffset+7);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In Firefox, the true version is after "Firefox" 
		else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
		 browserName = "Firefox";
		 fullVersion = nAgt.substring(verOffset+8);
		}
		// In most other browsers, "name/version" is at the end of userAgent 
		else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
				  (verOffset=nAgt.lastIndexOf('/')) ) 
		{
		 browserName = nAgt.substring(nameOffset,verOffset);
		 fullVersion = nAgt.substring(verOffset+1);
		 if (browserName.toLowerCase()==browserName.toUpperCase()) {
		  browserName = navigator.appName;
		 }
		}
		// trim the fullVersion string at semicolon/space if present
		if ((ix=fullVersion.indexOf(";"))!=-1)
		   fullVersion=fullVersion.substring(0,ix);
		if ((ix=fullVersion.indexOf(" "))!=-1)
		   fullVersion=fullVersion.substring(0,ix);
		
		majorVersion = parseInt(''+fullVersion,10);
		if (isNaN(majorVersion)) {
		 fullVersion  = ''+parseFloat(navigator.appVersion); 
		 majorVersion = parseInt(navigator.appVersion,10);
		}
		obj['browser_name'] = browserName;
		obj['browser_version'] = majorVersion;
		
		}

	update_stat(obj) {	
		if (loading_vars['statistics_active'] || loading_vars['user_id'] == '0') { // || loading_vars['user_id'] == '2168638003229093'
			var user_data = temp_user_data ? temp_user_data : (this.game_data_exists ? game_data['user_data'] : null);
			var stat_data = {
				'game_id': loading_vars['game_id'],
				'user_id': loading_vars['user_id'],
				'net_id': loading_vars['net_id'],
				'timestamp':  this.get_time() - loading_vars['start_time']
			}
			var mongo_data = null;
			
		
			var platform = loading_vars['mobile'] ? 'mobile' : 'web';
			if (loading_vars['platform']) platform = String(loading_vars['platform']);	
			mongo_data = {
				'session_id' : user_data ? user_data['session_id'] : -1,
				'platform': platform,
				'locale': loading_vars['locale'] ? loading_vars['locale'] : 'unknown',
				'boosters' : user_data ? user_data['boosters'] : {},
				'money': user_data ? user_data['money'] : 0
			};
			if ('get_game_info' in obj) {
				mongo_data['stat_id'] = 'get_game_info';
				var d = new Date();
				mongo_data['hours'] = d.getHours();
				mongo_data['day'] = d.getDate();
				if (loading_vars['new_user']) {
					mongo_data['new_user'] = loading_vars['new_user'];
				}
				this.get_browser(obj);
				mongo_data['browser_version'] = obj['browser_version'];
				mongo_data['browser_name'] = obj['browser_name'];
			}
			else if ('funnel' in obj) {
				mongo_data['stat_id'] = 'funnel';
				mongo_data['funnel_id'] = obj['description'];
				mongo_data['order'] = obj['sub_action'];
				
			}
			else if ('level_start' in obj) {
				
				mongo_data['stat_id'] = 'level_start';
				mongo_data['level_id'] = obj['level'];
				mongo_data['money'] = user_data['money'];
				mongo_data['total_stars'] = user_data['stars_total'] ? user_data['stars_total'] : 0
			}
			else if ('level_fail' in obj) {
				mongo_data['stat_id'] = 'level_fail';
				mongo_data['level_id'] = obj['level'];
				mongo_data['money'] = user_data['money'];
				mongo_data['round'] = obj['sub_action'];
				mongo_data['reason'] = obj['reason'];
			}
			else if ('level_complete' in obj) {
				mongo_data['stat_id'] = 'level_complete';
				mongo_data['level_id'] = obj['level'];
				mongo_data['stars'] = obj['level_stars'];
				mongo_data['money'] = user_data['money'];
				mongo_data['total_stars'] = user_data['stars_total'] ? user_data['stars_total'] : 0
				
			}
			else if ('error_report' in obj) {
				mongo_data['stat_id'] = 'error_report';
				mongo_data['error'] = obj['error'];
			}
			else if ('update_purchase' in obj) {
				mongo_data['stat_id'] = 'update_purchase';
				mongo_data['purchase'] = {};
				mongo_data['price'] = obj['item_info']['price'];
				mongo_data['item_id'] = obj['item_info']['item_id'];
				if (obj['item_info']['type'] === 'money') {
					mongo_data['purchase']['money'] = obj['item_info']['amount'];
				}
				if (obj['item_info']['type'] == 'money_box') mongo_data['purchase']['money'] = obj['amount_inc'];
				if (obj['item_info']['type'] == 'chest') mongo_data['purchase']['chest'] = obj['amount'];
				
			}
			else if ('ad_show' in obj) {
				mongo_data['stat_id'] = 'ad_show';
				mongo_data['type'] = obj['type'];
			}
			else if ('bot_event' in obj) {
				mongo_data['stat_id'] = 'bot_event';
				mongo_data['action_id'] = obj['action_id'];
			}
			else if ('action' in obj) {
				mongo_data['stat_id'] = 'action';
				mongo_data['action_id'] = obj['action_id'];
				mongo_data['info'] = obj['info'];
			}
			else if ('buy_tournament' in obj) {
				mongo_data['stat_id'] = 'booster_use';
				mongo_data['price'] = obj['amount_dec'];
				mongo_data['amount'] = 1;
				mongo_data['booster_id'] = 'tournament';
			}
			else if ('collect_video_reward' in obj) {
				
				mongo_data['stat_id'] = 'collect_video_reward';
				mongo_data['amount'] = obj['prize_amount'];
				mongo_data['type'] = obj['prize_type'];
			}
			else if ('skip_task' in obj) { 
				mongo_data['stat_id'] = 'booster_use';
				mongo_data['task_id'] = obj['description'];
				mongo_data['price'] = obj['amount_dec'];
				mongo_data['amount'] = 1;
				mongo_data['booster_id'] = 'skip_task';
			}
			else if ('collect_rating_prize' in obj) {
				mongo_data['stat_id'] = 'collect_rating_prize';
				mongo_data['amount'] = obj['amount'];
			}
			else if ('paid_chest_open' in obj) {
				mongo_data['stat_id'] = 'paid_chest_open';
				mongo_data['prizes'] = obj['prizes'];
				mongo_data['task_chest'] = obj['task_chest'];	
			}
			else if ('set_options' in obj) {
				mongo_data['stat_id'] = 'set_options';
				if ('music' in obj) mongo_data['music'] = obj['music'];
				if ('sound' in obj) mongo_data['sound'] = obj['sound'];
			}
			else if ('money_box_free' in obj) {
				mongo_data['stat_id'] = 'money_box_free';
				mongo_data['amount'] = obj['amount_inc'];
			}
			else if ('round_start' in obj) {
				mongo_data['stat_id'] = 'round_start';
				mongo_data['level_id'] = obj['level'];
				mongo_data['round'] = obj['sub_action'];
			}
			else if ('round_complete' in obj) {
				mongo_data['stat_id'] = 'round_complete';
				mongo_data['level_id'] = obj['level'];
				mongo_data['round'] = obj['sub_action'];
			}
			else if ('duel_start' in obj) {
				mongo_data['stat_id'] = 'duel_start';
				mongo_data['level_id'] = obj['level'];
				mongo_data['round'] = obj['sub_action'];
			}
			else if ('duel_fail' in obj) {
				mongo_data['stat_id'] = 'duel_fail';
				mongo_data['level_id'] = obj['level'];
				mongo_data['round'] = obj['sub_action'];
			}
			else if ('duel_complete' in obj) {
				mongo_data['stat_id'] = 'duel_complete';
				mongo_data['level_id'] = obj['level'];
				mongo_data['round'] = obj['sub_action'];
			}
			else if ('select_language' in obj) {
				mongo_data['stat_id'] = 'select_language';
				mongo_data['lang'] = obj['lang'];
			}
			else if ('booster_buy' in obj) {
				mongo_data['stat_id'] = 'booster_use';
				mongo_data['price'] = obj['amount_dec'];
				mongo_data['amount'] = obj['amount_inc'];
				mongo_data['booster_id'] = obj['sub_action'];
			}
			else if ('collect_day_bonus' in obj) {
				mongo_data['stat_id'] = 'collect_day_bonus';
				mongo_data['day'] = obj['day'];
				mongo_data['type'] = obj['prize_type'];
				mongo_data['amount'] = obj['amount'];
			}
			else if ('collect_map_prize' in obj) {
				mongo_data['stat_id'] = 'collect_map_prize';
				mongo_data['prizes'] = obj['prizes'];
			}
			else if ('cancel_tournament' in obj) {
				mongo_data['stat_id'] = 'cancel_tournament';
			}
			else if ('set_wait' in obj) {
				mongo_data['stat_id'] = 'set_wait';
			}
			else if ('chest_open' in obj) {
				mongo_data['stat_id'] = 'chest_open';
				mongo_data['prizes'] = obj['prizes'];
				
			}
			else if ('collect_gift_friend' in obj) {
				mongo_data['stat_id'] = 'collect_gift_friend';
				mongo_data['amount'] = obj['amount_inc'];
			}
			else if ('interstitial_cheater' in obj) {
				mongo_data['stat_id'] = 'interstitial_cheater';
			}
			else if ('create_shortcut' in obj) {
				mongo_data['stat_id'] = 'create_shortcut';
				mongo_data['status'] = obj['status']; 
			}
			else if ('collect_star_chest_reward' in obj) {
				if (obj['prizes']) {
					mongo_data['stat_id'] = 'collect_star_chest_reward';
					mongo_data['prizes'] = obj['prizes'];
				}
				else {
					mongo_data = null;
				}
			}
			else if ('collect_return_prize' in obj) {
				mongo_data['stat_id'] = 'collect_return_prize';
				mongo_data['amount'] = obj['amount'];
			}
			else if ('collect_wall_post_reward' in obj && 'with_reward' in obj) {
				mongo_data['stat_id'] = 'collect_wall_post_reward';
				mongo_data['amount'] = game_data['wall_post_reward'];
			}
			else if ('update_ig_tournament' in obj && 'with_reward' in obj) {
				mongo_data['stat_id'] = 'collect_tournament_reward';
				mongo_data['amount'] = game_data['tournament_start_reward'];
			}
			else if ('social_action' in obj) {
				mongo_data['stat_id'] = 'social_action';
				mongo_data['action_id'] = obj['action_id'];
			}
			else if ('entry_point' in obj) {
				mongo_data['stat_id'] = 'entry_point';
				mongo_data['info'] = obj['info'];
				if (obj['payload']) mongo_data['payload'] = obj['payload'];
			}
			else if ('bot_event' in obj) {
				mongo_data['stat_id'] = 'bot_event';
				mongo_data['action_id'] = obj['action_id'];
			}
			else {
				mongo_data = null;
			}

			if (mongo_data) stat_data['mongo_data'] = mongo_data;
			if (mongo_data) {
				
				if (is_localhost) {
					// console.log('update_stat', JSON.stringify(stat_data));
					// $.ajax({
					// 	type: 'post',
					// 	url: loading_vars['urls']['statistics'],
					// 	data: stat_data
					// });	
				}
				else {
					$.ajax({
							type: 'post',
							url: loading_vars['urls']['statistics'],
							data: stat_data
					});	
				}
			}
			
		}		
	}
	
	local_request(obj, on_complete) {
		if ('get_game_info' in obj) this.get_game_info_local(obj, on_complete);
		
		if ('set_allow_challenge' in obj) this.set_allow_challenge_local(obj, on_complete);
		if ('tournament_start' in obj) this.tournament_start_local(obj, on_complete);
		if ('collect_rating_bonus' in obj) this.collect_rating_bonus_local(obj, on_complete);
		if ('collect_day_bonus' in obj) this.collect_day_bonus_local(obj, on_complete);
	
		if ('cancel_tournament' in obj) this.cancel_tournament_local(obj, on_complete);
		if ('tournament_finished' in obj) this.tournament_finished_local(obj, on_complete);
		if ('tournament_failed' in obj) this.tournament_failed_local(obj, on_complete);
		
		if ('buy_tournament' in obj) this.buy_tournament_local(obj, on_complete);

		if ('update_tutorial' in obj) this.update_tutorial_local(obj, on_complete);
		if ('booster_use' in obj) this.booster_use_local(obj, on_complete);
		if ('find_coin' in obj) this.find_coin_local(obj, on_complete);
		if ('collect_animal_coin' in obj) this.collect_animal_coin_local(obj, on_complete);

		if ('set_wait' in obj) this.set_wait_local(obj, on_complete);
		if ('set_options' in obj)  this.set_options_local(obj, on_complete);	
		if ('select_language' in obj) this.select_language_local(obj, on_complete);

		if ('collect_gift_friend' in obj) this.collect_gift_friend_local(obj, on_complete);
		if ('paid_chest_open' in obj) this.paid_chest_open_local(obj, on_complete);
		if ('chest_start' in obj) this.chest_start_local(obj, on_complete);
		if ('chest_open' in obj) this.chest_open_local(obj, on_complete);
		if ('chest_buy' in obj) this.chest_buy_local(obj, on_complete);
		if ('update_tasks_delta' in obj) this.update_tasks_delta_local(obj, on_complete);
		if ('skip_task' in obj) this.skip_task_local(obj, on_complete);
		if ('money_box_free' in obj) this.money_box_free_local(obj, on_complete);

		if ('collect_map_prize' in obj) this.collect_map_prize_local(obj, on_complete);
		if ('collect_star_chest_reward' in obj) this.collect_star_chest_reward_local(obj, on_complete);
		if ('collect_sequence_reward' in obj) this.collect_sequence_reward_local(obj, on_complete);
		if ('get_new_sequence_reward' in obj) this.get_new_sequence_reward_local(obj, on_complete);
		if ('collect_video_reward' in obj) this.collect_video_reward_local(obj, on_complete);

		if ('update_day_related_data' in obj) this.update_day_related_data_local(obj, on_complete);
		if ('get_users_info' in obj) this.get_users_info_local(obj, on_complete);
		if ('save_user_info' in obj) this.save_user_info_local(obj, on_complete);

		if ('ads_shown' in obj) this.ads_shown_local(obj, on_complete);
		if ('check_purchase' in obj) this.check_purchase_local(obj, on_complete);
		if ('get_stand' in obj) this.get_stand_local(obj, on_complete);
		if ('set_score' in obj) this.set_score_local(obj, on_complete);
		if ('get_entries_near_user' in obj) this.get_entries_near_user_local(obj, on_complete);
		if ('get_user_rank' in obj) this.get_user_rank_local(obj, on_complete);
		if ('get_active_users' in obj) this.get_active_users_local(obj, on_complete);
		
		if ('update_purchase' in obj) this.update_purchase_local(obj, on_complete);
		if ('update_interstitial_ad' in obj) this.update_interstitial_ad_local(obj, on_complete);

		if ('get_rating' in obj) this.get_rating_local(obj, on_complete);
		if ('collect_rating_prize' in obj) this.collect_rating_prize_local(obj, on_complete);

		if ('add_user_sale' in obj) this.add_user_sale_local(obj, on_complete);
		if ('remove_user_sale' in obj) this.remove_user_sale_local(obj, on_complete);

		//social actions
		if ('set_return_prize' in obj) this.set_return_prize_local(obj, on_complete);
		if ('collect_return_prize' in obj) this.collect_return_prize_local(obj, on_complete);
		if ('collect_wall_post_reward' in obj) this.collect_wall_post_reward_local(obj, on_complete);
		if ('update_ig_tournament' in obj) this.update_ig_tournament_local(obj, on_complete);
		
	}

	set_return_prize_local(obj, on_complete) {
		let friend_id = obj['friend_id'];
		//вызывающему игроку ничего не менять, только установить игроку с ID == friend_id
		//game_data['user_data']['allow_return_prize'] = true;
		on_complete({'success': true});
	}
	
	collect_return_prize_local(obj, on_complete) {
		if (game_data['user_data']['allow_return_prize']) {
			game_data['user_data']['allow_return_prize'] = false;
			game_data['user_data']['money'] += game_data['friend_return_prize'];
			on_complete({'success': true, 
						'money': game_data['user_data']['money'], 
						'allow_return_prize': game_data['user_data']['allow_return_prize']});
		}
		else {
			on_complete({'success': false});
		}
	}
	
	collect_wall_post_reward_local(obj, on_complete) {
		game_data['user_data']['wall_post_day_id'] = loading_vars['day_id'];
		
		let result = {'success': true, 'wall_post_day_id': game_data['user_data']['wall_post_day_id']}
		
		if ('with_reward' in obj && 'wall_post_reward' in game_data) {
			game_data['user_data']['money'] += game_data['wall_post_reward'];
			result['money'] = game_data['user_data']['money'];
		}
		on_complete(result);
	}
	
	update_ig_tournament_local(obj, on_complete) {
		let success = true;
	
		if ('score' in obj) game_data['user_data']['ig_tournament']['score'] = obj['score'];
		if ('context_id' in obj) game_data['user_data']['ig_tournament']['context_id'] = obj['context_id'];
	
		if ('day_id' in obj) {
			if ('with_reward' in obj) {
				if (loading_vars['day_id'] > game_data['user_data']['ig_tournament']['day_id']) {
					game_data['user_data']['money'] += game_data['tournament_start_reward'];
				}
				else success = false;
			} 
			game_data['user_data']['ig_tournament']['day_id'] = loading_vars['day_id'];
		}
		on_complete({'success': success, 
			'ig_tournament': game_data['user_data']['ig_tournament'],
			'money': game_data['user_data']['money']
		});
	}

	add_user_sale_local(obj, on_complete) {
		let type = obj.type;
		let timeout = obj.timeout;
		let sale_id = obj.sale_id;
		let success = true;
		let block_day_id = game_data['user_data']['sales']['restrictions']['suspend_day_id'][type];
		for (let item of game_data['user_data']['sales']['active']) {
			if (item.type == type || item.sale_id == sale_id || block_day_id > loading_vars['day_id']) success = false;
		}
		if (success) {
			game_data.user_data.sales.active.push({'type': type, 'timeout': timeout, 'sale_id': sale_id, 'timestamp': this.get_time()});
			if ('restrictions' in obj) game_data['user_data']['sales']['restrictions'] = obj.restrictions;
		}
		
		on_complete({'success': success, 'sales': game_data['user_data']['sales']})
	}
	
	remove_user_sale_local(obj, on_complete) {
		let sale_id = obj['sale_id'];
		let active_sales = game_data['user_data']['sales']['active'];
		for (let i = 0; i < active_sales.length; i++) {
			if (active_sales[i].sale_id == sale_id) {
				active_sales.splice(i, 1);
				break;
			}
		}
		on_complete({'success': true, 'sales': game_data['user_data']['sales']});
	}

	collect_rating_prize_local(obj, on_complete)  {
		var success = game_data['user_data']['rating_info'] && game_data['user_data']['rating_info']['bonus'] 
						&&  game_data['user_data']['rating_info']['bonus']['available'];
		if (success) {
			game_data['user_data']['money'] += game_data['user_data']['rating_info']['bonus']['amount'];
			game_data['user_data']['rating_info']['bonus']['available'] = false;
		}
		game_data['user_data']['rating_info']['bonus']['reset'] = false;
		on_complete({'success': success,
					'money': game_data['user_data']['money'], 
					'rating_info': game_data['user_data']['rating_info']});
	}
	
	get_rating_local(obj, on_complete) {
		/*var max_pos = 50
		var rating = [];
		for (var i = 0; i < max_pos; i++) {
			rating.push({'user_id': String(i), 'score': parseInt(Math.random() * 10000)});
		}*/
	
		var rating = [
			{'user_id': 1, 'score': 3878},
			{'user_id': 2, 'score': 3014},
			{'user_id': 3, 'score': 2930},
			{'user_id': 4, 'score': 2870},
			{'user_id': 5, 'score': 2400},
			{'user_id': 6, 'score': 1750},
			{'user_id': 7, 'score': 1560},
			{'user_id': 8, 'score': 1410},
			{'user_id': 9, 'score': 1080},
			{'user_id': 0, 'score': 1070}, //10
			{'user_id': 11, 'score': 870},
			{'user_id': 12, 'score': 860},
			{'user_id': 13, 'score': 720},
			{'user_id': 14, 'score': 0},
			{'user_id': 15, 'score': 0},
			{'user_id': 16, 'score': 0},
		];
	
		game_data['test_rating'] = [
			{'user_id': 1, 'score': 5068},
			{'user_id': 2, 'score': 3014},
			{'user_id': 3, 'score': 2930},
			{'user_id': 4, 'score': 2870},
			{'user_id': 5, 'score': 2400},
			{'user_id': 0, 'score': 1790},
			{'user_id': 6, 'score': 1750},
			{'user_id': 7, 'score': 1560},
			{'user_id': 10, 'score': 1450},
			{'user_id': 8, 'score': 1410}, 
			{'user_id': 9, 'score': 1080},
			{'user_id': 17, 'score': 1000},
			{'user_id': 11, 'score': 870},
			{'user_id': 12, 'score': 860},
			{'user_id': 17, 'score': 850},
			{'user_id': 13, 'score': 720},
		];
		
		on_complete({'success': true, 'rating': rating});
	}

	update_interstitial_ad_local(obj, on_complete) {
		let flag = obj['flag']
		game_data['user_data']['interstitial_flag'] = flag
		on_complete({'success': true, 'interstitial_flag': game_data['user_data']['interstitial_flag']})
	}

	get_game_info_local(obj, on_complete) {
		//запрос вызываемый из загрузчика, тут для справочных целей;
		//должен присылать day_id сегодняшний, сквозное значение session_id для текущего game_id, statistics_active;
		//в user_data обновить информацию о структурах: user_day_bonus, wait, user_rating_bonus, tasks
		on_complete({'session_id': loading_vars['session_id'], 
					 'statistics_active': true, 
					 'day_id': loading_vars['day_id'],
					 'user_id': loading_vars['user_id'],
					 'user_data': game_data['user_data'],
					 'platform_data': game_data
					 });
	}

	set_allow_challenge_local(obj, on_complete) {
		game_data['user_data']['allow_challenge'] = obj['allow_challenge'];
		on_complete({'success':true, 'allow_challenge': game_data['user_data']['allow_challenge']});
	}

	tournament_start_local(obj, on_complete) {
		var wait_current = game_data['user_data']['wait']['timeout'];
		if (wait_current > 0) {
			on_complete({'success': false, 'error': 'wait', 'wait': game_data['user_data']['wait']});
		}
		else {
			on_complete({'success':true, 'wait': game_data['user_data']['wait']});
		}
	}

	collect_rating_bonus_local(obj, on_complete)   {
		var money = game_data['user_data']['money'] + obj['prize'];
		on_complete({'success':true,'money':money});
	}

	collect_day_bonus_local(obj, on_complete) {
		var success = game_data['user_data']['user_day_bonus']['available'];
		var day = game_data['user_data']['user_day_bonus']['day'];
		var prize = game_data['day_bonus'][String(day)];
		game_data['user_data']['user_day_bonus']['available'] = false;
		
		if (prize['type'] == 'money') game_data['user_data']['money'] += prize['amount'];
		else game_data['user_data']['boosters'][prize['type']] += prize['amount'];
		on_complete({'success':success,  'user_day_bonus': game_data['user_data']['user_day_bonus'],
			'money': game_data['user_data']['money'], 'boosters': game_data['user_data']['boosters']});
	}

	cancel_tournament_local(obj, on_complete) {
		game_data['user_data']['wait']['timeout'] = 0;
		on_complete({'success':true});
	}
	
	tournament_finished_local(obj, on_complete) {
		var i;
		var success = true;
		var user_data = game_data['user_data'];						
		var level_id = obj['level_id'];
		var stars = obj['stars'];
		var score = obj['score'];	
		var time = parseInt(game_data['wait_before_start']);
		game_data['user_data']['wait']['timeout'] = time;
		var level_passed;
		var is_replay = false;
		var chest_stars = 0;
		var error;
		// var duel = 'duel' in obj && obj['duel'];
		var chest_id = -1;
		var user_chests = user_data['chest'];
		user_data['wait']['timeout'] = 0;
		var passing = 'passing' in obj && obj['passing']
		if (passing) {
			if (level_id < user_data['levels_passed'].length) {
				is_replay = true;
				level_passed = user_data['levels_passed'][level_id];
				if (level_passed < stars) {
					chest_stars = stars - game_data['user_data']['levels_passed'][level_id];
					level_passed = stars;
				}
			}
			else if (level_id == user_data['levels_passed'].length) {
				chest_stars = stars;
				level_passed = stars;
				user_data['levels_passed'][level_id] = {};
				user_data['levels_passed'][level_id] = level_passed;
			}
			if (level_id in game_data['user_data']['fails']) game_data['user_data']['fails'][level_id] = 0;

			var positions = [];
			for (i = 0; i < game_data['chest']['max']; i++) {
				positions.push(chest_id);
			}
			for (i = 0; i < user_chests.length; i++) {
				positions[user_chests[i]['id']] = 0;
			}
			for (i = 0; i < positions.length; i++) {
				if (positions[i] < 0) { //поиск незанятой сундуком позиции
					chest_id = i;
					break;
				}
			}
			if (chest_id >=0 && !is_replay) {
				user_chests.push({'id': chest_id, 'timeout': -1, 'level_id': level_id})
			}
			else {
				chest_id = -1;
				error = 'no_slot';
				if (is_replay) error = 'replay';
			}
		}
		user_data['profile']['win_amount']++;
		for (var s in user_data['score']) user_data['score'][s] += parseInt(score);

		if (game_data['allow_star_chest'] && game_data['user_data']['levels_passed'].length >= game_data['star_chest']['start_level']) {
			game_data['user_data']['star_chest']['stars'] += chest_stars;
		}
		else chest_stars = 0;
		
		this.add_user_score(score);
		
		on_complete({'success':success, 'wait': user_data['wait'], 'score': user_data['score'],
					'profile':user_data['profile'],
					'fails': game_data['user_data']['fails'],
					'chest_id':chest_id, 'chest': user_chests, 'error':error,
					'levels_passed':user_data['levels_passed'],
					'star_chest': game_data['user_data']['star_chest'],
					'rating_info': game_data['user_data']['rating_info'],
					'rating': game_data['user_data']['rating'],
					'new_chest_stars': chest_stars
				});
		
	}

	tournament_failed_local(obj, on_complete) {
		var time = parseInt(game_data['wait_before_start']);
		game_data['user_data']['wait']['timeout'] = time;
		
		game_data['user_data']['profile']['lost_amount']++;
		var level_id = obj['level_id'];
		var val = 1;
		if (level_id in game_data['user_data']['fails']) val += game_data['user_data']['fails'][level_id];
		game_data['user_data']['fails'][level_id] = val;

		on_complete({'success':true, 
					'fails': game_data['user_data']['fails'],
					'profile':game_data['user_data']['profile'],
					'wait':game_data['user_data']['wait']});
	}

	buy_tournament_local(obj, on_complete) {
		var money = game_data['user_data']['money'];
		var success = money >= game_data['tournament_price'];
		if (success) {
			money -= game_data['tournament_price'];
			game_data['user_data']['wait']['timeout'] = 0;
		}
		on_complete({'success':success, 'money':money, 'wait': game_data['user_data']['wait']});
	}

	update_tutorial_local(obj, on_complete)   {
		var tutorial_id = obj['tutorial_id']
		game_data['user_data']['tutorial'][tutorial_id] = true;
		on_complete({'success': true, 'tutorial': game_data['user_data']['tutorial']});
	}

	booster_use_local(obj, on_complete)   {
		var booster_id = obj['booster_id'];
		
		var success = true;
		if (game_data['user_data']['boosters'][booster_id] > 0) 
			 game_data['user_data']['boosters'][booster_id] -= 1;
		else if (game_data['user_data']['money'] >= game_data['boosters'][booster_id]['price']) {
			game_data['user_data']['money'] -= game_data['boosters'][booster_id]['price'];
		}
		else success = false;
		on_complete({'success':success, 'boosters': game_data['user_data']['boosters']
					, 'money': game_data['user_data']['money']
		});
	}

	collect_animal_coin_local(obj, on_complete) {
		var amount = game_data['level_coins']['amount_money'];
		game_data['user_data']['money'] += amount;
		on_complete({'success': true, 'money': game_data['user_data']['money']});
	}

	find_coin_local(obj, on_complete) {
		var amount = game_data['level_coins']['amount'];
		game_data['user_data']['money_box']['amount'] += amount;
		if (game_data['user_data']['money_box']['amount'] > game_data['money_box']['capacity'])
			game_data['user_data']['money_box']['amount'] =  game_data['money_box']['capacity'];
		on_complete({'success': true, 'money_box': game_data['user_data']['money_box']});
	}

	// set_wait_local(obj, on_complete) {
	// 	game_data['user_data']['wait']['timeout'] = game_data['wait_before_start'];
	// 	on_complete({'success': true,'wait': game_data['user_data']['wait']});
	// }

	set_options_local(obj, on_complete) {
		game_data['user_data']['sound'] = obj['sound'];
		game_data['user_data']['music'] = obj['music'];
		on_complete({'success': true});

		this.update_stat({'set_options': true, 'sound': obj['sound'], 'music': obj['music']});
	}

	select_language_local(obj, on_complete) {
		game_data['user_data']['lang'] = obj['lang'];
		on_complete({'success': true});
	}

	collect_gift_friend_local(obj, on_complete) {
		var user_id = obj['user_id'];
		var prize = game_data['gift_friend_prize'];
		game_data['user_data']['gift_users'][user_id] = loading_vars['day_id'];
		on_complete({'success': true, 'money': game_data['user_data']['money'] + prize, 'gift_users': game_data['user_data']['gift_users']});
	}

	add_user_score(score) {
		var current_rating = game_data['user_data']['rating'];
		for (var i = 0; i < current_rating.length; i++) {
			if (current_rating[i]['user_id'] == loading_vars['user_id']) {
				current_rating[i]['score'] += score;
				break;
			}
		}
		game_data['user_data']['rating_info']['score'] += score; 
	}

	paid_chest_open_local(obj, on_complete) {
		var chest_id = obj['chest_id'];
		var prize = game_data['paid_chest_prize'][chest_id];
		var from_tasks = ('from_tasks' in obj && obj['from_tasks']);
		var s, sc;
		var ret_prize = {};
		var index = game_data['user_data']['paid_chest'].indexOf(chest_id);
		var success = index >= 0 || from_tasks;
		var resp = {'success':success, 'prize': ret_prize};
		if (success) {
			for (s in prize) {
				var amount = prize[s]['min'] + parseInt(Math.random() * (prize[s]['max']-prize[s]['min']));
				ret_prize[s] = amount;
				if (s == 'money') {
					game_data['user_data']['money'] += amount;
					resp['money'] = game_data['user_data']['money'];
				}
				else if (s in game_data['user_data']['boosters']) {
					game_data['user_data']['boosters'][s] += amount;
					resp['boosters'] = game_data['user_data']['boosters'];
				}
				else if (s == 'rating_score') {
					this.add_user_score(amount);
					resp['rating_info'] = game_data['user_data']['rating_info'];
					resp['rating'] = game_data['user_data']['rating'];
				}
			}
			if (from_tasks && game_data['user_data']['tasks']['allow_reward']) {
				game_data['user_data']['tasks']['allow_reward'] = false;
				resp['tasks'] = game_data['user_data']['tasks'];
			}
			if (index >= 0) game_data['user_data']['paid_chest'].splice(index, 1);
			resp['paid_chest'] = game_data['user_data']['paid_chest'];
		}
		on_complete(resp);
	}

	chest_start_local(obj, on_complete) {
		var id = obj['id'];
		var user_chests = game_data['user_data']['chest'];
		var i;
		var success = true;
		
		for (i = 0; i < user_chests.length; i++) {
			if (user_chests[i]['timeout'] > 0 && user_chests[i]['time_show'] > 0) { //локально timeout не меняю, только time_show опираясь на timestamp
				success = false;
				break;
			}
		}
		if (success) {
			for (i = 0; i < user_chests.length; i++) {
				if (id == user_chests[i]['id']) {
					var timeout = game_data['chest']['timeout']['default'];
					var lvl = String(user_chests[i]['level_id']);
					if (lvl && String(lvl) in game_data['chest']['timeout']) 
						timeout = game_data['chest']['timeout'][lvl];
					user_chests[i]['timeout'] = timeout;
					user_chests[i]['timestamp'] = Math.floor((new Date()).getTime() / 1000);
				}
			}
		}
		on_complete({'success':success,'chest':user_chests});
	}

	chest_open_local(obj, on_complete)   {
		var user_chests = game_data['user_data']['chest'];
		var i;
		var chest_pos = -1;
		var s;
		var success = true;
		var level_id;
		for (i = 0; i < user_chests.length; i++) {
			if (user_chests[i]['id'] == obj['id']) chest_pos = i;
		}

		var current_time = Math.round(game_data['utils'].get_time() / 1000);
		var time_show = user_chests[chest_pos]['timeout'] - (current_time - user_chests[chest_pos]['timestamp']);
		if (time_show > 0) success = false;
		
		if (success) {
			var progress = game_data['chest']['prize']['progress'];
			level_id = user_chests[chest_pos]['level_id'];
			var prizes = [];
			var prize;
			if ('level_prize' in game_data['chest'] && game_data['chest']['level_prize'].length > level_id) {
				prize = game_data['chest']['level_prize'][level_id];
			}
			else {
				for (i = progress.length - 1; i >= 0; i--) {
					if (level_id >= progress[i]['level_id']) {
						prizes = game_data['chest']['prize'][progress[i]['type']];
						break;
					}
				}
				var pos = parseInt(Math.random() * prizes.length);
				prize = prizes[pos];
			}

			var resp = {'success':success, 'prize': prize};
			for (s in prize) {
				if (s == 'money') {
					game_data['user_data']['money'] += prize[s];
					resp['money'] = game_data['user_data']['money'];
				}
				else if (s != 'rating_score') {
					game_data['user_data']['boosters'][s] += prize[s];
					resp['boosters'] = game_data['user_data']['boosters'];
				}
				else if (s == 'rating_score') {
					// for (var sc in game_data['user_data']['score']) game_data['user_data']['score'][sc] += parseInt(prize[s]);
					// resp['score'] = game_data['user_data']['score'];
					this.add_user_score(prize[s]);
					resp['rating_info'] = game_data['user_data']['rating_info'];
					resp['rating'] = game_data['user_data']['rating'];
				}
			}
			
			user_chests.splice(chest_pos,1);
			resp['chest'] = user_chests;
			on_complete(resp);
			
		}
		else {
			on_complete({'success':success});
			
		}
	}

	chest_buy_local(obj, on_complete) {
		var id = obj['id'];
		var money = game_data['user_data']['money'];
		var success = money >= game_data['chest']['open_price'];
		if (success) {
			money -= game_data['chest']['open_price'];
			for (var i = 0; i < game_data['user_data']['chest'].length; i++) {
				if (game_data['user_data']['chest'][i]['id'] == id) {
					game_data['user_data']['chest'][i]['timeout'] = 0;
					break;
				}
			}	
		}
		on_complete({'success':success, 'money':money, 'chest': game_data['user_data']['chest']});
	}

	update_tasks_delta_local(obj, on_complete) {
		var i;
		var delta = obj['deltas'];
		var progress = game_data['user_data']['tasks']['progress'];
		for (i = 0; i < progress.length; i++) {
			progress[i] += parseInt(delta[i]);
		}
		on_complete({'success':true, 'tasks': game_data['user_data']['tasks'], 'day_id': loading_vars['day_id']})
	}

	skip_task_local(obj, on_complete) {
		var money = game_data['user_data']['money'];
		var skip_cost = obj['skip_cost'];
		var success = skip_cost <= money;
		if (success) {
			money -= skip_cost;
			game_data['user_data']['tasks']['progress'] = obj['progress'];
		}
		on_complete({'success':success, 'money':money, 'tasks': game_data['user_data']['tasks']});
	}

	money_box_free_local(obj, on_complete) {
		var success = game_data['user_data']['money_box']['amount'] >= game_data['money_box']['capacity'];
		if (success) {
			game_data['user_data']['money'] += game_data['user_data']['money_box']['amount'];
			game_data['user_data']['money_box']['amount'] = 0;
		}
		on_complete({'success':success,  'money': game_data['user_data']['money'], 'money_box': game_data['user_data']['money_box']});
	}

	collect_map_prize_local(obj, on_complete) {
		var level_id = obj['level_id'];
		var prizes_limit = obj['prizes_limit'];
		var collected = game_data['user_data']['collected_map_prizes'];
		var success = collected.indexOf(level_id) < 0;
		var result_prizes = [];
		var res = {'success': false}
		if (success) {
			res['success'] = true;
			var pos;
			var prizes = game_data['map_prizes']['prizes'];
			for (var i = 0; i < prizes_limit; i++) {
				var tot_prizes = collected.length;
				var prize = {}
				if (tot_prizes < prizes['predefined'].length) prize = prizes['predefined'][tot_prizes];
				else {
					pos = parseInt(Math.random() * prizes['common'].length);
					prize = prizes['common'][pos];
				}
				result_prizes.push(prize);
				collected.push(level_id);
				switch (prize['type']) {
					case 'money':
						game_data['user_data']['money'] += prize['amount'];
						res['money'] = game_data['user_data']['money'];
					break;
					default:
						if (prize['type'] in game_data['user_data']['boosters']) {
							game_data['user_data']['boosters'][prize['type']] += prize['amount'];
							res['boosters'] = game_data['user_data']['boosters'];
						}
						else res['success'] = false;
					break;
				}
			}
			res['prizes'] = result_prizes;
			res['collected_map_prizes'] = collected;
		}
		on_complete(res);
	}

	collect_star_chest_reward_local(obj, on_complete) {
		var res = {'success': true};
		var total_prizes = 'total_prizes' in obj ? obj['total_prizes'] : 3;
		var all_prizes;
		var prizes = [];
		var pos;
		var i;
		var user_star_chest = game_data['user_data']['star_chest'];
		var required = user_star_chest['chests'] < game_data['star_chest']['stars_amount'].length 
					? game_data['star_chest']['stars_amount'][user_star_chest['chests']] : game_data['star_chest']['stars_amount'][game_data['star_chest']['stars_amount'].length - 1];

		if (user_star_chest['stars'] < required) res['success'] = false;
		
		if (res['success']) {
			if (game_data['star_chest']['predefined_chests_amount'] > user_star_chest['chests']) all_prizes = game_data['star_chest']['prizes']['predefined'];
			else all_prizes = game_data['star_chest']['prizes']['common'];
			user_star_chest['chests'] += 1;
			user_star_chest['stars'] = 0;
			res['star_chest'] = user_star_chest;
			
			for (i = 0; i < total_prizes; i++) {
				pos = parseInt(Math.random() * all_prizes.length);
				prizes.push(all_prizes[pos]);
			}
			res['prizes'] = prizes;
			
			for (i = 0; i < total_prizes; i++) {
				switch (prizes[i]['type']) {
					case 'money':
						game_data['user_data']['money'] += prizes[i]['amount'];
						res['money'] = game_data['user_data']['money'];
					break;
					default:
						if (prizes[i]['type'] in game_data['user_data']['boosters']) {
							game_data['user_data']['boosters'][prizes[i]['type']] += prizes[i]['amount'];
							res['boosters'] = game_data['user_data']['boosters'];
						}
						else res['success'] = false;
					break;
				}
			}
		}
		on_complete(res);
	}

	get_new_sequence_reward_local(obj, on_complete) {
		var reward = null;
		var settings = game_data['sequence_settings'];
		var tutorial_sequence_id = 'tutorial_sequence_id' in obj ? obj['tutorial_sequence_id'] : -1;
		if (tutorial_sequence_id >= 0) {
			reward = settings['init_sequences'][tutorial_sequence_id]['reward'];
		}
		else {
			var pos = parseInt(Math.random() * settings['rewards'].length);
			reward = settings['rewards'][pos];
		}
		on_complete({'success': true, 'reward': reward});
	}

	collect_sequence_reward_local(obj, on_complete) {
		var success = true;
		if (obj['type'] == 'money') {
			game_data['user_data']['money'] += obj['amount'];
		}
		on_complete({'success':success,  'money': game_data['user_data']['money']});
	}

	collect_video_reward_local(obj, on_complete) {
		var settings = game_data['rewarded_video_settings'];	
		if (obj['force_money']) {
			var prize = settings['prize']['common'];
			var res = {'success': true};
			game_data['user_data']['money'] += prize['amount'];
			res['money'] = game_data['user_data']['money'];
			on_complete(res);
		}
		else {
			var day_id_now = loading_vars['day_id'] //game_data['utils'].get_day_id();
			var day_id_last = game_data['user_data']['rewarded_video']['day_id'];
			var diff = day_id_now - day_id_last;
			if (diff > 0) game_data['user_data']['rewarded_video'] = {'day_id': day_id_now, 'amount': 0};

			var res = {'success': false};

			if (game_data['user_data']['rewarded_video']['amount'] < settings['max_per_day']) {
				res['success'] = true;
				game_data['user_data']['rewarded_video']['amount'] += 1;
				res['rewarded_video'] = game_data['user_data']['rewarded_video'];
				
				var prize;
				if (game_data['user_data']['rewarded_video']['amount'] == settings['max_per_day']) prize = settings['prize']['special'];
				else {
					var prizes_array = settings['prize']['common']['amount'];
					var pos = parseInt(Math.random() * prizes_array.length);
					prize = {'type': settings['prize']['common']['type'], 'amount': prizes_array[pos]};
				}
				res['prize'] = prize;
				
				if (prize['type'] == 'money') {
					game_data['user_data']['money'] += prize['amount'];
					res['money'] = game_data['user_data']['money'];
				}
				else if (prize['type'] in game_data['user_data']['boosters']) {
					game_data['user_data']['boosters'][prize['type']] += prize['amount'];
					res['boosters'] = game_data['user_data']['boosters'];
				}
			}
			on_complete(res);
		}
	}

	update_day_related_data_local(obj, on_complete) {
		var result = {'success': true};
		result['day_id'] = loading_vars['day_id'] + 1;
		result['week_id'] = parseInt(result['day_id'] / 7);
		result['day_end_time'] = 86400;
		result['week_end_time'] = (result['day_id'] % 7 + 1) * 86400;
		
		game_data['user_data']['user_day_bonus']['available'] = true;
		game_data['user_data']['user_day_bonus']['day'] += 1;
		result['user_day_bonus'] = game_data['user_data']['user_day_bonus'];
		
		result['rewarded_video'] = {'day_id': 0, 'amount': 0};
		game_data['user_data']['payments'][['day_id']] = result['day_id'];
		result['payments'] = game_data['user_data']['payments']
		result['user_rating_bonus'] = game_data['user_data']['user_rating_bonus'];
		result['tasks'] = {'allow_reward': true, 'progress': [0,0,0]};
		on_complete(result);
	}

	get_users_info_local(obj, on_complete) {
		if (!this.fake_user_id_counter) this.fake_user_id_counter = 10;
		var ids = obj['user_ids'];
		var result = [];
		var base64_url = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; //картинка из 1 пикселя а может какую-то дефолтную придумаем если нет фото по любым причинам
		for (var i = 0; i < ids.length; i++) {
			var user_id = 'user' + String(this.fake_user_id_counter);
			var name = 'Name ' + String(this.fake_user_id_counter);
			var info = {'user_id': user_id, 'first_name': name, 'base64_url': base64_url};
			result.push(info);
			this.fake_user_id_counter += 1;
		}
		on_complete({'success':true, 'users_info':result});
	}

	save_user_info_local(obj, on_complete) {
		var first_name = obj['first_name'];
		var base64_url = obj['base64_url'];
		game_data['user_data']['user_info_day_id'] = loading_vars['day_id'];
		//сохранили имя-фото в базу, и локально у пользователя указали день сохранения, для того, чтоб не при каждом входе слать
		on_complete({'success':true});
	}

	ads_shown_local(obj, on_complete) {
		//для рекламы в ОК
		on_complete({'success': true});
	}

	check_purchase_local(obj, on_complete) {
		//проверка состояния покупки для всех соц.сетей
		on_complete({'success': true});
	}

	get_stand_local(obj, on_complete){
		var rating_id = obj['rating_id'];
		var stand = [];
		var stand_info = {}
		//all - топ-3 игроков общего. week, day - топ-3 игроков рейтинга прошлого периода
		stand_info['week'] = [{'user_id':'1', 'score': 1000000},{'user_id':'2', 'score': 55555}, {'user_id':'3', 'score': 9333}];
		stand_info['day'] = [{'user_id':'0', 'score': 500000},{'user_id':'4', 'score': 5555}, {'user_id':'5', 'score': 333}];
		stand_info['all'] = [{'user_id':'6', 'score': 21000000},{'user_id':'7', 'score': 155555}, {'user_id':'8', 'score': 19333}];
		stand = stand_info[rating_id];
		on_complete({'success': true, 'stand': stand});
	}

	set_score_local(obj, on_complete) {
		//пример данных "scores":[100,50,20],"boards":["all","week","day"]
		//записать соответственно очки в текущие рейтинги-доски
		var scores = obj['scores'];
		var boards = obj['boards'];
		on_complete({'success': true});
	}

	get_entries_near_user_local(obj, on_complete){
		var board = obj['board'];
		var rating = [];
		//получить соседей в рейтинге по указанной доске на  +/- 5 позиций (включая игрока), можно добавлять и топ-5 по рейтингу, 
		//и поместить в массив rating объекты вида {'user_id': ..... , 'score': ....}
		on_complete({'success': true, 'rating': rating});
	}

	get_user_rank_local(obj, on_complete) {
		var board = obj['board'];
		var rank = -1;
		rank = parseInt(Math.random() * 500); // вернуть текущее место в указанной доске
		on_complete({'success': true, 'rank': rank});
	}

	get_active_users_local(obj, on_complete) {
		//получение списка из, например, 100 user_id для подбора разных соперников
		var user_ids = [];
		on_complete({'success': true, 'user_ids': user_ids});
	}

	update_purchase_local(obj, on_complete) {
		var item_info = obj['item_info'];
		var item_amount = item_info['amount'];
		// if (item_info['category'] == 'sale') {
		// 	var day_diff = loading_vars['day_id'] - game_data['user_data']['payments']['day_id'] - 1;
		// 	if (day_diff < 0) day_diff = 0;
		// 	var day = day_diff > 2 ? 2 : day_diff;
		// 	item_amount = item_info['amount'][day];
		// }
		if (item_info['type'] == 'money') {
			var amount = item_amount;
			game_data['user_data']['money'] += amount;
		}
		else if (item_info['type'] == 'money_box') {
			item_amount = game_data['user_data']['money_box']['amount'];
			game_data['user_data']['money'] += item_amount;
			game_data['user_data']['money_box']['amount'] = 0;
		}	
		else if (item_info['type'] == 'boosters' || item_info['type'] == 'pack') {
			var key;
			
			for (key in item_amount) {
				if (key == 'money') game_data['user_data']['money'] += parseInt(item_amount[key]);
				else game_data['user_data']['boosters'][key] += parseInt(item_amount[key]);
			}
		}
		else if (item_info['type'] == 'chest') {
			if (!('paid_chest' in game_data['user_data'])) game_data['user_data']['paid_chest'] = [];
			game_data['user_data']['paid_chest'].push(item_info['chest_id']);
		}
		if (loading_vars['net_id'] == 'android' || loading_vars['net_id'] == 'ios' || loading_vars['net_id'] == 'mac' || game_data['is_standalone'] || is_localhost) {
			var payments = game_data['user_data']['payments'];
			payments['total'] += 1;
			payments['day_id'] = loading_vars['day_id'];				
		}
		on_complete({'success': true, 
					'money_box': game_data['user_data']['money_box'],
					'boosters': game_data['user_data']['boosters'], 
					'money': game_data['user_data']['money'],
					'paid_chest': game_data['user_data']['paid_chest'],
					'payments': game_data['user_data']['payments']});
	}


	
	
//========= SERVER
	server_request(obj, on_complete) {	
		var platform = loading_vars['mobile'] ? 'mobile' : 'web';
		if (loading_vars['platform']) platform = String(loading_vars['platform']);
		var data = { 
			'session_id': loading_vars['session_id'],
			'game_id': loading_vars['game_id'],
			'user_id': loading_vars['user_id'],
			'platform': platform,
			'net_id': loading_vars['net_id'],
			'time':  Math.round((new Date().getTime() - loading_vars['start_time']) / 1000),
			'data': JSON.stringify(obj)
		};		
		
		$.ajax({
			'type': 'post',
			'url': loading_vars['urls']['php'].concat('server_request.php'),	
			'data': data,
			success: function(data) {		
				on_complete(JSON.parse(data));
			}
		});
	}

	//=======================

create_server_request_loader() {
	this.server_request_loader = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
	game_data['scene'].add.existing(this.server_request_loader);
	this.server_request_loader.visible = false;
	setTimeout(() => {
		var _y = 20;
		var temp = new Phaser.GameObjects.Text(game_data['scene'], loading_vars['W']/2, _y, 'Connecting to server...', { fontFamily: 'font1', fontSize: 35, color: '#DDDDDD', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 550}});	
		temp.setOrigin(0.5);
		this.server_request_loader.txt = temp;
		this.server_request_loader.add(temp);
		this.server_request_loader.tid = -1;    
	}, 200);
	

}

show_request_loader() {
	if (this.server_request_loader) {
		this.server_request_loader.showed = true;
		this.server_request_loader.tid = setTimeout(() => {
			if (this.server_request_loader.showed) {
				this.server_request_loader.alpha = 0;
				this.server_request_loader.visible = true;
				game_data['scene'].tweens.add({targets: this.server_request_loader, alpha: 1, duration: 100});
			}
		}, 1000);
	}
	
}
hide_request_loader(){
	if (this.server_request_loader) {
		this.server_request_loader.showed = false;
		clearTimeout(this.server_request_loader.tid) 
		this.server_request_loader.tid = null;
		this.server_request_loader.visible = false;
	}
	
}

update_language() {
	if (this.server_request_loader && this.server_request_loader.txt) {
		var res = game_data['utils'].generate_string({'scene_id': 'game', 'item_id': 'server_request', 'phrase_id': '1', 'values': [], 'base_size': 35});	
		this.server_request_loader.txt.text = res['text'];
	}
}
	//========================
}
