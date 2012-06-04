/*!
 * flash.js JavaScript Library v0.6 - Refactored!
 * http://mecannical.com/
 *
 * Copyright 2012, Juan Camilo Estela
 * Licensed under the MIT license.
 * http://
 *
 * Date: Tue Apr 10 11:35:00 2012 -0500
 */

(function(window, undefined){

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
	};


	// TODO: figure out where to put this
	var onFocusStart,
		onFocusEnd,
		onMove;

	var currentClickBufferIndex = 0;

	var collisionBuffer = document.createElement('canvas');
		collisionBuffer.width = 640;
		collisionBuffer.height = 480;
		document.getElementsByTagName('body')[0].appendChild(collisionBuffer);
		collisionBuffer = collisionBuffer.getContext('2d');


	// END RELOCATE SECTION


	function classs(){
		var self = this;
		// public properties
		self.publicProperty = 'Im public';

		var privateProperty = 'Im private';

		var privateMethod = function(){
			console.log('in private method',this,self,self.publicProperty,privateProperty);
		};

		classs.prototype.publicMethod = function(){
			console.log('in public method',this,self,self.publicProperty,privateProperty);
			privateMethod();
		};

		privateMethod();
	}


	function MovieClip(_id, _properties){
		var self = this; // scope definition
		
		// private properties
		var privateProperty = 'Im private';
		var id = false,
			fps = false,
			playing = true,
			content = '',
			sounds = {},
			loops = {},
			clickBufferIndex = false,
			context = false,
			image = false,
			isCanvas = false,
			canvas = false,
			clickBuffer = false,
			gT = false,
			drawn = false,
			visible = true,
			onLoad = false,
			onEnterFrame = false,
			onClick = false,
			onMouseMove = false,
			onMouseDown = false,
			onMouseUp = false,
			onKeyDown = false,
			onKeyUp = false;

		// public properties
		self.publicProperty = 'Im public';
		self.isRoot = false,
		self.originX = 0,
		self.originY = 0,
		self.x = 0,
		self.y = 0,
		self.w = 0,
		self.h = 0,
		self.xScale = 1,
		self.yScale = 1,
		self.depth = 0,
		self.opacity = 1,
		self.rotation = 0,
		self.parent = false,
		self.type = 'MovieClip',
		self.el = false,
		self.children = [],
		self.collisionBoundary = 'circumscribed';

		


		//private methods
		var privateMethod = function(){

		};

		var init = function(){
			if (typeof _id == 'object' || !_id) {
				properties = _id;
				_id = new Date().getTime() + (Math.random() * 999999);
			}
			id = _id;
			self.el = document.getElementById(id) || document.createElement('div');
			self.el.id = id;

			clickBufferIndex = [
				(clickBufferIndex & 0xff0000) >> 16, 
	    		(clickBufferIndex & 0x00ff00) >> 8, 
	    		(clickBufferIndex & 0x0000ff)
			];
			currentClickBufferIndex += 1;
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

		var calculateGlobalTransform = function(){
			// TODO: cache response
			if (gT){
				return gT;
			}
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

			gT = {
				rotation: globalRotation,
				x: globalX,
				y: globalY
			};
			return gT;
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

			if (collisionBuffer){
				collisionBuffer.strokeRect(minX,minY,maxX-minX,maxY-minY);
			}

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

			if (collisionBuffer){
				var cos = Math.cos(globalTransform.rotation * Math.PI / 180);
				var sin = Math.sin(globalTransform.rotation * Math.PI / 180);

				collisionBuffer.beginPath();
				collisionBuffer.arc(globalTransform.x + self.w/2 * cos - self.h/2 * sin,
									globalTransform.y + self.w/2 * sin + self.h/2 * cos,
									radius,0,Math.PI*2,true); // Inner circle
				collisionBuffer.stroke();
			}

			return{
				radius: radius,
				x: globalTransform.x,
				y: globalTransform.y
			};
		};

		var calculateCircumscribedCircle = function(){
			var globalTransform = calculateGlobalTransform(),	
				radius = Math.max(self.w,self.h)/2;

			if (collisionBuffer){
				var cos = Math.cos(globalTransform.rotation * Math.PI / 180); // put in global transform response?
				var sin = Math.sin(globalTransform.rotation * Math.PI / 180);

				collisionBuffer.beginPath();
				collisionBuffer.arc(globalTransform.x + self.w/2 * cos - self.h/2 * sin,
									globalTransform.y + self.w/2 * sin + self.h/2 * cos,
									radius,0,Math.PI*2,true); // Outer circle
				collisionBuffer.stroke();
			}

			return{
				radius: radius,
				x: globalTransform.x,
				y: globalTransform.y
			};
		};



		










		// public methods
		MovieClip.prototype.publicMethod = function(){

		};

		// id
		Object.defineProperty(self, 'id', {
			get: function(){
				return id;
			},
			set: function(v){
				if (console)
					console.warn('Trying to set id of '+id+', operation not allowed');
			}
		});

		// visible
		Object.defineProperty(self, 'visible', {
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

		// scale
		Object.defineProperty(self, 'scale', {
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

		Object.defineProperty(self, 'playing', {
			get: function(){
				return !!playing;
			},
			set: function(v){
				playing = !!v;
				if (playing){
					self.play();
				}else{
					self.stop();
				}
			}
		});

		// content
		Object.defineProperty(self, 'content', {
			get: function(){
				return content;
			},
			set: function(v){
				content = v;
				if (!self.isCanvas){
					self.el.innerHTML = v;
				}
			}
		});

		// isCanvas
		Object.defineProperty(self, 'isCanvas', {
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

		// canvas
		Object.defineProperty(self, 'canvas', {
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

		// click buffer
		Object.defineProperty(self, 'clickBuffer', {
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

		// fps
		Object.defineProperty(self, 'fps', {
			get: function(){
				return 1000 / fps;
			},
			set: function(v){
				fps = 1000 / v;
			}
		});
		Object.defineProperty(self, '_fps', {
			get: function(){
				return fps;
			},
			set: function(){}
		});

		// onLoad
		Object.defineProperty(self, 'onLoad', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onLoad = fn;
			}
		});

		// onEnterFrame
		Object.defineProperty(self, 'onEnterFrame', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onEnterFrame = fn;
			}
		});

		// onClick
		Object.defineProperty(self, 'onClick', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onClick = fn;
				if (!self.isCanvas || self.isRoot){
					console.log('Adding click listener');
					addEventListener(self.el, 'click', onClickTrigger);
				}
			}
		});
		var onClickTrigger = function(e) {
			console.log('clicked');
			if (self.isCanvas){
				var pos = buildPositionObject(e);
				self.onCanvasClicked(e, self.clickBuffer.getImageData(pos.x, pos.y, 1, 1).data );
			}
			onClick.apply(self, [e, buildPositionObject(e)]);
		};
		self.onCanvasClicked = function(e,clickIndex){
			var i;
			if (clickIndex[0] == clickBufferIndex[0] && clickIndex[1] == clickBufferIndex[1] && clickIndex[2] == clickBufferIndex[2]){
				onClick.apply(self, [e, {'a':'b'}]);
			}

			for (i in self.children){
				self.children[i].onCanvasClicked(e,clickIndex);
			}
		};

		// onMouseMove
		Object.defineProperty(self, 'onMouseMove', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onMouseMove = fn;
				addEventListener(self.el, 'mousemove', onMouseMoveTrigger);
			}
		});
		var onMouseMoveTrigger = function(e) {
			onMouseMove.apply(self, [e, buildPositionObject(e)]);
		};

		// onMouseDown
		Object.defineProperty(self, 'onMouseDown', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onMouseDown = fn;
				addEventListener(self.el, 'mousedown', onMouseDownTrigger);
			}
		});
		var onMouseDownTrigger = function(e) {
			onMouseDown.apply(self, [e, buildPositionObject(e)]);
		};

		// onMouseUp
		Object.defineProperty(self, 'onMouseUp', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onMouseUp = fn;
				addEventListener(self.el, 'mouseup', onMouseUpTrigger);
			}
		});
		var onMouseUpTrigger = function(e) {
			onMouseUp.apply(self, [e, buildPositionObject(e)]);
		};

		// onKeyDown
		Object.defineProperty(self, 'onKeyDown', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onKeyDown = fn;
			}
		});
		self.onKeyDownTrigger = function(e) {
			if (onKeyDown) onKeyDown.apply(self, [e]);

			for (i in self.children) {
				self.children[i].onKeyDownTrigger(e);
			}
		};

		// onKeyUp
		Object.defineProperty(self, 'onKeyUp', {
			get: function(){},
			set: function(fn){
				if (typeof fn !== 'function') {
					return;
				}
				onKeyUp = fn;
			}
		});
		self.onKeyUpTrigger = function(e) {
			var i;
			if (onKeyUp) onKeyUp.apply(self, [e]);

			for (i in self.children) {
				self.children[i].onKeyUpTrigger(e);
			}
		};




		self.hitTest = function(x,y){
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
		};

		self.collidesWith = function(mc) {
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
		};

		self.stop = function() {
			playing = false;
			self.pauseSounds();
			// TODO: propagate pause?
		};

		self.play = function() {
			playing = true;
			self.resumeSounds();
		};

		self.playSound = function(sound, n) {
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
		};

		self.pauseSounds = function() {
			for (s in sounds) {
				sounds[s].pause();
			}
		};

		self.resumeSounds = function() {
			for (s in sounds) {
				sounds[s].play();
			}
		};

		self.killSound = function(sound) {
			sounds[sound].pause();
			delete(sounds[sound]);
			delete(loops[sound]);
		};

		self.shutUp = function() {
			for (s in sounds) {
				sounds[s].pause();
				delete(loops[s]);
				delete(sounds[s]);
			}
			sounds = {};
			loops = {};
		};

		self.addChild = function(mc) {
			self.children.push(mc);
			mc.parent = self;
			mc.isCanvas = self.isCanvas;
			mc.canvas = self.canvas;
			mc.clickBuffer = self.clickBuffer;
			//mc.collisionBuffer = self.collisionBuffer;
			if (!self.isCanvas) {
				self.el.appendChild(mc.el);
			}
		};

		self.removeChild = function(mc) {
			var i, q = self.children.length;
			for (i = 0; i < q; i++) {
				if (self.children[i].id == mc.id) {
					self.el.removeChild(self.children[i].el);
					self.children.splice(i, 1);
					break;
				}
			}
		};

		self.remove = function() {
			self.parent.removeChild(self);
		};

		self.frameTick = function(timestamp) {
			if (!playing) {
				return;
			}

			gT = false;
			var i;
			if (onEnterFrame) {
				onEnterFrame.apply(self, [timestamp]);
			}
			
			self.canvas.save();
			self.clickBuffer.save();

			//collisionBuffer.save();

			if (visible) {
				self.draw();
			}

			
			
			for (i in self.children) {
				self.children[i].frameTick(timestamp);
			}
			
			self.canvas.restore();
			self.clickBuffer.restore();

			//collisionBuffer.restore();

			var AABB = calculateAABB();
			var circumscribedCircle = calculateCircumscribedCircle();
			var inscribedCircle = calculateInscribedCircle();


			if (collisionBuffer){
				var globalTransform = calculateGlobalTransform();
				collisionBuffer.fillStyle = 'rgb(255,0,255)';
				collisionBuffer.beginPath();  
      			collisionBuffer.arc(globalTransform.x + self.originX * self.w, 
      								globalTransform.y + self.originY * self.h,5,0,Math.PI*2,true);
      			collisionBuffer.fill();

      			collisionBuffer.fillStyle = '#ff00ff';
				collisionBuffer.font = '12px sans-serif';
				collisionBuffer.textBaseline = 'bottom';
				collisionBuffer.fillText(self.id+' '+Math.round(self.x)+','+Math.round(self.y)+' '+self.rotation.toString().substring(0,5), globalTransform.x + 5, globalTransform.y);
			}


			/*collisionBuffer.strokeRect(AABB.x,AABB.y,AABB.width,AABB.height);

			collisionBuffer.fillStyle = 'rgb(255,0,255)';
			collisionBuffer.beginPath();  
  			collisionBuffer.arc(self.originX * self.w, self.originY * self.h,5,0,Math.PI*2,true);
  			collisionBuffer.fill();

  			collisionBuffer.fillStyle = '#ff00ff';
			collisionBuffer.font = '12px sans-serif';
			collisionBuffer.textBaseline = 'bottom';
			collisionBuffer.fillText(self.id+' '+Math.round(self.x)+','+Math.round(self.y)+' '+self.rotation.toString().substring(0,5), 0, 0);

			collisionBuffer.beginPath();
			var radius = Math.max(self.w,self.h)/2;
			collisionBuffer.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Outer circle
			radius = Math.min(self.w,self.h)/2;
			collisionBuffer.moveTo(self.w/2 + radius,self.h/2);
			collisionBuffer.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Inner circle
			collisionBuffer.stroke();*/

			
			/*for (i in timeline){
						timeline[i].frameTick();
					}*/
			//self.timeline.frameTick(timestamp);
		};

		self.draw = function() {
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
				/*collisionBuffer.fillStyle = 'rgb(255,0,255)';
				collisionBuffer.beginPath();  
      			collisionBuffer.arc(self.originX * self.w, self.originY * self.h,5,0,Math.PI*2,true);
      			collisionBuffer.fill();

      			collisionBuffer.fillStyle = '#ff00ff';
				collisionBuffer.font = '12px sans-serif';
				collisionBuffer.textBaseline = 'bottom';
				collisionBuffer.fillText(self.id+' '+Math.round(_x)+','+Math.round(_y)+' '+self.rotation.toString().substring(0,5), 0, 0);


				collisionBuffer.beginPath();
				var radius = Math.max(self.w,self.h)/2;
				collisionBuffer.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Outer circle
				radius = Math.min(self.w,self.h)/2;
				collisionBuffer.moveTo(self.w/2 + radius,self.h/2);
				collisionBuffer.arc(self.w/2,self.h/2,radius,0,Math.PI*2,true); // Inner circle
				collisionBuffer.stroke();*/
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

		};


		(function(){
			init();
		})();
	}







	Stage.prototype = new MovieClip();
	Stage.prototype.constructor = Stage;
	function Stage(el, w, h, fps){
		console.log(el,w,h,fps);
		console.log(this, this, this.el);
		var self = this;
		console.log(this, self, self.el);

		self.Mouse = {
			x: 0,
			y: 0
		};

		var limit = 0; // debug

		var lastTime = new Date().getTime();

		var updateMousePosition = function(e){
			var pos = getAbsolutePosition(self.el);
			self.Mouse.x = e.clientX - pos.left;
			self.Mouse.y = e.clientY - pos.top;
		};

		var heartBeat = function(now) {
			//console.log('heartbeat',this);
			var delta = now - lastTime;

			if (delta >= 16) {
				if (self.isCanvas){
					collisionBuffer.clearRect(0,0,self.w,self.h);
					collisionBuffer.drawImage(self.el,0,0);
					collisionBuffer.beginPath();
					collisionBuffer.moveTo(self.Mouse.x-5, self.Mouse.y);
					collisionBuffer.lineTo(self.Mouse.x+5, self.Mouse.y);
					collisionBuffer.moveTo(self.Mouse.x, self.Mouse.y-5);
					collisionBuffer.lineTo(self.Mouse.x, self.Mouse.y+5);
					collisionBuffer.stroke();
					//collisionBuffer.strokeRect(self.Mouse.x - 5, self.Mouse.y,10,1);
					//collisionBuffer.strokeRect(self.Mouse.x, self.Mouse.y - 5,1,10);
					self.canvas.clearRect(0,0,self.w,self.h);
					self.clickBuffer.clearRect(0,0,self.w,self.h);
					//collisionBuffer.clearRect(0,0,self.w,self.h);
				}
				self.frameTick(delta);
				self.renderedFrames++;
				lastTime = now;
			}
			if(limit < 50){
				//limit++;
				window.webkitRequestAnimationFrame(heartBeat);
			}
		};


		(function() {
			console.log(this, self, self.el, el);
			MovieClip.call(this, el);
			self.el = el;
			console.log(this, self, self.el, el);

			if (self.el.nodeName.toLowerCase() == 'canvas'){
				self.isCanvas = true;
				self.canvas = self.el.getContext('2d');
				self.clickBuffer = document.createElement('canvas');
			}

			self.fps = fps;
			self.isRoot = true;
			self.w = parseInt(window.getComputedStyle(self.el,'').width);
			self.h = parseInt(window.getComputedStyle(self.el,'').height);

			console.log(self, self.w, self.h);

			if (self.clickBuffer){
				self.clickBuffer.width = self.w;
				self.clickBuffer.height = self.h;
				self.clickBuffer = self.clickBuffer.getContext('2d');
			}

			if (!self.isCanvas){
				self.el.style.position = 'relative';
				self.el.style.overflow = 'hidden';
			}

			var pos = getAbsolutePosition(self.el);
			self.offsetX = pos.left;
			self.offsetY = pos.top;
			self.renderedFrames = 0;
			self.realFps = 0;
			self.fpsMonitor = function() {
				self.realFps = self.renderedFrames;
				self.renderedFrames = 0;
				console.log(self.realFps);
				setTimeout(self.fpsMonitor, 1000);
			}
			self.fpsMonitor();

			if (self.isCanvas){
				console.log(self.onClickTrigger);
				addEventListener(document, 'click', self.onClickTrigger);
				addEventListener(self.el, 'mousemove', updateMousePosition);
			}
			
			window.webkitRequestAnimationFrame(heartBeat);
		})();
	};
	//Stage.prototype = MovieClip.prototype;
	
	


	
	window.flash = {
		version: 0.6,
		touchSupported: ('ontouchstart' in window),
		MovieClip: MovieClip,
		Stage: Stage
	}


})(window);









	myStage = new flash.Stage(document.getElementById('my-canvas'),640,480,30);


	var finger = new flash.MovieClip('hand');
	finger.x = 80;
	finger.y = 20;
	finger.w = 40;
	finger.h = 20;
	//hand.rotation = 175;
	//finger.transformOrigin = '50% 50%';
	finger.onEnterFrame = function(){
		this.rotation -= 1;
	}
	finger.onClick = function(){
		console.log('clicked finger!!!!!!!!');
	}

	var hand = new flash.MovieClip('hand');
	hand.x = 160;
	hand.y = 0;
	hand.w = 80;
	hand.h = 40;
	//hand.rotation = 175;
	//hand.transformOrigin = '50% 50%';
	//hand.originX = 0.5;
	//hand.originY = 0.5;
	hand.collisionBoundary = 'circumscribed';
	hand.onEnterFrame = function(){
		this.rotation -= 0.2;
		if (this.hitTest(myStage.Mouse.x,myStage.Mouse.y)){
			console.log('hit hand with mouse',myStage.Mouse.x,myStage.Mouse.y);
		}
	}
	hand.onClick = function(){
		console.log('clicked hand!!!!!!!!');
	}
	hand.addChild(finger);

	var arm = new flash.MovieClip('arm');
	arm.x = 280;
	arm.y = 240;
	arm.w = 160;
	arm.h = 40;
	arm.rotation = -45;
	//arm.transformOrigin = '50% 50%';
	arm.onEnterFrame = function(){
		this.rotation -= 0.5;
		//this.x = 200 + 40 * Math.sin(this.rotation/10);
		//this.x += 1;
	}
	arm.onClick = function(){
		console.log('clicked arm!!!!!!!!');
	}
	arm.addChild(hand);

	myStage.addChild(arm);




	Enemy.prototype = new flash.MovieClip();
	Enemy.prototype.constructor = Enemy;
	function Enemy(){
		var self = this;

		var privateVar = 'Im private';

		this.publicVar = 'Im public';

		var privateMethod = function(){

		};

		this.publicMethod = function(){

		};

		// constructor
		(function(){
			flash.MovieClip.call(this);
			/*self.x = 30;
			self.y = 30;
			self.w = 30;
			self.h = 30;*/
		})();
	};

	var myEnemy = new Enemy();
	//myStage.addChild(myEnemy);
