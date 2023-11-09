class PlayingField extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.stone_scale = 0.7;
        this.x = 447;
        this.y = 100;

        this.con_x = 0;
        this.con_y = 0;
    }


    create_tiles() {
        this.x = 447;
        this.y = 100;
        this.engine.map[this.engine.round].layers.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((origin, x) => {
                    if (origin) {
                        const texture = this.engine.return_tile_texture(origin.texture);
                        const tile = new Tile( this.scene,
                            parseFloat((x * 57 * this.stone_scale + 
                                10 * this.stone_scale + 
                                (origin.x ? (57 * this.stone_scale) / 2 : 0) + 
                                z * (8 * this.stone_scale)).toFixed(2)),
                            parseFloat((y * 82 * this.stone_scale + 
                                10 * this.stone_scale + 
                                (origin.y ? (82 * this.stone_scale) / 2 : 0) - 
                                z * (8 * this.stone_scale)).toFixed(2)) + 90, 
                            texture, this.engine, this.stone_scale, {x, y, z}
                        );
                        // console.log(tile.name);
                        this.add(tile);
                    }
                });
            });
        });
        this.list.sort((a, b) => {
            return (a.depth_z * 100 - (a.x/50) + (a.y/100)) - (b.depth_z * 100 - (b.x/50) + (b.y/100));
        });

        // this.engine.overlay.hide();
        // this.engine.overlay.show([
        //     {x: this.list[16].x, y: this.list[16].y, width: 40, height: 57, figure: 'rect'},
        //     {x: this.list[20].x + this.x + this.engine.x + 5.6 * 2, y: this.list[20].y + this.y - 5.6 * 2, width: 40, height: 57, figure: 'rect', stroke: ['common1', 'particle11']},
        //     {x: this.engine.player_display.x + 20, y: this.engine.player_display.y + 170, width: 280, height: 500, figure: 'rect', lifespan: 4690, stroke: ['common1', 'particle11']},
        //     {x: this.engine.boosters_panel.x - 49, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']},
        //     {x: this.engine.boosters_panel.x + 108, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']},
        //     {x: this.engine.boosters_panel.x + 250, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']},
        //     {x: this.engine.boosters_panel.x + 392, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']},
        // ]);
        // this.engine.arrow.hide();
        // this.engine.arrow.show(400, 100, 45);
        
        this.emitter.emit('EVENT', {event: 'FIELD_APPEARED'});
        
        if(this.engine.actions) {
            this.emitter.emit('ACTION', {event: 'FIELD'});
        }

        this.camera_center();
    }

    destroy_field() {
        this.removeAll(true);
    }

    disable_tiles() {
        this.list.forEach(tile => {
                tile.disableInteractive();
        });
    }

    enable_tiles() {
        this.list.forEach(tile => {
                tile.setInteractive();
        });
    }

    disable_tiles_expect(arr) {
        this.list.forEach(tile => {
            if(!arr.includes(tile.name)) {
                tile.disableInteractive();
            }
        });
    }

    camera_center() {
        let arr = this.list.filter(e => e.texture.key !== 'firework_effect');

        const min = {x: Math.min(...arr.map(f => f.x)), y: Math.min(...arr.map(s => s.y))};

        const max = {x: Math.max(...arr.map(f => f.x)), y: Math.max(...arr.map(s => s.y))};

        const center_point = () => {
            const x = ((max.x - min.x) / 2) + min.x;
            const y = ((max.y - min.y) / 2) + min.y;
            return {x, y}
        }

        this.con_x = 275 - (center_point().x * this.scale);
        this.con_y = 260 - (center_point().y * this.scale);
        this.x += this.con_x;
        this.y += this.con_y;
    }

    booster_drag_start(params) {
        this.active_booster = {'booster_id': params['booster_id'], 'items': [], 'active': true};
        this.update_tutorial_iteration();
    }
    
    booster_drag_end(params) {
    
        if ('items' in this.active_booster && this.active_booster['items'].length > 0) {
            var current_item = this.active_booster['current_item'];
            var pt = current_item.get_center_pt();
            this.emitter.emit('EVENT', {'event': 'APPLY_BOOSTER', 'booster_id': params['booster_id'], 'pt': pt});
        
        }
        else {
            this.emitter.emit('EVENT', {'event': 'RETURN_BOOSTER', 'booster_id': params['booster_id']});
        }
    
    
        this.remove_shakes();
        this.active_booster['active'] = false;
    }

    booster_click(params) {
    //     let booster_id = params['booster_id']
    //     let create_grass = params['create_grass']
    //     if (!this.attr['moves_blocked']) {
    //         this.reset_hint();
                
    //             if (params['items'].length > 0) {
    //                 if (booster_id !== 'cross')
    //                 this.bonus_manager.remove_iteration_items(params['items'], null, null, create_grass);
    //                 else {
    //                     let {pos_x, pos_y} = params
    //                     this.bonus_manager.apply_bonus_rockets({ pos_x, pos_y, create_grass});
    //                 }
    //                 this.emitter.emit('EVENT', {'event': 'BOOSTER_USED', 'booster_id': params['booster_id']});
    //                 game_data['game_play'].attr.state = false;		
    //             }
    //     }
    }

    show_overlay(name) {
        if(name){
            const tile = this.list.find(t => t.name === name.name);
            if(tile) tile.show_overlay();
        } else {
            this.list.forEach(e => e.show_overlay());
        }
    }

    hide_overlay(name) {
        if(name){
            const tile = this.list.find(t => t.name === name.name);
            if(tile) tile.hide_overlay();
        } else {
            this.list.forEach(e => e.hide_overlay());
        }
    }
}