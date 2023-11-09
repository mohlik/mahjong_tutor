var GameTutorial = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GameTutorial (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
	},


init(params) {  
	var temp;
	this.particle1 = this.scene.add.particles('common1', 'particle11');
	game_data['game_tutorial'] = this;
	game_data['game_tutorial'].chest_tutorial = false;
	this.has_tutorial = false;
	this.current_step = null;
	this.click_holder = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
	this.click_holder.setOrigin(0,0);
	this.click_holder.alpha = 0.01;
	this.add(this.click_holder);
	this.click_holder.setInteractive();
	this.click_holder.on('pointerup', this.handler_click_holder, this);

	this.overlay_holder = new Phaser.GameObjects.Container(this.scene,  0, 0);
	this.add(this.overlay_holder);

	this.text_holder = new Phaser.GameObjects.Container(this.scene,  0, 0);
	this.add(this.text_holder);
	this.moving_holder = new Phaser.GameObjects.Container(this.scene,  0, 0);
	this.add(this.moving_holder);

	this.click_holder.visible = false;
	this.overlay_holder.visible = false;
	this.text_holder.visible = false;
	this.moving_holder.visible = false;

	this.desc_suff = '';

	this.story_text_holder = new Phaser.GameObjects.Container(this.scene, 0, 0); 
	this.add(this.story_text_holder);
	this.story_text_holder.visible = false;

	var init_y_shift = 210;
	this.text_size = 30;
	this.default_text_y = (init_y_shift / 2); 
	this.particles = [];


	this.text_bg = new Phaser.GameObjects.Graphics(this.scene, {x: 0, y: 400});
	this.text_bg.fillStyle(0x39352a, 0.8);
	this.text_bg.lineStyle(3, 0xe3cc69, 1);
	this.text_bg.fillRoundedRect(10, 10, 700, init_y_shift, 20);
	this.text_bg.strokeRoundedRect(10, 10, 700, init_y_shift, 20);
	// this.text_bg.generateTexture(key, 720, init_y_shift + 20);
	// this.text_bg = new Phaser.GameObjects.Image(this.scene, loading_vars['W'] / 2 - 150 + loading_vars['extra_W'] / 2, 400, 'common2', 'tutorial_text_bg'); 
	//this.text_bg.setOrigin(0.5, 0);
	this.story_text_holder.add(this.text_bg);
	var style = { fontFamily: 'font1', fontSize: 24, color: '#feea8f', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {width: 680}}
	
	this.text_label = new Phaser.GameObjects.Text(this.scene, this.text_bg.x, this.text_bg.y - 10,  '', style);
	this.text_label.setOrigin(0.5);
	this.text_label.setLineSpacing(-6);
	this.story_text_holder.add(this.text_label);

	style = {fontFamily: 'font1', fontSize: 20, color: '#22DD55', align: 'center', wordWrap:{width: 650}};
	this.text_label_next = new Phaser.GameObjects.Text(this.scene, this.text_bg.x, this.text_bg.y + this.text_bg.displayHeight/2 - 30, '', style);	
	this.text_label_next.setOrigin(0.5);
	this.story_text_holder.add(this.text_label_next);

	this.pers_x = loading_vars['W'] / 2;
	this.pers_y = loading_vars['H']// * 0.5;
},

start_tutorial(params) {
	this.story_id = null;
	this.story_complete = null;
	var lang_id = game_data['user_data']['lang'].toUpperCase();
		
	if (this.pers) this.pers.destroy();
	
	if (params['tutorial_type'] == 'learning') {
		this.type = params['tutorial_type'];
		var info = params['info'];
		this.tutorial_type = info['text_type']
		this.id = info['id'];
		
		this.texts = game_data['tutorials'][info['text_type']][info['text_id']][lang_id];
		this.steps = [];
		
		if (info['steps'] && info['steps'].length) {
			for (var i = 0; i < info['steps'].length; i++) {
				this.steps.push(info['steps'][i]);
			}
		}
		
	}
	else if (params['tutorial_type'] == 'game_map') {
		
		this.type = params['tutorial_type'];
		var info = params['info'];
		this.tutorial_type = info['text_type']
		this.id = info['id'];
		
		this.texts = game_data['tutorials'][info['text_type']][info['text_id']][lang_id];
		this.steps = [];
		
		if (info['steps'] && info['steps'].length) {
			for (var i = 0; i < info['steps'].length; i++) {
				this.steps.push(info['steps'][i]);
			}
		}

			if (game_data['tutorials']['game_map'][this.id]['pers_id']) {
 				this.overlay_alpha = 1;
				
				this.add(game_data['minor_loader']);
				game_data['minor_loader'].x = loading_vars['W']/2;
				game_data['minor_loader'].y = loading_vars['H']/2;
				game_data['minor_loader'].visible = true;
				// var item_id = -1;
				var m_scale = 1.45;
				m_scale = 0.7;

				let pers_id = parseInt(game_data['tutorials']['game_map'][this.id]['pers_id']);

					game_data['utils'].get_pers(pers_id, pers => {
						if (pers) {
							game_data['minor_loader'].visible = false;
							pers.setOrigin(0.5,1);
							pers.scale = m_scale;
							this.pers = pers;
							this.pers.x = this.pers_x;
							this.pers.y = this.pers_y;
							this.add(this.pers);
							
						}
					});

			} 
	
		}
		
		if (this.steps && this.steps.length) {
			
			this.has_tutorial = true;
			this.allow_action({'event': 'start_tutorial' });
		}
},

