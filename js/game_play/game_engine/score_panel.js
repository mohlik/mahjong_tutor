var ScorePanel = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,   

    initialize:

    function ScorePanel (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

    init(params) {			            
        this.moving_holder = params['moving_holder'];
        this.rating_sprite = params['rating_sprite'];
        this.avatar_pos = game_data['graphics_manager'].get_avatar_pos();
        //this.avatar_pos = {'min': 270, 'max': 30};
        this.rating_sprite_y = this.rating_sprite.y;
        this.star_labels = [];
        this.avatar_labels = [];
        var pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 0));
        this.rating_sprite.x = pt.x;
        this.rating_sprite.y = pt.y;

        var bg = game_data['graphics_manager'].get_score_panel_bg();

        bg.setOrigin(0, 0);		
        this.add(bg);  


        var score_bg = new Phaser.GameObjects.Image(this.scene, bg.width - 76, 24, "game_map", "score_bg");    
        score_bg.setScale(0.6,0.6)    
        this.add(score_bg);

        this.score_txt = new Phaser.GameObjects.Text(this.scene, bg.width / 2, 0,  '---', { fontFamily: 'font1', fontSize: 30, color: '#f6caa0',  stroke: '#000000', strokeThickness: 2});
        this.score_txt.setOrigin(0.5, 0.5);
        this.score_txt.x = score_bg.x;
        this.score_txt.y = score_bg.y + 3;
        this.add(this.score_txt);




        this.avatar = new Phaser.GameObjects.Container(this.scene, 0, 0);        

        var avatar_pic = new Phaser.GameObjects.Image(this.scene, 0, -20, "game_map", "avatar");        
        avatar_pic.setOrigin(1, 0.5);
        avatar_pic.setScale(0.6);
        this.avatar.add(avatar_pic);
       
        this.block_new_score = false;
        this.avatar_dx = 1;
        this.avatar_dy = 1;
        this.after_show = false;
        this.after_show_dy = 4;
        this.after_show_dx = 4;

        this.scale_size = 5;
        this.pos_x = 75;
        this.pos_y = 78;

        if (loading_vars['orientation'] == 'landscape') {
            this.alpha = 0;
            this.rating_sprite.alpha = 0;
        } 
    },

    update() {
        var orient = loading_vars['orientation'];
        if (orient == 'landscape') {
            var dy = this.after_show ? this.after_show_dy : this.avatar_dy;
            if (this.target_avatar_pos < this.avatar.y)
                this.avatar.y = Math.max( this.avatar.y - dy, this.target_avatar_pos);
            
            if (this.avatar.y + this.rating_sprite.y < this.avatar_pos['min'] + 50)
                this.rating_sprite.y += dy;    
        }
        else {
            var dx = this.after_show ? this.after_show_dx : this.avatar_dx;
            if (this.target_avatar_pos > this.avatar.x)
                this.avatar.x = Math.min( this.avatar.x + dx, this.target_avatar_pos);
            
            if (this.avatar.x + this.rating_sprite.x > this.avatar_pos['max'])
                this.rating_sprite.x -= dx;    

        }


    },

    update_panel(params) {
        game_data['error_history'].push('gpsp1');
        var orient = loading_vars['orientation'];
        if (orient == 'landscape') {
            this.alpha = 0;
            this.rating_sprite.alpha = 0;
        } 
        var pt = game_data['utils'].toGlobal(this, new Phaser.Geom.Point(0, 0));
        this.rating_sprite.x = pt.x;
        this.rating_sprite.y = pt.y;

        this.level_id = params['level_id'];
        this.level = game_data['levels'][this.level_id];
        this.targets = params['targets'];
        this.after_show = false;
        this.block_new_score = false;
        
        
        this.stars_score = this.get_stars_score();
        this.score = 0;
        this.current_stars = 0;
         

        this.target_avatar_pos = this.avatar_pos['min'];
        if (orient == 'landscape') {
            this.avatar.x = pt.x + 48;
            this.avatar.y = this.target_avatar_pos;
        }
        else {
            this.avatar.x = this.target_avatar_pos;
            this.avatar.y = pt.y + 55;    
        }
        this.rating_sprite.add(this.avatar);

        //this.target_avatar_pos = this.avatar_pos['min'];
        //this.avatar.y =  this.avatar_pos['min'];



        this.show_score_line();
        this.show_score_labels();
        this.show_score_stars();
        this.update_language();
        this.update_score({'score': 0});


        // CREATING RATING MASK
        var rating_mask = new Phaser.GameObjects.Graphics(this.scene);
        rating_mask.fillStyle(0xffffff, 1);
        var start_pt = game_data['utils'].toGlobal(this.rating_sprite, new Phaser.Geom.Point(0, 0));
        if (orient == 'landscape')
            rating_mask.fillRect(start_pt.x + 5, start_pt.y + 40, 150, 250);
        else
            rating_mask.fillRect(start_pt.x + 5, start_pt.y, start_pt.x + 185, start_pt.y + 100);
       // this.add(rating_mask)
        var mask = new Phaser.Display.Masks.GeometryMask(this.scene, rating_mask);    
        this.rating_sprite.setMask(mask);
        this.avatar_labels = [];

    },

    update_language() {
        var lang = game_data['user_data']['lang'].toUpperCase();	
        this.score_prefix = game_data['language']['game_play']['score_manager']['1'][lang]['text'];	 
        this.update_score({'score': 0});
    },

    show_score_line() {
        var orient = loading_vars['orientation'];
        var graphics = new Phaser.GameObjects.Graphics(this.scene, 0, 0);        
        graphics.lineStyle(4, 0xcca262, 1);
        var max_amount =  500 * (50 + 1);

        if (orient == 'landscape') {
            var max_y = this.avatar_pos['min'] - max_amount / this.scale_size;
            graphics.lineBetween(this.pos_x, 300, this.pos_x, max_y);
        }
        else {
            var max_x = this.avatar_pos['min'] + max_amount / this.scale_size;
            graphics.lineBetween(5, this.pos_y, max_x, this.pos_y);    
        }

        this.rating_sprite.add(graphics);
    },

    show_score_stars() {        
        var orient = loading_vars['orientation'];
        var star;
        var i;        
        var amount;        
        this.star_labels = [];
        
//console.log('stars_score', this.stars_score);

        for (i = 0; i < 3; i++) {
            star = new Phaser.GameObjects.Image(this.scene, 0, 0, "game_map", "score_star");        
            amount =  this.stars_score[i];
            
            if (orient == 'landscape') {
                star.x = this.pos_x;
                star.y = this.avatar_pos['min'] - amount / this.scale_size;
            }
            else {
                star.x = this.avatar_pos['min'] + amount / this.scale_size;
                star.y = this.pos_y - 20;	    
            }
            
            star.setScale(0.5,0.5)			
            this.rating_sprite.add(star);
            this.star_labels.push({'mc': star, 
                                   'amount': amount, 
                                   'achieved': false, 
                                   'num': i});
        }
    },


    show_score_labels() {
        var orient = loading_vars['orientation'];
        var i;
        var score_label;
        var amount;	
        var graphics;
        var pos_x;
        var pos_y;
        

        for (i = 0; i < 50; i++) {            
            amount =  500 * i;

            if (orient == 'landscape') {
                pos_y = this.avatar_pos['min'] - amount / this.scale_size;
                score_label = new Phaser.GameObjects.Text(this.scene, this.pos_x + 10, pos_y,  amount, { fontFamily: 'font1', fontSize: 20, color: '#f6caa0', stroke: '#07404e', strokeThickness: 1});
                score_label.setOrigin(0, 0.5);
            }
            else {
                pos_x = this.avatar_pos['min'] + amount / this.scale_size;
                score_label = new Phaser.GameObjects.Text(this.scene, pos_x , this.pos_y + 5,  amount, { fontFamily: 'font1', fontSize: 20, color: '#f6caa0', stroke: '#07404e', strokeThickness: 1});
                score_label.setOrigin(0.5, 0);    
            }
            this.rating_sprite.add(score_label);
         

            graphics = new Phaser.GameObjects.Graphics(this.scene, 0, 0);        
            graphics.lineStyle(4, 0xcca262, 1);
            if (orient == 'landscape')
                graphics.lineBetween(this.pos_x - 5, pos_y, this.pos_x + 5, pos_y);
            else
                graphics.lineBetween(pos_x, this.pos_y - 5, pos_x, this.pos_y + 5);    

            this.rating_sprite.add(graphics);
        }
    },    


    get_stars_score() {
        var i;
        var stars_score = [];
        var total_moves = this.level['moves'];

        stars_score = [
            total_moves * game_data['score']['stars_coef'][0],
            total_moves * game_data['score']['stars_coef'][1],
            total_moves *  game_data['score']['stars_coef'][2]
        ];
          
        // stars_score = [ 200, 400, 600];        
        return stars_score;
    },


    update_score(params) {		
        if (!this.block_new_score) {
            var orient = loading_vars['orientation'];
            this.score += params['score'];
            if (orient == 'landscape') {
                this.target_avatar_pos = this.avatar_pos['min'] - this.score / this.scale_size;
                this.target_rating_pos = this.rating_sprite_y - (this.avatar_pos['min'] - this.target_avatar_pos);
            }
            else {
                this.target_avatar_pos = this.avatar_pos['min'] + this.score / this.scale_size;
                this.target_rating_pos = this.rating_sprite_x + (this.avatar_pos['min'] - this.target_avatar_pos);
            }


            this.check_collect_stars();
            this.score_txt.setText(this.score_prefix + ' ' + this.score);
        }
    },

    get_collected_stars() {
        var i;
        var scores = this.stars_score;
        for (i = 0; i < scores.length; i++) {
            if (scores[i] > this.score) break;
        }
        return i;
    },


    check_collect_stars() {
        var obj;
        if (this.star_labels.length > 0) {
            obj = this.star_labels[0];
            if (obj['amount'] <= this.score) {
                var star = obj['mc'];
                star.setScale(0.4);
                star.x = -45 + 16 * obj['num'];                
                star.y = 2;
                this.avatar.add(star);
                this.star_labels.splice(0, 1);
                this.avatar_labels.push(star);
            }
        }
    },

    show_panel(with_anim = false) {
        if (with_anim) {
            game_data['scene'].tweens.add({targets: this, alpha: 1, duration: 200});
            game_data['scene'].tweens.add({targets: this.rating_sprite, alpha: 1, duration: 200});
        }
        else {
            this.rating_sprite.alpha = 1;
            this.alpha = 1;
        }
    },

    destroy_level() {
        for (var i = 0; i < this.avatar_labels.length; i++) {
            this.avatar_labels[i].destroy();
        }
        if (loading_vars['orientation'] == 'landscape') {
            this.alpha = 0;
            this.rating_sprite.alpha = 0;
        } 
        this.rating_sprite.remove(this.avatar);
        this.rating_sprite.removeAll(true);
    }

  
});
