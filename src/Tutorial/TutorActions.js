export class Actions extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.action = 0;

        this.actionsState = {
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
    }

    init() {
        this.emitter.on('ACTION', (emit) => {
            switch(emit.event) {
                case 'SELECT':
                    this.playAction(1);
                    break;
                case 'DESTROY':
                    this.playAction(10);
                    break;
                case 'FIELD':
                    this.playAction(100);
                    break;
                case 'FAIL':
                    this.playAction(1000);
            }
        })


        return this
    }

    playAction(num) {
        this.action = this.action + num;
        console.log(this.action);
        if(this.scene.level === 0){
            switch(this.action) {
                case 100:
                    this.firstAction();
                    break;
                case 101:
                    this.engine.hideOverlay();
                    this.scene.dialog.hide();
                    this.engine.arrow.hide();
                    break;
                case 121:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'WON_FIRST_ROUND'});
                    this.engine.arrow.hide();
                    this.engine.gameEvents.selectBool = true;
                    break;
                case 221:
                    this.secondAction();
                    break;
                case 222:
                    this.engine.hideOverlay();
                    this.scene.dialog.hide();
                    this.engine.arrow.hide();
                    break;
                case 282:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'WON_SECOND_ROUND'});
                    this.engine.arrow.hide();
                    this.engine.gameEvents.selectBool = true;
                case 382:
                    this.thirdAction();
                    break;
                case 383:
                    this.engine.hideOverlay();
                    this.scene.dialog.hide();
                    this.engine.arrow.hide();
                    this.engine.playing_field.list.forEach(e => {
                        e.setInteractive();
                        e.clearTint();
                    })
                    this.action = 1383;
                    break;
                case 1382:
                    this.engine.hideOverlay();
                    this.scene.dialog.hide();
                    this.engine.arrow.hide();
                    this.engine.playing_field.list.forEach(e => {
                        e.setInteractive();
                        e.clearTint();
                    })
                    break;
                case 1403:
                    this.fourthAction();
                    break;
                case 1443:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'WON_THIRD_ROUND'});
                    this.engine.arrow.hide();
                    break;
                case 2443:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'WON_THIRD_ROUND'});
                    this.engine.arrow.hide();
                    break;
            }
        } else {
            switch(this.action) {
                case 100:
                    this.fifthAction();
                    this.engine.gameEvents.firstBool = false;
                    break;
                case 101:
                    this.sixthAction();
                    break;
                case 102:
                    this.seventhAction();
                    break;
                case 103:
                    this.eighthAction();
                    break;
                case 104:
                    this.ninthAction();
                    break;
                case 105:
                    this.tenthAction();
                    this.engine.gameEvents.selectBool = true;
                    break;
                case 106:
                    this.scene.dialog.hide();
                    this.engine.hideOverlay();
                    this.engine.boosterPanel.hideOverlay();
                    this.engine.playing_field.enableTiles();
                    this.engine.boosterPanel.enableBoosters();
                    break;
                case 3100:
                    this.twelfthAction();
                    break;
                case 3110:
                    this.engine.player_display.hideOverlay();
                    this.action = 3100;
                    break;
                case 3101:
                    this.eleventhAction();
                    break;
                case 3102:
                    this.thirteenAction();
                    break;
                case 3103:
                    this.fourteenAction();
                    break;
                case 3104:
                    this.fifteenAction();
                    break;
                case 3105:
                    this.sixteenAction();
                    break;
                case 3405:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'WON_SECOND_ROUND'});
                    break;
                case 3505:
                    this.scene.dialog.hide();
                    this.seventeenAction();
                    this.emitter.once('BOT_BOOSTER_USED', (id) => {
                        this.scene.dialog.hide();
                        this.actionsState.last = false;
                        this.scene.dialog.show([
                            'Во время игры вы',
                            'можете наблюдать когда кто-то',
                            'использует бустер, тем самым', 
                            'оценивать силы противника'
                        ], 'action_19', true);
                        this.scene.dialog.move(400, id * 150 + 400);
                        this.engine.showOverlay(2);
                        this.engine.boosterPanel.disableBoosters();
                        this.engine.playing_field.disableTiles();
                        this.engine.bots.pause();
                        this.engine.bots.disableDinamic();
                        this.engine.bots.bots.forEach(e => {
                            e.speed = e.speed / 2;
                        });
                    });
                    break;
                case 3506:
                    this.engine.player_display.hideOverlay();
                    this.scene.dialog.hide();
                    this.engine.hideOverlay();
                    this.engine.boosterPanel.enableBoosters();
                    this.engine.playing_field.enableTiles();
                    this.engine.bots.play();
                    break;
            }
            
            if (this.action > 500 && this.action < 1000 && this.engine.playing_field.list.length < 2) {
                this.action = 3000;
                this.emitter.emit('LEVEL_MANAGER', {event: 'WON_FIRST_ROUND'});
                this.engine.gameEvents.selectBool = true;
                this.engine.bots.pause();
            }

            if (this.action > 3500 && this.engine.playing_field.list.length < 2) {
                this.scene.level = 0;
                this.scene.scene.start('Menu');
            }
        }
    }

    firstAction() {
        if(this.actionsState.first){
            console.log('first action');
            this.scene.dialog.show([
                'Цель игры - собрать',
                'все плитки по парно!',
                '(Нажми на одну из них)'
            ], 'action_1');
            this.engine.showOverlay(0);
            this.scene.dialog.move(722, 500);
            // this.engine.arrow.show(702, 250, 78);
            this.actionsState.first = false;
        }
    }

    secondAction() {
        if (this.actionsState.second) {
            console.log('second action');
            this.scene.dialog.show([
                'Доступные плитки -',
                'у которых полностью свободна',
                'xотя-бы одна боковая грань'
            ], 'action_2', true);
            this.scene.dialog.move(722, 600);
            // this.engine.arrow.show(500, 400, 1);
            this.engine.showOverlay(0);
            this.actionsState.second = false;
        }
    }

    thirdAction() {
        if (this.actionsState.third) {
            console.log('third action');
            this.engine.playing_field.list.forEach((e,i) => {
                if(e.name != '025' && e.name != '035') {
                    e.disableInteractive();
                    e.setTint(0x9f9f9f);
                }
            })
            this.scene.dialog.show([
                'Плитки окруженные по',
                'бокам невозможно выбрать,',
                'но их можно уничтожить',
                'с помощью бустеров',
                '(Нажми на окруженную плиту)'
            ], 'action_3', true);
            this.engine.showOverlay(0);
            this.actionsState.third = false;
        }
    }

    fourthAction() {
        console.log('fourth action');
        this.scene.dialog.show([
            'Теперь они свободны,',
            'можешь выбрать их'
        ], 'action_4', false);
    }

    fifthAction() {
        console.log('fifth action');
        this.engine.boosterPanel.init();
        this.engine.playing_field.disableTiles();
        this.scene.dialog.show([
            'Ради упрощения игры,',
            'либо для выхода из сложной',
            'ситуации вы можете ',
            'использовать бустеры!'
        ], 'action_5', true);
        this.scene.dialog.move(722, 500);
        this.engine.showOverlay(3);
        this.engine.boosterPanel.disableBoosters();
    }

    sixthAction() {
        this.engine.boosterPanel.showOverlay(6)
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.overlay);
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.boosters['BOMB']);
        this.scene.dialog.show([
            'Бустером бомы можно выбрать',
            'область радиусом в 1 плитку,',
            'в котором плитки уничтожаться',
            'в плоть до 6 пар'
        ], 'action_6', true);
    }

    seventhAction() {
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.overlay);
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.boosters['FIREWORK']);
        this.scene.dialog.show([
            'Бустер фейерверка уичтожает',
            'от 3 до 4 пар, но учтите,',
            'что уничтожает он только не',
            'накрытые сверху плитки'
        ], 'action_7', true);
    }

    eighthAction() {
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.overlay);
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.boosters['HIGHLIGHT']);
        this.scene.dialog.show([
            'Бустер лампы - подсвечивает',
            'все свободные плитки на поле',
        ], 'action_8', true);
    }

    ninthAction() {
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.overlay);
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.boosters['SHUFFLE']);
        this.scene.dialog.show([
            'Бустер перемешивание - ',
            'перемешивает все плитки по',
            'уже занятым местам на поле' 
        ], 'action_9', true);
    }

    tenthAction() {
        this.engine.boosterPanel.bringToTop(this.engine.boosterPanel.overlay);
        this.scene.dialog.show([
            'Попробуйте пройти уровень',
            'используя бустеры!'
        ], false, true);
    }

    eleventhAction() {
        this.scene.dialog.show([
            'За победу в уровне вам',
            'предстоит сойтись с',
            'соперниками по сети'
        ], 'action_10', true);
        this.scene.dialog.move(500,400);
        this.engine.banner.showOverlay(2);
        this.engine.player_display.showOverlay(10);
        this.engine.showOverlay(this.list.length);
        this.engine.playing_field.disableTiles();
        this.engine.boosterPanel.disableBoosters();
    }

    twelfthAction() {
        this.engine.banner.hideOverlay();
        this.engine.showOverlay(1);
        this.engine.bringToTop(this.engine.player_display);
        this.engine.boosterPanel.disableBoosters();
        this.engine.boosterPanel.showOverlay(6);
        this.scene.dialog.show([
            'Теперь поговорим о',
            'интерфейсе и самих',
            'турнирах'
        ], false, true);
    }

    thirteenAction () {
        this.scene.dialog.show([
            'Вы можете наблюдать за',
            'их прогрессом в',
            'реальном времени'
        ], false, true);
        this.scene.dialog.move(500,400);
    }

    fourteenAction() {
        this.scene.dialog.show([
            'Но и они видят вас,',
            'потому если они заметят',
            'что вы побеждаете, то',
            'могут ускориться'
        ], false, true);
        this.scene.dialog.move(500,200);
        this.engine.player_display.hideOverlay();
        this.engine.bots.showOverlay();
    }

    fifteenAction() {
        this.scene.dialog.show([
            'В уровнях по 3 раунда,',
            'после каждого будет ',
            'выбывать игрок с худшим',
            'результатом, в конце',
            'останется лишь 1 победитель!'
        ], false, true);
        this.scene.dialog.move(722,200);
        this.engine.player_display.showOverlay(10);
        this.engine.banner.hideOverlay();
    }

    sixteenAction() {
        this.engine.player_display.hideOverlay();
        this.engine.bots.hideOverlay();
        this.engine.hideOverlay();
        this.engine.playing_field.enableTiles();
        this.scene.dialog.show([
            'Попробуй обогнать',
            'наших тренеровочных',
            'ботов!'
        ]);
        this.scene.dialog.move(1200, 400);
        this.engine.bots.play();
    }

    seventeenAction() {
        this.engine.banner.setText('3/3');
        this.engine.boosterPanel.hideOverlay();
        this.engine.boosterPanel.enableBoosters();
        this.scene.dialog.show([
            'Финалый раунд будет',
            'и с ботами, и с бустерами',
            'но и они могут их', 
            'использовать!'
        ]);
        this.scene.dialog.move(1200, 400);
        this.engine.bots.enableDinamic();
        this.engine.bots.play();
    }
}