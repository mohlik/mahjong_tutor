var LevelHelp = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelHelp (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	var logo;
	this.allow_paging = true;
	this.scale = 0.8;


	var button_close = new CustomButton(this.scene, 350, -370, this.handler_close, 'common2', 'close_big1', 'close_big2', 'close_big3', this);
	this.add(button_close);
	this.title_y = button_close.y - 10;

	this.button_continue = new CustomButton(this.scene, 0, 428, this.handler_close, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	this.add(this.button_continue);	
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '2', 'values': [], 'base_size': 50});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);

	this.button_left = new CustomButton(this.scene, -230, 424, this.handler_left, 'common2', 'but_arrow_out', 'but_arrow_out', 'but_arrow_down', this);
	this.button_left.setScale(-1.2, 1.2);
	this.button_right = new CustomButton(this.scene, 230, 424, this.handler_right, 'common2', 'but_arrow_out', 'but_arrow_out', 'but_arrow_down', this);
	this.button_right.setScale(1.2, 1.2);
	this.add(this.button_left);
	this.add(this.button_right);

	this.pages = [];
	var i = 0;
	this.current_page = 0;
	this.button_left.visible = false;
	for (i = 0; i < 4; i++) {
		temp = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.add(temp); 
		if (i > 0) temp.alpha = 0;
		this.pages.push(temp);
	}
	this.create_page0(this.pages[0]);
	this.create_page1(this.pages[1]);
	this.create_page2(this.pages[2]);
	this.create_page3(this.pages[3]);
	
},	

create_page0(cont) {
	var i = 0;
	var _this = this;
	var temp;
	var res;
	var items = [
		{'x':-88, 'y': -240, 'key': 'field_item_bg'},
		{'x': 0, 'y': -240, 'key': 'field_item_bg'},
		{'x': 88, 'y': -240, 'key': 'field_item_bg'},
		{'x':-88, 'y': -152, 'key': 'field_item_bg'},
		{'x': 0, 'y': -152, 'key': 'field_item_bg'},
		{'x': 88, 'y': -152, 'key': 'field_item_bg'},
		
		{'x':-88, 'y': -240, 'key': 'gem_normal5', 'pt1': true},
		{'x': 0, 'y': -240, 'key': 'gem_normal2'},
		{'x': 88, 'y': -240, 'key': 'gem_normal3'},
		{'x':-88, 'y': -152, 'key': 'gem_normal4', 'pt2': true},
		{'x': 0, 'y': -152, 'key': 'gem_normal5'},
		{'x': 88, 'y': -152, 'key': 'gem_normal5'},


		{'x':-88, 'y': 85, 'key': 'field_item_bg'},
		{'x': 0, 'y': 85, 'key': 'field_item_bg'},
		{'x': 88, 'y': 85, 'key': 'field_item_bg'},
		{'x':-88, 'y': 173, 'key': 'field_item_bg'},
		{'x': 0, 'y': 173, 'key': 'field_item_bg'},
		{'x': 88, 'y': 173, 'key': 'field_item_bg'},

		{'x':-88, 'y': 173, 'key': 'tile1'},
		{'x': 0, 'y': 173, 'key': 'tile1'},
		{'x': 88, 'y': 173, 'key': 'tile1'},
		
		{'x':-88, 'y': 85, 'key': 'gem_normal1', 'pt3': true},
		{'x': 0, 'y': 85, 'key': 'gem_normal2'},
		{'x': 88, 'y': 85, 'key': 'gem_normal3'},
		{'x':-88, 'y': 173, 'key': 'gem_normal4', 'pt4': true},
		{'x': 0, 'y': 173, 'key': 'gem_normal1'},
		{'x': 88, 'y': 173, 'key': 'gem_normal1'},
	]

	for (i = 0; i < items.length; i++)  {	
		temp = new Phaser.GameObjects.Image(this.scene, items[i]['x'], items[i]['y'], 'common1', items[i]['key']);
		cont.add(temp);
		if (items[i]['pt1']) this.pt1 = new Phaser.Geom.Point(items[i]['x'], items[i]['y']);
		if (items[i]['pt2']) this.pt2 = new Phaser.Geom.Point(items[i]['x'], items[i]['y']);
		if (items[i]['pt3']) this.pt3 = new Phaser.Geom.Point(items[i]['x'], items[i]['y']);
		if (items[i]['pt4']) this.pt4 = new Phaser.Geom.Point(items[i]['x'], items[i]['y']);
	}

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '1', 'values': [], 'base_size': 36});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, this.title_y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	temp.setLineSpacing(-6);
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '3', 'values': [], 'base_size': 32});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, -60, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 570}
	});			
	temp.setOrigin(0.5);
	temp.setLineSpacing(-6);
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '4', 'values': [], 'base_size': 32});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, 225, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 570}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tutorial_hand');
	temp.setOrigin(0.7,0);
	temp.alpha = 0;
	cont.add(temp);
	this.move_hand(this.pt1, this.pt2, temp);
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tutorial_hand');
	temp.setOrigin(0.7,0);
	temp.alpha = 0;
	cont.add(temp);
	setTimeout(() => {
		this.move_hand(this.pt3, this.pt4, temp);	
	}, 1200);
	
},

