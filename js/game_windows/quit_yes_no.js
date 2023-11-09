var QuitYesNo = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function QuitYesNo ()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	var temp;
	var res;
	this.reduce_wait = params['reduce_wait'];
	this.level_id = params['level_id'];
	this.round = params['round'];
	this.duel = params['duel'];
	temp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common2', 'win_bg_info');
	temp.setInteractive();
	game_data['utils'].assign_to_global_missclick(temp);
	this.add(temp);

	var button_close = new CustomButton(this.scene, 230, -260, this.handler_close, 'common2', 'close1', 'close2', 'close3', this);
	this.add(button_close);

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'game_exit', 'phrase_id': '1', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, button_close.y, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.add(temp);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'game_exit', 'phrase_id': '2', 'values': [], 'base_size': 28});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -150, res['text'], { fontFamily: 'font1', fontSize: res['size'], 
				color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 560}});	
	temp.setOrigin(0.5);
	this.add(temp);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'game_exit', 'phrase_id': '5', 'values': [], 'base_size': 32});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, 190, res['text'], { fontFamily: 'font1', fontSize: res['size'], 
				color: '#FFFFFF', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: {'width': 560}});	
	temp.setOrigin(0.5);
	this.add(temp);
	
	temp = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common2', 'game_exit_icon');
	this.add(temp);

	this.button_continue = new CustomButton(this.scene, 0, 290, this.handler_quit, 'common1', 'button_big1', 'button_big2', 'button_big3', this);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'game_exit', 'phrase_id': '3', 'values': [], 'base_size': 30});		
	temp = new Phaser.GameObjects.Text(this.scene, 0, -1, res['text'], { fontFamily: 'font1', fontSize: res['size'], color: '#f6caa0', stroke: '#000000', strokeThickness: 3});			
	temp.setOrigin(0.5);
	this.button_continue.add(temp);
	this.add(this.button_continue);
	
},	

handler_quit() {
	var _this = this;
	game_data['sales_manager'].level_finished(true, _this.level_id);
	if (this.duel) game_data['utils'].update_stat({'type': 'duel_fail', 'duel_fail': true, 'level': game_data['current_level']['level_id'], 'amount_inc': 2});
	else game_data['utils'].update_stat({'level_fail': true, 'reason': 'quit', 'level': _this.level_id, 'sub_action': this.round, 'amount_inc': 2});
	game_data['game_request'].request({'tournament_failed': true, 'round': _this.round, 'level_id': _this.level_id}, function(resp){
		_this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP'});	
		_this.emitter.emit('EVENT', {'event': 'destroy_level'});
		_this.emitter.emit('EVENT', {'event': 'window_close'});
		if (!game_data['utils'].check_more_games()) game_data['utils'].check_ads('level_lost');
	});
	game_data['task_manager'].level_result({'win': false});
},

handler_close(params) {  
	this.close_window();
},

close_window(event = {}) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});	
},	
});