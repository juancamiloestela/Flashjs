var Enemy = flash.MovieClip.extend({
	'construct': function() {
		this.x = Math.random() * 400;
		this.y = Math.random() * 300;
		this.w = Math.random() * 20 + 10;
		this.h = Math.random() * 20 + 10;
		this.xSpeed = Math.random() * 10 - 5;
		this.ySpeed = Math.random() * 10 - 5;
		this.targetX = Math.random() * Game.stage.w;
		this.targetY = Math.random() * Game.stage.h;
		this.targetR = Math.random() * 1080;
		this.transformOrigin = '50% 50%';
	},
	'alterPath': function(x, y) {
		this.targetX = x;
		this.targetY = y;
	},
	'flee': function(x, y) {
		this.targetX = x;
		this.targetY = y;
	},
	'explode': function(x, y) {
		var i, sparks = [];

		for (i = 0; i < 10; i++) {
			sparks[i] = new flash.MovieClip();
			sparks[i].x = x;
			sparks[i].y = y;
			sparks[i].h = Math.random() * 10 + 3;
			sparks[i].w = Math.random() * 10 + 3;
			sparks[i].targetX = x + (Math.random() * 100) - 50;
			sparks[i].targetY = y + (Math.random() * 100) - 50;
			sparks[i].targetR = (Math.random() * 360);

			sparks[i].onEnterFrame = function() {
				this.x += (this.targetX - this.x) / 8;
				this.y += (this.targetY - this.y) / 8;
				this.rotation += (this.targetR - this.rotation) / 8;
				this.h *= 0.98;
				this.w *= 0.98;
				this.opacity *= 0.9;

				if (Math.abs(this.x - this.targetX) < 0.15) {
					this.remove();
				}
			}

			Game.stage.addChild(sparks[i]);
		}

	},
	'onEnterFrame': function(delta) {

		/*if (this.x > Game.stage.w - this.w){
						this.xSpeed *= -1;
						this.x = Game.stage.w - this.w;
					}
					if (this.x < 0){
						this.xSpeed *= -1;
						this.x = 0;
					}
					if (this.y > Game.stage.h - this.h){
						this.ySpeed *= -1;
						this.y = Game.stage.h - this.h;
					}
					if (this.y < 0){
						this.ySpeed *= -1;
						this.y = 0;
					}

					this.x += this.xSpeed;
					this.y += this.ySpeed;*/

		//this.x += 1 * delta/16;
		
		this.x += (this.targetX - this.x) * (delta / 16) / 10;
		this.y += (this.targetY - this.y) * (delta / 16) / 10;
		this.rotation += (this.targetR - this.rotation) / 10;

		if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) {
			this.targetX = Math.random() * Game.stage.w;
			this.targetY = Math.random() * Game.stage.h;
			this.targetR = Math.random() * 1080;
		}
	},
	'onClick': function(e, pos) {
		e.stopPropagation();
		if (!Game.stage.playing) {
			return;
		}
		console.log('clicked ', this.id, 'on', pos, this.x, this.y);
		this.playSound('sounds/explosion2', 1);
		//Game.explode(pos.xInCanvas,pos.yInCanvas);
		this.explode(pos.xInCanvas, pos.yInCanvas);
		this.remove();
		Game.score += Math.round(1000 / (this.w * this.h));
		console.log(Game.score);
	}
});








var Game = {
	stage: false,
	player: false,
	enemies: false,
	maxEnemies: 0,
	fpsMonitor: false,
	pauseBtn: false,
	score: 0
};


Game.createEnemies = function() {
	var i;
	Game.enemies = [];
	for (i = 0; i < Game.maxEnemies; i++) {
		Game.enemies[i] = new Enemy();
		Game.stage.addChild(Game.enemies[i]);
	}
}

Game.explode = function(x, y) {
	var i, q = Game.enemies.length;
	console.log('explode from', q, q + 10);
	for (i = q; i < q + 10; i++) {
		Game.enemies[i] = new Enemy();
		Game.enemies[i].x = x;
		Game.enemies[i].y = y;
		Game.stage.addChild(Game.enemies[i]);
	}
}

