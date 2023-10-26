export class Arrow extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
    }

    show(x, y, angle) {
        this.arrow = new Phaser.GameObjects.Sprite(this.scene, x,y, 'arrow').setAngle(angle);
        this.add(this.arrow);

        let newX;
        let newY;

        const distance = 30;

        if (angle < 0 || angle > 270) {
            newX = -(distance * Math.sin(angle)) * 1.5;
            newY = Math.sqrt((distance * distance) - (newX *newX));
        } else if ( angle > 0 && angle <= 90) {
            newY = (distance * Math.sin(angle));
            newX = Math.sqrt((distance * distance) - (newY *newY));
        } else if ( angle > 90 && angle <= 180) {
            newX = (distance * Math.sin(angle)) * 1.5;
            newY = -Math.sqrt((distance * distance) - (newX *newX));
        } else if ( angle > 180 && angle <= 270) {
            newX = -(distance * Math.sin(angle)) * 1.5;
            newY = -Math.sqrt((distance * distance) - (newX *newX));
        }

        console.log(newY);
        console.log(newX);

        this.scene.tweens.add({
            targets: this.arrow,
            x: x + newY,
            y: y + newX,
            yoyo: true,
            repeat: -1,
            duration: 400
        })
    }

    hide() {
        // this.arrow.destroy();
    }
}