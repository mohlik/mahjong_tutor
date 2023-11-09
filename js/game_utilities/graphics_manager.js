class GraphicsManager{
	constructor(){

	}
	
	init() {
		this.scene = game_data['scene'];
		this.emitter = new Phaser.Events.EventEmitter();
	}

	get_pos(item){
		var landscape = loading_vars['orientation'] == 'landscape';
		switch (item) {
			case 'game_engine':
                if (landscape) return new Phaser.Geom.Point(364,85);
                else return new Phaser.Geom.Point(0,330);
            case 'score_panel':
                if (landscape) return new Phaser.Geom.Point(20,125);
                else return new Phaser.Geom.Point(205,5);       
            case 'moves_panel':
                if (landscape) return new Phaser.Geom.Point(92,475);
                else return new Phaser.Geom.Point(100,250);
            case 'targets_panel':
                if (landscape) return new Phaser.Geom.Point(70,545);                    
				else return new Phaser.Geom.Point(0,250);
			case 'targets_panel_item_monster':
				if (landscape) return new Phaser.Geom.Point(40,90);                    
				else return new Phaser.Geom.Point(360,20);	

			case 'boosters_panel':
				if (landscape) return new Phaser.Geom.Point(0,580);                    
				else return new Phaser.Geom.Point(0,880);
			case 'button_options':
				if (landscape) return new Phaser.Geom.Point(950,50);                    
				else return new Phaser.Geom.Point(47,50);
			case 'button_money_map':
				if (landscape) return new Phaser.Geom.Point(950,155);                    
				else return new Phaser.Geom.Point(150,50);
			case 'button_hearts':
				if (landscape) return new Phaser.Geom.Point(950,285);                    
				else return new Phaser.Geom.Point(270,50);
			case 'button_money_box':
				if (landscape) return new Phaser.Geom.Point(950,415);                    
				else return new Phaser.Geom.Point(390,50);
			case 'options':
				if (landscape) return new Phaser.Geom.Point(loading_vars['W'] - 59, 50);                    
				else return new Phaser.Geom.Point(659, 61);
			case 'btn_invite':
				if (landscape) return new Phaser.Geom.Point(loading_vars['W'] - 225, 50);                    
				else return new Phaser.Geom.Point(659, 61);
			case 'container_play':
				if (landscape) return new Phaser.Geom.Point(685,680);                    
				else return new Phaser.Geom.Point(360, 1220);
			case 'profile':
				if (landscape) return new Phaser.Geom.Point(loading_vars['W'] - 140, 45);                    
				else return new Phaser.Geom.Point(675, 300);
			case 'chest_manager':
				if (landscape) return new Phaser.Geom.Point(loading_vars['W'] - 93,175);                    
				else return new Phaser.Geom.Point(640, 610);
			case 'rating':
				if (landscape) return new Phaser.Geom.Point(12,90);                    
				else return new Phaser.Geom.Point(15, 240);
			case 'competitors_panel':
				if (landscape) return new Phaser.Geom.Point(150,170);                    
				else return new Phaser.Geom.Point(0, 195);
			default:
				return new Phaser.Geom.Point(0,0);
			break;
		}
	}

	get_data(item) {
		var landscape = loading_vars['orientation'] == 'landscape';
		switch (item) { 
			case 'targets_panel_items_pos':
				if (landscape) return [{'x': 20, 'y': 20}, {'x': 20, 'y': 100}, {'x': 20, 'y': 180}];
				else return [{'x': 270, 'y': 0}, {'x': 440, 'y': 0}, {'x': 610, 'y': 0}];     
			case 'boosters_panel_items_pos':
				if (landscape) return [51, 208, 350, 492];
				else return [72,216,360,504,648];    
			default:
			return null;
			break;
		}            
	}
	get_score_panel_bg() {
        var orient = loading_vars['orientation'];

        if (orient == 'landscape') {
            return new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "score_panel_bg_landscape");
        }
        else
            return new Phaser.GameObjects.Image(this.scene, 0, 0, "common1", "score_panel_bg_landscape");
    }
   
	
}


