export default class AnimatedTile {
    constructor(id, length, speed, index) {
        this.startId = id;
    	this.id = id;
    	this.length = length;
    	this.speed = speed;
    	this.index = index;
    	this.lastTime = 0;
        this.x = null
        this.y = null
    }

    tick() {
        if((this.id - this.startId) < this.length - 1) {
	        this.id += 1;
	    } else {
	        this.id = this.startId;
	    }
    }

    animate(time) {
        if((time - this.lastTime) > this.speed) {
    	    this.tick();
    	    this.lastTime = time;
    	    return true;
        } else {
            return false;
        }
    }
}