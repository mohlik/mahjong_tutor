class Arrow extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.arrows = [];
    }

    show({x, y, angle}) {
        x = x ? x : 0;
        y = y ? y : 0;
        angle = angle ? angle : 0;
        const radian = 0.0174532925;
        const path = new Phaser.Curves.Line([x, y, (x + 30 * Math.cos(angle * radian)),(y + 30 * Math.sin(angle * radian))]);
        Phaser.Geom.Line.SetToAngle(path, x, y, angle * radian + 180 * radian, 64);
        const arrow = this.scene.add.follower(path, x, y, 'common1', 'tutorial_arrow').setAngle(Phaser.Math.RadToDeg(angle * radian + 180 * radian));
        this.arrows.push(arrow)
        arrow.startFollow({
            duration: 500,
            rotateToPath: false,
            yoyo: true,
            repeat: -1
        })
        this.add(arrow);
        return this
    }

    hide() {
        this.arrows.forEach(arrow => {
            arrow.destroy();
        })
        return this
    }
}