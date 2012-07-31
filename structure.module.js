

console.log('started');

var Character = function(name){
	this.name = name || 'default name';
	this.speed = 0;
	//this.id = 'no id set';
	var self = this;
	var id = 'no id set';

	Object.defineProperty(self, 'id', {
		get: function(){
			console.log(this);
			return id;
		},
		set: function(v){
			id = v;
		}
	});

	this.salute = function(message){
		console.log(self.name + ' says: Hi! ' + message);
	};

	this.run = function(speed){
		self.speed = speed;
		console.log(self.name + ' is running at ' + speed);
		self.yell('Im running!!');
	};

	this.jump = function(height){
		self.height = height;
		console.log(self.name + ' jumped ' + height);
		self.yell('Im jumping!!');
	};

	this.yell = function(message){
		console.log(self.name + ' yelled: ' + message);
	};
};


var GoodGuy = function(name){

	var parent = new Character(),
		p;
	for (p in parent){
		//if (parent.hasOwnProperty(p)){
			console.log('inheriting ',p);
			//GoodGuy.prototype[p] = parent[p];
			this[p] = parent[p];
		//}
	}
	//GoodGuy.prototype = parent;

	this.power = 5;
	console.log(this.name);
	this.name = name;
	console.log(this.name);

	var self = this;

	this.fire = function(){
		console.log(self.name + ' is firing!');
		self.power *= 0.9;
	};

	this.updatePower = function(){
		console.log(self.name + 's power: ' + self.power);
	};
};


var p = new Character('Mr Potato Face');
var j = new GoodGuy('juank');