allow_action(obj) {
	
	
	var _this = this;
	var event = obj['event'];
	var result = false;
	var with_update = this.has_tutorial;
	
	if (!this.has_tutorial) result = true;
	if (!this.block_actions && this.has_tutorial) {
		this.block_actions = true;
		if (event == 'start_tutorial' || event == 'click_holder' || event == 'engine_tutorial') {
			
			result = true;
		}
		else if (this.current_step) {	
			// console.log('allow',event, obj['display_id'], this.current_step['type'], this.current_step['display_id'])	
			if (event == 'wait_display') game_data['block_wait_out'] = true;	
			if (this.current_step['type'] == 'hide') {
				obj['timeout'] = 1000;
				result = true;
			}
			else if ((event == 'chest') 
			&& event == this.current_step['type']) {
				if (event == 'chest' && this.steps.length > 0) obj['timeout'] = 2500;
				result = true;
			}
			else if (event == 'wait_display' && this.current_step['type'] == 'wait_display_end' && this.current_step['display_id'] == obj['display_id']) {
				obj['timeout'] = 0;
				with_update = false;
				result = true;
			}
			else if (this.current_step['type'] == 'tournament' && event == this.current_step['type']) {
				result = obj['info'] == this.current_step['info'];
			}
			else if (this.current_step['type'] == 'general' && event == this.current_step['display_id']) {
				result = true;
				if (this.current_step['info']) result = obj['info'] == this.current_step['info'];
			}
			else if (event == this.current_step['type'] && this.current_step['display_id'] == obj['display_id']) {
				if (event == 'click' || event == 'click_button' || event == 'click_task' || event == 'click_panel' || event == 'booster') 
					obj['timeout'] = 1000;
				if (event == 'wait_display_end') {
					obj['timeout'] = 500;
					game_data['block_wait_out'] = false;
				}
				result = true;
			}
			else if (this.current_step['type'] == 'hint' && event == this.current_step['type']) {
				game_data['tutorial_hint_id'] = this.current_step['display_id'];
				obj['timeout'] = 1000;
				result = true;
			}
			else if ((event == 'level' || event == 'info') && event == this.current_step['type'] && this.current_step['info'] == obj['info']) {
				result = true;
			}

		}
		// debugger

		//console.log('allow_action',event,result,game_data['tutorial_hint_id'])
		
		if (with_update && result) {
			var timeout = 'timeout' in obj ? obj['timeout'] : 10;
			
			this.hide(true, function() {
				setTimeout(() => {
					_this.update_tutorial();
					_this.show();
					_this.block_actions = false;
				}, timeout);
			})
			
			return result;
		}
		else {
			this.block_actions = false;
			return result;
		}
	}
	else return result;
},

