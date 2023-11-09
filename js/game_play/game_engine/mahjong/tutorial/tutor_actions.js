class Actions extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.action = 0;

        this.actions_state = {
            first: true,
            second: true,
            third: true,
            fourth: true,
            fifth: true,
            sixth: true,
            seventh: true,
            eighth: true,
            ninth: true,
            tenth: true,
            eleventh: true,
            twelfth: true,
            thirteen: true,
            fourteen: true,
            fifteen: true
        }

        this.overlay = engine.overlay;
        this.arrow = engine.arrow;
        this.dialog = engine.dialog;
    }

    init() {
        this.emitter.on('ACTION', (emit) => this.handler_action_events(emit));

        return this
    }

    handler_action_events(emit) {
        switch(emit.event) {
            case 'SELECT':
                this.play_action(1);
                break;
            case 'DESTROY':
                // this.play_action(10);
                break;
            case 'FIELD':
                this.play_action(100);
                break;
            case 'FAIL':
                this.play_action(1000);
                break;
            case 'BOOSTER_START':
                this.play_action(0.5);
                break;
            case 'BOOSTER_STOP':
                this.play_action(-0.5);
                break;
            case 'BOOSTER_END':
                this.play_action(10000);
                break;
        }
    }

    play_action(num) {
        this.action = this.action + num;
        console.log(this.action);
        if(this.engine.level_id === 0){
            if(this.engine.round === 0){
                switch(this.action) {
                    case 100:
                        this.first_action();
                        break;
                    case 101:
                        this.second_action();
                        this.engine.arrow.show({
                            x: 875,
                            y: 370,
                            angle: 90
                        })
                        break;
                    case 102:
                        this.engine.arrow.hide().show({
                            x: 655,
                            y: 340,
                            angle: -135
                        });
                        break;
                    case 103:
                        this.third_action();
                        this.engine.arrow.hide().show({
                            x: 900,
                            y: 340,
                            angle: -115
                        });
                        break;
                    case 104:
                        this.engine.arrow.hide().show({
                            x: 685,
                            y: 320,
                            angle: 135
                        });
                        break;
                    case 105:
                        this.fourth_action();
                        this.engine.arrow.hide().show({
                            x: 830,
                            y: 360,
                            angle: 180
                        });
                        break;
                    case 1105:
                        this.fifth_action();
                        break;
                    case 1106:
                        this.clear_action();
                        this.engine.overlay.show([
                            {x: this.engine.playing_field.x + 550 / 2 - 50, y: this.engine.playing_field.y + 520 / 2, width: 550, height: 520, figure: 'rounded', radius: 50}
                        ]);
                        break;
                    case 2105:
                        this.clear_action();
                        this.engine.overlay.show([
                            {x: this.engine.playing_field.x + 550 / 2, y: this.engine.playing_field.y + 520 / 2, width: 550, height: 520, figure: 'rounded', radius: 50}
                        ]);
                        break;
                }
            } else if (this.engine.round === 1) {
                switch(this.action) {
                    case 100:
                        this.sixth_action();
                        break;
                    case 101:
                        this.seventh_action();
                        this.engine.arrow.show({
                            x: 480,
                            y: 320,
                            angle: 180
                        });
                        this.engine.arrow.show({
                            x: 480,
                            y: 430,
                            angle: 180
                        });
                        break;
                    case 102:
                        this.eighth_action();
                        this.engine.arrow.show({
                            x: 490,
                            y: 205,
                            angle: -160
                        });
                        this.engine.arrow.show({
                            x: 490,
                            y: 355,
                            angle: 160
                        });
                        break;
                    case 103:
                        this.tenth_action();
                        break;
                    case 104:
                        this.eleventh_action();
                        break;
                    case 105:
                        this.ninth_action();
                        break;
                    case 106:
                        this.clear_action();
                        break;
                    case 1105:
                        this.clear_action();
                        break;
                }
            } else {
                switch(this.action) {
                    case 100:
                        this.twelfth_action();
                        this.engine.arrow.show({
                            x: this.engine.boosters_panel.x + 50, 
                            y: this.engine.boosters_panel.y - 150,
                            angle: 90
                        });
                        break;
                    case 100.5:
                        this.fourteen_action();
                        this.action = 101.5;
                        break;
                    case 101:
                        this.thirteen_action();
                        this.engine.arrow.show({
                            x: this.engine.boosters_panel.x + 50, 
                            y: this.engine.boosters_panel.y - 150,
                            angle: 90
                        });
                        break;
                    case 101.5:
                        this.fourteen_action();
                        break;
                    case 10101.5:
                        this.fifteen_action();
                        break;
                    case 10102.5:
                        this.clear_action();
                        break;
                    case 11101.5:
                        this.clear_action();
                        break;
                    case 10102:
                        this.clear_action();
                        break;
                }
            }
        }
    }

    clear_action() {
        this.engine.overlay.hide();
        this.engine.dialog.hide();
        this.engine.playing_field.enable_tiles();
    }

    first_action() {
        if(this.actions_state.first){
            console.log('first action');
            this.engine.dialog.show({
                x: 722,
                y: 500,
                text: [
                    "Приветствую в маджонг онлайн!",
                    "Цель игры - собрать всю пирамиду."
                ],
                image: false,
                button: true
            });
            this.engine.overlay.show([
                {x: this.engine.playing_field.x + 550 / 2 + this.engine.x, y: this.engine.playing_field.y + 520 / 2, width: 550, height: 520, figure: 'rounded', radius: 50}
            ]);
            this.engine.playing_field.disable_tiles();
            this.engine.boosters_panel.disable_boosters();
            this.actions_state.first = false;
        }
    }

    second_action() {
        if (this.actions_state.second) {
            console.log('second action');
            this.engine.dialog.show({
                x: 1000,
                y: 200,
                text: [
                    "Плитки собираются по парно,",
                    "одной масти и номинала, за",
                    "исключением масти цветов, их",
                    "номинал не имеет значения."
                ],
                image: 'action_1',
                button: false
            });
            this.engine.overlay.show([
                // {x: 722, y: 360, width: 550, height: 520, figure: 'rounded', radius: 50},
                {
                    x: this.engine.playing_field.list[12].x + this.engine.playing_field.x + this.engine.x + 2, 
                    y: this.engine.playing_field.list[12].y + this.engine.playing_field.y - 2, 

                    width: 39, height: 57, figure: 'rect', stroke: ['common1', 'particle11']
                },
                {
                    x: this.engine.playing_field.list[30].x + this.engine.playing_field.x + this.engine.x + 2, 
                    y: this.engine.playing_field.list[30].y + this.engine.playing_field.y - 2, 

                    width: 39, height: 57, figure: 'rect', stroke: ['common1', 'particle11']
                },
            ]);
            this.engine.playing_field.enable_tiles();
            this.engine.playing_field.disable_tiles_expect(['013', '0511']);
            this.actions_state.second = false;
        }
    }

    third_action() {
        if (this.actions_state.third) {
            console.log('third action');
            this.engine.dialog.show({
                x: 1000,
                y: 500,
                text: [
                    "Заблокированые плитками,",
                    "которые нельзя выбрать,",
                    "считаются те у которых заняты",
                    "обе боковые грани."
                ],
                image: 'action_2',
                button: false
            });
            this.engine.overlay.show([
                {
                    x: this.engine.playing_field.list[1].x + this.engine.playing_field.x + this.engine.x + 2, 
                    y: this.engine.playing_field.list[1].y + this.engine.playing_field.y - 2, 

                    width: 39, height: 57, figure: 'rect', stroke: ['common1', 'particle11']
                },
                {
                    x: this.engine.playing_field.list[33].x + this.engine.playing_field.x + this.engine.x + 2, 
                    y: this.engine.playing_field.list[33].y + this.engine.playing_field.y - 2, 

                    width: 39, height: 57, figure: 'rect', stroke: ['common1', 'particle11']
                },
            ]);
            this.engine.playing_field.enable_tiles();
            this.engine.playing_field.disable_tiles_expect(['045', '0011']);
            this.actions_state.third = false;
        }
    }

    fourth_action() {
        if(this.actions_state.fourth){
            console.log('fourth action');
            this.engine.dialog.show({
                x: 1000,
                y: 500,
                text: [
                    "Попробуй нажать на ",
                    "заблокированую плитку."
                ],
                image: 'action_3',
                button: false
            });
            this.engine.overlay.show([
                {
                    x: this.engine.playing_field.list[20].x + this.engine.playing_field.x + this.engine.x + 2, 
                    y: this.engine.playing_field.list[20].y + this.engine.playing_field.y - 2, 

                    width: 39, height: 57, figure: 'rect', stroke: ['common1', 'particle11']
                },
            ]);
            this.engine.playing_field.enable_tiles();
            this.engine.playing_field.disable_tiles_expect(['037']);
            this.actions_state.fourth = false;
        }
    }

    fifth_action() {
        if(this.actions_state.fifth){
            console.log('fifth action');
            this.engine.dialog.show({
                x: 1000,
                y: 500,
                text: [
                    "Теперь ты знаешь принцип игры",
                    "попробуй пройти раунд!"
                ],
                image: false,
                button: true
            });
            this.engine.overlay.show([
                {x: this.engine.playing_field.x + 550 / 2 - 50, y: this.engine.playing_field.y + 520 / 2, width: 550, height: 520, figure: 'rounded', radius: 50}
            ]);
            this.engine.playing_field.enable_tiles();
            this.actions_state.fifth = false;
        }
    }

    sixth_action() {
        if(this.actions_state.sixth){
            console.log('sixth action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Наконец поговорим о формате",
                    "турниров, в котором и будут",
                    "проходить все игры."
                ],
                image: false,
                button: true
            });
            this.engine.overlay.show([
                {x: 160, y: 315, width: 280, height: 380, radius: 50, figure: 'rounded'},
                {x: 800, y: 40, width: 200, height: 100, radius: 50, figure: 'rounded'},
            ]);
            this.engine.playing_field.disable_tiles();
            this.engine.boosters_panel.disable_boosters();
            this.engine.bots.pause();
            this.actions_state.sixth = false;
        }
    }

    seventh_action() {
        if(this.actions_state.seventh){
            console.log('seventh action');
            this.engine.dialog.show({
                x: 822,
                y: 360,
                text: [
                    "Это ваши противники, с ними",
                    "вы будете боротся за победу на ",
                    "протяжении 3 раундов, в каждом",
                    "выбывает один игрок."
                ],
                image: 'action_10',
                button: true
            });
            this.engine.overlay.show([
                {x: 160, y: 315, width: 280, height: 400, figure: 'rect', lifespan: 4690, stroke: ['common1', 'particle11']},
                {x: 800, y: 40, width: 200, height: 100, figure: 'rect', lifespan: 3500, stroke: ['common1', 'particle11']},
            ]);
            this.actions_state.seventh = false;
        }
    }

    eighth_action() {
        if(this.actions_state.eighth){
            console.log('eighth action');
            this.engine.dialog.show({
                x: 772,
                y: 290,
                text: [
                    "Цисло возле карты игрока",
                    "показывает место в раунде,",
                    "первый - получает звезду за",
                    "победу, последний - выбывает."
                ],
                image: false,
                button: true
            });
            this.engine.overlay.show([
                {x: 270, y: 165, radius: 25, figure: 'circle', lifespan: 1800, stroke: ['common1', 'particle11']},
                {x: 270, y: 395, radius: 25, figure: 'circle', lifespan: 1800, stroke: ['common1', 'particle11']},
            ]);
            this.actions_state.eighth = false;
        }
    }

    ninth_action() {
        if(this.actions_state.ninth){
            console.log('ninth action');
            !this.engine.emoji_modal.state ? this.engine.emoji_modal.toogle_modal() : null;
            this.engine.dialog.show({
                x: 1000,
                y: 500,
                text: [
                    "Теперь попробуй обогнать",
                    "своих соперников!"
                ],
                image: false,
                button: true
            });
            this.engine.overlay.hide();
            this.engine.playing_field.enable_tiles();
            this.engine.bots.play();
            this.actions_state.ninth = false;
        }
    }

    tenth_action() {
        if(this.actions_state.tenth){
            console.log('tenth action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Когда противник использует",
                    "бустер либо отправляет эмоджи",
                    "вы увидите это на его аватаре."
                ],
                image: 'action_19',
                button: true
            });
            this.engine.overlay.show([
                {x: this.engine.bots.bots_display_array[0].x - 50, y: this.engine.bots.bots_display_array[0].y, width: 90, height: 90, figure: 'rect', lifespan: 4690, stroke: ['common1', 'particle11']},
            ]);
            setTimeout(() => this.engine.bots.bots_display_array[0].play_booster('lamp'), 100);
            this.actions_state.tenth = false;
        }
    }

    eleventh_action() {
        if(this.actions_state.eleventh){
            console.log('eleventh action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Вы также можете отправлять",
                    "эмоджи, для этого нажмите на него.",
                    "(меню эмоджи всплывает при нажатии)"
                ],
                image: false,
                button: true
            });
            this.engine.emoji_modal.state ? this.engine.emoji_modal.toogle_modal() : null;
            this.engine.overlay.show([
                {x: 1120, y: 520, width: 325, height: 415, figure: 'rect', lifespan: 5500, stroke: ['common1', 'particle11']},
            ]);
            this.actions_state.eleventh = false;
        }
    }

    twelfth_action() {
        if(this.actions_state.twelfth){
            console.log('twelfth action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Твой первый бустер это бомба,",
                    "бустеры - облегчают игру и",
                    "помогают в трудных ситуациях!",
                ],
                image: 'action_5',
                button: true
            });
            this.engine.overlay.show([
                {x: this.engine.boosters_panel.x - 49, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']}
            ]);
            this.engine.playing_field.disable_tiles();
            this.engine.boosters_panel.boosters['booster1'].is_free = true;
            this.actions_state.twelfth = false;
        }
    }

    thirteen_action () {
        if(this.actions_state.thirteen){
            console.log('thirteen action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Выбери бустер нажав на него!"
                ],
                image: false,
                button: false
            });
            this.engine.overlay.show([
                {x: 722, y: 360, width: 1444, height: 720, figure: 'rect'},
                {x: this.engine.boosters_panel.x - 49, y: this.engine.boosters_panel.y + 5, radius: 45, figure: 'circle', lifespan: 1500, stroke: ['common1', 'particle11']}
            ])
            this.engine.playing_field.disable_tiles();
        }
    }

    fourteen_action() {
        if(this.actions_state.fourteen){
            console.log('fourteen action');
            this.engine.dialog.show({
                x: 1000,
                y: 500,
                text: [
                    "Отлично, теперь используй,",
                    "его на поле!" 
                ],
                image: false,
                button: false
            });
            this.engine.overlay.hide();
            this.engine.playing_field.enable_tiles();
        }
    }

    fifteen_action() {
        if(this.actions_state.fifteen){
            console.log('fifteen action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    "Поздравляю, ты закончил туториал!",
                    "Осталось лишь закончить раунд."
                ],
                image: false,
                button: true
            });
            this.engine.boosters_panel.boosters['booster1'].booster_icon.setInteractive();
            this.actions_state.fifteen = false;
        }
    }

    sixteen_action() {
        if(this.actions_state.sixteen){
            console.log('sixteen action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    //
                ],
                image: '',
                button: false
            });
            this.engine.overlay.show([

            ]);
            this.actions_state.sixteen = false;
        }
    }

    seventeen_action() {
        if(this.actions_state.seventeen){
            console.log('seventeen action');
            this.engine.dialog.show({
                x: 722,
                y: 360,
                text: [
                    //
                ],
                image: '',
                button: false
            });
            this.engine.overlay.show([

            ]);
            this.actions_state.seventeen = false;
        }
    }
}