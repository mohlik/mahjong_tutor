class TaskManager {
    constructor(_scene) {		
        this.scene = game_data['scene'];
    }
	
	init(get_from_xml = false) {
		if ('tasks' in game_data && 'set' in game_data['tasks'] && game_data['tasks']['set'].length == 3 && !get_from_xml) {
			
		}
		else if (game_data['task_set'].length){
			var pos = loading_vars['day_id'] % game_data['task_set'].length;
			game_data['tasks'] = {};
			game_data['tasks']['timeout'] = game_data['day_end_time'];
			game_data['tasks']['set'] = game_data['task_set'][pos];
		}
		this.playtime = {'total': 0, 'last_total': 0, 'active': false};
		game_data['game_play'].game_engine.emitter.on('EVENT', this.handler_event, this);	
		this.win_sequence = 0;
		this.no_missclick = true;
		var all_zero = true;
		if (game_data['user_data']['tasks'] && game_data['user_data']['tasks']['progress']) {
			game_data['user_data']['old_progress'] = [];			
			for (var i = 0; i < game_data['user_data']['tasks']['progress'].length; i++) {
				game_data['user_data']['old_progress'].push(game_data['user_data']['tasks']['progress'][i])
				if (game_data['user_data']['tasks']['progress'][i] > 0) all_zero = false;
			}
		}
		if (all_zero) game_data['notification_manager'].set_notification(game_data['game_map'].container_free, 'tasks');

	}

	handler_event(params) {
		switch (params['event']) {
			case 'MOVE_MONEY_GEM':
				this.handler_moneybox_add(params);
				break;			
			case 'GOLDEN_REMOVE':
				this.handler_golden_remove(params);
				break;
			case 'JOKER_DECK':
				this.handler_joker_deck(params);
				break;	

		}
	}

	level_result(obj) {
		var win = 'win' in obj && obj['win'];
		if (win) {
			this.win_sequence++;
			this.update_tasks({'type': 'win_sequence'});
			if ('duel' in obj && obj['duel']) this.update_tasks({'type': 'duel', amount: 1});
		}
		else this.win_sequence = 0;
	}

	playtime_start() {
		if (this.playtime['active'] == false) {
			this.playtime['active'] = true;
			this.playtime['timestamp'] = Math.round(game_data['utils'].get_time() / 1000);
			this.no_missclick = true;
		}
	}

	playtime_stop() {
		if (this.playtime['active'] == true) {
			this.playtime['active'] = false;
			var timestamp = Math.round(game_data['utils'].get_time() / 1000);
			var diff = (timestamp - this.playtime['timestamp']);
			this.playtime['last_total'] = this.playtime['total'];
			this.playtime['total'] += diff;
			this.update_tasks({'type': 'playtime', 'amount':diff});
			if (this.no_missclick) this.update_tasks({'type': 'no_missclick', 'amount':1});
		}
	}

	handler_moneybox_add(e) {
		var amount = 1;
		if ('amount' in  e) amount = e['amount'];
		this.update_tasks({'type': 'moneybox', 'amount':amount});
	}

	handler_golden_remove(e) {
		var amount = 1;
		if ('amount' in  e) amount = e['amount'];
		this.update_tasks({'type': 'golden_tile', 'amount':amount});
	}

	handler_joker_deck(e) {
		var amount = 1;
		if ('amount' in  e) amount = e['amount'];
		this.update_tasks({'type': 'joker_deck', 'amount':amount});
	}

	handler_missclick(e) {
		this.no_missclick = false;
	}

	get_task_pos(task_id) {
		var i;
		var task_set = null;
		if ('tasks' in game_data && 'set' in game_data['tasks']) 
			task_set = game_data['tasks']['set'];
		var ret = -1;
		
		if (task_set) {
			for (i = 0; i < task_set.length; i++) {
				if (task_set[i]['task_id'] == task_id) {
					ret = i;
					break;
				}
			}
		}
		return ret;
	}

	get_task(task_id) {
		var i;
		var task_set = null;
		if ('tasks' in game_data && 'set' in game_data['tasks']) 
			task_set = game_data['tasks']['set'];
		var ret = null;
		if (task_set) {
			for (i = 0; i < task_set.length; i++) {
				if (task_set[i]['task_id'] == task_id) {
					ret = task_set[i];
					ret['pos'] = i;
					break;
				}
			}
		}
		return ret;
	}

	check_tasks_completed() {
		var i;
		var task_set = null;
		var progress = null; 
		if ('tasks' in game_data && 'set' in game_data['tasks']) 
			task_set = game_data['tasks']['set'];
		if ('tasks' in game_data['user_data'] && 'progress' in game_data['user_data']['tasks'])
			progress = game_data['user_data']['tasks']['progress']
		var res = true;
		if (progress && task_set) {
			for (i = 0; i < task_set.length; i++) {
				if (progress[i] < task_set[i]['goal']) {
					res = false;
					break;
				}
			}
		}
		else res = false;
		
		return res;
	}

	count_completed_tasks() {
		var i;
		var task_set = null;
		var progress = null; 
		if ('tasks' in game_data && 'set' in game_data['tasks']) 
			task_set = game_data['tasks']['set'];
		if ('tasks' in game_data['user_data'] && 'progress' in game_data['user_data']['tasks'])
			progress = game_data['user_data']['tasks']['progress']
		var res = 0;
		var ret = {'num': res, 'ids': ''}
		if (progress && task_set) {
			for (i = 0; i < task_set.length; i++) {
				if (progress[i] >= task_set[i]['goal']) {
					progress[i] = task_set[i]['goal'];
					ret['ids'] += task_set[i]['task_id'] + ' ';
					res++;
				}
			}
		}
		ret['num'] = res;
		return ret;
	}

	update_tasks(obj) {
		// console.log('ut', JSON.stringify(obj));
		
		if (game_data['tasks_active'] && game_data['user_data']['levels_passed'].length >= game_data['tasks_start_level']) {
			var t = obj['type'];
			var _this = this;
			var progress = game_data['user_data']['tasks']['progress'];
			var completed_before = this.count_completed_tasks();
			var completed_after;
			
			var delta = [0,0,0];
			var pos;
			pos = this.get_task_pos(t);
			
			// if (t == 'rating_place') debugger
			if (pos >= 0) {
				if (t == 'tournaments' || t == 'open_chest' 
					|| t == 'win_round' || t == 'moneybox' 
					|| t == 'gem1' || t == 'gem2' || t == 'gem3' || t == 'gem4' || t == 'gem5' 
					|| t == 'rating_score' || t == 'golden_tile') {
					 delta[pos] = obj['amount'];
				}
				else if (t == 'rating_place') {
					if (obj['amount'] <= game_data['tasks']['set'][pos]['type'])
						delta[pos] = 1;
					
				}
				else if (t == 'win_sequence') {
					if (this.win_sequence >= game_data['tasks']['set'][pos]['type'])
						delta[pos] = 1;
				}
			}
			//console.log('ut2', pos, delta);
			var delta_positive = false;
			for (var i = 0; i < delta.length; i++) {
				if (delta[i] > 0) {
					delta_positive = true;
					break;
				}
			}
			if (delta_positive && !this.check_tasks_completed())
				game_data['game_request'].request({'update_tasks_delta': true, 'deltas':delta}, function(resp) {

					completed_after = _this.count_completed_tasks();
					if (completed_after['num'] > completed_before['num']) {
						game_data['notification_manager'].set_notification(game_data['game_map'].container_free, 'tasks');
						game_data['utils'].update_stat({'type': 'task_completed', 'amount_inc': completed_after['num'] - completed_before['num']
							,'description': completed_after['ids']});
					}
					
					if ('day_id' in resp && resp['day_id'] != loading_vars['day_id']) {
						loading_vars['day_id'] = resp['day_id'];
						_this.init(true);
					}
				});
		}
	}
	
}