var phaser_game;
var files_preloaded = false;
var total_errors = 0;
var game = null;
var landscape = loading_vars['orientation'] == 'landscape';
var is_localhost = (location.hostname == '127.0.0.1' || location.hostname == 'localhost');
var debug_txt = null;
var allow_rewarded_ads = false;
var allow_intersitial_ads = false;
var temp_users_info = null;
var allow_more_games = true;
var temp_game_data = null;
var temp_user_data = null;
var allow_blend_mode = true;
var canSubscribeBot = false;
window.onload = function() {
	initialize(function(){

		var gameConfig = get_game_config();
		game_request = new GameRequest();
		game_request.request({'get_game_info': true}, function(params){		
			loading_vars['session_id'] = params['session_id'];			
			loading_vars['statistics_active'] = ('statistics_active' in params && params['statistics_active']);
			loading_vars['day_id'] = params['day_id'];
			loading_vars['new_user'] = params['new_user'];
			if (loading_vars['new_user']) game_request.update_stat({'funnel': true, 'sub_action': 1, 'description': 'preload_start'});
			if ('platform_data' in params) temp_game_data = params['platform_data']; 				
			if ('user_data' in params) {
				temp_user_data = params['user_data'];
				if ('rating' in params) temp_user_data['rating'] = params['rating'];
			} 
			if ('ads' in params) loading_vars['ads'] = params['ads'];
			game_request.update_stat({'type': 'html_init', 'action_id': 1, 'get_game_info': true}, params); //init(1)
			gameConfig['scene'] = mainGame;
			phaser_game = new Phaser.Game(gameConfig);
			window.focus();
			
			if (loading_vars['net_id'] == 'ig' && FBInstant) {
				FBInstant.getEntryPointAsync().then(function(entrypoint) {
					loading_vars['entry_point'] = entrypoint;
					let stat_obj = {'entry_point': true, 'info': entrypoint};
					if (entrypoint == 'ad') {
						let epd = FBInstant.getEntryPointData();
						if (epd) stat_obj['payload'] = epd;
						game_request.update_stat(stat_obj);
						
					}
					else game_request.update_stat(stat_obj); 
				}).catch(function() {
					game_request.update_stat({'entry_point': true, 'info': 'failed_to_get_entry_point'}); 
				});
			}
		});							
	});

	var elem = document.getElementById('preload');
	if (elem) elem.style.display = 'none';
	
	if (loading_vars['mobile']) {
		var elem = document.getElementById('ads');
		if (elem) elem.style.display = 'none';			
	}
	
}	


class mainGame extends Phaser.Scene{
	constructor(){
		super("MainGame");
		this.arr_stones = new Array();
	}

	preload(){	
		
		if (loading_vars['net_id'] != 'ig') {
			this.load.image('preload_bar', 'assets/preload_bar.png');
			this.load.image('preload_bg', 'assets/preload_bg.png');
			this.load.image('preload_bg2', 'assets/preload_bg2.png');
			this.load.once('complete', this.preload_files, this);			
		}
		else this.preload_files();				
		
	}

