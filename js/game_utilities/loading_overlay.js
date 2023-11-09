var LoadingOverlay = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LoadingOverlay (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
		this.create_assets();
	},

	create_assets() {
		
		this.default_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.default_overlay.setOrigin(0,0);
		this.default_overlay.alpha = 1;
		this.add(this.default_overlay);
		this.default_overlay.setInteractive();
		this.items = [];
		var keys = ['gem_normal1', 'gem_normal2', 'gem_normal3', 'gem_normal4','gem_normal5', 'gem_normal6']
		this.num = keys.length;
		this.rot_angle = 2 * Math.PI / this.num;
		this.radius = 140;
		this.pos = 0;

		this._x = loading_vars['W']/2;
		this._y = loading_vars['H']/2;
		var i = 0;
		var gamepad = this.scene.add.image(this._x, this._y, 'common1', 'loader_gamepad');
		this.add(gamepad);
		this.circle = new Phaser.GameObjects.Container(this.scene, this._x, this._y);
		
		this.minor_loader = new Phaser.GameObjects.Container(this.scene, 0, 0);
		gamepad = this.scene.add.image(0, 0, 'common1', 'loader_gamepad');
		this.minor_loader.add(gamepad);
		this.minor_loader_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.minor_loader.add(this.minor_loader_cont);
		
		this.add(this.circle);
		
		for (i = 0; i < this.num; i++) {
			var circle =  this.scene.add.image(Math.sin(this.rot_angle * i) * this.radius //+ this._x
												,Math.cos(this.rot_angle * i) * this.radius //+ this._y
												 , 'common1', keys[i])
			circle.angle = -360 / this.num * i + 180;
			this.circle.add(circle);
			this.items.push(circle);

			var circle =  this.scene.add.image(Math.sin(this.rot_angle * i) * this.radius //+ this._x
						,Math.cos(this.rot_angle * i) * this.radius //+ this._y
						, 'common1', keys[i])
			circle.angle = -360 / this.num * i + 180;
			this.minor_loader_cont.add(circle);
		}
		
		this.playing = false;
		this.allow_anim = true;

		game_data['minor_loader'] = this.minor_loader;
		this.run_minor();
	},

	handler_timer() {
		this.pos++;
		if (this.pos >= this.num) this.pos = 0;
		var _this = this;
		game_data['scene'].tweens.add({targets:_this.circle, alpha: 0.5, duration: 50, onComplete: function(){
			_this.circle.x = Math.sin(-_this.rot_angle * _this.pos) * _this.radius + _this._x;
			_this.circle.y = Math.cos(-_this.rot_angle * _this.pos) * _this.radius + _this._y;         
			game_data['scene'].tweens.add({targets:_this.circle, alpha: 1, duration: 50});
		}});
	},

	start(alpha = 1) {
		this.default_overlay.alpha = alpha;
		if (!this.playing) {
			this.playing = true;
			this.run_anim();
		}
	},

	stop() {
		this.playing = false;
	},
	run_anim() {
		if (this.allow_anim && this.playing) {
			var _this = this;
			this.allow_anim = false;
			var i = 0;
			var _delay = 200;
			_this.circle.angle = 0;
			game_data['scene'].tweens.add({targets: this.circle, angle: 360, duration: 3000, onComplete: function(){
				_this.allow_anim = true;
				_this.run_anim();
			}});
			
		}
	},

	run_minor() {
		var _this = this;
		this.minor_loader_cont.angle = 0;
		game_data['scene'].tweens.add({targets: this.minor_loader_cont, angle: 360, duration: 3000, onComplete: function(){
			_this.run_minor();
		}});
	}

});
