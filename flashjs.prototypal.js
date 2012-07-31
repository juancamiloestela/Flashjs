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

	var _collisionBuffer = document.createElement('canvas');
		_collisionBuffer.width = 640;
		_collisionBuffer.height = 480;
		document.getElementsByTagName('body')[0].appendChild(_collisionBuffer);
		_collisionBuffer = _collisionBuffer.getContext('2d');


	// END RELOCATE SECTION



	function MovieClip(generatedId, _properties){
		//var this = this; // scope definition
		
		// private properties
		var _id = false,
			_fps = false,
			_playing = true,
			_content = '',
			_sounds = {},
			_loops = {},
			_clickBufferIndex = false,
			_context = false,
			_image = false,
			_isCanvas = false,
			_canvas = false,
			_clickBuffer = false,
			_gT = false,
			_drawn = false,
			_visible = true,
			_onLoad = false,
			_onEnterFrame = false,
			_onClick = false,
			_onMouseMove = false,
			_onMouseDown = false,
			_onMouseUp = false,
			_onKeyDown = false,
			_onKeyUp = false,
			self = this;

		// public properties
		this.publicProperty = 'Im public';
		this.isRoot = false,
		this.originX = 0,
		this.originY = 0,
		this.x = 0,
		this.y = 0,
		this.w = 0,
		this.h = 0,
		this.xScale = 1,
		this.yScale = 1,
		this.depth = 0,
		this.opacity = 1,
		this.rotation = 0,
		this.parent = false,
		this.type = 'MovieClip',
		this.el = false,
		this.children = [],
		this.collisionBoundary = 'circumscribed';

		
		// Private Methods

		var init = function(){
			if (typeof generatedId == 'object' || !generatedId) {
				properties = generatedId;
				generatedId = new Date().getTime() + (Math.random() * 999999);
			}
			_id = generatedId;
			self.el = document.getElementById(_id) || document.createElement('div');
			self.el.id = _id;

			_clickBufferIndex = [
				(_clickBufferIndex & 0xff0000) >> 16, 
	    		(_clickBufferIndex & 0x00ff00) >> 8, 
	    		(_clickBufferIndex & 0x0000ff)
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
			if (_gT){
				return _gT;
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

			_gT = {
				rotation: globalRotation,
				x: globalX,
				y: globalY
			};
			return _gT;
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

			if (_collisionBuffer){
				_collisionBuffer.strokeRect(minX,minY,maxX-minX,maxY-minY);
			}

			return {
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY
			};
		};

		var calculateDistance = function(x1,y1,x2,y2){
			// TODO: update self to use Point objects
			return Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
		};

		var calculateInscribedCircle = function(){
			var globalTransform = calculateGlobalTransform(),	
				radius = Math.min(self.w,self.h)/2;

			if (_collisionBuffer){
				var cos = Math.cos(globalTransform.rotation * Math.PI / 180);
				var sin = Math.sin(globalTransform.rotation * Math.PI / 180);

				_collisionBuffer.beginPath();
				_collisionBuffer.arc(globalTransform.x + self.w/2 * cos - self.h/2 * sin,
									globalTransform.y + self.w/2 * sin + self.h/2 * cos,
									radius,0,Math.PI*2,true); // Inner circle
				_collisionBuffer.stroke();
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

			if (_collisionBuffer){
				var cos = Math.cos(globalTransform.rotation * Math.PI / 180); // put in global transform response?
				var sin = Math.sin(globalTransform.rotation * Math.PI / 180);

				_collisionBuffer.beginPath();
				_collisionBuffer.arc(globalTransform.x + self.w/2 * cos - self.h/2 * sin,
									globalTransform.y + self.w/2 * sin + self.h/2 * cos,
									radius,0,Math.PI*2,true); // Outer circle
				_collisionBuffer.stroke();
			}

			return{
				radius: radius,
				x: globalTransform.x,
				y: globalTransform.y
			};
		};



		










		// public methods

		// id
		this.id = function(){
			return _id;
		};

		// visible
		this.visible = function(v){
			if (v === undefined){
				return _visible;
			}
			v = !!v;
			_visible = v;
			if (this.isCanvas()){

			}else{
				if (v){
					this.el.style.display = 'block';
				}else{
					this.el.style.display = 'none';
				}
			}
		};

		// scale
		this.scale = function(v){
			if (v === undefined){
				return {
					x: this.xScale,
					y: this.yScale
				};
			}
			this.xScale = v;
			this.yScale = v;
		};

		// playing
		this.playing = function(v){
			if (v === undefined){
				return !!_playing;
			}
			v = !!v;
			_playing = v;
			if (v){
				this.play();
			}else{
				this.stop();
			}
		};

		// content
		this.content = function(v){
			if (v === undefined){
				return _content;
			}
			if (!this.isCanvas()){
				_content = v;
				this.el.innerHTML = v;
			}
		};

		// isCanvas
		this.isCanvas = function(v){
			if (v === undefined){
				return _isCanvas;
			}
			var i;
			v = !!v;
			_isCanvas = v;
			for (i in this.children){
				this.children[i].isCanvas(v);
			}
		};

		// canvas
		this.canvas = function(v){
//			console.log('c',v);
			if (v === undefined){
				return _canvas;
			}
			var i;
			_canvas = v;
			for (i in this.children){
				this.children[i].canvas(v);
			}
//			console.log(_canvas);
		};

		// click buffer
		this.clickBuffer = function(v){
			if (v === undefined){
				return _clickBuffer;
			}
			var i;
			_clickBuffer = v;
			for (i in this.children){
				this.children[i].clickBuffer(v);
			}
		};

		// fps
		this.fps = function(v){
			if (v === undefined){
				return 1000/_fps;
			}
			_fps = 1000/v;
		};
		this._dirtyFps = function(){
			return fps;
		};

		// onLoad
		this.onLoad = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onLoad = v;
		};

		// onEnterFrame
		this.onEnterFrame = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onEnterFrame = v;
		};

		// onClick
		this.onClick = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onClick = v;
			if (!this.isCanvas() || this.isRoot){
				console.log('adding click listener');
				addEventListener(this.el, 'click', onClickTrigger);
			}
		};
		var onClickTrigger = function(e) {
			console.log('clicked',this,this);
			if (this.isCanvas()){
				var pos = buildPositionObject(e);
				this.onCanvasClicked(e, this.clickBuffer.getImageData(pos.x, pos.y, 1, 1).data );
			}
			_onClick.apply(this, [e, buildPositionObject(e)]);
		};
		this.onCanvasClicked = function(e,clickIndex){
			var i;
			if (clickIndex[0] == clickBufferIndex[0] && clickIndex[1] == clickBufferIndex[1] && clickIndex[2] == clickBufferIndex[2]){
				_onClick.apply(this, [e, {'a':'b'}]);
			}

			for (i in this.children){
				this.children[i].onCanvasClicked(e,clickIndex);
			}
		};

		// onMouseMove
		this.onMouseMove = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onMouseMove = v;
			addEventListener(this.el, 'mousemove', onMouseMoveTrigger);
		};
		var onMouseMoveTrigger = function(e) {
			_onMouseMove.apply(this, [e, buildPositionObject(e)]);
		};

		// onMouseDown
		this.onMouseDown = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onMouseDown = v;
			addEventListener(this.el, 'mousedown', onMouseDownTrigger);
		}
		var onMouseDownTrigger = function(e) {
			_onMouseDown.apply(this, [e, buildPositionObject(e)]);
		};

		// onMouseUp
		this.onMouseUp = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onMouseUp = v;
			addEventListener(this.el, 'mouseup', onMouseUpTrigger);
		};
		var onMouseUpTrigger = function(e) {
			_onMouseUp.apply(this, [e, buildPositionObject(e)]);
		};

		// onKeyDown
		this.onKeyDown = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onKeyDown = v;
		}
		this.onKeyDownTrigger = function(e) {
			if (_onKeyDown) _onKeyDown.apply(this, [e]);

			for (i in this.children) {
				this.children[i].onKeyDownTrigger(e);
			}
		};

		// onKeyUp
		this.onKeyUp = function(v){
			if (typeof v !== 'function'){
				return;
			}
			_onKeyUp = v;
		};
		this.onKeyUpTrigger = function(e) {
			var i;
			if (_onKeyUp) _onKeyUp.apply(this, [e]);

			for (i in this.children) {
				this.children[i].onKeyUpTrigger(e);
			}
		};




		this.hitTest = function(x,y){
			if (this.isCanvas()){
				switch(this.collisionBoundary){
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
				var vc = (y >= this.y && (this.y + this.h) >= y);
				// horizontal collision
				var hc = (x >= this.x && (this.x + this.w) >= x);
				return vc && hc;
			}
			return false;
		};

		this.collidesWith = function(mc) {
			if (mc instanceof MovieClip) {
				if (this.isCanvas()){
					

					return false;
				}else{
					// vertical collision
					var vc = (this.y <= (mc.y + mc.h) && (this.y + this.h) >= mc.y);
					// horizontal collision
					var hc = (this.x <= (mc.x + mc.w) && (this.x + this.w) >= mc.x);
					return vc && hc;
				}
			}
			return false;
		};

		this.stop = function() {
			_playing = false;
			this.pauseSounds();
			// TODO: propagate pause?
		};

		this.play = function() {
			_playing = true;
			this.resumeSounds();
		};

		this.playSound = function(sound, n) {
			n = (n == undefined) ? 'loop' : n;

			if (_sounds[sound] == undefined) {
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
				_sounds[sound] = a;

				if (_loops[sound] == undefined) {
					_loops[sound] = n;
				}


				_sounds[sound].addEventListener('ended', function() {
					if (_loops[sound] == 'loop') {
						_sounds[sound].currentTime = 0;
						_sounds[sound].play();
						return;
					}
					_loops[sound]--;
					if (_loops[sound] > 0) {
						_sounds[sound].currentTime = 0;
						_sounds[sound].play();
					} else {
						delete(_sounds[sound]);
						delete(_loops[sound]);
					}
				}, false);
				_sounds[sound].play();
			}
			return _sounds[sound];
		};

		this.pauseSounds = function() {
			for (s in _sounds) {
				_sounds[s].pause();
			}
		};

		this.resumeSounds = function() {
			for (s in sounds) {
				_sounds[s].play();
			}
		};

		this.killSound = function(sound) {
			_sounds[sound].pause();
			delete(_sounds[sound]);
			delete(_loops[sound]);
		};

		this.shutUp = function() {
			for (s in _sounds) {
				_sounds[s].pause();
				delete(_loops[s]);
				delete(_sounds[s]);
			}
			_sounds = {};
			_loops = {};
		};

		this.addChild = function(mc) {
			this.children.push(mc);
			mc.parent = this;
			mc.isCanvas(this.isCanvas());
			mc.canvas = this.canvas;
			mc.clickBuffer = this.clickBuffer;
			//mc.collisionBuffer = this.collisionBuffer;
			if (!this.isCanvas()) {
				this.el.appendChild(mc.el);
			}
		};

		this.removeChild = function(mc) {
			var i, q = this.children.length;
			for (i = 0; i < q; i++) {
				if (this.children[i].id == mc.id) {
					this.el.removeChild(this.children[i].el);
					this.children.splice(i, 1);
					break;
				}
			}
		};

		this.remove = function() {
			this.parent.removeChild(this);
		};

		this.frameTick = function(timestamp) {
			if (!_playing) {
				return;
			}

			_gT = false;
			var i;
			if (_onEnterFrame) {
				_onEnterFrame.apply(this, [timestamp]);
			}

			console.log('save',this.id());
			this.canvas().save();
			this.clickBuffer.save();

			//collisionBuffer.save();

			if (_visible) {
				this.draw();
			}


			
			for (i in this.children) {
				this.children[i].frameTick(timestamp);
			}

			this.canvas().restore();

			this.clickBuffer.restore();


			//collisionBuffer.restore();

			var AABB = calculateAABB();
			var circumscribedCircle = calculateCircumscribedCircle();
			var inscribedCircle = calculateInscribedCircle();


			if (_collisionBuffer){
				var globalTransform = calculateGlobalTransform();
				_collisionBuffer.fillStyle = 'rgb(255,0,255)';
				_collisionBuffer.beginPath();  
      			_collisionBuffer.arc(globalTransform.x + this.originX * this.w, 
      								globalTransform.y + this.originY * this.h,5,0,Math.PI*2,true);
      			_collisionBuffer.fill();

      			_collisionBuffer.fillStyle = '#ff00ff';
				_collisionBuffer.font = '12px sans-serif';
				_collisionBuffer.textBaseline = 'bottom';
				_collisionBuffer.fillText(this.id+' '+Math.round(this.x)+','+Math.round(this.y)+' '+this.rotation.toString().substring(0,5), globalTransform.x + 5, globalTransform.y);
			}


			/*collisionBuffer.strokeRect(AABB.x,AABB.y,AABB.width,AABB.height);

			collisionBuffer.fillStyle = 'rgb(255,0,255)';
			collisionBuffer.beginPath();  
  			collisionBuffer.arc(this.originX * this.w, this.originY * this.h,5,0,Math.PI*2,true);
  			collisionBuffer.fill();

  			collisionBuffer.fillStyle = '#ff00ff';
			collisionBuffer.font = '12px sans-serif';
			collisionBuffer.textBaseline = 'bottom';
			collisionBuffer.fillText(this.id+' '+Math.round(this.x)+','+Math.round(this.y)+' '+this.rotation.toString().substring(0,5), 0, 0);

			collisionBuffer.beginPath();
			var radius = Math.max(this.w,this.h)/2;
			collisionBuffer.arc(this.w/2,this.h/2,radius,0,Math.PI*2,true); // Outer circle
			radius = Math.min(this.w,this.h)/2;
			collisionBuffer.moveTo(this.w/2 + radius,this.h/2);
			collisionBuffer.arc(this.w/2,this.h/2,radius,0,Math.PI*2,true); // Inner circle
			collisionBuffer.stroke();*/

			
			/*for (i in timeline){
						timeline[i].frameTick();
					}*/
			//this.timeline.frameTick(timestamp);
		};

		this.draw = function() {
			if (_onLoad && !_drawn) {
				_onLoad.apply(this);
				_drawn = true;
			}

			var _x,_y;

			if (this.isCanvas()){

				if (!_image){
					var i = new Image();
					i.onload = function(){
						_image = this;
					}
					i.src = 'mario.jpg';
					return;
				}

				_x = parseInt(this.x);
				_y = parseInt(this.y);

				this.canvas().translate(_x, _y);
				this.clickBuffer.translate(_x,_y);
				
				this.canvas().rotate((this.rotation * Math.PI / 180));
				this.clickBuffer.rotate((this.rotation * Math.PI / 180));
				
				this.canvas().translate((-this.originX * this.w * this.xScale), (-this.originY * this.h * this.yScale));
				this.clickBuffer.translate((-this.originX * this.w * this.xScale), (-this.originY * this.h * this.yScale));

				this.canvas().scale(this.xScale, this.yScale);
				this.clickBuffer.scale(this.xScale, this.yScale);
				
				this.canvas().drawImage(_image, 0, 0, this.w, this.h);

				this.clickBuffer.fillStyle = 'rgb('+ _clickBufferIndex[0] + ','+ _clickBufferIndex[1] +',' + _clickBufferIndex[2]+')';
				this.clickBuffer.fillRect(0,0,this.w,this.h);




				// ---------------------------------------------
				/*collisionBuffer.fillStyle = 'rgb(255,0,255)';
				collisionBuffer.beginPath();  
      			collisionBuffer.arc(this.originX * this.w, this.originY * this.h,5,0,Math.PI*2,true);
      			collisionBuffer.fill();

      			collisionBuffer.fillStyle = '#ff00ff';
				collisionBuffer.font = '12px sans-serif';
				collisionBuffer.textBaseline = 'bottom';
				collisionBuffer.fillText(this.id+' '+Math.round(_x)+','+Math.round(_y)+' '+this.rotation.toString().substring(0,5), 0, 0);


				collisionBuffer.beginPath();
				var radius = Math.max(this.w,this.h)/2;
				collisionBuffer.arc(this.w/2,this.h/2,radius,0,Math.PI*2,true); // Outer circle
				radius = Math.min(this.w,this.h)/2;
				collisionBuffer.moveTo(this.w/2 + radius,this.h/2);
				collisionBuffer.arc(this.w/2,this.h/2,radius,0,Math.PI*2,true); // Inner circle
				collisionBuffer.stroke();*/
				// ---------------------------------------------

			}else{
				if (this.isRoot) {
					return;
				}

				this.el.style.width = this.w + 'px';
				this.el.style.height = this.h + 'px';
				
				this.el.style.zIndex = this.depth;

				// TODO: unify prefixes, performance increase?
				this.el.style.webkitOpacity = this.opacity;
				this.el.style.MozOpacity = this.opacity;
				this.el.style.oOpacity = this.opacity;
				this.el.style.opacity = this.opacity;

				var t = 'translate3d(' + (this.x - (this.originX * this.w)) + 'px, ' + (this.y - (this.originY * this.h)) + 'px,0) rotate(' + this.rotation + 'deg) scale(' + this.xScale + ',' + this.yScale + ')';

				this.el.style.webkitTransform = t;
				this.el.style.MozTransform = t;
				this.el.style.OTransform = t;
				this.el.style.transform = t;

				this.el.style.webkitTransformOrigin = this.transformOrigin;
				this.el.style.MozTransformOrigin = this.transformOrigin;
				this.el.style.oTransformOrigin = this.transformOrigin;
			}

		};


		(function(){
			init();
		})();
	}







	
	//Stage.prototype.constructor = Stage;
	function Stage(el, w, h, fps){
		console.log(el,w,h,fps);
		console.log(this, this, this.el);
		var self = this;

		this.Mouse = {
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
			//console.log('heartbeat',self);
			var delta = now - lastTime;

			if (delta >= 16) {
				if (self.isCanvas()){
					_collisionBuffer.clearRect(0,0,self.w,self.h);
					_collisionBuffer.drawImage(self.el,0,0);
					_collisionBuffer.beginPath();
					_collisionBuffer.moveTo(self.Mouse.x-5, self.Mouse.y);
					_collisionBuffer.lineTo(self.Mouse.x+5, self.Mouse.y);
					_collisionBuffer.moveTo(self.Mouse.x, self.Mouse.y-5);
					_collisionBuffer.lineTo(self.Mouse.x, self.Mouse.y+5);
					_collisionBuffer.stroke();
					//collisionBuffer.strokeRect(self.Mouse.x - 5, self.Mouse.y,10,1);
					//collisionBuffer.strokeRect(self.Mouse.x, self.Mouse.y - 5,1,10);
					self.canvas().clearRect(0,0,self.w,self.h);
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
			console.log(self,self, self, self.el, el);
			//MovieClip.call(self, el);
			self.el = el;
			console.log(self,self, self, self.el, el);

			if (self.el.nodeName.toLowerCase() == 'canvas'){
				self.isCanvas(true);
				console.log('a');
				self.canvas(self.el.getContext('2d'));
				self.clickBuffer = document.createElement('canvas');
			}

			console.log(self,self, self, self.el, el, self.canvas);

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

			if (!self.isCanvas()){
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

			if (self.isCanvas()){
				console.log(self.onClickTrigger);
				addEventListener(document, 'click', self.onClickTrigger);
				addEventListener(self.el, 'mousemove', updateMousePosition);
			}
			
			window.webkitRequestAnimationFrame(heartBeat);
		})();
	};
	Stage.prototype = new MovieClip();
	Stage.prototype.constructor = Stage;
	//Stage.prototype = MovieClip.prototype;
	
	


	
	window.flash = {
		version: 0.6,
		touchSupported: ('ontouchstart' in window),
		MovieClip: MovieClip,
		Stage: Stage
	}


})(window);









	myStage = new flash.Stage(document.getElementById('my-canvas'),640,480,30);


	/*var finger = new flash.MovieClip('hand');
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
	hand.addChild(finger);*/

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
		this.x += 1;
	}
	arm.onClick = function(){
		console.log('clicked arm!!!!!!!!');
	}
	//arm.addChild(hand);

	myStage.addChild(arm);




	//Enemy.prototype = new flash.MovieClip();
	Enemy.prototype.constructor = Enemy;
	function Enemy(){
//		var this = this;

		var privateVar = 'Im private';

		this.publicVar = 'Im public';

		var privateMethod = function(){

		};

		this.publicMethod = function(){

		};

		// constructor
		(function(){
			flash.MovieClip.call(this);
			this.x = 30;
			this.y = 30;
			this.w = 30;
			this.h = 30;
		})();
	};

	//var myEnemy = new Enemy();
	//myStage.addChild(myEnemy);
