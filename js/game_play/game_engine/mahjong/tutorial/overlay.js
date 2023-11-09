class Overlay extends Phaser.GameObjects.Container {
    constructor(scene, width, height) {
        super(scene);
        this.scene = scene;
        this.engine = game_data['game_engine']
        this.width = width;
        this.height = height;
        this.effects = [];
    }

    show(array) {
        if(this.overlay) this.hide();
        this.particle1 = this.scene.add.particles('common1', 'particle11');
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.8).fillRect(0, 0, this.width, this.height);
        const maskGraphics = this.scene.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        array.forEach(obj => {
            switch(obj.figure){
                case 'rect': this.create_rect_void(maskGraphics, obj, obj.stroke ? obj.stroke : false); break;
                case 'circle': this.create_circle_void(maskGraphics, obj, obj.stroke ? obj.stroke : false); break;
                case 'rounded': this.create_rounded_void(maskGraphics, obj); break;
            }
        })
        const mask = new Phaser.Display.Masks.BitmapMask(this.scene, maskGraphics);
        mask.invertAlpha = true;
        this.overlay.setMask(mask);
        this.add(this.overlay);
        this.overlay.setInteractive();
    }

    clear_effects() {
        this.effects.forEach(e => e.destroy());
    }

    clear_arrow() {
        this.engine.arrow.hide();
    }

    hide() {
        this.clear_effects();
        this.removeAll(true);
        this.clear_arrow();
    }

    create_rect_particles(path, obj) {
        const particle = this.scene.add.particles(obj.stroke[0], obj.stroke[1], {
            blendMode: 'ADD',
            lifespan: obj.lifespan ? obj.lifespan : 700,
            dalay: 700 * (path.width + path.height) / 48,
            quantity: 1,
            scale: { start: (0.0002927 * (obj.width + obj.height) + 0.2779), end: (0.0001464 * (obj.width + obj.height) + 0.18535)},
            emitZone: { type: 'edge', source: path, quantity: path.width}
        });
        this.effects.push(particle);
    }

    create_circle_particles(path, obj) {

        const particle = this.scene.add.particles(obj.stroke[0], obj.stroke[1], {
            blendMode: 'ADD',
            lifespan: obj.lifespan ? obj.lifespan : 700,
            dalay: 700 * (obj.radius * 4) / 48,
            quantity: 1,
            scale: { start: (0.0002927 * (2 * Math.PI * obj.radius) + 0.2779), end: (0.0001464 * (2 * Math.PI * obj.radius) + 0.18535) },
            emitZone: { type: 'edge', source: path, quantity: obj.radius * 2}
        });
        this.effects.push(particle);
    }

    create_circle_void(mask, obj, bool) {
        console.log('create circle mask');
        mask.fillCircle(obj.x, obj.y, obj.radius);

        const path = new Phaser.Geom.Circle(obj.x, obj.y, obj.radius);

        if (bool) this.create_circle_particles(path, obj);
    }

    create_rect_void(mask, obj, bool) {
        console.log('create rect mask');
        mask.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);

        const path = new Phaser.Geom.Rectangle(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);

        if (bool) this.create_rect_particles(path, obj);
    }

    create_rounded_void(mask, obj, bool) {
        mask.fillRoundedRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height, obj.radius);

        const path = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height)
    }

    
}