class GemsUtils{
	constructor(){

    }
    
    init(params) {
        game_data['forced_mark'] = (Math.random() * 2) < 1;	
        this.scene = game_data['scene'];        
        this.targets_manager = params['targets_manager'];
        this.dim = game_data['dim'];			
        this.recycled_gems = {};
        this.attr = {};
        this.clean_attr();    
        this.gems_manager = params['gems_manager'];
        this.emitter = new Phaser.Events.EventEmitter();
        this.allow = true;
    }

    update_utils(params) {
        this.field_items = params['field_items'];
        this.level_id = params['level_id'];
        this.level = params['level'];     
        this.clean_candidates();
    }
    
    clean_candidates() {
        this.gems_amount = 0;
        this.possible_bonuses = {};
        
        this.candidates = new Array();
        this.swap_items = new Array();
        this.bonus_map = {};
        this.combo = 0;				
    }

    start_level() {		
        this.attr['level_active'] = true;
        this.check_explode_gems();
    }

    update_candidates(obj) {      
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var timestamp = game_data['utils'].get_time();
        var params = obj;

        if (this.field_items && this.field_items.length > pos_y && 
            pos_x >= 0 && pos_y >= 0 && pos_y < this.field_items.length && 
            pos_x < this.field_items[pos_y].length) {
                
            var field_item = this.field_items[pos_y][pos_x];
            var gem = field_item.get_gem();
            var is_swap = ('is_swap' in obj && obj['is_swap']);
            var bonus = ('bonus' in obj && obj['bonus']);

            if (gem) {
                if (gem.get_type() == 'normal' || gem.get_type() == 'mark') {	
                    this.candidates.push(obj);
                    if (is_swap)
                        this.swap_items.push({'pos_x': pos_x, 'pos_y': pos_y});                    
                }				
                else if (gem.get_type() == 'bonus') {   
                                  
                    if (is_swap || this.targets_manager.check_target_gem(gem) || bonus) {
                        
                        this.candidates.push({...obj, bonus: true});
                        if (is_swap)
                        this.swap_items.push({...obj, bonus: true});
                        
//                         params['event'] = 'REMOVE_GEM';
                        
//   this.emitter.emit('EVENT', params);
                    }     
                }
                else if (gem.is_bottom() || gem.is_fireball()) {
                    if (this.check_bottom(obj)) {
                        params['event'] = 'REMOVE_GEM';
                        this.emitter.emit('EVENT', params);
                    }
                }
                else if (gem.get_type() == 'money') {                           
                    
                    if (timestamp - gem.get_money_timestamp() >= game_data['level_coins']['timeout']) {
                        params['event'] = 'REMOVE_MONEY';
                        this.emitter.emit('EVENT', params);
                    }
                    
                }
            }
        }

        
    }

// бонусные гемы в конец массива чтобы они проходили проверку последними
rotate_bonus_gems_to_end(candidates) {
    let bonus_els = candidates.filter(el => el.bonus);
    if (bonus_els.length > 0) {              
        bonus_els.forEach(b => {
            let el = candidates.splice(candidates.indexOf(b), 1);
            // candidates = [...candidates, ...el];
            candidates.push(el[0]);
        });
    }

    return candidates;
}

explode_gems(explosion_map, bonus) {
    var total_exploded = 0;
    // refactor !!!!!!!!!!!!!
let bonus_gem = explosion_map.find(({bonus}) => bonus);
let grass_explode = false

if (bonus_gem && 'bonus_type' in bonus && get_passed_amount() >= 2) {
    
    explosion_map.forEach((e,i) => {
        let pos_x = e['pos_x'];
        let pos_y = e['pos_y'];
        let swapped_gem = e['swapped_gem'];
        let gem = this.field_items[pos_y][pos_x].get_gem();
        gem.set_invulnerable(true);
        if (!grass_explode && this.field_items[pos_y][pos_x].is_grass()) {
            grass_explode = true
        }

        if (gem) {
            
            if ('bonus_type' in bonus && pos_x == bonus['pos_x'] && pos_y == bonus['pos_y'])  {
                
                this.bonus_map = {};
                this.emitter.emit('EVENT', {'event': 'REMOVE_BONUS_CANDIDATE', 'pos_x': pos_x, 'pos_y': pos_y, 'bonus_type': bonus['bonus_type'], 'bonus_id': bonus['bonus_id'], 'is_nested': true, 'swapped_gem': swapped_gem, 'collapsed': true});
            } else {

                let last = false;
                last = (i === explosion_map.length - 1) ? true : false;
                this.emitter.emit('EVENT', {'event': 'REMOVE_BONUS_CANDIDATE', 'pos_x': pos_x, 'pos_y': pos_y,  'swapped_gem': swapped_gem, 'target_gem_pos_x': bonus['pos_x'], 'target_gem_pos_y': bonus['pos_y'], 'collapsed': true, 'last': last });
            }

                                           
            total_exploded++;
        }
        
    });
} else {
    
    explosion_map.forEach(e => {
        let pos_x = e['pos_x'];
        let pos_y = e['pos_y'];
        let swapped_gem = e['swapped_gem'];
        let gem = this.field_items[pos_y][pos_x].get_gem();
        this.gems_manager.allow_update_items = false;
        // this.used_field_items.push(this.field_items[pos_y][pos_x]);
        if (!grass_explode && this.field_items[pos_y][pos_x].is_grass()) {
            grass_explode = true
        }
        if (gem && !gem.is_falling()) {
            
            this.emitter.emit('EVENT', {'event': 'REMOVE_GEM', 'pos_x': pos_x, 'pos_y': pos_y, 'swapped_gem': swapped_gem});        
            total_exploded++;
        }
        
    });
}

if (grass_explode) {
    explosion_map.forEach(el => {
        let pos_x = el['pos_x'];
        let pos_y = el['pos_y'];
        let field_item = this.field_items[pos_y][pos_x]
        if (!field_item.is_grass()) {
            field_item.init_grass()
            field_item.update_grass()
            this.targets_manager.grass_created()
        }
    })
}
        
    // }
    
    

    if (total_exploded > 0) {
        this.update_combo();
        var t_combo = this.combo;
        if (t_combo > 17) 
            t_combo = 17;                                             
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'combo' + t_combo});
        setTimeout(() => {
            let bonus_gems = this.gems_manager.gems_holder.list.filter(el => (el.attr && el.attr.type === 'bonus'));
            bonus_gems.forEach(b => {
                if (b && b.set_invulnerable)
                    b.set_invulnerable(false);
            });
        }, 500);
    }


}

  split_to_chains(chain_info, explosion_map_arr) {
    let a = [];
    let copy = [...explosion_map_arr];

    for (let i = 0; i < chain_info.length; i++) {
        if (copy.length > 0) {
            a.push(copy.splice(0, chain_info[i]));
            
        }
        
        else break;
    }

    
    return a;
  }


  check_explode_gems() {
    var _this = this;
    
    var timedEvent = game_data['utils'].delayed_call(50, () => {
        if (_this.candidates.length > 0 && _this.allow) {                
            var arr;
            var bonus;
            var ind;
            var explosion_map = {};
            let explosion_map_arr = [];  
            let combinations = [];
            let chain_info = [];
            let is_swapped = false
            
            _this.candidates = _this.rotate_bonus_gems_to_end(_this.candidates);

            
            _this.candidates.forEach(candidate => {
               
                let {swapped_gem, is_swap} = candidate;

                if (is_swap) is_swapped = true

                arr = _this.check_explode(candidate); // возвращает массив гемов для каждого кандидата
                arr = this.remove_repeated_items(arr);
               
                
                if(arr.length) {
                    chain_info.push(arr.length);
                }
                
                    arr.forEach(gem => {
                        let {pos_y, pos_x, gem_id, bonus} = gem;
                        
                        if (!(pos_y in explosion_map))
                            explosion_map[pos_y] = {};
                                        
                        explosion_map[pos_y][pos_x] = gem_id;
                        
                        explosion_map_arr.push({pos_x, pos_y, bonus, 'swapped_gem': swapped_gem});
                    });
            });
            explosion_map_arr = this.remove_repeated_items(explosion_map_arr);

            if (!is_swapped)
                chain_info.reverse()
            
            combinations = this.split_to_chains(chain_info, explosion_map_arr);
            
            combinations.forEach(comb => {
                
                bonus = this.create_bonus(explosion_map, comb);
                
                comb = this.filter_by_bonus(comb);
                
                this.explode_gems(comb, bonus);
            });
            // cleaning
            for (ind in explosion_map)
                delete explosion_map[ind];			
            explosion_map = {};	

            for (ind in this.bonus_map)
                delete this.bonus_map[ind];	
            this.bonus_map = {};
            
            while(_this.swap_items.length)
                _this.swap_items.pop();
            
            while (_this.candidates.length)
                _this.candidates.pop();	
                
            explosion_map_arr = [];
            chain_info = [];
            // output_exp_arr = [];
        }
        
        if (_this.attr['level_active'])
            _this.check_explode_gems();
    });		
}

