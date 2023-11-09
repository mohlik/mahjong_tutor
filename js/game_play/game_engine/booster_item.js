var BoosterItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function BoosterItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {
    var _this = this;
    this.attr = {
        'state': false
    };
    this.booster_id = params['booster_id'];
    this.moving_holder = params['moving_holder'];
    this.level_id = 0;
    this.init_pt = new Phaser.Geom.Point(0, 0);

    this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster_bg_active");
    this.add(this.bg);  
    this.bg2 = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster_bg_active2");
    this.add(this.bg2);  
    this.bg2.visible = false;
    this.bg_inactive = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "booster_bg_inactive");
    this.add(this.bg_inactive);  
    this.engine = game_data['game_engine'];

    this.is_free = false;

    console.log(this.booster_id);                    /////////////////////////////

    const texture = () => { 
        switch(this.booster_id) {
            case 'booster1':
                return 'BOMB'
            case 'booster2':
                return 'FIREWORK'
            case 'booster4':
                return 'LIGHT'
            case 'booster6':
                return 'SHUFFLE'
        }
    }

    this.booster_icon = new Phaser.GameObjects.Image(this.scene, 0, 0, texture()).setScale(2);
    this.booster_icon_inactive = new Phaser.GameObjects.Image(this.scene, 0, 0, 'block').setScale(2);
    this.moving_icon = new Phaser.GameObjects.Image(this.scene, 0, 0, texture()).setScale(2);
    if (this.booster_id == 'booster5') {
        this.booster_icon.scaleX = -1;
        this.booster_icon_inactive.scaleX = -1;
    }
    this.add(this.booster_icon);  
    this.add(this.booster_icon_inactive);  
    this.booster_icon.x =  this.init_pt.x;
    this.booster_icon.y =  this.init_pt.y;
    this.booster_icon_inactive.x =  this.init_pt.x;
    this.booster_icon_inactive.y =  this.init_pt.y;


    if (this.booster_id == 'booster1' || this.booster_id == 'booster2' || this.booster_id == 'booster4' || this.booster_id == 'booster6') {        
       // this.booster_icon.setSize(this.booster_icon.width, this.booster_icon.height);
        var w = this.booster_icon.width;
        var h = this.booster_icon.height;
        var rect = new Phaser.Geom.Rectangle(0 , 0, w, h * 1.2);
        this.booster_icon.setInteractive({
            hitArea: rect,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: true  });
        // this.booster_icon.on('drag', this.handler_drag, this);
        // this.booster_icon.on('dragend', this.handler_dragend, this);
        // this.booster_icon.on('dragstart', this.handler_dragstart, this);
        // this.pointerdown = false;
        // this.booster_icon.on('pointermove', this.handler_pointermove, this);
        // this.booster_icon.on('pointerout', this.handler_pointerout, this);
        this.booster_icon.on('pointerdown', this.handler_pointerdown, this);
       
    }
    else {
        this.booster_icon.setInteractive();
        this.booster_icon.on('pointerdown',function() {
           game_data['pressed_booster'] = _this.booster_id;
        }, this);
        this.booster_icon.on('pointerup', this.handler_click, this);
    }

    this.bg_inactive.setInteractive();
    this.bg_inactive.on('pointerdown', function() {
        game_data['pressed_booster'] = _this.booster_id;
    }, this);
    this.bg_inactive.on('pointerup', function() {        
        var pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.init_pt.x, this.init_pt.y));
        if (game_data['pressed_booster'] == _this.booster_id)
            game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'booster_later', 'values': []});                               
    }, this);

    this.booster_active = false;
    this.amount = game_data['user_data']['boosters'][this.booster_id];
    this.amount_txt = new Phaser.GameObjects.Text(this.scene, 45, 40, '', {fontFamily:"font1", fontSize: 30, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
    this.amount_txt.setOrigin(1, 0.5);
    this.add(this.amount_txt);
    
    this.price = game_data['boosters'][this.booster_id]['price'];
    this.price_txt = new Phaser.GameObjects.Text(this.scene, 23, 40, String(this.price), {fontFamily:"font1", fontSize: 30, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
    this.price_txt.setOrigin(1, 0.5);
    this.money_icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'coin');
    this.money_icon.setScale(0.4,0.4);
    this.add(this.price_txt);
    this.add(this.money_icon);
    //this.price_txt.x -= this.money_icon.displayWidth / 2;
    this.money_icon.x = this.price_txt.x  + this.money_icon.displayWidth / 2;  
    this.money_icon.y = this.price_txt.y;

    if (loading_vars['orientation'] == 'landscape') this.setScale(0.8);
    this.update_booster(this.level_id);
},

get_hole() {
    let pt = game_data['utils'].toGlobal(this.parentContainer, new Phaser.Geom.Point(this.x, this.y));
    
    return {
        pt,
        width: this.bg.width * 0.7,
        height: this.bg.height * 0.7
    };
},

remove_particles() {
    if (this.state_particle)
    this.state_particle.destroy();
},

update_booster(level_id) {
    console.log('LEVEL ID: ' + level_id);
    this.level_id = level_id;
    var active = this.is_active();
    this.amount = game_data['user_data']['boosters'][this.booster_id];
    this.amount_txt.text = this.amount;
    this.price_txt.visible = active && this.amount <= 0;
    this.money_icon.visible = active && this.amount <= 0;
    this.amount_txt.visible = active && this.amount > 0;
    
    this.bg.visible = active;
    this.bg_inactive.visible = !active;
    this.booster_icon.visible = active;
    this.booster_icon_inactive.visible = !active;

},
/*
booster_used() {
    if (this.amount > 0) game_data['user_data']['boosters'][this.booster_id] -= 1;
    else {
        game_data['user_data']['money'] -= this.price;
        this.emitter.emit('EVENT', {'event': 'update_money'});
    }
    this.update_booster();
},
*/
handler_pointerdown(pointer) {
    // if (this.allow_booster_use()) {
    //     // this.pointerdown = true;
    //     this.emitter.emit('EVENT', {'event': 'SWITCH_POINTER_MOVE', 'value': true});
        
    //     this.show_particle_circle();


    //     var pt = game_data['utils'].toLocal(this.moving_holder,  {'x': pointer['worldX'], 'y': pointer['worldY']});
    //     this.dx = pointer['worldX'] - pt.x;
    //     this.dy = pointer['worldY'] - pt.y;    

    //     this.moving_icon.visible = true;

    //     this.moving_icon.x = pt.x;
    //     this.moving_icon.y = pt.y;
    //     this.create_move_booster_particle(pt);
    //     this.moving_holder.add(this.moving_icon);    

    //     this.booster_icon.visible = false;
    //     this.booster_active = true;
    //     this.emitter.emit('EVENT', {'event': 'TRANSFER_BOOSTER_INFORMATION', 'icon': this.moving_icon, 'dx': this.dx, 'dy': this.dy, 'prtcl': this.prtcl, 'move_emitter': this.move_emitter});
    //     this.emitter.emit('EVENT', {
    //         'event': 'BOOSTER_DRAG_START',        
    //         'booster_id': this.booster_id
    //     });
    //     game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'booster_took'});
        
    // }
    // else  if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') 
    //     this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'coins_pt': game_data['game_play'].get_money_pt(), 'with_alert': true});
    // else game_data['utils'].show_tip({'pt': game_data['game_play'].get_money_pt(), 'scene_id': 'game_play', 'item_id': 'hint_booster', 'phrase_id': 'no_money', 'values': []}); 
    console.log(game_data['paid_bonus_anim'])
    if (!game_data['paid_bonus_anim'] && true) { // !game_data['field_tutorial_manager'].is_gems_tutorial
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'select_card'});
        if (!game_data['game_play'].attr.field_state) {
            if (this.allow_booster_use()) {
                let {state, booster_id} = game_data.game_play['attr'];
                if (booster_id === this.booster_id || booster_id === null) {
                    if (game)
                    this.switchState();
                    if (this.attr.state) {
                        let pt = game_data['utils'].toGlobal(this.parentContainer, new Phaser.Geom.Point(this.x, this.y));
                        var rect = new Phaser.Geom.Rectangle(pt.x - this.bg.width * 0.7/2, pt.y - this.bg.height * 0.7/2, this.bg.width *0.7, this.bg.height * 0.7);

                        if(!this.engine.boosters_panel.booster_start.fireworks_box && this.engine.boosters_panel.booster_start.states[this.booster_id]) {  // firework_state
                            this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_' + this.booster_icon.texture.key + '_BOOSTER'});
                            this.state_particle = this.scene.add.particles('common1');
                            this.state_particle.createEmitter({
                                frame: 'l10000',
                                speed: 25,
                                // lifespan: 1000,
                                quantity: 30,
                                scale: { start: 0.4, end: 0.1 },
                                emitZone: { type: 'edge', source: rect, quantity: 30 }
                            });
                            
                        }
                
                    } else if (this.booster_icon.texture.key === 'BOMB' && this.engine.boosters_state.bomb) {
                        this.engine.emitter.emit('ACTION', {event: 'BOOSTER_STOP'});
                        this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'STOP_BOMB_BOOSTER'});
                        this.remove_particles();
                        this.engine.boosters_state.bomb = false;
                        this.scene.input.manager.canvas.style.cursor = '';
                    }
    
                    this.emitter.emit('EVENT', {'event': 'SET_BOOSTER_STATE', 'booster_id': this.booster_id, 'state': this.attr.state});
                    this.emitter.emit('EVENT', {'event': 'BOOSTER_TAP', 'booster_id': this.booster_id, 'state': this.attr.state});
                }
            }
            else if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') 
                this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'coins_pt': game_data['game_play'].get_money_pt(), 'with_alert': true});
            else {
                let pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.init_pt.x, this.init_pt.y));
                
                game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'no_money', 'phrase_id': '1', 'values': []});
            }
        }
    }
},

