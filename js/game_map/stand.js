var Stand = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function Stand ()
    {
        this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);    
		this.emitter = new Phaser.Events.EventEmitter();    
	},
	
	init() {
		this.stand_header = new Phaser.GameObjects.Text(this.scene, 0, 0,  '', { fontFamily: 'font1', fontSize: 18, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center'});	
		this.stand_header.setOrigin(0.5);
		this.add(this.stand_header);

		this.stand_info = { 'coords': [{'x': 0, 'y': 67, 'y2': 35}, {'x': -71, 'y': 74, 'y2': 35}, {'x': 71, 'y': 74, 'y2': 35}],
			'items': []};
			//'week' in stand_info , week = [user1, user2, user3]
		//item , user_id
		for (var i = 0; i < 3; i++) {
			var pos = this.stand_info['coords'][i];
			var item = new Phaser.GameObjects.Container(this.scene, pos.x, pos.y);	
			this.add(item);
			item.photo_cont = new Phaser.GameObjects.Container(this.scene, 0, 0);
			item.add(item.photo_cont)
			var bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "competitor_bg");
			this._bg = bg;
			bg.setScale(( i == 0 ? 62 : 46) /bg.width);
			item.photo_cont.add(bg);
			item.photo_size = ( i == 0 ? 71 : 52)
			bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "stand_place" + String(i+1));
			item.add(bg);

			bg = new Phaser.GameObjects.Image(this.scene, 0, pos['y2'], "common1", "stand_place_add" + String(i+1));
			item.add(bg);

			item.name_txt = new Phaser.GameObjects.Text(this.scene, 0, (i == 0 ? -45 : -37),  '', { fontFamily: 'font1', fontSize: 14, color: '#FFFFFF', stroke: '#000000', strokeThickness: 3});
			item.name_txt.setOrigin(0.5);
			item.add(item.name_txt);

			item.photo = null;
			this.stand_info['items'].push(item);
		}
		
	},

	display_stand(rating_id, rating_exists = null) {
		var _this = this;
		this.displayed_stand = rating_id;
		this.update_language();
		if (rating_id in this.stand_info)  {
			this.update_stand(rating_id);
		}
		else {
			if (rating_exists && rating_exists.length) {
				_this.stand_info[rating_id] = rating_exists;
				_this.update_stand(rating_id);
			}
			else {
				game_data['utils'].get_stand(rating_id, function(rating) {
					if (rating && rating.length) {
						_this.stand_info[rating_id] = rating;
						_this.update_stand(rating_id);
					}
				});
			}
			
		}
	},
	get_bonus_stand(rating_id, on_complete) {
		var _this = this;
		if (rating_id in this.stand_info)  {
			on_complete(_this.stand_info[rating_id])
			
		}
		else {
			game_data['utils'].get_stand(rating_id, function(rating) {
				if (rating && rating.length) {
					_this.stand_info[rating_id] = rating;
					on_complete(_this.stand_info[rating_id])
				}
			});
		}
	},
	update_stand(rating_id) {
		if (this.displayed_stand == rating_id) {
			var rating = this.stand_info[rating_id];
			var items = this.stand_info['items'];
			for (var i = 0; i < items.length; i++) {
				if (items[i].photo) items[i].photo.destroy();
				//items[i].score_txt.text = '';
				items[i].name_txt.text = '';
				if (rating && rating.length && i < rating.length) {
					var user_id = rating[i]['user_id'];
					//var score = rating[i]['score'];
					var first_name = '';
					if (user_id in game_data['users_info'] && 'first_name' in game_data['users_info'][user_id]) 
						first_name = game_data['users_info'][user_id]['first_name'];
					items[i].name_txt.text = first_name.substring(0, 10);
					//items[i].score_txt.text = score;
					this.load_photo(rating_id, items[i], user_id);
				}
			}
		}
	},

	load_photo(rating_id, item, user_id) {
		var _this = this;
		game_data['utils'].load_user_photo(user_id, function(res){
			if (res['success'] && res['photo'] && _this.displayed_stand == rating_id) {
				if (res['first_name']) item.name_txt.text = game_data['users_info'][user_id]['first_name'];
				item.photo = res['photo'];
				var scale = item.photo_size / item.photo.width;
				item.photo.setScale(scale);
				item.photo_cont.add(item.photo);
				if (_this._bg) _this._bg.destroy();
			}
		});							
	},

	update_language() {
		var active_rating = game_data['rating_manager'].get_current_rating()['type'];
		var res = game_data['utils'].generate_string({'scene_id': 'game_map', 'item_id': 'left_stand', 'phrase_id': active_rating, 'values': [], 'base_size': 18});
		this.stand_header.setStyle({ fontFamily: 'font1', fontSize: res['size'], color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center'});
		this.stand_header.text = res['text'];
	}
});
