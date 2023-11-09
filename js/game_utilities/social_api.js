class SocialApi{
	constructor() {		
			
	}
	
	extra_start_actions(on_complete) {
		on_complete();
	}

	create_shortcut() {

	}
	
	subscribe_bot() {

	}

	consume_item(purchase_token) {
		
	}

	check_pending_purchases(on_complete) {

	}

	create_wall_post(params, on_complete) {
		on_complete({'success': false});
	}

	share_tournament(obj, on_complete) {
		on_complete({success: false});
	}

	get_or_create_tournament(score, on_complete) {
		on_complete(false);
	}

	get_current_tournament(on_complete) {
		on_complete(false);
	}

	switch_game(params) {
		var flag = 'flag' in params ? params['flag'] : 0;
		game_data['utils'].update_stat({'type': 'switch_game', 'description': params['game_id'], 'sub_action': flag});
		window.open(params['url']);
	}
	
	get_friends(on_complete) {
		
	}	
	
	show_invite() {
		
	}

	show_leaderboard(score) {

	}
	
	extend_game() {
		
		
	}

	get_stand(rating_id, on_complete) {
		var _this = this;
		game_data['game_request'].request({'get_stand': true, 'rating_id':rating_id}, function(res) { 				
				if ('success' in res && res['success'] && 'stand' in res) {
					var stand = res['stand'];
					var ids = _this.generate_ids(stand);
					_this.load_missing_users(ids, function(){
						on_complete(stand);					
					});			
				}
			});
	}
	

	get_game_size() {
		return {'W': window.innerWidth, 'H': window.innerHeight - 20};
	}
	

	set_game_size() {
		var canvas = document.querySelector("canvas");	
		var windowWidth;
		var windowHeight;
		
		if ('scene' in game_data && game_data['scene'].scale.isFullscreen) {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
		}
		else {
			var size = this.get_game_size();
			windowWidth = size['W'];
			windowHeight = size['H'];
		}
		
		var windowRatio = windowWidth / windowHeight;
		var gameRatio = phaser_game.config.width / phaser_game.config.height;
		if(windowRatio < gameRatio){
			canvas.style.width = windowWidth + "px";
			canvas.style.height = (windowWidth / gameRatio) + "px";
		}
		else{
			canvas.style.height = windowHeight + "px";
			canvas.style.width = (windowHeight * gameRatio) + "px";
		}		
	}	

	set_score(params, on_complete) { //on_complete нужен только для 1 из трех обновляемых рейтингов.
		var scores = params['scores'];
		var boards = params['boards'];	
		for (var i = 0; i < boards.length; i++) {
			if (boards[i].slice(0, 3) == 'day')
				boards[i] = 'day';
			else if (boards[i].slice(0, 3) == 'wee')
				boards[i] = 'week';
			else if (boards[i].slice(0, 3) == 'all')
				boards[i] = 'all';
		}		
		game_data['game_request'].request({'set_score': true, 'scores': scores, 'boards': boards}, on_complete);
	}

	get_entries_near_user(board, is_friends, on_complete) {		
		var _this = this;		
		if (board.slice(0, 3) == 'day')
			board = 'day';
		else if (board.slice(0, 3) == 'wee')
			board = 'week';
		else if (board.slice(0, 3) == 'all')
			board = 'all';
				
		var params = {'get_entries_near_user': true, 'board': board};
		if (is_friends)
			params['friends'] = game_data['friends'];
		
		game_data['game_request'].request(params, function(res){
			if ('success' in res && res['success']) {
				var rating = res['rating'];				
				var ids = _this.generate_ids(rating);
				_this.load_missing_users(ids, function(){
					on_complete({'success': true, 'rating': rating});					
				});
			}			
		});		
	}

	get_user_rank(board_name, on_complete) {
		game_data['game_request'].request({'get_user_rank': true, 'board': board_name}, function(res){
			if (res['success']) on_complete(res['rank']);
			else on_complete(-1);
		});
	}

	get_competitors_list(on_complete) {
		var _this = this;
		game_data['game_request'].request({'get_active_users': true}, function(res) { 				
			if ('success' in res) {
				var user_ids = res['user_ids'];
				if (user_ids && user_ids.length) on_complete(_this.generate_competitors(user_ids));					
				else on_complete([]);
			}		
		});				
	}
	
	load_missing_users(ids, on_complete) {	
		on_complete();
	}
	
	generate_competitors(user_ids) {
		var competitors = [];
		var user_id;
		for (var i = 0; i < user_ids.length; i++) {
			user_id = user_ids[i];
			competitors.push({'user_id': user_id});
		}
		return competitors;
	}	
	
	generate_ids(items) {
		var arr = [];
		for (var i = 0; i < items.length; i++)
			arr.push(items[i]['user_id']);
		
		return arr;
	}
	
	preload_interstitial_ad() {
		
	}
	
	show_interstitial_ad() {
		
	}
	
	preload_rewarded_ad() {
		
	}
	
	show_rewarded_ad(on_complete) {
		
	}
		
}

class FbApi extends SocialApi{
	constructor() {		
		 super({});
	}
	
	extra_start_actions(on_complete) {
		game_data['in_app_items'] = true;
		this.change_game_size();
		on_complete();
	}		
	
	change_game_size() {
		var _this = this;			
		FB.Canvas.setSize({height: 2000});			
		FB.Canvas.getPageInfo(	
			function(info) {
				//_this.canvasW = info['clientWidth'];
				_this.canvasW = window.innerWidth
				_this.canvasH = info['clientHeight'];
				_this.set_game_size();
			}
		);	
	}
	
	get_game_size() {
		if (this.canvasW && this.canvasH) {
			return {'W': this.canvasW, 'H': this.canvasH};
		}
		else {
			return {'W': window.innerWidth, 'H': window.innerHeight};
		}
	}
	