	preload_files(on_complete){
		// if (Number.isInteger(game_data['js_version'])) game_data['js_version'] = 69
		var _this = this;

		var preload_sounds = [
			'add_diamond',  'break_pig', 'chest_add', 'chest_bonus_got', 'chest_click', 'count_321', 'count_go', 'diamond_use', 'win_window_music', 
		'star_add', 'level_position_change', 'level_stage_done', 'pig_shake', 'round_finish_move_photo', 'level_start_fall', 'tic-tac',
		'bonus_use1','bonus_use2','bonus_use3','bonus_use5','bonus_use6', 'paid_bonus1', 'paid_bonus2', 'gem_drop', 'bad_move', 'bonus_create',
		'reproduct', 'tile_destroyed', 'box_destroyed', 'net_destroyed', 'crest_destroyed', 'spider_destroyed', 'gem_click', 'field_unlocked'
		];
		for (var i = 0; i < preload_sounds.length; i++) {
			this.load.audio(preload_sounds[i], 'assets/audio/' + preload_sounds[i] + '.mp3');
		}

		for ( let i = 0; i < 9; i++) {
            this.load.image(`bamboo${i + 1}`, `assets/mahjong/tile_bamboo_${i + 1}.png`);
            this.arr_stones.push(`bamboo${i + 1}`);
        }
        for ( let i = 0; i < 9; i++) {
            this.load.image(`circle${i + 1}`, `assets/mahjong/tile_circle_${i + 1}.png`);
            this.arr_stones.push(`circle${i + 1}`);
        }
        for ( let i = 0; i < 4; i++) {
            this.load.image(`flower${i + 1}`, `assets/mahjong/tile_flower_${i + 1}.png`);
            this.arr_stones.push(`flower${i + 1}`);
        }
        for ( let i = 0; i < 5; i++) {
            this.load.image(`symbol${i + 1}`, `assets/mahjong/tile_symbol_${i + 1}.png`);
            this.arr_stones.push(`symbol${i + 1}`);
        }

		this.load.image(`deton_1`, `assets/mahjong/animations/deton_1.png`);

        this.load.image('japan', 'assets/mahjong/japan.png');
        this.load.image('BOMB', 'assets/mahjong/bomb.png');
        this.load.image('LIGHT', 'assets/mahjong/lamp.png');
        this.load.image('SHUFFLE', 'assets/mahjong/shuffle.png');
        this.load.image('FIREWORK', 'assets/mahjong/firework.png');
        this.load.image('point', 'assets/mahjong/point.png');
		this.load.image('particle', 'assets/mahjong/particle.png');

		this.load.image('firework_effect', 'assets/mahjong/firework_effect.png');
		this.load.image('rocket', 'assets/mahjong/rocket.png');
        this.load.image('mini_tile', 'assets/mahjong/mini_tile.png');
        this.load.image('bot_field', 'assets/mahjong/bot_field.png');
        this.load.image('bot_icon', 'assets/mahjong/bot_icon.png');
        this.load.image('bot_name', 'assets/mahjong/bot_name.png');
        this.load.image('dialog', 'assets/mahjong/dialog.png');
        this.load.image('ok', 'assets/mahjong/ok_button.png');
        this.load.image('lamp', 'assets/mahjong/lamp_1.png');
        this.load.image('overlay', 'assets/mahjong/over.png');
        this.load.image('booster_panel', 'assets/mahjong/booster_panel.png');
        this.load.image('booster_overlay', 'assets/mahjong/booster_overlay.png');
		this.load.image('emoji_modal', 'assets/mahjong/emoji_modal.png');
		this.load.image('angry', 'assets/mahjong/angry.png');
		this.load.image('smile', 'assets/mahjong/smile.png');
		this.load.image('lose_button', 'assets/mahjong/lose_button.png');
		this.load.image('win_button', 'assets/mahjong/win_button.png');

        this.load.image('action_1', 'assets/mahjong/action_1.png');
        this.load.image('action_2', 'assets/mahjong/action_2_v2.png');
        this.load.image('action_3', 'assets/mahjong/action_3.png');
        this.load.image('action_4', 'assets/mahjong/action_4.png');
        this.load.image('action_5', 'assets/mahjong/action_5.png');
        this.load.image('action_6', 'assets/mahjong/action_6.png');
        this.load.image('action_7', 'assets/mahjong/action_7.png');
        this.load.image('action_8', 'assets/mahjong/action_8.png');
        this.load.image('action_9', 'assets/mahjong/action_9.png');
        this.load.image('action_10', 'assets/mahjong/action_10.png');
        this.load.image('action_19', 'assets/mahjong/action_19.png');

        this.load.image('banner', 'assets/mahjong/banner.png');
        this.load.image('banner_overlay', 'assets/mahjong/banner_overlay.png');
        this.load.image('bot_overlay', 'assets/mahjong/bot_overlay.png');
        this.load.image('arrow', 'assets/mahjong/arrow.png');
		this.load.image('block', 'assets/mahjong/block.png');

		this.load.atlas('emoji', 'assets/mahjong/emoji.png', 'assets/mahjong/emoji.json');

		this.load.atlas("common1", "assets/common1.png" + '?' + loading_vars['version'], "assets/common1.json" + '?' + loading_vars['version']);
		this.load.atlas("common2", "assets/common2.png" + '?' + loading_vars['version'], "assets/common2.json" + '?' + loading_vars['version']);
		if (loading_vars['net_id'] == 'vk') {
			this.load.image('vk_currency', 'https://serv5.elian-games.com/online_games/match3_online/assets/vk_currency.png')
		}
		else if (loading_vars['net_id'] == 'ok') {
			this.load.image('ok_currency', 'https://serv5.elian-games.com/online_games/match3_online/assets/ok_currency.png')
		}
		if (loading_vars['mobile'] && loading_vars['net_id'] != 'ig') this.load.image('orientation_notifier', 'assets/orientation_notifier.png');
		this.load.scenePlugin('SpinePlugin', "external/SpinePlugin_path_fix.js", 'spine_system', 'spine');
		if (loading_vars['js_combined']) { 
			this.load.script('all', "phaser.min.js" + '?v' + game_data['js_version']);
		}
		else {
			this.load.script('main_game', "js/game.js");
			// this.load.script('config', "js/config.js");
			this.load.script('config_map', "js/config_map.js");
			
			this.load.script('social_api', "js/game_utilities/social_api.js");
			this.load.script('audio_manager', "js/game_utilities/audio_manager.js");
			this.load.script('game_utils', "js/game_utilities/game_utils.js");
			// this.load.script('game_request', "js/game_utilities/game_request.js");
			this.load.script('custom_button', "js/game_utilities/custom_button.js");
			this.load.script('sales_manager', "js/game_utilities/sales_manager.js");
			this.load.script('task_manager', "js/game_utilities/task_manager.js");
			this.load.script('loading_overlay', "js/game_utilities/loading_overlay.js");
			this.load.script('graphics_manager', "js/game_utilities/graphics_manager.js");

			this.load.script('game_play', "js/game_play/game_play.js");
			// this.load.script('competitor', "js/game_play/competitor.js");
			// this.load.script('competitors_panel', "js/game_play/competitors_panel.js");

			this.load.script('bonus_manager', "js/game_play/game_engine/bonus_manager.js");
			this.load.script('boosters_panel', "js/game_play/game_engine/boosters_panel.js");
			this.load.script('booster_item', "js/game_play/game_engine/booster_item.js");
			this.load.script('field_item', "js/game_play/game_engine/field_item.js");
			this.load.script('field_items_manager', "js/game_play/game_engine/field_items_manager.js");
			// this.load.script('game_engine', "js/game_play/game_engine/game_engine.js");
			this.load.script('gem', "js/game_play/game_engine/gem.js");
			this.load.script('gems_manager', "js/game_play/game_engine/gems_manager.js");
			this.load.script('gems_utils', "js/game_play/game_engine/gems_utils.js");
			// this.load.script('playing_field', "js/game_play/game_engine/playing_field.js");
			this.load.script('targets_manager', "js/game_play/game_engine/targets_manager.js");
			this.load.script('tutorial_manager', "js/game_play/game_engine/tutorial_manager.js");

			
			this.load.script('game_map', "js/game_map/game_map.js");
			this.load.script('map_manager', "js/game_map/map_manager.js");
			this.load.script('level_item', "js/game_map/level_item.js");
			this.load.script('rating', "js/game_map/rating.js");
			this.load.script('stand', "js/game_map/stand.js");
			this.load.script('rating_item', "js/game_map/rating_item.js");
			this.load.script('chest_manager', "js/game_map/chest_manager.js");
			this.load.script('notification_manager', "js/game_map/notification_manager.js");
				
			this.load.script('game_windows', "js/game_windows/game_windows.js");
			this.load.script('buy_money', "js/game_windows/buy_money.js");
			this.load.script('buy_money_item', "js/game_windows/buy_money_item.js");
			this.load.script('buy_chest_item', "js/game_windows/buy_chest_item.js");
			this.load.script('options', "js/game_windows/options.js");
			this.load.script('select_language', "js/game_windows/select_language.js");
			this.load.script('competitor_item', "js/game_windows/competitor_item.js");
			this.load.script('wait_competitors', "js/game_windows/wait_competitors.js");
			this.load.script('level_failed', "js/game_windows/level_failed.js");
			this.load.script('level_complete', "js/game_windows/level_complete.js");
			this.load.script('wait_tournament', "js/game_windows/wait_tournament.js");
			this.load.script('no_sales', "js/game_windows/no_sales.js");
			this.load.script('purchase_failed', "js/game_windows/purchase_failed.js");
			this.load.script('quit_yes_no', "js/game_windows/quit_yes_no.js");
			this.load.script('money_box', "js/game_windows/money_box.js");
			this.load.script('rating_bonus', "js/game_windows/rating_bonus.js");
			this.load.script('rating_info', "js/game_windows/rating_info.js");
			this.load.script('no_connection', "js/game_windows/no_connection.js");
			this.load.script('sales', "js/game_windows/sales.js");
			this.load.script('paid_chest_open', "js/game_windows/paid_chest_open.js");
			this.load.script('chest_open', "js/game_windows/chest_open.js");
			this.load.script('chest_wait', "js/game_windows/chest_wait.js");
			this.load.script('boosters_info', "js/game_windows/boosters_info.js");
			this.load.script('user_profile', "js/game_windows/user_profile.js");
			this.load.script('tasks_daily', "js/game_windows/tasks_daily.js");
			this.load.script('task_item', "js/game_windows/task_item.js");
			this.load.script('day_bonus', "js/game_windows/day_bonus.js");
			this.load.script('wait_duel', "js/game_windows/wait_duel.js");
			this.load.script('level_complete_duel', "js/game_windows/level_complete_duel.js");
			this.load.script('challenge_duel', "js/game_windows/challenge_duel.js");
			this.load.script('level_help', "js/game_windows/level_help.js");
			this.load.script('more_games', "js/game_windows/more_games.js");	
			this.load.script('map_prize', "js/game_windows/map_prize.js");
			this.load.script('star_chest', "js/game_windows/star_chest.js");
			this.load.script('free_money', "js/game_windows/free_money.js");
			this.load.script('video_reward', "js/game_windows/video_reward.js");
			this.load.script('social_reward', "js/game_windows/social_reward.js");

			this.load.script('game_tutorial', "js/game_tutorial/game_tutorial.js");	

			this.load.script('mahjong_arrow', 'js/game_play/game_engine/mahjong/tutorial/arrow.js');
			this.load.script('mahjong_dialog', 'js/game_play/game_engine/mahjong/tutorial/dialog.js');
			this.load.script('mahjong_tutor_actions', 'js/game_play/game_engine/mahjong/tutorial/tutor_actions.js');
			this.load.script('mahjong_overlay', 'js/game_play/game_engine/mahjong/tutorial/overlay.js');

			this.load.script('mahjong_tile', 'js/game_play/game_engine/mahjong/game_engine/tile.js');
			this.load.script('mahjong_playing_field', 'js/game_play/game_engine/mahjong/game_engine/playing_field.js');
			this.load.script('mahjong_game_events', 'js/game_play/game_engine/mahjong/game_engine/game_events.js');
			this.load.script('mahjong_player_display', 'js/game_play/game_engine/mahjong/game_engine/player_display.js');
			this.load.script('mahjong_game_engine', 'js/game_play/game_engine/mahjong/game_engine/game_engine.js');
			this.load.script('mahjong_bots', 'js/game_play/game_engine/mahjong/game_engine/bots.js');
			this.load.script('mahjong_bot_playing_field', 'js/game_play/game_engine/mahjong/game_engine/bot_playing_field.js');
			this.load.script('mahjong_bot_events', 'js/game_play/game_engine/mahjong/game_engine/bot_events.js');
			this.load.script('mahjong_bot_display', 'js/game_play/game_engine/mahjong/game_engine/bot_display.js');
			this.load.script('mahjong_booster_start_events', 'js/game_play/game_engine/mahjong/game_engine/booster_start_events.js');
			// this.load.script('mahjong_boosters_panel', 'js/game_play/game_engine/mahjong/game_engine/boosters_panel.js');
			// this.load.script('mahjong_booster_item', 'js/game_play/game_engine/mahjong/game_engine/booster_item.js');
			this.load.script('mahjong_booster_effect_events', 'js/game_play/game_engine/mahjong/game_engine/booster_effect_events.js');
			this.load.script('mohjong_emoji_modal', 'js/game_play/game_engine/mahjong/game_engine/emoji_modal.js')
					
		}

		this.load.xml('levels_xml', 'assets/xml/levels_m3.xml' + '?' + loading_vars['version']);
		this.load.xml('language_xml', 'assets/xml/language.xml' + '?' + loading_vars['version']);
		this.load.xml('tutorial_xml', 'assets/xml/tutorial.xml' + '?' + loading_vars['version']);
		this.load.xml('tournaments_xml', 'assets/xml/tournaments.xml' + '?' + loading_vars['version']);

		for(i = 0; i < 11; i++) {
			this.load.json(`level_${i}`, `assets/levels/level_${i}.json`);
		}

		game_data['arr_stones'] = this.arr_stones;
		

		var key = 'game_play_bg1';
		var no = parseInt(Math.random() * 50) + 1;
		var path_part = 'assets/bgs/bg' + String(no) + '.jpg';
		this.load.image(key, path_part);
		this.load.on('progress', function (value) {
			_this.set_loading_progress(Math.floor(value * 100));	
			if (Math.round(value * 100) == 100)
				_this.load.off('progress');	
		});
		this.load.once('complete', function() {						
			files_preloaded = true;
			
			_this.create_game();
		});		
		this.load.start();	
	}
	
