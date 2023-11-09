var Gem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function Gem ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
        this.shake_arr = [4, 3, 2, 1, 0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3];
		this.init_speed = 7;
        this.x_speed = 6;
        this.reset()
    },

    init(params) {     
        this.broke_piece = []                       
        this.content_holder = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
        this.add(this.content_holder);
        this.reset();
		this.timer_update_position = this.scene.time.addEvent({delay: 10, callback: this.handler_update_position, callbackScope: this, loop: true});
		this.timer_update_position.paused = true;
        this.particles = [];
        this.squeze_anims = []
        this.setData('broken', false)
    },			

    update_gem(params) {
        let _this = this;
        this.init_speed = 7;
        this.x_speed = 6;
        this.attr['type'] = params['type'];
        this.attr['id'] = params['id'];
        this.attr['speed'] = this.init_speed;	
        this.set_wave_state(false);	
        let key;
        
        if (this.attr['type'] == 'normal' || this.attr['type'] == 'bonus' || this.attr['type'] == 'bottom' || this.attr['type'] == 'fireball')
            key = "gem_" + this.attr['type'] + this.attr['id'];
        else if (this.attr['type'] == 'hog') {
                key = "gem_booster" + this.attr['id'];
                this.attr['strength'] = params['strength']   
        }
        else if (this.attr['type'] == 'passive') {
            key = "gem_" + this.attr['type'];
            this.attr['target_id'] = +params['target_id']
        }
        else if (this.attr['type'] == 'embedded') {
            this.attr['target_id'] = +params['id']
            key = "gem_" + this.attr['type'] + this.attr['id'] + '_2';
            this.attr['strength'] = params['strength']
        }
        else if (this.attr['type'] == 'bat') {
            key = "gem_bat" + this.attr['id'];
            this.attr['strength'] = 3 * size
            let size = this.attr['id']
            this.attr['static'] = true;
        }
        else if (this.attr['type'] === 'extra_moves') {  
            key = 'gem_extra_moves'
        }
        else if (this.attr['type'] == 'rucksack') {
            key = 'gem_bag';
            this.attr['static'] = true;
            this.attr['strength'] = params['strength'];
            
        }
        else if (this.attr['type'] == 'chest') {
            key = 'gem_chest1';
            this.attr['static'] = true;
            this.attr['strength'] = 2
        }
        else if (this.attr['type'] === 'switch') {     
            key = 'gem_book1_1'
            this.attr['opened_frame'] = 'gem_book1_2'
            this.attr['closed_frame'] = 'gem_book1_1'
            this.attr['closed'] = true
            this.attr['opened'] = false
        }
        else if (this.attr['type'] == 'mark') {
            if ('force_mark' in params) {
                game_data['forced_mark'] = !game_data['forced_mark'];
                this.attr['is_marked'] = game_data['forced_mark'];										
            }
            else  {
                var mark_frequency = (this.attr['id'] in game_data['marked_gems_frequency']) ? game_data['marked_gems_frequency'][this.attr['id']] : 2;
                var rnd = Math.random() * mark_frequency;
                this.attr['is_marked'] = rnd < 1;	
                                
            }
            
            key =  "gem_mark" + this.attr['id'] + "_" + (this.attr['is_marked'] ? 1: 2);        
        }
        else if (this.attr['type'] == 'big_bottom') {
            key = 'gem_' + 'big_bottom' + this.attr['id'];
            this.attr['major_big_bottom'] = true;
            this.attr['big'] = true;
        }
        this.attr['key'] = key;
        let type =  this.attr['type']
        
        if (!this.gem_content) {
            this.gem_content = new Phaser.GameObjects.Container(this.scene, 0, 0);
            
            this.content_holder.add(this.gem_content);
            
            
            this.gem_back = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", key);
            
            if (this.attr['type'] == 'big_bottom') {
                this.gem_back.setOrigin(0.2, 0.7);
            }
            else this.gem_back.setOrigin(0.5, 0.5);
            
            this.gem_content.add(this.gem_back);

            if (type !== 'random' && type !== 'bonus' && type !== 'rucksack' && type !== 'hog' && type !== 'switch' && type !== 'fireball' && type !== 'bottom' &&  type !== 'big_bottom') {
                this.create_parts(key)
            }

            this.setSize(game_data['dim']['item_width'], game_data['dim']['item_height']);
            this.setInteractive();
            this.on('pointerdown', this.handler_item_down, this);        
            this.on('pointerover', this.handler_item_over, this);
            this.on('pointerout', this.handler_item_out, this);
        } 
        else {
            this.gem_back.setOrigin(0.5, 0.5);
            this.gem_back.setTexture("common1", key);
            this.content_holder.bringToTop(this.gem_content);
            if (type !== 'random' && type !== 'bonus' && type !== 'rucksack' && type !== 'hog' && type !== 'switch' && type !== 'fireball' && type !== 'bottom' &&  type !== 'big_bottom')
            game_data['utils'].delayed_call(1000, () => {
                this.update_parts(key)
            })  
        }
        this.angle = 0
        if (this.attr['type'] == 'bonus') {
            let angle = 5;
            this.bonus_anim = this.scene.tweens.add({
                targets: this.gem_content,
                repeat: -1,
                yoyo: true,
                scale: {from:1, to: 1.1},
                // duration: 600,
                angle: angle,
                onUpdate: () => {

                },
                onCompete: () => {

                }
            });
            
            
        }

        if (this.attr['type'] == 'money') {
            if (!('init' in params)) {                
                this.attr['money_timestamp'] = game_data['utils'].get_time();                
                if (this.scene) game_data['utils'].delayed_call(game_data['level_coins']['timeout'] + 10, function(){
                    if (_this)
                        _this.update_candidate();
                }, [], this);
            }
        }

        if (this.attr['type'] == 'bottom' || this.attr['type'] == 'fireball') {
            this.bottom_anims = [];
            // this.gem_bottom_glow = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", 'gem_bottom_glow');
            // this.content_holder.add(this.gem_bottom_glow);  
            this.content_holder.bringToTop(this.gem_content);
            // let tween1 = game_data['utils'].add_tween({
            //     targets: [this.gem_bottom_glow],
            //     angle: 360,
            //     duration: 6000,
            //     repeat: -1,
            //     onComplete: () => {
                    
                    
            //     },
            //     onRepeat: () => {
            //     }
            // });
            // let tween2 = game_data['utils'].add_tween({
            //     targets: [this.gem_bottom_glow],
            //     scale: 1.3,
            //     duration: 700,
            //     repeat: -1,
            //     yoyo: true,
            //     onComplete: () => {
                    
                    
            //     },
            //     onRepeat: () => {

            //     }
            // });
            let tween3 = game_data['utils'].add_tween({
                targets: [this.gem_content],
                scale: {from: 1, to: 1.15},
                duration: 700,
                repeat: -1,
                yoyo: true,
                onComplete: () => {
                    
                    
                },
                onRepeat: () => {

                }
            });
            // this.bottom_anims.push(tween1);
            // this.bottom_anims.push(tween2);
            this.bottom_anims.push(tween3);
        }

        if (!('is_nested' in params && params['is_nested'])) {
                this.gem_content.scaleX = 0.1;
                this.gem_content.scaleY = 0.1;
        }
        
        this.set_invulnerable(false);

    },
    
    get_tint(id) {
        let tint = 0x4896b7
        if (loading_vars['assets_suffix'] === 'babylon_tales') {
            if (id == 1) tint = 0x4896b7
            else if (id == 2) tint = 0xb95ff2
            else if (id == 3) tint = 0x962a2d
            else if (id == 4) tint = 0xb7bfcb
            else if (id == 5) tint = 0x49890d
            else if (id == 6) tint = 0xdbb116
        }
        else if (loading_vars['assets_suffix'] === 'neverland') {
            if (id == 1) tint = 0x3cdbe1
            else if (id == 2) tint = 0xd86739
            else if (id == 3) tint = 0xffe798
            else if (id == 4) tint = 0x47e5bf
            else if (id == 5) tint = 0xb83bc4
            else if (id == 6) tint = 0x1cd4c2
        }
        
        return tint
    },

    show_hint(type, direction, is_boost = false) {
        if (!this.is_big_bottom()) {
            let dir_str = ''
            let reverese_dir_str = ''
            let val = is_boost ? 30 : 5
            let scale = 1.1
            if (direction === 'down') {
                dir_str = `+=${val}`
                reverese_dir_str = `-=${val}`
            }
            else if (direction === 'up') {
                dir_str = `-=${val}`
                reverese_dir_str = `+=${val}`
            }
            else if (direction === 'right') {
                dir_str = `+=${val}`
                reverese_dir_str = `-=${val}`
            }
            else if (direction === 'left') {
                dir_str = `-=${val}`
                reverese_dir_str = `+=${val}`
            }
            this.gem_back.visible = false
            let key = this.attr['key']
            // let key = "gem_" + this.attr['type'] + this.attr['id']
            // if (this.is_mark()) key = "gem_mark" + this.attr['id'] + "_" + (this.attr['is_marked'] ? 1: 2)
            // else if (this.attr['type'] === 'extra_moves') {  
            //     key = 'gem_extra_moves'
            // }
            // else if (this.attr['type'] == 'rucksack') {
            //     key = 'gem_bag';
                
            // }
    
            if (!this.attr['hint_img']) {
                this.attr['hint_img'] = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key)
                this.content_holder.add(this.attr['hint_img'])
            }
            else {
                this.attr['hint_img'].setFrame(key)
                this.attr['hint_img'].visible = true
                this.attr['hint_img'].scale = 1
                this.attr['hint_img'].y = 0
                this.attr['hint_img'].x = 0
            }
    
            if (!this.attr['tinted_hint_img']) {
                this.attr['tinted_hint_img'] = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key)
                this.content_holder.add(this.attr['tinted_hint_img'])
            }
            else {
                this.attr['tinted_hint_img'].setFrame(key)
                this.attr['tinted_hint_img'].visible = true
                this.attr['tinted_hint_img'].scale = 1
                this.attr['tinted_hint_img'].y = 0
                this.attr['tinted_hint_img'].x = 0
                this.attr['tinted_hint_img'].alpha = 1
            }
            let tint = this.get_tint(this.attr['id'])
            this.attr['tinted_hint_img'].setTint(tint)
            
            this.attr['hint_anim'] = true
            if (this.attr['hint_anim']) {
                this.hint_start_anim8 = game_data['scene'].tweens.add({
                    targets: this.attr['tinted_hint_img'], 
                    alpha: 0,
                    ease: 'Sine.easeInOut',
                    duration: 850,
                    yoyo: true,
                    // repeat: -1,
                    onCompete: () => {
                        // this.show_hint(type)
                    }
                })
    
                this.hint_start_anim = game_data['scene'].tweens.add({
                    targets: [this.attr['hint_img'], this.attr['tinted_hint_img']],    
                    scale: scale,  
                    y: (type == '2' && ['down', 'up'].includes(direction)) ? dir_str : '+=0',   
                    x: (type == '2' && ['right', 'left'].includes(direction)) ? dir_str : '+=0', 
                    duration: 600,
                    delay: 600,
                    onComplete: () => {
                        if (this.attr['hint_anim']) {
                            this.hint_start_anim2 = game_data['scene'].tweens.add({
                                targets: [this.attr['hint_img'], this.attr['tinted_hint_img']],   
                                scale: scale * 0.95,     
                                duration: 400,
                                onComplete: () => {
                                    if (this.attr['hint_anim']) {
                                        this.hint_start_anim3 = game_data['scene'].tweens.add({
                                            targets: [this.attr['hint_img'], this.attr['tinted_hint_img']],   
                                            scale: scale,     
                                            duration: 400,
                                            onComplete: () => {
                                                if (this.attr['hint_anim']) {
                                                    this.hint_start_anim4 = game_data['scene'].tweens.add({
                                                        targets: [this.attr['hint_img'], this.attr['tinted_hint_img']],    
                                                        scale: 1.0,
                                                        y: (type == '2' && ['down', 'up'].includes(direction)) ? reverese_dir_str : '-=0',  
                                                        x: (type == '2' && ['right', 'left'].includes(direction)) ? reverese_dir_str : '+=0', 
                                                        duration: 300,
                                                        onComplete: () => {
                                                            this.show_hint(type, direction, is_boost)
                                                        }
                                            
                                                    })
                                                }
                                                
                                            }
                                
                                        })
                                    }
                                   
                                }
                    
                            })
                        }
                        
                    }
        
                })
            }
        }
       
        
    },

    stop_hint() {
        this.attr['hint_anim'] = false
        if (this.attr['hint_img'])
            this.attr['hint_img'].visible = false
        if (this.attr['tinted_hint_img'])
            this.attr['tinted_hint_img'].visible = false
        if (this.hint_start_anim) this.hint_start_anim.stop()
        if (this.hint_start_anim2) this.hint_start_anim2.stop()
        if (this.hint_start_anim3) this.hint_start_anim3.stop()
        if (this.hint_start_anim4) this.hint_start_anim4.stop()
        if (this.hint_start_anim5) this.hint_start_anim5.stop()
        this.gem_back.visible = true
    },

    show_particle_explode(on_complete = () => {}) {
        let prtcl = this.scene.add.particles('common1');
        this.add(prtcl);
        this.sendToBack(prtcl)

        let emitter = prtcl.createEmitter({
                x: 0,
                frames: ['particle10_white', 'particle14'],
                y: 0,
                lifespan: 600,
                blendMode: allow_blend_mode ? 'ADD' : 'NORMAL',
                alpha: 1,
                scale: { start: 0.2, end: 0 },
                speed: { min: -100, max: 100 },
                quantity: 40
        });

        
        let count = 1;
        this.timer = this.scene.time.addEvent({
                delay: 30,
                repeat: 5,
                callbackScope: this,        
                callback: function(){
                        count++;
                        let emitZone = {
                                source: new Phaser.Geom.Circle(0, 0, 1 + 5 * count),
                                type: 'edge',
                                quantity: 30
                        };							
                        emitter.setEmitZone(emitZone);
                        emitter.explode();
                        if (count === 6) {
                            setTimeout(() => {
                                this.timer.paused = true
                                this.timer.remove(true)
                                this.timer.destroy(true)
                                on_complete()
                            }, 150)
                        }
                },
        });
        this.timer.paused = false;


        let emitZone = {
                source: new Phaser.Geom.Circle(0, 0, 1),
                type: 'edge',
                quantity: 20
        };
        emitter.setEmitZone(emitZone);
        emitter.explode();
    },

    change_frame(frame, on_complete = () => {}) {
        if (game_data['scene']['textures']['list']['common1'].has(frame)) {
            this.gem_back.setFrame(frame)
            on_complete()
        }
        
    },

    switch_gem() {
        setTimeout(() => {
            [ this.attr['closed'], this.attr['opened'] ] = [ this.attr['opened'], this.attr['closed'] ]
            this.switch_frame()
           
        }, 500)
    },

    switch_frame() {
        if (this.attr['closed']) this.change_frame(this['attr']['closed_frame'])
        else this.change_frame(this['attr']['opened_frame'])
    },

    is_switch_opened() {
        return this['attr']['opened']
    },

    broke({imgs}) {
        if (!this.getData('broken')) {
            let type = this.attr['type']
            let id = this.attr['id']
            if (type !== 'random' && !(type === 'bonus' && id !== 16) && type !== 'rucksack' && type !== 'switch' && type !== 'fireball' && type !== 'bottom' &&  type !== 'big_bottom') {
                let parts = []
                let destroy = false
                if (imgs) {
                    imgs.forEach(img => {
                        img.scale = 0.85
                        parts.push(img)
                        img.visible = true
                        game_data['moving_holder'].add(img)
                    })
                    destroy = true
                }
                else {
                    let key
                    if (!(type === 'bonus' && id === 16))
                    key = this.get_key()
                    else
                    key = 'booster6_part'
                    this.broke_piece.forEach((piece, i) => {
                        if (piece && game_data['moving_holder'] && this.scene) {
                            if (!piece.scene) piece.scene = game_data['scene']
                            piece.setFrame(key + `_${i+1}`)
                            piece.visible = true
                            game_data['moving_holder'].add(piece)
                        }
                        
                    })
                    parts = this.broke_piece
                }
                
                let traectories = [
                    [{x: 0, y: 0}, {x: -1, y: -171}, {x: -2, y: 38}, {x: -3, y: 259}],
                    [{x: 0, y: 0}, {x: 24, y: -173}, {x: 60, y: 33}, {x: 49, y: 258}],
                    [{x: 0, y: 0}, {x: 66, y: -170}, {x: 80, y: 35}, {x: 95, y: 261}],
                    [{x: 0, y: 0}, {x: 123, y: -257}, {x: 130, y: 33}, {x: 141, y: 258}],
                    [{x: 0, y: 0}, {x: 123, y: -257}, {x: 203, y: -40}, {x: 236, y: 234}],
                    [{x: 0, y: 0}, {x: 34, y: -100}, {x: 72, y: 34}, {x: 116, y: 250}],
                    [{x: 0, y: 0}, {x: 45, y: -296}, {x: 92, y: 28}, {x: 140, y: 251}],
                    [{x: 0, y: 0}, {x: -67, y: -80}, {x: -60, y: 40}, {x: -84, y: 261}],
                    [{x: 0, y: 0}, {x: -110, y: -186}, {x: -95, y: 34}, {x: -146, y: 231}],
                    [{x: 0, y: 0}, {x: -123, y: -148}, {x: -147, y: 33}, {x: -167, y: 258}],
                    [{x: 0, y: 0}, {x: -131, y: -304}, {x: -179, y: 28}, {x: -265, y: 242}],
                    [{x: 0, y: 0}, {x: -79, y: -103}, {x: -136, y: 33}, {x: -155, y: 259}],
                    [{x: 0, y: 0}, {x: -206, y: -269}, {x: -204, y: 23}, {x: -322, y: 255}],
                    [{x: 0, y: 0}, {x: 73, y: -292}, {x: 220, y: 60}, {x: 273, y: 254}],
                ]
        
                let pt = this.get_center_pt()
                let shift_y = 0
                let startPoint
                let controlPoint1
                let controlPoint2
                let endPoint
                
                parts.forEach(p => {
                    shift_y = Phaser.Utils.Array.GetRandom([400, 500, 600, 700, 800])
                    p.x = pt.x 
                    p.y = pt.y 
                    let traectory = Phaser.Utils.Array.RemoveRandomElement(traectories)
                    startPoint = new Phaser.Math.Vector2(p.x + traectory[0].x,  p.y + traectory[0].y);
                    controlPoint1 = new Phaser.Math.Vector2(p.x + traectory[1].x , p.y + traectory[1].y + 100 );
                    controlPoint2 = new Phaser.Math.Vector2(p.x + traectory[2].x , p.y + traectory[2].y );
                    endPoint = new Phaser.Math.Vector2(p.x + traectory[3].x , p.y + traectory[3].y + shift_y );
                    let path = { t: 0, vec: new Phaser.Math.Vector2() };
                    let curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
                    let easing = Phaser.Utils.Array.GetRandom(['Quad', 'Quart', 'Quint', 'Sine', 'Sine'])
                    let duration =  Phaser.Utils.Array.GetRandom([800, 900, 1000, 1100])
                    game_data['utils'].turn_around({item: p, duration, repeat: -1})
                    duration = {
                        400: 350,
                        500: 550,
                        600: 750,
                        700: 800,
                        800: 850,
                    }[shift_y]
    
                    game_data['scene'].tweens.add({
                        targets: path,
                        t: 1,
                        ease: `Sine.easeInOut`,
                        duration : 570 + duration,
                        onUpdate: () => {
                            let position = curve.getPoint(path.t);
                            p.x = position.x;
                            p.y = position.y;
                        },
                        onComplete: () => {
                            if (destroy)
                                p.destroy()
                            else {
                                p.visible = false
                                game_data['moving_holder'].remove(p)
                            }
                        }
                    });
                })
        
               
            }
            
            this.setData('broken', true)
            game_data['utils'].delayed_call(1500, () => {
                this.setData('broken', false)
            })
        }
       
    },

    switch_state() {
        this.attr['state'] = !this.attr['state'];
    },

    create_parts(key) {
        // game_data['scene']['textures']['list']['common1'].has(key + '_1')
        if (this.is_bonus() && this.get_id() === 16) key = 'booster6_part'
        let part1 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key + '_1');
        let part2 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key + '_2');
        let part3 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key + '_3');
        // let part4 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key + '_4');
        // let part5 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', key + '_5');
        part1.scale = 0.85
        part2.scale = 0.85
        part3.scale = 0.85
        // part4.scale = 0.85
        // part5.scale = 0.85

        // this.broke_piece = [part1, part2, part3, part4, part5]
        this.broke_piece = [part1, part2, part3]
    },

    update_parts(key) {
        if (this.is_bonus() && this.get_id() === 16) key = 'booster6_part'
        if (this.broke_piece)
            this.broke_piece.forEach((bp, index) => {
                let num = index + 1
                bp.setFrame(key + '_' + num)
            })
    },

    recycle() {
        this.reset();
        this.visible = false;
        this.y = -game_data['dim']['item_width'];
        game_data['game_engine']['playing_field']['gems_manager'].recycled_gems.push(this);
        game_data['game_engine']['playing_field']['gems_manager'].gems_holder.remove(this);
        // game_data['utils'].delayed_call(100, () => {
        //     game_data['game_engine']['playing_field']['gems_manager'].selected_gem = null;
        //     game_data['game_engine']['playing_field']['gems_manager']['attr']['down_info'] = {};
        // })
        
    },

    set_invulnerable(value) {
        this['attr']['invulnerable'] = value;
    },

    is_invulnerable() {
        return this['attr']['invulnerable'];
    },
    
    handler_item_down(pointer) {
        if (this && !this.attr['exploding']) {
            var pt = new Phaser.Geom.Point(pointer['worldX'], pointer['worldY']);           
            this.item_down(pt);
        }          
    },
    
    is_allow_touch_gem() {
        return  game_data['game_play']['game_engine']['playing_field'].is_allow_touch_gem({'gem': this, 'pos': this.get_pos()})
    },

    item_down(pt) {	
        let allow_touch_gem = this.is_allow_touch_gem()
        
        if (this && allow_touch_gem && !game_data['game_play'].attr.state) {
            this.attr['down_info'] = {'active': true, 'pt': pt};
            this.emitter.emit("EVENT", {'event': "ITEM_DOWN", 'gem': this, 'pos': this.get_pos(), 'pt': pt}); 
        }	        	
               
    },			

    handler_item_over() {
        if (this)
        this.emitter.emit('EVENT', {'event': 'GEM_OVER', 'gem': this, 'pos_x':  this.attr['pos_x'], 'pos_y':  this.attr['pos_y']});
    },

    handler_item_out() {
        if (this)
        this.emitter.emit('EVENT', {'event': 'GEM_OUT', 'pos_x':  this.attr['pos_x'], 'pos_y':  this.attr['pos_y']});
    },    

    update_pos(obj, pt, change_vertical) {
        this.attr['pos_x'] = obj['pos_x'];
        this.attr['pos_y'] = obj['pos_y'];
        this.attr['target_pt'] = pt;
        this.change_vertical = change_vertical;		
		this.fall();
    },
            
    get_pos() {
        return {'pos_x': this.attr['pos_x'], 'pos_y': this.attr['pos_y']};
    },
    
    update_fall_delay(delay) {
        this.attr['fall_delay'] = delay;
    },

    move_fail(pt1, pt2) {        
        var _this = this;
        this.move_swap(pt1, function(){
            _this.move_swap(pt2, () => {}, true);
            _this.display_fade(pt1, pt2);
        }, true);
    },

    display_fade(pt1, pt2) {  
        var time_swap = 200;
        var _this = this;
        var key = this.attr['key'];

        var pt_1 = pt1;
        var pt_2 = new Phaser.Geom.Point((3 * pt1.x +  pt2.x) / 4, (3 * pt1.y +  pt2.y) / 4);
        var pt_3 = new Phaser.Geom.Point((pt1.x +  pt2.x) / 2, (pt1.y +  pt2.y) / 2);

        game_data['utils'].delayed_call(time_swap / 4, function(){
            if (_this && _this.emitter)
                _this.emitter.emit("EVENT", {'event': 'DISPLAY_FADE', 'key': key, 'pt': pt_1});
        }, [], this);

        game_data['utils'].delayed_call(time_swap / 2, function(){
            if (_this && _this.emitter)
                _this.emitter.emit("EVENT", {'event': 'DISPLAY_FADE', 'key': key, 'pt': pt_2});
        }, [], this);
        
        game_data['utils'].delayed_call(3 * time_swap / 4, function(){
            if (_this && _this.emitter)
                _this.emitter.emit("EVENT", {'event': 'DISPLAY_FADE', 'key': key, 'pt': pt_3});
        }, [], this);
    },

            
    move_swap(pt, on_complete = () => {}, is_fail, swapped_gem, _static = true, update_candidate = true) {
        var _this = this;
        var gem = this;						
        var time_swap = 200;
        this.remove_shake();
        this.attr['moving'] = true;
        this.attr['swapped'] = true;
        pt === null ? pt = {x: gem.x, y: gem.y} : null;
        if (this.scene) {
            this.scene.tweens.add({
                targets: gem,
                x: pt.x,
                y: pt.y,            
                duration: time_swap,                        
                onComplete: function () {
                    if (_static) {
                        if (_this && _this.scene) {
                            _this.attr['moving'] = false;
                            if (!(is_fail && gem.is_bonus()) && update_candidate)  {
                                
                                _this.update_candidate({'pos_x': _this.attr['pos_x'], 'pos_y': _this.attr['pos_y'], 'is_swap': true, 'swapped_gem': swapped_gem});
                                
                            }               
                                
                            
                        }
                    }
                    on_complete();
                   
                }            
            });

        }
    },

    move_shuffle(end_pt, on_complete = () => {}) {       
        var gem = this;
        var _this = this;
        var shuffle_timeout = 2000;
        this.remove_shake();
        this.attr['moving'] = true;
            if (_this && _this.scene) {
                _this.scene.tweens.add({
                    targets: gem,
                    x: end_pt.x,
                    y: end_pt.y,
                    duration: shuffle_timeout / 2,                        
                    onComplete: function () {
                        if (_this && _this.scene) {
                            _this.attr['moving'] = false;					                
                            _this.update_candidate();
                            gem.scaleX = 1;
                            gem.scaleY = 1;
                            on_complete();        
                        }
                    },
                    onUpdate: (tween, target) => {
                        if (tween.progress < 0.5) {
                            gem.scaleX += 0.01;
                            gem.scaleY += 0.01;
                        } else {
                            gem.scaleX -= 0.01;
                            gem.scaleY -= 0.01;
                        }


                    }            
                });
            }
    },

    is_grass() {
       return  game_data.game_engine.playing_field.field_items?.[this.attr['pos_y']]?.[this.attr['pos_x']].is_grass()
    },

	fall() {
        this.attr['falling'] = true;
        if (this && this.scene)
        game_data['utils'].delayed_call(this.attr['fall_delay'], () => {
            this.timer_update_position.paused = false;
        });
		
	},

    is_field_item_active(obj) {
        return game_data.game_engine.playing_field.field_items_manager.is_active(obj);
    },

    is_any_empty_field_on_way(pos_y, pos_x) {
        return game_data.game_engine.playing_field.gems_manager.gems_utils.is_any_empty_field_on_way(pos_y, pos_x);
    },

	handler_update_position() {
        var dy = this.attr['speed'];
        if (dy >= 20) dy = 20;
        // this.emitter.emit("EVENT", {'event': 'CHECK_RESHUFFLE', 'type': 'falling'});
		var dx;
                if (this.attr['target_pt'].x - this.x > 0) {
                    dx = this.x_speed;
                    if (dx > 13) {
                        this.x_speed = 13;
                        dx = this.x_speed;
                    }
                    this.x_speed += this.x_speed * 0.1;
                }
                
            else if (this.attr['target_pt'].x - this.x < 0) {
                dx = -this.x_speed;
                if (dx < -13) {
                    
                    this.x_speed = 13;
                    dx = -this.x_speed;
                }
                this.x_speed += this.x_speed * 0.1;
            }
                
            else
                dx = 0;
    
            if (Math.abs(this.y - this.attr['target_pt'].y) <= dy) {
                this.x = this.attr['target_pt'].x;
                this.y = this.attr['target_pt'].y;	
                let allow = this.is_any_empty_field_on_way(this.attr['pos_y'], this.attr['pos_x']);
                let {pos_x, pos_y} = this.attr;
                let left_empty = game_data.game_engine.playing_field.gems_manager.empty_field_items.find(el => pos_x-1 == el.pos_x && pos_y+1 == el.pos_y);
                let right_empty = game_data.game_engine.playing_field.gems_manager.empty_field_items.find(el => pos_x+1 == el.pos_x && pos_y+1 == el.pos_y);
                
                if (!this.attr['swapped'] && allow && 
                (!this.is_field_item_active(+this.attr['pos_y'], +this.attr['pos_x'] - 1) && !left_empty) &&  (!this.is_field_item_active(+this.attr['pos_y'], +this.attr['pos_x'] + 1) && !right_empty)) {
                    this.attr['falling'] = false;
                        if (!this.attr['moving']) {
                            this.drop_squeeze();
                        }

                        this.attr['swapped'] = false;
                        this.change_vertical = false;
                        
                        this.attr['speed'] = this.init_speed;
                        this.x_speed = 6;
                    this.timer_update_position.paused = true;
                    this.emitter.emit("EVENT", {'event': 'STOP_FALL'});
                    this.update_candidate({'pos_x': this.attr['pos_x'], 'pos_y': this.attr['pos_y']});
                    this.gem_content.scaleX = 1;
                    this.gem_content.scaleY = 1;                    
                }
                
                this.timer_update_position.paused = true;
                this.attr['falling'] = false;
                this.emitter.emit("EVENT", {'event': 'STOP_FALL'});
                this.update_candidate({'pos_x': this.attr['pos_x'], 'pos_y': this.attr['pos_y']});
                this.gem_content.scaleX = 1;
                this.gem_content.scaleY = 1;
            }
            else {
                if (!this.change_vertical) {
                    this.attr['speed'] += this.attr['speed'] * 0.1;
                    this.y += dy;
                }
                
                if (this.change_vertical) {
                    this.y += this.init_speed * 1.7;
                    this.x += dx ;
                }
                
                
                if (this.gem_content.scaleX < 1) {
                    this.gem_content.scaleX += 0.15;
                    if (this.gem_content.scaleX > 1)
                        this.gem_content.scaleX = 1;
                }
                if (this.gem_content.scaleY < 1) {
                    this.gem_content.scaleY += 0.15;
                    if (this.gem_content.scaleY > 1)
                        this.gem_content.scaleY = 1;
                }
                if (this.y > this.attr['target_pt'].y) this.y = this.attr['target_pt'].y;
            }

		
		
	},

    handler_bounce() {
        // this.bounce_arr = [1, 1, -1, -1,-1, 1, 1, -1];
        let coef = 1
        let time = 10
        let tween1 = game_data['scene'].tweens.add({
            targets: [this],
            duration: time * coef,
            y: '+=1',
            // ease: 'Sine.easeInOut',
            onComplete: () => {
                let tween2 = game_data['scene'].tweens.add({
                    targets: [this],
                    duration: time * coef,
                    y: '+=1',
                    // ease: 'Sine.easeInOut',
                    onComplete: () => {
                        let tween3 = game_data['scene'].tweens.add({
                            targets: [this],
                            duration: time * coef,
                            y: '-=1',
                            // ease: 'Sine.easeInOut',
                            onComplete: () => {
                                let tween4 = game_data['scene'].tweens.add({
                                    targets: [this],
                                    duration: time * coef,
                                    y: '-=1',
                                    // ease: 'Sine.easeInOut',
                                    onComplete: () => {
                                        let tween5 = game_data['scene'].tweens.add({
                                            targets: [this],
                                            duration: time * coef,
                                            y: '-=1',
                                            // ease: 'Sine.easeInOut',
                                            onComplete: () => {
                                                let tween6 = game_data['scene'].tweens.add({
                                                    targets: [this],
                                                    duration: time * coef,
                                                    y: '+=1',
                                                    // ease: 'Sine.easeInOut',
                                                    onComplete: () => {
                                                        let tween7 = game_data['scene'].tweens.add({
                                                            targets: [this],
                                                            duration: time * coef,
                                                            y: '+=1',
                                                            // ease: 'Sine.easeInOut',
                                                            onComplete: () => {
                                                                let tween8 = game_data['scene'].tweens.add({
                                                                    targets: [this],
                                                                    duration: time * coef,
                                                                    y: '-=1',
                                                                    // ease: 'Sine.easeInOut',
                                                                    onComplete: () => {
                                                                        this.squeze_anims.forEach(anim => {
                                                                            if (anim) {
                                                                                anim.stop()
                                                                                anim.remove()
                                                                            }
                                                                        })
                                                                        this.squeze_anims = []
                                                                    }
                                                                })
                                                                this.squeze_anims.push(tween8)
                                                            }
                                                        })
                                                        this.squeze_anims.push(tween7)
                                                    }
                                                })
                                                this.squeze_anims.push(tween6)
                                            }
                                        })
                                        this.squeze_anims.push(tween5)
                                    }
                                })
                                this.squeze_anims.push(tween4)
                            }
                        })
                        this.squeze_anims.push(tween3)
                    }
                })
                this.squeze_anims.push(tween2)
            }
        })
        this.squeze_anims.push(tween1)
           },

    drop_squeeze() {
        var _this = this;
        var _y = this.y;
        let anim = true;
        if (_this && _this.scene) {
            
            let tween1 = game_data['scene'].tweens.add({targets: _this, scaleY: 0.85, y: _y + 10, duration: 60,  ease: 'Sine.easeInOut', onUpdate: (tween, obj) => {
                if ((this.attr['moving'] || this.attr['falling']) && anim) {
                    
                    if (obj) {
                        obj.setScale(1);
                        obj.y = _y;
                    }
                    
                    anim = false;
                    if (tween1) {
                        tween1.stop();
                        tween1.remove();
                    }
                    if (tween2) {
                        tween2.stop();
                        tween2.remove();
                    }
                    
                    if (tween3) {
                        tween3.stop();
                        tween3.remove();
                    }
                    this.squeze_anims.forEach(anim => {
                        if (anim) {
                            anim.stop()
                            anim.remove()
                        }
                    })
                    this.squeze_anims = []
                   
                }
            }}); 
            
            let tween2 = game_data['scene'].tweens.add({targets: _this, scaleY: 1.05, y: _y - 3, delay: 60, duration: 80,  ease: 'Sine.easeInOut', onUpdate: (tween, obj) => {
                if (this.attr['moving'] || this.attr['falling'] && anim) {
                    if (obj) {
                        obj.setScale(1);
                        obj.y = _y;
                    }
                    
                    anim = false;
                    if (tween1) {
                        tween1.stop();
                        tween1.remove();
                    }
                    if (tween2) {
                        tween2.stop();
                        tween2.remove();
                    }
                    
                    if (tween3) {
                        tween3.stop();
                        tween3.remove();
                    }
                    this.squeze_anims.forEach(anim => {
                        if (anim) {
                            anim.stop()
                            anim.remove()
                        }
                    })
                    this.squeze_anims = []
                }
            }}); 
            
            let tween3 = game_data['scene'].tweens.add({targets: _this, scaleY: 1, y: _y, delay: 140, duration: 40,  ease: 'Sine.easeInOut', onUpdate: (tween, obj) => {
                if ((this.attr['moving'] || this.attr['falling']) && anim) {
                    if (obj) {
                        obj.setScale(1);
                        obj.y = _y;
                    }
                    
                    anim = false;
                    if (tween1) {
                        tween1.stop();
                        tween1.remove();
                    }
                    if (tween2) {
                        tween2.stop();
                        tween2.remove();
                    }
                    
                    if (tween3) {
                        tween3.stop();
                        tween3.remove();
                    }
                    this.squeze_anims.forEach(anim => {
                        if (anim) {
                            anim.stop()
                            anim.remove()
                        }
                    })
                    this.squeze_anims = []
                }
            }}); 
        }
    },
    
    start_shake_anim() {
        if (this.shake_arr.length > 0 && this.attr['shaking']) {
            game_data['utils'].delayed_call(10, () => {
                if (this.attr['shaking']) {
                    this.shake_ind = (this.shake_ind + 1) % this.shake_arr.length;
                    let angle = this.shake_arr[this.shake_ind];	
                    this.angle = angle
                    this.start_shake_anim()
                }
                
            })
        }
    },

    add_shake() {        
        if (!this.is_dynamical()) {
            this.attr['shaking'] = true;
            game_data['scene'].tweens.add({targets: this, scaleX: 1.1, scaleY: 1.1, duration: 100});  
            this.start_shake_anim()
            
        }
    },

    remove_shake() {      
        this.shake_arr = [4, 3, 2, 1, 0, -1, -2, -3, -4, -3, -2, -1, 0, 1, 2, 3];  
        if (this.attr['shaking']) {
            this.angle = 0;
            this.shake_ind  = 0
            game_data['scene'].tweens.add({targets: this, scaleX: 1, scaleY: 1, duration: 300});            
            this.attr['shaking'] = false;
        }    
    },
    
    collapse_gem(x, y, items, callback, copy = false) {
        if (this && this.scene) {
            let gem;
            if (copy) {
                gem = this.get_copy();
                gem.x = this.x;
                gem.y = this.y;
                if (this.parentContainer)
                this.parentContainer.add(gem);
            } else {
                gem = this;
            }

            if (this && this.scene && this.scene.tweens) {
                this.scene.tweens.add({
                    targets: [...items, gem],
                    scale: 1.5,
                    duration: 200,
                    ease: "Sine.easeOut",
                    // alpha: 0.5,                        
                    onComplete: () => {   
                        if (this && this.scene && this.scene.tweens)
                        this.scene.tweens.add({
                            targets: [...items, gem],
                            x,
                            y,
                            scale: 0.5,
                            duration: 200,
                            // alpha: 0.5,                        
                            onComplete:() => { 
                                gem.setScale(1);
                                  if (copy) gem.destroy();
                                callback();
                            } 
                        });
                        else {
                            gem.setScale(1);
                            if (copy) gem.destroy();
                            // this.setScale(0);
                            callback();
                        }
                    } 
                });
            }
            
        } else {
            
            // this.setScale(0);
            callback();
        }
        
    },

    animate_appear() {
        var _this = this;
        this.gem_content.alpha = 0.5;
        this.gem_content.scaleX = 0.5;
        this.gem_content.scaleY = 0.5;


        game_data['scene'].tweens.add({
            targets: this.gem_content,
            scaleX: 1.3, 
            scaleY: 1.3,
            alpha: 0.75,
            duration: 200,                        
            onComplete: function () {   
                if (_this && _this.scene) {
                    _this.scene.tweens.add({
                        targets: _this.gem_content,                   
                        scaleX: 1, 
                        scaleY: 1,
                        alpha: 1,
                        duration: 100,                        
                        onComplete: function () { 
                            if (_this && _this.scene)
                                _this.update_candidate();    
                        }            
                    });
                }
            }            
        });        
    },

    animate_disappear(on_complete) {
        var _this = this;        
        this.gem_content.scaleX = 1;
        this.gem_content.scaleY = 1;
        
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'disappear_coin'});
        game_data['scene'].tweens.add({
            targets: this.gem_content,
            scaleX: 1.2, 
            scaleY: 1.2,
            alpha: 0.75,
            duration: 200,                        
            onComplete: function () {   
                if (_this && _this.scene) {
                    _this.scene.tweens.add({
                        targets: _this.gem_content,                   
                        scaleX: 0.5, 
                        scaleY: 0.5,
                        alpha: 0,
                        duration: 100,                        
                        onComplete: function () { 
                            if (_this && _this.scene) on_complete();
                        }            
                    });
                }
            }            
        });        
    },




    show_selection() {
        /*
        gem_content.filters = [glow_filter];
        */
    },

    hide_selection() {
        /*
        gem_content.filters = [];
        */
    },
						

  
    get_down_info() {
        return this.attr['down_info'];
    },
    
    hide_gem() {
        this.visible = false;
    },

    show_gem() {
        this.visible = true;
    },

    colored(color, on_complete) {
        let tint = 0xFFFFFF;
        switch (color) {
            case 'white':
                tint = 0xFFFFFF;
                break;
            case 'yellow':
                tint = 0xeb9c03;
                break;
            case 'red':
                tint = 0xed1e76;
                break;
            case 'blue':
                tint = 0x258ee3;
                break;
            case 'green':
                tint = 0x51c820;
                break;
            default:
                tint = 0xFFFFFF;
                break;
        }
        var gem_light = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", this.get_key());
        this.content_holder.add(gem_light);
        var _this = this;
        gem_light.setTintFill(tint);
        gem_light.alpha = 0;

        game_data['scene'].tweens.add({targets: gem_light, alpha: 1, duration: 500, onComplete: function () { 
            if (_this && _this.scene) {
                gem_light.destroy();
                on_complete();	                
            }
        }});
    },

    whiten(on_complete) {        
        var gem_light = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", this.get_key());
        this.content_holder.add(gem_light);
        var _this = this;
        gem_light.setTintFill(0xFFFFFF);
        gem_light.alpha = 0;

        game_data['scene'].tweens.add({targets: gem_light, alpha: 1, duration: 500, onComplete: function () { 
            if (_this && _this.scene) {
                gem_light.destroy();
                on_complete();	                
            }
        }});
    },

    set_wave_state(state = false) {
        this['attr']['waving'] = state;
    },

    wave({pos_x, pos_y}, destroy = false) {
        if (!this.waving) {
            this.set_wave_state(true);
            let target = {
                x: this.x,
                y: this.y,
                init_x: this.x,
                init_y: this.y,
            }
            let by_x = 15;
            let by_y = 15;
            if (this.attr.pos_x > pos_x && this.attr.pos_y < pos_y) {
                target.x = this.x + by_x;
                target.y = this.y - by_y;
            }
            else if (this.attr.pos_x > pos_x && this.attr.pos_y > pos_y) {
                target.x = this.x + by_x;
                target.y = this.y + by_y;
            }
            else if (this.attr.pos_x < pos_x && this.attr.pos_y > pos_y) {
                target.x = this.x - by_x;
                target.y = this.y + by_y;
            }
            else if (this.attr.pos_x < pos_x && this.attr.pos_y < pos_y) {
                target.x = this.x - by_x;
                target.y = this.y - by_y;
            }
            else if (this.attr.pos_x == pos_x && this.attr.pos_y > pos_y) {
                target.x = this.x;
                target.y = this.y + by_y;
            }
            else if (this.attr.pos_x == pos_x && this.attr.pos_y < pos_y) {
                target.x = this.x;
                target.y = this.y - by_y;
            }
            else if (this.attr.pos_x > pos_x && this.attr.pos_y == pos_y) {
                target.x = this.x + by_x;
                target.y = this.y;
            }
            else if (this.attr.pos_x < pos_x && this.attr.pos_y == pos_y) {
                target.x = this.x + by_x;
                target.y = this.y;
            }
            if (this && this.scene) {
                
                this.scene.tweens.add({
                    targets: [this],
                    x: target.x,
                    y: target.y,
                    repeat: 0,
                    yoyo: true,
                    scale: destroy ? 0 : 1,
                    duration: 150,
                    onUpdate: () => {
        
                    },
                    onComplete: () => {
                        this.x = target.init_x;
                        this.y = target.init_y;
                        this.set_wave_state(false);
                    }
                });
            }
           
        }
        
    },

    get_location() {
        return new Phaser.Geom.Point(this.x, this.y);
    },
    
    get_center_pt() {
        if (this)
            return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 0));
        else
            return new Phaser.Geom.Point(0, 0);
    },

    is_normal() {
        return (this.attr['type'] == 'normal');
    },

    is_bat() {
        return (this.attr['type'] == 'bat');
    },

    is_switched() {
        return (this.attr['type'] == 'switch');
    },

    is_mark() {
        return (this.attr['type'] == 'mark');
    },		

    is_money() {
        return (this.attr['type'] == 'money');
    },

    is_bottom() {
        return (this.attr['type'] == 'bottom' || this.attr['type'] == 'big_bottom');
    },

    is_big_bottom() {
        return this.attr['type'] === 'big_bottom';
    },

    is_major_big_bottom() {
        return this.attr['major_big_bottom'];
    },

    set_minor_big_bottom(state) {
        this.attr['minor_big_bottom'] = state
        if (state) {

        }
        else {

        }
    },

    is_minor_big_bottom() {
        return this.attr['minor_big_bottom'];
    },
    
    is_fireball() {
        return (this.attr['type'] == 'fireball');
    },		
    
    is_bonus() {
        return (this.attr['type'] == 'bonus')
    },

    is_passive() {
        return (this.attr['type'] == 'passive')
    },
    is_embedded() {
        return (this.attr['type'] == 'embedded')
    },

    is_extra_moves() {
        return (this.attr['type'] == 'extra_moves')
    },


    get_id() {
        return this.attr['id'];
    },
    
    is_down() {
        return ('active' in this.attr['down_info']);
    },

    get_type() {
        return this.attr['type'];
    },

    is_removable() {
        return (this.attr['type'] == 'normal' || this.attr['type'] == 'mark');
    },

    is_moving() {
        return this.attr['moving'];
    },

    is_falling() {
        return this.attr['falling'];
    },

    is_dynamical() {

        return (this.attr['falling'] || this.attr['moving']);
    },

    is_rucksack() {
        return (this.attr['type'] == 'rucksack')
    },

    is_chest() {
        return (this.attr['type'] == 'chest')
    },

    get_content() {
        return gem_content;
    },		
    
    get_money_timestamp() {
        if ('money_timestamp' in this.attr && this.attr['money_timestamp'] > 0)
            return this.attr['money_timestamp'];
        else
            return game_data['utils'].get_time();
    },
    
    is_static() {
        return this.attr['static']
    },

    is_hog() {
        return (this.attr['type'] == 'hog');
    },

    is_marked() {
        return this.attr['is_marked'];
    },
    
    is_money_removing() {
        return this.attr['money_removing'];
    },
    
    set_money_removing(_is_money_removing) {
        this.attr['money_removing'] = _is_money_removing;
    },		
    
    set_down(_is_down) {
        if (this)
        this.attr['down_info']['active'] = _is_down;
    },
    
    set_moving(is_moving) {
        this.attr['moving'] = is_moving;
    },

    set_uno_swap(state) {
        this.attr['uno_swap'] = state
    },

    is_uno_swap() {
        return this.attr['uno_swap']
    },

    update_candidate(obj) {
        
        if (obj) {
            // if (obj['pos_x'] == 0 && obj['pos_y'] == 6) debugger;
            var params = obj;
            params['event'] = "UPDATE_CANDIDATE";
            this.emitter.emit("EVENT", params);            
        }
        else	
            this.emitter.emit("EVENT", {'event': "UPDATE_CANDIDATE", 'pos_x': this.attr['pos_x'], 'pos_y': this.attr['pos_y']});            
            
    },

    get_fall_time(gem, middle_points) {
        
        var i; 
        var len;
        var fall_timeout = 200;
        var time_const = fall_timeout / 1000;
        var length_const = game_data['dim']['item_width'];
        len = Math.max(Math.abs(gem.x - middle_points[0].x), Math.abs(gem.y - middle_points[0].y));
        for (i = 1; i < middle_points.length; i++)
            len += Math.max(Math.abs(middle_points[i].x - middle_points[i - 1].x), Math.abs(middle_points[i].y - middle_points[i - 1].y));
            
        return time_const * Math.sqrt(len / length_const);
        
    },

    get_copy() {
        let key = this.attr['key'];
        let copy
        
        if (this['attr']['type'] === 'switch') key = 'gem_book1_2'
        if (this['attr']['type'] === 'embedded') key = 'gem_embedded0_1'
        // key = this.gem_content.frame.name
        if (this.attr['type'] !== 'bonus') {
            copy = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", key);
            copy.setOrigin(0.5, 0.5);
            copy.pos_x = this.attr.pos_x
            copy.pos_y = this.attr.pos_y
            return copy;
        } 
        else {
            copy = new Phaser.GameObjects.Container(game_data['scene'], 0, 0,);
           
            let image = new Phaser.GameObjects.Image(game_data['scene'], 0, 0, "common1", key);
            image.setOrigin(0.5, 0.5);
            copy.pos_x = this.attr.pos_x
            copy.pos_y = this.attr.pos_y
            copy.add(image);
            copy.gem_content = image

            if (this.get_id() === 16) {
                copy.show_particle_explode = this.show_particle_explode
                copy.broke = this.broke
                
                copy.broke_piece = this.broke_piece
                copy.get_center_pt = this.get_center_pt
                copy.attr = {}
                copy.attr.type = this['attr']['type']
                copy.attr.id = this['attr']['id']
            }

            return copy;
        }
        
    },
    
    get_key() {
        return this.attr['key'];
    },

    reset() {
        if (this.timer_update_position)
            this.timer_update_position.paused = true;

        if (this.attr && this.attr['down_info'])
            delete this.attr['down_info']
        this.shake_ind = 0;
        this.attr = {
            'static': null,
            'closed': null,
            'opened': null,
            'type': null,
            'id': null,
            'state': null,
            'speed': null,
            'strength': null,
            'target_id': null,
            'opened_frame': null,
            'closed_frame': null,
            'is_marked': null,
            'big': null,
            'major_big_bottom': null,
            'key': '',
            'money_timestamp': 0,
            'down_info': {},
            'pos_x': -1,
            'pos_y': -1,
            'target_pt': {},
            'fall_delay': 0,
            'swapped': null,
            'moving': null,
            'falling': null,
            'shaking': null,
            'money_removing': null,
            'invulnerable': false,
            'waving': false,
            'uno_swap': false,
        };
        this.alpha = 1;
        this.x = 0;
        this.y = -game_data['dim']['item_height'];	

        if (this.gem_content) {
            this.gem_content.setScale(0);	
            this.gem_content.x = 0
            this.gem_content.y = 0
        }	
        if (this.bonus_anim) {
             this.bonus_anim.pause()
             this.bonus_anim.remove()
            this.bonus_anim = null
        }
        if (this.bottom_anims) {
            this.bottom_anims.forEach(b => {
                if (b) {
                    b.stop();
                    b.remove();
                }
                if (b.destroy)
                b.destroy();
            });
        }
        if (this.gem_bottom_glow) this.gem_bottom_glow.destroy()
        if (game_data['game_engine']['playing_field']['gems_manager'].switched_gems.includes(this)) {
            game_data['game_engine']['playing_field']['gems_manager'].switched_gems.splice(game_data['game_engine']['playing_field']['gems_manager'].switched_gems.indexOf(this), 1)
        }
       
    },       

    destroy_gem(fully) {
        this.particles.forEach(p => {
            if (p) {
                if (p.animation) {
                    p.animation.stop();
                    p.animation.remove();
                }
                p.destroy();
            } 
        });
        if (this.bottom_anims) {
            this.bottom_anims.forEach(b => {
                if (b) {
                    b.stop();
                    b.remove();
                }
                if (b.destroy)
                b.destroy();
            });
        }
        // if (this.attr.type === 'normal' && !fully)
        this.stop_hint()
        if (!this.is_bonus() && !fully)
            this.recycle();
        else {
            this.reset();
            this.timer_update_position.paused = true;
            this.timer_update_position.remove(true)
            this.timer_update_position.destroy()
            this.destroy();
        }

    },

});



