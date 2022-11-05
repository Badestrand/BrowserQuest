import * as _ from 'underscore'

import * as log from './log'
import * as Utils from './utils'
import * as Messages from './message'
import ChestArea from './chestarea'
import Character from './Character'
import MobArea from './mobarea'
import * as Types from '../../shared/gametypes'




export default class Mob extends Character {
	constructor(id: any, kind: number, x: number, y: number) {
		super(id, "mob", kind, x, y)
		this.variant = Types.getMobVariantByKind(kind)
		
		this.updateHitpoints()
		this.spawningX = x
		this.spawningY = y
		this.hatelist = []
		this.respawnTimeout = null
		this.returnTimeout = null
		this.isDead = false
	}


	destroy() {
		this.isDead = true;
		this.hatelist = [];
		this.clearTarget();
		this.updateHitpoints();
		this.resetPosition();
		
		this.handleRespawn();
	}


	receiveDamage(points, playerId) {
		this.hitpoints -= points;
	}


	hates(playerId) {
		return _.any(this.hatelist, function(obj) { 
			return obj.id === playerId; 
		});
	}


	increaseHateFor(playerId, points) {
		if(this.hates(playerId)) {
			_.detect(this.hatelist, function(obj) {
				return obj.id === playerId;
			}).hate += points;
		}
		else {
			this.hatelist.push({ id: playerId, hate: points });
		}

		/*
		log.debug("Hatelist : "+this.id);
		_.each(this.hatelist, function(obj) {
			log.debug(obj.id + " -> " + obj.hate);
		});*/
		
		if(this.returnTimeout) {
			// Prevent the mob from returning to its spawning position
			// since it has aggroed a new player
			clearTimeout(this.returnTimeout);
			this.returnTimeout = null;
		}
	}


	getHatedPlayerId(hateRank) {
		var i, playerId,
			sorted = _.sortBy(this.hatelist, function(obj) { return obj.hate; }),
			size = _.size(this.hatelist);
		
		if(hateRank && hateRank <= size) {
			i = size - hateRank;
		}
		else {
			i = size - 1;
		}
		if(sorted && sorted[i]) {
			playerId = sorted[i].id;
		}
		
		return playerId;
	}


	forgetPlayer(playerId, duration) {
		this.hatelist = _.reject(this.hatelist, function(obj) { return obj.id === playerId; });
		
		if(this.hatelist.length === 0) {
			this.returnToSpawningPosition(duration);
		}
	}


	forgetEveryone() {
		this.hatelist = [];
		this.returnToSpawningPosition(1);
	}


	handleRespawn() {
		var delay = 30000,
			self = this;
		
		if(this.area && this.area instanceof MobArea) {
			// Respawn inside the area if part of a MobArea
			this.area.respawnMob(this, delay);
		}
		else {
			if(this.area && this.area instanceof ChestArea) {
				this.area.removeFromArea(this);
			}
			
			setTimeout(function() {
				if(self.respawn_callback) {
					self.respawn_callback();
				}
			}, delay);
		}
	}


	onRespawn(callback) {
		this.respawn_callback = callback;
	}


	resetPosition() {
		this.setPosition(this.spawningX, this.spawningY);
	}


	returnToSpawningPosition(waitDuration) {
		var self = this,
			delay = waitDuration || 4000;
		
		this.clearTarget();
		
		this.returnTimeout = setTimeout(function() {
			self.resetPosition();
			self.move(self.x, self.y);
		}, delay);
	}


	onMove(callback) {
		this.move_callback = callback;
	}


	move(x, y) {
		this.setPosition(x, y);
		if(this.move_callback) {
			this.move_callback(this);
		}
	}


	updateHitpoints() {
		this.resetHitpoints(this.variant.hp)
	}


	distanceToSpawningPoint(x, y) {
		return Utils.distanceTo(x, y, this.spawningX, this.spawningY);
	}


	private variant: MobVariantInfo
	public spawningX: number
	public spawningY: number
	public hatelist: any
	public respawnTimeout: any
	public returnTimeout: any
	public isDead: boolean
	public area: MobArea
	public respawn_callback: any
	public move_callback: any
}