move_hand(pt1, pt2, mc) {
	var _this = this;
	mc.alpha = 0;
	mc.x = pt1.x;
	mc.y = pt1.y;	
	if (_this.scene) _this.scene.tweens.add({targets: mc, alpha: 1, duration: 300, onComplete: function(){
		if (_this.scene) _this.scene.tweens.add({targets: mc, x: pt2.x, y: pt2.y, duration: 500, onComplete: function(){
			if (_this.scene) _this.scene.tweens.add({targets: mc, alpha: 0, duration: 300, onComplete: function(){
				setTimeout(() => {
					if (_this.scene) _this.move_hand(pt1,pt2,mc);
				}, 1200);
			}}); 
		}}); 
	}}); 
},

create_page1(cont) {
	var temp;
	var res;

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '5', 'values': [], 'base_size': 36});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, this.title_y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	cont.add(temp);
	

	temp = new Phaser.GameObjects.Image(this.scene, -50, -270, 'common1', 'tile1');
	cont.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 50, -270, 'common1', 'tile2');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '6', 'values': [], 'base_size': 22});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, -220, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 580}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);


	temp = new Phaser.GameObjects.Image(this.scene, -50, -95, 'common1', 'box2');
	cont.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, 50, -95, 'common1', 'crest3');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '7', 'values': [], 'base_size': 22});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, -45, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 580}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);


/*
	temp = new Phaser.GameObjects.Image(this.scene, -145, 60, 'common1', 'gem_bottom3');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '8', 'values': [], 'base_size': 25});	
	temp = new Phaser.GameObjects.Text(this.scene, -145, 110, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center'
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	cont.add(temp);
*/
	temp = new Phaser.GameObjects.Image(this.scene, 0, 280, 'common1', 'spider_net1');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '9', 'values': [], 'base_size': 22});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, 320, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 570}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);



	temp = new Phaser.GameObjects.Image(this.scene, -195, 80, 'common1', 'ghost_2');
	cont.add(temp);
	temp = new Phaser.GameObjects.Image(this.scene, -95, 80, 'common1', 'spider2');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '10', 'values': [], 'base_size': 22});	
	temp = new Phaser.GameObjects.Text(this.scene, -140, 125, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 145, 80, 'common1', 'lock');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '11', 'values': [], 'base_size': 22});	
	temp = new Phaser.GameObjects.Text(this.scene, 145, 125, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);
},

