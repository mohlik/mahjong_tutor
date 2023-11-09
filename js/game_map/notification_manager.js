class NotificationManager {
    constructor(_scene) {		
		this.scene = game_data['scene'];
    }
	
	init() {
		
	}

	set_notification(cont, type) {
		if (cont && (!cont.notification || (cont.notification && !cont.notification.active))) {
			var notification = this.get_notification();
			var pos = {'money_box': {x:-40, y:23, scale: 1}, 'tasks': {x:-40, y:23, scale: 1}, 
					'chest': {x: 45, y: 25, scale: 1.3}, 'chest_button':{x: 30, y: 35, scale: 1.3} }
			notification.scale = notification.scale * pos[type].scale;
			cont.notification = notification;
			cont.notification_type = type;
			notification.x = pos[type].x;
			notification.y = pos[type].y;
			cont.add(notification);
		}
	}
	remove_notification(cont) {
		if (cont && cont.notification) {
			var allow_hide = true;
			if (cont.notification_type == 'tasks') {
				allow_hide = !(game_data['task_manager'].check_tasks_completed() && game_data['user_data']['tasks']['allow_reward']);
			}
			if (allow_hide) {
				cont.notification.active = false;
				game_data['scene'].tweens.add({targets: cont.notification.icon, alpha: 0, duration: 200, onComplete: function(){}});
				setTimeout(() => {
					if (cont.notification) cont.notification.destroy();
					cont.notification = null;
				}, 300);
			}
		}
	}

	get_notification() {
		var notification = new Phaser.GameObjects.Container(this.scene, 0, 0);
		notification.icon =  new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'warning_icon');
		notification.icon.setOrigin(0.5,0.8);
		notification.add(notification.icon);
		notification.active = true;
		this.run_anim(notification);
		return notification;
	}

	run_anim(notification) {
		var _this = this;
		var mc = notification.icon;
		game_data['scene'].tweens.add({targets: mc, angle: 15, duration: 100, onComplete: function(){
			game_data['scene'].tweens.add({targets: mc, angle: -15, duration: 100, onComplete: function(){
				 game_data['scene'].tweens.add({targets: mc, angle: 12, duration: 80, onComplete: function(){
					if (notification.active) game_data['scene'].tweens.add({targets: mc, angle: -12, duration: 80, onComplete: function(){
						game_data['scene'].tweens.add({targets: mc, angle: 10, duration: 80, onComplete: function(){
							game_data['scene'].tweens.add({targets: mc, angle: 0, duration: 80});  
						}});  
					}});  
				}});  
			}});  
		}});  
		
		setTimeout(function() {if (notification.active) _this.run_anim(notification)}, 5000);
		
	}
}