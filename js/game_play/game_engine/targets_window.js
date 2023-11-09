var TargetsWindow = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function TargetsWindow (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {
    game_data['error_history'].push('gptw1');
    this.targets = params['targets'];
    this.panel_items_pts = params['panel_items_pts'];
    this.alpha = 0;
    this.overlay = new Phaser.GameObjects.Graphics(this.scene);
    this.overlay.fillStyle(0x000000, 0.5);
    this.overlay.fillRect(-loading_vars['W']/2, -loading_vars['H'] / 2, loading_vars['W'], loading_vars['H']); 
    this.add(this.overlay);

    this.content_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.add(this.content_holder);

    this.bg = new Phaser.GameObjects.Image(this.scene, 0, 17, "game_map", "targets_window_bg");
    this.bg.setScale(loading_vars['W'] / this.bg.width, 1);
    this.bg.setOrigin(0.5, 0.5);
    this.content_holder.add(this.bg);


    this.items_holder = new Phaser.GameObjects.Container(this.scene, 30, 20);
    this.content_holder.add(this.items_holder);


    this.setInteractive(new Phaser.Geom.Rectangle(-loading_vars['W']/2, -loading_vars['H'] / 2, loading_vars['W'], loading_vars['H']), 
                        Phaser.Geom.Rectangle.Contains);

    this.on('pointerdown', this.handler_click);

  
    var i;
    var target_item;
       
    this.tutorial_removed = false;
    
    //items_holder.visible = true;
    //targets_bg.visible = true;			
    
    
    this.target_items = [];
    //fail_tasks = new Array;

    for (i = 0; i < this.targets.length; i++) {		
        if (this.targets[i]['type'] == 'fireball')	
            target_item = new TargetsWindowItemMonster(this.scene);
        else
            target_item = new TargetsWindowItem(this.scene);

        target_item.init(this.targets[i]);
        this.targets[i]['phrase_id'] = target_item.phrase_id;
        this.target_items.push(target_item);
    }
                
    this.display_targets();	
    this.scene.tweens.add({targets:this, alpha: 1, duration: 400});							   
},


get_fail_tasks() {
    /*
    return fail_tasks;
    */
},

display_targets() {  
    game_data['error_history'].push('gptw2');  
    var i;
    var target_item;
    var total = this.target_items.length;    
    var spacing = 90;
    
    
//    while (items_holder.numChildren)
//        items_holder.removeChildAt(0);



    for (i = 0; i < total; i++) {
        target_item = this.target_items[i];
        target_item.x = -this.bg.width / 2;
        target_item.y = spacing * i - (total - 1) * (spacing / 2);
        this.items_holder.add(target_item);				
    }
},

handler_click(params) {
    game_data['error_history'].push('gptw3');
    if (!this.tutorial_removed) {
        this.tutorial_removed = true;

        for (var i = 0; i < this.target_items.length; i++) {
            this.move_target_item(this.target_items[i], this.panel_items_pts[i], i == (this.target_items.length - 1));
        }
        this.hide_window();
    }
},

move_target_item(target_item, pts, is_last) {
    var _this = this;
    var icon_mc = target_item.get_icon_mc();
    

    var icon_start_pt = game_data['utils'].toLocal(this, target_item.get_icon_pt());
   


    var icon_end_pt = game_data['utils'].toLocal(this, pts['icon']);
   

    icon_mc.x = icon_start_pt.x;
    icon_mc.y = icon_start_pt.y;




    this.add(icon_mc);
    

    if (_this.scene) this.scene.tweens.add({
        targets: icon_mc,
        x: icon_end_pt.x,
        y: icon_end_pt.y,            
        duration: 500,                        
        onComplete: function () { 
            if (_this.scene) { 
                icon_mc.destroy();          
                if (is_last) {
                    _this.emitter.emit('EVENT', {'event': 'DISPLAY_TARGETS_PANEL_ITEMS'});
                    //_this.hide_window();
                }
            }
    }});      


    if (target_item.get_type() == 'normal') {
        var amount_mc = target_item.get_amount_mc();
        var text_start_pt = game_data['utils'].toLocal(this, target_item.get_amount_pt());
        var text_end_pt = game_data['utils'].toLocal(this, pts['amount']);
        amount_mc.x = text_start_pt.x;
        amount_mc.y = text_start_pt.y;
        this.add(amount_mc);

        if (_this.scene) this.scene.tweens.add({
            targets: amount_mc,
            x: text_end_pt.x,
            y: text_end_pt.y,            
            duration: 500,                        
            onComplete: function () { 
                if (_this.scene) amount_mc.destroy();                  
            }            
        }); 
    }
},

hide_window() {
    game_data['error_history'].push('gptw4');
    var _this = this;
    if (_this.scene) this.scene.tweens.add({
        targets:  this.content_holder,
        scaleY: 0.01,        
        duration: 520,                        
        onComplete: function () { 
            if (_this.scene) {
                _this.emitter.emit('EVENT', {'event': 'TARGETS_WINDOW_CLOSED'});
                _this.destroy();
            }
        }            
    });
},

dummy_function() {},

});