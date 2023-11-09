var MoreGames = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function MoreGames()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {   
	var txt;
	var i;
	this.flag = 'flag' in params ? params['flag'] : 0;
	this.all_pts = {
		1 : [{'x': 0, 'y': 0}],
		2 : [{'x': -250, 'y': 0}, {'x': 250, 'y': 0}],
		3 : [{'x': 0, 'y': -135}, {'x': 250, 'y': 185}, {'x': -250, 'y': 185}],
		4 : [{'x': -250, 'y': -135}, {'x': 250, 'y': -135}, {'x': 250, 'y': 185}, {'x': -250, 'y': 185}],
	}
	var res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'more_games', 'phrase_id': '1', 'values': [], 'base_size': 40});		
	var txt = new Phaser.GameObjects.Text(this.scene, 0, -310, res['text'], {fontFamily: 'font1', fontSize: res['size'], color: '#FBF9C9', stroke: '#000000', strokeThickness: 3});
	txt.setOrigin(0.5);
	this.add(txt);

		this.pages = [];
	this.items_per_page = 4;
	this.current_page = 0;
	this.total_items = game_data['more_games'].length;
	this.created_items = 0;
	this.max_pages = Math.ceil(this.total_items / this.items_per_page);
	
	this.has_anim = false;
	this.move_page(0);


	
},

update_arrows(new_page_no) {
	if (!this.button_prev) {
		this.button_prev = new CustomButton(this.scene, -500, 27, this.handler_prev, 'common2', 'but_arrow_out', 'but_arrow_out', 'but_arrow_down', this);
		this.button_prev.setScale(-1.5, 1.5);
		this.add(this.button_prev);
		this.button_next = new CustomButton(this.scene,  500, 27, this.handler_next, 'common2', 'but_arrow_out', 'but_arrow_out', 'but_arrow_down', this);
		this.add(this.button_next);
		this.button_next.scale = 1.5;
	}

	this.button_prev.visible = new_page_no > 0;
	this.button_next.visible = new_page_no + 1 < this.max_pages;

},

handler_prev() {
	if (this.current_page > 0) this.move_page(this.current_page - 1);
},

handler_next() {
	if (this.current_page + 1 < this.max_pages) this.move_page(this.current_page + 1);
},

move_page(new_page_no) {
	if (!this.has_anim) {
		if (new_page_no < this.max_pages && new_page_no == this.pages.length) {
			var new_page = new Phaser.GameObjects.Container(this.scene, 0, 0);
			this.add(new_page);
			new_page.visible = false;
			this.pages.push(new_page);
			setTimeout(() => {
				if (this.scene) this.create_page(new_page);
			}, 20);
			
		}
		if (new_page_no < this.pages.length) {
			var _this = this;
			this.has_anim = true;
			var page = this.pages[this.current_page];
			if (new_page_no == this.current_page) {
				page.visible = true;
				page.alpha = 1;
				this.has_anim = false;
				_this.update_arrows(new_page_no);
			}
			else game_data['scene'].tweens.add({targets: page, alpha: 0, duration: 200, onComplete: function(){
				page.visible = false;
				page = _this.pages[new_page_no];
				page.alpha = 0;
				page.visible = true;
				if (_this.scene) game_data['scene'].tweens.add({targets: page, alpha: 1, duration: 200, onComplete: function(){
					_this.current_page = new_page_no;
					_this.has_anim = false;
				}});
				_this.update_arrows(new_page_no);
			}});
			
		}
	}
	
},

create_page(page) {
	var items = [];
	var i;
	var max_pos = this.created_items + this.items_per_page;
	if (max_pos >= this.total_items) max_pos = this.total_items;
	var pts = this.all_pts[1];
	var pos = max_pos - this.created_items;
	if (pos in this.all_pts) pts = this.all_pts[pos];
	for (i = 0; i < pts.length; i++) {
		var obj = game_data['more_games'][this.created_items];
		var ad_item = this.create_ad(obj, pts[i]);
		page.add(ad_item);
		this.created_items += 1;
	}
},

create_ad(obj, pt) {
	var _this = this;
	var lang = game_data['user_data']['lang'].toUpperCase();
	var lang_corrected = lang == 'RU' ? 'ru' : 'en';
	obj['flag'] = this.flag;
	var game_id = obj['game_id'];

	var ad_holder = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);

	
	var icon_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	ad_holder.add(icon_holder);		
	var frame = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'frame');		
	ad_holder.add(frame);
	frame.setInteractive({useHandCursor: true});
		
	frame.on('pointerdown', function(){game_data['socialApi'].switch_game(obj);}, this);
	var but_play = new CustomButton(this.scene, 0, 114, function(){game_data['socialApi'].switch_game(obj);}, 
		'common1', 'button_big1', 'button_big2', 'button_big3', this, null,null,0.7);
	ad_holder.add(but_play);
	var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'game_map', 'phrase_id': '1', 'values': [], 'base_size': 30});		
	var txt = new Phaser.GameObjects.Text(this.scene, 0, -4, res['text'], {fontFamily: 'font1', fontSize: res['size'], color:"#FFFFFF",  stroke: '#000000', strokeThickness: 3});		
	txt.setOrigin(0.5);
	but_play.add(txt);
	
	var icon_url = obj['banner_url'][lang_corrected];
	var loader_id = game_data['utils'].show_loader(new Phaser.Geom.Point(0, 0), ad_holder);
	var key = game_id + '_ad' + lang_corrected;
	var loader = new Phaser.Loader.LoaderPlugin(this.scene);
	loader.image(key, icon_url + '?' + loading_vars['version']);
	loader.once('complete', function(){

		game_data['utils'].hide_loader(loader_id);
		if (_this.scene) {		
			var icon = 	new Phaser.GameObjects.Image(_this.scene, 0, 0, key);
			icon_holder.add(icon);	
		}
		loader.destroy();
	}, this);
	loader.start();	
	return ad_holder;
},

handler_close(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},


});


		
		