switchState() {
    this.attr['state'] = !this.attr['state'];
},

handler_pointerout(pointer) {
    // debugger
    // console.log(1)
    this.emitter.emit('EVENT', {'event': 'SWITCH_POINTER_MOVE', 'value': false});
    this.emitter.emit('EVENT', {'event': 'TRANSFER_BOOSTER_INFORMATION', 'icon': null, 'dx': null, 'dy': null, 'prtcl': null, 'move_emitter': null});
    this.emitter.emit('EVENT', {
        'event': 'BOOSTER_DRAG_END', 
        'pt': new Phaser.Geom.Point(pointer['worldX'], pointer['worldY']),
        'booster_id': this.booster_id
    });
    // this.pointerdown = false;
},

handler_pointermove(pointer) {
    // if (this.pointerdown) {
        
        var pt = {'x': pointer['worldX'] - this.dx, 'y': pointer['worldY'] - this.dy};
    this.moving_icon.x = pt.x;
    this.moving_icon.y = pt.y;
    if (this.prtcl && this.move_emitter) {
        this.move_emitter.setPosition(pt.x, pt.y);
    }
    // }
},

handler_dragstart(pointer) {
    if (this.allow_booster_use()) {
        this.show_particle_circle();

        console.log('dragstart');


        var pt = game_data['utils'].toLocal(this.moving_holder,  {'x': pointer['worldX'], 'y': pointer['worldY']});
        this.dx = pointer['worldX'] - pt.x;
        this.dy = pointer['worldY'] - pt.y;    

        this.moving_icon.visible = true;
        this.moving_icon.x = pt.x;
        this.moving_icon.y = pt.y;
        this.create_move_booster_particle(pt);

        if(this.amount > 0) {
            this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_' + this.booster_icon.texture.key + '_BOOSTER'});
        }

        if(this.booster_icon.texture.key === 'BOMB' && this.engine.boosters_state.bomb) {
            this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'STOP_' + this.booster_icon.texture.key + '_BOOSTER'});
        }

        this.moving_holder.add(this.moving_icon);    

        this.booster_icon.visible = false;
        this.booster_active = true;

        this.emitter.emit('EVENT', {
            'event': 'BOOSTER_DRAG_START',        
            'booster_id': this.booster_id
        });
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'booster_took'});
        
    }
    else  if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') 
        this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'coins_pt': game_data['game_play'].get_money_pt(), 'with_alert': true});
    else game_data['utils'].show_tip({'pt': game_data['game_play'].get_money_pt(), 'scene_id': 'game_play', 'item_id': 'hint_booster', 'phrase_id': 'no_money', 'values': []}); 
},


