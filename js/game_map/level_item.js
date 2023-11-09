var LevelItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function LevelItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

    init(params) {	
        var i = 0;
        var _this = this;		            
        this.level_id = params['level_id'];
        this.prize = null;
        this.stars = [];
        this.stars_num = 0;
        this.stars_coord = [
            [{'x': 0, 'y': 25}],
            [{'x': -10, 'y': 24}, {'x': 10, 'y': 24}],
            [{'x': -18, 'y': 22}, {'x': 0, 'y': 25}, {'x': 18, 'y': 22}]
        ];
        this.has_assets = false;
	var timeout = 10;

	var passed_amount = game_data['utils'].get_passed_amount();
	var allow_create_assets = this.level_id <= passed_amount + map_data['show_map_levels'] + 1;
	if (this.level_id > passed_amount + map_data['show_map_levels'])  timeout = 5000 + this.level_id * 100;
	if (passed_amount - this.level_id > 30 ) timeout = (passed_amount - this.level_id) * 100;
	if (allow_create_assets) setTimeout(() => {
		   if (!this.has_assets) this.create_assets() 
	}, timeout);    
	this.visible = false;

	},

    check_create() {
		var allow_create_assets = this.level_id <= game_data['utils'].get_passed_amount() + map_data['show_map_levels'] + 1;
		if (allow_create_assets && !this.has_assets)  this.create_assets();
	},

    create_assets() {
        var _this = this;
        this.bg_out = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'level_item_bg_out');
        this.bg_over = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'level_item_bg_over');
        this.add(this.bg_out);
        this.add(this.bg_over);
        this.bg_over.visible = false;

        this.top_passed = new Phaser.GameObjects.Image(this.scene, 0, -12, 'common1', 'level_item_passed');
        this.add(this.top_passed);
        this.top_active = new Phaser.GameObjects.Image(this.scene, 0, -12, 'common1', 'level_item_active');
        this.add(this.top_active);
        this.top_forward = new Phaser.GameObjects.Image(this.scene, 0, -12, 'common1', 'level_item_forward');
        this.add(this.top_forward);
        var rect = new Phaser.Geom.Rectangle(-this.bg_out.width * 0.7 , -this.bg_out.height * 0.8, this.bg_out.width * 1.4, this.bg_out.height * 1.4);

        this.setInteractive({ 
            hitArea: rect,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true  
        });
        this.on('pointerover', () => { 
		_this.item_over();

        });
        this.on('pointerout', () => { 
            _this.item_out();
        });
        this.has_drag = false;




        ////  Level's params

        this.on('pointerup', () => {
            if (_this.has_drag && !game_data['game_tutorial'].active_tutorial) {
                _this.has_drag = false;                                                ///////////////////////////////////
                _this.emitter.emit('EVENT', {'event': 'level_dragend'});               ///////////////  //////////////////
            }                                                                          /////////////      ////////////////
            _this.handler_click();                                                     //////////////    /////////////////
        });                                                                            ///////////////  //////////////////
        this.on('pointerdown', () => {                                                 ///////////////////////////////////
            game_data['level_mouse_down'] = _this.level_id;
        } );


        ////  Level's params






        this.on('drag', function(pointer, dragX, dragY){ 
            if (!game_data['game_tutorial'].active_tutorial) {
                var delta = Math.max (Math.abs(_this.x - dragX), Math.abs(_this.y - dragY))
                if (!_this.has_drag && delta > 20) {
                    _this.has_drag = true;
                    _this.emitter.emit('EVENT', {'event': 'level_dragstart'});
                }
                if (_this.has_drag) _this.emitter.emit('EVENT', {'event': 'level_drag', 'x': _this.x - dragX, 'y': _this.y - dragY});
            }
        });

        var _id = this.level_id + 1
		if (game_data['allow_map_prize'] && (_id > game_data['utils'].get_passed_amount() || game_data['map_debug'])) {
			var _module = _id % game_data['map_prizes']['levels_period'];
			var index = game_data['map_prizes']['levels'].indexOf(_module);
			if (game_data['map_prizes'] && index >= 0) {
			   var suffix = '';
			   if (index == game_data['map_prizes']['super_prize_index']) {
				   this.super_prize = true;
				   suffix = '2';
			   }
               
              this.prize = new Phaser.GameObjects.Image(this.scene, 0, -30, 'common2', 'gift_pimp' + suffix);
              this.prize.scale = 0.8;
			  this.add(this.prize);
              this.show_prize();
			  this.emitter.emit('EVENT', {'event': 'level_to_top', 'level': this});
		   }
		} 
        var temp;
        for (let i = 0; i < 3; i++) {
            temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'star_small');
            this.add(temp);
            this.stars.push(temp);
            temp.visible = false;
        }
       
        this.no_txt = new Phaser.GameObjects.Text(this.scene, 0, -17,  String(this.level_id + 1), { fontFamily: 'font1', fontSize: 21, color: '#f6caa0', stroke: '#000000', strokeThickness: 4});
        this.no_txt.setOrigin(0.5);
        this.add(this.no_txt);        

        this.has_assets = true;
        if (this.need_update_user_data) {
            this.need_update_user_data = false;
            this.update_user_data();
        }
        //console.log('created_level', this.level_id)
    },