	set_loading_progress(val) {
		if (loading_vars['net_id'] == 'ig') {
			FBInstant.setLoadingProgress(val);			
		}
		else {
			if (this.load_progress_cont) {
				this.load_progress_txt.text = String(val) + '%';
				this.load_progress_bar.scaleX = val / 100;
			}
			else {
				this.load_progress_cont = new Phaser.GameObjects.Container(this, loading_vars['W']/2, loading_vars['H']/2);
				this.add.existing(this.load_progress_cont);
				this.load_progress_txt = new Phaser.GameObjects.Text(this, 0, -25, String(val) + '%', {fontFamily:"font1", fontSize: 40, color:"#f4ec60", stroke: '#07404e', strokeThickness: 3});
				this.load_progress_txt.setOrigin(0.5);
				this.load_progress_cont.add(this.load_progress_txt);
				this.load_progress_bar = new Phaser.GameObjects.Image(this, 0, 19, 'preload_bar');
				this.load_progress_bg = new Phaser.GameObjects.Image(this, 0, 20, 'preload_bg');
				this.load_progress_bg2 = new Phaser.GameObjects.Image(this, 0, 20, 'preload_bg2');
				this.load_progress_bar.setOrigin(0, 0.5);
				this.load_progress_bar.x = -this.load_progress_bg.width / 2 + 5;
				this.load_progress_bar.scaleX = 0.01;
				this.load_progress_cont.add(this.load_progress_bg);
				this.load_progress_cont.add(this.load_progress_bar);
				this.load_progress_cont.add(this.load_progress_bg2);
			}
		}
	}