filter_by_bonus(arr) {
    let copy = [...arr];
    let bonus = copy.find(el => el.bonus);
    if (bonus) {
        bonus = copy.splice(copy.indexOf(bonus), 1);
        copy.unshift(...bonus);
        
        return copy;
    } else {
        return arr;
    }
    
}

    remove_repeated_items(explosion_map_arr) {
        var flags = [ ];
        var output_exp_arr = [];

        if (explosion_map_arr) {
            
            for (let i = 0; i < explosion_map_arr.length; i++) {
                if (flags[explosion_map_arr[i].pos_x] && flags[explosion_map_arr[i].pos_x][explosion_map_arr[i].pos_y]) continue;
                if (!flags[explosion_map_arr[i].pos_x]) flags[explosion_map_arr[i].pos_x] = [];
                flags[explosion_map_arr[i].pos_x][explosion_map_arr[i].pos_y] = true;
                output_exp_arr.push(explosion_map_arr[i]);
            }
        }

        return output_exp_arr;
    }

    is_ending_station(pos_y, pos_x) {
        let field_item = this.field_items[pos_y];
        // если нижние клетки еще не разблокированы
        
        if (field_item) {
            if (field_item.every(el => el === null)) return {'res': true};
            field_item = this.field_items[pos_y][pos_x];
            if (!field_item) return {'res': true, 'active': false};
        } else return {'res': true, 'active': true};

        if (field_item.is_blocked() || field_item.is_locked()) return {'res': true, 'active': false};
        if (!field_item.is_empty()) return {'res': true, 'active': true};
        return {'res': false};


        // // if (!field_item || field_item.is_blocked() || field_item.is_locked()) return 1;
        // if (!field_item || (!field_item.is_empty() || field_item.is_blocked() || field_item.is_locked())) return true;
        // return false;
    }

    is_any_empty_field_on_way(pos_y, pos_x) {
        let last_column = this.field_items.length;
        let allow = false;
        let uno_swap = false

        for (let i = +pos_y; i < last_column; i++) {
            let res = this.is_ending_station(i, +pos_x);
            let field_item = this.field_items[pos_y]?.[pos_x]
            let gem
            if (field_item)
                gem = field_item.get_gem()
            if (gem) uno_swap = gem.is_uno_swap()
            allow = res.res || uno_swap;
            let active = res.active;

            if (!active) break;
            
            if (!allow)
                break;
        }

        return allow;
    }

    is_field_item_active(obj) {
        return game_data.game_engine.playing_field.field_items_manager.is_active(obj);
    }

    check_explode(obj) {
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        
        var gem = null
        var field_item;
        if (this.field_items && this.field_items[pos_y] && this.field_items[pos_y][pos_x]) {
            field_item = this.field_items[pos_y][pos_x];
            gem = field_item.get_gem();
        }
        var res = [];
        let allow = this.is_any_empty_field_on_way(pos_y, pos_x);

        if (gem && allow) {
            var gem_id = gem.get_id();	
            	
            var max_x = this.field_items[pos_y].length;			
            var max_y = this.field_items.length;			
            if (gem.get_type() === 'bonus') {
                
                res.push({'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id, 'bonus': true});
                
            } else {
                if (pos_x > 1 && this.check_match3(field_item, this.field_items[pos_y][pos_x - 1], this.field_items[pos_y][pos_x - 2]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x - 2, 'pos_y': pos_y, 'gem_id': gem_id}]);
            
            if (pos_x > 0 && pos_x < max_x - 1 && this.check_match3(field_item, this.field_items[pos_y][pos_x - 1], this.field_items[pos_y][pos_x + 1]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id}]);
                
            if (pos_x < max_x - 2 && this.check_match3(field_item, this.field_items[pos_y][pos_x + 1], this.field_items[pos_y][pos_x + 2]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x + 2, 'pos_y': pos_y, 'gem_id': gem_id}]);
                    
            if (pos_y > 1 && this.check_match3(field_item, this.field_items[pos_y - 2][pos_x], this.field_items[pos_y - 1][pos_x]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y - 2, 'gem_id': gem_id}]);
                        
            if (pos_y > 0 && pos_y < max_y - 1 && this.check_match3(field_item, this.field_items[pos_y - 1][pos_x], this.field_items[pos_y + 1][pos_x]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id}]);
                            
            if (pos_y < max_y - 2 && this.check_match3(field_item, this.field_items[pos_y + 1][pos_x], this.field_items[pos_y + 2][pos_x]))
                res = res.concat([{'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id}, {'pos_x': pos_x, 'pos_y': pos_y + 2, 'gem_id': gem_id}]);
            }
            if (game_data['engine_config']['square']) {
                if (this.field_items[pos_y + 1] && this.check_match4(field_item, this.field_items[pos_y + 1][pos_x], this.field_items[pos_y + 1][pos_x + 1], this.field_items[pos_y][pos_x + 1])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y - 1] && this.field_items[pos_y][pos_x + 1] && this.check_match4(field_item, this.field_items[pos_y - 1][pos_x + 1], this.field_items[pos_y][pos_x + 1], this.field_items[pos_y - 1][pos_x])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y + 1] && this.field_items[pos_y][pos_x - 1] && this.check_match4(field_item, this.field_items[pos_y][pos_x - 1], this.field_items[pos_y + 1][pos_x - 1], this.field_items[pos_y + 1][pos_x])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y - 1] && this.field_items[pos_y][pos_x - 1] && this.check_match4(field_item, this.field_items[pos_y][pos_x - 1], this.field_items[pos_y - 1][pos_x - 1], this.field_items[pos_y - 1][pos_x])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y - 1] && this.field_items[pos_y][pos_x - 1] && this.check_match4(field_item, this.field_items[pos_y - 1][pos_x], this.field_items[pos_y - 1][pos_x - 1], this.field_items[pos_y][pos_x - 1])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y - 1] && this.field_items[pos_y][pos_x + 1] && this.check_match4(field_item, this.field_items[pos_y][pos_x + 1], this.field_items[pos_y - 1][pos_x], this.field_items[pos_y - 1][pos_x + 1])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y - 1, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y + 1] && this.field_items[pos_y][pos_x - 1] && this.check_match4(field_item, this.field_items[pos_y][pos_x - 1], this.field_items[pos_y + 1][pos_x - 1], this.field_items[pos_y + 1][pos_x])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                    ])
                }
                if (this.field_items[pos_y + 1] && this.field_items[pos_y][pos_x + 1] && this.check_match4(field_item, this.field_items[pos_y][pos_x + 1], this.field_items[pos_y + 1][pos_x + 1], this.field_items[pos_y + 1][pos_x])) {
                    res = res.concat([
                        {'pos_x': pos_x, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y, 'gem_id': gem_id},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1, 'gem_id': gem_id},
                    ])
                }
            }
           
                
        }

        return res;						
    }			
	
	check_match4(field_item1, field_item2, field_item3, field_item4) {
        var gem1 = (field_item1 && !field_item1.is_trapped() && field_item1.is_removable() && !field_item1.is_dynamical()) ? field_item1.get_gem() : null;			
		var gem2 = (field_item2 && !field_item2.is_trapped() && field_item2.is_removable() && !field_item2.is_dynamical()) ? field_item2.get_gem() : null;						
		var gem3 = (field_item3 && !field_item3.is_trapped() && field_item3.is_removable() && !field_item3.is_dynamical()) ? field_item3.get_gem() : null;
		var gem4 = (field_item4 && !field_item4.is_trapped() && field_item4.is_removable() && !field_item4.is_dynamical()) ? field_item4.get_gem() : null;

        if (gem1 && gem2 && gem3 && gem4) {				
			if (gem1.get_id() == gem2.get_id() && gem1.get_id() == gem3.get_id() && gem1.get_id() == gem4.get_id() && gem1.get_type() == gem2.get_type() && gem1.get_type() == gem3.get_type() && gem1.get_type() == gem4.get_type())				
				return true;
			else	
				return false;
		}
		else
			return false;	
    }

	check_match3(field_item1, field_item2, field_item3) {
		var gem1 = (field_item1 && !field_item1.is_trapped() && field_item1.is_removable() && !field_item1.is_dynamical()) ? field_item1.get_gem() : null;			
		var gem2 = (field_item2 && !field_item2.is_trapped() && field_item2.is_removable() && !field_item2.is_dynamical()) ? field_item2.get_gem() : null;						
		var gem3 = (field_item3 && !field_item3.is_trapped() && field_item3.is_removable() && !field_item3.is_dynamical()) ? field_item3.get_gem() : null;			
		

		if (gem1 && gem2 && gem3) {				
			if (gem1.get_id() == gem2.get_id() && gem1.get_id() == gem3.get_id() && gem1.get_type() == gem2.get_type() && gem1.get_type() == gem3.get_type())				
				return true;
			else	
				return false;
		}
		else
			return false;							
	}		
    
    findMostFrqeuent(arr){
        if (arr) {
            var mostFrequentElement = arr[0];
            var map = {};
            for(var i = 0; i<arr.length; i++){
                if(!map[arr[i]]){
                    map[arr[i]]=1;
                }else{
                    ++map[arr[i]];
                    if(map[arr[i]]>map[mostFrequentElement]){
                        mostFrequentElement = arr[i];
                    }
                }
            }
            return  mostFrequentElement;
        }
       
    }

    filter_bonus_gems(output_exp_arr) {
        let copy1 = [...output_exp_arr];
        let copy2 = [...output_exp_arr];
        let arr = copy2.map(el => {
            return this.field_items[el.pos_y][el.pos_x].get_gem().get_id();
        });

        let most_frequent = this.findMostFrqeuent(arr);
        copy1 = copy1.filter(el => this.field_items[el.pos_y][el.pos_x].get_gem().get_id() == most_frequent);

        return copy1;
    }

    create_bonus(explosion_map, explosion_map_arr) {
        var obj = {};
        var i;
        var j;

        this.create_bonus_map(explosion_map, explosion_map_arr);
        var bonus_candidates = this.create_bonus_candidates();
        
        if (bonus_candidates.length > 0) {
                
            if (this.swap_items.length > 0) {
                let swap_item;
                this.swap_items.forEach(el => {
                    if (!swap_item)
                    swap_item = explosion_map_arr.find(b => (b.pos_x == el.pos_x && b.pos_y == el.pos_y));
                });
                    for (j = 0; j < bonus_candidates.length; j++) {
                        
                        if (swap_item && bonus_candidates[j] && bonus_candidates[j] && swap_item['pos_x'] == bonus_candidates[j]['pos_x'] &&
                            swap_item['pos_y'] == bonus_candidates[j]['pos_y']) {
                            obj = bonus_candidates[j];
                            
                            break;
                        }
                    }
            }
            if (this.swap_items.length == 0 || !('bonus_type' in obj)) {
                i = this.get_middle_bonus_point(bonus_candidates);
                obj = i == undefined ? bonus_candidates[1] : i
                
            }
            
            if ('bonus_type' in obj) {
                explosion_map_arr.forEach(el => {
                    if (el['pos_x'] == obj['pos_x'] && el['pos_y'] == obj['pos_y']) {
                        el['bonus'] = true;
                    }
                });
                return {'pos_x': obj['pos_x'], 'pos_y': obj['pos_y'], 'bonus_type': obj['bonus_type'], 'bonus_id': obj['bonus_id']};

            } else return {};
                
        }
        
        return {};
    }	

    get_middle_bonus_point(bonus_candidates) {
        let mid_point = bonus_candidates.find(c => ('mid_point' in c && !this.field_items?.[c['pos_y']]?.[c['pos_x']].is_blocked()));
        return mid_point;
    }

    create_bonus_map(explosion_map, explosion_map_arr) {
        var gem;
        var pos_x;
        var pos_y;
        var gem_id;
        this.allow = false;
        let sort;
        if (explosion_map_arr.length >= 2)
            sort = explosion_map_arr[0].pos_y;
        if (explosion_map_arr.every(({pos_y}) => pos_y === sort)) {
            sort = 'pos_x';
        } else sort = 'pos_y';
        
        let exp_map = explosion_map_arr.sort((obj1, obj2) => obj1[sort] - obj2[sort]);
        
        exp_map.forEach(m => {
            let {pos_x , pos_y} = m;
            gem = this.field_items[pos_y][pos_x].get_gem();
            // if (gem) {
                if (gem)
                gem_id = gem.get_id();			

                if (exp_map.length === 4) {
                    this.update_bonus_map([{'pos_x': pos_x , 'pos_y': pos_y},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1, 'mid_point': true},
                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 3}						 
                    ], explosion_map, gem_id, 1, 6); // vert arrow
                    
                    this.update_bonus_map([{'pos_x': pos_x, 'pos_y': pos_y},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y, 'mid_point': true},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y},
                    {'pos_x': pos_x + 3, 'pos_y': pos_y}						 
                    ], explosion_map, gem_id, 1, 3); //hor arrow

                    this.update_bonus_map([
                        {'pos_x': pos_x, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y},
                        {'pos_x': pos_x , 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 2, 16); // plane

                   
                }
                else if (exp_map.length === 6) {
                    this.update_bonus_map([{'pos_x': pos_x , 'pos_y': pos_y},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1, 'mid_point': true},
                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 3}						 
                    ], explosion_map, gem_id, 1, 6); // vert arrow

                    this.update_bonus_map([{'pos_x': pos_x , 'pos_y': pos_y},
                    {'pos_x': pos_x - 1, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x - 1, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1, 'mid_point': true},
                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 3}						 
                    ], explosion_map, gem_id, 1, 6); // vert arrow

                    this.update_bonus_map([{'pos_x': pos_x , 'pos_y': pos_y},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 3},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1, 'mid_point': true},
                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 3}						 
                    ], explosion_map, gem_id, 1, 6); // vert arrow

                    this.update_bonus_map([{'pos_x': pos_x , 'pos_y': pos_y},
                    {'pos_x': pos_x - 1, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x - 1, 'pos_y': pos_y + 3},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1, 'mid_point': true},
                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                    {'pos_x': pos_x, 'pos_y': pos_y + 3}						 
                    ], explosion_map, gem_id, 1, 6); // vert arrow

                    this.update_bonus_map([{'pos_x': pos_x, 'pos_y': pos_y},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y, 'mid_point': true},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y},
                    {'pos_x': pos_x + 3, 'pos_y': pos_y}						 
                    ], explosion_map, gem_id, 1, 3); //hor arrow

                    this.update_bonus_map([{'pos_x': pos_x, 'pos_y': pos_y},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y - 1},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y - 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y, 'mid_point': true},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y},
                    {'pos_x': pos_x + 3, 'pos_y': pos_y}						 
                    ], explosion_map, gem_id, 1, 3); //hor arrow
                    
                    this.update_bonus_map([{'pos_x': pos_x, 'pos_y': pos_y},
                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y, 'mid_point': true},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y},
                    {'pos_x': pos_x + 3, 'pos_y': pos_y}						 
                    ], explosion_map, gem_id, 1, 3); //hor arrow

                    this.update_bonus_map([{'pos_x': pos_x, 'pos_y': pos_y},
                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y - 1},
                    {'pos_x': pos_x + 1, 'pos_y': pos_y, 'mid_point': true},
                    {'pos_x': pos_x + 2, 'pos_y': pos_y},
                    {'pos_x': pos_x + 3, 'pos_y': pos_y}						 
                    ], explosion_map, gem_id, 1, 3); //hor arrow

                    this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); // bomb
    
    
                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1);// bomb
                    
                    
                    this.update_bonus_map([{'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1);// bomb
    
    
                    this.update_bonus_map([{'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); // bomb
                    
                            this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},						 	
                            {'pos_x': pos_x, 'pos_y': pos_y - 2},
                            {'pos_x': pos_x - 1, 'pos_y': pos_y},
                            {'pos_x': pos_x, 'pos_y': pos_y - 1},
                            {'pos_x': pos_x - 1, 'pos_y': pos_y - 1},
                            {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
            ], explosion_map, gem_id, 3, 1); //crest

            this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                            {'pos_x': pos_x, 'pos_y': pos_y - 2, }, 
                            {'pos_x': pos_x + 1, 'pos_y': pos_y},
                            {'pos_x': pos_x, 'pos_y': pos_y - 1},
                            {'pos_x': pos_x + 1, 'pos_y': pos_y - 1},
                            {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
            ], explosion_map, gem_id, 3, 1); //crest


            this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                            {'pos_x': pos_x, 'pos_y': pos_y + 2},
                            {'pos_x': pos_x, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x + 1, 'pos_y': pos_y},
                            {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true }						 	
            ], explosion_map, gem_id, 3, 1); //crest


            this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},
                            {'pos_x': pos_x, 'pos_y': pos_y + 2},
                            {'pos_x': pos_x, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x - 1, 'pos_y': pos_y},
                            {'pos_x': pos_x - 1, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
            ], explosion_map, gem_id, 3, 1); //crest
                } 
                else if (exp_map.length === 7) {
                    this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},						 	
                        {'pos_x': pos_x, 'pos_y': pos_y - 2},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1},
                        {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
                    ], explosion_map, gem_id, 3, 1); //crest

                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y - 2, }, 
                        {'pos_x': pos_x + 1, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y - 1},
                        {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
                    ], explosion_map, gem_id, 3, 1); //crest


                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y + 2},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x + 1, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true }						 	
                    ], explosion_map, gem_id, 3, 1); //crest


                    this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y + 2},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x - 1, 'pos_y': pos_y},
                        {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); //crest
                }
                else if (exp_map.length >= 8) {
                    this.update_bonus_map([
                        {'pos_x': pos_x, 'pos_y': pos_y + 4},
                        {'pos_x': pos_x, 'pos_y': pos_y + 3},
                        {'pos_x': pos_x, 'pos_y': pos_y + 2},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x , 'pos_y': pos_y, 'mid_point': true}
        ], explosion_map, gem_id, 2, 15, 6); // shar
    
        this.update_bonus_map([
                         {'pos_x': pos_x + 4, 'pos_y': pos_y},
                         {'pos_x': pos_x + 3, 'pos_y': pos_y},
                         {'pos_x': pos_x + 2, 'pos_y': pos_y},
                         {'pos_x': pos_x + 1, 'pos_y': pos_y},
                         {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}							 							 							 							 
        ], explosion_map, gem_id, 2, 15, 3); // shar
                }
                else {
                    if (exp_map.length <= 5) {
                        this.update_bonus_map([
                            {'pos_x': pos_x, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x + 1, 'pos_y': pos_y + 1},
                            {'pos_x': pos_x + 1, 'pos_y': pos_y},
                            {'pos_x': pos_x , 'pos_y': pos_y, 'mid_point': true}
                        ], explosion_map, gem_id, 2, 16); // plane
                    }
                   

                    this.update_bonus_map([
                        {'pos_x': pos_x, 'pos_y': pos_y + 4},
                        {'pos_x': pos_x, 'pos_y': pos_y + 3},
                        {'pos_x': pos_x, 'pos_y': pos_y + 2},
                        {'pos_x': pos_x, 'pos_y': pos_y + 1},
                        {'pos_x': pos_x , 'pos_y': pos_y, 'mid_point': true}
        ], explosion_map, gem_id, 2, 15, 6); // shar
    
        this.update_bonus_map([
                         {'pos_x': pos_x + 4, 'pos_y': pos_y},
                         {'pos_x': pos_x + 3, 'pos_y': pos_y},
                         {'pos_x': pos_x + 2, 'pos_y': pos_y},
                         {'pos_x': pos_x + 1, 'pos_y': pos_y},
                         {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}							 							 							 							 
        ], explosion_map, gem_id, 2, 15, 3); // shar
    
        this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},						 	
                                    {'pos_x': pos_x, 'pos_y': pos_y - 2},
                                    {'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
                    ], explosion_map, gem_id, 3, 1); //crest
        
                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                                     {'pos_x': pos_x, 'pos_y': pos_y - 2, }, 
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}						 							 	
                    ], explosion_map, gem_id, 3, 1); //crest
        
        
                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true }						 	
                    ], explosion_map, gem_id, 3, 1); //crest
        
        
                    this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); //crest
            
                    this.update_bonus_map([{'pos_x': pos_x - 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); // bomb
    
    
                    this.update_bonus_map([{'pos_x': pos_x + 2, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1);// bomb
                    
                    
                    this.update_bonus_map([{'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y + 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1);// bomb
    
    
                    this.update_bonus_map([{'pos_x': pos_x - 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x + 1, 'pos_y': pos_y},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 1},
                                    {'pos_x': pos_x, 'pos_y': pos_y - 2},
                                    {'pos_x': pos_x, 'pos_y': pos_y, 'mid_point': true}
                    ], explosion_map, gem_id, 3, 1); // bomb
                }

            // }
            
        });
        this.allow = true;
        this.strength = 0;
    }

    update_bonus_map(arr, explosion_map, gem_id, bonus_type, bonus_id = 1, substitude_id) {
        var i;
        var pos_x;
        var pos_y;
        var has_bonus = true;
        
        for (i = 0; i < arr.length; i++) {
            pos_x = arr[i]['pos_x'];
            pos_y = arr[i]['pos_y'];
            if (!(pos_y in explosion_map && pos_x in explosion_map[pos_y] && explosion_map[pos_y][pos_x] == gem_id)) {
                
                has_bonus = false;
                break;
            }
        }

        if (has_bonus) {
            for (i = 0; i < arr.length; i++) {
                pos_x = arr[i]['pos_x'];
                pos_y = arr[i]['pos_y'];
                
                if (!(pos_y in this.bonus_map))
                    this.bonus_map[pos_y] = {};
                
                
                if (!(pos_x in this.bonus_map[pos_y]) || (pos_x in this.bonus_map[pos_y] && this.bonus_map[pos_y][pos_x] < bonus_type))										
                    this.bonus_map[pos_y][pos_x] = bonus_type;
                    
                      
            }
            
            this.bonus_map['mid_point'] = arr.findIndex(el => el.mid_point);
            this.bonus_map['bonus_id'] = bonus_id;
            if (substitude_id) {
                
                this.bonus_map['substitude_id'] = substitude_id;
            }
            
    }   
}			

create_bonus_candidates() {
var pos_y;
var pos_x;
var bonus_type = 0;
var bonus_candidates = [];

for (pos_y in this.bonus_map)
    for (pos_x in this.bonus_map[pos_y]) {
        if (+pos_x != null && +pos_y != null) {
            if (this.bonus_map[pos_y][pos_x] > 0) {
                if (bonus_type == this.bonus_map[pos_y][pos_x]) {
                    bonus_candidates.push({'pos_x': pos_x, 'pos_y': pos_y, 'bonus_type': bonus_type, 'mid_point': this.bonus_map['mid_point'], 'bonus_id': this.bonus_map['bonus_id'], 'substitude_id': this.bonus_map['substitude_id']});
                    
                }
                    
                else if (bonus_type <  this.bonus_map[pos_y][pos_x]){	
                    bonus_type = this.bonus_map[pos_y][pos_x];
                    bonus_candidates = [{'pos_x': pos_x, 'pos_y': pos_y, 'bonus_type': bonus_type, 'mid_point': this.bonus_map['mid_point'], 'bonus_id': this.bonus_map['bonus_id'], 'substitude_id': this.bonus_map['substitude_id']}];
                }
            }
        }
        
    }
        

return bonus_candidates;
}				


update_init_types(_field) {				
    var i;
    var j;
    var item_type;
    var obj;
    this.field = _field;
    
    this.init_types = [];
    for (i = 0; i < this.field['cells'].length; i++) {
        this.init_types.push([]);
        for (j = 0; j < this.field['cells'][i].length; j++) {					
            item_type = this.field['items'][i][j];
            obj = {'type': 'random', 'shown': false};
            if (item_type.slice(0, 1) == 'N') {
                obj = {'type': 'normal', 'id': parseInt(item_type.slice(1)), 'shown': false};
            }																				
            else if (item_type.slice(0, 1) == 'M') {
                // obj = {'type': 'mark', 'id': parseInt(item_type.slice(1)), 'shown': false, 'force_mark': true};
                
            }																									
            else if (item_type.slice(0, 1) == 'B') {
                // obj = {'type': 'bottom', 'id': parseInt(item_type.slice(1)), 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'F') {
                // obj = {'type': 'fireball', 'id': parseInt(item_type.slice(1)), 'shown': false};
            }																				
            else if (item_type.slice(0, 1) == 'Q') {
                obj = {'type': 'bonus', 'id': parseInt(item_type.slice(1)), 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'P') {
                obj = {'type': 'passive', 'id': parseInt(item_type.slice(1)), 'shown': false, 'target_id': item_type.slice(2), 'strength': parseInt(item_type.slice(1))};
            }					
            else if (item_type.slice(0, 1) == 'C') {						
                obj = {'type': 'chest', 'id': parseInt(item_type.slice(1)),  'shown': false};
            }
            else if (item_type.slice(0, 1) == 'V') {
                obj = {'type': 'bat', 'id': parseInt(item_type.slice(1)), 'init': true, 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'H') {						
                obj = {'type': 'hog', 'id': parseInt(item_type.slice(1, 2)), 'shown': false, 'strength': parseInt(item_type.slice(1, 2))};
            }
            else if (item_type.slice(0, 1) == 'J') {		
                                
                obj = {'type': 'extra_moves',  'id': 0, 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'S') {		
                                
                obj = {'type': 'switch',  'id': parseInt(item_type.slice(1, 2)), 'shown': false};
                
            }
            else if (item_type.slice(0, 1) == 'R') {						
                obj = {'type': 'rucksack', 'id': 1, 'strength': parseInt(item_type.slice(1)), 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'E') {
                obj = {'type': 'embedded', 'id': parseInt(item_type.slice(1)), 'shown': false, 'strength': 2};
                
            }	
            else if (item_type.slice(0, 1) == 'Z') {			
                            
                obj = {'type': 'big_bottom', 'id': parseInt(item_type.slice(1)), 'shown': false};
            }
            else if (item_type.slice(0, 1) == 'T') {		
                let id = parseInt(item_type.slice(1))	
                            
                obj = {'type': 'paint', 'id': id, 'shown': false};
                this.paint_id = parseInt(item_type.slice(1))
                
            }
            else {
                obj = {'type': 'random', 'shown': false};
            }
            this.init_types[i].push(obj);
        }
    }
                                                
    this.update_random_gems();					
}			
    
update_random_gems() {
    var i;
    var j;
    var iter;
    var gem_info;

    
    for (i = 0; i < this.field['cells'].length; i++) {
        for (j = 0; j < this.field['cells'][i].length; j++) {
            if (this.field['cells'][i][j] != '-' && 
                this.field['cells'][i][j] != 'E' && 
                !('id' in this.init_types[i][j])) {
                iter = 0;
                while(iter < 1500) {
                    iter++;
                    gem_info = this.get_random_gem_info();
                    
                    if (this.allowed_types(this.init_types, i, j, gem_info)) {
                        this.init_types[i][j] = gem_info;
                        break;
                    }
                    else {
                        // console.log(this.init_types, i, j, gem_info)
                    }						
                }										
            }
        }
    }
    
}		
    
get_gem_info(obj) {
    var pos_x = obj['pos_x'];
    var pos_y = obj['pos_y'];
    var level_id = obj['level_id'];
    var res = {};
    // var bonus_id = ('bonus_type' in obj) ? obj['bonus_id'] : -1;
    var bonus_id =('bonus_type' in obj) ? this.get_bonus_id(obj['bonus_type']) : -1;
   
    if (bonus_id > 0) {
        
        res = {'type': 'bonus', 'id': bonus_id};
    }
    else if (obj['test'] && !this.init_types[pos_y][pos_x]['shown']) {
        res = this.init_types[pos_y][pos_x];				
        
    }						
    else if (!this.init_types[pos_y][pos_x]['shown']) {
        res = this.init_types[pos_y][pos_x];				
        this.init_types[pos_y][pos_x]['shown'] = true;
        
        
    }
    else res = this.get_random_gem_info({level_id});
    return res;
}			
    
    check_bonus_type(obj){
        var pos_y = obj['pos_y'];
        var pos_x = obj['pos_x'];
        if (!this.init_types[pos_y][pos_x]['shown'] && this.init_types[pos_y][pos_x]['type'] == 'bonus')
            return this.init_types[pos_y][pos_x]['bonus_type'];
        else
            return -1;
    }
    
    update_gem_bonus(obj) {
        var pos_y = obj['pos_y'];
        var pos_x = obj['pos_x'];
        //var bonus_id = get_bonus_id(obj['bonus_type']);
        //if (bonus_id > 0)
        this.init_types[pos_y][pos_x] = {'type': 'bonus', 'id': obj['bonus_id'], 'bonus_type': obj['bonus_type'], 'shown': false};			
    }
    
    get_bonus_id(bonus_type) {			
	
		if (this.level['possible_bonus'].length > 0) {
			if (!(bonus_type in this.possible_bonuses) || this.possible_bonuses[bonus_type].length == 0)
				this.possible_bonuses[bonus_type] = this.generate_possible_bonuses(bonus_type);
			return 	this.possible_bonuses[bonus_type].pop();
		}
		else 
			return -1;									

	}
    
    generate_possible_bonuses(bonus_type) {
		var possible_bonus = this.level['possible_bonus'];
		var i;
		var bonus1 = [];
		var bonus2 = [];
		var bonus3 = [];
		var bonus;
		var res = [];
		for (i = 0; i < possible_bonus.length; i++) {
			if (possible_bonus[i] <= 6) 
				bonus1.push(possible_bonus[i]);
			else if (possible_bonus[i] <= 12) 
				bonus2.push(possible_bonus[i]);
			else	
				bonus3.push(possible_bonus[i]);
		}

		if (bonus_type == 1)
			bonus = bonus1;
		else if (bonus_type == 2) {
			if (bonus2.length > 0)
				bonus = bonus2;
			else
				bonus = bonus1;
		}
		else if (bonus_type == 3) {
			if (bonus3.length > 0)
				bonus = bonus3;
			else if (bonus2.length > 0)
				bonus = bonus2;				
			else	
				bonus = bonus1;		
		}

		while (bonus.length) {
			i = Math.floor(Math.random() * bonus.length);			
			res.push(bonus[i]);
			bonus.splice(i, 1);
		}


		if (res.length)
			return res;
		else
			return possible_bonus;
	}

    get_hint_pair() {
        var pos_y;
        var pos_x;
        var all_items = [];        
        var all_items2 = [];        
        var item;
        var item2;
        var dirs;
        var res = [];
        
        for (pos_y = 0; pos_y < this.field_items.length; pos_y++)
            for (pos_x = 0; pos_x < this.field_items[0].length; pos_x++)
                if (this.field_items[pos_y][pos_x] && game_data['game_engine']['playing_field'].is_allow_touch_gem({ 'gem': this.field_items[pos_y][pos_x].get_gem(), 'pos': {pos_x, pos_y} }) &&
                    !this.field_items[pos_y][pos_x].is_blocked() &&
                    !this.field_items[pos_y][pos_x].is_intblocked() &&
                    !this.field_items[pos_y][pos_x].is_static() &&
                    (this.field_items[pos_y][pos_x].is_normal() ||
                     this.field_items[pos_y][pos_x].is_mark() ||
                     this.field_items[pos_y][pos_x].is_bonus())) {
                         
                        all_items.push({'pos_x': pos_x, 'pos_y': pos_y});
                        all_items2.push({'pos_x': pos_x, 'pos_y': pos_y});
                     }
                    

        dirs = [[1, 0], [0, 1]];
        
        res = this.iterate_hints(0, all_items, dirs, item, item2, res);
        res = this.iterate_hints(1, all_items2, dirs, item, item2, res);
        // if (res[4]) {
            
        //     res[4].push({pos_x: res[0]['pos_x'], pos_y: res[0]['pos_y']})
        //     res[4].push({pos_x: res[1]['pos_x'], pos_y: res[1]['pos_y']})
        // }  
        return res;     
    }			

    iterate_hints(ind, all_items, dirs, item, item2, res) {
        let dir = dirs[ind];
        while (all_items.length) {
            
            ind = Math.floor(Math.random() * all_items.length);
            item = all_items[ind];
            all_items.splice(ind, 1);
            item2 = {'pos_y': item['pos_y'] + dir[0], 'pos_x': item['pos_x'] + dir[1]};

            if (item2['pos_y'] < this.field_items.length && item2['pos_x'] < this.field_items[0].length &&
                this.field_items[item2['pos_y']][item2['pos_x']] && 
                !this.field_items[item2['pos_y']][item2['pos_x']].is_empty() && 
                !this.field_items[item2['pos_y']][item2['pos_x']].is_blocked() && 
                !this.field_items[item2['pos_y']][item2['pos_x']].is_intblocked() &&
                !this.field_items[item2['pos_y']][item2['pos_x']].is_static() &&
                (this.field_items[item['pos_y']][item['pos_x']].is_bonus() ||
                this.field_items[item2['pos_y']][item2['pos_x']].is_bonus() ||             
                 this.check_swap(item, item2))) {
                    res = this.get_optimal_hint(item, item2, res);
                }			
        }

        return res;
    }

    get_optimal_hint(item, item2, res) {
        let {amount, tile, holes, id} = this.check_swap(item, item2, true);
        
        if (item['id'] === id) {
            item['type'] = '3'
            item2['type'] = '2'
        }
        else if (item2['id'] === id) {
            item2['type'] = '3'
            item['type'] = '2'
        }
        
        if (!res.length || amount > res[2]) {
            res = [item, item2, amount, tile, holes];
        }
        
        if (!res.length || (amount === res[2] && tile > res[3])) {
            res = [item, item2, amount, tile, holes];   
        }

        holes.push(item)
        holes.push(item2)
        
        return res;
    }		

	allowed_types(map_types, pos_y, pos_x, map_info){
        // try {
		if (pos_x > 1 && 
			map_types[pos_y][pos_x - 2]['type'] == map_info['type'] && map_types[pos_y][pos_x - 2]['id'] == map_info['id'] &&
			map_types[pos_y][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y][pos_x - 1]['id'] == map_info['id'])
			return false;

		if (pos_x > 0 && 
			pos_x < map_types[pos_y].length - 1 && 
			map_types[pos_y][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y][pos_x - 1]['id'] == map_info['id'] &&
			map_types[pos_y][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y][pos_x + 1]['id'] == map_info['id'])
			return false;

		if (pos_x < map_types[pos_y].length - 2 && 
			map_types[pos_y][pos_x + 2]['type'] == map_info['type'] && map_types[pos_y][pos_x + 2]['id'] == map_info['id'] &&
			map_types[pos_y][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y][pos_x + 1]['id'] == map_info['id'])
			return false;

		if (pos_y > 1 && 
			map_types[pos_y - 2][pos_x]['type'] == map_info['type'] && map_types[pos_y - 2][pos_x]['id'] == map_info['id'] &&
			map_types[pos_y - 1][pos_x]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x]['id'] == map_info['id'])
			return false;

		
            if (pos_y > 0 && 
                pos_y < map_types.length - 1 && 
                map_types[pos_y - 1][pos_x]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x]['id'] == map_info['id'] &&
                map_types[pos_y + 1][pos_x]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x]['id'] == map_info['id'])
                return false;
       
       
		if (pos_y < map_types.length - 2 && 
			map_types[pos_y + 2][pos_x]['type'] == map_info['type'] && map_types[pos_y + 2][pos_x]['id'] == map_info['id'] &&
			map_types[pos_y + 1][pos_x]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x]['id'] == map_info['id'])
			return false;

        if (
            pos_x >= 0 && pos_y >= 0 && pos_x < map_types[pos_y].length - 2 && pos_y < map_types.length - 2 &&
            map_types[pos_y][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y][pos_x + 1]['id'] == map_info['id'] &&
            map_types[pos_y + 1][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x + 1]['id'] == map_info['id'] &&
            map_types[pos_y + 1][pos_x]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x]['id'] == map_info['id']
            ) return false
        if (
            pos_x >= 1 && pos_y >= 0 && pos_x < map_types[pos_y].length - 1 && pos_y < map_types.length - 2 &&
            map_types[pos_y][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y][pos_x - 1]['id'] == map_info['id'] &&
            map_types[pos_y + 1][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x - 1]['id'] == map_info['id'] &&
            map_types[pos_y + 1][pos_x]['type'] == map_info['type'] && map_types[pos_y + 1][pos_x]['id'] == map_info['id']
            ) return false
        if (
            pos_x >= 0 && pos_y >= 1 && pos_x < map_types[pos_y].length - 2 && pos_y < map_types.length - 1 &&
            map_types[pos_y][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y][pos_x + 1]['id'] == map_info['id'] &&
            map_types[pos_y - 1][pos_x + 1]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x + 1]['id'] == map_info['id'] &&
            map_types[pos_y - 1][pos_x]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x]['id'] == map_info['id']
            ) return false
        if (
            pos_x >= 1 && pos_y >= 1 && pos_x < map_types[pos_y].length - 1 && pos_y < map_types.length - 1 &&
            map_types[pos_y][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y][pos_x - 1]['id'] == map_info['id'] &&
            map_types[pos_y - 1][pos_x - 1]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x - 1]['id'] == map_info['id'] &&
            map_types[pos_y - 1][pos_x]['type'] == map_info['type'] && map_types[pos_y - 1][pos_x]['id'] == map_info['id']
            ) return false
    
		return true;
	}		


	check_swap(item1, item2, hint = false) {
        let pos1_x = item1['pos_x'];
        let pos1_y = item1['pos_y'];
        let pos2_x = item2['pos_x'];
        let pos2_y = item2['pos_y'];
        let type1 = this.field_items[pos1_y][pos1_x].get_gem_type()
        let type2 = this.field_items[pos2_y][pos2_x].get_gem_type()
        if (![type1, type2].includes('big_bottom')) {
            let dx = pos2_x - pos1_x;
            let dy = pos2_y - pos1_y;
            
            let id1 = this.field_items[pos1_y][pos1_x].get_gem_id()
            let id2 = this.field_items[pos2_y][pos2_x].get_gem_id()
            item1['id'] = id1
            item2['id'] = id2
            let obj1 = {'pos_x': pos1_x, 'pos_y': pos1_y, 'gem_id': this.field_items[pos2_y][pos2_x].get_gem_id(), 'gem_type': this.field_items[pos2_y][pos2_x].get_gem_type(), 'amount': 1, 'tiled': 0, 'type': 3, 'holes': []};
            let obj2 = {'pos_x': pos1_x, 'pos_y': pos1_y, 'gem_id': this.field_items[pos2_y][pos2_x].get_gem_id(), 'gem_type': this.field_items[pos2_y][pos2_x].get_gem_type(), 'amount': 1, 'tiled': 0, 'type': 3, 'holes': []};
            let obj3 = {'pos_x': pos2_x, 'pos_y': pos2_y, 'gem_id': this.field_items[pos1_y][pos1_x].get_gem_id(), 'gem_type': this.field_items[pos1_y][pos1_x].get_gem_type(), 'amount': 1, 'tiled': 0, 'type': 2, 'holes': []};
            let obj4 = {'pos_x': pos2_x, 'pos_y': pos2_y, 'gem_id': this.field_items[pos1_y][pos1_x].get_gem_id(), 'gem_type': this.field_items[pos1_y][pos1_x].get_gem_type(), 'amount': 1, 'tiled': 0, 'type': 2, 'holes': []} ;
            let obj5 = {'pos_x': pos1_x, 'pos_y': pos1_y, 'gem_id': this.field_items[pos2_y][pos2_x].get_gem_id(), 'gem_type': this.field_items[pos2_y][pos2_x].get_gem_type(), 'is_tiled': this.field_items[pos2_y][pos2_x].is_tiled(), 'amount': 1, 'tiled': 0,};
            let obj6 = {'pos_x': pos1_x, 'pos_y': pos1_y, 'gem_id': this.field_items[pos2_y][pos2_x].get_gem_id(), 'gem_type': this.field_items[pos2_y][pos2_x].get_gem_type(), 'is_tiled': this.field_items[pos2_y][pos2_x].is_tiled(), 'amount': 1, 'tiled': 0};
            let obj7 = {'pos_x': pos2_x, 'pos_y': pos2_y, 'gem_id': this.field_items[pos1_y][pos1_x].get_gem_id(), 'gem_type': this.field_items[pos1_y][pos1_x].get_gem_type(), 'is_tiled': this.field_items[pos2_y][pos2_x].is_tiled(), 'amount': 1, 'tiled': 0};
            let obj8 = {'pos_x': pos2_x, 'pos_y': pos2_y, 'gem_id': this.field_items[pos1_y][pos1_x].get_gem_id(), 'gem_type': this.field_items[pos1_y][pos1_x].get_gem_type(), 'is_tiled': this.field_items[pos2_y][pos2_x].is_tiled(), 'amount': 1, 'tiled': 0};		
            obj5['reverse_info'] = { ...obj7 }
            obj6['reverse_info'] = { ...obj8 }
            obj8['reverse_info'] = { ...obj6 }
            obj7['reverse_info'] = { ...obj5 }
            
                
            if (dx != -1) {
                if (game_data['engine_config']['square']) {
                    this.check_match4_item(obj5, -1, 0);
                
                    this.check_match4_item(obj7, 1, 0);
                }
                
                
                // if (obj5['amount'] > 0 && obj5['amount'] < 4)
                this.check_match3_item(obj1, 0, 0, -1, 0);
                // if (obj7['amount'] > 0 && obj7['amount'] < 4)
                this.check_match3_item(obj3, 0, 0, 1, 0);
               
                
            }
            if (dx != 1) {
                if (game_data['engine_config']['square']) {
                    if (obj5['amount'] >= 0 && obj5['amount'] < 4) {
                        obj5['amount'] = 1
                        this.check_match4_item(obj5, 1, 0);
                    }
                    
                    if (obj7['amount'] >= 0 && obj7['amount'] < 4) {
                        obj7['amount'] = 1
                        this.check_match4_item(obj7, -1, 0);
                    }
                }
                
                
                // if (obj1['amount'] > 0 && obj1['amount'] < 4)
                this.check_match3_item(obj1, 0, 0, 1, 0);
                // if (obj3['amount'] > 0 && obj3['amount'] < 4)
                this.check_match3_item(obj3, 0, 0, -1, 0);
               
            }
            if (dy != -1) {
                if (game_data['engine_config']['square']) {
                    if (obj6['amount'] >= 0 && obj6['amount'] < 4) {
                        obj6['amount'] = 1
                        this.check_match4_item(obj6, 0, -1);
                        
                    }
                    
                    if (obj8['amount'] >= 0 && obj8['amount'] < 4) {
                        obj8['amount'] = 1
                        this.check_match4_item(obj8, 0, 1);
                    }
                }
               
                
                // if (obj2['amount'] > 0 && obj2['amount'] < 4)
                this.check_match3_item(obj2, 0, 0, 0, -1);
                // if (obj4['amount'] > 0 && obj4['amount'] < 4)
                this.check_match3_item(obj4, 0, 0, 0, 1);
            }
            if (dy != 1) {
                if (game_data['engine_config']['square']) {
                    if (obj6['amount'] >= 0 && obj6['amount'] < 4) {
                        obj6['amount'] = 1
                        this.check_match4_item(obj6, 0, 1);
                        
                    }
                    
                    if (obj8['amount'] >= 0 && obj8['amount'] < 4) {
                        obj8['amount'] = 1
                        this.check_match4_item(obj8, 0, -1);
                    }
                }
                
                
                // if (obj2['amount'] > 0 && obj2['amount'] < 4)
                this.check_match3_item(obj2, 0, 0, 0, 1);
                // if (obj4['amount'] > 0 && obj4['amount'] < 4)
                this.check_match3_item(obj4, 0, 0, 0, -1);
              
            }
            
            if (hint) {
                let amount = Math.max(obj1['amount'], obj2['amount'], obj3['amount'], obj4['amount'])
                let holes = []
                let id
                if (amount === obj1['amount']) {
                    holes = [...obj1['holes']]
                    if (item1['pos_x'] === obj1['pos_x'] && item1['pos_y'] === obj1['pos_y']) id = item1['id']
                    else if (item2['pos_x'] === obj1['pos_x'] && item2['pos_y'] === obj1['pos_y']) id = item2['id']
                }
                else if (amount === obj2['amount']) {
                    holes = [...obj2['holes']] 
                    if (item1['pos_x'] === obj2['pos_x'] && item1['pos_y'] === obj2['pos_y']) id = item1['id']
                    else if (item2['pos_x'] === obj2['pos_x'] && item2['pos_y'] === obj2['pos_y']) id = item2['id']
                }
                else if (amount === obj3['amount']) {
                    holes = [...obj3['holes']]
                    if (item1['pos_x'] === obj3['pos_x'] && item1['pos_y'] === obj3['pos_y']) id = item1['id']
                    else if (item2['pos_x'] === obj3['pos_x'] && item2['pos_y'] === obj3['pos_y']) id = item2['id']
                }
                else if (amount === obj4['amount']) {
                    holes = [...obj4['holes']]
                    if (item1['pos_x'] === obj4['pos_x'] && item1['pos_y'] === obj4['pos_y']) id = item1['id']
                    else if (item2['pos_x'] === obj4['pos_x'] && item2['pos_y'] === obj4['pos_y']) id = item2['id']
                }
                holes.forEach(hole => hole.type = '1')
                
                return {
                    'amount': amount,
                    'tile': obj1['tiled'] + obj2['tiled'] + obj3['tiled'] + obj4['tiled'],
                    'holes': holes,
                    'id': id
                };
            }
            
            return (obj1['amount'] >= 3 || obj2['amount'] >=3 || obj3['amount'] >= 3 || obj4['amount'] >= 3  || obj5['amount'] >= 4 || obj6['amount'] >= 4 || obj7['amount'] >= 4 || obj8['amount'] >= 4);
        }
        
		return false
	}
	
    check_match4_item(obj, dir_x, dir_y) {
		let pos_x = obj['pos_x'];
		let pos_y = obj['pos_y'];
        if (dir_x === 1) {
           
            // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y + 1})
            this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y + 1})
            this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y})
            
            if (obj['amount'] >= 1 && obj['amount'] < 4) {
                obj['amount'] = 1
                // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y - 1})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y - 1})
            }
            
            
        }
        else if (dir_x === -1) {
            
            // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y + 1})
            this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y + 1})
            
            if (obj['amount'] >= 1 && obj['amount'] < 4) {
                obj['amount'] = 1
                // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y - 1})
                this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y - 1})
            }
            
        }
        else if (dir_y === 1) {
            // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y - 1})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y - 1})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y})

            if (obj['amount'] >= 1 && obj['amount'] < 4) {
                obj['amount'] = 1
                // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y - 1})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y - 1})
            }

        }
        else if (dir_y === -1) {
            // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y})
            this.check_gems_identical(obj, {pos_x: pos_x - 1, pos_y: pos_y + 1})
            this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y + 1})

            
            if (obj['amount'] >= 1 && obj['amount'] < 4) {
                obj['amount'] = 1
                // this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y})
                this.check_gems_identical(obj, {pos_x: pos_x + 1, pos_y: pos_y + 1})
                this.check_gems_identical(obj, {pos_x: pos_x, pos_y: pos_y + 1})
            }
            
        }



    }

    check_gems_identical(gem, field_item) {
        var gem_id;
		var gem_tile;
		var _gem_type;
		var reverse_info = gem['reverse_info'];
        let {pos_x, pos_y, gem_id : id, gem_type} = gem
        let {pos_x : fpos_x, pos_y: fpos_y} = field_item
        let res = false
        
        if (this.field_items[fpos_y] && this.field_items[fpos_y][fpos_x] && !this.field_items[fpos_y][fpos_x].is_empty() &&
        !this.field_items[fpos_y][fpos_x].is_dynamical() &&
        !this.field_items[fpos_y][fpos_x].is_trapped() &&
        this.field_items[fpos_y][fpos_x].is_removable()) {
            if (!(fpos_y == reverse_info['pos_y'] && fpos_x == reverse_info['pos_x'])) {
                gem_id = this.field_items[fpos_y][fpos_x].get_gem_id();
				_gem_type = this.field_items[fpos_y][fpos_x].get_gem_type();
				gem_tile = this.field_items[fpos_y][fpos_x].is_tiled();
            }
            else {

                gem_id = reverse_info['gem_id']
                _gem_type = reverse_info['gem_type']
                gem_tile = reverse_info['is_tiled']
                
            }
                
                if (gem_id === id && gem_type === _gem_type) {
                    gem['amount']++
                    if (gem_tile) gem['tiled']++
                }
        }
    }
	
	check_match3_item(obj, dx, dy, dir_x, dir_y) {
		var gem_id;
		var gem_type;
		var gem_tile;
		dx += dir_x;
		dy += dir_y;
		var pos_x = obj['pos_x'];
		var pos_y = obj['pos_y'];
		
		if (pos_y + dy >= 0 && pos_y + dy <= this.field_items.length - 1 && 
			pos_x + dx >= 0 && pos_x + dx <= this.field_items[pos_y + dy].length - 1 &&
			this.field_items[pos_y + dy][pos_x + dx] && 
			!this.field_items[pos_y + dy][pos_x + dx].is_empty() &&
			!this.field_items[pos_y + dy][pos_x + dx].is_dynamical() &&
			!this.field_items[pos_y + dy][pos_x + dx].is_trapped() &&
			this.field_items[pos_y + dy][pos_x + dx].is_removable())
			{
				gem_id = this.field_items[pos_y + dy][pos_x + dx].get_gem_id();
				gem_type = this.field_items[pos_y + dy][pos_x + dx].get_gem_type();
				gem_tile = this.field_items[pos_y + dy][pos_x + dx].is_tiled();
				if (gem_id == obj['gem_id'] && gem_type == obj['gem_type']) {
                    obj['amount']++;
                    if (obj['holes']) obj['holes'].push({pos_x: pos_x + dx, pos_y: pos_y + dy})
                    obj['type'] = '3'
                    if (gem_tile) obj['tiled']++;
					this.check_match3_item(obj, dx, dy, dir_x, dir_y);
				}
			}
	}

	
    
    neighbours(gem1, gem2){
		var item1 = gem1.get_pos ? gem1.get_pos() : gem1;
		var item2 = gem2.get_pos ? gem2.get_pos() : gem2;
		if (Math.abs(item1['pos_x'] - item2['pos_x']) + Math.abs(item1['pos_y'] - item2['pos_y']) == 1)
			return true;
		else
			return false;
	}					
                    
    get_random_gem_info() {
		var ind = Math.floor(Math.random() * (this.level['possible_normal'].length + this.level['possible_mark'].length + this.level['extra_moves']));
		if (ind < this.level['possible_normal'].length) {
            if (get_passed_amount() <= 5 && Math.random() <= 0.2 && this.level['target_normal'] && this.level['target_normal'].length > 0) {
                let targets = JSON.parse(JSON.stringify(game_data.game_play.game_engine.targets_manager.get_targets())).filter(el => el.amount > 0)
                let random_target = Phaser.Utils.Array.GetRandom(targets)
                let id
                if (random_target) {
                    id = random_target['id']
                    return {'type': 'normal', 'id': id};
                }
            }
			return {'type': 'normal', 'id': this.level['possible_normal'][ind]};
        }
        else {
            let rand = Math.random()
            if (rand < 0.2 && this.level['extra_moves']) {
                return {'type': 'extra_moves', 'id': 0};
            }
            else if (this.level['possible_mark'].length) {
                return {'type': 'mark', 'id': this.level['possible_mark'][ind - this.level['possible_normal'].length]};
            }
			
            else {
                ind = Math.floor(Math.random() * (this.level['possible_normal'].length));
                return {'type': 'normal', 'id': this.level['possible_normal'][ind]};
            }
        }
	}							
    
    reset_combo() {
        this.combo = 0;
    }

    update_combo() {
        this.combo++;
    }

    get_combo_coef() {
        if (this.combo > 5)
            return 6;
        else	
            return this.combo + 1;
    }

    check_bottom(obj) {
        var pos_y = obj['pos_y'];
        var pos_x = obj['pos_x'];
        return (pos_y == this.field_items.length - 1 || this.field_items[pos_y + 1][pos_x] == null);
    }
                    
    copy_array(arr) {
        var res = new Array();
        for (var i = 0; i < arr.length; i++)
            res.push(arr[i]);
            
        return res;
    }		
    
    array_remove(pos_x, arr) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i] == pos_x) {
                arr.splice(i, 1);
                return true;
            }
        return false;
    }		
    
    get_unique(arr1) {
        var i; 
        var j;
        var allow = true;
        var arr2 = new Array();
        
        for (i = 0; i < arr1.length; i++) {
            allow = true;
            for (j = 0; j < arr2.length; j++) 
                if (arr1[i]['pos_x'] == arr2[j]['pos_x'] && arr1[i]['pos_y'] == arr2[j]['pos_y']) {
                    allow = false;
                    break;
                }
                
            if (allow)
                arr2.push(arr1[i]);
        }
        return arr2;
    }		
    
    handler_event(obj) {
        //dispatchEvent(new ExtendedEvent(event.type, event.params));        
    }
    
    clean_attr() {
        this.attr['level_active'] = false;
    }
    
    destroy_level() {
        this.clean_attr();
    }
}