import EventEmitter from 'eventemitter3'

import * as Messages from './message'
import * as Utils from './utils'




export default class Entity extends EventEmitter {
	constructor(id, type, kind, x, y) {
		super()
		this.id = parseInt(id);
		this.type = type;
		this.kind = kind;
		this.x = x;
		this.y = y;
	}

	
	destroy() {
	}
	

	_getBaseState() {
		return [
			parseInt(this.id),
			this.kind,
			this.x,
			this.y
		];
	}
	

	getState() {
		return this._getBaseState();
	}

	
	setPosition(x, y) {
		console.log(this.id, 'moving to', x, y, new Error().stack)
		this.x = x;
		this.y = y;
	}

	
	getPositionNextTo(entity) {
		var pos = null;
		if(entity) {
			pos = {};
			// This is a quick & dirty way to give mobs a random position
			// close to another entity.
			var r = Utils.random(4);
			
			pos.x = entity.x;
			pos.y = entity.y;
			if(r === 0)
				pos.y -= 1;
			if(r === 1)
				pos.y += 1;
			if(r === 2)
				pos.x -= 1;
			if(r === 3)
				pos.x += 1;
		}
		return pos;
	}


	getDistanceToEntity(entity: Entity): number {
		// use manhattan distance
		// return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)

		const distX = Math.abs(entity.x - this.x)
		const distY = Math.abs(entity.y - this.y)
		return (distX > distY) ? distX : distY
	}


	isAdjacent(entity) {
		return this.getDistanceToEntity(entity) > 1 ? false : true
	}


	isAdjacentNonDiagonal(entity) {
		return this.isAdjacent(entity) && (this.x===entity.x || this.y===entity.y)
	}


	isDiagonallyAdjacent(entity) {
		return this.isAdjacent(entity) && !this.isAdjacentNonDiagonal(entity)
	}


	isCloseTo(entity) {
		var dx, dy, d, close = false;
		if(entity) {
			dx = Math.abs(entity.x - this.x)
			dy = Math.abs(entity.y - this.y)
			if(dx < 30 && dy < 14) {
				close = true
			}
		}
		return close
	}


	// forEachAdjacentNonDiagonalPosition(callback) {
	// 	callback(this.gridX - 1, this.gridY, Orientations.LEFT);
	// 	callback(this.gridX, this.gridY - 1, Orientations.UP);
	// 	callback(this.gridX + 1, this.gridY, Orientations.RIGHT);
	// 	callback(this.gridX, this.gridY + 1, Orientations.DOWN);
	// }



	public id: any
	public type: any
	public kind: any
	public x: any
	public y: any
}