	create_game() {	
		game_data['in_app_items'] = null;      
		game_data['error_history'] = [];
		game_data['friends'] = [];
		game_data['scene'] = this;
		if (temp_users_info) game_data['users_info'][loading_vars['user_id']] = temp_users_info;
		if (temp_game_data) {
			update_object(game_data, temp_game_data);
			temp_game_data = null;
		}
		if (temp_user_data) {
			update_object(game_data['user_data'], temp_user_data);
			temp_user_data = null;
		}
		update_object(game_data['urls'], loading_vars['urls']);
		game_request.init();
		if (loading_vars['new_user']) game_request.update_stat({'funnel': true, 'sub_action': 2, 'description': 'preload_finish'});
		game = new Game(this);	
		game.prepare_game();				
	}
	
	update(){
		if (game) game.update();
	}
}

function update_object(obj1, obj2) {
	for (var prop in obj2) {
		obj1[prop] = obj2[prop];			  
	}		
}

function delayed_ig_user_info(on_complete = null) {
	let missed_data = !loading_vars['user_id'] || !temp_users_info['first_name'] || !temp_users_info['photo_url'];
	if (missed_data) {
		setTimeout(() => {
			var playerName = FBInstant.player.getName();
			var playerPic = FBInstant.player.getPhoto();
			var playerId = FBInstant.player.getID();
			loading_vars['locale'] = FBInstant.getLocale();
			if (!loading_vars['user_id'] && playerId) loading_vars['user_id'] = playerId;
			temp_users_info = {'first_name': playerName, 'photo_url': playerPic};
			if (game_request && game_request.game_data_exists && loading_vars['user_id'])
				game_data['users_info'][loading_vars['user_id']] = temp_users_info;
			if (loading_vars['user_id'] && on_complete) on_complete();
		}, 1000);
	}
	else if (loading_vars['user_id'] && on_complete) on_complete();
}

