

console.log('started');

var Character = function(name){
	this.name = name || 'default name';
	this.speed = 0;
	//this.id = 'no id set';
	var id = 'no id set';
};

	Object.defineProperty(Character, 'id', {
		get: function(){
			console.log(this);
			return id;
		},
		set: function(v){
			id = v;
		}
	});

Character.prototype.salute = function(message){
	console.log(this.name + ' says: Hi! ' + message);
};

Character.prototype.run = function(speed){
	this.speed = speed;
	console.log(this.name + ' is running at ' + speed);
	this.yell('Im running!!');
};

Character.prototype.jump = function(height){
	this.height = height;
	console.log(this.name + ' jumped ' + height);
	this.yell('Im jumping!!');
};

Character.prototype.yell = function(message){
	console.log(this.name + ' yelled: ' + message);
};




var GoodGuy = function(name){
	this.power = 5;
	console.log(this.name);
	this.name = name;
	console.log(this.name);
};
GoodGuy.prototype = new Character();

GoodGuy.prototype.fire = function(){
	console.log(this.name + ' is firing!');
	this.power *= 0.9;
};

GoodGuy.prototype.updatePower = function(){
	console.log(this.name + 's power: ' + this.power);
};

var p = new Character('Mr Potato Face');
var j = new GoodGuy('juank');