	start_purchase_item(obj, on_complete) {
		 if (navigator.onLine) {
			if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
			var item_info = obj['item_info'];
			var item_id = item_info['item_id'];
			FB.ui({
				 method: 'pay',
				 action: 'purchaseitem',
				 product: loading_vars['urls']['og_base'] + item_id + '.html'
			},
			function(response) {				
				if ('status' in response && response['status'] == 'completed') {
					on_complete({'success': true, 'item_id': item_id, 'item_info': item_info})					
				}					
				else
					on_complete({'success': false});
			});
		}
		else 
			on_complete({'success': false});
	}		

	get_friends(on_complete) {
		FB.api('/me/friends?fields=first_name,last_name,link,picture.width(120).height(120)', function(response) {
			game_data['friends'] = [loading_vars['user_id']];
			var uid;
			if (response && response['data']) {
				for (var i = 0; i < response['data'].length; i++) {
					uid = response['data'][i]['id'];
					game_data['friends'].push(uid);
					game_data['users_info'][uid] = {'first_name': response['data'][i]['first_name'], 'photo_url': response['data'][i]['picture']['data']['url']};									
				}
			}
			on_complete();	
		});			
	}

	show_invite() {
		if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
		var obj = {method: 'apprequests', message: 'Come and play interesting game with me!'};				
		FB.ui(obj, function(response) {});				
	}		
	
	make_challenge(user_id, on_complete) {
		if (navigator.onLine){
			if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
			var obj = {method: 'apprequests', message: 'Now it\'s your turn to play!', 'to': [user_id]};
			
			FB.ui(obj, function(response) {
					if ('to' in response && response.to.length > 0)
						on_complete({'success': true});
					else
						on_complete({'success': false});
				}				  
			);
		}
		else {
			on_complete({'success': false, 'reason': 'no_connection'});   
		}
	}		
	
	make_share(_type) {
		if (is_localhost) console.log('make_share', _type);
		else if (navigator.onLine){
			var image_url = 'https://serv5.elian-games.com/match3_online/assets/wall_post/' + _type + '.jpg';
			var swf_url = 'https://serv5.elian-games.com/match3_online/assets/wall_post/' + _type + '.swf';
			FB.ui(
			   {			
				method: 'feed',
				link: loading_vars['app_url'],
				redirect_uri: loading_vars['app_url'],					 
				source: swf_url,
				picture: image_url,				
				app_id: loading_vars['app_id'],
			   },
			   function(response) {
				   console.log('response= ');
				   console.log(response);
				 if (response && response.post_id) {
					console.log('Post published!!!');
				   
				 } else {
					console.log('Post was not published...');
				 }
			   }
			 );  			
		}
	}

	load_missing_users(ids, on_complete) {
		var i;
		var list = [];					
		for (i = 0; i < ids.length; i++) {
			if (!(ids[i] in game_data['users_info'] && 'first_name' in game_data['users_info'][ids[i]]))
				list.push(ids[i]);
		}	
		if (list.length > 0) {	
			FB.api('/', {'ids': list.join(','), 'fields': 'id,locale,first_name,last_name,gender,link,picture.width(120).height(120)'}, function(res) {						
				var user_id;								
			
				for (user_id in res) {		
					if (res[user_id] && res[user_id]['picture'])			
						game_data['users_info'][user_id] = {'first_name': res[user_id]['first_name'], 'photo_url': res[user_id]['picture']['data']['url']};									
				}								
				on_complete();
			});
		}
		else
			on_complete();
	}
}

var callbacks = {};

class OkApi extends SocialApi{
	constructor() {		
		 super({});		
	}
	
	get_game_size() {
		if (loading_vars['mobile']) {
			return {'W': window.innerWidth, 'H': window.innerHeight};
		}
		else if (this.canvasW && this.canvasH)
			return {'W': this.canvasW, 'H': this.canvasH};
		else
			return {'W': window.innerWidth, 'H': window.innerHeight - 20};
	}	
	
	extra_start_actions(on_complete) {
		var _this = this;
		game_data['in_app_items'] = true;
		this.load_missing_users([loading_vars['user_id']], on_complete); 
		if (loading_vars['mobile']) this.set_game_size();
		else this.change_game_size();
	}
	
	change_game_size() {
		FAPI.UI.getPageInfo();	
	}

	start_purchase_item(obj, on_complete) {
		 if (navigator.onLine) {
			if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
			var item_info = obj['item_info'];
			callbacks['showPayment'] = {'on_complete': on_complete, 'item_id': item_info['item_id'], 'item_info': item_info};
			
			FAPI.UI.showPayment(item_info['title'], '', item_info['item_id'], item_info['price'], null, null, "ok", "true");
			game_data['user_data']['payment_pending'] = true;			
			this.check_purchase(20);
			
		 }
		else 
			on_complete({'success': false});
	}	
	
	check_purchase(total_left) {
		var _this = this;
		if (total_left > 0) {
			console.log('total_left', total_left);
			setTimeout(() => {				
				if (game_data['user_data']['payment_pending']) {
					game_data['game_request'].request({'check_purchase': true}, function(res) {										
						if (game_data['user_data']['payment_pending']) {
							if ('success' in res && res['success']) {
								var method = 'showPayment';
								var on_complete = (method in callbacks) ? callbacks[method]['on_complete'] : function(){};
								var res = {
									'success': true,
									'item_id': callbacks[method]['item_id'],
									'item_info': callbacks[method]['item_info']
								};	
								on_complete(res);	
								game_data['user_data']['payment_pending'] = false;
							}
							else {
								total_left--;
								_this.check_purchase(total_left);
							}							
						}					
					});	
				}			
			}, 5000);
		}
	}
	
   make_challenge(user_id, on_complete) {
	if (navigator.onLine){
			if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
			callbacks['showNotification'] = {'on_complete': on_complete};
			FAPI.UI.showNotification('Заходи в игру! Будем играть вместе', "arg1=val1", user_id);
		}
		else {
			on_complete({'success': false, 'reason': 'no_connection'});
		}
	}	
	