Game.stageClicked = function(e, pos) {
	//console.log('stage clicked ', pos, Game.enemies.length);
	var i, q = Game.enemies.length;
	for (i = 0; i < q; i++) {
		Game.enemies[i].flee(pos.x, pos.y);
	}
	Game.score -= 10;
	if (Game.score < 0) {
		Game.score = 0;
	}
}

Game.stageMouseDown = function(e, pos) {
	//console.log('mouse down on ', pos);
}

Game.stageMouseUp = function(e, pos) {
	//console.log('mouse up on ', pos);
}

Game.stageMouseMoved = function(e, pos) {
	//console.log('mouse moved',e,pos);
	var i, q = Game.enemies.length;
	for (i = 0; i < q; i++) {
		//Game.enemies[i].alterPath(pos.x,pos.y);
	}
}

Game.keyDown = function(e) {
	e.preventDefault();
	e.stopPropagation();
	//console.log('key down', e.keyCode);
}

Game.keyUp = function(e) {
	e.preventDefault();
	e.stopPropagation();
	//console.log('key up', e.keyCode);
}

Game.init = function() {
	Game.stage = new flash.Stage('canvas', 800, 600);
	Game.createEnemies();

	Game.stage.onClick = Game.stageClicked;
	Game.stage.onMouseDown = Game.stageMouseDown;
	Game.stage.onMouseUp = Game.stageMouseUp;
	Game.stage.onMouseMove = Game.stageMouseMoved;
	Game.stage.onKeyDown = Game.keyDown;
	Game.stage.onKeyUp = Game.keyUp;

	var fpsMonitor = new flash.MovieClip('fpsMonitor');
	fpsMonitor.w = 80;
	//Game.stage.addChild(fpsMonitor);
	setInterval(function() {
		fpsMonitor.content = 'FPS: ' + Game.stage.realFps;
	}, 1000);

	var pauseBtn = new flash.MovieClip('pauseBtn');
	pauseBtn.w = 80;
	pauseBtn.y = 20;
	pauseBtn.content = 'Pause';
	//Game.stage.addChild(pauseBtn);
	pauseBtn.onClick = function(e) {
		e.stopPropagation();
		if (Game.stage.playing) {
			Game.stage.stop();
		} else {
			Game.stage.play();
		}
	}

	var finger = new flash.MovieClip('hand');
	finger.x = 80;
	finger.y = 20;
	finger.w = 40;
	finger.h = 20;
	//hand.rotation = 175;
	//finger.transformOrigin = '50% 50%';
	finger.onEnterFrame = function(){
		this.rotation -= 2;
	}
	finger.onClick = function(){
		console.log('clicked finger!!!!!!!!');
	}

	var hand = new flash.MovieClip('hand');
	hand.x = 0;
	hand.y = 0;
	hand.w = 80;
	hand.h = 40;
	//hand.rotation = 175;
	//hand.transformOrigin = '50% 50%';
	hand.collisionBoundary = 'AABB';
	hand.onEnterFrame = function(){
		this.rotation -= 2;
		if (this.hitTest(Game.stage.Mouse.x,Game.stage.Mouse.y)){
			console.log('hit arm with mouse',Game.stage.Mouse.x,Game.stage.Mouse.y);
		}
	}
	hand.onClick = function(){
		console.log('clicked hand!!!!!!!!');
	}
	hand.addChild(finger);

	var arm = new flash.MovieClip('arm');
	arm.x = 200;
	arm.y = 200;
	arm.w = 300;
	arm.h = 40;
	arm.rotation = -45;
	arm.transformOrigin = '50% 50%';
	arm.onEnterFrame = function(){
		this.rotation += 1;
		//this.x += 1;
	}
	arm.onClick = function(){
		console.log('clicked arm!!!!!!!!');
	}
	arm.addChild(hand);

	Game.stage.addChild(arm);

console.log(Game.stage);

	//Game.stage.playSound('sounds/background', 'loop');
}


Game.init();
