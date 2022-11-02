import * as _ from 'underscore'

const DURATION = 1000


export default class InfoManager {
	constructor(game) {
		this.game = game;
		this.infos = {};
		this.destroyQueue = [];
	}

	addDamageInfo(value, x, y, type) {
		var time = this.game.currentTime,
			id = time+""+Math.abs(value)+""+x+""+y,
			self = this,
			info = new DamageInfo(id, value, x, y, DURATION, type);
	
		info.onDestroy(function(id) {
			self.destroyQueue.push(id);
		});
		this.infos[id] = info;
	}

	addExperienceInfo(exp, x, y) {
		var time = this.game.currentTime,
			id = time+""+Math.abs(exp)+""+x+""+y,
			self = this,
			info = new DamageInfo(id, '+'+exp+' XP', x, y, DURATION, 'experience');
	
		info.onDestroy(function(id) {
			self.destroyQueue.push(id);
		});
		this.infos[id] = info;
	}

	addLevelUpInfo(x, y) {
		var time = this.game.currentTime,
			id = time+""+Math.random()+""+x+""+y,
			self = this,
			info = new DamageInfo(id, 'LEVEL UP', x, y, DURATION, 'experience');
	
		info.onDestroy(function(id) {
			self.destroyQueue.push(id);
		});
		this.infos[id] = info;
	}

	forEachInfo(callback) {
		var self = this;
	
		_.each(this.infos, function(info, id) {
			callback(info);
		});
	}

	update(time) {
		var self = this;
	
		this.forEachInfo(function(info) {
			info.update(time);
		});
	
		_.each(this.destroyQueue, function(id) {
			delete self.infos[id];
		});
		this.destroyQueue = [];
	}
}


var damageInfoColors = {
	"received": {
		fill: "rgb(255, 50, 50)",
		stroke: "rgb(255, 180, 180)"
	},
	"inflicted": {
		fill: "white",
		stroke: "#373737"
	},
	"healed": {
		fill: "rgb(80, 255, 80)",
		stroke: "rgb(50, 120, 50)"
	},
	"experience": {
		fill: "rgb(80, 255, 80)",
		stroke: "rgb(50, 120, 50)"
	}
};



class DamageInfo {
	constructor(id, value, x, y, duration, type) {
		this.id = id;
		this.value = value;
		this.duration = duration;
		this.x = x;
		this.y = y;
		this.opacity = 1.0;
		this.lastTime = 0;
		this.speed = 100;
		this.fillColor = damageInfoColors[type].fill;
		this.strokeColor = damageInfoColors[type].stroke;
	}

	isTimeToAnimate(time) {
		return (time - this.lastTime) > this.speed;
	}

	update(time) {
		if(this.isTimeToAnimate(time)) {
			this.lastTime = time;
			this.tick();
		}
	}

	tick() {
		this.y -= 1;
		this.opacity -= 0.07;
		if(this.opacity < 0) {
			this.destroy();
		}
	}

	onDestroy(callback) {
		this.destroy_callback = callback;
	}

	destroy() {
		if(this.destroy_callback) {
			this.destroy_callback(this.id);
		}
	}
}