get_particle_lines(holes) {
	
	if (holes[0].pt) {
		let strong_point = {};
		let lines = [];
		let a = holes.filter(({type}) => type === '1');
		let b = holes.filter(({type}) => type === '2');
		let b1 = holes.filter(({type}) => type === 'B1' || type === 'B2' || type === 'B3' || type === 'B4' || type === 'B6');
		let height;
		let width;
		let allow = true;
		
		let vert = holes.filter((h => h.pt.x === holes[0].pt.x));
		let hor = holes.filter((h => h.pt.y === holes[1].pt.y));
		
		// if (hor.length == 3 && vert.length == 3) debugger;
		if (b1.length) {
			allow = false;
			
			holes.forEach(h => {
				let rect = new Phaser.Geom.Rectangle(h.pt.x, h.pt.y, h.w, h.h);
	
				let delay = 700;
				let quantity = h.w;
				delay = delay * quantity/48;
	
	
				var emitter1 = this.particle1.createEmitter({            
					// frame: 'blue',
					x:  -h.w/2, y: -h.h/2,
					speed: 0,
				lifespan: 500,
				delay,
				// frequency: 0,
				quantity: 1,
				scale: { start: 0.5, end: 0.3 },
					blendMode: 'NORMAL',
					emitZone: { type: 'edge', source: rect, quantity }
				}); 
	
				this.particles.push(emitter1);
			});
			
			
			
		}
		// else if (a.length > 0 && !(hor.length === 3 && vert.length === 3)) {
		// 	let x = a[0].pt.x;
		// 	let y = a[0].pt.y;
		// 	height = a[0].h;
		// 	width = a[0].w;
		// 	for (let i = 1; i < a.length; i++) {
		// 		if (a[i].pt.x === x) strong_point['x'] =x;
		// 		else strong_point['y'] = y;
		// 		break;
		// 	}
		
		// 	let strong;
		// 	let weak;
			
		// 	if ('y' in strong_point) {
		// 		strong = 'y';
		// 		weak = 'x';
				
				
		// 		lines.push([new Phaser.Geom.Line(a[0].pt.x + width, a[0].pt.y + height, a[0].pt.x, a[0].pt.y + height), 48]);
		// 		lines.push([new Phaser.Geom.Line(a[0].pt.x , a[0].pt.y + height, a[0].pt.x, a[0].pt.y) , 48]);
		// 		lines.push([new Phaser.Geom.Line(a[0].pt.x, a[0].pt.y, a[a.length - 1].pt.x + width, a[a.length - 1].pt.y), 48, 500, 2]);
		// 		lines.push([new Phaser.Geom.Line(a[a.length - 1].pt.x + width, a[a.length - 1].pt.y, a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height), 48]);
		// 		lines.push([new Phaser.Geom.Line(a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height, b[b.length - 1].pt.x + width, a[a.length - 1].pt.y + height), 48]);
		// 		if (b[0].pt.y > a[0].pt.y) {
		// 			lines.push([new Phaser.Geom.Line(b[b.length - 1].pt.x + width, a[a.length - 1].pt.y + height, b[b.length - 1].pt.x + width, a[a.length - 1].pt.y + height * 2), 48]);
		// 			lines.push([new Phaser.Geom.Line(b[b.length - 1].pt.x + width, a[a.length - 1].pt.y + height * 2, b[b.length - 1].pt.x, a[a.length - 1].pt.y + height * 2), 48]);
		// 			lines.push([new Phaser.Geom.Line(b[b.length - 1].pt.x, a[a.length - 1].pt.y + height * 2, b[b.length - 1].pt.x, a[a.length - 1].pt.y + height), 48]);
		// 		} else {
		
		// 		}
				
				
		// 	} else {
		// 		strong = 'x';
		// 		weak = 'y';
	
		// 		if (b[0].pt.x < a[0].pt.x) {
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x, a[0].pt.y + height, a[0].pt.x, a[0].pt.y), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x, a[0].pt.y, a[0].pt.x + width, a[0].pt.y), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x + width, a[0].pt.y, a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height), 48, 500, 2]);
		// 			lines.push([new Phaser.Geom.Line(a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height, a[0].pt.x, a[a.length - 1].pt.y + height), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x, a[a.length - 1].pt.y + height, a[0].pt.x, b[b.length - 1].pt.y + height), 48]);
	
		// 			lines.push([new Phaser.Geom.Line( a[0].pt.x, b[b.length - 1].pt.y + height,  a[0].pt.x - width, b[b.length - 1].pt.y + height), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x - width, b[b.length - 1].pt.y + height, a[0].pt.x - width, b[b.length - 1].pt.y), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x - width, b[b.length - 1].pt.y, a[0].pt.x, b[b.length - 1].pt.y), 48]);
		// 		} else {
					
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x + width, a[0].pt.y + height, a[0].pt.x + width, a[0].pt.y), 48]);
		// 			lines.push([new Phaser.Geom.Line( a[0].pt.x + width, a[0].pt.y, a[0].pt.x, a[0].pt.y,), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[0].pt.x, a[0].pt.y,  a[a.length - 1].pt.x, a[a.length - 1].pt.y + height, ), 48, 500, 2]);
		// 			lines.push([new Phaser.Geom.Line(a[a.length - 1].pt.x, a[a.length - 1].pt.y + height, a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height,  ), 48]);
		// 			lines.push([new Phaser.Geom.Line(a[a.length - 1].pt.x + width, a[a.length - 1].pt.y + height,  b[b.length - 1].pt.x, b[b.length - 1].pt.y + height, ), 48]);
	
		// 			lines.push([new Phaser.Geom.Line(b[b.length - 1].pt.x, b[b.length - 1].pt.y,  b[b.length - 1].pt.x + width, b[b.length - 1].pt.y), 48]);
		// 			lines.push([new Phaser.Geom.Line( b[b.length - 1].pt.x + width, b[b.length - 1].pt.y, b[b.length - 1].pt.x + width, b[b.length - 1].pt.y + height, ), 48]);
		// 			lines.push([new Phaser.Geom.Line( b[b.length - 1].pt.x + width, b[b.length - 1].pt.y + height,  b[b.length - 1].pt.x, b[b.length - 1].pt.y + height,), 48]);
		// 			// lines.push([new Phaser.Geom.Line(a[0].pt.x + width, b[b.length - 1].pt.y + height, a[0].pt.x - width, b[b.length - 1].pt.y), 48]);
		// 			// lines.push([new Phaser.Geom.Line(a[0].pt.x - width, b[b.length - 1].pt.y, a[0].pt.x, b[b.length - 1].pt.y), 48]);
		// 		}
		// 	}
	
			
			
		// } else if (hor.length == 3 && vert.length == 3) {
		// 	let another = false;
		// 	height = vert[0].h;
		// 	width = vert[0].w;
		// 	lines.push([new Phaser.Geom.Line(vert[0].pt.x, vert[0].pt.y + height, vert[0].pt.x, vert[0].pt.y), 48]);
		// 	lines.push([new Phaser.Geom.Line(vert[0].pt.x, vert[0].pt.y, vert[0].pt.x + width, vert[0].pt.y), 48]);
		// 	lines.push([new Phaser.Geom.Line(vert[0].pt.x + width, vert[0].pt.y, vert[0].pt.x + width, vert[0].pt.y + height, ),48]);
	
		// 	lines.push([new Phaser.Geom.Line(hor[2].pt.x, hor[2].pt.y, hor[2].pt.x + width, hor[2].pt.y),48]);
		// 	lines.push([new Phaser.Geom.Line(hor[2].pt.x + width, hor[2].pt.y, hor[2].pt.x + width, hor[2].pt.y + height),48]);
	
		// 	//
		// 	lines.push([new Phaser.Geom.Line( hor[2].pt.x + width, hor[2].pt.y + height, hor[2].pt.x, hor[2].pt.y + height),48]);
		// 	lines.push([new Phaser.Geom.Line(vert[2].pt.x + width, vert[2].pt.y, vert[2].pt.x + width, vert[2].pt.y + height),48]);
		// 	lines.push([new Phaser.Geom.Line(vert[2].pt.x + width, vert[2].pt.y + height, vert[2].pt.x, vert[2].pt.y + height, ),48]);
		// 	//
			
		// 	holes.forEach(h => {
		// 		if (h.pt.x === vert[2].pt.x - width && h.pt.y === vert[2].pt.y) {
		// 			another = true;
					
		// 		};
		// 	});
		// 	if (another) {
		// 		another = false;
		// 		lines.push([new Phaser.Geom.Line(vert[2].pt.x, vert[2].pt.y + height, vert[2].pt.x - width, vert[2].pt.y + height,),48]);
		// 		lines.push([new Phaser.Geom.Line(vert[2].pt.x - width, vert[2].pt.y + height, vert[2].pt.x - width, vert[2].pt.y, ),48]);
		// 	} else {
		// 		lines.push([new Phaser.Geom.Line(vert[2].pt.x, vert[2].pt.y + height, vert[2].pt.x, vert[2].pt.y,),48]);
		// 		lines.push([new Phaser.Geom.Line(hor[0].pt.x + width, hor[0].pt.y + height, hor[0].pt.x, hor[0].pt.y + height),48]);
		// 	}
		// 	//
			
		// 	lines.push([new Phaser.Geom.Line(hor[0].pt.x, hor[0].pt.y + height, hor[0].pt.x, hor[0].pt.y),48]);
		// 	lines.push([new Phaser.Geom.Line(hor[0].pt.x, hor[0].pt.y, hor[0].pt.x + width, hor[0].pt.y, ),48]);
		// 	// lines.push([new Phaser.Geom.Line(),48]);
		// }
		// else {
				
		// 		// let quantity = 30;
		// 		height = holes[0].h;
		// 		width = holes[0].w;
		// 		if (holes[0].pt.y === holes[1].pt.y)
		// 		lines.push([new Phaser.Geom.Rectangle(holes[0].pt.x, holes[0].pt.y, holes.length * width,  height), 150, 1000, 2]);
		// 		else
		// 		lines.push([new Phaser.Geom.Rectangle(holes[0].pt.x, holes[0].pt.y, width, holes.length * height), 150, 1000, 2]);
			
		// 	}
			
		if (allow) {
			
			lines.forEach(([l, q ,lspan = 500, q2 = 1]) => {
				this.create_outline({
					width, height, 'source': l, q ,lspan , q2 
				});
				// var emitter1 = this.particle1.createEmitter({            
				// 	// frame: 'blue',
				// 	x: -width/2, y: -height/2,
				// 	speed: 0,
				// lifespan: lspan,
				// delay: 500,
				// // frequency: 0,
				// quantity: q2,
				// scale: { start: 0.5, end: 0.3 },
				// 	blendMode: 'ADD',
				// 	emitZone: { type: 'edge', source: l, quantity: q }
				// }); 
				// this.particles.push(emitter1);
			});
		}
	}
	
	
},