	make_share(_type) {
		if (is_localhost) console.log('make_share', _type);
		else if (navigator.onLine){
			var image_url = 'https://serv5.elian-games.com/online_games/match3_online/assets/wall_post/' + _type + '.jpg';
			var _title = game_data['language']['wall_post']['title'][_type]['RU']['text'];
			var _description = game_data['language']['wall_post']['description'][_type]['RU']['text'];			
			
			if (loading_vars['mobile']) {				
				FAPI.UI.postMediatopic({
					"media":[
						{
							"type": "text",
							"text": _description															
						},
						{							
							"type": "link",
							"url": "https://ok.ru/game/match3_online"																				
						}
					]
				}, false);								
			}
			else {
				FAPI.UI.postMediatopic({
							"media":[
								{
								  "type": "app",
								  "text": _description,
								  
								  "images": [
									{
									  "url": image_url,
									  "mark": "1",
									  "title": _title
									}
								  ],
													  
								  "actions": [
									{
									  "text": _title,
									  "mark":"1"
									}
								  ]
								}								
							]
				}, false);				
			}
		}
	}
	
	show_invite() {
		if (game_data['scene'].scale.isFullscreen) game_data['scene'].scale.stopFullscreen();
		FAPI.UI.showInvite('Заходи в игру! Вместе играть веселее!', "arg1=val1");
	}		
	
	update_game_size() {
		callbacks['getPageInfo'] = {'on_complete': function(){}, 'this': this};
		FAPI.UI.getPageInfo();		
	}	
	
	get_friends(on_complete) {
		var _this = this;
		game_data['friends'] = [];			
		FAPI.Client.call({"method":"friends.getAppUsers"}, function (method, result, data){
			var friends_ids = (result && 'uids' in result) ? result['uids'] : [];
			friends_ids.push(loading_vars['user_id']);	
			game_data['friends'] = friends_ids;
			_this.load_missing_users(friends_ids, on_complete);
		});	
	}

	load_missing_users(ids, on_complete) {			
		var i;
		var list = [];						
		for (i = 0; i < ids.length; i++) {
			if (!(ids[i] in game_data['users_info'] && 'first_name' in game_data['users_info'][ids[i]]))
				list.push(ids[i]);
		}	
		if (list.length > 0) {	
			FAPI.Client.call({"method":"users.getInfo", 'uids': list.join(','), 'fields': 'uid,first_name,gender,pic_1'}, function (method, result, data){						
				var user;
				if (result) {
					for (var i = 0; i < result.length; i++) {
						user = result[i];					
						game_data['users_info'][user['uid']] = {'first_name': user['first_name'], 'photo_url': user['pic_1']};								
					}			
				}
				on_complete();			
			});															
		}
		else 
			on_complete();				
	}	
	
	
	
	preload_interstitial_ad() {
		if (allow_intersitial_ads && game_data['ads']['interstitial']) {
			game_data['ads']['interstitial']['preloaded'] = false;
			FAPI.invokeUIMethod("prepareMidroll");	
		}
	}

	show_interstitial_ad() {
		if (game_data['ads']['interstitial'] && game_data['ads']['interstitial']['preloaded']) {
			if (!game_data['scene'].scale.isFullscreen) {
				FAPI.invokeUIMethod("showMidroll");
				game_data['unpaused'] = 0;
				game_data['audio_manager'].update_volume();
			}
		}
	}

	preload_rewarded_ad() {
		if (game_data['ads']['rewarded'] && allow_rewarded_ads) {
			game_data['ads']['rewarded']['preloaded'] = false;
			game_data['ads']['interstitial']['preloaded'] = false;
			FAPI.invokeUIMethod("prepareMidroll");   
		}
	}

	show_rewarded_ad(on_complete) {
		if (game_data['ads']['rewarded']  && game_data['ads']['rewarded']['available'] && game_data['ads']['rewarded']['preloaded']) {
			callbacks['showMidroll'] = {'on_complete': function(res) {
				on_complete(res)
			}, 'this': this}
			if (!game_data['scene'].scale.isFullscreen) {
				console.log("show rewarded")
				FAPI.invokeUIMethod("showMidroll");
				game_data['unpaused'] = 0;
				game_data['audio_manager'].update_volume();
			}
		}
	}
}

function API_callback(method, result, data){		
		on_complete = (method in callbacks) ? callbacks[method]['on_complete'] : function(){};	
		if (method == 'getPageInfo') {	
			var obj = JSON.parse(data);
			var iw = obj['innerWidth'];
			var ih = obj['innerHeight'];	
			FAPI.UI.setWindowSize(iw, ih + 200);
			
			game_data['socialApi'].canvasW = iw;
			game_data['socialApi'].canvasH = ih - 20;				
			game_data['socialApi'].set_game_size();
		}
	
		if (method == 'showPayment') {
			if (game_data['user_data']['payment_pending']) {
				//var obj = JSON.parse(data);
				var res = {};		
				res['success'] = (result == "ok");
				res['item_id'] = callbacks[method]['item_id'];
				res['item_info'] = callbacks[method]['item_info'];
				on_complete(res);
				game_data['user_data']['payment_pending'] = false;
			}
		}

		if (method == 'showNotification' && result == "ok") {			
			on_complete({'success': true});
		}		

		if (method == 'prepareMidroll') {
			if (result == "ok") {
				game_data['ads']['interstitial']['preloaded'] = true;
			}		
			else {
				setTimeout(() => {				
					if (allow_intersitial_ads) game_data['socialApi'].preload_interstitial_ad();
				}, 10000);				
			}								
		}
		
		if (method == 'showMidroll') {	
			game_data['ads']['interstitial']['preloaded'] = null;			
			if (allow_intersitial_ads) game_data['socialApi'].preload_interstitial_ad();									
			game_data['unpaused'] = 1;
			game_data['audio_manager'].update_volume();			
			game_data['game_request'].request({'ads_shown': true, 'web': true}, function(res) {});
		}
}

class VkApi extends SocialApi{
	constructor() {		
		 super({});				 
	}
	
