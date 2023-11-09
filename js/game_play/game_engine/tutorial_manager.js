class TutorialManager{
	constructor(){

    }
    
    init(params) {

        this.emitter = new Phaser.Events.EventEmitter();
        this.field_items = params['field_items'];
        this.boosters_panel = params['boosters_panel'];
        this.level_scale = 1;
       this.is_active = false;
       game_data['field_tutorial_manager'] = this;
    }
    
    update_tutorial(params) {
        game_data['error_history'].push('gpet1');
        this.level_id = params['level_id'];
        this.level = params['level'];
        this.is_booster_tutorial = false;
        this.tutorials = [];
        this.tutorial_iteration = 0;
        
        if (!game_data['utils'].check_matrix_empty(this.level['fields'][0]['tutorial1'])) 
            this.tutorials.push(this.level['fields'][0]['tutorial1']);
        if (!game_data['utils'].check_matrix_empty(this.level['fields'][0]['tutorial2'])) 
            this.tutorials.push(this.level['fields'][0]['tutorial2']);			

       this.is_active = true;
       
    }	
    
    is_allowed(params) {    
            
        if (this.tutorial_iteration >= 0 && this.tutorial_iteration < this.tutorials.length) {
            if (params['type'] == 'click')
                return this.allow_click(params);
            else if (params['type'] == 'swap')
                return this.allow_swap(params['item1'], params['item2']);
            else if (params['type'] == 'double_click')
                return this.allow_double_click(params);
            else
                return true;
        }
        else 
            return true;       
    }
    
    allow_swap(obj1, obj2) {
    
        var arr = this.tutorials[this.tutorial_iteration];
        var pos1_x = obj1['pos_x'];
        var pos1_y = obj1['pos_y'];
        var pos2_x = obj2['pos_x'];
        var pos2_y = obj2['pos_y'];
        
        if ((parseInt(arr[pos1_y][pos1_x]) == 2 || parseInt(arr[pos1_y][pos1_x]) == 3) &&
            (parseInt(arr[pos2_y][pos2_x]) == 2 || parseInt(arr[pos2_y][pos2_x]) == 3)) {
            return true;

            }
        else {
            return false;
        }
    }
    
    allow_click(obj) {
        
        var arr = this.tutorials[this.tutorial_iteration];
        var pos_x = obj['pos_x'];
        var pos_y = obj['pos_y'];
        
        if (parseInt(arr[pos_y][pos_x]) == 1 || parseInt(arr[pos_y][pos_x]) == 2 || parseInt(arr[pos_y][pos_x]) == 3 || arr[pos_y][pos_x] == 'B0')
            return true;
        else
            return false;
            
    }	
    
    allow_double_click(obj) {
        return true;
    }
    
    check_tutorial() {
        if (this.is_active) {
            
            var ret_obj = {'engine_tutorial': true}
            if (this.tutorial_iteration < this.tutorials.length) {
                var holes = this.get_holes();
                var hand = this.get_hand();
                
                ret_obj['holes'] = holes;
                ret_obj['hand'] = hand;
                //console.log(JSON.stringify(holes),JSON.stringify(hand))
                //this.emitter.emit('EVENT', {'event': 'UPDATE_TUTORIAL', 'holes': holes, 'hand': hand, 'interactive': true});            
                this.is_active = true;            
            }
            else {
                //this.emitter.emit('EVENT', {'event': 'UPDATE_TUTORIAL', 'interactive': false});  
                this.is_active = false;  
            }
            return ret_obj;
        }
    }
    
    get_holes() {
        var i;
        var j;
        var cell_size;
        var pt;
        var arr = this.tutorials[this.tutorial_iteration];
        var res = [];        
        
            for (i = 0; i < arr.length; i++) {
                for (j = 0; j < arr[i].length; j++) {
                    if (arr[i][j] != '-') {
                        if (arr[i][j] == '1' || arr[i][j] == '2' || arr[i][j] == '3' ||
                            arr[i][j] == 'B1' || arr[i][j] == 'B2' || arr[i][j] == 'B4' || arr[i][j] == 'B6') {
                            pt = this.field_items[i][j].get_center_pt();
                            cell_size = game_data['dim']['item_width'] * this.level_scale;
                            res.push({'pt': pt, 'w': cell_size, 'h': cell_size, pos_y: i, pos_x: j, 'rect': true, 'type': arr[i][j]});
                            
                        }
                        if (arr[i][j] == 'B1' || arr[i][j] == 'B2' || arr[i][j] == 'B3' ||
                            arr[i][j] == 'B4' || arr[i][j] == 'B5' || arr[i][j] == 'B6') {
                            var id = parseInt(arr[i][j].slice(1));
                            var info = this.boosters_panel.get_booster_info(id);                            
                            pt = info['pt'];
                            var need_arrow = (arr[i][j] == 'B3' || arr[i][j] == 'B5')
                            res.push({'pt': pt, 'w': info['w'], 'h': info['h'], 'arrow': need_arrow, pos_y: i, pos_x: j, 'is_booster': true, 'rect': true});
                            this.is_booster_tutorial = true;
                            
                        }			
                        if (arr[i][j] == 'B0') {
                            pt = this.field_items[i][j].get_center_pt();
                            cell_size = game_data['dim']['item_width'] * this.level_scale;
                            res.push({'pt': pt, 'w': cell_size, 'h': cell_size, pos_y: i, pos_x: j, 'arrow': true, 'rect': true});
                        }
                    }
                }
            }			
        return res;
    }

    get_hand() {
        
        var arr = this.tutorials[this.tutorial_iteration];
        var pt1 = null;
        var pt2 = null;
        var pos = [];
        var pt;
        var i;
        var j;
        var res;
        
        for (i = 0; i < arr.length; i++) {
            for (j = 0; j < arr[i].length; j++) {
                if (arr[i][j] == '2') {
                    pt1 = this.field_items[i][j].get_center_pt();
                    pos.push(pt1);						
                }
                if (arr[i][j] == '3') {
                    pt2 = this.field_items[i][j].get_center_pt();	
                }
                if (arr[i][j] == 'B1' || arr[i][j] == 'B2' || arr[i][j] == 'B4') {
                    var id = parseInt(arr[i][j].slice(1));
                    var info = this.boosters_panel.get_booster_info(id);
                        
                    pt1 = info['pt'];							
                    pt2 = this.field_items[i][j].get_center_pt();
                }
            }
        }			
        if (pos.length > 1) {
            pt1 = pos[0];
            pt2 = pos[1];
        }
            
        if (pt1 && pt2) {
            //pt = new Phaser.Geom.Point(pt1.x - 70, pt1.y + 70);            
            res = {'pts': [pt, pt1, pt2]};
            res = {'pts': [pt1, pt2]};
        }			
        else
            res = null;
            
        return res;
        
    }

    hide_tutorial() {
        if (this.is_active && game_data['game_tutorial'].allow_action({'event': 'engine_tutorial', 'timeout': this.tutorials.length > 1 ? 500 : 10})) {
            this.tutorial_iteration++;
            this.emitter.emit('EVENT', {'event': 'UPDATE_TUTORIAL', 'hide': true});            
            this.is_active = this.tutorial_iteration < this.tutorials.length;       
            if (!this.is_active) this.emitter.emit('EVENT', {'event': 'GAME_PLAY_TUTORIAL_FINISHED'});   
        }        
    }

    booster_used() {
        this.is_booster_tutorial = false;
    }


    check_active() {        
        return this.is_active;
    }

    skip_tutorial() {
        game_data['error_history'].push('gpet3');
        this.tutorials = [];
        this.is_active = false;   
    }

    update_scale(level_scale) {
        this.level_scale = level_scale;
    }

}