count_quantities(source) {
	let op;
	
	if (source.width > source.height) op = source.width;
	else op = source.height;
	let quantity = op/2;

	if (!quantity) {
		op = Math.abs(source.x1 - source.x2);
		if (op == 0) op = Math.abs(source.y1 - source.y2);

		quantity = op/2;
	}

	if (source.height > 400 || source.width > 400) quantity *= 2;
	return quantity;
},

create_outline({width, height, q2 = 1, q = 48, source, lspan = 500}) {
	let delay = 500;
	let speed = 1;
	let quantity = this.count_quantities(source);
	delay = delay * quantity/48;
	speed = speed * quantity/48;
	if (speed > 5) speed = 5;

	var emitter1 = this.particle1.createEmitter({            
		// frame: 'blue',
		x: -width/2, y: -height/2,
		speed,
	lifespan: lspan,
	delay,
	// frequency: 0,
	quantity: q2,
	scale: { start: 0.5, end: 0.3 },
		blendMode: 'NORMAL',
		emitZone: { type: 'edge', source, quantity }
	}); 
	// emitter1.particleBringToTop = false;
	this.particles.push(emitter1);
},

start_anim_arrow() {
	var _this = this;
	if (_this.arrow) {
		if (_this.scene) _this.scene.tweens.add({targets: _this.arrow, y: _this.arrow.y - 50, duration: 400, onComplete: function () { 
			if (_this.arrow && _this.scene)  _this.scene.tweens.add({targets: _this.arrow, y: _this.arrow.y + 50, duration: 400, onComplete: function () { 
				if (_this.arrow && _this.scene) _this.start_anim_arrow();
			}});   
		}});   
	}
},
get_engine_overlay(params, overlay, rt) {
	//console.log('ooo',JSON.stringify(params));
	if (this.arrow) {
		this.arrow.destroy();
		this.arrow = null;
	}
	if ('holes' in params) {
		let holes = params['holes'];
		// !!!!!!!!!
		
		this.get_particle_lines([...holes]);
	   
		for (let i = 0; i < holes.length; i++) {      
			
			//if (holes[i]['is_booster']) this.text_holder.y = this.booster_text_y;
			let pt = game_data['utils'].toLocal(this.overlay_holder, holes[i]['pt']);
			if ('rect' in holes[i] && holes[i]['rect']) {                
				var hole = holes[i];                
				var graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
				graphics.fillStyle(0x000000, 1);
				if (holes[i]['is_booster']) graphics.fillRoundedRect(-hole['w'] / 2, - hole['h'] / 2,  hole['w'],  hole['h'], 25);
				else graphics.fillRect(-hole['w'] / 2, - hole['h'] / 2,  hole['w'],  hole['h']);
				rt.erase(graphics, pt.x, pt.y);

				if (holes[i]['arrow']) {
					this.arrow = new Phaser.GameObjects.Image(game_data['scene'], pt.x, pt.y - hole['h']/2, 'common2', 'arrow1');
					if (holes[i]['arrow'] == 'top') {
						this.arrow.scaleY = -1;
						this.arrow.y += 150;
					}
					this.start_anim_arrow()
				}      
   
			} 
			 
		}
	}
	if (this.tutorial_type === 'game_play') {
		this.stop_hint()
		setTimeout(() => {
			this.highlight_gems(params['holes'])
		}, 1000)
		
	}
	// if (params['hand']) {
	// 	this.hand = this.get_tutorial_hand(params['hand']);
	// 	game_data['scene'].add.existing(this.hand);    
	// }
	if (this.arrow) overlay.add(this.arrow);
},

