class PlayerDisplay extends Phaser.GameObjects.Container {
    constructor(scene, engine, x, y, name) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.name = name;
        this.count;
        this.raiting_place = 'player';
    }

    init() {
        if(this.list.length > 0) {
            this.removeAll(true);
        }
        if(!this.playing_field){
            this.count = this.engine.get_total_items();
        } else {
            this.playing_field.destroy();
            this.count = this.engine.get_total_items();
        }
        this.create_background();
        this.create_field();
        this.create_text();

        return this
    }

    move(raiting) {
        const index = raiting.indexOf('player');
        this.scene.tweens.add({
            targets: this,
            y: (index + 1) * 115 + 85,
            duration: 300
        })
        if (this.place) this.place.setText(index + 1);
    }

    create_field() {
        this.playing_field = new BotPlayingField(this.scene, this.engine, -1);
        this.playing_field.create_tiles();
        this.add(this.playing_field);
    }

    destroy_field() {
        this.playing_field.removeAll(true);
    }

    create_background() {
        let photo = 'bot_icon';
        let atlas = false;
        game_data['utils'].load_user_photo(loading_vars['user_id'], function(res){
            if (res['success'] && res['photo']) {
                atlas = game_data['users_info'][loading_vars['user_id']]['atlas'];
                photo = game_data['users_info'][loading_vars['user_id']]['photo'];
            }
        });
        if(atlas) {
            this.icon_label = new Phaser.GameObjects.Sprite(this.scene, this.x - 80, 4, atlas, photo).setScale(0.92)
        } else {
            this.icon_label = new Phaser.GameObjects.Sprite(this.scene, this.x - 80, 4, 'common1', 'competitor_bg');
        }
        this.cont = new Phaser.GameObjects.Sprite(this.scene, this.icon_label.x, this.icon_label.y, 'common1', "ava_competitor_player_new");
        this.field_label = new Phaser.GameObjects.Sprite(this.scene, this.x, 0, 'common1', 'panel_norm_bg_player');
        this.name_label = new Phaser.GameObjects.Sprite(this.scene, 150, 34, 'bot_name').setScale(1.6,1);
        this.add([this.field_label, this.name_label, this.icon_label, this.cont]);
    }

    create_text() {
        let name = 'Player';
        game_data['utils'].load_user_photo(loading_vars['user_id'], function(res){
            if (res['first_name']) {
                name = game_data['users_info'][loading_vars['user_id']]['first_name'];
            }
        });
        this.name_text = new Phaser.GameObjects.Text(this.scene, 100, 20, name, {fontFamily:"font1", fontSize: 20, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
        this.score = new Phaser.GameObjects.Text(this.scene, 185, 20, this.count, {fontFamily:"font1", fontSize: 20, color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
        this.place = new Phaser.GameObjects.Text(this.scene, 232, -50, 1, {fontFamily:"font1", fontSize: 24, color:"#f6caa0", stroke: '#000000', strokeThickness: 2});
        this.add([this.name_text, this.score, this.place]);
    }

    destroy_tile(tile) {
        const pool = this.engine.playing_field.list.filter(e => e.texture.key !== 'firework_effect');
        pool.forEach((e, i) => {
            if(e.name == tile.name) {
                const display_tile = this.playing_field.list[i];
                display_tile ? display_tile.destroy() : null;
            }
        })
    }

    destroy_elements() {
        this.list.removeAll(true);
    }

    update_score() {
        this.score.setText(this.playing_field.length);
        this.count = this.playing_field.length;
    }

    play_booster(booster) {
        const animation = new Phaser.GameObjects.Sprite(this.scene, this.icon_label.x,this.icon_label.y, 'emoji', booster).setScale(0, 0);
        this.add(animation);
        this.scene.tweens.add({
            targets: animation,
            scaleX: 1,
            scaleY: 1,
            duration: 1500,
            ease: 'quart.out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: animation,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        animation.destroy();
                    }
                });
            }
        });
    }

}