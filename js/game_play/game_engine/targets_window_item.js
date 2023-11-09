var TargetsWindowItem = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function TargetsWindowItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {
    game_data['error_history'].push('gptwi1');
    var bg = new Phaser.GameObjects.Image(this.scene, 0, 0, "game_map", "targets_window_item_bg");
    bg.setOrigin(0, 0.5);
    this.add(bg);

    
    //var size = Math.min(icon_holder.width, icon_holder.height);
    var size = 50;
    var scale;			


    var item_type = params['type'];
    var item_id = params['id'];


    this.amount_txt = new Phaser.GameObjects.Text(this.scene, 625, 0,  params['amount'], { fontFamily: 'font1', fontSize: 40, color: '#f6caa0'});
    this.amount_txt.setOrigin(0.5, 0.5);
    this.add(this.amount_txt);



    var phrase_id = '';
    var key = '';
    
    switch (item_type) {
        case 'normal':
            phrase_id = '1';
            key = "gem_" + item_type + item_id;
            break;
        case 'mark':
            phrase_id = 'target_mark_' + item_id;
            key = "gem_" + item_type + item_id + '_1';            
            break;
        case 'bonus':
            phrase_id = 'target_bonus_' + item_id;
            key = "gem_" + item_type + item_id;
            break;
        case 'bottom':
            phrase_id = 'target_bottom_' + item_id;
            key = "gem_" + item_type + item_id;
            break;
        case 'fireball':
            phrase_id = 'target_fireball_' + item_id;
            key = "gem_" + item_type + item_id;
            break;
        case 'tiles':
            phrase_id = 'target_tiles';
            key = "tile1";
            break;					
    }


    this.item_mc = new Phaser.GameObjects.Image(this.scene, 38, 0, "common1", key);
    var size = 60;        
    var scale = Math.min(size / this.item_mc.width, size / this.item_mc.height);    
    this.item_mc.scaleX = scale;
    this.item_mc.scaleY = scale;
    this.item_mc.setOrigin(0.5, 0.5);    
    this.add(this.item_mc);

   this.phrase_id = phrase_id;
   var lang = game_data['user_data']['lang'].toUpperCase();	
   var txt = game_data['language']['game_play']['level_targets'][phrase_id][lang]['text'];	
   var size = parseInt(game_data['language']['game_play']['level_targets'][phrase_id][lang]['size']);
   var description_txt = new Phaser.GameObjects.Text(this.scene, 90, 0,  txt, { fontFamily: 'font1', fontSize: 30 + size, color: '#f6caa0'});
   description_txt.setOrigin(0, 0.5);
   this.add(description_txt);
},

get_icon_mc() {
    return this.item_mc;
},

get_icon_pt() {
    return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.item_mc.x, this.item_mc.y));
},


get_amount_mc() {
    return this.amount_txt;
},

get_amount_pt() {
    return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.amount_txt.x, this.amount_txt.y));
    //return localToGlobal(new Point(amount_mc.x, amount_mc.y));
},

get_type() {
    return 'normal';
},

dummy_function() {},

});