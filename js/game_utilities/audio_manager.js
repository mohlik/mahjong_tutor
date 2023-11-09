class AudioManager {
    constructor(_scene) {		
        this.scene = game_data['scene'];
    }
	
	init() {
		this.audio_library = {};
		this.playing_sounds = [];
		this.sound_id = 0;
		this.unpaused = 1;
		this.play_first_map = true;
	}
	
	sound_event(sound_obj) {
	//console.log('am',JSON.stringify(sound_obj))
		if ('preload_sounds' in sound_obj)
			this.preload_sounds();		
		
		if ('preload_sound' in sound_obj)
			this.preload_sound(sound_obj);
		
		if ('play' in sound_obj)
			this.play_sound(sound_obj);
			
		if ('stop' in sound_obj)
			this.stop_sound_type(sound_obj);
				
		if ('stop_all' in sound_obj)
			this.stop_audio();
				
		if ('mute' in sound_obj)
			this.mute(sound_obj);		

		if ('temporary_fade' in sound_obj)
			this.temporary_fade(sound_obj);
				
		if ('pause_music' in sound_obj)
			this.pause_music();

		if ('resume_music' in sound_obj)
			this.resume_music();	
						
			
	}

	preload_sounds() {
		var i = 0;
		game_data['error_history'].push('am1');
		var loader = new Phaser.Loader.LoaderPlugin(this.scene);
		var allowed = [];
		var dir_url = game_data['urls']['audio'];
		var _this = this;
		for (i = 0; i < game_data['preload_sounds'].length; i++) {
			var sound_name = game_data['preload_sounds'][i];
			if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine)) {
				allowed.push(sound_name);
				loader.audio(sound_name, dir_url + sound_name + '.mp3');
			}
		}
		loader.once('complete', function(){
			for (i = 0; i < allowed.length; i++) {
				var sound_name = allowed[i];
				if (_this.scene.cache.audio.exists(sound_name)) {
					var sound = _this.scene.sound.add(sound_name);
					_this.audio_library[sound_name] = {};
					_this.audio_library[sound_name]['sound'] = sound;		
				}
			}	
			loader.destroy();
		}, this);
		loader.start();
	}

	preload_sound(sound_obj) {
		var sound_name = sound_obj['sound_name'];
		if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine)) {
			var dir_url = game_data['urls']['audio'];	
			if ('global' in sound_obj) dir_url = game_data['urls']['audio_global'];	
			if ('location_id' in sound_obj)	dir_url = dir_url + sound_obj['location_id'] + '/';
			var _this = this;
			var loader = new Phaser.Loader.LoaderPlugin(this.scene);
			loader.audio(sound_name, dir_url + sound_name + '.mp3');
			loader.once('complete', function(){
				if (_this.scene.cache.audio.exists(sound_name)) {
					var sound = _this.scene.sound.add(sound_name);
					_this.audio_library[sound_name] = {};
					_this.audio_library[sound_name]['sound'] = sound;		
					
				}
				loader.destroy();
			});
			loader.start();
		}
	}
		
		
	play_sound(sound_obj) {
		
		var i;
		var sound;
		var sound_type;
		var sound_name = sound_obj['sound_name'];			
		var iter = ('loop' in sound_obj) ? 9999 : 0;
		var channel;
		var audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
		var audio_type = ('audio_type' in sound_obj) ? sound_obj['audio_type'] : 'sound';
		sound_obj['audio_kind'] = audio_kind;
		var vol = game_data['user_data'][audio_kind] * this.unpaused;
		var config = {'volume':vol};
		if (sound_obj['inventory']) config['seek'] = 0.75;
	//console.log('play', JSON.stringify(sound_obj), JSON.stringify(config));
		if ((sound_name in this.audio_library && 'sound' in this.audio_library[sound_name]) 
			|| this.scene.cache.audio.exists(sound_name)) {
			
			if (sound_name in this.audio_library && 'sound' in this.audio_library[sound_name])
				sound = this.audio_library[sound_name]['sound'];
			else {
				sound = this.scene.sound.add(sound_name);
				//console.log(sound_name, 'FROM CACHE')
			} 
			if (sound) {
				if ('loop' in sound_obj)
					this.play_with_fade(sound_obj, sound); 
				else
					sound.play(config);
				this.add_playing_sound(sound_obj, sound);
			}
		}
		else if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine) ) {	
			if ('loop' in sound_obj && this.play_first_map && !('map' in sound_obj)) {
				this.play_first_map = false;
			}													
			var dir_url = game_data['urls']['audio'];	
			if ('global' in sound_obj) dir_url = game_data['urls']['audio_global'];	
			if ('location_id' in sound_obj)	dir_url = dir_url + sound_obj['location_id'] + '/';
			var _this = this;
			var loader = new Phaser.Loader.LoaderPlugin(this.scene);
			loader.audio(sound_name, dir_url + sound_name + '.mp3');
			loader.once('complete', function(){
				if (_this.scene.cache.audio.exists(sound_name)) {
					sound = _this.scene.sound.add(sound_name);
					if (sound) {
						_this.audio_library[sound_name] = {};
						_this.audio_library[sound_name]['sound'] = sound;					
						if ('loop' in sound_obj) {
							if (_this.play_first_map || !('map' in sound_obj))
								_this.play_with_fade(sound_obj, sound); 
						}
						else sound.play(config);
						_this.add_playing_sound(sound_obj, sound);
					}
				}
				loader.destroy();
			});
			loader.start();
		}
		
	}
	 
	update_volume() {
		var sound_obj;
		var audio_kind;
		if ('unpaused' in game_data) this.unpaused = game_data['unpaused'];
		for (var i = 0; i < this.playing_sounds.length; i++) {
			sound_obj = this.playing_sounds[i];
			audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
			if (sound_obj['sound'].isPlaying) sound_obj['sound'].setVolume(game_data['user_data'][audio_kind] * this.unpaused);
		}		
	}

	play_with_fade(sound_obj, sound) {
		var _this = this;
		var vol = 0;
		if (sound_obj['audio_kind'] in game_data['user_data']) vol = game_data['user_data'][sound_obj['audio_kind']] * this.unpaused;
		//console.log('play_with_fade',JSON.stringify(sound_obj),vol)
		if (sound_obj['audio_kind'] == 'music') {
			sound.play({'volume':0, 'loop':true});
			var tweenObject = {val: 0};
			var _delay = 0;
			if (this.delay) _delay = this.delay;
			game_data['scene'].tweens.add({
				targets: tweenObject,
				val: vol,
				delay: _delay,
				duration: 1000,
				ease: "Linear",
				callbackScope: _this,
				onUpdate: function(tween, target){
					if (sound.isPlaying) sound.setVolume(target.val * _this.unpaused);
				},
				onComplete: function(){
					if (sound.isPlaying) sound.setVolume(game_data['user_data'][sound_obj['audio_kind']] * _this.unpaused);
				}
			});
			this.delay = 1000;
		}
		else sound.play({'volume':vol, 'loop':true});
		
	}

	stop_with_fade(sound_obj) {
		var _this = this;
		var sound = sound_obj['sound'];
		var vol = 0;
		if (sound_obj['audio_kind'] in game_data['user_data']) vol = game_data['user_data'][sound_obj['audio_kind']] * this.unpaused;
		if (sound_obj['audio_kind'] == 'music') {
			var tweenObject = {val: vol};
			game_data['scene'].tweens.add({
				targets: tweenObject,
				val: 0,
				duration: 1000,
				ease: "Linear",
				callbackScope: _this,
				onUpdate: function(tween, target){
					if (sound.isPlaying) sound.setVolume(target.val * _this.unpaused);
				},
				onComplete: function(){
					sound.stop();
				}
			});
		}
		else {
			if (sound_obj['audio_type'] == 'ambience') {
				sound.off('stop');
				sound.stop(); 
				
				if (game_data['preload_sounds'].indexOf(sound_obj['sound_name']) < 0) {
					delete this.audio_library[sound_obj['sound_name']];
					setTimeout(() => {
						if (sound) sound.destroy();
						if (this.scene.cache.audio.exists(sound_obj['sound_name'])) this.scene.cache.audio.remove(sound_obj['sound_name']);	
					}, 10);
					
				}
			}
			else sound.stop();
		}
	}
	
	
	add_playing_sound(sound_obj, sound) {
		this.sound_id++;
		var sound_id = this.sound_id;
		var sound_type = ('sound_type' in sound_obj) ? sound_obj['sound_type'] : 'default';				
		var audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
		var audio_type = ('audio_type' in sound_obj) ? sound_obj['audio_type'] : 'sound';
		
		this.playing_sounds.push({
			'sound_type': sound_type,
			'audio_kind': audio_kind,
			'audio_type': audio_type,
			'sound': sound,
			'sound_id': sound_id,
			'sound_name': sound_obj['sound_name'],
			'inventory': sound_obj['inventory'],
			'loop': ('loop' in sound_obj)
		});

		var _this = this;
		if (audio_kind == 'sound' && !('loop' in sound_obj) && (audio_type != 'ambience')) {
			sound.once('stop', function(){
				for (var i = 0; i < _this.playing_sounds.length; i++)
					if (_this.playing_sounds[i]['sound_id'] == sound_id) {
						var obj = _this.playing_sounds[i];
						_this.playing_sounds.splice(i, 1);
						break;
					}			
			});
		}

		if (audio_type == 'ambience') {
			sound.once('stop', function(){
				for (var i = 0; i < _this.playing_sounds.length; i++)
					if (_this.playing_sounds[i]['sound_id'] == sound_id) {
						var obj = _this.playing_sounds[i];
						var vol = game_data['user_data'][sound_obj['audio_kind']] * _this.unpaused;
						obj['sound'].play({'volume':vol});
						//console.log('ambience REPLAY');
						break;
					}			
			});
		}
	}
	
	stop_sound_type(sound_obj) {
		var i;
		var obj;
		var sound_type = ('sound_type' in sound_obj) ? sound_obj['sound_type'] : 'default';
		var timeout = ('timeout' in sound_obj && sound_obj['timeout'] > 0) ? sound_obj['timeout'] : -1;
			
		for (i = 0; i < this.playing_sounds.length; i++) {				
			obj = this.playing_sounds[i];
			if (obj['sound_type'] == sound_type) 
				this.stop_sound(obj, timeout)
		}			
	}	
	
	stop_sound(obj, timeout) {
		var i;
		var sound_id = obj['sound_id'];			
		
		if (timeout > 0) {
			//fade_sound(obj, timeout, function(){
			//	obj['channel'].stop();   
			//});				
		}
		else {
			this.stop_with_fade(obj);
			//obj['sound'].stop();
			//obj['sound'].destroy();
		}
			
			
		for (i = 0; i < this.playing_sounds.length; i++)
			if (this.playing_sounds[i]['sound_id'] == sound_id) {
				var obj = this.playing_sounds[i]
				this.playing_sounds.splice(i, 1);
				//this.try_destroy_sound(obj);
				break;
			}			
	}
	
	try_destroy_sound(obj) {
		if (obj['sound_name'] in this.audio_library) {
			this.stop_with_fade(obj);
			//obj['sound'].stop();
			obj = null;
		}
		else if (obj['sound']) {
				var s = obj['sound_name'];
				obj['sound'] = null;
				obj = null;
				s = null;
		}
		
	}
	
	stop_audio() {
		var obj;
		while (this.playing_sounds.length) {					
			obj = this.playing_sounds.pop();
			obj['sound'].off('stop');
			this.try_destroy_sound(obj)
		}	
		var s='';
		
	}	

	mute(sound_obj) {
		
	}
	
	temporary_fade(sound_obj) {
		
	}	
	
	pause_music() {
		
	}	
	
	resume_music() {
		
	}		
	
	init_loading(_loading_sprite) {
		
			
	}	

}