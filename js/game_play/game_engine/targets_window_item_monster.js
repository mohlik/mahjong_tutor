var TargetsWindowItemMonster = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function TargetsWindowItemMonster(scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) { 
    game_data['error_history'].push('gptwi2');
    var _this = this;  
    var item_id = params['id'];
    phrase_id = 'target_fireball_' + item_id;

    game_data['utils'].load_map_monster(item_id, function(icon) {
        if (_this.scene && icon) {
            icon.x = 150;
            icon.y = 0;
            _this.item_mc = icon;
            size = 250;        
            var size = 250;        
            var scale = Math.min(size / _this.item_mc.width, size / _this.item_mc.height);    
            _this.item_mc.scaleX = scale;
            _this.item_mc.scaleY = scale;
            _this.item_mc.setOrigin(0.5, 0.5);    
            _this.add(_this.item_mc);
        }
    })
    
   this.phrase_id = phrase_id;
   var lang = game_data['user_data']['lang'].toUpperCase();	
   var txt = game_data['language']['game_play']['level_targets'][phrase_id][lang]['text'];	
   var size = parseInt(game_data['language']['game_play']['level_targets'][phrase_id][lang]['size']);
   var description_txt = new Phaser.GameObjects.Text(this.scene, 300, 0,  txt, { fontFamily: 'font1', fontSize: 30 + size, color: '#f6caa0'});
   description_txt.setOrigin(0, 0.5);
   this.add(description_txt);
},

get_icon_mc() {
    return this.item_mc;
},

get_icon_pt() {
    return game_data['utils'].toGlobal(this, new Phaser.Geom.Point(this.item_mc.x, this.item_mc.y));
},

get_type() {
    return 'fireball';
},

dummy_function() {},

});