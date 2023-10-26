export const config = (Scenes) => {
    return {
        type: Phaser.AUTO,
        width: 1444,
        height: 720,
        parent: 'phaser-example',
        pixelArt: false,
        scene: Scenes,
        scale: {
            autoCenter: Phaser.Scale.Center.CENTER_BOTH,
        }
    }
}