get_tutorial_hand(params) {
	var hand_holder = new Phaser.GameObjects.Container(this.scene);  
	var hand = new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", 'tutorial_hand'); 
	hand.setOrigin(0.8, 0);
	hand_holder.add(hand);
	this.move_tutorial_hand(hand, params['pts']);
	return hand_holder;
},

move_tutorial_hand(hand, pts) {
	var _this = this;
	var middle_points = [];
	var pt;
	var i;
	hand.alpha = 1;

	pt = game_data['utils'].toLocal(this.overlay_holder, pts[0]);
	var pt_init = new Phaser.Geom.Point(pt.x - 30, pt.y + 30);
	hand.x = pt_init.x;
	hand.y = pt_init.y;    
	middle_points.push(pt_init);
	for (i = 0; i < pts.length; i++) {
		var pt = game_data['utils'].toLocal(this.overlay_holder, pts[i]);
		middle_points.push(pt);
	}
	

	var path = new Phaser.Curves.Path(middle_points[0].x, middle_points[0].y);
	for (var i = 1; i < middle_points.length; i++)
		path.lineTo(middle_points[i].x, middle_points[i].y);
	var tweenObject = {val: 0};

	if (_this.scene) this.scene.tweens.add({targets: tweenObject, val: 1, duration: 1000, callbackScope: _this, onComplete: function(){           
		if (_this.scene) _this.scene.tweens.add({targets: hand, alpha: 0, duration: 200, onComplete: function () { 
			if (_this.scene) _this.scene.time.delayedCall(500, function(){
					if (_this.scene) _this.move_tutorial_hand(hand, pts);    
				}, [], _this);
			}});       
	},
		onUpdate: function(tween, target){                        
			var position = path.getPoint(target.val);
			hand.x = position.x;
			hand.y = position.y;
		}
	});
},

hide_particles() {
	this.particles.forEach(p => {
		if (game_data['scene'])
		game_data['scene'].tweens.add({targets: p.alpha,  counter: 0, duration: 100, onComplete: () => {
			p.remove ? p.remove() : null;
		}});
		else
		p.remove ? p.remove() : null;
	});
},

