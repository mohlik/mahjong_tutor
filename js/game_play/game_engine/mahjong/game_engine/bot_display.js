class BotDisplay extends Phaser.GameObjects.Container {
    constructor(scene, engine, x, y, index, id, count) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.x = x;
        this.y = y;
        this.index = index;
        this.id = id;
        this.index = index;
        this.count = count;
        this.raiting_place = `bot_${index + 1}`;
    }

    init() { 
        this.create_background();
        this.create_field();
        this.create_text();
        return this
    }

    move(raiting) {
        const index = raiting.indexOf(`bot_${this.index + 1}`);
        this.scene.tweens.add({
            targets: this,
            y: (index + 1) * 115 + 85,
            duration: 300
        })
        if (this.place) this.place.setText(index + 1);
    }

    create_field() {
        if(this.playing_field) this.playing_field.destroy();
        this.playing_field = new BotPlayingField(this.scene, this.engine, this.index);
        this.playing_field.create_tiles();
        this.add(this.playing_field);
    }

    destroy_field() {
        this.playing_field.removeAll(true);
    }

    create_background() {
        const _this = this;
        game_data['utils'].load_user_photo(this.id, function(res){
            if (res['success'] && res['photo']) {
                _this.icon_label = new Phaser.GameObjects.Sprite(_this.scene, _this.x - 80, 4, game_data['users_info'][_this.id]['atlas'], game_data['users_info'][_this.id]['photo']).setScale(0.92);
            } else {
                _this.icon_label = new Phaser.GameObjects.Sprite(_this.scene, _this.x - 80, 4, 'common1', 'competitor_bg');
            }
        });
        this.cont = new Phaser.GameObjects.Sprite(this.scene, this.icon_label.x, this.icon_label.y, 'common1', "ava_competitor_new");
        this.field_label = new Phaser.GameObjects.Sprite(this.scene, this.x, 0, 'common1', 'panel_norm_bg');  // 'common1', 'panel_norm_bg_player'
        this.name_label = new Phaser.GameObjects.Sprite(this.scene, 150, 34, 'bot_name').setScale(1.6,1);
        this.add([this.field_label, this.name_label, this.icon_label, this.cont]);
    }

    create_text() {
        const _this = this
        let name = this.engine.bots.bots[this.index];
        game_data['utils'].load_user_photo(this.id, function(res){
            if (res['first_name']) {
                _this.name_text = new Phaser.GameObjects.Text(_this.scene, 100, 20, game_data['users_info'][_this.id]['first_name'], {fontFamily:"font1", fontSize: 20, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
                _this.engine.bots.bots.find(e => e.id === _this.id).name = game_data['users_info'][_this.id]['first_name'];
            } else {
                _this.name_text = new Phaser.GameObjects.Text(_this.scene, 100, 20, name, {fontFamily:"font1", fontSize: 20, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
            }
        });
        this.score = new Phaser.GameObjects.Text(this.scene, 185, 20, this.count, {fontFamily:"font1", fontSize: 20, color:"#f6caa0", stroke: '#000000', strokeThickness: 3});
        this.place = new Phaser.GameObjects.Text(this.scene, 232, -50, this.index + 2, {fontFamily:"font1", fontSize: 24, color:"#f6caa0", stroke: '#000000', strokeThickness: 2});
        this.add([this.name_text, this.score, this.place]);
    }

    destroy_random_tiles(num) {
        num ? num = num : num = 1;

        for(let i = 0; i < num; i++){
            const tile = Phaser.Utils.Array.GetRandom(this.playing_field.get_free_tiles());
            if(tile) {
                tile.destroy();
            }
        }
    }

    update_score(str, update_bool) {
        str = str < 0 ? 0 : str;
        if(this.score) this.score.setText(str);
        this.count = str;
        this.engine.bots.bots.find(e => e.id === this.id).count = str;
        this.engine.bots.update(update_bool);
    }

    play_booster(booster) {
        const animation = new Phaser.GameObjects.Sprite(this.scene, this.icon_label.x,this.icon_label.y, booster).setScale(0, 0);
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