create_page2(cont) {
	var temp;
	var res;
	var i;
	var t_cont;
	var items = [];

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '12', 'values': [], 'base_size': 36});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, this.title_y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	temp.setLineSpacing(-6);
	cont.add(temp);

	t_cont = new Phaser.GameObjects.Container(this.scene, 0, -290);
	cont.add(t_cont);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '15', 'values': [], 'base_size': 30});	
	temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 600}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	t_cont.add(temp);
	items = [
		{'x':-132, 'y': 110, 'key': 'gem_normal5'},
		{'x': -44, 'y': 110, 'key': 'gem_normal5'},
		{'x': 44, 'y': 110, 'key': 'gem_normal5'},	
		{'x': 132, 'y': 110, 'key': 'gem_normal5'},	
		//{'x': 0, 'y': 150, 'key': 'arrow1', 'atlas': 'common2'},	
		{'x': -235, 'y': 190, 'key': 'gem_bonus1'},	
		{'x': -235, 'y': 270, 'key': 'gem_bonus3'},	
		{'x': -235, 'y': 350, 'key': 'gem_bonus5'},	
		{'x': -235, 'y': 430, 'key': 'gem_bonus6'},	
		{'x': -235, 'y': 510, 'key': 'gem_bonus15'},	
		{'x': -235, 'y': 590, 'key': 'gem_bonus16'},	
	];
	var atlas = '';
	for (i = 0; i < items.length; i++)  {	
		atlas = 'atlas' in items[i] ? items[i]['atlas'] : 'common1';
		temp = new Phaser.GameObjects.Image(this.scene, items[i]['x'], items[i]['y'], atlas, items[i]['key']);
		t_cont.add(temp);
		let regex = items[i].key.match(/bonus\d{1,2}/g);
		if (regex) {
			res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': `${regex[0]}`, 'values': [], 'base_size': 30});	
			temp = new Phaser.GameObjects.Text(this.scene, items[i]['x'] + temp.width, items[i]['y'] - 28, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'left', stroke: '#000000', strokeThickness: 3
				,wordWrap: {'width': 800}
			});	
		t_cont.add(temp);
		window.s = temp;
		}
				
		
	}

	t_cont = new Phaser.GameObjects.Container(this.scene, 0, -60);
	cont.add(t_cont);
	// /*res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '14', 'values': [], 'base_size': 22});	
	// temp = new Phaser.GameObjects.Text(this.scene, 0, 10, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
	// 	,wordWrap: {'width': 600}
	// });			
	// temp.setOrigin(0.5,0);
	// temp.setLineSpacing(-6);
	// t_cont.add(temp);*/
	// items = [
	// 	/*{'x':-176, 'y': 80, 'key': 'gem_normal5'},
	// 	{'x': -88, 'y': 80, 'key': 'gem_normal5'},
	// 	{'x': 0, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 88, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 176, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 0, 'y': 150, 'key': 'arrow1', 'atlas': 'common2'},	*/
	// 	{'x': -235, 'y': 190, 'key': 'gem_bonus7'},	
	// 	{'x': -140, 'y': 190, 'key': 'gem_bonus8'},	
	// 	{'x': -45, 'y': 190, 'key': 'gem_bonus9'},	
	// 	{'x': 45, 'y': 190, 'key': 'gem_bonus10'},	
	// 	{'x': 140, 'y': 190, 'key': 'gem_bonus11'},	
	// 	{'x': 235, 'y': 190, 'key': 'gem_bonus12'},	
	// ];
	// var atlas = '';
	// for (i = 0; i < items.length; i++)  {	
	// 	atlas = 'atlas' in items[i] ? items[i]['atlas'] : 'common1';
	// 	temp = new Phaser.GameObjects.Image(this.scene, items[i]['x'], items[i]['y'], atlas, items[i]['key']);
	// 	t_cont.add(temp);
	// }


	// t_cont = new Phaser.GameObjects.Container(this.scene, 0, 65);
	// cont.add(t_cont);
	// /*res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '15', 'values': [], 'base_size': 22});	
	// temp = new Phaser.GameObjects.Text(this.scene, 0, 10, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
	// 	,wordWrap: {'width': 600}
	// });			
	// temp.setOrigin(0.5,0);
	// temp.setLineSpacing(-6);
	// t_cont.add(temp);*/
	// items = [
	// 	/*{'x': -220, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x':-132, 'y': 80, 'key': 'gem_normal5'},
	// 	{'x': -44, 'y': 80, 'key': 'gem_normal5'},
	// 	{'x': 44, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 132, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 220, 'y': 80, 'key': 'gem_normal5'},	
	// 	{'x': 0, 'y': 150, 'key': 'arrow1', 'atlas': 'common2'},	*/
	// 	{'x': -150, 'y': 190, 'key': 'gem_bonus13'},	
	// 	{'x': -50, 'y': 190, 'key': 'gem_bonus14'},	
	// 	{'x': 50, 'y': 190, 'key': 'gem_bonus15'},	
	// 	{'x': 150, 'y': 190, 'key': 'gem_bonus16'},		
	// ];
	// var atlas = '';
	// for (i = 0; i < items.length; i++)  {	
	// 	atlas = 'atlas' in items[i] ? items[i]['atlas'] : 'common1';
	// 	temp = new Phaser.GameObjects.Image(this.scene, items[i]['x'], items[i]['y'], atlas, items[i]['key']);
	// 	t_cont.add(temp);
	// }

},