	extra_start_actions(on_complete) {
		var _this = this;
		this.load_user_list = [];
		this.load_user_completes = [];
		game_data['in_app_items'] = true;

		if (loading_vars['mobile']) {
			vkBridge.send("VKWebAppInit", {}).then(function(data){
				console.log('success VKWebAppInit', data);
				_this.load_missing_users([loading_vars['user_id']], on_complete);			
			}).catch(function(error){
				console.log('error VKWebAppInit', error);
			});			
		}
		else {		
			VK.init(function() {			  
			  VK.addCallback('onOrderSuccess', _this.handler_order_success);
			  VK.addCallback('onOrderFail', _this.handler_order_fail);
			  VK.addCallback('onOrderCancel', _this.handler_order_cancel);	 
			 
			  VK.addCallback('onRequestSuccess', _this.handler_request_success);	 
			  VK.addCallback('onRequestFail', _this.handler_request_fail);
			  VK.addCallback('onRequestCancel', _this.handler_request_cancel);
			  _this.load_missing_users([loading_vars['user_id']], on_complete);
			}, function() {});
		}
	}

	handler_order_success(order_id) {
		var on_complete = ('purchase' in callbacks) ? callbacks['purchase']['on_complete'] : function(){};	
		on_complete({'success': true, 'item_id': callbacks['purchase']['item_id'], 'item_info': callbacks['purchase']['item_info']});		
	}

	handler_order_fail() {
		var on_complete = ('purchase' in callbacks) ? callbacks['purchase']['on_complete'] : function(){};	
		on_complete({'success': false, 'item_id': callbacks['purchase']['item_id'], 'item_info': callbacks['purchase']['item_info']});		
	}
	
	handler_order_cancel() {
		var on_complete = ('purchase' in callbacks) ? callbacks['purchase']['on_complete'] : function(){};	
		on_complete({'success': false, 'item_id': callbacks['purchase']['item_id'], 'item_info': callbacks['purchase']['item_info']});		
	}	
	
	handler_request_success() {
		var on_complete = ('challenge' in callbacks) ? callbacks['challenge']['on_complete'] : function(){};	
		
		on_complete({'success': true});
	}	
	
	handler_request_fail(error) {
		var on_complete = ('challenge' in callbacks) ? callbacks['challenge']['on_complete'] : function(){};	
		on_complete({'success': false});
	}	
	
	handler_request_cancel() {
		var on_complete = ('challenge' in callbacks) ? callbacks['challenge']['on_complete'] : function(){};	
		on_complete({'success': false});		
	}	
	

	get_game_size() {
		return {'W': window.innerWidth, 'H': window.innerHeight};
	}	
	
	get_friends(on_complete) {		
		var _this = this;
		var ids = [];		
		game_data['friends'] = [];
		this.get_app_users(function(data) {
			if (data['response']) 
				ids = data['response'];
			ids.push(loading_vars['user_id']);			
			for (var i = 0; i < ids.length; i++)
				game_data['friends'].push(ids[i].toString());
			on_complete();
		});
	}		
	
	get_app_users(on_complete) {
		if (loading_vars['mobile']) {
			vkBridge.send("VKWebAppCallAPIMethod", {
				"method": "friends.getAppUsers",				
				"params": {						
					"access_token": loading_vars['access_token'],
					'v': '5.131',
				}
			}).then(function(data) {				
				on_complete(data);
			}).catch(function(error){				
				console.log('friends.getAppUsers ERROR!', error);
			});				
		}
		else {
			VK.api("friends.getAppUsers", {"v":"5.131"}, function (data) {
				on_complete(data);
			});	
		}				
	}		
	
	start_purchase_item(params, on_complete) {	
		var _this = this;
		if (loading_vars['mobile']) {
			vkBridge.send("VKWebAppShowOrderBox", {type:"item",item: params['item_info']['item_id']}).then(function(data){			
				game_data['user_data']['payment_pending'] = true;
				_this.check_purchase(0, params['item_info'], on_complete);					
				
			}).catch(function(error){ 
				on_complete({'success': false});
			});				
		}
		else {
			if (game_data['scene'].scale.isFullscreen) 
				game_data['scene'].scale.stopFullscreen();
			callbacks['purchase'] = {'on_complete': on_complete, 'item_id': params['item_info']['item_id'], 'item_info': params['item_info']};	
			VK.callMethod('showOrderBox', {'type': 'item', 'item': params['item_info']['item_id']});
			
		}
	}
	
	check_purchase(iter, item_info, on_complete) {
		var _this = this;
		var max_iter = 60;
		if (iter < max_iter) {
			console.log('total_left', iter);							
			if (game_data['user_data']['payment_pending']) {
				game_data['game_request'].request({'check_purchase': true}, function(res) {										
					if (game_data['user_data']['payment_pending']) {
						if ('success' in res && res['success']) {								
							on_complete({'success': true, 'item_id': item_info['item_id'], 'item_info': item_info});	
							game_data['user_data']['payment_pending'] = false;
						}
						else {
							iter++;
							setTimeout(() => {
								_this.check_purchase(iter, item_info, on_complete);
							}, 500 + iter * 1000);
						}							
					}					
				});	
			}						
		}
	}
	
	show_leaderboard(score) {	
		if (loading_vars['mobile']) {
			 vkBridge.send("VKWebAppShowLeaderBoardBox", {user_result: score}).then(function(data) {							
				//alert('show leaderboard ok..');
				console.log('success VKWebAppShowLeaderBoardBox: ', data);
			}).catch(function(error){
				//alert('error leaderboard: ' + JSON.stringify(error));
				console.log('error VKWebAppShowLeaderBoardBox: ', error);
			});;
		}
		else {
			VK.callMethod("showLeaderboardBox", score);
		}
	}
		
	show_invite() {		
		if (loading_vars['mobile']) {
			vkBridge.send("VKWebAppShowInviteBox", {});
		}
		else {
			if (game_data['scene'].scale.isFullscreen) 
				game_data['scene'].scale.stopFullscreen();			
			VK.callMethod("showInviteBox");				
		}
	}

