var GameWindows = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GameWindows (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {	
	var _this = this;
	game_data['game_windows'] = this;
	this.game_window = null;
	this.overlay_bmd = null;
	this.current_id = '';
	this.overlay_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.overlay_holder);	
	this.default_overlay = null;
	this.create_default_overlay(params);
	this.overlay_holder.removeAll();
	this.allow_overlay_click = true;
	this.pending_windows = [];	
	
	this.window_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.window_holder);	
	
	this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.moving_holder);	
	
	this.allow_window_close	= false;

},

show_window(params) {
	var allow = true;
	// console.log(params['window_id'])
	if (params['window_id'] == 'sales' && game_data['current_scene'] === 'GAMEPLAY') {
		allow = false
	}
	if (params['window_id'] == 'rating_bonus' && game_data['current_scene'] === 'GAMEPLAY') {
		allow = false
	}
	if (params['window_id'] == 'star_chest' && game_data['current_scene'] === 'GAMEPLAY') {
		allow = false
	}
	if (params && params['sale'] && this.pending_windows.length > 0) allow = false;
	if (params['window_id'] == 'challenge_duel' && (this.pending_windows.length > 0 || this.game_window)) allow = false;
	if (params && params['sale'] && (this.pending_windows.length > 0)) allow = false;
	if (params && allow) {
		if (this.game_window) {
			this.pending_windows.push(params);
		}
		else
			this.display_window(params);
	}
},

display_window(params) {
	var appear_type = 'center';
	if (this.game_window) {
		this.close_window({'immediate': true});		
	}
	
	var window_id = params['window_id'];	
	this.current_id = window_id;
	game_data['error_history'].push('gw_' + window_id);
	var _this = this;
	this.overlay_holder.inputEnabled = true;
	this.game_mode = game_data['utils'].game_mode();
	this.wind_id = window_id;
	switch (window_id) {
		
		case 'buy_money':		
		this.game_window = new BuyMoney();
		break;
		case 'no_money':
		this.game_window = new NoMoney();
		break;
		case 'options':
		this.game_window = new Options();
		break;
		case 'select_language':
		this.game_window = new SelectLanguage();
		break;
		case 'wait_competitors':
		this.game_window = new WaitCompetitors();
		break;
		case 'level_failed':
		this.game_window = new LevelFailed();
		break;
		case 'level_complete':
		this.game_window = new LevelComplete();
		break;
		case 'wait_tournament':
		this.game_window = new WaitTournament();
		break;
		case 'no_sales':
		this.game_window = new NoSales();
		break;
		case 'purchase_failed':
		this.game_window = new PurchaseFailed(this.scene);
		break;
		case 'quit_yes_no':
		this.game_window = new QuitYesNo(this.scene);
		break;
		case 'money_box':
		this.game_window = new MoneyBox(this.scene);
		break;
		case 'rating_bonus':
		this.game_window = new RatingBonus(this.scene);
		break;
		case 'rating_info':
		this.game_window = new RatingInfo(this.scene);
		break;
		case 'no_connection':
		this.game_window = new NoConnection(this.scene);
		break;
		// case 'sale':
		// this.game_window = new Sale(this.scene);
		// break;
		case 'sales':
		this.game_window = new Sales(this.scene);
		break;
		case 'paid_chest_open':
		this.game_window = new PaidChestOpen(this.scene);
		break;
		case 'chest_open':
		this.game_window = new ChestOpen(this.scene);
		break;
		case 'boosters_info':
		this.game_window = new BoostersInfo(this.scene);
		break;
		case 'chest_wait':
		this.game_window = new ChestWait(this.scene);
		break;
		case 'user_profile':
		this.game_window = new UserProfile(this.scene);
		break;
		case 'tasks_daily':
		this.game_window = new TasksDaily(this.scene);
		break;
		case 'day_bonus':
		this.game_window = new DayBonus(this.scene);
		break;
		case 'wait_duel':
		this.game_window = new WaitDuel(this.scene);
		break;
		case 'level_complete_duel':
		this.game_window = new LevelCompleteDuel(this.scene);
		break;
		case 'challenge_duel':
		this.game_window = new ChallengeDuel(this.scene);
		break;
		case 'more_games':
		this.game_window = new MoreGames(this.scene);
		break;
		case 'level_help':
		this.game_window = new LevelHelp(this.scene);
		break;
		case 'map_prize':
			this.game_window = new MapPrize(this.scene);
			break;
		case 'star_chest':
			this.game_window = new StarChest(this.scene);
			break;
		case 'free_money':
			this.game_window = new FreeMoney(this.scene);
			break;
		case 'social_reward':
			this.game_window = new SocialReward(this.scene);
			break;
	/*  */
	}	
	if (this.game_window) {
		params['moving_holder'] = this.moving_holder;
		this.create_default_overlay(params);	
		this.game_window.init(params);
		this.window_holder.add(this.game_window);	
		var dy = -15;
		var center_pt = ('center_pt' in params && params['center_pt']) ? params['center_pt'] : new Phaser.Geom.Point(loading_vars['W'] / 2, loading_vars['H'] / 2 + dy);
		//var center_pt = new Phaser.Geom.Point(0,0);
		if (window_id == 'level_complete') center_pt.y += 35;
		//if (window_id == 'level_help') center_pt.y -= 30;
		if (!('immediate' in params))
			this.display_smooth(center_pt, appear_type);
		else {
			this.game_window.x = center_pt.x;
			this.game_window.y = center_pt.y;
			if (this.game_window && this.game_window.window_shown) this.game_window.window_shown();
		}	
		this.allow_window_close	= true;
		this.game_window.emitter.on('EVENT', this.handler_event, this);
		
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'window_open'});

		this.allow_overlay_click = false;
		setTimeout(() => {
			this.allow_overlay_click = true;
		}, 500);
		this.emitter.emit('EVENT', {'event': 'window_shown'});
		if (loading_vars['new_user'])
		game_data['utils'].update_stat({'type': 'window_shown', 'funnel': true, 'description': this.wind_id});
		game_data['utils'].update_stat({'action': true , 'action_id': 'window_open', 'info': window_id});
	}
	else console.log('NO window:', window_id)
},

