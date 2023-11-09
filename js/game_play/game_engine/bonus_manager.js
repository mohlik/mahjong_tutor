﻿class BonusManager{
	constructor(){

    }
    
    init(params) { 
        this.emitter = new Phaser.Events.EventEmitter();
        this.scene = params['scene'];
        this.gems_manager = params['gems_manager'];
        this.moving_holder = params['moving_holder'];
        this.boosters_panel = params['boosters_panel'];


        this.scene.anims.create({ key: 'fire_anim', frames: this.scene.anims.generateFrameNames('common1', {prefix: 'fire_anim', end: 2, zeroPad: 4 }), repeat: -1 });
        this.scene.anims.create({ key: 'lightning_line', frames: this.scene.anims.generateFrameNames('common1', {prefix: 'lightning_line', end: 10, zeroPad: 4 }), repeat: -1 });
        this.scene.anims.create({ key: 'lightning_point', frames: this.scene.anims.generateFrameNames('common1', {prefix: 'lightning_point', end: 9, zeroPad: 4 }), repeat: -1 });
        
        game_data['bonus_cursor_active'] = false;
        this.is_bonus_anim = false
        
    }
    
    update_manager(params) {
        this.field_items = params['field_items'];
        this.level_id = params['level_id'];
        this.level = params['level'];
        this.fire_active = false;
        this.reshuffling = false;
        //setTimeout(() => {this.shuffle_gems()}, 5000);
    }


    
    explode_bonuses(max, on_complete) {  
        game_data['error_history'].push('gpbm1'); 
        var _this = this;      
        var bonuses = this.get_bonuses();
        if (bonuses['total'] > 0 && max > 0) {
            if (bonuses['items'].length > 0) {
                var ind = Math.floor(Math.random() * bonuses['items'].length);
                var item = bonuses['items'][ind];
                this.apply_bonus(item);
            }
            if (max > 0) {
                max--;
                this.scene.time.delayedCall(400, function(){
                    _this.explode_bonuses(max, on_complete);   
                }, [], this);
            }
        }
        else {
            on_complete();
        }
    }

    get_bonuses() {
        var possible_items = [];
        var total = 0;
        for (var i = 0; i < this.field_items.length; i++)				
            for (var j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && this.field_items[i][j].is_bonus())  {
                    total++;
                    if (!this.field_items[i][j].is_dynamical())
                        possible_items.push({'pos_y': i, 'pos_x': j, 'id': this.field_items[i][j].get_gem().get_id()});
                }
                    
        return {'items': possible_items, 'total': total};		
        
    }

    
    apply_bonus(obj) {
        var bonus_id = obj['id'];
        this.is_bonus_anim = true
        clearTimeout(this.batd)
        this.batd = setTimeout(() => {
            this.is_bonus_anim = false
        }, 650)
        
        switch (bonus_id) {
            case 1:
                this.apply_bonus1(obj);
            break;
            case 2:
                this.apply_bonus2(obj);
            break;
            case 3:
                this.apply_bonus3(obj);
            break;
            case 4:
                this.apply_bonus4(obj);
            break;
            case 5:
                this.apply_bonus5(obj);
            break;
            case 6:
                this.apply_bonus6(obj);
            break;				
            case 7:
                this.apply_bonus7(obj);
            break;				
            case 8:
                this.apply_bonus8(obj);
            break;				
            case 9:
                this.apply_bonus9(obj);
            break;				
            case 10:
                this.apply_bonus10(obj);
            break;				
            case 11:
                this.apply_bonus11(obj);
            break;				
            case 12:
                this.apply_bonus12(obj);
            break;				
            case 13:
                this.apply_bonus13(obj);
            break;	
            case 14:
                this.apply_bonus14(obj);
            break;	
            case 15:
                this.apply_bonus15(obj);
            break;	
            case 16:
                this.apply_bonus16(obj);
            break;									
        }
        this.emitter.emit("EVENT", {'event': 'MAKE_QUAKE'});
    }

    is_bonus_playing() {
        return this.is_bonus_anim
    }
    
    remove_iteration_items(arr) {        
        var i;
        var gem;
        var obj;
      
        for (i = 0; i < arr.length; i++) {	
            gem = arr[i].get_gem();		
            obj = arr[i].get_pos();			
            arr[i].add_tint();
            
            if (!(gem && (gem.get_type() == 'bottom' || gem.get_type() == 'fireball' || gem.is_invulnerable() || (gem.attr['id'] === 15 && gem.attr['type'] === 'bonus'))))
                this.emitter.emit('EVENT', {'event': 'REMOVE_GEM', 'pos_x': obj['pos_x'], 'pos_y': obj['pos_y'], 'soft': true});     
            else if (!gem) {
                this.emitter.emit('EVENT', {'event': 'REMOVE_GEM', 'pos_x': obj['pos_x'], 'pos_y': obj['pos_y']}); 
            }   
            else if (gem && gem.is_invulnerable() && arr[i]) {
                if (arr[i].is_tiled && arr[i].is_tiled()) {
                    console.log('remove invulnerable tile');
                    if (arr[i].remove_tile)
                    arr[i].remove_tile();
                }
                    arr[i].check_obstacle_remove();
                    
               
            }    
        }	
        this.reset_invulnerable();
        setTimeout(() => {
            if (game_data['game_engine']['playing_field']['gems_manager']['gems_utils'].get_hint_pair().length === 0) game_data['game_engine']['playing_field']['gems_manager'].check_reshuffle();
        }, 1000);
    }	
    
    reset_invulnerable() {
        this.field_items.forEach(by_y => {
            if (by_y) {
                by_y.forEach(el  => {
                    if (el) {
                        let gem = el.get_gem();
                        if (gem && gem.is_invulnerable()) {
                            gem.set_invulnerable(false);
                        }
                    }
                    
                });            
            }
        });

    }

    update_freeze(arr, flag) {   
           
        var gem;
        

        for (var i = 0; i < arr.length; i++) {
            
            gem = arr[i].get_gem();
            if (flag) {
                if (gem && (gem.get_type() == 'normal' || gem.get_type() == 'bonus' || gem.get_type() == 'money' || gem.get_type() == 'passive'))
                    arr[i].freeze();
            }
            else {
                arr[i].unfreeze();
            }				
        }
        if (!flag)
            this.emitter.emit('EVENT', {'event': 'SET_EXPLODED_GEMS'});
            
    }		
    
    
    iterative_explode(destroy_items, delay, on_complete) {
        var _this = this;
        var i;									
        var iteration_items = destroy_items.shift()
        this.remove_iteration_items(iteration_items);
        
        if (destroy_items.length > 0) {            
            this.scene.time.delayedCall(delay, function(){
                _this.iterative_explode(destroy_items, delay, on_complete);	
            }, [], this);			
        }				
        else
            on_complete();
    }
    
    
    apply_bonus1(obj) {      
        var i;
        var j;			
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        // console.log(obj['swapped_gem'].is_bonus());
        // console.log(this.gems_manager.gems_utils.check_explode(obj['swapped_gem']));
        var bonus_obj = {'span': 2, 'unfreeze_delay': 300};
        var obj;
        var _this = this;
        
        this.emitter.emit('EVENT', {'event': 'BONUS_ANIM', 'type': 'bonus1'});
        var iteration_items = new Array();

        for (i = 0; i < this.field_items.length; i++)
            for (j = 0; j < this.field_items[i].length; j++) {
                if (this.field_items[i][j]  && Math.abs(i - pos_y) < bonus_obj['span'] && Math.abs(j - pos_x) < bonus_obj['span'])
                iteration_items.push(this.field_items[i][j]);
            }
                
                    
                              
                    
                    // debugger
        // this.update_freeze(iteration_items, true);
        this.play_bonus_anim1(obj, function(){				
            _this.remove_iteration_items(iteration_items);
            _this.scene.time.delayedCall(bonus_obj['unfreeze_delay'], function(){
                // _this.update_freeze(iteration_items, false);
            }, [], this);
        });
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use1'});
    }
    
    apply_bonus2(obj) {
        var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var destroy_items;
        var iteration_items;
        var bonus_obj = {'span': 3,'iter_delay': 50};
        
        destroy_items = [];
        destroy_items.push([this.field_items[pos_y][pos_x]]);
        
        for (span = 1; span <= bonus_obj['span']; span++) {
            iteration_items = [];
            if ((pos_x - span >= 0) && (pos_y - span >= 0) &&
                this.field_items[pos_y - span][pos_x - span])
                iteration_items.push(this.field_items[pos_y - span][pos_x - span]);
                
            if ((pos_x - span >= 0) && (pos_y + span < this.field_items.length) &&
                this.field_items[pos_y + span][pos_x - span])
                iteration_items.push(this.field_items[pos_y + span][pos_x - span]);
                
            if ((pos_x + span < this.field_items[pos_y].length) && (pos_y - span >= 0) &&
                this.field_items[pos_y - span][pos_x + span])
                iteration_items.push(this.field_items[pos_y - span][pos_x + span]);
                
            if ((pos_x + span < this.field_items[pos_y].length) && (pos_y + span < this.field_items.length) &&
                this.field_items[pos_y + span][pos_x + span])
                iteration_items.push(this.field_items[pos_y + span][pos_x + span]);					
            
            destroy_items.push(iteration_items);
        }			

        this.play_bonus_anim2(obj, function(){});						
        this.iterative_explode(destroy_items, bonus_obj['iter_delay'], this.dummy_function);
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use2'});
        
    }		
    
    
    get_overlap_image(el) {
        if (el.is_tiled()) return el.get_tile();
        if (el.is_blocked()) return el.get_block();
        if (el.is_locked()) return el.get_lock();
    }

    apply_bonus3(obj) {
        // var _this = this;
        // var i;
        // var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        // var destroy_items;
        var iteration_items = [];
        // var bonus_obj = {'iter_delay': 75};
        // var anim_attr = {'up': 0, 'down': 0};
        // var frozen_items = [];
        // destroy_items = [];
        // destroy_items.push([this.field_items[pos_y][pos_x]]);
        // frozen_items.push(this.field_items[pos_y][pos_x]);
        this.emitter.emit('BONUS_ANIM', {'type': 'bonus3'});
        //dispatchEvent(new ExtendedEvent("BONUS_ANIM", {'type': 'bonus3'}));
        // span = 1;
        
        this.field_items.forEach(row => {
            iteration_items = [...iteration_items, ...row];
        });
        iteration_items = iteration_items.filter(el => el);
        this.play_bonus_anim3(obj, rocket => {
            iteration_items.forEach(el => {
                let gem = el.get_gem();
                // if (el.is_empty()) {
                    
                //     console.log(el.is_locked());
                // }
                if ((el.is_tiled() || el.is_blocked() || el.is_locked()) && el.is_empty() ) {
                    let img = this.get_overlap_image(el);
                    if (game_data['utils'].checkOverlap(rocket, img, 'vertical')) {
                        let elem = iteration_items.splice(iteration_items.indexOf(el), 1);
                        this.remove_iteration_items(elem);
                    }
                }
                else if (gem) {
                    gem = gem.gem_content;
                    
                    if (game_data['utils'].checkOverlap(rocket, gem, 'vertical')) {
                        let elem = iteration_items.splice(iteration_items.indexOf(el), 1);
                        this.remove_iteration_items(elem);
                    }
                }
                    
                
            });
        });	
        // while (pos_y - span >= 0 || pos_y + span < this.field_items.length) {
        //     iteration_items = [];
        //     //if (anim_attr['up'] == 0) {
        //         if ((pos_y - span) >= 0 && this.field_items[pos_y - span][pos_x]) 
        //             iteration_items.push(this.field_items[pos_y - span][pos_x]);					
        //      //   else
        //      //       anim_attr['up'] = span;
        //     //}
                
        //     //if (anim_attr['down'] == 0) {
        //         if ((pos_y + span) < this.field_items.length && this.field_items[pos_y + span][pos_x]) 
        //             iteration_items.push(this.field_items[pos_y + span][pos_x]);						
        //       //  else
        //       //      anim_attr['down'] = span;
        //     //}
                
            
        //     destroy_items.push(iteration_items);					
        //     for (i = 0; i < iteration_items.length; i++)
        //         frozen_items.push(iteration_items[i]);
            
                
        //     span++;
        // }
                    
       
        // this.update_freeze(frozen_items, true);  
        // this.iterative_explode(destroy_items, bonus_obj['iter_delay'], function(){
        //     _this.update_freeze(frozen_items, false);				
        // });
        // this.play_bonus_anim3(obj, anim_attr);
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use3'});
    }
    
    apply_bonus4(obj) {
        var _this = this;
        var i; 
        var j;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];        
        var iteration_items;			
        var bonus_obj = {			
			'span': 2,
			'iter_delay': 50,
			'start_delay': 300
		};
                
        iteration_items = [];
        for (i = 0; i < this.field_items.length; i++)
            for (j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && 
                   ((Math.abs(i - pos_y) < bonus_obj['span'] && Math.abs(j - pos_x) < bonus_obj['span']) ||
                    (Math.abs(i - pos_y) < (bonus_obj['span'] + 1) && j == pos_x) ||
                    (Math.abs(j - pos_x) < (bonus_obj['span'] + 1) && i == pos_y))){
                     iteration_items.push(this.field_items[i][j]);                    					
                }								
        
        this.play_bonus_anim4(obj, function(){});						
        
        this.scene.time.delayedCall(bonus_obj['start_delay'], function(){
            _this.iterative_explode([iteration_items], bonus_obj['iter_delay'], _this.dummy_function);
        }, [], this);
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use4'});
    }	
    
    apply_bonus5(obj) {	
        // debugger	
        var _this = this;	
        var span;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var destroy_items;
        var iteration_items;			
        var bonus_obj = {
			'span': 5,
			'iter_delay': 0,
			'start_delay': 0
		};
        
        destroy_items = [];
        destroy_items.push([this.field_items[pos_y][pos_x]]);
        
        for (span = 1; span <= bonus_obj['span']; span++) {
            iteration_items = [];
            if ((pos_y - span >= 0) && this.field_items[pos_y - span][pos_x])
                iteration_items.push(this.field_items[pos_y - span][pos_x]);
                
            if ((pos_x - span >= 0) && this.field_items[pos_y][pos_x - span])
                iteration_items.push(this.field_items[pos_y][pos_x - span]);

            if ((pos_y + span < this.field_items.length) &&
                this.field_items[pos_y + span][pos_x])
                iteration_items.push(this.field_items[pos_y + span][pos_x]);					

            if ((pos_x + span < this.field_items[pos_y].length) &&
                this.field_items[pos_y][pos_x + span])
                iteration_items.push(this.field_items[pos_y][pos_x + span]);
                
            
            destroy_items.push(iteration_items);
        }
        
        // all items by vertical and horizontal
        // let arr = [...this.field_items[pos_y]].filter(elem => elem);
		// 				this.field_items.forEach(by_y => {
		// 					if (by_y) {
		// 						let arr2 = by_y.filter(by_x => by_x && by_x.pos_x === pos_x);
		// 						arr = [...arr, ...arr2];
		// 					}
		// 				});
        
        // iteration_items = [...arr];
        // destroy_items.push(iteration_items);
        this.play_bonus_anim5(obj, function(){});						
        

        this.scene.time.delayedCall(bonus_obj['start_delay'], function(){
            _this.iterative_explode(destroy_items, bonus_obj['iter_delay'], _this.dummy_function);   
        }, [], this);
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use5'});
    }		
    
    apply_bonus6(obj) { 
        // var _this = this;
        // var i; 
        // var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        
        // var destroy_items;
        var iteration_items = [];
        // var bonus_obj = {			
		// 	'iter_delay': 75
		// };
        // var anim_attr = {'left': 0, 'right': 0};
        var frozen_items = [];
        // destroy_items = [];
        // destroy_items.push([this.field_items[pos_y][pos_x]]);
        // frozen_items.push(this.field_items[pos_y][pos_x]);


        this.emitter.emit('EVENT', {'event': 'BONUS_ANIM', 'type': 'bonus6'});        
        // span = 1;
        // console.log(this.field_items)
        this.field_items.forEach(row => {
            iteration_items = [...iteration_items, ...row];
        });
        iteration_items = iteration_items.filter(el => el);
        this.play_bonus_anim6(obj, rocket => {
            iteration_items.forEach(el => {
                let gem = el.get_gem();
                if ((el.is_tiled() || el.is_blocked() || el.is_locked()) && el.is_empty() ) {
                    let img = this.get_overlap_image(el);
                    if (game_data['utils'].checkOverlap(rocket, img, 'horizontal')) {
                        let elem = iteration_items.splice(iteration_items.indexOf(el), 1);
                        this.remove_iteration_items(elem);
                    }
                }
                else if (gem) {
                    gem = gem.gem_content;
                    // pos_y + 1 !== el.pos_y &&
                    if (game_data['utils'].checkOverlap(rocket, gem, 'horizontal')) {
                        let elem = iteration_items.splice(iteration_items.indexOf(el), 1);
                        // frozen_items = [...frozen_items, ...elem];
                        this.remove_iteration_items(elem);
                        
                    }
                }
                
            });
        });	


// // сбор гемов по линии
//         while (pos_x - span >= 0 || pos_x + span < this.field_items[pos_y].length) {
//             iteration_items = [];
//             //if (anim_attr['left'] == 0) {
//                 if ((pos_x - span) >= 0 && this.field_items[pos_y][pos_x - span]) 
//                     iteration_items.push(this.field_items[pos_y][pos_x - span]);					
//                 //else
//                 //    anim_attr['left'] = span;
//             //}
                
//             //if (anim_attr['right'] == 0) {
//                 if ((pos_x + span) < this.field_items[pos_y].length && this.field_items[pos_y][pos_x + span]) 
//                     iteration_items.push(this.field_items[pos_y][pos_x + span]);						
//                 //else
//                 //    anim_attr['right'] = span;
//             //}
                
            
//             destroy_items.push(iteration_items);
//             for (i = 0; i < iteration_items.length; i++)
//                 frozen_items.push(iteration_items[i]);
            
                
//             span++;
//         }

       		
        this.update_freeze(frozen_items, true);  
        // this.iterative_explode(destroy_items, bonus_obj['iter_delay'], function(){
        //     _this.update_freeze(frozen_items, false);            
        // });
        
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use6'});
    }	
    
    apply_bonus7(obj) {
        var _this = this;
        var i;
        var j;
        var ind;			
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var bonus_obj = {
			'span': 2,
			'start_delay': 1000,
			'dynamites': 4,
			'dynamite_radius': 2,
			'dynamite_delay': 100,
			'fly_timeout': 200,
			'dynamite_timeout': 100
		};
        
        var iteration_items = new Array();
        var possible_items = new Array();
        
        for (i = -2; i <= 2; i++)
            for (j = -2; j <= 2; j++)                 
                if (!(i == 0 && j == 0) &&
                    (pos_y - i) >= 0 &&
                    (pos_y - i) < this.field_items.length &&
                    (pos_x - j) >= 0 &&
                    (pos_x - j) < this.field_items[pos_y].length &&
                    this.field_items[pos_y - i][pos_x - j])
                        possible_items.push(this.field_items[pos_y - i][pos_x - j]);

        
        var total_dynamites = Math.min(12, Math.floor(possible_items.length * 0.7));


        for (i = 0; i < total_dynamites; i++) {
            ind = Math.floor(Math.random() * possible_items.length);
            iteration_items.push(possible_items[ind]);				
            possible_items.splice(ind, 1);
        }


        this.update_freeze(iteration_items, true);
        this.play_bonus_anim7(obj, iteration_items, function(){
            _this.remove_iteration_items(iteration_items);
            _this.scene.time.delayedCall(300, function(){
                _this.update_freeze(iteration_items, false);
            }, [], this);
        });

        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use7'});
    }		
    
    
    apply_bonus8(obj) {			
        var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var destroy_items;
        var iteration_items;
        var bonus_obj = {'iter_delay': 50};
        
        destroy_items = [];
        destroy_items.push([this.field_items[pos_y][pos_x]]);
        
        for (span = 1; span <= this.field_items.length - 1; span++) {
            iteration_items = [];
            if ((pos_x - span >= 0) && (pos_y - span >= 0) &&
                this.field_items[pos_y - span][pos_x - span])
                iteration_items.push(this.field_items[pos_y - span][pos_x - span]);
                
            if ((pos_x - span >= 0) && (pos_y + span < this.field_items.length) &&
                this.field_items[pos_y + span][pos_x - span])
                iteration_items.push(this.field_items[pos_y + span][pos_x - span]);
                
            if ((pos_x + span < this.field_items[pos_y].length) && (pos_y - span >= 0) &&
                this.field_items[pos_y - span][pos_x + span])
                iteration_items.push(this.field_items[pos_y - span][pos_x + span]);
                
            if ((pos_x + span < this.field_items[pos_y].length) && (pos_y + span < this.field_items.length) &&
                this.field_items[pos_y + span][pos_x + span])
                iteration_items.push(this.field_items[pos_y + span][pos_x + span]);					
            
            destroy_items.push(iteration_items);
        }

        this.play_bonus_anim8(obj, function(){});						
        this.iterative_explode(destroy_items, bonus_obj['iter_delay'], this.dummy_function);
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use8'});
    }				
    
    apply_bonus9(obj) {
        var _this = this;
        var i;
        var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var destroy_items;
        var iteration_items;			
        var bonus_obj = {			
			'iter_delay': 75,
			'start_delay': 100
		};
        var anim_attr = {'up': 0, 'down': 0};
        var frozen_items = [];
        var added;
        destroy_items = [];
        this.emitter.emit('EVENT', {'event': 'BONUS_ANIM', 'type': 'bonus9'});
        
        iteration_items = [this.field_items[pos_y][pos_x]];
        if (pos_x > 0 && this.field_items[pos_y][pos_x - 1])
            iteration_items.push(this.field_items[pos_y][pos_x - 1]);
        if (pos_x < (this.field_items[pos_y].length - 1) && this.field_items[pos_y][pos_x + 1])
            iteration_items.push(this.field_items[pos_y][pos_x + 1]);
        
        destroy_items.push(iteration_items);
        for (i = 0; i < iteration_items.length; i++)
            frozen_items.push(iteration_items[i]);

        span = 1;
        
        while (pos_y - span >= 0 || pos_y + span < this.field_items.length) {
            iteration_items = [];
            //if (anim_attr['up'] == 0) {
                added = false;
                if ((pos_y - span) >= 0 && this.field_items[pos_y - span][pos_x])  {
                    iteration_items.push(this.field_items[pos_y - span][pos_x]);				
                    added = true;
                }
                if (pos_x > 0 && (pos_y - span) >= 0 && this.field_items[pos_y - span][pos_x - 1]) {						
                    iteration_items.push(this.field_items[pos_y - span][pos_x - 1]);					
                    added = true;
                }
                if (pos_x < (this.field_items[pos_y].length - 1) && (pos_y - span) >= 0 && this.field_items[pos_y - span][pos_x + 1]) {
                    iteration_items.push(this.field_items[pos_y - span][pos_x + 1]);					
                    added = true;
                }
                if (!added)
                    anim_attr['up'] = span;
            //}
                
            //if (anim_attr['down'] == 0) {
                added = false;
                if ((pos_y + span) < this.field_items.length && this.field_items[pos_y + span][pos_x]) {
                    iteration_items.push(this.field_items[pos_y + span][pos_x]);						
                    added = true;
                }
                if (pos_x > 0 && (pos_y + span) < this.field_items.length && this.field_items[pos_y + span][pos_x - 1]) {
                    iteration_items.push(this.field_items[pos_y + span][pos_x - 1]);	
                    added = true;
                }
                if (pos_x < (this.field_items[pos_y].length - 1) && (pos_y + span) < this.field_items.length && this.field_items[pos_y + span][pos_x + 1]) {
                    iteration_items.push(this.field_items[pos_y + span][pos_x + 1]);	
                    added = true;
                }
                                    
                if (!added)
                    anim_attr['down'] = span;						
           // }
                
            
            destroy_items.push(iteration_items);
            for (i = 0; i < iteration_items.length; i++)
                frozen_items.push(iteration_items[i]);
            
                
            span++;
        }			
        
        this.update_freeze(frozen_items, true);  
        this.scene.time.delayedCall(bonus_obj['start_delay'], function(){		
            _this.iterative_explode(destroy_items, bonus_obj['iter_delay'], function(){
                _this.update_freeze(frozen_items, false); 					
            });
        }, [], this);
        this.play_bonus_anim9(obj, anim_attr);	
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use9'});
    }		
    
    apply_bonus10(obj) {
        var _this = this; 
        var i;
        var j;		
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var iteration_items;			
        var bonus_obj = {			
			'span': 2,
			'iter_delay': 50,
			'start_delay': 300
		};
        
        iteration_items = [];
        for (i = 0; i < this.field_items.length; i++)
            for (j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && 
                   ((Math.abs(i - pos_y) < bonus_obj['span'] && Math.abs(j - pos_x) < bonus_obj['span']) ||
                    (j == pos_x) ||
                    (i == pos_y))){
                     iteration_items.push(this.field_items[i][j]);                    
                }								
        
        this.play_bonus_anim10(obj, function(){});						
                
        this.scene.time.delayedCall(bonus_obj['start_delay'], function(){
            _this.iterative_explode([iteration_items], bonus_obj['iter_delay'], _this.dummy_function);					  
        }, [], this);					
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use10'});
    }		
    
    
    apply_bonus11(obj) {
        var _this = this;
        var i;
        var j;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];			
        var iteration_items = new Array();	
        var bonus_obj = {			
			'start_delay': 500
		};
        
        for (i = 0; i < this.field_items.length; i++)
            for (j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && ((j == pos_x) || (i == pos_y)))
                    iteration_items.push(this.field_items[i][j]);		
        
        this.update_freeze(iteration_items, true); 
        this.scene.time.delayedCall(bonus_obj['start_delay'], function(){
            _this.iterative_explode([iteration_items], bonus_obj['iter_delay'], function(){
                _this.update_freeze(iteration_items, false);  					
            });
        }, [], this);		
        this.play_bonus_anim11(obj, function(){});
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use11'});
    }		
    
    apply_bonus12(obj) {
        var _this = this;
        var i;
        var span;						
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var destroy_items;
        var iteration_items;			
        var bonus_obj = {			
			'iter_delay': 75
		};
        var anim_attr = {'left': 0, 'right': 0};
        var frozen_items = [];
        var added;
        destroy_items = [];
        this.emitter.emit('EVENT', {'event': 'BONUS_ANIM', 'type': 'bonus12'});        
        
        iteration_items = [this.field_items[pos_y][pos_x]];
        if (pos_y > 0 && this.field_items[pos_y - 1][pos_x])
            iteration_items.push(this.field_items[pos_y - 1][pos_x]);
        if (pos_y < this.field_items.length - 1 && this.field_items[pos_y + 1][pos_x])
            iteration_items.push(this.field_items[pos_y + 1][pos_x]);
        
        destroy_items.push(iteration_items);
        for (i = 0; i < iteration_items.length; i++)
            frozen_items.push(iteration_items[i]);

        span = 1;
        
        while (pos_x - span >= 0 || pos_x + span < this.field_items[pos_y].length) {
            iteration_items = [];
            //if (anim_attr['left'] == 0) {
                added = false;
                if ((pos_x - span) >= 0 && this.field_items[pos_y][pos_x - span])  {
                    iteration_items.push(this.field_items[pos_y][pos_x - span]);				
                    added = true;
                }
                if (pos_y > 0 && (pos_x - span) >= 0 && this.field_items[pos_y - 1][pos_x - span]) {						
                    iteration_items.push(this.field_items[pos_y - 1][pos_x - span]);					
                    added = true;
                }
                if (pos_y < (this.field_items.length - 1) && (pos_x - span) >= 0 && this.field_items[pos_y + 1][pos_x - span]) {
                    iteration_items.push(this.field_items[pos_y + 1][pos_x - span]);					
                    added = true;
                }
                if (!added)
                    anim_attr['left'] = span;
            //}
                
            //if (anim_attr['right'] == 0) {
                added = false;
                if ((pos_x + span) < this.field_items[pos_y].length && this.field_items[pos_y][pos_x + span]) {
                    iteration_items.push(this.field_items[pos_y][pos_x + span]);						
                    added = true;
                }
                if (pos_y > 0 && (pos_x + span) < this.field_items[pos_y - 1].length && this.field_items[pos_y - 1][pos_x + span]) {
                    iteration_items.push(this.field_items[pos_y - 1][pos_x + span]);	
                    added = true;
                }
                if (pos_y < (this.field_items.length - 1) && (pos_x + span) < this.field_items[pos_y + 1].length && this.field_items[pos_y + 1][pos_x + span]) {
                    iteration_items.push(this.field_items[pos_y + 1][pos_x + span]);	
                    added = true;
                }
                                    
                if (!added)
                    anim_attr['right'] = span;						
           // }
                
            
            destroy_items.push(iteration_items);
            for (i = 0; i < iteration_items.length; i++)
                frozen_items.push(iteration_items[i]);
                
            span++;
            
        }			
        
        this.update_freeze(frozen_items, true);  
        this.iterative_explode(destroy_items, bonus_obj['iter_delay'], function(){
            _this.update_freeze(frozen_items, false);  				
        });
        this.play_bonus_anim12(obj, anim_attr);	
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use12'});
    }			
    
    
    apply_bonus13(obj) {
        			
        var bonus_obj = {'total': 10};
        this.add_lightning(this.field_items[obj['pos_y']][obj['pos_x']]);
        this.generate_lightning(this.field_items[obj['pos_y']][obj['pos_x']], bonus_obj['total']);
        
    }		
    
    apply_bonus14(obj) {        
        var bonus_obj = {'total': 15};
        this.add_lightning(this.field_items[obj['pos_y']][obj['pos_x']]);
        this.generate_lightning(this.field_items[obj['pos_y']][obj['pos_x']], bonus_obj['total']);
    }

    apply_bonus15(obj) {
        let target_elems = [];
        target_elems = this.update_target_elems(obj['swapped_id'], obj['id']);

        if (target_elems.length > 0) {
            // console.log(1)
            if (obj['destroy_gem'] && typeof obj['destroy_gem'] === "function") obj['destroy_gem']();
            this.emitter.emit('EVENT', {'event': 'SWITCH_BONUS_BLOCK'});
            this.add_lightning(this.field_items[obj['pos_y']][obj['pos_x']], null,);
            // target_elems.forEach(t => {
            //     this.remove_iteration_items([t]);
            // });
           
            this.generate_lightning(target_elems[0], target_elems.length, target_elems, () => {
                
                this.emitter.emit('EVENT', {'event': 'SWITCH_BONUS_BLOCK'});
            });
        }
        else {
            game_data.game_engine.playing_field.gems_manager.empty_field_items.push({pos_x:obj['pos_x'], pos_y: obj['pos_y']})
        }
        
        
    }		

    update_target_elems(swapped_id, id) {
        let alone_amode = false;
        if (swapped_id === undefined || id == swapped_id) alone_amode= true;
        
        let target_elems = [];
        this.field_items.forEach(el1 => {
            el1.forEach(el2 => {
                if (alone_amode && el2 && el2.get_gem()) {
                    alone_amode= false;
                    swapped_id = el2.get_gem().get_id();
                }
                if (el2 && el2.get_gem() && swapped_id === el2.get_gem().get_id())
                target_elems.push(el2);
            });
        });

        return target_elems;
    }

    add_lightning(field_item1, field_item2,) {                        
        var _this = this;
        var lightning_timeout = 500;

        //var lightning_line = new Phaser.GameObjects.Sprite(this.scene, 0, 0).play('lightning_line');
        
        var pt1;
        var pt2;
        
        
        if (field_item2) {
            pt1 = game_data['utils'].toLocal(this.moving_holder, field_item1.get_center_pt());
            pt2 = game_data['utils'].toLocal(this.moving_holder, field_item2.get_center_pt());
            
            var rot = Math.atan2(pt1.y - pt2.y, pt1.x - pt2.x);				
            // this.update_freeze([field_item2], true);

            var lightning_line = this.scene.add.sprite( 0, 0).play('lightning_line');
            lightning_line.setOrigin(0.5, 0);
         
            lightning_line.x = pt1.x;
            lightning_line.y = pt1.y;
            lightning_line.scaleY = Math.sqrt((pt2.y - pt1.y) * (pt2.y - pt1.y) + (pt2.x - pt1.x) * (pt2.x - pt1.x)) / lightning_line.height;
            


            lightning_line.angle = rot * 180 / Math.PI + 90;
            this.moving_holder.add(lightning_line);
          
            
            field_item2.add_lightning();
            // this.update_freeze([field_item2], true);
            this.remove_iteration_items([field_item2]);
            
            this.scene.time.delayedCall(lightning_timeout, function(){            
                field_item2.hide_lightning();
                lightning_line.destroy();
                
                // _this.update_freeze([field_item2], false);
            }, [], this);
        }
        else {
            field_item1.add_lightning();				
            // this.update_freeze([field_item1], true);
            this.remove_iteration_items([field_item1]);
            this.scene.time.delayedCall(lightning_timeout, function(){
                field_item1.hide_lightning();																		
                // _this.update_freeze([field_item1], false);
            }, [], this);
        }
    }    
    
    
    generate_lightning(prev_item, items_left, possible_items, on_complete) {
        // var i;
        // var j;
        // var ind;
        // var possible_items = new Array();
        var lightning_delay = 50;
        var _this = this;

        this.scene.time.delayedCall(lightning_delay, function(){            
            // for (i = 0; i < _this.field_items.length; i++)				
            //     for (j = 0; j < _this.field_items[i].length; j++)
            //         if (_this.field_items[i][j] && 
            //             (_this.field_items[i][j].is_normal() ||
            //             _this.field_items[i][j].is_bonus()) &&
            //             !_this.field_items[i][j].is_dynamical())
            //             possible_items.push(_this.field_items[i][j]);
            if (possible_items.length > 0) {
                // ind = Math.floor(Math.random() * possible_items.length);	
                let item = possible_items.pop();
                this.add_lightning(prev_item, item);
                items_left--;
                game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use13'});
                if (items_left > 0)
                    _this.generate_lightning(item, items_left, possible_items, on_complete);
                else {
                    if (on_complete) on_complete();
                }
            } 
        }, [], this);
    
    }
    		

    apply_bonus16(obj) {
        // var i;
        // var j;
        // var total_bats;
        // var ind;			
        // var flying_bats = new Array();
        // var flying_bat;
        // var pt;
        var all_items = new Array();
        var silver_items = new Array();
        // var field_item;
        
        //dispatchEvent(new ExtendedEvent("MAKE_DRACULA_RESIZE", {}));
        //dispatchEvent(new ExtendedEvent("SOUND_EVENT", {'play': true, 'sound_name': 'paid_bonus6'}));

        // this.emitter.emit('EVENT', {'event': 'MAKE_DRACULA_RESIZE'});
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus6'});
        
        //total_bats = 12;
        // total_bats = 10;
        
        
        for (var i = 0; i < this.field_items.length; i++)
            for (var j = 0; j < this.field_items[i].length; j++) {
                if (this.field_items[i][j] && !(this.field_items[i][j].is_empty() || this.field_items[i][j].is_bonus() || this.field_items[i][j].is_freezed())) {
                    if (this.field_items[i][j].is_gold())  all_items.push(this.field_items[i][j]);
                    if (this.field_items[i][j].is_silver())  silver_items.push(this.field_items[i][j]);
                }
                // if (this.field_items[i][j] && this.field_items[i][j].is_gold() && !(this.field_items[i][j].is_empty() || this.field_items[i][j].is_bonus() || this.field_items[i][j].is_freezed()))
                // all_items.push(this.field_items[i][j]);
            }
                
                    
        this.flying_bats = [];

        if (all_items.length) {
            let item = Phaser.Utils.Array.GetRandom(all_items);
            this.move_flying_bat(item);
        } else {
            if (silver_items.length) {
                let item = Phaser.Utils.Array.GetRandom(silver_items);
                this.move_flying_bat(item);
            }
        }
        
        // for (i = 0; i < total_bats; i++) {
            
        //     ind = Math.floor(Math.random() * all_items.length);
        //     field_item = all_items[ind];
        //     all_items.splice(ind, 1);
        //     if (field_item) this.move_flying_bat(field_item);

        //     //move_flying_bat(flying_bat);
            
        // }
    }
    
    
    
    //move_flying_bat(flying_bat) {			
    move_flying_bat(field_item) {			
        
        var pt = game_data['utils'].toLocal(this.moving_holder, field_item.get_center_pt());
        var flying_bat = new Phaser.GameObjects.Container(this.scene, pt.x, 800 - Math.random() * 50);
        var bat_body = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster6_part1");
        var bat_wing1 = new Phaser.GameObjects.Image(this.scene, 6, 0, "common1", "booster6_part2");
        bat_wing1.setOrigin(0, 0.5);
        var bat_wing2 = new Phaser.GameObjects.Image(this.scene, -6, 0, "common1", "booster6_part2");
        bat_wing2.setOrigin(0, 0.5);
        bat_wing2.scaleX *= -1;

        flying_bat.add(bat_body);
        flying_bat.add(bat_wing1);
        flying_bat.add(bat_wing2);

        this.animate_wing(bat_wing1, 1);
        this.animate_wing(bat_wing2, -1);

        //flying_bat = new FlyingBat();
        
        this.flying_bats.push(flying_bat);
        this.moving_holder.add(flying_bat);
   
        
        var _this = this;
        this.scene.tweens.add({targets: flying_bat, y: -300, duration: 800, onComplete: function () { 
           flying_bat.destroy();
            //_this.animate_wing(wing, sign);
  
        }});  


        var stone1 = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster6_part3");
        var stone2 = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster6_part3");
        var stone3 = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster6_part3");


        this.scene.time.delayedCall(250, function(){            
            stone1.x = flying_bat.x;
            stone1.y = flying_bat.y;
            _this.moving_holder.add(stone1);
            _this.scene.tweens.add({targets: stone1, x: pt.x, y: pt.y, duration: 500, onComplete: function () { 
                stone1.destroy();
            }});  
        }, [], this);

        this.scene.time.delayedCall(500, function(){            
            stone2.x = flying_bat.x;
            stone2.y = flying_bat.y;
            _this.moving_holder.add(stone2);
            _this.scene.tweens.add({targets: stone2, x: pt.x, y: pt.y, duration: 500, onComplete: function () { 
                stone2.destroy();
            }});  

        }, [], this);

        this.scene.time.delayedCall(700, function(){
            stone3.x = flying_bat.x;
            stone3.y = flying_bat.y;
            _this.moving_holder.add(stone3);
            _this.scene.tweens.add({targets: stone3, x: pt.x, y: pt.y, duration: 500, onComplete: function () { 
                stone3.destroy();
                _this.remove_iteration_items([field_item]);
            }});
        }, [], this);    		
    }
    

    animate_wing(wing, sign) {
        var _this = this;
        this.scene.tweens.add({targets: wing, scaleX: 0.58 * sign, y: -5, duration: 120, onComplete: function () { 
            _this.scene.tweens.add({targets: wing, scaleX: 1 * sign, y: 0, duration: 120, onComplete: function () { 
                _this.animate_wing(wing, sign);
            }});                
        }});  
    }


    apply_booster4(params) {
      var i;
      var j;
      var pt = params['pt'];
      var field_item_pt; 
      var filed_item = null;
        for (i = 0; i < this.field_items.length; i++)
            for (j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && !this.field_items[i][j].is_empty()) {
                    field_item_pt = this.field_items[i][j].get_center_pt();
                    if (Math.abs(pt.x - field_item_pt.x) < game_data['dim']['item_width'] && Math.abs(pt.y - field_item_pt.y) < game_data['dim']['item_height']) {
                        filed_item = this.field_items[i][j];
                        break;

                    }
                }


        if (filed_item) {
            var arr = new Array();
            var gem_id = filed_item.get_gem_id();
            for (i = 0; i < this.field_items.length; i++)
                for (j = 0; j < this.field_items[i].length; j++)
                    if (this.field_items[i][j] && !this.field_items[i][j].is_empty() && this.field_items[i][j].get_gem_id() == gem_id) {
                        //this.field_items[i][j].destroy_gem();
                        arr.push(this.field_items[i][j]);
                        
                    }

            this.remove_iteration_items(arr);
        }

    }


    apply_booster5() {
        var possible_candies = this.get_possible_candies();
        if (possible_candies.length > 0) {
            var total_bonuses = 5;       
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus5'});
            this.apply_candy(total_bonuses, false, this.dummy_function);
            this.emitter.emit("EVENT", {'event': 'BOOSTER_USED', 'booster_id': 'booster5'});   
        }
    }

    
    apply_candy(total, is_post_level_show, on_complete) {        
        var _this = this;
        var delay = 300;        

        if (total > 0) {				
            //candy_timeout_id = setTimeout(function(){	
            this.scene.time.delayedCall(delay, function() {
                total--;
                var ind;
                var possible_candies = _this.get_possible_candies();
                var possible_bonus = _this.level['possible_bonus'];                
               
                if (possible_candies.length > 0 && possible_bonus.length > 0) {                    
                    ind = Math.floor(Math.random() * possible_candies.length);                    
                    this.whiten_gem(possible_candies[ind]);                  
                   
                    //_this.emitter.emit('EVENT', {'event': 'CREATE_BONUS_GEM'});
                    
                }
                if (total > 0)
                    _this.apply_candy(total, is_post_level_show, on_complete);
                else
                    on_complete();
            }, [], this);				
        }	
    }


    whiten_gem(item) {
        var _this = this;
        var bonus_type = Math.floor(Math.random() * 3) + 1;
        var gem = item['gem'];
        var pos_x = item['pos_x'];
        var pos_y = item['pos_y'];
        this.field_items[pos_y][pos_x].set_freezed(true);

        gem.whiten(function(){
            _this.field_items[pos_y][pos_x].set_freezed(false);
            _this.emitter.emit('EVENT', {
                'event': 'CREATE_BONUS_GEM', 
                'pos_x': pos_x, 
                'pos_y': pos_y, 
                'bonus_type': bonus_type,
                'is_nested': true
            });
        });
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'bonus_use5'});
    }
    
    get_possible_candies() {
        
        var possible_items = [];
        for (var i = 0; i < this.field_items.length; i++)				
            for (var j = 0; j < this.field_items[i].length; j++)
                if (this.field_items[i][j] && 	
                    !this.field_items[i][j].is_empty() && 
                    !this.field_items[i][j].is_blocked() &&
                    !this.field_items[i][j].is_dynamical() &&
                    !this.field_items[i][j].is_freezed() &&
                    this.field_items[i][j].is_normal())
                    possible_items.push({'pos_y': i, 'pos_x': j, 'gem': this.field_items[i][j].get_gem()});
                    
        return possible_items;		
    }



    get_random_dracula_item() {
        /*
        var arr = [];
        var ind;
        for (var i = 0; i < field_items.length; i++)
            for (var j = 0; j < field_items[i].length; j++)
                if (field_items[i][j] && 						
                    field_items[i][j].normal && 
                    !field_items[i][j].dynamical)
                    arr.push(field_items[i][j]);			
        
        if (arr.length > 0) {
            var ind = Math.floor(Math.random() * arr.length);
            return arr[ind];
        }
        else
            return null;

        */
    }

    show_bat_stones(field_item) {
        /*
        var bat_stones = new BatStones();
        var pt = moving_holder.globalToLocal(field_item.get_center_pt());
        bat_stones.x = pt.x;
        bat_stones.y = pt.y;
        moving_holder.addChild(bat_stones);
        bat_stones.gotoAndPlay(1);
        bat_stones.addEventListener(Event.ENTER_FRAME, function(event){
            if (bat_stones.currentFrame == bat_stones.totalFrames) {
                bat_stones.removeEventListener(event.type, arguments.callee);
                moving_holder.removeChild(bat_stones);
                update_freeze([field_item], false);
            }
        });
        */
    }
    
    play_bonus_anim1(obj, on_explosion) {
        
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());
        var particles = this.scene.add.particles('common1', 'particle_explode');
        this.moving_holder.add(particles);

        var emitter = particles.createEmitter({
            //frame: 'blue',
            x: pt.x,
            y: pt.y,
            lifespan: 700,
            speed: { min: 400, max: 600 },
            //angle: 0,
            //gravityY: 1000,
            scale: { start: 0.4, end: 0 },
            quantity: 10,
            blendMode: 'NORMAL'
        });

        this.scene.time.delayedCall(100, function(){            
            //emitter.destroy();
            emitter.on = false;
        }, [], this);



       on_explosion();
    }
    
    play_bonus_anim2(obj, on_explosion) {
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var span = 3;
        var dist = game_data['dim']['item_width'] * (span - 1);
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());

        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus2");
        this.moving_holder.add(bonus_anim);

        this.scene.tweens.add({targets: bonus_anim, angle: 125, scaleX: 1.3, scaleY: 1.3, duration: 200, onComplete: function () { 
            _this.scene.tweens.add({targets: bonus_anim, angle: 180, scaleX: 0.2, scaleY: 0.2, duration: 100, onComplete: function () { 
                bonus_anim.destroy();
            }});                
        }});


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus2_part");
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus2_part");
        part2.angle = 90;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus2_part");
        part3.angle = 180;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus2_part");
        part4.angle = -90;
        this.moving_holder.add(part4);



        this.scene.time.delayedCall(100, function(){
            _this.scene.tweens.add({targets: part1, x: pt.x - dist, y: pt.y - dist,  duration: 200, onComplete: function () { 
                _this.scene.tweens.add({targets: part1, x: pt.x - dist - game_data['dim']['item_width'], y: pt.y - dist - game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part1.destroy();
                }});                
            }});
       
            _this.scene.tweens.add({targets: part2, x: pt.x + dist, y: pt.y - dist,  duration: 200, onComplete: function () { 
                _this.scene.tweens.add({targets: part2, x: pt.x + dist + game_data['dim']['item_width'], y: pt.y - dist - game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part2.destroy();
                }});                
            }});

            _this.scene.tweens.add({targets: part3, x: pt.x + dist, y: pt.y + dist,  duration: 200, onComplete: function () { 
                _this.scene.tweens.add({targets: part3, x: pt.x + dist + game_data['dim']['item_width'], y: pt.y + dist + game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part3.destroy();
                }});                
            }});
            
            _this.scene.tweens.add({targets: part4, x: pt.x - dist, y: pt.y + dist,  duration: 200, onComplete: function () { 
                _this.scene.tweens.add({targets: part4, x: pt.x - dist - game_data['dim']['item_width'], y: pt.y + dist + game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part4.destroy();
                }});                
            }});

        }, [], this);

    }


    play_bonus_anim3(obj, update_callback) {	
        		
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());        
        var dist = 600;
        
        var rocket1 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket1);        
        var rocket2 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket2);


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus3');
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 0, 60).play('fire_anim');
        rocket_fire.angle = -90;
        rocket1.add(rocket_body);
        rocket1.add(this.scene.add.existing(rocket_fire));


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus3');
        rocket_body.angle = 180;
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 0, -60).play('fire_anim');
        rocket_fire.angle = 90;
        rocket2.add(rocket_body);
        rocket2.add(this.scene.add.existing(rocket_fire));

        
        this.scene.tweens.add({targets: rocket1, y: pt.y - dist,  duration: 200, onComplete: function () { 
            rocket1.destroy();
        },
        onUpdate: () => {
            if (update_callback) update_callback(rocket1);
            
        }});

        this.scene.tweens.add({targets: rocket2, y: pt.y + dist,  duration: 200, onComplete: function () { 
            rocket2.destroy();
        },
        onUpdate: () => {
            if (update_callback) update_callback(rocket2);
            
        }});
    }
    
    play_bonus_anim4(obj, attr) {	
        		
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());

        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus4");
        this.moving_holder.add(bonus_anim);

        this.scene.tweens.add({targets: bonus_anim, x: pt.x + 5, y: pt.y, duration: 50, onComplete: function () { 
            _this.scene.tweens.add({targets: bonus_anim, x: pt.x - 5, y: pt.y, duration: 50, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y + 5, duration: 50, onComplete: function () { 
                    _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y - 5, duration: 50, onComplete: function () { 
                        _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y, duration: 50, onComplete: function () { 
                            _this.scene.tweens.add({targets: bonus_anim, scaleX: 0.05, scaleY: 0.05, duration: 300, onComplete: function () { 
                                bonus_anim.destroy();
                            }});                
                        }});                
                    }});                
                }});                
            }});                
        }});


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus4_part");
        part1.setScale(0.09, 0.03);
        part1.angle = 45;
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus4_part");
        part2.setScale(0.09, 0.03);
        part2.angle = 135;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus4_part");
        part3.setScale(0.09, 0.03);
        part3.angle = -135;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus4_part");
        part4.setScale(0.09, 0.03);
        part4.angle = -45;
        this.moving_holder.add(part4);



        this.scene.time.delayedCall(200, function(){
            _this.scene.tweens.add({targets: part1, x: pt.x + 60, y: pt.y + 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part1, x: pt.x + 160, y: pt.y + 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                    part1.destroy();
                }});                
            }});
       
            _this.scene.tweens.add({targets: part2, x: pt.x - 60, y: pt.y + 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part2, x: pt.x - 160, y: pt.y + 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                    part2.destroy();
                }});                
            }});

            _this.scene.tweens.add({targets: part3, x: pt.x - 60, y: pt.y - 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part3, x: pt.x - 160, y: pt.y - 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                   part3.destroy();
                }});                
            }});
            
            _this.scene.tweens.add({targets: part4, x: pt.x + 60, y: pt.y - 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part4, x: pt.x + 160, y: pt.y - 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                  part4.destroy();
                }});                
            }});

        }, [], this);
        
    }


    play_bonus_anim5(obj, on_explosion) {
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var span = 3;
        var dist = game_data['dim']['item_width'] * (span - 1);
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());

        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus5");
        this.moving_holder.add(bonus_anim);
        var bonus_anim_light = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus5");
        this.moving_holder.add(bonus_anim_light);

        bonus_anim_light.alpha = 0;
        bonus_anim_light.setTintFill(0xFFFFFF);


        this.scene.time.delayedCall(200, function(){

            _this.scene.tweens.add({targets: bonus_anim, scaleX: 1.3, scaleY: 1.3, duration: 150, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: function () { 
                    bonus_anim.destroy();
                }});                
            }});


            _this.scene.tweens.add({targets: bonus_anim_light, alpha: 1, scaleX: 1.3, scaleY: 1.3, duration: 150, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim_light, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: function () { 
                    bonus_anim_light.destroy();
                }});                
            }});
        }, [], this);


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus5_part");
        part1.setOrigin(0, 0.5);
        part1.setScale(0.15);
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus5_part");
        part2.setOrigin(0, 0.5);
        part2.setScale(0.15);
        part2.angle = 90;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus5_part");
        part3.setOrigin(0, 0.5);
        part3.setScale(0.15);
        part3.angle = 180;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus5_part");
        part4.setOrigin(0, 0.5);
        part4.setScale(0.15);
        part4.angle = -90;
        this.moving_holder.add(part4);



        


            _this.scene.tweens.add({targets: part1, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part1, x: pt.x + 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part1.destroy();
                    }});   
                }, [], _this);             
            }});
       
            _this.scene.tweens.add({targets: part2, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part2, y: pt.y + 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part2.destroy();
                    }});   
                }, [], _this);             
            }});

            _this.scene.tweens.add({targets: part3, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part3, x: pt.x - 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part3.destroy();
                    }});   
                }, [], _this);             
            }});
            
            _this.scene.tweens.add({targets: part4, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part4, y: pt.y - 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part4.destroy();
                    }});   
                }, [], _this);             
            }});

        

    }


    play_bonus_anim6(obj, update_callback) {
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());        
        var dist = 600;
        
        var rocket1 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket1);        
        var rocket2 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket2);


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus6');
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 60, 0).play('fire_anim');
        rocket_fire.angle = 0;
        rocket1.add(rocket_body);
        rocket1.add(this.scene.add.existing(rocket_fire));


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus6');
        rocket_body.angle = 180;
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, -60, 0).play('fire_anim');
        rocket_fire.angle = 180;
        rocket2.add(rocket_body);
        rocket2.add(this.scene.add.existing(rocket_fire));

        
        this.scene.tweens.add({targets: rocket1, x: pt.x - dist,  duration: 200, onComplete: function () { 
            rocket1.destroy();
        },
        onUpdate: () => {
            if (update_callback) update_callback(rocket1);
            
        }
    });

        this.scene.tweens.add({targets: rocket2, x: pt.x + dist,  duration: 200, onComplete: function () { 
            rocket2.destroy();
        },
        onUpdate: () => {
            if (update_callback) update_callback(rocket2);
        }});		
    }		
    

    play_bonus_anim7(obj, iteration_items, on_complete) {
        
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());
        var i;


        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus7");
        this.moving_holder.add(bonus_anim);

        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus7_part1");


        this.scene.tweens.add({targets: bonus_anim, x: pt.x + 5, y: pt.y, duration: 50, onComplete: function () { 
            _this.scene.tweens.add({targets: bonus_anim, x: pt.x - 5, y: pt.y, duration: 50, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y + 5, duration: 50, onComplete: function () { 
                    _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y - 5, duration: 50, onComplete: function () { 
                        _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y, duration: 50, onComplete: function () {                             
                                bonus_anim.destroy();
                                _this.moving_holder.add(part1);
                                var pt1 = new Phaser.Geom.Point(pt.x - 20, pt.y - 20);
                                var pt2 = new Phaser.Geom.Point(pt.x - 40, pt.y + 100);
                                var bezierCurve = new Phaser.Curves.CubicBezier(pt, pt1, pt2, pt2);
                                var tweenObject = {val: 0};

                                _this.scene.tweens.add({targets: tweenObject, val: 1, duration: 500, ease: "Sine.easeInOut",
                                    onUpdate: function(tween, target){
                                        var position = bezierCurve.getPoint(target.val);
                                        part1.x = position.x;
                                        part1.y = position.y;
                                    },
                                    onComplete: function(){part1.destroy();}
                                });

                                for (i = 0; i < iteration_items.length; i++)
                                    _this.throw_dynamite(pt, iteration_items[i], (i == iteration_items.length - 1) ? on_complete : _this.dummy_function);
                                          
                        }});                
                    }});                
                }});                
            }});                
        }});        
    }



    throw_dynamite(pt, field_item, on_comlete) {
        var _this = this;
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus7_part2");
        this.moving_holder.add(part2);        
        var pt_end = game_data['utils'].toLocal(this.moving_holder, field_item.get_center_pt());

        var pt_middle = new Phaser.Geom.Point((pt.x + pt_end.x) / 2, (pt.y + pt_end.y) / 2 - 200);        
        var bezierCurve = new Phaser.Curves.CubicBezier(pt, pt_middle, pt_middle, pt_end);
        var tweenObject = {val: 0};

        var max_angle = Math.random() * 180 - 90;

        _this.scene.tweens.add({targets: tweenObject, val: 1, duration: 500, ease: "Sine.easeInOut",
            onUpdate: function(tween, target){
                var position = bezierCurve.getPoint(target.val);
                part2.x = position.x;
                part2.y = position.y;
                part2.angle = max_angle * target.val;
                part2.scaleX = 1 - target.val * 0.2;
                part2.scaleY = 1 - target.val * 0.2;
            },
            onComplete: function(){
                _this.show_dynamite_particles(pt_end);
                part2.destroy();                
                on_comlete();
            }
        });				
    }

    show_dynamite_particles(pt) {

        //1

        var particle1 = this.scene.add.particles('common1', 'particle_explode');
        var emitter1 = particle1.createEmitter({            
            x: pt.x,
            y: pt.y,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'SCREEN',            
            lifespan: 600,
            gravityY: 800
        });  
        this.moving_holder.add(particle1);   
        emitter1.explode();   
       
    }


    play_bonus_anim8(obj, on_explosion) {
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        //var span = 5;
        var dist = 600;
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus8_part1");        
        part1.angle = 90;
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus8_part1");
        part2.angle = 180;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus8_part1");
        part3.angle = -90;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus8_part1");
        part4.angle = 0;
        this.moving_holder.add(part4);



        var fire1 = new Phaser.GameObjects.Sprite(this.scene, pt.x, pt.y).play('fire_anim');
        fire1.angle = 135;
        this.moving_holder.add(fire1);

        var fire2 = new Phaser.GameObjects.Sprite(this.scene, pt.x, pt.y).play('fire_anim');
        fire2.angle = -135;
        this.moving_holder.add(fire2);

        var fire3 = new Phaser.GameObjects.Sprite(this.scene, pt.x, pt.y).play('fire_anim');
        fire3.angle = -45;
        this.moving_holder.add(fire3);

        var fire4 = new Phaser.GameObjects.Sprite(this.scene, pt.x, pt.y).play('fire_anim');
        fire4.angle = 45;
        this.moving_holder.add(fire4);




        //this.scene.time.delayedCall(100, function(){
            _this.scene.tweens.add({targets: part1, x: pt.x - dist, y: pt.y - dist,  duration: 300, onComplete: function () { 
                _this.scene.tweens.add({targets: part1, x: pt.x - dist - game_data['dim']['item_width'], y: pt.y - dist - game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part1.destroy();
                }});                
            }});
       
            _this.scene.tweens.add({targets: part2, x: pt.x + dist, y: pt.y - dist,  duration: 300, onComplete: function () { 
                _this.scene.tweens.add({targets: part2, x: pt.x + dist + game_data['dim']['item_width'], y: pt.y - dist - game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part2.destroy();
                }});                
            }});

            _this.scene.tweens.add({targets: part3, x: pt.x + dist, y: pt.y + dist,  duration: 300, onComplete: function () { 
                _this.scene.tweens.add({targets: part3, x: pt.x + dist + game_data['dim']['item_width'], y: pt.y + dist + game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part3.destroy();
                }});                
            }});
            
            _this.scene.tweens.add({targets: part4, x: pt.x - dist, y: pt.y + dist,  duration: 300, onComplete: function () { 
                _this.scene.tweens.add({targets: part4, x: pt.x - dist - game_data['dim']['item_width'], y: pt.y + dist + game_data['dim']['item_height'], scaleX: 0.3, scaleY: 0.3, duration: 100, onComplete: function () { 
                    part4.destroy();
                }});                
            }});

            fire1.alpha = 0;
            this.scene.tweens.add({targets: fire1, x: pt.x - game_data['dim']['item_width'], y: pt.y + game_data['dim']['item_height'], alpha: 1,  duration: 100, onComplete: function () { 
                _this.scene.tweens.add({targets: fire1, x: pt.x - dist, y: pt.y + dist, duration: 200, onComplete: function () { 
                    fire1.destroy();
                }});                
            }});


            fire2.alpha = 0;
            this.scene.tweens.add({targets: fire2, x: pt.x - game_data['dim']['item_width'], y: pt.y - game_data['dim']['item_height'], alpha: 1,  duration: 100, onComplete: function () { 
                _this.scene.tweens.add({targets: fire2, x: pt.x - dist, y: pt.y - dist, duration: 200, onComplete: function () { 
                    fire2.destroy();
                }});                
            }});            


            fire3.alpha = 0;
            this.scene.tweens.add({targets: fire3, x: pt.x + game_data['dim']['item_width'], y: pt.y - game_data['dim']['item_height'], alpha: 1,  duration: 100, onComplete: function () { 
                _this.scene.tweens.add({targets: fire3, x: pt.x + dist, y: pt.y - dist, duration: 200, onComplete: function () { 
                    fire3.destroy();
                }});                
            }});  
                      

            fire4.alpha = 0;
            this.scene.tweens.add({targets: fire4, x: pt.x + game_data['dim']['item_width'], y: pt.y + game_data['dim']['item_height'], alpha: 1,  duration: 100, onComplete: function () { 
                _this.scene.tweens.add({targets: fire4, x: pt.x + dist, y: pt.y + dist, duration: 200, onComplete: function () { 
                    fire4.destroy();
                }});                
            }});   

       // }, [], this);

    }


    play_bonus_anim9(obj, attr) {
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());        
        var dist = 600;
        
        var rocket1 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket1);        
        var rocket2 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket2);


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus9');
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 0, 60).play('fire_anim');
        rocket_fire.angle = -90;
        rocket1.add(rocket_body);
        rocket1.add(this.scene.add.existing(rocket_fire));


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus9');
        rocket_body.angle = 180;
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 0, -60).play('fire_anim');
        rocket_fire.angle = 90;
        rocket2.add(rocket_body);
        rocket2.add(this.scene.add.existing(rocket_fire));

        
        this.scene.tweens.add({targets: rocket1, y: pt.y - dist,  duration: 200, onComplete: function () { 
            rocket1.destroy();
        }});

        this.scene.tweens.add({targets: rocket2, y: pt.y + dist,  duration: 200, onComplete: function () { 
            rocket2.destroy();
        }});		
    }					
    

    play_bonus_anim10(obj, attr) {	
        		
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var span = 3;
        var dist = 400;
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());

        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus10");
        this.moving_holder.add(bonus_anim);

        this.scene.tweens.add({targets: bonus_anim, x: pt.x + 5, y: pt.y, duration: 50, onComplete: function () { 
            _this.scene.tweens.add({targets: bonus_anim, x: pt.x - 5, y: pt.y, duration: 50, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y + 5, duration: 50, onComplete: function () { 
                    _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y - 5, duration: 50, onComplete: function () { 
                        _this.scene.tweens.add({targets: bonus_anim, x: pt.x, y: pt.y, duration: 50, onComplete: function () { 
                            _this.scene.tweens.add({targets: bonus_anim, scaleX: 0.05, scaleY: 0.05, duration: 300, onComplete: function () { 
                                bonus_anim.destroy();
                            }});                
                        }});                
                    }});                
                }});                
            }});                
        }});


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus10_part");
        part1.setScale(0.09, 0.03);
        part1.angle = 45;
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus10_part");
        part2.setScale(0.09, 0.03);
        part2.angle = 135;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus10_part");
        part3.setScale(0.09, 0.03);
        part3.angle = -135;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus10_part");
        part4.setScale(0.09, 0.03);
        part4.angle = -45;
        this.moving_holder.add(part4);



        this.scene.time.delayedCall(200, function(){
            _this.scene.tweens.add({targets: part1, x: pt.x + 60, y: pt.y + 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part1, x: pt.x + 160, y: pt.y + 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                    part1.destroy();
                }});                
            }});
       
            _this.scene.tweens.add({targets: part2, x: pt.x - 60, y: pt.y + 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part2, x: pt.x - 160, y: pt.y + 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                    part2.destroy();
                }});                
            }});

            _this.scene.tweens.add({targets: part3, x: pt.x - 60, y: pt.y - 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part3, x: pt.x - 160, y: pt.y - 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                   part3.destroy();
                }});                
            }});
            
            _this.scene.tweens.add({targets: part4, x: pt.x + 60, y: pt.y - 60, scaleX: 0.6, scaleY: 0.2,  duration: 80, onComplete: function () { 
                _this.scene.tweens.add({targets: part4, x: pt.x + 160, y: pt.y - 160, scaleX: 1, scaleY: 0.33,  duration: 300, onComplete: function () { 
                  part4.destroy();
                }});                
            }});

        }, [], this);
        
    }

    
    play_bonus_anim11(obj, on_explosion) {
        var _this = this;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var span = 3;
        var dist = game_data['dim']['item_width'] * (span - 1);
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());

        var bonus_anim = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus11");
        this.moving_holder.add(bonus_anim);
        var bonus_anim_light = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "gem_bonus11");
        this.moving_holder.add(bonus_anim_light);

        bonus_anim_light.alpha = 0;
        bonus_anim_light.setTintFill(0xFFFFFF);


        this.scene.time.delayedCall(200, function(){

            _this.scene.tweens.add({targets: bonus_anim, scaleX: 1.3, scaleY: 1.3, duration: 150, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: function () { 
                    bonus_anim.destroy();
                }});                
            }});


            _this.scene.tweens.add({targets: bonus_anim_light, alpha: 1, scaleX: 1.3, scaleY: 1.3, duration: 150, onComplete: function () { 
                _this.scene.tweens.add({targets: bonus_anim_light, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: function () { 
                    bonus_anim_light.destroy();
                }});                
            }});
        }, [], this);


        var part1 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus11_part");
        part1.setOrigin(0, 0.5);
        part1.setScale(0.15);
        this.moving_holder.add(part1);
        
        var part2 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus11_part");
        part2.setOrigin(0, 0.5);
        part2.setScale(0.15);
        part2.angle = 90;
        this.moving_holder.add(part2);

        var part3 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus11_part");
        part3.setOrigin(0, 0.5);
        part3.setScale(0.15);
        part3.angle = 180;
        this.moving_holder.add(part3);

        var part4 =  new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, "common1", "bonus11_part");
        part4.setOrigin(0, 0.5);
        part4.setScale(0.15);
        part4.angle = -90;
        this.moving_holder.add(part4);



        


            _this.scene.tweens.add({targets: part1, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part1, x: pt.x + 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part1.destroy();
                    }});   
                }, [], _this);             
            }});
       
            _this.scene.tweens.add({targets: part2, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part2, y: pt.y + 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part2.destroy();
                    }});   
                }, [], _this);             
            }});

            _this.scene.tweens.add({targets: part3, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part3, x: pt.x - 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part3.destroy();
                    }});   
                }, [], _this);             
            }});
            
            _this.scene.tweens.add({targets: part4, scaleX: 1, scaleY: 1,  duration: 300, onComplete: function () { 
                _this.scene.time.delayedCall(300, function(){
                    _this.scene.tweens.add({targets: part4, y: pt.y - 190, scaleX: 0.03, duration: 300, onComplete: function () { 
                        part4.destroy();
                    }});   
                }, [], _this);             
            }});

        

    }


    play_bonus_anim12(obj, attr) {	
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var pt = game_data['utils'].toLocal(this.moving_holder, this.field_items[pos_y][pos_x].get_center_pt());        
        var dist = 600;
        
        var rocket1 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket1);        
        var rocket2 = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
        this.moving_holder.add(rocket2);


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus12');
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, 60, 0).play('fire_anim');
        rocket_fire.angle = 0;
        rocket1.add(rocket_body);
        rocket1.add(this.scene.add.existing(rocket_fire));


        var rocket_body = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", 'gem_bonus12');
        rocket_body.angle = 180;
        var rocket_fire = new Phaser.GameObjects.Sprite(this.scene, -60, 0).play('fire_anim');
        rocket_fire.angle = 180;
        rocket2.add(rocket_body);
        rocket2.add(this.scene.add.existing(rocket_fire));

        
        this.scene.tweens.add({targets: rocket1, x: pt.x - dist,  duration: 200, onComplete: function () { 
            rocket1.destroy();
        }});

        this.scene.tweens.add({targets: rocket2, x: pt.x + dist,  duration: 200, onComplete: function () { 
            rocket2.destroy();
        }});		
    }			
    
    
    show_bonus_anim(obj) {
        /*
        var bonus_anim;
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        var bonus_id = obj['id'];

        if (bonus_id == 1) {
            bonus_anim = new Bonus1Anim();
        }
        if (bonus_id == 2) {
            bonus_anim = new Bonus2Anim();
        }
        if (bonus_id == 3) {
            bonus_anim = new Bonus3Anim();				
        }
        if (bonus_id == 4) {
            bonus_anim = new Bonus4Anim();				
        }			
        if (bonus_id == 5) {
            bonus_anim = new Bonus5Anim();				
        }		
        if (bonus_id == 6) {
            bonus_anim = new Bonus6Anim();				
        }				
        if (bonus_id == 7) {
            bonus_anim = new Bonus7Anim();				
        }				
        if (bonus_id == 8) {
            bonus_anim = new Bonus8Anim();				
        }				
        if (bonus_id == 9) {
            bonus_anim = new Bonus9Anim();				
        }				
        if (bonus_id == 10) {
            bonus_anim = new Bonus10Anim();				
        }				
        if (bonus_id == 11) {
            bonus_anim = new Bonus11Anim();				
        }				
        if (bonus_id == 12) {
            bonus_anim = new Bonus12Anim();				
        }				
                        


        var pt = moving_holder.globalToLocal(field_items[pos_y][pos_x].get_center_pt());
        bonus_anim.x = pt.x;
        bonus_anim.y = pt.y;
        moving_holder.addChild(bonus_anim);
        bonus_anim.addEventListener(Event.ENTER_FRAME, function(event){
            if (bonus_anim.currentFrame == bonus_anim.totalFrames) {
                bonus_anim.removeEventListener(event.type, arguments.callee);
                moving_holder.removeChild(bonus_anim);
            }
        });		
        */	
    }

    
    find_lightning_item(params) {
        
        var i;
        var ind;
        var current_items = params['items'];
        var pos_x = current_items[current_items.length - 1]['pos_x'];
        var pos_y = current_items[current_items.length - 1]['pos_y'];
        var last_dir = _params['dir'];
        var map = _params['map'];
        
        var total_remove = _params['total'];
        var cur_dir;
        var possible_items = [];
        var res = {'success': false};
        var item;
        
        if (last_dir == 'horizontal') {
            cur_dir = 'vertical';
            for (i = 0; i < map.length; i++) {
                if (map[i][pos_x] && !this.is_repeated({'pos_x': pos_x, 'pos_y': i, 'items': current_items}))
                    possible_items.push({'pos_x': pos_x, 'pos_y': i, 'dir': cur_dir});
            }				
        }
        else if (last_dir == 'vertical') {
            cur_dir = 'horizontal';
            for (i = 0; i < map[pos_y].length; i++) {
                if (map[pos_y][i] && !this.is_repeated({'pos_x': i, 'pos_y': pos_y, 'items': current_items}))
                    possible_items.push({'pos_x': i, 'pos_y': pos_y, 'dir': cur_dir});
            }				
        }
        else {
            cur_dir = 'vertical';
            for (i = 0; i < map.length; i++) {
                if (map[i][pos_x] && !this.is_repeated({'pos_x': pos_x, 'pos_y': i, 'items': current_items}))
                    possible_items.push({'pos_x': pos_x, 'pos_y': i, 'dir': cur_dir});
            }	


            cur_dir = 'horizontal';
            for (i = 0; i < map[pos_y].length; i++) {
                if (map[pos_y][i] && !this.is_repeated({'pos_x': i, 'pos_y': pos_y, 'items': current_items}))
                    possible_items.push({'pos_x': i, 'pos_y': pos_y, 'dir': cur_dir});
            }			

        }
        
        
        if (possible_items.length > 0) {
            while (possible_items.length) {
                ind = Math.floor(Math.random() * possible_items.length);
                item = possible_items[ind];
                possible_items.splice(ind, 1);
                
                if (current_items.length == total_remove - 1)
                    return {'success': true, 
                            'items': current_items.concat(item)}
                else {					

                    return this.find_lightning_item({'dir': item['dir'],
                                                'items': current_items.concat(item),
                                                'map': map,												   
                                                'total': total_remove});



                }
            }
        }
        
        return res;					
    }
    
    is_repeated(obj) {        
        var cur_items = obj['items'];
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        for (var i = 0; i < cur_items.length; i++) {
            if (cur_items[i]['pos_x'] == pos_x &&
                cur_items[i]['pos_y'] == pos_y)
            return true;
        }
        return false;        
    }
    
    apply_resuffle() {
        if (!this.reshuffling) {
            setTimeout(() => {
                this.shuffle_gems();    
            }, 300);				
            
            //this.emitter.emit('EVENT', {'event': 'BONUS_USED'});            
            this.emitter.emit("EVENT", {'event': 'BOOSTER_USED', 'booster_id': 'booster3'});
        }				
    }
    get_min_combination(all_gems, field_items_arr) {
        let id = 1
        let max_id = 6
        let min_three_ids = []
        let field_items = []
        while(id <= max_id) {
            min_three_ids = all_gems.filter(el => el.get_id() === id)
            if (min_three_ids.length >= 3) {
                break;
            }
            id++
        }
        min_three_ids.splice(3)

        for (let i = 0; i < field_items_arr.length; i++) {
            let fi = field_items_arr[i]
            let pos_x = fi['pos_x']
            let pos_y = fi['pos_y']
            let arr = [
                {pos_x: pos_x, pos_y: pos_y},
                {pos_x: pos_x + 1, pos_y: pos_y},
                {pos_x: pos_x + 2, pos_y: pos_y + 1}
            ]
            arr.forEach(elem => {
                let {pos_x, pos_y} = elem
                
                if (this.field_items[pos_y] && this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_empty() && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_freezed() && !this.field_items[pos_y][pos_x].is_locked()) {
                    
                    field_items.push(this.field_items[pos_y][pos_x])
                }
            })
            
            if (field_items.length >= 3 && this.field_items[pos_y] && this.field_items[pos_y][pos_x + 2] && this.field_items[pos_y][pos_x + 2].is_empty() && !this.field_items[pos_y][pos_x + 2].is_blocked() && !this.field_items[pos_y][pos_x + 2].is_freezed() && !this.field_items[pos_y][pos_x + 2].is_locked()) break
            else field_items = []
        }
        
        if (min_three_ids.length >= 3 && field_items.length >= 3) {
            min_three_ids.forEach(gem => {
                all_gems.splice(all_gems.indexOf(gem), 1)
            })
            field_items.forEach(fi => {
                field_items_arr.splice(field_items_arr.indexOf(fi), 1)
            })
        }
        return [min_three_ids, field_items]
    }

    shuffle_gems() {
		let fall = this.gems_manager.gems_holder.list.find(g => (g && g.is_falling && g.is_falling()));
		if (this.gems_manager.check_no_activity() && !this.gems_manager.tutorial_manager.check_active() && this.gems_manager.attr['level_active'] && !this.gems_manager.attr['moves_blocked'] && !this.gems_manager.allow_update_items && !fall &&  !this.gems_manager.pointer_is_down() && this.gems_manager.allow_reshuffle) {
            
            var i;
            var pos_x;
            var pos_y;
            var ind;        
            var all_gems = [];
            var gem;
            var pt;
            var field_items_arr = [];
            var shuffle_timeout = 2000;
            var _this = this;
		
            if (!this.reshuffling) {	
                game_data['active_tornado']	= true;
                this.reshuffling = true;			
                for(pos_y = 0; pos_y < this.field_items.length; pos_y++){				
                    for(pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++){					
                        if(this.field_items[pos_y][pos_x] && this.field_items[pos_y][pos_x].is_normal() && !this.field_items[pos_y][pos_x].is_blocked() && !this.field_items[pos_y][pos_x].is_freezed() && !this.field_items[pos_y][pos_x].is_locked()) {
                            gem = this.field_items[pos_y][pos_x].remove_gem();						
                            all_gems.push(gem);	
                            field_items_arr.push(this.field_items[pos_y][pos_x]);
                        }
                    }
                }									
                
                let [gems, fields] = this.get_min_combination(all_gems, field_items_arr)

                if (gems.length >= 3 && fields.length >= 3) {
                    for(let i = 0; i < fields.length; i++){
                        gem = gems.shift();
                        // console.log(gem.get_id())
                        pt = fields[i].get_target_gem_pt();

                        fields[i].add_gem(gem);
                        gem.move_shuffle(pt);				
                    }
                }


                for(i = 0; i < field_items_arr.length; i++){				
                    ind = Math.floor(Math.random() * all_gems.length);
                    gem = all_gems[ind];
                    pt = field_items_arr[i].get_target_gem_pt();
                    field_items_arr[i].add_gem(gem);
                    gem.move_shuffle(pt);
                    all_gems.splice(ind, 1);					
                }
                if (loading_vars['net_id'] == 'ios') {
    
                }
                else {
                   
                    try {
                        var pt = new Phaser.Geom.Point(600,300);;
                        var tornado = game_data['scene'].add.spine(pt.x, pt.y, 'tornado', 'animation', false);
                        game_data['tornado'] = tornado
                        game_data['game_play'].add(tornado)
                        tornado.visible = false;
                        setTimeout(() => {
                            this.gems_manager.block_moves();
                            tornado.visible = true;    
                        }, 50);
                        
                        setTimeout(() => {
                            for(let pos_y = 0; pos_y < this.field_items.length; pos_y++)		
                                for(let pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++) {
                                    if ( this.field_items[pos_y] &&  this.field_items[pos_y][pos_x]) {
                                        this.gems_manager.empty_field_items.push(this.field_items[pos_y][pos_x])
                                    }
                                }
                           
                            _this.gems_manager.allow_update_items = true;
                            // if (!game_data['moves_panel'].check_no_moves())
                            this.gems_manager.unblock_moves();
                        }, 1000);
                        
                        setTimeout(() => {
                            game_data['active_tornado'] = false;
                            game_data['tornado'] = null
                            tornado.destroy();
                            if (game_data['game_engine']['playing_field']['gems_manager']['gems_utils'].get_hint_pair().length === 0) game_data['game_engine']['playing_field']['gems_manager'].check_reshuffle();
                        }, 2500);
                    }
                    catch(e) {
                        console.error(e)
                    }
                }
                game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus3'});
                game_data['utils'].delayed_call(shuffle_timeout, function(){
                    _this.reshuffling = false;              
                }, [], this);           
            }
            
        }
		
	}	

    get_quiet_items() {        
        var all_items = new Array();
        
        for(var pos_y = 0; pos_y < this.field_items.length; pos_y++){				
            for(var pos_x = 0; pos_x < this.field_items[pos_y].length; pos_x++){					
                if(this.field_items[pos_y][pos_x] && 
                   !this.field_items[pos_y][pos_x].is_dynamical() &&
                   this.field_items[pos_y][pos_x].is_normal())
                    all_items.push({'pos_x': pos_x, 'pos_y': pos_y});
            }
        }						
        return all_items;					
    }
            
    get_array(arr, obj) {
        
        var i;
        var res = [];
        var val;
        var skip_adding;
        
        for (i = 0; i < arr.length; i++) {
            skip_adding = false;
            for (val in obj) {
                if (arr[i][val] != obj[val]) {
                    skip_adding = true;
                    break;
                }
            }
            if (!skip_adding)
                res.push(arr[i]);
        }
        return res;
    }
    
    add_shake(bonus_id, obj) {
        /*
        var i;
        var pos_x;
        var pos_y;
        var gem;			
        var shake_items = get_bonus_cursor_items(bonus_id, obj);

        for (i = 0; i < shake_items.length; i++) {
            pos_x = shake_items[i]['pos_x'];
            pos_y = shake_items[i]['pos_y'];
            gem = field_items[pos_y][pos_x].get_gem();
            if (gem)								
                gem.add_shake();						
        }
        */
    }
    
    remove_shake() {
        /*
        for (var i = 0; i < this.bonus_cursor_info['anim_items'].length; i++)
            this.bonus_cursor_info['anim_items'][i].remove_shake();
        */    
    }
    
    booster_click(params) {
        if (params['booster_id'] == 'booster3') {
            
            //this.shuffle_gems();
            this.apply_resuffle();
        }
        else if (params['booster_id'] == 'booster4') {
            
            this.apply_booster4(params);
        }        
        else if (params['booster_id'] == 'booster5') {
            this.apply_booster5();
        }
        else if (params['booster_id'] == 'booster6') {
            this.apply_bonus16();
            this.emitter.emit("EVENT", {'event': 'BOOSTER_USED', 'booster_id': 'booster6'});
        }
    }
    
    dummy_function() {}
    
    destroy_level() {
        this.is_bonus_anim = false
    }
    
    destroy_manager() {
        /*
        game_data['stage'].removeEventListener(MouseEvent.MOUSE_MOVE, handler_mouse_move);
        game_data['stage'].removeEventListener(MouseEvent.MOUSE_UP, handler_mouse_up);			
        clearTimeout(candy_timeout_id);
        */
    }

}