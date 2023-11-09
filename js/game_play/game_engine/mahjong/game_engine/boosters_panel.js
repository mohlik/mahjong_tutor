class BoostersPanel extends  Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.boosters_string = [
            'BOMB',
            'FIREWORK',
            'LIGHT',
            'SHUFFLE'
        ];
        this.boosters = {};
        this.boosters_amount = {};
        this.boosters_price = {};
        this.boosters_money_icon = {};
        this.x = 387.5;
        this.y = 720;
        this.state = false;
    }

    init() {
        this.state = true;
        this.create_background();

        this.booster_start = new BoosterStartEvents(this.scene, this.engine);
        this.booster_effect = new BoosterEffectEvents(this.scene, this.engine);
        this.boosters_string.forEach((texture, i) => {
            const bg = new Phaser.GameObjects.Image(this.scene, (i + 1) * 134, -70, "common1", "booster_bg_active");
            this.boosters[texture] = new BoosterItem(this.scene, (i + 1) * 134, -70, texture, this.engine, i + 1).setScale(2);
            this.boosters_amount[texture] = new Phaser.GameObjects.Text(this.scene, (i + 1) * 134 + 30, -50, '', {fontFamily:"font1", fontSize: 30, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
            const price = game_data['boosters'][`booster${i + 1}`]['price'];
            this.boosters_price[texture] = new Phaser.GameObjects.Text(this.scene, (i + 1) * 134 - 10, -20, String(price), {fontFamily:"font1", fontSize: 30, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3}).setOrigin(1, 0.5).setVisible(false);
            this.boosters_money_icon[texture] = new Phaser.GameObjects.Image(this.scene, (i + 1) * 134, -20, 'common1', 'coin').setScale(0.4,0.4).setVisible(false);
            this.add([bg, this.boosters[texture], this.boosters_amount[texture], this.boosters_price[texture], this.boosters_money_icon[texture]]);
        })
        this.booster_start.init();
        this.booster_effect.init();
    } 

    update_boosters() {
        this.boosters_string.forEach(key => {
            this.boosters[key].update_amount();
            this.boosters_amount[key].setText(this.boosters[key].amount);
            const bool = this.boosters[key].amount < 1 ? true : false;
            this.boosters_price[key].setVisible(bool);
            this.boosters_money_icon[key].setVisible(bool);
        });
    }
    
    create_background() {
        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "common1", "booster_bg").setOrigin(0, 1);
        this.add(this.background);
    }

    disable_boosters() {
        Object.keys(this.boosters).forEach(key => {
            this.boosters[key].disableInteractive();
        });
    }

    enable_boosters() {
        Object.keys(this.boosters).forEach(key => {
            this.boosters[key].setInteractive();
        });
    }

    disable_booster(booster) {
        this.boosters[booster].disableInteractive();
    }

    enable_booster(booster) {
        this.boosters[booster].setInteractive();
    }

    reboot_states() {
        this.booster_start.firework_state = true;
        this.booster_effect.highlight_state = false;
        clearInterval(this.booster_effect.highlight_interval);
    }

    update() {
        if(this.booster_start) {
            this.booster_start.update();
        }
    }
}