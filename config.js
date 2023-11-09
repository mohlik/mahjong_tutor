
var game_data = {
	'game_id_short': 'MO',
	'tutorial_mark': -1,	
	'test_util': false,
	'generate_levels': {
		'active': false,
		'start': 1001,
		'id_start': 37,
		'end': 1600
	},
	'tournament_start_reward': 100, 
	'wall_post_reward': 100,
	'wall_post_settings': {
		'share_active': true,
		'forced_share': false,
		'day_delay': 9,
		'rnd': 0.4,
		'prefix': 'wall_post',
		'suffix': '.jpg',
		'total_images': 3,
	},
	'tournament_settings': {
		'day_delay': 8,
		'rnd': 0.4,
		'share_delay': 3,
	},
	'current_tournament': null,
	'users_photo_settings': {'size': 80, 'send_days_frequency': 14},
	'langs': ['en', 'ru', 'fr', 'de'],
	'app_id': '934473896605902',
	'ads': {'interstitial': {'code': '249052343092914_278677290130419',
		'event_mult': {'level_lost': 1, 'level_win': 0.3},
		'probabilities': [
			{'level_id': 0, 'normal': 0, 'insolvent': 0},
			{'level_id': 10, 'normal': 0, 'insolvent': 20},
			{'level_id': 20, 'normal': 10, 'insolvent': 40},
			{'level_id': 30, 'normal': 30, 'insolvent': 50},
			{'level_id': 50, 'normal': 50, 'insolvent': 60},
			{'level_id': 100, 'normal': 70, 'insolvent': 70},
		],
		'available': true
		}, 
		'rewarded': {'code': '249052343092914_278678090130339', 'available': true}
	},
	'ads_settings': {
		'interstitial':{
			'start_level': 150,
			'start_level_ios': 10,
			'probabilities': {'level_lost': 90,'level_win': 70},
		}
	},
	'inapp_payments': true,
	'allow_star_chest': true,
	'allow_map_prize': true,
	'interstitial_ads_active': false,
	'statistics_active': false,
	'show_sale': true,
	'share_active': true,
	'urls': {
		'audio': 'assets/audio/',
		'xml': 'assets/xml/',
		'maps': 'assets/maps/',		
		'assets': 'assets/'
	},	
	'tasks_active': true,
	'tasks_settings': {'daily_reward': 'chest_1', 'default_skip_cost': 100},
	
	'dim': {
		'photo': 70,
		'landscape': {'fieldW': 550, 'fieldH': 520},
		'portrait': {'fieldW': 720, 'fieldH': 720},
		'item_width': 88, 'item_height': 88,
	},
	
	'fill_rate_default': 0.5,
	'hint_delay': 6000,
	'boosters': {
		'booster1': {'price': 30, 'level_id': 0},
		'booster2': {'price': 25, 'level_id': 1},
		'booster3': {'price': 20, 'level_id': 0},
		'booster4': {'price': 75, 'level_id': 2},
		'booster5': {'price': 100, 'level_id': 0},
		'booster6': {'price': 75, 'level_id': 3},
		// 'rocket':	{'price': 25, 'level_id': 1}, 
		// 'plane':	{'price': 35, 'level_id': 3}, 
		// 'bomb':	{'price': 40, 'level_id': 2}, 
		// 'sphere':	{'price': 50, 'level_id': 4}, 
	},
	// 'boosters': {
	// 	'hammer': {'price': 2000, 'level_id': 10},
	// 	'broom': {'price': 1500, 'level_id': 22,},
	// 	'magnet': {'price': 4000, 'level_id': 25},
	// 	'cross': {'price': 3000, 'level_id': 37},
	// 	'extra_moves':	{ 'amount': 5, 'level_id': 0, 'price': 1500 }, //add
	// 	'rocket':	{'price': 2000, 'level_id': 1}, 
	// 	'plane':	{'price': 2000, 'level_id': 3}, 
	// 	'bomb':	{'price': 2500, 'level_id': 2}, 
	// 	'sphere':	{'price': 3500, 'level_id': 4}, 
	// 	'level_start': {'price': 1000, 'level_id': 0},
	// },
	//'money_gems': {'timeout': 5, 'frequency': 30, 'start_level': 8, 'value': 5},
	'marked_gems_frequency': {
		'1': 5,
		'2': 7
	},
	'engine_config': {
		'square': false
	},

	'day_bonus': { //renew
		'1': {'type': 'money', 'amount' : 5}, 
		'2': {'type': 'money', 'amount' : 10}, 
		'3': {'type': 'money', 'amount' : 15}, 
		'4': {'type': 'money', 'amount' : 20}, 
		'5': {'type': 'money', 'amount' : 25},  
		'6': {'type': 'money', 'amount' : 30},  
		'7': {'type': 'money', 'amount' : 40},  
	},
	
	'gift_friend_prize': 25,
	'wait_before_start': 900,
	'tournament_price': 50, //renew

	'money_box': {  //renew
		'capacity': 500
	},
	'loaded_anims': {},

	'level_coins': { 'amount': 2, 'free_amount': 1, 'frequency': 50, 'start_level': 8, 'timeout': 5000},	  //renew
	
	'score': {				
		'normal': [10,15,20,25,30],
		'move': 130,
		'stars_coef': [40, 85, 115]
	},

	'chest': {
		'open_price': 50, 'max': 4,
		'timeout': {'0': 2, '1': 30, '2': 300, '3': 600, '4': 1200, '5': 2400, '6': 3600, '7': 7200, 'default': 14400},
		'level_prize': [
			{'booster1': 1, 'booster2': 1},
			{'money': 10, 'rating_score': 120},
			{'booster1': 1, 'booster4': 1},
			{'money': 20, 'booster1': 1},
			{'money': 25, 'booster5': 1}
		],
		'prize': {
			'progress': [
				{'type': '1', 'level_id': 0},
				{'type': '2', 'level_id': 20},
				{'type': '3', 'level_id': 40},
				{'type': '4', 'level_id': 100}
			],
			'1':[
				{'booster1': 1, 'rating_score': 100},
				{'money': 10, 'rating_score': 200}
			],
			'2':[
				{'booster1': 1, 'booster4': 1},
				{'money': 5, 'rating_score': 275},
				{'booster6': 1, 'booster1': 1},
			],
			'3':[
				{'booster5': 1, 'booster6': 1},
				{'booster4': 1, 'booster1': 1},
				{'booster6': 1, 'booster1': 1},
				{'money': 20, 'rating_score': 375},
			],
			'4':[
				{'booster5': 1, 'booster6': 2},
				{'booster4': 1, 'booster1': 2},
				{'booster6': 1, 'booster1': 2},
				{'booster5': 2, 'booster1': 1},
				{'money': 35, 'rating_score': 475},
			],
		}
	},

	'map_prizes': { //renew
		'levels_period': 20,
		'super_prize_index': 2,
		'levels': [0,5,10,15],
		'prizes': {
			'predefined': [
				{'type': 'money', 'amount': 50},
				{'type': 'booster1', 'amount': 2},
				{'type': 'booster2', 'amount': 5},
				{'type': 'money', 'amount': 70},
				{'type': 'booster4', 'amount': 1},
			],//300 at lvl 25.
			'common': [ //renew
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 30},
				{'type': 'money', 'amount': 35},
				{'type': 'money', 'amount': 40},
				{'type': 'money', 'amount': 50},
				{'type': 'money', 'amount': 75},
				{'type': 'money', 'amount': 100},
				{'type': 'booster1', 'amount': 1},
				{'type': 'booster1', 'amount': 2},
				{'type': 'booster1', 'amount': 3},
				{'type': 'booster2', 'amount': 1},
				{'type': 'booster2', 'amount': 2},
				{'type': 'booster4', 'amount': 1},
				{'type': 'booster5', 'amount': 1},
				{'type': 'booster6', 'amount': 1},
				
			]//1100/31 = 35 money avg
		},
	},

	'star_chest': { //renew
		'start_level': 3,
		'stars_amount': [10,15,20],
		'predefined_chests_amount': 2,
		'prizes': {
			'predefined': [
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 30},
				{'type': 'money', 'amount': 35},
				{'type': 'money', 'amount': 40},
				{'type': 'money', 'amount': 45},
				{'type': 'money', 'amount': 50},
				{'type': 'booster1', 'amount': 1},
				{'type': 'booster1', 'amount': 2},
				{'type': 'booster1', 'amount': 3},
				{'type': 'booster2', 'amount': 1},
				{'type': 'booster2', 'amount': 2},
				{'type': 'booster4', 'amount': 1},
				{'type': 'booster6', 'amount': 1},
			], //avg 38*3 = 114 (2 chests at 20 lvl = 228)
			'common': [ //renew
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 10},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 15},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 20},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 25},
				{'type': 'money', 'amount': 30},
				{'type': 'money', 'amount': 30},
				{'type': 'money', 'amount': 40},
				{'type': 'money', 'amount': 50},
				{'type': 'money', 'amount': 75},
				{'type': 'money', 'amount': 100},
				{'type': 'booster1', 'amount': 1},
				{'type': 'booster1', 'amount': 2},
				{'type': 'booster2', 'amount': 1},
				{'type': 'booster2', 'amount': 2},
				{'type': 'booster4', 'amount': 1},
				{'type': 'booster5', 'amount': 1},
				{'type': 'booster5', 'amount': 1},
				{'type': 'booster6', 'amount': 1},
			], // 1210/37= 33*3 = 99 
		}
	},

	'paid_chest_prize': { //renew
		'chest_1': {'money': {'min': 100, 'max': 150}, //300-350 money
					'rating_score': {'min': 30, 'max': 75},
					'booster1': {'min': 3, 'max': 5},
					'booster2': {'min': 2, 'max': 4},
		},
		'chest_2': {'money': {'min': 300, 'max': 500}, //1100 money
					'rating_score': {'min': 75, 'max': 125},
					'booster4': {'min': 3, 'max': 5},
					'booster6': {'min': 3, 'max': 5},
		},
		'chest_3': {'money': {'min': 500, 'max': 700}, // 1800 money
					'rating_score': {'min': 125, 'max': 200},
					'booster1': {'min': 10, 'max': 20},
					'booster4': {'min': 8, 'max': 12},
		},
		'chest_4': {'money': {'min': 1000, 'max': 1400}, //3800
					'rating_score': {'min': 200, 'max': 250},
					'booster1': {'min': 15, 'max': 25},
					'booster6': {'min': 15, 'max': 25}, 
		},
		'sale_chest_1': { //400*13=5200 //upd
			'booster1': {'min': 11, 'max': 15},
			'booster2': {'min': 11, 'max': 15},
			'money': {'min': 600, 'max': 800}, 
			'booster6': {'min': 11, 'max': 15},
		},
		'sale_chest_2': { //2600	//upd
			'rating_score': {'min': 150, 'max': 200},
			'money': {'min': 700, 'max': 900},
			'booster4': {'min': 3, 'max': 7}, 
			'booster1': {'min': 8, 'max': 12},
		},
	},
	'shop': [			  //renew		
		{'item_id': 'chest_1', 'chest_id': 'chest_1', 'type': 'chest', 'amount': 1, 'category': 'shop', 'price': 2.99, 'game_mode': 'purchases_only'},
		{'item_id': 'chest_2', 'chest_id': 'chest_2', 'type': 'chest', 'amount': 1, 'category': 'shop', 'price': 8.99, 'game_mode': 'purchases_only'},
		{'item_id': 'chest_3', 'chest_id': 'chest_3', 'type': 'chest', 'amount': 1, 'category': 'shop', 'price': 14.99, 'game_mode': 'purchases_only'},
		{'item_id': 'chest_4', 'chest_id': 'chest_4', 'type': 'chest', 'amount': 1, 'category': 'shop', 'price': 29.99, 'game_mode': 'purchases_only'},

		{'item_id': 'money_1', 'type': 'money', 'amount': 100, 'category': 'shop', 'price': 0.99, 'game_mode': 'purchases_only'}, //25
		{'item_id': 'money_2', 'type': 'money', 'amount': 350, 'category': 'shop', 'price': 2.99, 'game_mode': 'purchases_only'},
		{'item_id': 'money_3', 'type': 'money', 'amount': 1200, 'category': 'shop', 'price': 9.99, 'game_mode': 'purchases_only'},
		{'item_id': 'money_4', 'type': 'money', 'amount': 8000, 'category': 'shop', 'price': 49.99, 'game_mode': 'purchases_only'},
		
		{'item_id': 'money_box', 'type': 'money_box', 'amount': 1, 'category': 'money_box', 'price': 2.99},

		// {'item_id': 'sale_no_purchases', 'sale_id': 'sale_no_purchases', 'type': 'money', 'amount': [200,300,400], 'category': 'sale', 'price': 0.99},
		// {'item_id': 'sale_one_purchase', 'sale_id': 'sale_one_purchase', 'type': 'money', 'amount': [450,525,600], 'category': 'sale', 'price': 2.99},
		// {'item_id': 'sale_multiple_purchases', 'sale_id': 'sale_multiple_purchases', 'type': 'money', 'amount': [780,840,900], 'category': 'sale', 'price': 5.99},
		// {'item_id': 'sale_pack', 'sale_id': 'sale_pack', 'type': 'pack', 'amount': [
		// 	{'booster1': 5, 'booster2': 5, 'booster6': 5},
		// 	{'booster1': 6, 'booster2': 6, 'booster6': 5},
		// 	{'booster1': 6, 'booster2': 6, 'booster6': 6}
		// ], 'category': 'sale', 'price': 5.99},
		{ 'item_id': 'sale_starter_pack', 'sale_id': 'sale_starter_pack', 'type': 'pack', 'amount': { 'money': 200, 'booster1': 10, 'booster4': 10, 'booster6': 10 }, 'price': 1.99 },
		{ 'item_id': 'sale_winner_pack', 'sale_id': 'sale_winner_pack', 'type': 'pack', 'amount': { 'money': 600, 'booster1': 15, 'booster4': 15, 'booster6': 15 }, 'price': 19.99 },
		{ 'item_id': 'sale_game_play_pack', 'sale_id': 'sale_game_play_pack', 'type': 'pack', 'amount': { 'booster1': 15, 'booster2': 15, 'booster4': 15, 'booster6': 15 }, 'price': 18.99 },
		{ 'item_id': 'sale_hammer_pack', 'sale_id': 'sale_hammer_pack', 'type': 'pack', 'amount': { 'money': 400, 'booster1': 25,  }, 'price': 6.99 },
		{ 'item_id': 'sale_magnet_pack', 'sale_id': 'sale_magnet_pack', 'type': 'pack', 'amount': { 'money': 400, 'booster4': 25,  }, 'price': 13.99 },
		{ 'item_id': 'sale_cross_pack', 'sale_id': 'sale_cross_pack', 'type': 'pack', 'amount': { 'money': 400, 'booster6': 25,  }, 'price': 13.99 },
		{ 'item_id': 'sale_looser_pack', 'sale_id': 'sale_looser_pack', 'type': 'pack', 'amount': { 'money': 500, 'booster1': 8, 'booster2': 8, 'booster4': 8 }, 'price': 5.99 },
		{ 'item_id': 'sale_short_hammer_pack', 'sale_id': 'sale_short_hammer_pack', 'type': 'pack', 'amount': { 'money': 300, 'booster1': 10 }, 'price': 2.99 },
		{'item_id': 'sale_chest_1', 'sale_id': 'sale_chest_1', 'chest_id': 'sale_chest_1', 'type': 'chest', 'amount': 1, 'price': 15.99},
		{'item_id': 'sale_chest_2', 'sale_id': 'sale_chest_2', 'chest_id': 'sale_chest_2', 'type': 'chest', 'amount': 1, 'price': 10.99},
	],	

	'sales': {
		'suspend_days': {'short': 1, 'long': 3},
		'short_sales': [
			{'sale_id': 'sale_chest_1', 'start_level': 45, 'timeout': 43200, 'chance': 0.2, 'discount': 30, 'condition': {'no_boosters': ['booster1', 'booster2', 'booster6']}},
			{ 'sale_id': 'sale_looser_pack', 'start_level': 30, 'timeout': 10800, 'chance': 0.95, 'discount': 60, 'condition': { 'fails': 5 } },
			{ 'sale_id': 'sale_short_hammer_pack', 'start_level': 30, 'timeout': 10800, 'chance': 0.1, 'discount': 50, 'condition': { 'no_boosters': ['booster1'] } },

		],
		'long_sales': [
			{ 'sale_id': 'sale_starter_pack', 'start_level': 25, 'timeout': 259200, 'chance': 0.9, 'discount': 300, 'condition': { 'no_payments': true } },
			{ 'sale_id': 'sale_winner_pack', 'start_level': 90, 'timeout': 172800, 'chance': 0.1, 'discount': 40 },
			{ 'sale_id': 'sale_game_play_pack', 'start_level': 45, 'timeout': 86400, 'chance': 0.1, 'discount': 40, 'condition': { 'no_boosters': ['booster1', 'booster2', 'booster4', 'booster6'] } },
			{ 'sale_id': 'sale_magnet_pack', 'start_level': 35, 'timeout': 86400, 'chance': 0.1, 'discount': 40, 'condition': { 'no_boosters': ['booster4'] } },
			{ 'sale_id': 'sale_cross_pack', 'start_level': 35, 'timeout': 86400, 'chance': 0.1, 'discount': 40, 'condition': { 'no_boosters': ['booster6'] } },
			{ 'sale_id': 'sale_hammer_pack', 'start_level': 35, 'timeout': 86400, 'chance': 0.1, 'discount': 40, 'condition': { 'no_boosters': ['booster1'] } },
			{'sale_id': 'sale_chest_2', 'start_level': 30, 'timeout': 172800, 'chance': 1, 'discount': 30, 'condition':{'rating_knockout': true}},
		]
	},


	'wall_post_vk': {
		'day_bonus': {'id': 'photo-165070377_456239035','text': 'Я только что собрал свой ежедневный бонус! https://vk.com/app4739676'},
		'money_box': {'id': 'photo-165070377_456239036','text': 'В разбитой копилке меня ждала невероятная награда! https://vk.com/app4739676'},
		'rating_day': {'id': 'photo-165070377_456239037','text': 'По результатам дневного рейтинга я получил награду! https://vk.com/app4739676'},
		'rating_week': {'id': 'photo-165070377_456239038','text': 'По результатам недельного рейтинга я получил награду! https://vk.com/app4739676'},
		'win': {'id': 'photo-165070377_456239040','text': 'Мне удалось завершить еще один уровень! Но сколько еще впереди! https://vk.com/app4739676'},
		'win_3star': {'id': 'photo-165070377_456239041','text': 'Мне удалось завершить уровень с максимальным результатом! https://vk.com/app4739676'},
	},
	'tasks_start_level': 8,

	// 'sales': {
	// 	'start_level': 25,
	// 	'probabilities': {
	// 		'game_loaded': 0,
	// 		'level_lost': 40,
	// 		'level_win': 20,
	// 		'close_shop': 30,
	// 		'click': 100,
	// 		'zero': 0
	// 	},
	// 	'type_probabilities': {'boosters': 30, 'money': 70},

	// 	'no_purchases': {'sale_id': 'sale_no_purchases','discount': [100,200,300]},
	// 	'one_purchase': {'sale_id': 'sale_one_purchase','discount': [50,75,100]},
	// 	'multiple_purchases': {'sale_id': 'sale_multiple_purchases','discount': [30,40,50]},
	// 	'boosters': {'sale_id': 'sale_pack','discount': [30,40,50]},
			
	// },
	
	'music_tracks': ['music1', 'music2', 'music3', 'music4', 'music5', 'music6', 'music7', 'music8'],
	'week_end_time': 360000,
	'day_end_time': 86000,
	'rating_gift_scales': {
		'day': [
			{'from': 1, 'to': 1, 'amount': 1000},
			{'from': 2, 'to': 2, 'amount': 800},
			{'from': 3, 'to': 3, 'amount': 500},
			{'from': 4, 'to': 10, 'amount': 200},
			{'from': 11, 'to': 20, 'amount': 180},
			{'from': 21, 'to': 30, 'amount': 160},
			{'from': 31, 'to': 40, 'amount': 140},
			{'from': 41, 'to': 50, 'amount': 120},
			{'from': 51, 'to': 60, 'amount': 100},
			{'from': 61, 'to': 70, 'amount': 80},
			{'from': 71, 'to': 80, 'amount': 60},
			{'from': 81, 'to': 90, 'amount': 40},
			{'from': 91, 'to': 100, 'amount': 20}
		],
		'week': [
			{'from': 1, 'to': 1, 'amount': 5000},
			{'from': 2, 'to': 2, 'amount': 4000},
			{'from': 3, 'to': 3, 'amount': 2500},
			{'from': 4, 'to': 10, 'amount': 1000},
			{'from': 11, 'to': 20, 'amount': 900},
			{'from': 21, 'to': 30, 'amount': 800},
			{'from': 31, 'to': 40, 'amount': 700},
			{'from': 41, 'to': 50, 'amount': 600},
			{'from': 51, 'to': 60, 'amount': 500},
			{'from': 61, 'to': 70, 'amount': 400},
			{'from': 71, 'to': 80, 'amount': 300},
			{'from': 81, 'to': 90, 'amount': 200},
			{'from': 91, 'to': 100, 'amount': 100}
		]
	},
	'tutorial': {
		'map1': [
			{'type': 'level', 'display_id': 'text', 'info': 0, 'text': {'ind': 0, 'x': 680, 'y': 320,"bg_height": 150}, "text2":{"ind": 1} },
		],
		'map2': [
			{'type': 'chest', 'text': {'ind': 0, 'x':680, 'y': 320} },
			{'type': 'chest', 'text': {'ind': 1, 'x':680, 'y': 320} },
		],
		'map3': [
			{'type': 'info', "passive": true, 'text': {'ind': 0, 'x':680, 'y': 320, "bg_height": 250} },
			{'type': 'rating', "passive": true, 'text': {'ind': 1, 'x':680, 'y': 320, "bg_height": 200} },
		],
		'tasks': [
			{'type': 'tasks',  'text': {'ind': 0, 'x':680, 'y': 320,"bg_height": 180} }, //'passive': true,
		],
		'5': [
			{'type': 'info',  "passive": true,  'alpha': 1, 'text': {'ind': 0, 'x':680, 'y': 100,"bg_height": 180} }
		]
		
	},
	'golden_tiles_mod':4,
	'golden_tiles_duel_mod': 2,
	'golden_tiles_replay_mod':10,
	'graphics': {},
	/*'more_games': [
		{'game_id': 'confession', 'app_id': '123456789', 'app_url': 'https://www.google.com', 'banner_url': {'en': 'url1', 'ru': 'url2'}},
		{'game_id': 'confession', 'app_id': '123456789', 'app_url': 'https://www.google.com', 'banner_url': {'en': 'url1', 'ru': 'url2'}},
		{'game_id': 'confession', 'app_id': '123456789', 'app_url': 'https://www.google.com', 'banner_url': {'en': 'url1', 'ru': 'url2'}},
		{'game_id': 'confession', 'app_id': '123456789', 'app_url': 'https://www.google.com', 'banner_url': {'en': 'url1', 'ru': 'url2'}},
	],*/
	'more_games_settings': {
		'allow_popup': true,
		'start_level': 10,
		'chance': 0.01
	},
	'rewarded_video_settings': { //renew
		'max_per_day': 5,
		'prize': {
			'common': {'type': 'money', 'amount': [75,50,40,30,25,25,25,20,20,20,20,20,15,15,15,15,15,15,15,15,15,15,10,10]},
			'special': {'type': 'booster1', 'amount': 1}
		}
	},
	'day_id': 1,
	'week_id': 20,
	'rating_end_time': 100000,
	'rating_settings': {
		'prizes':[
			{'from': 1, 'to': 1, 'amount': 200},
			{'from': 2, 'to': 2, 'amount': 180},
			{'from': 3, 'to': 3, 'amount': 150},
			{'from': 4, 'to': 10, 'amount': 120},
			{'from': 11, 'to': 20, 'amount': 100},
			{'from': 21, 'to': 30, 'amount': 50},
			{'from': 31, 'to': 40, 'amount': 25},
			{'from': 41, 'to': 50, 'amount': 10},
		],
		'leagues': {
			'wood': { 
				'promotion_rank': 15, 'knockout_rank': 50, 'order': 0,
				'rating_prize_coef' : 1
			},
			'bronze': { 'promotion_rank': 12, 'knockout_rank': 40, 'order': 1,
				'rating_prize_coef' : 2,
			},
			'silver': { 'promotion_rank': 8, 'knockout_rank': 35, 'order': 2,
				'rating_prize_coef' : 3,
			},
			'gold': { 'promotion_rank': 5, 'knockout_rank': 30, 'order': 3,
				'rating_prize_coef' : 4,
			},
			'diamond': { 'promotion_rank': 0, 'knockout_rank': 25, 'order': 4,
				'rating_prize_coef' : 5,
			},
		}
	},
	'user_data': {
		'sound': 0,
		'music': 0,
		'lang': 'en',
		'full_screen': false,
		'allow_challenge': true,
		'money': 1000,
		'boosters': {
			'booster1': 1,
			'booster2': 100,
			'booster3': 1,
			'booster4': 1,
			'booster5': 1,
			'booster6': 1
		},
		'ig_tournament': {'score': 0, 'day_id': 0, 'context_id': 0},
		'money_box': {'amount': 400, 'free_amount': 10},
		'user_day_bonus': {'available': true, 'day': 2},
		'score': {'day': 0, 'week': 0, 'all': 0},
		'wait': {'timeout': 0},
		'gift_users': {'1': 505, '2': 499, '3': 505},
		'tutorial': {},
		'payments': {'total': 0},
		// 'user_rating_bonus': [
		// 	{'available': true, 'type': 'week', 'place': 80},
		// 	{'available': false, 'type': 'day', 'place': 3}
		// ],
		'rating': [], // for game_map
		'rating_info': {
			'league_id': 'bronze',
			'rating_id': 'some_rating_id',
			'score': 0,
			'bonus': {'available': true, 'place': 3, 'amount': 100, 'league_id': 'bronze'},
		},
		'rewarded_video': {'day_id': 0, 'amount': 0},
		'collected_map_prizes': [],
		'star_chest': {
			'chests': 0,
			'stars': 9
		},
		'paid_chest': [],
		'profile': {'days': 5, 'win_amount': 20, 'lost_amount': 6},
		'tasks': {day: "18-05-21", 'allow_reward': true, 'progress': [0,0,0]},
		'fails': {'10': 2, '11': 3, '12': 5, '235': 5},
		'chest': [
			// {'id': 0, 'item_id': 1, 'level_id': 100, 'timeout': -1},
			// {'id': 2, 'item_id': 2, 'level_id': 140, 'timeout': -1},
			{'id': 3, 'item_id': 2, 'level_id': 19, 'timeout': 9520, 'timestamp': Math.floor((new Date()).getTime() / 1000) - 1880},
			//{'item_id': 3, 'level_id': 25, 'timeout': -1},
		],
		'interstitial_flag': 0,
		'sales': {
			'active': [ //sale_starter_pack //sale_winner_pack
				// {'sale_id': 'sale_looser_pack', 'type': 'long', 'timeout': 2000},
				// {'sale_id': 'sale_winner_pack', 'type': 'long', 'timeout': 2000}, 
				// {'sale_id': 'sale_game_play_pack', 'type': 'long', 'timeout': 2000}, 
				// {'sale_id': 'sale_starter_pack', 'type': 'long', 'timeout': 10000},
				// {'sale_id': 'sale_hammer_pack', 'type': 'long', 'timeout': 10000},
				// {'sale_id': 'sale_magnet_pack', 'type': 'long', 'timeout': 10000},
				// {'sale_id': 'sale_cross_pack', 'type': 'long', 'timeout': 10000},
				// {'sale_id': 'sale_short_hammer_pack', 'type': 'short', 'timeout': 10000},
				// {'sale_id': 'sale_chest_1', 'type': 'short', 'timeout': 2000},
				//  {'sale_id': 'sale_chest_2', 'type': 'long', 'timeout': 2000},
				
			],
			'restrictions': {
				'allow_no_payments': true,
				'suspend_day_id': {
					'short': 0, 'long': 0
				}
			}
		},
		'levels_passed': [
			...Array(0).fill(1)
			// 2
			// 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2,
			// 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2,
			// 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2,
			// 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2,
			// 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2, 2, 2, 2,2, 2, 2, 2, 2, 2, 2,
			// 2, 2, 2, 2,
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},
// //200
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //200
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 1, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 1, 'score': 1},
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			
			// {'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

			
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //400
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //600
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //700
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //1000
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// // //1100
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //1200
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //1300
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //1400
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// //1500
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},

// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
// 			{'stars': 2, 'score': 1},{'stars': 2, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},{'stars': 1, 'score': 1},
			
		],
		
		"emoji": [
            '001', '002','003', '004','005', '006','007', '008','009', '010',
            '011', '012','013', '014','015', '016','017', '018','019', '020',
            '021', '022','023', '024','025'//, '026','027', '028','029', '030'
        ]
		
	},
	
	'users_info': { 
		"0" : {'photo': 'user0', 'atlas': 'common1', "first_name" : "Игорь"},
		"1" : {'photo': 'user1', 'atlas': 'common1', "first_name" : "Ирина"},
		"2" : {'photo': 'user2', 'atlas': 'common1', "first_name" : "Георгий"},
		"3" : {'photo': 'user3', 'atlas': 'common1', "first_name" : "Нина"},
		"4" : {'photo': 'user4', 'atlas': 'common1', "first_name" : "Мария"},
		"5" : {'photo': 'user5', 'atlas': 'common1', "first_name" : "Лиза"},
		"6" : {'photo': 'user6', 'atlas': 'common1', "first_name" : "Максим"},
		"7" : {'photo': 'user7', 'atlas': 'common1', "first_name" : "Валерий"},
		"8" : {'photo': 'user8', 'atlas': 'common1', "first_name" : "Лилия"},
		"9" : {'photo': 'user9', 'atlas': 'common1', "first_name" : "Михаил"},
		"10" : {'photo': 'user10', 'atlas': 'common1', "first_name" : "Владимир"},
		"11" : {'test_rating': true, 'photo': 'user1', 'atlas': 'common1', "first_name" : "Ирина"},
		"12" : {'test_rating': true, 'photo': 'user2', 'atlas': 'common1', "first_name" : "Георгий"},
		"13" : {'test_rating': true, 'photo': 'user3', 'atlas': 'common1', "first_name" : "Нина"},
		"14" : {'test_rating': true, 'photo': 'user4', 'atlas': 'common1', "first_name" : "Мария"},
		"15" : {'test_rating': true, 'photo': 'user5', 'atlas': 'common1', "first_name" : "Лиза"},
		"16" : {'test_rating': true, 'photo': 'user6', 'atlas': 'common1', "first_name" : "Максим"},
		"17" : {'test_rating': true, 'photo': 'user7', 'atlas': 'common1', "first_name" : "Валерий"},
		"18" : {'test_rating': true, 'photo': 'user8', 'atlas': 'common1', "first_name" : "Лилия"},
		"19" : {'test_rating': true, 'photo': 'user9', 'atlas': 'common1', "first_name" : "Михаил"},
		"20" : {'test_rating': true, 'photo': 'user10', 'atlas': 'common1', "first_name" : "Владимир2"},
		"21" : {'test_rating': true, 'photo': 'user1', 'atlas': 'common1', "first_name" : "Ирина2"},
		"22" : {'test_rating': true, 'photo': 'user2', 'atlas': 'common1', "first_name" : "Георгий2"},
		"23" : {'test_rating': true, 'photo': 'user3', 'atlas': 'common1', "first_name" : "Нина2"},
		"24" : {'test_rating': true, 'photo': 'user4', 'atlas': 'common1', "first_name" : "Мария2"},
		"25" : {'test_rating': true, 'photo': 'user5', 'atlas': 'common1', "first_name" : "Лиза2"},
		"26" : {'test_rating': true, 'photo': 'user6', 'atlas': 'common1', "first_name" : "Максим2"},
		"27" : {'test_rating': true, 'photo': 'user7', 'atlas': 'common1', "first_name" : "Валерий2"},
		"28" : {'test_rating': true, 'photo': 'user8', 'atlas': 'common1', "first_name" : "Лилия2"},
		"29" : {'test_rating': true, 'photo': 'user9', 'atlas': 'common1', "first_name" : "Михаил2"},
		"30" : {'test_rating': true, 'photo': 'user10', 'atlas': 'common1', "first_name" : "Владимир3"},
		"31" : {'test_rating': true, 'photo': 'user1', 'atlas': 'common1', "first_name" : "Ирина3"},
		"32" : {'test_rating': true, 'photo': 'user2', 'atlas': 'common1', "first_name" : "Георгий3"},
		"33" : {'test_rating': true, 'photo': 'user3', 'atlas': 'common1', "first_name" : "Нина3"},
		"34" : {'test_rating': true, 'photo': 'user4', 'atlas': 'common1', "first_name" : "Мария3"},
		"35" : {'test_rating': true, 'photo': 'user5', 'atlas': 'common1', "first_name" : "Лиза3"},
		"36" : {'test_rating': true, 'photo': 'user6', 'atlas': 'common1', "first_name" : "Максим3"},
		"37" : {'test_rating': true, 'photo': 'user7', 'atlas': 'common1', "first_name" : "Валерий3"},
		"38" : {'test_rating': true, 'photo': 'user8', 'atlas': 'common1', "first_name" : "Лилия3"},
		"39" : {'test_rating': true, 'photo': 'user9', 'atlas': 'common1', "first_name" : "Михаил3"},
		"40" : {'test_rating': true, 'photo': 'user10', 'atlas': 'common1', "first_name" : "Владимир3"},
		"41" : {'test_rating': true, 'photo': 'user1', 'atlas': 'common1', "first_name" : "Ирина4"},
		"42" : {'test_rating': true, 'photo': 'user2', 'atlas': 'common1', "first_name" : "Георгий4"},
		"43" : {'test_rating': true, 'photo': 'user3', 'atlas': 'common1', "first_name" : "Нина4"},
		"44" : {'test_rating': true, 'photo': 'user4', 'atlas': 'common1', "first_name" : "Мария4"},
		"45" : {'test_rating': true, 'photo': 'user5', 'atlas': 'common1', "first_name" : "Лиза4"},
		"46" : {'test_rating': true, 'photo': 'user6', 'atlas': 'common1', "first_name" : "Максим4"},
		"47" : {'test_rating': true, 'photo': 'user7', 'atlas': 'common1', "first_name" : "Валерий4"},
		"48" : {'test_rating': true, 'photo': 'user8', 'atlas': 'common1', "first_name" : "Лилия4"},
		"49" : {'test_rating': true, 'photo': 'user9', 'atlas': 'common1', "first_name" : "Михаил4"},
		"50" : {'test_rating': true, 'photo': 'user10', 'atlas': 'common1', "first_name" : "Владимир4"},
	   },

	'challenges': {
		'start_level': 12,
		'chance': 0.8,
		'timeout': 110,
		'c_duel': 60,
		'accept_timeout': 15
	},

	'duel_settings': [
		{'level_id': 5, 'speed': 9},
		{'level_id': 10, 'speed': 8},
		{'level_id': 20, 'speed': 7},
		{'level_id': 30, 'speed': 6.75},
		{'level_id': 40, 'speed': 6.5},
		{'level_id': 50, 'speed': 6.25},
		{'level_id': 60, 'speed': 6},
		{'level_id': 70, 'speed': 5.75},
	],
	'competitor_mult': { 'mobile': 1, 'fail_slow': 0.02, 'fail_max': 0.2, 'move_chance':[0.4,0.3,0.2,0.1], 'round_latency': 0.35, 'default_speed': 6.25},


	'task_set': [
		[{'task_id':'gem1', 'goal':1000}, {'task_id':'tournaments', 'goal':3}, {'task_id':'moneybox', 'goal':35}],
		[{'task_id':'open_chest', 'goal':1}, {'task_id':'gem2', 'goal':1100}, {'task_id':'win_round', 'goal':5}],
		[{'task_id':'rating_place', 'goal':1, 'type': 30}, {'task_id':'gem2', 'goal':1200,},  {'task_id':'tournaments', 'goal':4}],
		[{'task_id':'tournaments', 'goal':5},{'task_id':'gem3', 'goal':1300}, {'task_id':'moneybox', 'goal':50}],
		[{'task_id':'open_chest', 'goal':3}, {'task_id':'gem4', 'goal':1400}, {'task_id':'golden_tile', 'goal':100}],
		[{'task_id':'rating_place', 'goal':1, 'type': 25}, {'task_id':'gem5', 'goal':1500},  {'task_id':'tournaments', 'goal':6}],
		[{'task_id':'gem5', 'goal':1600}, {'task_id':'tournaments', 'goal':7}, {'task_id':'moneybox', 'goal':75}],
		[{'task_id':'rating_place', 'goal':1, 'type': 20}, {'task_id':'win_round', 'goal':15},  {'task_id':'tournaments', 'goal':8}],
		[{'task_id':'open_chest', 'goal':4}, {'task_id':'gem1', 'goal':1700}, {'task_id':'golden_tile', 'goal':180}],
		[{'task_id':'gem2', 'goal':1800}, {'task_id':'tournaments', 'goal':5}, {'task_id':'moneybox', 'goal':100}],
		[{'task_id':'rating_place', 'goal':1, 'type': 15}, {'task_id':'gem3', 'goal':1900},  {'task_id':'tournaments', 'goal':10}],
		[{'task_id':'tournaments', 'goal':11},{'task_id':'win_round', 'goal':20}, {'task_id':'moneybox', 'goal':110}],
		[{'task_id':'open_chest', 'goal':4}, {'task_id':'gem4', 'goal':2000}, {'task_id':'golden_tile', 'goal':230}],
		[{'task_id':'rating_place', 'goal':1, 'type': 10}, {'task_id':'gem5', 'goal':2100},  {'task_id':'tournaments', 'goal':11}],
		[{'task_id':'golden_tile', 'goal':240}, {'task_id':'tournaments', 'goal':12}, {'task_id':'moneybox', 'goal':125}],
		[{'task_id':'open_chest', 'goal':4}, {'task_id':'gem5', 'goal':2200}, {'task_id':'win_round', 'goal':25}],
		[{'task_id':'tournaments', 'goal':12},{'task_id':'gem1', 'goal':2300, 'type': 11}, {'task_id':'moneybox', 'goal':140}],
		[{'task_id':'gem2', 'goal':2400}, {'task_id':'tournaments', 'goal':14}, {'task_id':'moneybox', 'goal':150}],
		[{'task_id':'rating_place', 'goal':1, 'type': 5}, {'task_id':'gem3', 'goal':2500},  {'task_id':'tournaments', 'goal':15}],
		[{'task_id':'open_chest', 'goal':4}, {'task_id':'gem4', 'goal':3000}, {'task_id':'golden_tile', 'goal':270}]
		
	],

	'users_info': { 
	"0" : {'photo': 'user0', 'atlas': 'common1', "first_name" : "Player"},
	"1" : {'photo': 'user1', 'atlas': 'common1', "first_name" : "Oliver"},
	"2" : {'photo': 'user2', 'atlas': 'common1', "first_name" : "George"},
	"3" : {'photo': 'user3', 'atlas': 'common1', "first_name" : "Harry"},
	"4" : {'photo': 'user4', 'atlas': 'common1', "first_name" : "Jack"},
	"5" : {'photo': 'user5', 'atlas': 'common1', "first_name" : "Jacob"},
	"6" : {'photo': 'user6', 'atlas': 'common1', "first_name" : "Olivia"},
	"7" : {'photo': 'user7', 'atlas': 'common1', "first_name" : "Emily"},
	"8" : {'photo': 'user8', 'atlas': 'common1', "first_name" : "Lily"},
	"9" : {'photo': 'user9', 'atlas': 'common1', "first_name" : "Mia"},
	"10" : {'photo': 'user10', 'atlas': 'common1', "first_name" : "Sophia"}
   },
   'stat_data': {
	'html_init':1, 'fb_init': 2, 'xml_init': 3, 'started': 4, 'purchase_start':5, 'purchase_failed':6, 'scene_shown': 7, 'tutorial':8,
	'wait_recovered': 9, 'window_shown': 10, 'moneybox_add': 11, 'subscribe_bot': 12, 'purchase_complete': 13, 
	'reserved': 14, 'buy_booster': 15, 'buy_wait': 17, 'buy_skip_task': 18, 'buy_chest': 19, 'reserved2': 20, 'start_money': 21,
	'day_bonus': 22, 'chest_money': 23, 'rating_bonus': 24, 'level_start': 25, 'level_fail': 26, 'level_complete': 27,
	'task_reward': 28, 'level_coin' : 29, 'gift_friend': 30, 
	'chest_booster': 32, 'interstitial_ad': 33, 'reward_ad': 34, 'change_game_mode': 35, 'round_complete': 36,
	'duel_start': 37, 'duel_complete': 38, 'duel_fail': 39, 'round_start': 40, 'switch_game': 41,
	
	'tutorials': {}
	},
	'preload_sounds': [], 

};