update_tutorial() {
	this.hide_particles();
	if (this.hand) {
		this.hand.destroy();
		this.hand = null;
	}
	this.particles = [];
	this.stop_hint()
	if (this.steps.length) {
		this.current_step = this.steps[0];
		var display_id = 'display_id' in this.current_step ? '_' + this.current_step['display_id'] : '';
		var info = 'type' in this.current_step ? String(this.current_step['type']) : '';
		var desc = info + display_id;
		this.steps.splice(0,1);
		
		this.click_holder.visible = 'passive' in this.current_step && this.current_step['passive'];

		if (loading_vars['new_user']) {
			if (this.id == 'level_1') {
				
				if (desc === 'competitors') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': 'learning'});
				}
				else if (desc === 'tutorial1') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
				else {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
			}
			else if (this.id == 'level_2') {
				if (desc === 'tutorial1') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': 'learning'});
				}
				
				else {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
			}
			else if (this.id == 'map3') {
				if (desc === 'rating') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': 'learning_rating'});
				}
				
				else {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
			}
			else if (this.id == 'level_3') {
				if (desc === 'tutorial1') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': 'learning'});
				}
				else if (desc === 'tutorial2') {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
				else {
					game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
				}
			}
			else {
				game_data['utils'].update_stat({'type': 'funnel', 'funnel': true, 'sub_action': 8, 'description': desc});
			}
			
		}
		if (this.current_step['type'] != 'hide') {
			
			var overlay = this.get_overlay(this.current_step);
			
			this.overlay_holder.add(overlay);
			
			if ('text' in this.current_step) {
				var texts = this.get_text(this.current_step);
				// window.a = this.text_holder;
				// this.text_holder.visible = true;
				this.text_holder.add(texts);

			}
			var moving_parts = this.get_moving_parts(this.current_step);
			this.moving_holder.add(moving_parts);
		}
		
		// if (this.tutorial_type === 'game_play') {
		// 	let params = game_data['game_play'].get_tutorial_holes(this.current_step);
		// 	this.stop_hint()
		// 	this.highlight_gems(params['holes'])
		// }
	}
	else {
		if (game_data['user_data']['tutorial'].length == 0) game_data['user_data']['tutorial'] = {};
		game_data['user_data']['tutorial'][this.id] = true;
		game_data['game_request'].request({'update_tutorial': true, 'tutorial_id': this.id}, function(){});
		this.finish_tutorial();
	}

	
},

stop_hint() {
	
	if (this.gems) {
		
		this.gems.forEach(gem => {
			gem.stop_hint()
		})
	}
},

highlight_gems(holes) {
	
	if (holes) {
		
		let field_items = game_data['game_engine']?.['playing_field']?.field_items 
		let filtered = holes.filter(({type}) => ['1', '2'].includes(type))
		let move_from = holes.find(({type}) => ['2'].includes(type))
		let move_to = holes.find(({type}) => ['3'].includes(type))
		let direction = null
		
		if (move_from && move_to) {
			move_from['pos_y']
			move_from['pos_x']
			move_to['pos_y']
			move_to['pos_x']
			if (move_to['pos_y'] > move_from['pos_y']) {
				direction = 'down'
			}
			else if (move_to['pos_y'] < move_from['pos_y']) {
				direction = 'up'
				
			}
			else if (move_to['pos_x'] < move_from['pos_x']) {
				direction = 'left'
				
			}
			else if (move_to['pos_x'] > move_from['pos_x']) {
				direction = 'right'
				
			}
			
		}
		this.gems = []
		
		filtered.forEach(({pos_x, pos_y, type}) => {
			let field_item = field_items?.[pos_y]?.[pos_x]
			if (field_item) {
				let gem = field_item.get_gem()
				if (gem) {
					this.gems.push(gem)
					gem.show_hint(type, direction, (gem.get_id() === 1 && gem.is_bonus()))
				}
			}
		})
		// this.gems.forEach(gem => gem.show_hint())
	}
	
},

handler_click_holder() {
	
	if (this.type == 'learning' || this.type == 'game_map') {
		this.allow_action({'event': 'click_holder' });
	}
	else {
		if (this.tutorial_iteration < this.tutorial_texts.length - 1) {
			this.tutorial_iteration++;        
		}
		else {
			this.finish_tutorial();
		}
	}
},

get_overlay(obj) {
	var overlay = new Phaser.GameObjects.Container(this.scene,  0, 0);
	var i;
	var holes = [];
	var hole;
	var graphics;
	var pt;
	this.overlay_alpha = ('alpha' in obj) ? obj['alpha'] : 0.8;

	var rt = new Phaser.GameObjects.RenderTexture(game_data['scene'],0, 0, loading_vars['W'], loading_vars['H']);
	rt.draw('dark_overlay', 0, 0);
	overlay.add(rt);
	
	rt.alpha = this.overlay_alpha;
	if (obj['type'] == 'info') holes = [];
	else if (obj['type'] == 'level' || obj['type'] == 'chest' || obj['type'] == 'rating' || obj['type'] == 'tasks') holes = game_data['game_map'].get_holes(obj['type']);
	else holes = game_data['game_play'].get_tutorial_holes(obj);
	
	if (holes == null) holes = [];
	 
	if ('engine_tutorial' in holes) {
		
		this.get_engine_overlay(holes, overlay, rt);
	}
	else {
		if (holes.length) obj['holes'] = holes;
		else  holes = [];
		
		for (i = 0; i < holes.length; i++) {
			hole = holes[i];
			pt = game_data['utils'].toLocal(this.overlay_holder, hole['pt']);
			graphics = new Phaser.GameObjects.Graphics(game_data['scene']);  
			graphics.fillStyle(0x000000, 1);
			if (hole['type'] == 'circle') {
				graphics.fillCircle(0, 0, hole['w']);
				let source = new Phaser.Geom.Circle(pt.x, pt.y, hole['w']);
				
				this.create_outline({width: 0, height: 0, source});
			}
			else {
				
				graphics.fillRoundedRect(-hole['w'] / 2, - hole['h'] / 2,  hole['w'],  hole['h'], 10);

				let source = new Phaser.Geom.Rectangle(pt.x - hole['w']/2, pt.y - hole['h']/2,  hole['w'],  hole['h'],);
				
				this.create_outline({width: 0, height: 0, source, q2:3, q: 48, lspan: 1000});
			}
			rt.erase(graphics, pt.x, pt.y);
		}
	}
	return overlay;
},