handler_dragend(pointer) {
    
    this.emitter.emit('EVENT', {
        'event': 'BOOSTER_DRAG_END', 
        'pt': new Phaser.Geom.Point(pointer['worldX'], pointer['worldY']),
        'booster_id': this.booster_id
    });
 
},


handler_drag(pointer) {
    var pt = {'x': pointer['worldX'] - this.dx, 'y': pointer['worldY'] - this.dy};
    this.moving_icon.x = pt.x;
    this.moving_icon.y = pt.y;
    if (this.prtcl && this.move_emitter) {
        this.move_emitter.setPosition(pt.x, pt.y);
    }
},

create_move_booster_particle(pt) {
	this.prtcl = game_data['scene'].add.particles('common1', 'l10000');
	var timeout = 800;
	var _quantity = 1;
	this.moving_holder.add(this.prtcl);
	this.move_emitter = this.prtcl.createEmitter({
			x: pt.x,
			y: pt.y,
			angle: { min: 0, max: 360 },
			speed: 80,
			lifespan: timeout,
			quantity: _quantity,
			scale: { start: 1.5, end: 0.5 },
			alpha: { start: 1, end: 0.4 },
			blendMode: 'NORMAL'
	});
},

handler_click() { 
    if (game_data['pressed_booster'] == this.booster_id)  {
        console.log('click');
        this.bg2.visible = true;   
        setTimeout(() => {
            this.bg2.visible = false;   
        }, 200);
        if (this.allow_booster_use()) {
            this.emitter.emit('EVENT', {'event': 'BOOSTER_CLICK', 'booster_id': this.booster_id});
            this.show_particle_circle();
        }
        else  if (game_data['last_game_mode'] == 'full' || game_data['last_game_mode'] == 'purchases_only') 
        this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money', 'coins_pt': game_data['game_play'].get_money_pt(), 'with_alert': true});
        else game_data['utils'].show_tip({'pt': game_data['game_play'].get_money_pt(), 'scene_id': 'game_play', 'item_id': 'hint_booster', 'phrase_id': 'no_money', 'values': []}); 	
    }

},

