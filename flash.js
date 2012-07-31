/*!
 * flash.js JavaScript Library v0.6
 * http://mecannical.com/
 *
 * Copyright 2012, Juan Camilo Estela
 * Licensed under the MIT license.
 * http://
 *
 * Date: Tue Apr 10 11:35:00 2012 -0500
 */

 "use strict";

(function(window, undefined) {

	/**
	 * Helper Functions
	 */


	/**
	 *	Event Binding
	 */
	var addEventListener = (function(window, document) {
		if (document.addEventListener) {
			return function(elem, type, cb) {
				if ((elem && !elem.length) || elem === window) {
					elem.addEventListener(type, cb, false);
				} else if (elem && elem.length) {
					var len = elem.length;
					for (var i = 0; i < len; i++) {
						addEvent(elem[i], type, cb);
					}
				}
			};
		} else if (document.attachEvent) {
			return function(elem, type, cb) {
				if ((elem && !elem.length) || elem === window) {
					elem.attachEvent('on' + type, function() {
						return cb.call(elem, window.event)
					});
				} else if (elem.length) {
					var len = elem.length;
					for (var i = 0; i < len; i++) {
						addEvent(elem[i], type, cb);
					}
				}
			};
		}
	})(this, document);


	/**
	 *	Get element's position in page
	 */
	function getAbsolutePosition(el) {
		var top = 0;
		var left = 0;
		while (el != null) {
			top += el.offsetTop;
			left += el.offsetLeft;
			el = el.offsetParent;
		}
		top += window.pageYOffset;
		return {
			"top": top,
			"left": left
		};
	}

	/**
	 *	flash Object
	 */
	window.flash = {
		version: 0.6,
		touchSupported: ('ontouchstart' in window)
	};

	var onFocusStart,
		onFocusEnd,
		onMove;

	var currentClickBufferIndex = 0;


	/**
	 *	MovieClip Class
	 */
	flash.MovieClip = function(id, properties) {

		var mergeProperties = function(from, to) {
				var p;
				for (p in from) {
					if (from.hasOwnProperty(p)) {
						to[p] = from[p];
					}
				}
			};

		var buildPositionObject = function(e) {
				var p = self,
					stageX = 0,
					stageY = 0,
					evt = {};

				while (p) {
					stageX = p.offsetX;
					stageY = p.offsetY;
					p = p.parent;
				}

				evt.xInCanvas = e.clientX - stageX + window.pageXOffset;
				evt.yInCanvas = e.clientY - stageY + window.pageYOffset;
				evt.xInMovieClip = evt.xInCanvas - self.x;
				evt.yInMovieClip = evt.yInCanvas - self.y;
				evt.x = evt.xInMovieClip;
				evt.y = evt.yInMovieClip;

				return evt;
			};


		if (typeof id == 'object' || !id) {
			properties = id;
			id = new Date().getTime() + (Math.random() * 999999);
		}

		var self = this;


		var id = id;
		/*this.__defineGetter__('id', function() {
			return id;
		});*/
		Object.defineProperty(this, 'id', {
			get: function() { 
				return id; 
			},
			set: function(v) {
				if (console)
					console.warn('Trying to set id of '+id+', operation not allowed');
			}
		});

		/*var isRoot = false;
		this.__defineGetter__('isRoot', function() {
			return isRoot;
		});
		this.__defineSetter__('isRoot', function(v) {
			isRoot = v;
		});*/
		this.isRoot = false;


		var visible = true;
		/*this.__defineGetter__('visible', function() {
			return visible;
		});
		this.__defineSetter__('visible', function(v) {
			visible = v;
			if (visible) {
				self.el.style.display = 'block';
			} else {
				self.el.style.display = 'none';
			}
		});*/
		Object.defineProperty(this, 'visible', {
			get: function() { 
				return visible; 
			},
			set: function(v) {
				visible = !!v;
				if (self.isCanvas){

				}else{
					if (visible){
						self.el.style.display = 'block';
					}else{
						self.el.style.display = 'none';
					}
				}
			}
		});


		this.timeline = new flash.Timeline();
		this.timeline.setParent(this);
		/*this.addTimeline = function(name,tl){
					tl.setParent(self);
					timeline[name] = tl;
				}*/


		/*var transformOrigin = '0 0';
		var originX = 0;
		var originY = 0;
		this.__defineGetter__('transformOrigin', function() {
			return transformOrigin;
		});
		this.__defineSetter__('transformOrigin', function(v) {
			transformOrigin = v;
			var tmp = v.split(' ');

			originX = parseInt(tmp[0])/100;
			originY = parseInt(tmp[1])/100;
		});
		this.__defineGetter__('originX',function(){
			return originX;
		});
		this.__defineGetter__('originY',function(){
			return originY;
		});*/

		var transformOrigin = '0 0';
		this.originX = 0;
		this.originY = 0;
		Object.defineProperty(this, 'transformOrigin', {
			get: function() { 
				return transformOrigin; 
			},
			set: function(v) {
				var tmp = v.split(' ');
				self.originX = parseInt(tmp[0])/100;
				self.originY = parseInt(tmp[1])/100;
			}
		});



		/*var x = 0;
		this.__defineGetter__('x', function() {
			return x;
		});
		this.__defineSetter__('x', function(v) {
			x = v;
			//self.draw();
		});*/
		this.x = 0;


		/*var y = 0;
		this.__defineGetter__('y', function() {
			return y;
		});
		this.__defineSetter__('y', function(v) {
			y = v;
			//self.draw();
		});*/
		this.y = 0;


		/*var h = 0;
		this.__defineGetter__('h', function() {
			return h;
		});
		this.__defineSetter__('h', function(v) {
			h = v;
			//self.draw();
		});*/
		this.h = 0;


		/*var w = 0;
		this.__defineGetter__('w', function() {
			return w;
		});
		this.__defineSetter__('w', function(v) {
			w = v;
			//self.draw();
		});*/
		this.w = 0;


		/*var depth = 0;
		this.__defineGetter__('depth', function() {
			return depth;
		});
		this.__defineSetter__('depth', function(v) {
			depth = v;
			//self.draw();
		});*/
		this.depth = 0;


		/*var opacity = 1;
		this.__defineGetter__('opacity', function() {
			return opacity;
		});
		this.__defineSetter__('opacity', function(v) {
			opacity = v;
			//self.draw();
		});*/
		this.opacity = 1;


		/*var rotation = 0;
		this.__defineGetter__('rotation', function() {
			return rotation;
		});
		this.__defineSetter__('rotation', function(v) {
			rotation = v;
			//self.draw();
		});*/
		this.rotation = 0;


		/*var parent = false;
		this.__defineGetter__('parent', function() {
			return parent;
		});
		this.__defineSetter__('parent', function(p) {
			parent = p;
		});*/
		this.parent = false;


		this.type = 'MovieClip';
		this.el = document.getElementById(id) || document.createElement('div');
		this.el.id = id;

		this.children = [];

		var onLoad = false;
		this.__defineSetter__('onLoad', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onLoad = fn;
		});

		var onEnterFrame = false;
		this.__defineSetter__('onEnterFrame', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onEnterFrame = fn;
		});

		var onClick = false;
		this.__defineSetter__('onClick', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onClick = fn;
			if (!self.isCanvas || self.isRoot){
				addEventListener(self.el, 'click', onClickTrigger);
			}
		});

		var onClickTrigger = function(e) {
				if (self.isCanvas){
					var pos = buildPositionObject(e);
					self.onCanvasClicked(e, self.clickBuffer.getImageData(pos.x, pos.y, 1, 1).data );
				}
				onClick.apply(self, [e, buildPositionObject(e)]);
			}

		this.onCanvasClicked = function(e,clickIndex){
			var i;
			if (clickIndex[0] == clickBufferIndex[0] && clickIndex[1] == clickBufferIndex[1] && clickIndex[2] == clickBufferIndex[2]){
				onClick.apply(self, [e, {'a':'b'}]);
			}

			for (i in self.children){
				self.children[i].onCanvasClicked(e,clickIndex);
			}
		};

		var onMouseMove = false;
		this.__defineSetter__('onMouseMove', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onMouseMove = fn;
			addEventListener(self.el, 'mousemove', onMouseMoveTrigger);
		});

		var onMouseMoveTrigger = function(e) {
				onMouseMove.apply(self, [e, buildPositionObject(e)]);
			};


		var onMouseDown = false;
		this.__defineSetter__('onMouseDown', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onMouseDown = fn;
			addEventListener(self.el, 'mousedown', onMouseDownTrigger);
		});

		var onMouseDownTrigger = function(e) {
				onMouseDown.apply(self, [e, buildPositionObject(e)]);
			};

		var onMouseUp = false;
		this.__defineSetter__('onMouseUp', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onMouseUp = fn;
			addEventListener(self.el, 'mouseup', onMouseUpTrigger);
		});

		var onMouseUpTrigger = function(e) {
				onMouseUp.apply(self, [e, buildPositionObject(e)]);
			};

		var onKeyDown = false;
		this.__defineSetter__('onKeyDown', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onKeyDown = fn;
		});
		this.onKeyDownTrigger = function(e) {
			if (onKeyDown) onKeyDown.apply(self, [e]);

			for (i in self.children) {
				self.children[i].onKeyDownTrigger(e);
			}
		}

		var onKeyUp = false;
		this.__defineSetter__('onKeyUp', function(fn) {
			if (typeof fn !== 'function') {
				return;
			}
			onKeyUp = fn;
		});
		this.onKeyUpTrigger = function(e) {
			var i;
			if (onKeyUp) onKeyUp.apply(self, [e]);

			for (i in self.children) {
				self.children[i].onKeyUpTrigger(e);
			}
		}

		this.addChild = function(mc) {
			self.children.push(mc);
			mc.parent = self;
			mc.isCanvas = self.isCanvas;
			mc.canvas = self.canvas;
			mc.clickBuffer = self.clickBuffer;
			//mc.collisionBuffer = self.collisionBuffer;
			if (!self.isCanvas) {
				self.el.appendChild(mc.el);
			}
		}

		this.removeChild = function(mc) {
			var i, q = self.children.length;
			for (i = 0; i < q; i++) {
				if (self.children[i].id == mc.id) {
					self.el.removeChild(self.children[i].el);
					self.children.splice(i, 1);
					break;
				}
			}
		}

		this.remove = function() {
			self.parent.removeChild(self);
		}

		var fps;
		this.__defineGetter__('fps', function() {
			return 1000 / fps;
		});
		this.__defineSetter__('fps', function(v) {
			fps = 1000 / v;
		});
		this.__defineGetter__('_fps', function() {
			return fps;
		});

		this.frameTick = function(timestamp) {
			if (!playing) {
				return;
			}
			var i;
			if (onEnterFrame) {
				onEnterFrame.apply(self, [timestamp]);
			}
			
			self.canvas.save();
			self.clickBuffer.save();
			if (visible) {
				self.draw();
			}
			
			
			for (i in self.children) {
				self.children[i].frameTick(timestamp);
			}
			
			self.canvas.restore();
			self.clickBuffer.restore();

			var AABB = calculateAABB();
			//self.collisionBuffer.strokeRect(AABB.x,AABB.y,AABB.width,AABB.height);
			
			/*for (i in timeline){
						timeline[i].frameTick();
					}*/
			self.timeline.frameTick(timestamp);
		}

		/*var spriteSheet = false;
				this.__defineGetter__('spriteSheet',function(){
					return spriteSheet;
				});
				this.__defineSetter__('spriteSheet',function(v){
					spriteSheet = (v != undefined) ? v : false;
					self.el.style.backgroundImage = 'url('+v+')';
					// TODO: set convention for sprites path per mc
				});*/

		/*var xScale = 1;
		this.__defineGetter__('xScale', function() {
			return xScale;
		});
		this.__defineSetter__('xScale', function(v) {
			xScale = v;
			//self.draw();
		});*/
		this.xScale = 1;


		/*var yScale = 1;
		this.__defineGetter__('yScale', function() {
			return yScale;
		});
		this.__defineSetter__('yScale', function(v) {
			yScale = v;
			//self.draw();
		});*/
		this.yScale = 1;

		Object.defineProperty(this, 'scale', {
			get: function() { 
				return {
					x: self.xScale,
					y: self.yScale
				}; 
			},
			set: function(v) {
				self.xScale = v;
				self.yScale = v;
			}
		});


		var calculateGlobalTransform = function(){
			// TODO: cache response
			var pr = self,
					globalRotation = 0,
					globalX = 0,
					globalY = 0,
					cos = 0,
					sin = 0,
					rotations = [],
					xs = [],
					ys = [],
					offsets = [],
					totalTransforms = 0,
					i = 0;
					

			while (pr.parent){
				rotations.unshift(pr.rotation);
				xs.unshift(pr.x);
				ys.unshift(pr.y);
				offsets.unshift({
					x: -pr.parent.w * pr.parent.originX,
					y: -pr.parent.h * pr.parent.originY
				});
				pr = pr.parent;
				totalTransforms++;
			}

			for (i = 0; i < totalTransforms; i++){
				cos = Math.cos(globalRotation * Math.PI / 180);
				sin = Math.sin(globalRotation * Math.PI / 180);
				
				globalX += (offsets[i].x + xs[i]) * cos - (offsets[i].y + ys[i]) * sin;
				globalY += (offsets[i].x + xs[i]) * sin + (offsets[i].y + ys[i]) * cos;
				globalRotation += rotations[i];
			}

			return {
				rotation: globalRotation,
				x: globalX,
				y: globalY
			}
		};

		var calculateAABB = function(){
			var globalTransform = calculateGlobalTransform(),

			cos = Math.cos(globalTransform.rotation * Math.PI / 180),
			sin = Math.sin(globalTransform.rotation * Math.PI / 180),

			xa = -self.w * (self.originX) * cos - -self.h * (self.originY) * sin,
			xb = self.w * (1-self.originX) * cos - -self.h * (self.originY) * sin,
			xc = self.w * (1-self.originX) * cos - self.h * (1-self.originY) * sin,
			xd = -self.w * (self.originX) * cos - self.h * (1-self.originY) * sin,

			minX = globalTransform.x + Math.min(xa,xb,xc,xd),
			maxX = globalTransform.x + Math.max(xa,xb,xc,xd),

			ya = -self.w * (self.originX) * sin + -self.h * (self.originY) * cos,
			yb = self.w * (1-self.originX) * sin + -self.h * (self.originY) * cos,
			yc = self.w * (1-self.originX) * sin + self.h * (1-self.originY) * cos,
			yd = -self.w * (self.originX) * sin + self.h * (1-self.originY) * cos,

			minY = globalTransform.y + Math.min(ya,yb,yc,yd),
			maxY = globalTransform.y + Math.max(ya,yb,yc,yd);

			return {
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY
			};
		};

		var calculateDistance = function(x1,y1,x2,y2){
			// TODO: update this to use Point objects
			return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
		};

		var calculateInscribedCircle = function(){
			var globalTransform = calculateGlobalTransform(),	
				radius = Math.min(self.w,self.h)/2;
			return{
				radius: radius,
				x: globalTransform.x,
				y: globalTransform.y
			};
		};

		var calculateCircumscribedCircle = function(){
			var globalTransform = calculateGlobalTransform(),	
				radius = Math.max(self.w,self.h)/2;
			return{
				radius: radius,
				x: globalTransform.x,
				y: globalTransform.y
			};
		};

		this.collisionBoundary = 'circumscribed'; // inscribed, AABB
		/*this.__defineSetter__('collisionBoundary',function(v){
			collisionBoundary = (' circumscribed inscribed AABB '.indexOf(' '+v+' ') != -1) ? v : 'circumscribed';
		});*/


		this.hitTest = function(x,y){
			if (self.isCanvas){
				switch(self.collisionBoundary){
					case 'AABB':
						var AABB = calculateAABB();
						var vc = (y >= AABB.y && (AABB.y + AABB.height) >= y);
						var hc = (x >= AABB.x && (AABB.x + AABB.width) >= x);
						return vc && hc;
					break;

					case 'inscribed':
						var inscribedCircle = calculateInscribedCircle();
						return calculateDistance(inscribedCircle.x,inscribedCircle.y,x,y) <= inscribedCircle.radius;
					break;

					default:
					case 'circumscribed':
						var circumscribedCircle = calculateCircumscribedCircle();
						return calculateDistance(circumscribedCircle.x,circumscribedCircle.y,x,y) <= circumscribedCircle.radius;
					break;
				}
			}else{
				// vertical collision
				var vc = (y >= self.y && (self.y + self.h) >= y);
				// horizontal collision
				var hc = (x >= self.x && (self.x + self.w) >= x);
				return vc && hc;
			}
			return false;
		}

		this.collidesWith = function(mc) {
			if (mc instanceof MovieClip) {
				if (self.isCanvas){
					

					return false;
				}else{
					// vertical collision
					var vc = (self.y <= (mc.y + mc.h) && (self.y + self.h) >= mc.y);
					// horizontal collision
					var hc = (self.x <= (mc.x + mc.w) && (self.x + self.w) >= mc.x);
					return vc && hc;
				}
			}
			return false;
		}


		var playing = true;
		this.stop = function() {
			playing = false;
			self.pauseSounds();
			// TODO: propagate pause?
		}

		this.play = function() {
			playing = true;
			self.resumeSounds();
		}

		/*this.__defineGetter__('playing', function() {
			return playing;
		});
		this.__defineSetter__('playing', function(v) {
			if ( !! v) {
				self.play();
			} else {
				self.stop();
			}
		});*/
		Object.defineProperty(this, 'playing', {
			get: function() { 
				return !!playing;
			},
			set: function(v) {
				playing = !!v;
				if (playing){
					self.play();
				}else{
					self.stop();
				}
			}
		});


		var content = '';
		/*this.__defineGetter__('content', function() {
			return content;
		});
		this.__defineSetter__('content', function(v) {
			content = v;
			self.el.innerHTML = v;
		});*/

		Object.defineProperty(this, 'content', {
			get: function() { 
				return content;
			},
			set: function(v) {
				content = v;
				if (!self.isCanvas){
					self.el.innerHTML = v;
				}
			}
		});


		var sounds = {};
		var loops = {};
		this.playSound = function(sound, n) {
			n = (n == undefined) ? 'loop' : n;

			if (sounds[sound] == undefined) {
				// create audio
				var a = new Audio();
				var s = document.createElement('source');
				//s.type = 'audio/mpeg';
				s.src = sound + '.mp3';
				a.appendChild(s);
				s = document.createElement('source');
				//s.type = 'audio/ogg';
				s.src = sound + '.ogg';
				a.appendChild(s);
				sounds[sound] = a;

				if (loops[sound] == undefined) {
					loops[sound] = n;
				}


				sounds[sound].addEventListener('ended', function() {
					if (loops[sound] == 'loop') {
						sounds[sound].currentTime = 0;
						sounds[sound].play();
						return;
					}
					loops[sound]--;
					if (loops[sound] > 0) {
						sounds[sound].currentTime = 0;
						sounds[sound].play();
					} else {
						delete(sounds[sound]);
						delete(loops[sound]);
					}
				}, false);
				sounds[sound].play();
			}
			return sounds[sound];
		}

		this.pauseSounds = function() {
			for (s in sounds) {
				sounds[s].pause();
			}
		}

		this.resumeSounds = function() {
			for (s in sounds) {
				sounds[s].play();
			}
		}

		this.killSound = function(sound) {
			sounds[sound].pause();
			delete(sounds[sound]);
			delete(loops[sound]);
		}

		this.shutUp = function() {
			for (s in sounds) {
				sounds[s].pause();
				delete(loops[s]);
				delete(sounds[s]);
			}
			sounds = {};
			loops = {};
		}

		//
		var clickBufferIndex = currentClickBufferIndex.toString(16);
		clickBufferIndex = [
			(clickBufferIndex & 0xff0000) >> 16, 
    		(clickBufferIndex & 0x00ff00) >> 8, 
    		(clickBufferIndex & 0x0000ff)
		];
		currentClickBufferIndex += 1;

		var context = false;
		var image = false;

		var isCanvas = false;
		/*this.__defineSetter__('isCanvas',function(v){
			isCanvas = v;
			for (i in self.children) {
				self.children[i].isCanvas = v;
			}
		});
		this.__defineGetter__('isCanvas',function(){
			return isCanvas;
		});*/

		// TODO: check if required, if canvas == isCanvas?
		Object.defineProperty(this, 'isCanvas', {
			get: function() { 
				return isCanvas;
			},
			set: function(v) {
				var i;
				isCanvas = !!v;
				for (i in self.children) {
					self.children[i].isCanvas = isCanvas;
				}
			}
		});



		var canvas = false;
		/*this.__defineGetter__('canvas',function(){
			return canvas;
		});
		this.__defineSetter__('canvas',function(v){
			canvas = v;
			for (i in self.children){
				self.children[i].canvas = v;
			}
		});*/
		Object.defineProperty(this, 'canvas', {
			get: function() { 
				return canvas;
			},
			set: function(v) {
				var i;
				canvas = v;
				for (i in self.children){
					self.children[i].canvas = v;
				}
			}
		});


		var clickBuffer = false;
		/*this.__defineGetter__('clickBuffer',function(){
			return clickBuffer;
		});
		this.__defineSetter__('clickBuffer',function(v){
			clickBuffer = v;
			for (i in self.children){
				self.children[i].clickBuffer = v;
			}
		});*/
		Object.defineProperty(this, 'clickBuffer', {
			get: function() { 
				return clickBuffer;
			},
			set: function(v) {
				var i;
				clickBuffer = v;
				for (i in self.children){
					self.children[i].clickBuffer = v;
				}
			}
		});


		/*var collisionBuffer = false;
		this.__defineGetter__('collisionBuffer',function(){
			return collisionBuffer;
		});
		this.__defineSetter__('collisionBuffer',function(v){
			collisionBuffer = v;
			for (i in self.children){
				self.children[i].collisionBuffer = v;
			}
		});*/
		//

		var drawn = false;
		this.draw = function() {
			if (onLoad && !drawn) {
				onLoad.apply(self);
				drawn = true;
			}

			var _x,_y;

			if (self.isCanvas){

				if (!image){
					var i = new Image();
					i.onload = function(){
						image = this;
					}
					i.src = 'mario.jpg';
					return;
				}

				_x = parseInt(self.x);
				_y = parseInt(self.y);

				self.canvas.translate(_x, _y);
				self.clickBuffer.translate(_x,_y);
				
				self.canvas.rotate((self.rotation * Math.PI / 180));
				self.clickBuffer.rotate((self.rotation * Math.PI / 180));
				
				self.canvas.translate((-self.originX * self.w * self.xScale), (-self.originY * self.h * self.yScale));
				self.clickBuffer.translate((-self.originX * self.w * self.xScale), (-self.originY * self.h * self.yScale));

				self.canvas.scale(self.xScale, self.yScale);
				self.clickBuffer.scale(self.xScale, self.yScale);
				
				self.canvas.drawImage(image, 0, 0, self.w, self.h);

				self.clickBuffer.fillStyle = 'rgb('+ clickBufferIndex[0] + ','+ clickBufferIndex[1] +','+clickBufferIndex[2]+')';
				self.clickBuffer.fillRect(0,0,self.w,self.h);

				// ---------------------------------------------
				self.canvas.fillStyle = 'rgb(255,0,255)';
				self.canvas.beginPath();  
      			self.canvas.arc(self.originX * self.w, self.originY * self.h,5,0,Math.PI*2,true);
      			self.canvas.fill();

      			self.canvas.fillStyle = '#ff00ff';
				self.canvas.font = '12px sans-serif';
				self.canvas.textBaseline = 'bottom';
				self.canvas.fillText(self.id+' '+Math.round(_x)+','+Math.round(_y)+' '+self.rotation.toString().substring(0,5), 0, 0);


				self.canvas.beginPath();
				var radius = Math.max(self.w,self.h)/2;
				self.canvas.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Outer circle
				radius = Math.min(self.w,self.h)/2;
				self.canvas.moveTo(self.w/2 + radius,self.h/2);
				self.canvas.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Inner circle
				self.canvas.stroke();
				// ---------------------------------------------

			}else{
				if (self.isRoot) {
					return;
				}

				self.el.style.width = self.w + 'px';
				self.el.style.height = self.h + 'px';
				
				self.el.style.zIndex = self.depth;

				// TODO: unify prefixes, performance increase?
				self.el.style.webkitOpacity = self.opacity;
				self.el.style.MozOpacity = self.opacity;
				self.el.style.oOpacity = self.opacity;
				self.el.style.opacity = self.opacity;

				var t = 'translate3d(' + (self.x - (self.originX * self.w)) + 'px, ' + (self.y - (self.originY * self.h)) + 'px,0) rotate(' + self.rotation + 'deg) scale(' + self.xScale + ',' + self.yScale + ')';

				self.el.style.webkitTransform = t;
				self.el.style.MozTransform = t;
				self.el.style.OTransform = t;
				self.el.style.transform = t;

				self.el.style.webkitTransformOrigin = self.transformOrigin;
				self.el.style.MozTransformOrigin = self.transformOrigin;
				self.el.style.oTransformOrigin = self.transformOrigin;
			}

		}

		mergeProperties(properties, this);

		if (typeof this.construct === 'function') this.construct.apply(this,arguments);
	};

	flash.MovieClip.extend = function(obj) {
		return function() {
			return new flash.MovieClip(obj);
		}
	};

	//
	/*var collisionBuffer = document.createElement('canvas');
		document.getElementsByTagName('body')[0].appendChild(collisionBuffer);
		collisionBuffer = collisionBuffer.getContext('2d');*/
	//


	// timeline controls mc? or mc controls timeline?
	flash.Frame = function(id, parent) {

		var id = id;
		var parent = parent;

		this.flag = function(flag) {
			parent[flag] = self;
		}
	};

	flash.Timeline = function() {

		this.frame = {};
		//var flags = {};
		var lastFrame = 0;
		var loop = true;
		var currentFrame = 0;

		/*this.onFrame = function(frame,fname,fn){
					if (fn == undefined){
						fname = false;
						fn = fname;
					}

					keyframes[frame] = fn;
					if (fname){
						flags[frame] = fname;
					}
					console.log(keyframes);
				}*/
		/*this.__defineSetter__('frame',function(v){
					console.log('frame!!');
				});*/

		this.flag = function(frame, flag) {
			self[flag] = self.frame[frame];
		}

		var parent;
		this.setParent = function(p) {
			parent = p;
		}

		var playing = true;
		this.stop = function() {
			playing = false;
		}

		this.play = function() {
			playing = true;
		}

		this.gotoAndPlay = function(frame) {
			currentFrame = frame;
		}

		this.gotoAndStop = function(frame) {
			currentFrame = frame;
			parent.stop();
		}

		this.frameTick = function() {
			if (!playing) {
				return;
			}
			if (typeof self.frame[currentFrame] === 'function') {
				self.frame[currentFrame].apply(parent, [currentFrame]);
			}
			currentFrame++;
		}
		var self = this;
	}


	flash.Stage = flash.MovieClip.extend({
		'Mouse':{
			x: 0,
			y: 0
		},
		'lastTime': new Date().getTime(),
		'updateMousePosition': function(e){
			var pos = getAbsolutePosition(this.el);
			this.Mouse.x = e.clientX - pos.left;
			this.Mouse.y = e.clientY - pos.top;
		},
		'heartBeat': function(now) {
			console.log('heartbeat',this);
			var delta = now - this.lastTime;

			if (delta >= 16) {
				if (this.isCanvas){
					this.canvas.clearRect(0,0,this.w,this.h);
					this.clickBuffer.clearRect(0,0,this.w,this.h);
				}
				this.frameTick(delta);
				this.renderedFrames++;
				this.lastTime = now;
			}
			//if(limit < 5){
				//limit++;
				window.webkitRequestAnimationFrame(this.heartBeat.bind(this));
			//}
		},
		'construct': function(el, w, h, fps) {
			if (this.el.nodeName.toLowerCase() == 'canvas'){
				this.isCanvas = true;
				this.canvas = this.el.getContext('2d');
				this.clickBuffer = document.createElement('canvas');
			}

			this.fps = fps;
			this.isRoot = true;
			this.w = parseInt(window.getComputedStyle(this.el,'').width);
			this.h = parseInt(window.getComputedStyle(this.el,'').height);

			if (this.clickBuffer){
				this.clickBuffer.width = this.w;
				this.clickBuffer.height = this.h;
				this.clickBuffer = this.clickBuffer.getContext('2d');
			}

			if (!this.isCanvas){
				this.el.style.position = 'relative';
				this.el.style.overflow = 'hidden';
			}

			var pos = getAbsolutePosition(this.el);
			this.offsetX = pos.left;
			this.offsetY = pos.top;
			this.renderedFrames = 0;
			this.realFps = 0;
			this.fpsMonitor = function() {
				this.realFps = this.renderedFrames;
				this.renderedFrames = 0;
				console.log(this.realFps);
				setTimeout(this.fpsMonitor, 1000);
			}
			this.fpsMonitor();
			
			window.webkitRequestAnimationFrame(this.heartBeat.bind(this));

			/*addEventListener(document, 'keydown', root.onKeyDownTrigger);
			addEventListener(document, 'keyup', root.onKeyUpTrigger);

			if (root.isCanvas){
				addEventListener(document, 'click', root.onClickTrigger);
				addEventListener(document, 'mousemove', root.updateMousePosition);
			}

			return root;*/
		}
	});

	/*flash.Stage = function(el, w, h, fps) {
		var limit = 0;

		var root = new flash.MovieClip(el);

		if (root.el.nodeName.toLowerCase() == 'canvas'){
			root.isCanvas = true;
			root.canvas = root.el.getContext('2d');
			root.clickBuffer = document.createElement('canvas');
		}

		root.fps = fps;
		root.isRoot = true;
		root.w = parseInt(window.getComputedStyle(root.el,'').width);
		root.h = parseInt(window.getComputedStyle(root.el,'').height);

		if (root.clickBuffer){
			root.clickBuffer.width = root.w;
			root.clickBuffer.height = root.h;
			document.getElementsByTagName('body')[0].appendChild(root.clickBuffer);
			root.clickBuffer = root.clickBuffer.getContext('2d');
		}


		if (!root.isCanvas){
			root.el.style.position = 'relative';
			root.el.style.overflow = 'hidden';
		}

		var Mouse = {
			x:0,
			y:0
		};
		root.__defineGetter__('Mouse',function(){
			return Mouse;
		});
		root.updateMousePosition = function(e){
			var pos = getAbsolutePosition(root.el);
			Mouse.x = e.clientX - pos.left;
			Mouse.y = e.clientY - pos.top;
		};

		var pos = getAbsolutePosition(root.el);
		root.offsetX = pos.left;
		root.offsetY = pos.top;
		root.renderedFrames = 0;
		root.realFps = 0;
		root.fpsMonitor = function() {
			root.realFps = root.renderedFrames;
			root.renderedFrames = 0;
			console.log(root.realFps);
			setTimeout(root.fpsMonitor, 1000);
		}
		root.fpsMonitor();

		var lastTime = new Date().getTime();
		root.heartBeat = function(now) {
			var delta = now - lastTime;

			if (delta >= 16) {
				if (root.isCanvas){
					root.canvas.clearRect(0,0,root.w,root.h);
					root.clickBuffer.clearRect(0,0,root.w,root.h);
				}
				root.frameTick(delta);
				root.renderedFrames++;
				lastTime = now;
			}
			if(limit < 5){
				//limit++;
				window.webkitRequestAnimationFrame(root.heartBeat);
			}
		};
		window.webkitRequestAnimationFrame(root.heartBeat);

		addEventListener(document, 'keydown', root.onKeyDownTrigger);
		addEventListener(document, 'keyup', root.onKeyUpTrigger);

		if (root.isCanvas){
			addEventListener(document, 'click', root.onClickTrigger);
			addEventListener(document, 'mousemove', root.updateMousePosition);
		}

		return root;
	}*/


})(window);