get_text(obj) {
	var t1 = obj['text'];
	var t2 = obj['text2'];
	var cont = new Phaser.GameObjects.Container(this.scene, t1['x'], t1['y']);
	var txt_bg;
	
	var bg_dim = {'w': 700, 'h': 160};
	
	if (t1['bg_height']) {
		bg_dim['h'] = t1['bg_height'];
	}
	if (obj['display_id'] == 'tournament') bg_dim = {'w': 450, 'h': 200};
	var key = 'tut_' + String(bg_dim['w']) + '_' + String(bg_dim['h']);
	if (!game_data['graphics'][key]) {
		txt_bg = new Phaser.GameObjects.Graphics(game_data['scene']);  
		txt_bg.fillStyle(0x39352a, 0.8);
		txt_bg.lineStyle(2, 0xe3cc69, 1);
		txt_bg.fillRoundedRect(10, 10, bg_dim['w'], bg_dim['h'], 20);
		txt_bg.strokeRoundedRect(10, 10, bg_dim['w'], bg_dim['h'], 20);
		txt_bg.generateTexture(key, bg_dim['w'] + 20, bg_dim['h'] + 20);
	}
	var t = new Phaser.GameObjects.Image(this.scene, 0, 0, key);
	if (t) {
		game_data['graphics'][key] = true;
		cont.add(t);
	}


	var style1 = { fontFamily: 'font1', fontSize: this.text_size, color: '#FFFFFF', align: 'center', wordWrap:{width: bg_dim['w'] - 10}};
	var style2 = { fontFamily: 'font1', fontSize: this.text_size-2, color: '#f6caa0', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap:{width: bg_dim['w'] - 10}};

	//var res = game_data['utils'].generate_string({'scene_id': 'game_tutorial', 'item_id': 'play', 'phrase_id': t1['id'], 'values': [], 'base_size': 26});
	var text1 = new Phaser.GameObjects.Text(this.scene, 0, 0, this.texts[t1['ind']], style1);	
	text1.setLineSpacing(-5);
	text1.setOrigin(0.5);
	
	if (t2) {
		//res = game_data['utils'].generate_string({'scene_id': 'game_tutorial', 'item_id': 'play', 'phrase_id': t2['id'], 'values': [], 'base_size': 26});
		var text2 = new Phaser.GameObjects.Text(this.scene, 0, 0,  this.texts[t2['ind']], style2);	
		text2.setOrigin(0.5,1);
		
		text1.setOrigin(0.5,0);

		text1.y = -bg_dim['h'] / 2 + 10;
		text2.y = bg_dim['h'] / 2 - 10;

		cont.add(text2);
	}
	else if (obj['type'] == 'info') {
		var style3 = { fontFamily: 'font1', fontSize: this.text_size - 5, color: '#f6caa0', align: 'center', wordWrap:{width: bg_dim['w'] - 10}}
		var res = game_data['utils'].generate_string({'scene_id': 'game_tutorial', 'item_id': 'info', 'phrase_id': '1', 'values': [], 'base_size': this.text_size - 5});
		var text3 = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], style3);	
		text3.setLineSpacing(-6);
		text3.setOrigin(0.5,1);
		text3.y = bg_dim['h'] / 2 - 10;
		text1.y -= text3.height / 2;
		cont.add(text3);
	}
	cont.add(text1);


	return cont;
},