create_page3(cont) {
	var temp;
	var res;
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '16', 'values': [], 'base_size': 36});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, this.title_y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});
	temp.setOrigin(0.5);
	temp.setLineSpacing(-6);
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '17', 'values': [], 'base_size': 24});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -260, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 580}
	});	
	temp.setOrigin(0.5);
	temp.setLineSpacing(-6);
	cont.add(temp);
	

	temp = new Phaser.GameObjects.Image(this.scene, -145, -100, 'common1', 'booster1_active');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '18', 'values': [], 'base_size': 24});	
	temp = new Phaser.GameObjects.Text(this.scene, -145, -40, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 145, -100, 'common1', 'booster2_active');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '19', 'values': [], 'base_size': 24});	
	temp = new Phaser.GameObjects.Text(this.scene, 145, -40, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, -145, 120, 'common1', 'booster4_active');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '21', 'values': [], 'base_size': 24});	
	temp = new Phaser.GameObjects.Text(this.scene, -145, 180, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);


	// temp = new Phaser.GameObjects.Image(this.scene, 145, 20, 'common1', 'booster5_active');
	// cont.add(temp);

	// res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '22', 'values': [], 'base_size': 24});	
	// temp = new Phaser.GameObjects.Text(this.scene, 145, 80, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
	// 	,wordWrap: {'width': 290}
	// });			
	// temp.setOrigin(0.5,0);
	// temp.setLineSpacing(-6);
	// cont.add(temp);

	temp = new Phaser.GameObjects.Image(this.scene, 145, 120, 'common1', 'booster6_active');
	cont.add(temp);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_help', 'phrase_id': '23', 'values': [], 'base_size': 24});	
	temp = new Phaser.GameObjects.Text(this.scene, 145, 180, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', align: 'center', stroke: '#000000', strokeThickness: 3
		,wordWrap: {'width': 290}
	});			
	temp.setOrigin(0.5,0);
	temp.setLineSpacing(-6);
	cont.add(temp);
},

handler_left() {
	if (this.current_page > 0 ) this.set_page(this.current_page - 1);
},

handler_right() {
	if (this.current_page < this.pages.length - 1) this.set_page(this.current_page + 1);
},

set_page(num) {
	game_data['error_history'].push('w_lh_'+String(num));
	if (this.allow_paging) {
		var _this = this;
		this.allow_paging = false;
		this.button_left.visible = num != 0;
		this.button_right.visible = (num != this.pages.length - 1);
		if (_this.scene) _this.scene.tweens.add({targets: _this.pages[_this.current_page], alpha: 0, duration: 200, onComplete: function(){
			if (_this.scene) _this.scene.tweens.add({targets: _this.pages[num], alpha: 1, duration: 200, onComplete: function(){
				_this.current_page = num;
				_this.allow_paging = true;
			}}); 
		}}); 
	}
},

handler_close(params) {  
	this.close_window(params);
},

close_window(params) {  
	
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});