function initialize(on_complete) {
	if (loading_vars['net_id'] == 'ig') {
		allow_rewarded_ads = true;	
		allow_intersitial_ads = true
	FBInstant.initializeAsync().then(function() {
			loading_vars['platform'] = FBInstant.getPlatform().toUpperCase();
			allow_more_games = loading_vars['platform'] != 'IOS';			
			var playerName = FBInstant.player.getName();
			var playerPic = FBInstant.player.getPhoto();
			var playerId = FBInstant.player.getID();
			loading_vars['locale'] = FBInstant.getLocale();
			loading_vars['user_id']	= playerId;
			temp_users_info = {'first_name': playerName, 'photo_url': playerPic};
			FBInstant.player.canSubscribeBotAsync().then(function (can_subscribe) {
				canSubscribeBot = can_subscribe;
			});
			if (playerId) {
				delayed_ig_user_info();
				on_complete();
			}
			else FBInstant.player.getSignedPlayerInfoAsync('alter_user_id')
				.then(function(result) {
					let playerId2 = result.getPlayerID();
					loading_vars['user_id'] = playerId2;
					if (playerId2) {
						delayed_ig_user_info();
						on_complete();
					}
					else delayed_ig_user_info(on_complete);
				})
			// on_complete();
		});	
	}
	else if (loading_vars['net_id'] == 'fb') {
		FB.init({
			appId      : loading_vars['app_id'], 
			autoLogAppEvents : true,
			xfbml   : true,
			version : 'v3.3'
		});	
		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));		
		FB.getLoginStatus(function(response) {
			if (response.status == 'connected') {		
				fb_get_user_id(response, on_complete);
			} else {			 			
				FB.login(function(response) {	
					fb_get_user_id(response, on_complete);
				}, {scope: 'email'});
			}		  
		});
	}
	else if (loading_vars['net_id'] == 'ok') {
		// allow_rewarded_ads = true;	
		allow_intersitial_ads = true;
		loading_vars['user_id'] = loading_vars['logged_user_id'];
		var rParams = FAPI.Util.getRequestParameters();			
		FAPI.init(rParams["api_server"], rParams["apiconnection"],
			function() {	
			}
		);	
		on_complete();
	}
	else if (loading_vars['net_id'] == 'vk') {
		allow_rewarded_ads = true;	
		allow_intersitial_ads = true;
		var user_id = loading_vars['viewer_id'];			
		loading_vars['user_id'] = user_id;
		on_complete();
	}
	else {
		loading_vars['user_id']	= '0';
		allow_rewarded_ads = true;	
		on_complete();
	}
}