	make_challenge(user_id, on_complete) {
		if (navigator.onLine){
			var message = 'Заходи в игру! Будем играть вместе';		
			
			if (loading_vars['mobile']) {	
				vkBridge.send("VKWebAppShowRequestBox", {uid: user_id, message: message, requestKey:"unique_key_to_build_funnel"}).then(data => {
					console.log('success VKWebAppShowRequestBox', data.success);
					on_complete({'success': true});
				}).catch(error => {
					console.log('error VKWebAppShowRequestBox ', error);
					on_complete({'success': false});
				});					
			}
			else {
				if (game_data['scene'].scale.isFullscreen) 
					game_data['scene'].scale.stopFullscreen();
				callbacks['challenge'] = {'on_complete': on_complete};									
				VK.callMethod("showRequestBox", parseInt(user_id), message, "");					
			}			
		}
		else {
			on_complete({'success': false, 'reason': 'no_connection'});   
		}
	}	

	make_share(_type) {
		if (is_localhost) 
			console.log('make_share', _type);
		else 
			if (navigator.onLine){
			if (game_data['scene'].scale.isFullscreen) 
				game_data['scene'].scale.stopFullscreen();	
			
			var message = game_data['wall_post_vk'][_type]['text'];
			var attachments = game_data['wall_post_vk'][_type]['id'];
			
			if (loading_vars['mobile']) {
				vkBridge.send("VKWebAppShowWallPostBox", {
					"request_id": "1",
										
					//"access_token": loading_vars['access_token'],
					"message": message,
					'attachments': attachments,
					//'v': '5.131',
					
				}).then(data => {				
					on_complete(data);
					}
				).catch(error => {
					//console.log(error)
					console.log('wall.post ERROR!', error);
					}
				);				
			}
			else {
				VK.api("wall.post", {"message": message, "attachments": attachments, 'v': '5.131'}, function (data) {});					
			}
		}
	}
	
	
	load_missing_users(ids, on_complete) {
		var i;
		//var list = [];				
		var allow_call = this.load_user_list.length == 0// && this.load_user_completes.length == 0;
		for (i = 0; i < ids.length; i++) {
			if (!(ids[i] in game_data['users_info'] && 'first_name' in game_data['users_info'][ids[i]])) {
				//list.push(ids[i]);
				this.load_user_list.push(ids[i])
			}
		}
		this.load_user_completes.push(on_complete);
		//console.log('call_1', this.load_user_list.length, this.load_user_completes.length)
		if (allow_call) {
			setTimeout(() => {
				var completes = [];
				var list = [];
				for(i = 0; i < this.load_user_list.length; i++) list.push(this.load_user_list[i])
				for(i = 0; i < this.load_user_completes.length; i++) completes.push(this.load_user_completes[i])
				this.load_missing_users_part(list, function() {
					//console.log('call_2', completes.length)
					for (i = 0; i < completes.length; i++) completes[i]();
				});
				this.load_user_list = [];
				this.load_user_completes = [];
			}, 100);
		}
	}	
	
	load_missing_users_part(list, on_complete) {
		var _this = this;
		if (list.length > 0) {
			var part = list.splice(0, 10);			
			this.users_get(part, function(data) {	
				var users = data['response'];
				if (users) {
					var user;
					var user_id;
					for (i = 0; i < users.length; i++) {
						user = users[i];
						user_id = user['id'].toString();
						game_data['users_info'][user_id] = {'first_name': user['first_name'], 'photo_url': user['photo_medium_rec']};															
						//console.log('user_get2',user_id, JSON.stringify(game_data['users_info'][user_id]))
					}	
					_this.load_missing_users_part(list, on_complete);
				}
				else on_complete();
			});				
		}
		else {			
			on_complete();
		}	
	}
	
	users_get(part, on_complete) {
		if (loading_vars['mobile']) {					
			vkBridge.send("VKWebAppCallAPIMethod", {
				"method": "users.get",				
				"request_id": "1",
				"params": {						
					"access_token": loading_vars['access_token'],
					"user_ids": part.join(','),
					'fields': 'uid,first_name,last_name,photo_medium_rec',
					'v': '5.131',
				}
			}).then(data =>  {			
				on_complete(data);
			}
			).catch(error => {				
				console.log('users.gets ERROR!', error);
				}
			);	
		}
		else {
			VK.api("users.get", {'user_ids': part, 'fields': 'uid,first_name,last_name,photo_medium_rec', 'v': '5.131'}, function (data) {
				on_complete(data);
			});			
		}
	}
}


class IgApi extends SocialApi{
	constructor() {		
		 super({});		 
	}

	create_shortcut() {
		FBInstant.canCreateShortcutAsync()
			.then(function(canCreateShortcut) {
				console.log(canCreateShortcut)
				if (canCreateShortcut) {
				game_request.update_stat({'create_shortcut': true , 'status': 'offer'});
				FBInstant.createShortcutAsync()
					.then(function() {
					// Shortcut created
						game_request.update_stat({'create_shortcut': true , 'status': 'accept'});
						game_data['user_data']['tutorial']['shortcut'] = true;
						game_data['game_request'].request({'update_tutorial':true, 'tutorial_id':'shortcut' }, obj => {});
					})
					.catch(function() {
						game_request.update_stat({'create_shortcut': true , 'status': 'decline'});
					// Shortcut not created
					});
				}
			});
	}

	extra_start_actions(on_complete) {
		FBInstant.startGameAsync().then(function() {
			game_data['inapp_payments'] = false;
			FBInstant.payments.onReady(function () {					
				FBInstant.payments.getCatalogAsync().then(function (catalog) {
					game_data['inapp_payments'] = true;
					console.log('Payments Ready!');
					game_data['in_app_items'] = catalog;
					game_data['utils'].game_mode();
				});
			});
			FBInstant.onPause(function() {
				game_data['error_history'].push('pause');
				game_data['unpaused'] = 0;
				game_data['audio_manager'].update_volume();
			});
			setTimeout(() => {
				game_data['utils'].check_existing_tournament(true);
			}, 2000);
		});
		on_complete();
	}

	get_game_size() {
		return {'W': window.innerWidth, 'H': window.innerHeight};
	}	

	
	set_loading_progress(val, scene) {
		FBInstant.setLoadingProgress(val);
	}	