allow_booster_use() {
    var is_free = this.is_free
    var price = game_data['boosters'][this.booster_id]['price'];
    return (this.is_active() && game_data['user_data']['boosters'][this.booster_id] > 0 || game_data['user_data']['money'] >= price || is_free);
},

is_active(bool) {
    if (this.is_free) return true;
    return (this.level_id >= game_data['boosters'][this.booster_id]['level_id'])
},


apply_booster(params) {
    
    // if (this.booster_active) {
        this.animate_icon(params);
        this.booster_active = false;
    // }
},

return_booster(params) {
    var _this = this;
    if (this.booster_active) {
        var pt = game_data['utils'].toLocal(this.moving_holder,  game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.booster_icon.x, this.booster_icon.y)));

        this.scene.tweens.add({targets: this.moving_icon, x: pt.x, y: pt.y, duration: 250, onComplete: function () { 
            game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'booster_took'});
            _this.booster_icon.visible = true;
            _this.moving_icon.visible = false;           
            _this.emitter.emit('EVENT', {'event': 'SHOW_BOOSTER_PARTICLES', 'pt': game_data['utils'].toGlobal(_this, _this.init_pt)});
            if (_this.prtcl) _this.prtcl.destroy();
        }});
        
        this.booster_active = false;
    }
},


