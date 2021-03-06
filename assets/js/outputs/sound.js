/*
 * Plays a sound
 * http://www.happyworm.com
 *
 * Copyright (c) 2014 Happyworm Ltd
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Mark J Panaghiston
 * Version: 0.0.1
 * Date: 27th May 2014
 */

(function(PM) {

	var DEBUG = false;

	var Sound = function(options) {
		this.init(options);
	};

	if(typeof PM === 'undefined') {
		window.Sound = Sound; // 
	} else {
		PM.Sound = function(options) {
			return new Sound(options); // 
		};
	}

	Sound.prototype = {
		init: function(options) {
			var self = this;
			// The default options
			this.options = {
				id: '', // The id for broadcasts
				audio: 'assets/audio/heart/heartbeat.wav',
				callback: null,
				context: null
			};
			// Read in instancing options.
			for(var option in options) {
				if(options.hasOwnProperty(option)) {
					this.options[option] = options[option];
				}
			}
			// The Web Audio API context
			this.context = PM && PM.context ? PM.context : this.options.context;

			// Web Audio API
			this.request = new XMLHttpRequest();
			this.request.open("GET", this.options.audio, true);
			this.request.responseType = "arraybuffer";
			this.request.onload = function() {
				self.context.decodeAudioData(self.request.response, function(buffer) {
					self.buffer = buffer;
					self.broadcast('sound_ready');
					if(typeof self.options.callback === 'function') {
						self.options.callback.call(self);
					}
				});
			};
			this.request.send();
		},
		broadcast: function(type) {
			// Broadcast the message
			if(PM) {
				PM.broadcast(type, {
					id: this.options.id,
					target: this,
					msg: 'Generated by: Sound'
				});
			}
		},
		play: function() {
			var self = this;
			var fired = false; // So we only generate 1 event from the 2 solutions.
			var handler = function() {
				if(!fired) {
					fired = true;
					self.broadcast('sound_ended');
				}
			};
			if(this.buffer) {
				var source = this.context.createBufferSource();
				// Chrome is buggy with this onended event.
				// The even works fine in Chrome before you enable the camera stream. Not sure how the two are connected.
				source.onended = handler;
				// Because Chrome sucks... We are using a ghetto timeout as fallback.
				setTimeout(handler, this.buffer.duration * 1000);
				source.connect(this.context.destination);
				source.buffer = this.buffer;
				source.start(0);
				return true;
			} else {
				return false;
			}
		}
	}
}(window.PM));