	load_missing_users(ids, on_complete) {
		var i;
		var list = [];				
		for (i = 0; i < ids.length; i++) {
			if (!(ids[i] in game_data['users_info'] && 'first_name' in game_data['users_info'][ids[i]]))
				list.push(ids[i]);
		}
		if (list.length > 0) {	
			game_data['game_request'].request({'get_users_info': true, 'user_ids': list}, function(res){
				if (res['success'] && res['users_info']) {
					for (i = 0; i < res['users_info'].length; i++) {
						var info = res['users_info'][i];
						var user_id = info['user_id'];
						game_data['users_info'][user_id] = {'first_name': info['first_name'], 'base64_url': info['base64_url']};
					}
				}
				on_complete();
			});
		}
		else
			on_complete();
	}
	
	start_purchase_item(obj, on_complete) {
		 if (navigator.onLine) {
			var item_info = obj['item_info'];

			FBInstant.payments.purchaseAsync({
				productID: item_info['item_id'],
				developerPayload: 'taras',
			  }).then(function (purchase) {
				console.log(purchase);			
				game_data['socialApi'].consume_item(purchase['purchaseToken']);	
				on_complete({'success': true, 'item_info': obj['item_info'], 'purchaseToken': purchase['purchaseToken']});			
			}).catch(function(err){
				console.log('Error: ' + err.message);
			});	
		 }
		else 
			on_complete({'success': false});
	}
	
	consume_item(purchase_token) {
		FBInstant.payments.consumePurchaseAsync(purchase_token).then(function () {
			console.log('CONSUMED!!!');
		}).catch(function(error) {
			console.log('not consumed...');        
		});		
	}	
	
	
	get_friends(on_complete) {
		var connectedPlayers = FBInstant.player.getConnectedPlayersAsync()
		.then(function(_players) {
			var players = _players.map(function(player) {
				return {
				  id: player.getID(),
				  name: player.getName(),
				  photo: player.getPhoto()
				}
			});
			var i = 0;
			var _id = '';
			game_data['friends'] = [String(loading_vars['user_id'])];
			for (i = 0; i < players.length; i++) {
				_id = String(players[i]['id']);
				game_data['friends'].push(_id);
				game_data['users_info'][_id] = {'first_name': players[i]['name'], 'photo_url': players[i]['photo']};
			}
			on_complete();
		});		
	}
	
	create_wall_post(params, on_complete) {
		if (is_localhost) console.log('make_wall_post', params);
		else if (navigator.onLine){
			var image_url = params['url'];
			game_data['utils'].toDataURL(image_url, (dataUrl)=> {
				FBInstant.shareAsync({                
					image: dataUrl,
					text: '',
					data: { myReplayData: 'my_replay_data' },
					shareDestination: ['NEWSFEED', 'COPY_LINK', 'MESSENGER'],
  					switchContext: false,
				}).then(()=> {
					game_request.update_stat({'social_action': true , 'action_id': 'wall_post_success'});
					on_complete({'success': true});
				}).catch((err)=>{
					game_request.update_stat({'social_action': true , 'action_id': 'wall_post_fail'});
					on_complete({'success': false});
				});
			});
		}
	}

	get_current_tournament(on_complete) {	
		let current_time = Math.ceil(game_request.get_time() / 1000);
		FBInstant.getTournamentAsync().then(tournament => {
			let context_timestamp = tournament.getEndTime();
			console.log('gct', (current_time < context_timestamp), tournament.getID(), current_time, context_timestamp, current_time - context_timestamp)
			if (current_time >= context_timestamp) {
				game_request.request({'update_ig_tournament': true, 'context_id': 0, 'context_timestamp': 0}, (obj)=> {});
				on_complete(false);
			}
			else {
				let t_id = tournament.getID();
				if (String(t_id) != String(game_data['user_data']['ig_tournament']['context_id']))
					game_request.request({'update_ig_tournament': true, 'context_id': String(t_id), 'context_timestamp': context_timestamp}, (obj)=> {});
				
				on_complete(tournament);
			}
		})
		.catch(err => {
			let t_id = null;
			if (game_data['user_data']['ig_tournament']['context_id']) {
				t_id = String(game_data['user_data']['ig_tournament']['context_id']);
				if (game_data['user_data']['ig_tournament']['context_timestamp']) {
					console.log('gct2', current_time >= game_data['user_data']['ig_tournament']['context_timestamp'])
					if (current_time >= game_data['user_data']['ig_tournament']['context_timestamp']) {
						game_request.request({'update_ig_tournament': true, 'context_id': 0, 'context_timestamp': 0}, (obj)=> {});
						t_id = null;
					}	
				}
			}
				

			if (t_id) FBInstant.tournament.joinAsync(t_id).then(()=> {
				if (!this.reget_current_tournament) {
					this.reget_current_tournament = true;
					this.get_current_tournament(on_complete)
				}
			}).catch(err => {
				game_request.request({'update_ig_tournament': true, 'context_id': 0, 'context_timestamp': 0}, (obj)=> {});
				game_request.update_stat({'social_action': true , 'action_id': 'tournament_rejected'});
				on_complete(false);
			});
			else on_complete(false);
		});
	}

	get_or_create_tournament(score, on_complete) {
		let tournament = null;
		let current_time = Math.ceil(game_request.get_time() / 1000);
		if (game_data['current_tournament']) {
			if (current_time < game_data['current_tournament'].getEndTime()) tournament = game_data['current_tournament'];
		}
		if (tournament) on_complete(tournament, true);
		else {
			let endTime = current_time + 604800;
			let title = 'My fancy ';
			if (game_data['users_info'][loading_vars['user_id']] && game_data['users_info'][loading_vars['user_id']]['first_name']) {
				title = game_data['users_info'][loading_vars['user_id']]['first_name'] + "'s ";
			}
			title += 'tournament';
			FBInstant.tournament.createAsync({initialScore: score, data:{ main_score: score }, 
				config: { sortOrder:"HIGHER_IS_BETTER", endTime: endTime, 
					title: title
				}
			}).then((tournament) => {
				game_data['current_tournament'] = tournament;
				game_request.update_stat({'social_action': true , 'action_id': 'tournament_create'});
				on_complete(tournament, false);
			}).catch((err) => {
				game_data['current_tournament'] = null;
				game_request.update_stat({'social_action': true , 'action_id': 'tournament_create_fail'});
				on_complete(false);
			})
		}
	}

