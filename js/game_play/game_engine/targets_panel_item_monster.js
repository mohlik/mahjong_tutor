var TargetsPanelItemMonster = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function TargetsPanelItemMonster (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

    init(params, spine_holder) {        
        var _this = this;
        var scale;
        var size = 250;
        var item_id = params['id'];
        this.total_length = 150;
        this.info = params;
        this.spine_holder = spine_holder;
        this.monster_icon = null;
        this.monster = new Phaser.GameObjects.Container(this.scene, 0, 0);
        
        if (parseInt(item_id) <= 5 && !(loading_vars['net_id'] == 'ios') ) {			
			var x_mod = -1;
            var m_scale = 0.8;
            var m_y = 40;
            if (parseInt(item_id) == 2) {m_scale = 0.7; x_mod = 1;}
            if (parseInt(item_id) == 3) {m_scale = 0.65; m_y = 15;}
            if (parseInt(item_id) == 4) {m_scale = 0.65; m_y = 40;  x_mod = 1;}
            if (parseInt(item_id) == 5) {m_scale = 0.6; m_y = 20;}
            game_data['utils'].load_anim_monster(parseInt(item_id), function(res) {	
                if (res) {
                    var parent_pt = game_data['graphics_manager'].get_pos('targets_panel')
                    m_scale *= 0.8; 
                    _this.monster_icon = game_data['scene'].add.spine(_this.x+ parent_pt.x, _this.y + parent_pt.y +  m_y, 
                                                            'monster' + String(item_id) + '_anim', 'animation', true);	
                    _this.monster_icon.visible = false;
                    _this.monster_icon.setScale(x_mod * m_scale,m_scale);
                    _this.spine_holder.add(_this.monster_icon);
                    _this.add(_this.monster);
                }
            });
        }
        else {			
            game_data['utils'].load_map_monster(item_id, function(icon) {
                if (_this.scene && icon) {
                    _this.monster_icon = icon;
                    scale = Math.min(size / _this.monster_icon.width, size / _this.monster_icon.height);    
                    _this.monster_icon.scaleX = scale;
                    _this.monster_icon.scaleY = scale;
                    _this.monster_icon.setOrigin(0.5, 0.5);    
                    _this.monster.add(_this.monster_icon);
					_this.add(_this.monster);
                }
            })
        }

		var item_mc = new Phaser.GameObjects.Image(this.scene, -100, -120, "common1", "gem_fireball" + item_id); 
        size = 50;       
        scale = Math.min(size / item_mc.width, size / item_mc.height);    
        item_mc.setScale(scale);                
        this.monster.add(item_mc);

        this.progress_bar = new Phaser.GameObjects.Container(this.scene, -this.total_length / 2, -140); 

        this.progress_bar_bg = new Phaser.GameObjects.Image(this.scene, -5, -10, 'common1', 'monster_pb_back');
        this.progress_bar_line = new Phaser.GameObjects.Image(this.scene, 5, 11, 'common1', 'monster_pb_line');
        this.progress_bar_bg.setOrigin(0,0);
        this.progress_bar_line.setOrigin(0,0);
        var scale = this.total_length / (this.progress_bar_bg.width - 40);
        this.progress_bar_bg.setScale(scale, scale * 1.05);
        this.progress_bar_line.scaleY = scale;
        this.line_scale = this.total_length / this.progress_bar_line.width;
        this.progress_bar_line.scaleX =  this.line_scale;

        
        this.progress_bar.add(this.progress_bar_bg);
        game_data['error_history'].push('gptpi2');
        this.progress_bar.add(this.progress_bar_line);
        this.monster.add(this.progress_bar);
        this.monster.visible = false;
		this.monster.setScale(0.8);
        

        this.monster.setSize(400, 300);
        this.monster.setInteractive();
        this.monster.on('pointerdown', function() {
            game_data['tip_type_down'] = _this.info['phrase_id'];
        });
        this.monster.on('pointerup', function() {
            if (_this.info['phrase_id'] &&  game_data['tip_type_down'] == _this.info['phrase_id']) {
                game_data['tip_type_down'] = '';
                var pt = game_data['utils'].toGlobal(_this, new Phaser.Geom.Point(0, 100));
		        game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_play', 'item_id': 'level_targets', 'phrase_id': _this.info['phrase_id'], 'values': []});
            }
        });
    },
    

    display_panel_item() {
        this.monster_icon.visible = true;
        this.monster.visible = true;        
    },

    update(params) {

    },
    
    show_item(icon_mc) {
        this.monster_icon.visible = true;
        this.monster.visible = true;
        //this.amount_txt.visible = true;        
        

    },
            
    get_type() {
        return this.info['type'];
    },
    
    get_id() {
        return this.info['id'];
    },


    display_amount(_amount) {
        var _this = this;
        this.current_amount = _amount;
        var scale = (this.current_amount) / 3;
        if (_this.scene) this.scene.tweens.add({targets: this.progress_bar_line, scaleX: scale * this.line_scale, duration: 600, onComplete: function(){
        }});
 
    },
    
    get_target_panel_pos() {
        return {
            'icon': {
                'pt': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 20)),
                'w': 50,
                'h': 50
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

	monster_blink() {
		//this.monster.setBlendMode(Phaser.BlendModes.MULTIPLY);
		//this.monster_icon.setTintFill(0xFFFFFF);
		//this.monster_icon.tint = 1000;
		//this.monster_icon.tint = 0xFFFFFF;
		
		//this.monster_icon.skeleton.findSlot('parrot_part20').currentSprite.tint = 0xFFFFFF;
		
		//console.log('Skeleton: ', this.monster_icon.skeleton);
		
		//this.monster_icon.skeleton.findSlot('parrot_part20').data.blendMode = 1;
		
		
		//this.monster_icon.skeleton.color.r = 0.5;
		//this.monster_icon.skeleton.color.g = 0.5;
		//this.monster_icon.skeleton.color.b = 10;
		//this.monster_icon.skeleton.color.a = 1;
        
        
        /*
		this.monster_icon.skeleton.findSlot('parrot_part2').data.r = 0.5;
		this.monster_icon.skeleton.findSlot('parrot_part3').data.r = 0.5;
		this.monster_icon.skeleton.findSlot('parrot_part4').data.r = 0.5;
		this.monster_icon.skeleton.findSlot('parrot_part5').data.r = 0.5;
		this.monster_icon.skeleton.findSlot('parrot_part6').data.r = 0.5;


		this.monster_icon.skeleton.findSlot('parrot_part7').data.g = 0;
		this.monster_icon.skeleton.findSlot('parrot_part8').data.g = 0;
		this.monster_icon.skeleton.findSlot('parrot_part9').data.b = 0;
		this.monster_icon.skeleton.findSlot('parrot_part10').data.b = 0;
		this.monster_icon.skeleton.findSlot('parrot_part11').data.b = 0;
		this.monster_icon.skeleton.findSlot('parrot_part12').data.b = 0;

		this.monster_icon.skeleton.findSlot('parrot_part13').data.r = 0;
		this.monster_icon.skeleton.findSlot('parrot_part14').data.r = 0;
		this.monster_icon.skeleton.findSlot('parrot_part15').data.r = 0;
		this.monster_icon.skeleton.findSlot('parrot_part16').data.r = 0;
		this.monster_icon.skeleton.findSlot('parrot_part17').data.r = 0;
		this.monster_icon.skeleton.findSlot('parrot_part18').data.r = 0;
		
		*/
		
		
		//console.log('skin=',this.monster_icon.skeleton.skin);
		//this.monster_icon.skeleton.skin[0].color.a = 0
		//this.monster_icon.skeleton.setToSetupPose();
	},

    get_items_left() {
        return null;
    },

    is_finished() {
        return this.current_amount == 0;
    },

    get_pts() {
        return {
            'icon': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 20))            
        };
    }

});