get_moving_parts(obj) {
	var i;
	var holes = obj['holes'];
	var hole;
	var pt;
	var move_x;
	var move_y;
	var arrow_shift = 50;
	var moving = new Phaser.GameObjects.Container(this.scene,  0, 0);
	if (holes && holes.length) {
		for (i = 0; i < holes.length; i++) {
			hole = holes[i];
			if (hole['arrow']) {
				pt = game_data['utils'].toLocal(this.moving_holder, hole['pt']); 
				var arrow = new Phaser.GameObjects.Image(this.scene, pt.x, pt.y, 'common1', 'tutorial_arrow');
				if (hole['arrow_orientation'] == 'left') {
					arrow.x += hole['w']/2 + arrow.width / 2;
					move_y = 0;
					move_x = arrow_shift;
				}
				else if (hole['arrow_orientation'] == 'right') {
					arrow.angle = 180;
					arrow.x -= hole['w']/2 + arrow.width / 2;
					move_y = 0;
					move_x = -arrow_shift;
				}
				else if (hole['arrow_orientation'] == 'down') {
					arrow.angle = -90;
					arrow.y -= hole['h']/2 + arrow.width / 2;
					move_y = -arrow_shift;
					move_x = 0;
				}
				else if (hole['arrow_orientation'] == 'up') {
					arrow.angle = 90;
					arrow.y += hole['h']/2 + arrow.width / 2;
					move_y = arrow_shift;
					move_x = 0;
				}
				moving.add(arrow);
				this.move_arrow(arrow, arrow.x, arrow.y, move_x, move_y);
			}
			if (hole['hand']) {
				var hand = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'tutorial_hand');
				hand.setOrigin(0.7,0);
				var duration = hole['pt2'] ? 600 : 300;
				var pt1 =  game_data['utils'].toLocal(this.moving_holder, hole['pt']); 
				
				var pt2;
				if (hole['pt2']) {
					pt2 =  game_data['utils'].toLocal(this.moving_holder, hole['pt2']); 
				}
				else {
					pt2 = new Phaser.Geom.Point(pt1.x - 70, pt1.y + 70);
				}
				moving.add(hand);
				
				this.move_hand(hand, pt1, pt2, duration);
			}
		}
	}
	return moving;
},

move_hand(item, pt1, pt2, _duration) {
	var _this = this;
	item.alpha = 0;
	item.x = pt2.x;
	item.y = pt2.y;

	if (item) game_data['scene'].tweens.add({targets: item, alpha: 1, duration: 200});
	if (item) game_data['scene'].tweens.add({targets: item, x: pt1.x, y: pt1.y, duration: _duration, delay: 200, onComplete: function() {
		if (item) game_data['scene'].tweens.add({targets: item, alpha: 0, duration: 200, delay: 200, onComplete: function() {
			if (item) _this.move_hand(item, pt1, pt2, _duration);
		}});
	}});
},

move_arrow(item, x0, y0, mx, my) {
	var _this = this;
	if (item) game_data['scene'].tweens.add({targets: item, x: x0 + mx, y: y0 + my, duration: 500, onComplete: function() {
		if (item) game_data['scene'].tweens.add({targets: item, x: x0, y: y0, duration: 500, onComplete: function() {
			if (item) _this.move_arrow(item, x0, y0, mx, my);
		}});
	}});	
},

hide(with_anim = true, on_complete = null) {
	
	if (with_anim) {
		game_data['scene'].tweens.add({targets: this.overlay_holder,  alpha: 0, duration: 100});	
		game_data['scene'].tweens.add({targets: this.text_holder,  alpha: 0, duration: 100});	
		game_data['scene'].tweens.add({targets: this.moving_holder,  alpha: 0, duration: 100});	
		setTimeout(() => { 
			this.overlay_holder.visible = false;
			this.text_holder.visible = false;
			this.moving_holder.visible = false;
			this.overlay_holder.removeAll(true);
			this.hide_particles();
			this.moving_holder.removeAll(true);
			this.text_holder.removeAll();
			if (on_complete) on_complete(); 
		}, 100);
	}
	else {
		this.overlay_holder.visible = false;
		this.text_holder.visible = false;
		this.moving_holder.visible = false;
		this.overlay_holder.removeAll(true);
		this.hide_particles();
		this.moving_holder.removeAll(true);
		this.text_holder.removeAll();
		if (on_complete) on_complete(); 
	}
},

show(with_anim = true, on_complete = null) {
	
	if (with_anim) {
		game_data['scene'].tweens.add({targets: this.overlay_holder,  alpha: 1, duration: 100});	
		game_data['scene'].tweens.add({targets: this.text_holder,  alpha: 1, duration: 100});	
		game_data['scene'].tweens.add({targets: this.moving_holder,  alpha: 1, duration: 100});	
		setTimeout(() => { 
			this.overlay_holder.visible = true;
			this.text_holder.visible = true;
			this.moving_holder.visible = true;
			if (on_complete) on_complete(); 
		}, 100);
	}
	else {
		this.overlay_holder.visible = true;
		this.text_holder.visible = true;
		this.moving_holder.visible = true;
		if (on_complete) on_complete(); 
	}
},

finish_tutorial() {
	setTimeout(() => {
		this.stop_hint()
	}, 20)
	game_data['tutorial_mark'] = -1;
	game_data['minor_loader'].visible = false;
	if (this.pers) this.pers.destroy();
	this.has_tutorial = false;
	this.text_label.text = '';
	this.current_step = null;
	this.click_holder.visible = false;
	this.overlay_holder.visible = false;
	this.text_holder.visible = false;
	this.moving_holder.visible = false;
	this.overlay_holder.removeAll(true);
	this.moving_holder.removeAll(true);
	this.text_holder.removeAll();
	this.hide_particles();
	if (game_data['game_tutorial'].chest_tutorial) {
		setTimeout(() => {
			game_data['game_map'].hide_rating_chest(true);	
		}, 1000);
	} 
	game_data['game_tutorial'].chest_tutorial = false;
	this.emitter.emit('EVENT', {'event': 'tutorial_finished'});
}

});