	share_tournament(params, on_complete = () => {}) {
		let score = params['score'];
		let share = params['share'];
		this.get_or_create_tournament(score, (tournament, exists = false)=>{
			if (tournament) {
				if (exists) {
					if (share) {
						FBInstant.tournament.shareAsync({ score: score, data: { myReplayData: '...' }}).then(() => {
							game_request.update_stat({'social_action': true , 'action_id': 'tournament_share'});
							on_complete(true)
						}).catch((err) => {
							game_request.update_stat({'social_action': true , 'action_id': 'tournament_share_fail'});
							on_complete(false)
						});
					}
					else {
						FBInstant.tournament.postScoreAsync(score).then(()=> {
							game_request.update_stat({'social_action': true , 'action_id': 'tournament_post_score'});
							on_complete(true);
						}).catch((err) => {
							game_request.update_stat({'social_action': true , 'action_id': 'tournament_post_score_fail'});
							on_complete(false)
						});
					}
				}
				else on_complete(true);
			}
			else on_complete(false);	
		})
	}
	
   make_challenge(user_id, on_complete) {
		var lang_id = game_data['user_data']['lang'].toUpperCase();
		var txt = game_data['language']['game']['challenge']['1'][lang_id]['text'];
		if (navigator.onLine) FBInstant.context.createAsync(user_id).then(function() {
			var image_url = game_data['urls']['assets']+ 'wall_post/' + 'challenge' + '.jpg';
			game_data['utils'].toDataURL(image_url,
				function(dataUrl) {
				  FBInstant.updateAsync({       
					action: 'CUSTOM',
					cta: 'Play',
					image: dataUrl,
					template: 'challenge',
					text: {
						default: txt,
					},
					strategy: 'IMMEDIATE',
					notification: 'NO_PUSH',
					data: { myReplayData: 'my_replay_data' },
				  }).then(function() {
					console.error('make_challenge normal');      
					on_complete({'success': true});
					
				  }).catch(function(err){
					console.error('make_challenge error: ' + err.message);
					on_complete({'success': false});
				  });
				}
			  )
		  });
		else {
			on_complete({'success': false, 'reason': 'no_connection'});
		}
  	}	

	  make_share(_type, on_complete) {
		if (navigator.onLine){
			let phrase_id = Phaser.Utils.Array.GetRandom([1])
			var res = game_data['utils'].generate_string({'scene_id': 'system', 'item_id': 'showInvite', 'phrase_id':phrase_id, 'values': [], 'base_size': 10});	
			var dataUrl = game_data.scene.textures.getBase64('wall_post')
			FBInstant.shareAsync({
				intent: 'SHARE',
				image: dataUrl, // base64Image code must be passed in img
				text: res['text'],
				shareDestination: ['NEWSFEED'],
				data: {myReplayData: '...'},
			}).then(function(res) {
				// game_data['utils'].update_stat({'social_activity': true , 'kind': 'share'});
				on_complete({'success': true});
			}).catch(function(err){
				// console.log("Failed to send Share");
				// console.log(err);
				on_complete({'success': false});
			});
		}
	}
	
	show_invite() {
		FBInstant.context.chooseAsync({filters: ['NEW_PLAYERS_ONLY']}).then(function() {
			game_request.update_stat({'social_action': true , 'action_id': 'invite_success'});
		}).catch(function (e) {
			game_request.update_stat({'social_action': true , 'action_id': 'invite_fail'});
		});
	}	
	
	subscribe_bot() {
		if (is_localhost) {}
		else {
			var canSubscribeBot = false;
			FBInstant.player.canSubscribeBotAsync().then(function (can_subscribe) {
				canSubscribeBot = can_subscribe;
				console.log('canSubscribeBot=', canSubscribeBot);
				if (canSubscribeBot) {
				FBInstant.player.subscribeBotAsync().then(function () {
					game_data['utils'].update_stat({'type': 'subscribe_bot', 'amount_inc': 1});
					console.log( 'Player is subscribed to the bot');
				}).catch(function (e) {
					game_data['utils'].update_stat({'type': 'subscribe_bot', 'amount_inc': 0});
					console.log( 'Handle subscription failure');	
				});
				}
			});
		}
	}
	
	preload_interstitial_ad() {
		// game_data['ads']['interstitial']['preloaded'] = null;
		// if (allow_intersitial_ads)
		// 	FBInstant.getInterstitialAdAsync(game_data['ads']['interstitial']['code']).then(function(interstitial) {
		// 		// Load the Ad asynchronously
		// 		game_data['ads']['temp_intersitial'] = interstitial;
		// 		return   game_data['ads']['temp_intersitial'].loadAsync();
		// 	}).then(function() {
		// 			game_data['ads']['interstitial']['preloaded'] = game_data['ads']['temp_intersitial'];
		// 			game_data['ads']['temp_intersitial'] = null;
		// 		console.log('Interstitial preloaded')
		// 	}).catch(function(err){
		// 		console.error('Interstitial failed to preload: ' + err.message);
		// 	});        
	}

