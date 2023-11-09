class SalesManager {
    constructor(_scene) {		
		this.scene = game_data['scene'];
		this.emitter = new Phaser.Events.EventEmitter();
		this.inited = false;
    }
	
	init() {
		if (!('day_id' in game_data['user_data']['payments']) || game_data['user_data']['payments']['day_id'] <= 0)
			game_data['user_data']['payments']['day_id'] = game_data['user_data']['start_day_id'];
		this.last_fail_amount = 0;
		this.last_fail_torch_amount = 0
		this.pending_sale = null;

		let user_info = game_data['user_data']['sales'];
		this.sale_short = null;
		this.sale_long = null;
		if (user_info && (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only')) {
			this.update_active_sales(user_info, true);
			
			this.timer = this.scene.time.addEvent({
				delay: 1000,
				callback: this.handler_timer,
				callbackScope: this,
				loop: true
			});
			this.check_sale();
	
			this.inited = true;
		}
		
	}

	update_active_sales(user_info, init = false) {
		
		if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') {
			this.sale_short = null;
			this.sale_long = null;
			for (let item of user_info['active']) {
				item.time_spend = 0;
				
				if (item.timeout > 0) {
					item.active = true;
					if (init) this.receive_sale(item.sale_id, false);
					if (item.type == 'short') {
						item['type'] = 'short';
						this.sale_short = item;
					}
					if (item.type == 'long') {
						item['type'] = 'long';
						this.sale_long = item;
					}
				}
			}
			this.last_time = game_data['game_request'].get_time();
		}
		
	}

	level_finished(is_fail, level_id, dark) {
		var val = 0;
		var torch_val = 0;
		
		if (is_fail && level_id in game_data['user_data']['fails']) {
			val = game_data['user_data']['fails'][level_id];
			if (dark) torch_val = game_data['user_data']['fails'][level_id];

		}
		
		this.last_fail_amount = val;
		this.last_fail_torch_amount = torch_val
	}

	handler_timer() {
		let user_info = game_data['user_data']['sales'];
		let time_now = game_data['game_request'].get_time();
		if (user_info && time_now - this.last_time >= 1000) {
			let add_time = parseInt((time_now - this.last_time) / 1000);
			this.last_time += add_time * 1000;
			for (let item of user_info['active']) {
				if (item.active) {
					item.time_spend += add_time;
					if (item.time_spend > item.timeout) {
						item.active = false;
						game_data['game_request'].request(  {'remove_user_sale': true, 'sale_id': item.sale_id},function(res) {
							if (res['success']) {
								game_data['sales_manager'].update_active_sales(game_data['user_data']['sales']);
								game_data['game_map'].remove_sale(item.sale_id);
							}
						});	
						if (item.type == 'short') this.sale_short = null;
						if (item.type == 'long') this.sale_long = null;
					}
				}
			}
		}
	}

	check_sale() {
		if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') {
			let user_info = game_data['user_data']['sales'];
			if (user_info['active'] && user_info['active'].length < 1) {
				if (this.pending_sale)  this.receive_sale(this.pending_sale.sale_id);
				else if (user_info && user_info['restrictions']){
					let day_short_avail = loading_vars['day_id'] >= user_info['restrictions']['suspend_day_id']['short'];
					let day_long_avail = loading_vars['day_id'] >= user_info['restrictions']['suspend_day_id']['long'];
					
					if (day_long_avail && !this.sale_long) {
						this.pending_sale = this.search_sale(game_data['sales']['long_sales'])
						
					}
					if (this.pending_sale) {
						this.pending_sale['type'] = 'long';
						this.sale_long = this.pending_sale;
					}
					else if (day_short_avail && !this.pending_sale && !this.sale_short){
						this.pending_sale = this.search_sale(game_data['sales']['short_sales']);
						if (this.pending_sale) {
							this.pending_sale['type'] = 'short';
							this.sale_short = this.pending_sale;
						}
					}
					
					if (this.pending_sale && (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only')) this.receive_sale(this.pending_sale.sale_id);
				}
			}
		}
	}

	search_sale(config) {
		let result = null;
		let passed = get_passed_amount();
		
		for (let item of config) {
			let rnd = Math.random();
			
			if (passed >= item.start_level && rnd < item.chance) {
				if (item.condition) {
					if (item.condition.rating_knockout) {
						if (game_data['user_data']['rating_info'] && game_data['user_data']['rating_info']['bonus'] && game_data['user_data']['rating_info']['bonus']['available']) {
							let current_league = game_data['user_data']['rating_info']['league_id'];
							let prev_league = game_data['user_data']['rating_info']['bonus']['league_id'];
							let order_prev = game_data['rating_settings']['leagues'][prev_league]['order'];
							let order_now = game_data['rating_settings']['leagues'][current_league]['order'];
							if (order_prev > order_now) {
								result = item;
								break;
							}
						}
					}
					else if (item.condition.no_payments && game_data['user_data']['payments']['total'] == 0 && game_data['user_data']['sales']['restrictions']['allow_no_payments']) {
						result = item;
						
						break;
					}
					else if (item.condition.no_boosters && item.condition.torch_fails) {
						let all_zero = true;
						
						for (let id of item.condition.no_boosters) {
							if (game_data['user_data']['boosters'][id] > 0) all_zero = false;
						}

						if (this.last_fail_torch_amount >= item.condition.torch_fails && all_zero) {
							result = item;
							break;
						}
					}
					else if (item.condition.no_boosters) {
						let all_zero = true;
						
						for (let id of item.condition.no_boosters) {
							if (game_data['user_data']['boosters'][id] > 0) all_zero = false;
						}
						
						if (all_zero) {
							result = item;
							break;
						}
					}
					else if (item.condition.fails) {
						
						if (this.last_fail_amount >= item.condition.fails) {
							result = item;
							break;
						}
					}
					else if (item.condition.energy) {
						if (game_data['user_data']['energy_info']['energy'] < game_data['energy_data']['level_price']) {
							result = item;
							break;
						}
					}
				}
				else {
					result = item;
					break;
				}
			}
		}
		return result;
	}

	get_sale_config(sale_id) {
		let result = null;
		let lists = [game_data['sales']['short_sales'], game_data['sales']['long_sales']];
		for (let list of lists) {
			let res = list.filter(function(el, index, arr){
				return (el['sale_id'] == sale_id);
			});	
			if (res.length) {
				result = res[0];
				break;
			}
		}
		return result;
	}

	receive_sale(sale_id, pending = true) {
		let item = this.get_sale_config(sale_id);
		
		let shop_pos = [];
		if (item) shop_pos = game_data['shop'].filter(function(el, index, arr){
			return (el['sale_id'] == sale_id);
		});	

		if (item && shop_pos.length == 1) {
			
			let _this = this;
			let url = loading_vars['urls']['sales'] + sale_id;
			
			var loader = new Phaser.Loader.LoaderPlugin(game_data['scene']);
			loader.atlas(String(sale_id), url + ".png" + '?' + loading_vars['version'], url + ".json" + '?' + loading_vars['version']);
			let success = true;
			loader.on('loaderror', function(fileObj) {
				success = false;
				
			});
			loader.once('complete', function(){
				loader.off('loaderror');
				
				if (pending) {
					let restrictions = _this.get_restrictions_clone()
					if (item.condition && item.condition.no_payments) restrictions['allow_no_payments'] = false;
					
					restrictions['suspend_day_id'][item.type] = loading_vars['day_id'] + Math.ceil(item['timeout']/86400) + game_data['sales']['suspend_days'][item.type];
					game_data['game_request'].request(  {'add_user_sale': true, 'sale_id': sale_id, 'timeout': item['timeout'], 'type': item.type, 'restrictions': restrictions},function(res) {
						if (res['success']) {
							_this.update_active_sales(game_data['user_data']['sales']);
							// game_data['top_panel'].add_sale(sale_id, pending);
							game_data['game_map'].add_sale(sale_id, pending);
						}
					});

					
				}
				else game_data['game_map'].add_sale(sale_id);
				loader.destroy();
			}, this);
			loader.start();
			if (pending) this.pending_sale = null;
		}
	}

	get_restrictions_clone() {
		let res = {};
		let info = game_data['user_data']['sales']['restrictions'];
		res['allow_no_payments'] = info['allow_no_payments'];
		res['suspend_day_id'] = {};
		for (let s in info['suspend_day_id']) res['suspend_day_id'][s] = info['suspend_day_id'][s];
		return res;
	}

}