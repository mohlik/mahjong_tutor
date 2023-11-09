var SelectLanguage = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function SelectLanguage ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp, temp1, temp2;
	this.allow_click = true;
	this.lang = game_data['user_data']['lang'];

		var pts = [
			{'x': -320, 'y': 0, 'lang': 'en', 'handler': () => this.set_lang('en')},
			{'x': -110, 'y': 0, 'lang': 'ru', 'handler': () => this.set_lang('ru')},
			{'x': 110, 'y': 0, 'lang': 'fr', 'handler': () => this.set_lang('fr')},
			{'x': 320, 'y': 0, 'lang': 'de', 'handler': () => this.set_lang('de')},
		];

	for (var i = 0; i < pts.length; i++) {
		if (pts[i]['lang'] == this.lang) {
			temp = new Phaser.GameObjects.Container(this.scene, pts[i]['x'], pts[i]['y']);
			temp1 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'but_round4');
			temp.add(temp1);
			
		}
		else {
			temp = new CustomButton(this.scene, pts[i]['x'], pts[i]['y'], pts[i]['handler'],  'common1', 'but_round1', 'but_round2', 'but_round3', this);
			
		}
		this.add(temp);
		temp1 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'icon_'+pts[i]['lang']);
		temp.add(temp1);
		
	}
},	
set_lang(val) {
	if (this.allow_click) {
		this.allow_click = false;
		game_data['user_data']['lang'] = val;
		game_data['game_request'].request( {'select_language': true,'lang': val},function(obj) {});
		this.emitter.emit('EVENT', {'event': 'update_language'});
		game_request.update_stat({'select_language': true , 'lang': val});
		this.handler_close();
	}
},

handler_close(params) {  
	this.close_window();
},

close_window(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});