	show_interstitial_ad(cheater) {
		// var _this = this;
		// if (allow_intersitial_ads && game_data['ads']['interstitial']['preloaded']) {
		// 		game_data['unpaused'] = 0;
		// 		game_data['audio_manager'].update_volume();
		// 		game_data['ads']['interstitial']['preloaded'].showAsync().then(function() {
		// 				game_data['unpaused'] = 1;
		// 				game_data['audio_manager'].update_volume();
		// 				game_data['utils'].update_stat({'type': 'interstitial_ad', 'amount_inc': 1});
		// 				console.log('Interstitial ad finished successfully');
		// 				setTimeout(() => {
		// 						_this.preload_interstitial_ad();       
		// 				}, 200);
		// 		}).catch(function(e) {
		// 				game_data['unpaused'] = 1;
		// 				game_data['audio_manager'].update_volume();
		// 				//console.error(e.message);
		// 				setTimeout(() => {
		// 						_this.preload_interstitial_ad();  
		// 				}, 60000);
		// 		});
		// }
		console.log(allow_intersitial_ads)
		console.log(game_data['ads']['interstitial']['available'])
		if (allow_intersitial_ads && game_data['ads']['interstitial']['available']) {
			// game_data['unpaused'] = 0;
			// game_data['audio_manager'].update_volume();
			// game_data['ads']['interstitial']['preloaded'].showAsync().then(function() {
			// 		game_data['unpaused'] = 1;
			// 		game_data['audio_manager'].update_volume();
			// 		console.log('Interstitial ad finished successfully');
			// 		setTimeout(() => {
			// 				_this.preload_interstitial_ad();       
			// 		}, 5000);
					
			// }).catch(function(e) {
			// 		game_data['unpaused'] = 1;
			// 		game_data['audio_manager'].update_volume();
			// 		//console.error(e.message);
			// 		setTimeout(() => {
			// 				_this.preload_interstitial_ad();  
			// 		}, 60000);
			// });

			let ad = null
			FBInstant.getInterstitialAdAsync(game_data['ads']['interstitial']['code']).then(interstitial => {
				ad = interstitial
				console.log(ad)
				return ad.loadAsync()
			})
			.then(() => {
				// LOADED
				console.log('Interstitial preloaded')
				game_data['unpaused'] = 0;
				game_data['audio_manager'].update_volume();
				game_request.request({'update_interstitial_ad': true, 'flag': 1}, res => {})
				if (cheater) game_request.update_stat({'interstitial_cheater': true})
				return ad.showAsync()
			})
			.then(() => {
				// watched
				game_data['unpaused'] = 1;
				game_data['audio_manager'].update_volume();
				game_request.request({'update_interstitial_ad': true, 'flag': 0}, res => {})
				console.log('Interstitial ad finished successfully');
				
			})
			.catch(e => {
				console.error('Interstitial failed to preload: ' + e);
				game_data['unpaused'] = 1;
				game_data['audio_manager'].update_volume();
				game_request.request({'update_interstitial_ad': true, 'flag': 0}, res => {})
			})
			
	}
	}

	preload_rewarded_ad() {
		game_data['ads']['rewarded']['preloaded'] = null;
		if (allow_rewarded_ads)
			FBInstant.getRewardedVideoAsync(game_data['ads']['rewarded']['code']).then(function(rewarded) {
				// Load the Ad asynchronously
				game_data['ads']['temp_reward'] = rewarded;
				return game_data['ads']['temp_reward'].loadAsync();
			}).then(function() {
				console.log('Rewarded video preloaded')
				game_data['ads']['rewarded']['preloaded'] = game_data['ads']['temp_reward'];
				game_data['ads']['temp_reward'] = null;
			}).catch(function(err){
				console.error('Rewarded video failed to preload: ' + err.message);
			});        
	}

	show_rewarded_ad(on_complete) {
		var _this = this;
		if (allow_rewarded_ads && game_data['ads']['rewarded']['preloaded'] && game_data['ads']['rewarded']['available']) {
				game_data['unpaused'] = 0;
				game_data['audio_manager'].update_volume();
				game_data['ads']['rewarded']['preloaded'].showAsync().then(function() {
					game_data['unpaused'] = 1;
					game_data['audio_manager'].update_volume();
					game_data['utils'].update_stat({'type': 'reward_ad', 'amount_inc': 1});
					on_complete({'success': true});
					setTimeout(() => {
						_this.preload_rewarded_ad();    
					}, 200);       
				})
				.catch(function(e) {
						game_data['unpaused'] = 1;
						game_data['audio_manager'].update_volume();
						on_complete({'success': false, 'cancel_video': e.code == 'USER_INPUT'});
						setTimeout(() => {
								_this.preload_rewarded_ad();    
						}, 60000);
						console.error(e.message);
				});
		} 
		else on_complete({'success': false}); 
	}	
	
	check_pending_purchases(on_complete) {
		FBInstant.payments.getPurchasesAsync().then(function (purchases) {		  
		  console.log(purchases); // [{productID: '12345', ...}, ...]			
		  on_complete(purchases);
		});		
	}
	
	switch_game(params) {
		var flag = 'flag' in params ? params['flag'] : 0;
		game_data['utils'].update_stat({'type': 'switch_game', 'description': params['game_id'], 'sub_action': flag});
		FBInstant.switchGameAsync(params['app_id']);
	}
	
}

class DefaultApi extends SocialApi{
	constructor() {		
		 super({});		 
	}
	extra_start_actions(on_complete) {
		game_data['friends'].push(loading_vars['user_id']);
		game_data['in_app_items'] = game_data['shop'];
		game_data['ads']['rewarded']['preloaded'] = true;
		on_complete();
	}
	
	init(on_complete) {
		on_complete({'user_id': '0'});
	}
	
	get_friends(on_complete) {
		on_complete();
	}
	
	start_purchase_item(obj, on_complete) {
		
		on_complete({'success': true, 'item_info': obj['item_info']})
	}
	
	make_challenge(user_id, on_complete) {
			on_complete({'success': true});
	}	

	make_share(_type) {		
		if (is_localhost) console.log('make_share', _type);		
	}


	purchase_item(params, on_complete) {			
		on_complete({'success': true, 'item_info': params['item_info']});			
	}

	set_score(score, board, on_complete) {

	}

	get_entries_near_user(board, is_friends, on_complete) {
		//получить соседей по рейтингу на  +/- 5 позиций
	}

	get_competitors_list(on_complete) {
		//получение списка из, например, 100 user_id для подбора разных соперников, плюс тут же отфильтровать от друзей
	}

	create_wall_post(params, on_complete) {
		on_complete({'success': true});
	}

	share_tournament(obj, on_complete) {
		on_complete({success: true});
	}
}