animate_icon({pt, items, pos_x, pos_y, create_grass}) {
    if (this.prtcl) this.prtcl.destroy();
    if (this.booster_id == 'booster1')
        this.animate_booster1(pt, items, {pos_x, pos_y, create_grass});
    else if (this.booster_id == 'booster2')
        this.animate_booster2(pt, items, {pos_x, pos_y});
    else if (this.booster_id == 'booster4')
        this.animate_booster4(pt, items, {pos_x, pos_y, create_grass});
    else if (this.booster_id == 'booster6')
        this.animate_booster6(pt, items, {pos_x, pos_y, create_grass});
},

animate_booster1(pt, items, {pos_x = 1, pos_y = 1, create_grass}) {    
    var _this = this;
    if (loading_vars['assets_suffix'] === 'babylon_tales')
        this.moving_icon.scaleY = -1

    let add_x = 0
    let add_y = 0
    if (loading_vars['assets_suffix'] === 'neverland') add_y = -40
    game_data['paid_bonus_anim'] = true
        
    var pt = game_data['utils'].toLocal(this.moving_holder, new Phaser.Geom.Point(pt.x - 35 + add_x, pt.y + 40 + add_y));
    this.moving_holder.add(this.moving_icon);
    this.moving_icon.visible = true;
    this.moving_icon.x = pt.x;
    this.moving_icon.y = pt.y;
    if (_this.scene) this.scene.tweens.add({targets: this.moving_icon, angle: - 75, x: pt.x - 20, y: pt.y - 10, duration: 250, onComplete: function () { 
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus1'});
        if (_this.scene) _this.scene.tweens.add({targets: _this.moving_icon, angle: 0, x: pt.x, y: pt.y, duration: 150, onComplete: function () {             
            _this.moving_icon.visible = false;
            _this.moving_icon.setOrigin(0.5, 0.5);
            _this.booster_icon.visible = true;
            //
            // let pt2 = 
            // let prtcl = game_data['utils'].add_particle({
            //     parentCont: _this.moving_holder,
            //     x: pt.x + 30,
            //     y: pt.y - 30,
            //     config: {
                    
            //         angle: { min: 0, max: 360 },
            //         speed: 300,
            //         gravityY: 0,
            //         gravityX: 0,
            //         lifespan: 250,
            //         quantity: 50,
            //         maxParticles: 60,
            //         scale: { start: 0.8, end: 0.2 },
            //         blendMode:  'NORMAL',
            //     },
            //     frame: ['particle14', 'particle10', ],
            // });
            // setTimeout(() => {
            //     prtcl.destroy()
            // }, 300)
            game_data['paid_bonus_anim'] = false
            _this.emitter.emit('EVENT', {'event': 'BOOSTER_CLICK', 'booster_id': _this.booster_id, 'pt': pt, create_grass, 'items': items});
        }});                
    }});
},


