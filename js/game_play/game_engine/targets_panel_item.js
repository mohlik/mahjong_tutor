var TargetsPanelItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function TargetsPanelItem (scene)
    {
        
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

    init(params, spine_holder = null) {        
        //icon_size = {'w': icon_holder.width, 'h': icon_holder.height};

        this.icon_size = {'w': 50, 'h': 50};
        this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "game_map", "panel_item_bg");
        this.bg.setScale(0.7,0.7);
        this.bg.setOrigin(0.5, 0.5);
        this.add(this.bg);  
    
        this.amount_txt = new Phaser.GameObjects.Text(this.scene, 38, 0,  params['amount'], { fontFamily: 'font1', fontSize: 40, color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
        this.amount_txt.setOrigin(0.5, 0.5);
        this.add(this.amount_txt);
        this.current_amount = params['amount'];

        this.complete_icon = new Phaser.GameObjects.Image(this.scene, 40, 0, 'game_windows', 'icon_complete');
        this.add(this.complete_icon);
        this.complete_icon.visible = false;

        var item_type = params['type'];
        var item_id = params['id'];
        

        this.info = params;

        var key = '';
        this.allow_anim = true;
        this.allow_light_stars = true;
        switch (item_type) {
            case 'normal':
                phrase_id = '1';
                key = "gem_" + item_type + item_id;
                break;
            case 'mark':
                phrase_id = 'target_mark_' + item_id;
                key = "gem_" + item_type + item_id + '_1';            
                break;
            case 'bonus':
                phrase_id = 'target_bonus_' + item_id;
                key = "gem_" + item_type + item_id;
                break;
            case 'bottom':
                phrase_id = 'target_bottom_' + item_id;
                key = "gem_" + item_type + item_id;
                break;
            case 'fireball':
                phrase_id = 'target_fireball_' + item_id;
                key = "gem_" + item_type + item_id;
                this.allow_light_stars = false;
                break;
            case 'tiles':
                phrase_id = 'target_tiles';
                key = "tile1";
                this.allow_light_stars = false;
                break;					
        }
    
        this.item_mc = new Phaser.GameObjects.Image(this.scene, -32, 0, "common1", key);
        var size = 70;        
        var scale = Math.min(size / this.item_mc.width, size / this.item_mc.height);    
        this.item_mc.scaleX = scale;
        this.item_mc.scaleY = scale;
        this.def_scale = scale;
        this.item_mc.setOrigin(0.5, 0.5);    
        this.add(this.item_mc);

        game_data['error_history'].push('gptpi1');
        this.item_mc.visible = false;
        this.amount_txt.visible = false;

        var _this = this
        this.bg.setInteractive();
        this.bg.on('pointerdown', function() {
            game_data['tip_type_down'] = _this.info['phrase_id'];
        });
        this.bg.on('pointerup', function() {
            if (_this.info['phrase_id'] &&  game_data['tip_type_down'] == _this.info['phrase_id']) {
                game_data['tip_type_down'] = '';
                var pt = game_data['utils'].toGlobal(_this, new Phaser.Geom.Point(0, 30));
		        game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_play', 'item_id': 'level_targets', 'phrase_id': _this.info['phrase_id'], 'values': []});
            }
        });
    },
    

    display_panel_item() {
        this.item_mc.visible = true;
        this.amount_txt.visible = true;
    },

    update(params) {
        this.removed = false;
        //this.info = params;
        
        /*
        amount_txt.visible = true;
        check_mark.visible = false;			
        check_mark.gotoAndStop(1);
        check_mark_checked = false;
         */

        this.total_amount = this.current_amount;
       // this.update_amount();
        this.display_amount(this.info['amount']);
        
        /*
        icon_holder.scaleX = 1;
        icon_holder.scaleY = 1;
        while (icon_holder.numChildren)
            icon_holder.removeChildAt(0);
        amount_txt.text = "";
        */
        this.allow_anim_panel_item = true;
    },
    
    show_item(icon_mc) {
        
        this.item_mc.visible = true;
        this.amount_txt.visible = true;        
        
        /*
        icon_mc.x = 10;
        icon_mc.y = 10;
        this.add(icon_mc);
        
        var icon_scale;			
        icon_mc.x = 0; 
        icon_mc.y = 0;
        icon_mc.scaleX = icon_mc.scaleY = 1;
        icon_scale = Math.min(icon_size['w'] / icon_mc.width, icon_size['h'] / icon_mc.height);        
        TweenMax.killTweensOf(icon_holder);
        icon_holder.scaleX = 1;
        icon_holder.scaleY = 1;
        icon_holder.addChild(icon_mc);
        */
        //this.display_amount(info['amount']);
    },
            
    get_type() {
        return this.info['type'];
    },
    
    get_id() {
        return this.info['id'];
    },


    update_amount(delta_amount) {    
        /*
        this.current_amount -= delta_amount;
        if (this.current_amount < 0) this.current_amount = 0;
        
        return delta_amount / total_amount;

        */
    },
    
    anim_before_display() {
        /*
        if (allow_anim_panel_item) {
            allow_anim_panel_item = false;
            TweenMax.killTweensOf(icon_holder);
            icon_holder.scaleX = 1;
            icon_holder.scaleY = 1;
            TweenMax.to(icon_holder, 0.3, {scaleX: 1.3, scaleY: 1.3, onComplete: function() {
                anim_before_display_stop() 
            }});
        }
        else anim_before_display_stop();
        */
    },

    anim_before_display_stop() {
        /*
        clearTimeout(tid_anim_before);
        tid_anim_before = setTimeout(function() {
            TweenMax.to(icon_holder, 0.3, {scaleX: 1, scaleY: 1, onComplete: function() {
            
            }});
            allow_anim_panel_item = true;
        }, 700);
        */
    },

    display_amount(_amount, delay = 10) {
        var _this = this;       
        if (this.current_amount > 0 && _amount <= 0) {
            this.run_icon_anim = true;
            this.complete_icon.alpha = 0;
            this.complete_icon.setScale(0.1, 0.1);
        }    

        if (_amount >= 0) this.current_amount = _amount;
        
        setTimeout(() => {
            if (_amount >= 0)  this.amount_txt.text = String(this.current_amount);
            this.complete_icon.visible = (_amount <= 0);
            this.amount_txt.visible = (_amount > 0);
            if (this.allow_anim && this.scene) {
                this.allow_anim = false;
                
                if (this.allow_light_stars) {
                    var pt =  game_data['utils'].toGlobal(this, new Phaser.Geom.Point(_this.item_mc.x, _this.item_mc.y));
                    game_data['utils'].add_light_stars(pt, _this, function() {});   
                }
                game_data['scene'].tweens.add({targets: _this.item_mc, scaleX: _this.def_scale * 1.2, scaleY: _this.def_scale * 1.2, duration: 200, onComplete: function () {                   
                    if (_this.scene) game_data['scene'].tweens.add({targets: _this.item_mc, scaleX: _this.def_scale, scaleY: _this.def_scale, duration: 200, onComplete: function () {                   
                        _this.allow_anim = true;
                    }});
                }});
            }
            if (this.run_icon_anim && _this.scene) {
                this.run_icon_anim = false;
                game_data['scene'].tweens.add({targets: _this.complete_icon, alpha: 1, duration: 80});
                game_data['scene'].tweens.add({targets: _this.complete_icon, scaleX: 1.5, scaleY: 1.5, duration: 300, onComplete: function () {                   
                    if (_this.scene) game_data['scene'].tweens.add({targets: _this.complete_icon, scaleX: 1, scaleY: 1, duration: 200});
                }});
            }
        }, delay);
        
    },
    
    get_target_panel_pos() {
        return {
            'icon': {
                'pt': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(-45, 0)),
                'w': this.icon_size['w'],
                'h': this.icon_size['h']
            },
            'txt': {
                'pt': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(30, 0)),
                //'pt': localToGlobal(new Point(amount_txt.x, amount_txt.y))//,
                //'w': amount_txt.width,
                //'h': amount_txt.height
            }
        };
    },
    
    play_bg() {
        
    },
    
    stop_bg() {
        
    },
    
    start_prepare_for_copy() {
        
    },

    finish_prepare_for_copy() {
        
    },

    get_items_left() {
        return null;
    },

    is_finished() {
        return this.current_amount == 0;
    },

    get_pts() {
        return {
            'icon': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(-30, 0)), 
            'amount': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(30, 0))
        };
    }

});



