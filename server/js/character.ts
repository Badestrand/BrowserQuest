import * as log from './log'
import * as Messages from './message'
import * as Utils from './utils'
import Entity from './entity'
import * as Types from '../../shared/gametypes'




export default class Character extends Entity {
	constructor(id, type, kind, x, y) {
		super(id, type, kind, x, y);
		
		this.orientation = Utils.randomOrientation();
		this.attackers = {};
		this.target = null;
	}

	getState() {
		var basestate = this._getBaseState(),
			state = [];
		
		state.push(this.orientation);
		if(this.target) {
			state.push(this.target);
		}
		
		return basestate.concat(state);
	}
	
	resetHitpoints(maxHitpoints) {
		this.maxHitpoints = maxHitpoints;
		this.hitpoints = this.maxHitpoints;
	}
	
	regenHealthBy(value) {
		this.hitpoints = Math.min(this.maxHitpoints, this.hitpoints + value)
	}
	
	hasFullHealth() {
		return this.hitpoints === this.maxHitpoints;
	}
	
	setTarget(entity) {
		this.target = entity.id;
	}
	
	clearTarget() {
		this.target = null;
	}
	
	hasTarget() {
		return this.target !== null;
	}
	
	addAttacker(entity) {
		if(entity) {
			this.attackers[entity.id] = entity;
		}
	}
	
	removeAttacker(entity) {
		if(entity && entity.id in this.attackers) {
			delete this.attackers[entity.id];
			log.debug(this.id +" REMOVED ATTACKER "+ entity.id);
		}
	}
	
	forEachAttacker(callback) {
		for(var id in this.attackers) {
			callback(this.attackers[id]);
		}
	}


	public orientation: any
	public attackers: any
	public target: any
	public hitpoints: any
	public maxHitpoints: any
}