animate_booster2(pt, items, {pos_x = 1, pos_y = 1}) {
    
    var _this = this; 
    this.moving_icon.setOrigin(0.7, 0.26);   
    //var pt = new Phaser.Geom.Point(this.moving_icon.x, this.moving_icon.y - 15);
    pt = game_data['utils'].toLocal(this.moving_holder, new Phaser.Geom.Point(pt.x, pt.y - 45));
    this.moving_holder.add(this.moving_icon);
    this.moving_icon.x = pt.x;
    this.moving_icon.y = pt.y;
    this.moving_icon.visible = true;
    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus2'});
    game_data['paid_bonus_anim'] = true
    // let partcl = game_data['utils'].add_particle({
    //     parentCont: _this.moving_holder,
    //     x: pt.x,
    //     y: pt.y + 45,
    //     config: {
            
    //         angle: { min: 0, max: 360 },
    //         // speed: { min: 20, max: 100 },
    //         speed: 30,
    //         // gravityY: 100,
    //         // gravityX: 0,
    //         lifespan: 2000,
    //         quantity: 50,
    //         maxParticles: 60,
    //         scale: { start: 0.2, end: 0.5 },
    //         alpha: { start: 0.8, end: 0 },
    //         blendMode:  'NORMAL',
    //     },
    //     dust: true
    // });
    _this.moving_holder.bringToTop( _this.moving_icon);
    if (_this.scene) this.scene.tweens.add({targets: this.moving_icon, angle: -75, x: pt.x + 25, y: pt.y - 10, duration: 200, onComplete: function () { 
        if (_this.scene) _this.scene.tweens.add({targets: _this.moving_icon, angle: 0, x: pt.x + 14, y: pt.y - 25, duration: 200, onComplete: function () { 
            if (_this.scene) _this.scene.tweens.add({targets: _this.moving_icon, angle: -60, x: pt.x + 33, y: pt.y - 9, duration: 200, onComplete: function () { 
                if (_this.scene) _this.scene.tweens.add({targets: _this.moving_icon, angle: 0, x: pt.x, y: pt.y, duration: 200, onComplete: function () {
                    _this.moving_icon.visible = false;                    
                    _this.moving_icon.setOrigin(0.5, 0.5);
                    _this.moving_icon.angle = 0;
                    
                   
                    _this.booster_icon.visible = true;
                    game_data['paid_bonus_anim'] = false
                    _this.emitter.emit('EVENT', {'event': 'BOOSTER_CLICK', 'booster_id': _this.booster_id, 'pt': pt, 'items': items});
                    // partcl.destroy()
                }});                
            }});                
        }});                
    }});
},



animate_booster4(pt, items, {pos_x = 1, pos_y = 1, create_grass}) {
    var pt = game_data['utils'].toGlobal(this.moving_holder, new Phaser.Geom.Point( this.booster_icon.x,  this.booster_icon.y));
    this.booster_icon.visible = true;
    this.moving_icon.visible = false;
    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus4'});
    this.emitter.emit('EVENT', {'event': 'BOOSTER_CLICK', 'booster_id': this.booster_id, 'pt': pt, create_grass, 'items': items, pos_x, pos_y});
},

animate_booster6(pt, items, {pos_x = 1, pos_y = 1, create_grass}) {
    var pt = game_data['utils'].toGlobal(this.moving_holder, new Phaser.Geom.Point( this.booster_icon.x,  this.booster_icon.y));
    this.booster_icon.visible = true;
    this.moving_icon.visible = false;
    game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'paid_bonus4'});
    this.emitter.emit('EVENT', {'event': 'BOOSTER_CLICK', 'booster_id': this.booster_id, 'pt': pt, create_grass, 'items': items, pos_x, pos_y});
},

show_particle_circle() {
    this.emitter.emit('EVENT', {'event': 'SHOW_BOOSTER_PARTICLES', 'pt': game_data['utils'].toGlobal(this, this.init_pt)});

},

disable() {
    // this.booster_icon.disableInteractive();
    this.booster_icon_inactive

    this.amount = game_data['user_data']['boosters'][this.booster_id];
    this.amount_txt.text = this.amount;
    this.price_txt.visible = false && this.amount <= 0;
    this.money_icon.visible = false && this.amount <= 0;
    this.amount_txt.visible = false && this.amount > 0;

    this.bg.visible = false;
    this.bg_inactive.visible = true;
    this.booster_icon.visible = false;
    this.booster_icon_inactive.visible = true;
},

enable() {
    // this.booster_icon.setInteractive();

    this.amount = game_data['user_data']['boosters'][this.booster_id];
    this.amount_txt.text = this.amount;
    this.price_txt.visible = true && this.amount <= 0;
    this.money_icon.visible = true && this.amount <= 0;
    this.amount_txt.visible = true && this.amount > 0;

    this.bg.visible = true;
    this.bg_inactive.visible = false;
    this.booster_icon.visible = true;
    this.booster_icon_inactive.visible = false;
}

});



