var MovesPanel = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function MovesPanel (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

    init(params) {
        
        this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "game_map", "panel_moves_bg");   
        this.bg.setScale(0.75,0.75);
        
        var _this = this
        this.bg.setInteractive();
        this.bg.on('pointerdown', function() {
            game_data['tip_type_down'] = 'moves';
        });
        this.bg.on('pointerup', function() {
            if ( game_data['tip_type_down'] == 'moves') {
                game_data['tip_type_down'] = '';
                var pt = game_data['utils'].toGlobal(_this, new Phaser.Geom.Point(35, 30));
                game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'moves', 'values': []});
            }
        });
        
        this.add(this.bg);      
        this.bg = new Phaser.GameObjects.Image(this.scene, -35, 0, "game_map", "icon_moves");   
        this.bg.setScale(0.7,0.7);
        this.add(this.bg);      

        
        this.amount_txt = new Phaser.GameObjects.Text(this.scene, 40, 0,  '', { fontFamily: 'font1', fontSize: 50, color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
        this.amount_txt.setOrigin(0.5, 0.5);
        this.add(this.amount_txt);

        this.is_relax = false;
        this.relax_icon =  new Phaser.GameObjects.Image(this.scene, 40, 0, "game_map", "infiniti");   
        this.add(this.relax_icon);
        

        this.is_failed = false;
        if (loading_vars['orientation'] == 'landscape') this.alpha = 0;
        
    },

    update_difficulty_mode(relax) {
        this.is_relax = relax;
        this.relax_icon.visible = this.is_relax;
        this.amount_txt.visible = !this.is_relax;
        if (this.moves <= 0) {
            this.moves = 1;
            this.display_moves();
        } 
    },

    update_level(level_id) {
        game_data['error_history'].push('gpmp1');
        this.moves = 1000;
        if (loading_vars['orientation'] == 'landscape') this.alpha = 0;
        if (level_id == 0) this.alpha = 1;
        this.update_moves(0);
        this.is_failed = false;        
    },

    add_extra_moves(amount) {
        this.update_moves(amount);
    },
    
    update_moves(delta_moves) {
        var _this = this;
        var A_FEW_MOVES = 5;
        this.moves += delta_moves;

        if (this.check_no_moves()) this.emitter.emit('EVENT', {'event': 'NO_MOVES'});                
        if (this.moves <= A_FEW_MOVES && !this.is_relax) {
            this.scene.tweens.add({targets: this.amount_txt, scaleX: 1.5, scaleY: 1.5, duration: 200, onComplete: function () { 
                _this.scene.tweens.add({targets: _this.amount_txt, scaleX: 1, scaleY: 1, duration: 200});                 
            }});
            if (delta_moves < 0) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'few_moves'});
        }
        this.display_moves();        		
    },		
    

    is_level_failed() {
        return this.is_failed;
    },

    check_no_moves() {	
        return this.moves <= 0 && !this.is_relax;				
    },
    
    display_moves() {
        this.amount_txt.text = String(this.moves)
    },


    destroy_level() {
        if (loading_vars['orientation'] == 'landscape') this.alpha = 0;
    },

    show_panel(with_anim = false) {
        if (with_anim) {
            game_data['scene'].tweens.add({targets: this, alpha: 1, duration: 200});
        }
        else {
            this.alpha = 1;
        }
    },

});