function fb_get_user_id(response, on_complete) {
	if (response.status == 'connected') {
		FB.api('/me?fields=id,locale,gender,first_name,last_name,link,picture.width(120).height(120)', function(response) {
			document.getElementById("user_id").innerHTML = "user ID: ".concat(response.id); 		
			var user_id = response['id'];
			loading_vars['user_id'] = user_id;	
			temp_users_info = 	{'first_name': response['first_name'], 'photo_url': response['picture']['data']['url']};
			on_complete();
		});
	}
}

function get_game_config() {
	loading_vars['default_W'] = parseInt(loading_vars['W']);
	loading_vars['default_H'] = parseInt(loading_vars['H']);
	loading_vars['extra_W'] = 0;
	loading_vars['extra_H'] = 0;

	var base_ratio = loading_vars['W'] / loading_vars['H'];
	var def_w = parseInt(loading_vars['W']);
	var def_h = parseInt(loading_vars['H']);
	var ratio = window.innerWidth / window.innerHeight;
	if (loading_vars['mobile'] && window.innerWidth < window.innerHeight)
		ratio = window.innerHeight / window.innerWidth;
	//ratio = 2.2
	//console.log('qq0', ratio, base_ratio, window.innerWidth, window.innerHeight)
	if (is_localhost || loading_vars['net_id'] != 'ig') ratio = base_ratio;
	if (loading_vars['W'] < loading_vars['H'] * ratio) {
		loading_vars['W'] = parseInt(loading_vars['H'] * ratio);
		loading_vars['extra_W'] = loading_vars['W'] - def_w;
		loading_vars['extra_H'] = loading_vars['H'] - def_h;
	}

	var mobile_device = loading_vars['mobile'] || 
				loading_vars['net_id'] == 'ig' || 
				loading_vars['net_id'] == 'android' || 
				loading_vars['net_id'] == 'ios';
	
	var config = {
		type: Phaser.WEBGL,
		//dom: {createContainer: true},
		parent: 'phaser_game',
		width: loading_vars['W'],
		height: loading_vars['H'],
		backgroundColor: 0x000000,
		// autoRound: false,
		render: {
			antialiasGL: false, // +
			clearBeforeRender: false // ?
		}
	};
	if (mobile_device) {
		config['scale'] = {mode: Phaser.Scale.FIT};
		//if (loading_vars['net_id'] == 'vk') config['autoCenter'] = Phaser.Scale.CENTER_HORIZONTALLY;
	}
	else {
		config['autoCenter'] = Phaser.Scale.CENTER_HORIZONTALLY;
		config['fullscreenTarget'] = 'phaser_game';
	}
	return config;	
}