item_over() {
		this.bg_out.visible = false;  
		this.bg_over.visible = true;
	},

	item_out() {
		this.bg_out.visible = true;  
		this.bg_over.visible = false; 
	},

	hide_prize(quick = false) {
		if (this.prize && !game_data['map_debug']) {
			var _this = this;
			if (this.prize.tween) this.prize.tween.stop();
			if (this.prize.tween2) this.prize.tween2.stop();
			if (quick) {
				_this.prize.destroy();
				_this.prize = null;
			}
			else this.prize.tween = game_data['scene'].tweens.add({targets: this.prize, scale: 0.01, ease: 'Back.easeIn', duration: 500, onComplete: function () {
				if (_this.prize) {
					_this.prize.destroy();
					_this.prize = null;
				}
			}});
		}
	},

    show_prize() {
		if (this.prize) {
			this.prize.alpha = 0;
			this.prize.scale = 0.2;
			this.prize.tween = game_data['scene'].tweens.add({targets: this.prize, scale: 1, ease: 'Back.easeOut', duration: 600, delay: 2000});
			this.prize.tween2 = game_data['scene'].tweens.add({targets: this.prize, alpha: 1, duration: 100, delay: 2000});
		}
	},

    show_current_stars(obj) {
        if (obj['with_anim']) game_data['error_history'].push('gmi1');
        var i = 0;
        var stars = 0;
        if (game_data['user_data']['levels_passed'][this.level_id]) stars = game_data['user_data']['levels_passed'][this.level_id];
        this.stars_num = stars;
        if (this.has_assets) for (i = 0; i < this.stars.length; i++) {
            this.stars[i].visible = false;
            if (i < stars) {
                this.stars[i].x = this.stars_coord[stars-1][i]['x'];
                this. stars[i].y = this.stars_coord[stars-1][i]['y'];
                if (obj['with_anim']) this.show_star_anim(this.stars[i], 1000 + i * 400)
                else this.stars[i].visible = true;
            }
        }
    },

    show_star_anim(mc, delay) {
        var _this = this;
        if (this.has_assets) setTimeout(() => {
            mc.scaleX = 0.1;
            mc.scaleY = 0.1;
            mc.alpha = 0;
            mc.angle = 0;
            mc.visible = true;
            if (_this.scene) _this.scene.tweens.add({targets: mc, alpha: 1, duration: 150, onComplete: function(){}});
            if (_this.scene) _this.scene.tweens.add({targets: mc, scaleX: 1.1, scaleY: 1.1, angle: 290, duration: 400, onComplete: function(){
                if (_this.scene) _this.scene.tweens.add({targets: mc, scaleX: 1, scaleY: 1, angle: mc.angle + 70, duration: 150, onComplete: function(){
                    mc.angle = 0;
                }});
            }});
        }, delay);
        
    },
    
    update_user_data() {  
        if (this.has_assets) {      
            this.update_item(false, true);
        }
        else this.need_update_user_data = true;
    },

    update_item(with_anim = true, upd_user_data = false) {
		var passed_amount = game_data['utils'].get_passed_amount()
        if (this.has_assets) {
            var _this = this;
            this.show_current_stars({'with_anim': with_anim});
            this.top_passed.visible = (this.level_id < passed_amount);
			this.top_active.visible = (this.level_id == passed_amount);
			this.top_forward.visible = (this.level_id > passed_amount);    
        }
		var max_forward = (Math.floor(passed_amount / map_data['show_map_levels']) + 1) * map_data['show_map_levels'];

		this.visible = this.level_id < max_forward;
    },


    handler_click() {
		if (game_data['level_mouse_down'] == this.level_id) {
			if (game_data['utils'].get_passed_amount() >= this.level_id)
				this.emitter.emit('EVENT', {'event': 'start_level', 'level_id': this.level_id});
			else {
	            var pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,0));
	            game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_map', 'item_id': 'hint_pimp', 'phrase_id': '1', 'values': []});
            }
        }
    },

    check_locked() {		
		if (this.level_id < game_data['utils'].get_passed_amount() && game_data['user_data']['levels_passed'][this.level_id] == 3)
			return {'success': false, 'error': 'all_stars', 'pt': game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,0))};
		else return {'success': true};
	},

    appear(delay, on_complete) {
        var _this = this;
        if (this.has_assets) setTimeout(() => {
            if (_this.scene) {
                _this.scaleX = 0.8;
                _this.scaleY = 0.8;
                _this.alpha = 0;
                _this.visible = true;
                _this.update_item(false);
                game_data['scene'].tweens.add({targets: _this, alpha: 1, duration: 150, onComplete: function(){}});
                game_data['scene'].tweens.add({targets: _this, scaleX: 1.1, scaleY: 1.1, duration: 250, onComplete: function(){
                    if (_this.scene) _this.scene.tweens.add({targets: _this, scaleX: 1, scaleY: 1, duration: 150, onComplete: function(){
                        on_complete();
                    }});
                }});
            }
        }, delay);
    },

    get_pt() {
        return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 0));
    },

    get_tutorial_holes() {
        var panel = this.top_passed;
        var pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0,panel.y - panel.height * 0.7));
        return [{'pt': pt, 'w': panel.displayWidth * 1.2, 'h': panel.displayHeight * 3, 'arrow': true, 'arrow_orientation': 'up' }]
	},

	get_star_chest_pt() {
		return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 40));
	}

});