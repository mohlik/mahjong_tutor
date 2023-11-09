class TargetsManager{
	constructor(){

    }
    
    init() {

        this.emitter = new Phaser.Events.EventEmitter();        
        this.is_complete = false;
        game_data['is_level_complete'] = this.is_complete;
    }
    
    update_manager(params) {
        game_data['error_history'].push('gptm1');
        this.level_id = params['level_id'];
        this.level = params['level'];
        this.targets = this.generate_targets();        

        this.total_items = this.targets.length;
        this.is_complete = false;
        game_data['is_level_complete'] = this.is_complete;
    }		
    
    generate_targets() {
        var total_tiles = this.get_total_tiles();
        var i;
        var j;
        var k;
        var id;
        var field;
        var res = [];
        var bottom = {};
        var fireball = {}
        
        
        if ('target_normal' in this.level && this.level['target_normal'].length > 0)
            for (i = 0; i < this.level['target_normal'].length; i++)
                res.push({'type': 'normal', 
                          'id': this.level['target_normal'][i]['id'], 
                          'amount': this.level['target_normal'][i]['amount']
                          });

        if ('target_mark' in this.level && this.level['target_mark'].length > 0)
            for (i = 0; i < this.level['target_mark'].length; i++)
                res.push({'type': 'mark', 
                          'id': this.level['target_mark'][i]['id'], 
                          'amount': this.level['target_mark'][i]['amount']
                          });


        if ('target_bonus' in this.level && this.level['target_bonus'].length > 0)
            for (i = 0; i < this.level['target_bonus'].length; i++) {

                res.push({'type': 'bonus', 
                          'id': this.level['target_bonus'][i]['id'], 
                          'amount': this.level['target_bonus'][i]['amount']
                          });	
            }
        if (total_tiles > 0)
            res.push({'type': 'tiles', 
                      'id': 1, 
                      'amount': total_tiles
                      });						
        return res;
    }
    
    get_targets() {    
        return this.targets;        
    }

    
    check_target_gem(gem) {        
        var i;        
        for (i = 0; i < this.targets.length; i++) {							
            if (gem.get_type() == this.targets[i]['type'] && 
                gem.get_id() == this.targets[i]['id'] && 
                this.targets[i]['amount'] > 0 && 
                (gem.get_type() != 'mark' || gem.is_marked()))
                return true;
        }
        
        return false;
    }

    tile_destroyed(params) {		
        
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i]['type'] == 'tiles') {
                this.targets[i]['amount']--;
                this.emitter.emit('EVENT', {'event': 'TILE_DESTROYED', 'amount': this.targets[i]['amount'], 'pt': params['pt'], 'tile':params['tile']});
                break;
            }			
                        
        this.check_for_finish();			
    }
    
    update_target(obj) {
        for (var i = 0; i < this.targets.length; i++) {							
            if (obj['type'] == this.targets[i]['type'] && 
                obj['id'] == this.targets[i]['id'] && 
                this.targets[i]['amount'] > 0 && 
                (obj['type'] != 'mark' || obj['marked'])) {
                    this.targets[i]['amount']--;	
                    this.check_for_finish();
                    return {'amount': this.targets[i]['amount'], 'ind': i};
                    
            }
        }
        return null;
    }
    
    
    check_target_bonus(bonus_id) {
        for (var i = 0; i < this.targets.length; i++) {
            if (this.targets[i]['type'] == 'bonus' && this.targets[i]['id'] == bonus_id && this.targets[i]['amount'] > 0)
                return true;				
        }			
        return false;
    }


    
    check_for_finish() {	

        
        // if (!this.is_complete && this.get_finished()) {        
        //     this.is_complete = true;
        //     game_data['is_level_complete'] = this.is_complete;
        //     this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});            
        // }
        
    }			
    
    get_total_tiles() {
        var total_tiles = 0;
        for (var i = 0; i < this.level['fields'].length; i++)
            for (var pos_y = 0; pos_y < this.level['fields'][i]['tiles'].length; pos_y++)
                for (var pos_x = 0; pos_x < this.level['fields'][i]['tiles'][pos_y].length; pos_x++)
                    if (this.level['fields'][i]['tiles'][pos_y][pos_x] != '-')
                        total_tiles++;
             
        return total_tiles;
    }		
    
    get_panel_items() {
        return [];
    }
    
    get_items_left() {        
        return [];
    }
    
    get level_complete() {        
        return this.is_complete;
    }
    
    set_level_complete(_is_complete) {        
        this.is_complete = _is_complete;
        game_data['is_level_complete'] = is_complete;        
    }				

    get_finished() {
        
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i]['amount'] > 0)
                return false;
                
        return true;
        
    }

    handler_event(params) {
        switch (params['event']) {
            case '':
                this.handler_field_appeared(params);
            break;
                      
            default:
                this.emitter.emit('EVENT', params);
            break;
        }
    }

    get_fail_tasks() {
        game_data['error_history'].push('gptm3');
        var ret = [];
        var obj = {};
        var i = 0;
        for (i = 0; i < this.targets.length; i++) {
            obj = {'type': this.targets[i]['type'], 'id': this.targets[i]['id'], 'completed': this.targets[i]['amount'] <= 0};
            ret.push(obj);
        }
        return ret;
    }
    
    destroy_manager() {

    }		

}