function get_game_info(on_complete) {	
	var game_id = loading_vars['game_id'];	
	if ('use_server' in loading_vars && loading_vars['use_server']) {
		var obj = {'get_game_info': true};
		var data = { 
			//'session_id': loading_vars['session_id'],
			'game_id': loading_vars['game_id'],
			'user_id': loading_vars['user_id'],
			'net_id': loading_vars['net_id'],
			'time': 0,
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
	else {	
		on_complete({'session_id': 0, 
					 'statistics_active': false, 
					 'day_id': 2, 
					 'game_id': game_id, 
					 'user_id': loading_vars['user_id'],
					 'ads': {'interstitial': '-', 'rewarded': '-'},
					 });
			
	}
}

function get_passed_amount() {
	var levels_passed = null;
	if (files_preloaded && game_data && game_data['user_data'] && game_data['user_data']['levels_passed'])
		levels_passed = game_data['user_data']['levels_passed'].length;

	return levels_passed;
}

function update_stat_init(action_id) {
	if (loading_vars['statistics_active']) {
		var time_diff = new Date().getTime() - loading_vars['start_time'];
		var stat_obj = {
			'net_id': loading_vars['net_id'],
			'action_id': action_id,						
			'user_id': loading_vars['user_id'],
			'session_id': loading_vars['session_id'],
			'day_id': loading_vars['day_id'],	
			'sub_action': 0,
			'time': parseInt(time_diff / 1000), 
			'time_full': time_diff, 
			'amount_inc': 0,
			'amount_dec': 0,
			'description': '',
			'mobile': (loading_vars['mobile'] || loading_vars['net_id'] == 'ig') ? 1 : 0,
			'level': 0,
			'passed': 0,
			'money': -1,
			'stars': 0,
			'new_user': 0,
			'info': '-'	
		}
		if (is_localhost) {
			//console.log('update_stat', JSON.stringify(stat_obj))
		}
		else {
			$.ajax({
				type: 'post',
				url: loading_vars['urls']['statistics'],
				data: { 'data': JSON.stringify(stat_obj)
				}
			});	
		}
	}											
}