var CompetitorItem = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function CompetitorItem ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
		this.create_assets();
    },


init(params) {  
	var temp;
	var _this = this;
	this.user_id = params['user_id'];
	this.is_player = this.user_id == loading_vars['user_id'];
	
	if (this.is_player) {
		this.frame_cont.removeAll(true);
		temp = new Phaser.GameObjects.Image(this.scene, 1, 1, "common1", "ava_user_frame");
		//temp.setScale(78/temp.width);
		this.frame_cont.add(temp);
	}
	if ('with_spinner' in params) { 
		if (this.user_id in game_data['users_info'] && game_data['users_info'][this.user_id] && 'first_name' in game_data['users_info'][this.user_id])
			this.first_name_txt.text = game_data['users_info'][this.user_id]['first_name'].substring(0, 12);
		if (params['with_spinner']) this.add_spinner();
	}
	if (params['with_photo']) {
		this.add_photo(function() {
			_this.show_photo();
		})
	}
	
},	

create_assets() {
	var temp;
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "competitor_bg");
	this._bg = temp;
	temp.setScale(72/temp.width);
	this.add(temp);
	
	this.first_name_txt = new Phaser.GameObjects.Text(this.scene, 0, 45, '', {fontFamily:"font1", fontSize: 16, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
	this.first_name_txt.setOrigin(0.5);
	
	this.first_name_txt.alpha = 0;
	this.photo_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.photo_cont);
	this.photo_cont.alpha = 0;
	
	this.frame_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.frame_cont);
	temp = new Phaser.GameObjects.Image(this.scene, 1, -1, "common1", "ava_frame");
	temp.setScale(76/temp.width);
	this.frame_cont.add(temp);

	this.looser_mark = new Phaser.GameObjects.Image(this.scene, -20, -20, "common2", "fail_mark");
	this.add(this.looser_mark);
	this.looser_mark.alpha = 0;
	this.star_mark = new Phaser.GameObjects.Image(this.scene, 20, -20, "common2", "1st_place_star");
	this.add(this.star_mark);
	this.star_mark.alpha = 0;
	this.add(this.first_name_txt);
	this.spinner_cont = new Phaser.GameObjects.Container(this.scene, 2, 0);
	this.spinner_cont.alpha = 0;
},

add_photo(on_complete) {
	var _this = this;
	game_data['utils'].load_user_photo(this.user_id, function(res){
		if (res['first_name'] && _this.scene && 'first_name' in game_data['users_info'][_this.user_id]) _this.first_name_txt.text = game_data['users_info'][_this.user_id]['first_name'].substring(0, 12);
		if (res['success'] && res['photo']) {
			_this.photo = res['photo'];
			var scale = 70 / _this.photo.width;
        	_this.photo.setScale(scale, scale);
			_this.photo_cont.add(_this.photo);
			_this.photo_loaded = true;
			if (_this._bg && _this._bg.destroy) _this._bg.destroy();
		}
		on_complete();	
	});
},

set_looser(with_anim = false) {
	this.looser_overlay = new Phaser.GameObjects.Image(this.scene, -game_data['dim']['photo']/2, -game_data['dim']['photo']/2,'looser_overlay');
	this.looser_overlay.setOrigin(0,0);
	this.looser_overlay.alpha = 0;
	this.photo_cont.add(this.looser_overlay);
	if (with_anim) {
		this.looser_mark.alpha = 0;
		game_data['scene'].tweens.add({targets: this.looser_mark,  alpha: 1, duration: 1000});		
		game_data['scene'].tweens.add({targets: this.looser_overlay,  alpha: 0.7, duration: 800});	
	}
	else {
		this.looser_mark.alpha = 1;
		this.looser_overlay.alpha = 0.7;
	}
},

set_winner_name() {
	this.first_name_txt.alpha = 0;
	if (this.user_id in game_data['users_info'] && 'first_name' in game_data['users_info'][this.user_id])
		this.first_name_txt.text = game_data['users_info'][this.user_id]['first_name'].substring(0, 12);
	game_data['scene'].tweens.add({targets: this.first_name_txt, alpha: 1, duration: 300});
},

set_winner(prev_win) {
	if (prev_win) this.star_mark.alpha = 1;
	else game_data['scene'].tweens.add({targets: this.star_mark,  alpha: 1, duration: 1000});
},

hide_photo() {
	this.photo_cont.alpha = 0;
	this.first_name_txt.alpha = 0;
},

show_photo(with_anim = false) {
	try {
		if (with_anim) {
			game_data['scene'].tweens.add({targets: this.photo_cont,  alpha: 1, duration: 1000});
			game_data['scene'].tweens.add({targets: this.first_name_txt,  alpha: 1, duration: 1000});
		}
		else {
			this.photo_cont.alpha = 1;
			this.first_name_txt.alpha = 1;
		}
	}
	catch(e) {

	}
	
},

add_spinner() {
	try {
		this.add(this.spinner_cont);
		this.spinner = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', Phaser.Utils.Array.GetRandom(['gem_normal1', 'gem_normal2', 'gem_normal3', 'gem_normal4','gem_normal5', 'gem_normal6']));
		this.spinner.setScale(0.9)
		this.spinner_cont.add(this.spinner);
		// this.create_spinner();
	}
	catch(e) {

	}
},


show_spinner() {
	try {
		game_data['scene'].tweens.add({targets: this.spinner_cont, alpha: 1, duration: 200});
		if (!this.tween) this.rotate_spinner(this.spinner);
	}
	catch(e) {

	}
},

rotate_spinner(item) {
	try {
		item.angle = 0;
		this.tween = game_data['scene'].tweens.add({targets: item, angle: 360, ease: 'Sine.easeInOut', delay: 0, duration: 1700, onComplete: ()=>{
			
		}});
		this.tween2 = game_data['scene'].tweens.add({targets: item, scale: 0.55, yoyo: true, duration: 820, ease: 'Sine.easeInOut', onComplete: ()=> {
			this.rotate_spinner(item);
		}})
	}
	catch(e) {

	}

},

hide_spinner() {
	try {
		if (this.tween) this.tween.stop();
		if (this.tween2) this.tween2.stop();
		game_data['scene'].tweens.add({targets: this.spinner_cont, alpha: 0, duration: 300});
	}
	catch(e) {

	}
}
});