display_smooth(center_pt, appear_type) {			
	//window_holder.alpha = 1;	
	if (appear_type == 'center') {				
		this.game_window.x = center_pt.x;
		this.game_window.y = center_pt.y - 1000;
		var _this = this;
		game_data['scene'].tweens.add({targets: _this.game_window, y: center_pt.y + 20, ease: 'Sine.easeOut', duration: 350, onComplete: function(){
			game_data['scene'].tweens.add({targets: _this.game_window, y: center_pt.y, duration: 70}); 
			game_data['error_history'].push('gw1-1');
		}});  
	}
},

handler_event(params) {
	if ('events' in params) {		
		var arr = params['events'];		
		while (arr.length) {
			obj = arr.shift();			
			this.handler_event(obj);
		}
	}
	else {
		switch (params['event']) {
			case 'window_close':
				this.close_window(params);
				break;
			case 'show_window':
				this.show_window(params);
				break;
			default:
				this.emitter.emit('EVENT', params);
				break;
		}
	}
},

create_default_overlay(params) {
	var _this = this;
	this.allow_destroy_overlay = false;
	if (this.default_overlay == null) {
		this.default_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.default_overlay.setOrigin(0,0);
		this.default_overlay.alpha = 0.8;
        this.default_overlay.setInteractive();

		this.default_overlay.on('pointerup', () => {
			if (_this.game_window && _this.allow_overlay_click) {
				_this.allow_overlay_click = false;
				_this.game_window.handler_close({'overlay': true});	
			}
		});	
	}
	this.overlay_holder.add(this.default_overlay);
},


close_window(params = null) {
	var _id = this.current_id;
	var _this = this;
	//game_data['allow_fly'] = false;
	this.overlay_holder.inputEnabled = false;	
	if (this.allow_window_close) {
		this.allow_window_close = false;
		if (this.game_window.prize_mod) {
			game_data['prize_mod'] = false;
		}
		if (params && 'immediate' in params) {
			if (_this.current_id == _id) 	this.destroy_window();			
		}
		else {		
			var _this = this;
			var dx = _this.game_window.x
			game_data['scene'].tweens.add({targets: _this.game_window, x: dx - 30, duration: 70, onComplete: function(){
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'window_open'});
				game_data['scene'].tweens.add({targets: _this.game_window, x: dx + 1000, duration: 250, onComplete: function(){
					if (_this.current_id == _id)	_this.destroy_window();	
				}}); 
			}}); 	
		}
	}
},

destroy_window() {
	game_data['error_history'].push('gw2');
	this.overlay_holder.removeAll(this.allow_destroy_overlay);
	this.window_holder.removeAll(true);
	this.moving_holder.removeAll(true);

	if (this.overlay_bmd) {
		this.overlay_bmd.destroy();
		this.overlay_bmd = null;
	}
	this.allow_overlay_click = true;
	this.game_window = null;
	this.emitter.emit('EVENT', {'event': 'window_closed', 'pending_length': this.pending_windows.length});
	if (this.pending_windows.length) {
		var _params = this.pending_windows.shift();
		this.show_window(_params);
	}
	
}
});


