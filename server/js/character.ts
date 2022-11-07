import * as log from './log'
import * as Messages from './message'
import * as Utils from './utils'
import Entity from './entity'
import * as Types from '../../shared/gametypes'
import {Orientations} from '../../shared/constants'




export default class Character extends Entity {
	constructor(id, type, kind, x, y) {
		super(id, type, kind, x, y);
		
		this.orientation = Utils.randomOrientation();

		// combat
		this.target = null;
		this.attackers = {}
		this.isOnAttackCooldown = false
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

	regenHealthBy(value: number) {
		const before = this.hitpoints
		this.hitpoints = Math.min(this.maxHitpoints, this.hitpoints + value)
		if (this.hitpoints !== before) {
			this.emit('hitpoints', this.hitpoints, true)
		}
	}

	hasFullHealth() {
		return this.hitpoints === this.maxHitpoints;
	}



	tick(deltaTime: number) {
		const REGEN_PERCENT_PER_SEC = 1

		if (this.hitpoints === this.maxHitpoints) {
			this.regenerationFraction = 0
		}
		else {
			const newRegen = this.maxHitpoints * (REGEN_PERCENT_PER_SEC / 100) * deltaTime
			this.regenerationFraction += newRegen
			if (this.regenerationFraction >= 1) {
				const points = Math.floor(this.regenerationFraction)
				this.regenerationFraction -= points
				this.regenHealthBy(points)
			}
		}
	}



	// COMBAT
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

	canAttack() {
		return this.canReachTarget() && !this.isOnAttackCooldown
	}

	canReachTarget() {
		return this.hasTarget() && this.isAdjacentNonDiagonal(this.target)
	}



	protected target: Character
	protected isOnAttackCooldown: boolean
	// COMBAT END



	// movement
	/*private path: any
	private destination: any
	private newDestination: any
	private step: number
	private nextGridX: number
	private nextGridY: number
	private adjacentTiles: any
	private isFollowing: boolean

	isMoving() {
		return this.path !== null
	}

	hasChangedItsPath() {
		return this.newDestination !== null
	}

	hasNextStep() {
		return this.step < this.path.length - 1
	}

	turnTo(orientation) {
		this.orientation = orientation;
		this.idle();
	}

	setOrientation(orientation) {
		if(orientation) {
			this.orientation = orientation;
		}
	}

	idle(orientation=null) {
		this.setOrientation(orientation);
		// this.animate("idle", this.idleSpeed);
	}

	hit(orientation) {
		this.setOrientation(orientation);
		// this.animate("atk", this.atkSpeed, 1);
	}

	walk(orientation) {
		this.setOrientation(orientation);
		// this.animate("walk", this.walkSpeed);
	}

	private moveTo_(x, y) {
		this.destination = {
			gridX: x,
			gridY: y
		}
		this.adjacentTiles = {};
	
		if(this.isMoving()) {
			this.continueTo(x, y);
		}
		else {
			var path = this.requestPathfindingTo(x, y);
		
			this.followPath(path);
		}
	}

	private requestPathfindingTo(x, y) {
		if(this.request_path_callback) {
			return this.request_path_callback(x, y);
		} else {
			log.error(this.id + " couldn't request pathfinding to "+x+", "+y);
			return [];
		}
	}

	private followPath(path) {
		if(path.length > 1) { // Length of 1 means the player has clicked on himself
			this.path = path;
			this.step = 0;
		
			if(this.isFollowing) { // following a character
				path.pop();
			}
		
			if(this.start_pathing_callback) {
				this.start_pathing_callback(path);
			}
			this.nextStep();
		}
	}

	private continueTo(x, y) {
		this.newDestination = {x, y}
	}

	private updatePositionOnGrid() {
		this.setGridPosition(this.path[this.step][0], this.path[this.step][1]);
	}

	private updateMovement() {
		var p = this.path,
			i = this.step;
	
		if(p[i][0] < p[i-1][0]) {
			this.walk(Orientations.LEFT);
		}
		if(p[i][0] > p[i-1][0]) {
			this.walk(Orientations.RIGHT);
		}
		if(p[i][1] < p[i-1][1]) {
			this.walk(Orientations.UP);
		}
		if(p[i][1] > p[i-1][1]) {
			this.walk(Orientations.DOWN);
		}
	}

	private nextStep() {
		var stop = false,
			x, y, path;
	
		if(this.isMoving()) {
			if(this.before_step_callback) {
				this.before_step_callback();
			}
		
			this.updatePositionOnGrid();
			// this.checkAggro();
		
			if(this.interrupted) { // if Character.stop() has been called
				stop = true;
				this.interrupted = false;
			}
			else {
				if(this.hasNextStep()) {
					this.nextGridX = this.path[this.step+1][0];
					this.nextGridY = this.path[this.step+1][1];
				}
		
				if(this.step_callback) {
					this.step_callback();
				}
			
				if(this.hasChangedItsPath()) {
					x = this.newDestination.x;
					y = this.newDestination.y;
					path = this.requestPathfindingTo(x, y);
			
					this.newDestination = null;
					if(path.length < 2) {
						stop = true;
					}
					else {
						this.followPath(path);
					}
				}
				else if(this.hasNextStep()) {
					this.step += 1;
					this.updateMovement();
				}
				else {
					stop = true;
				}
			}
		
			if(stop) { // Path is complete or has been interrupted
				this.path = null;
				this.idle();
			
				if(this.stop_pathing_callback) {
					this.stop_pathing_callback(this.gridX, this.gridY);
				}
			}
		}
	}*/

	/*updateCharacter(c) {
		var self = this;

		// Estimate of the movement distance for one update
		var tick = Math.round(16 / Math.round((c.moveSpeed / (1000 / this.game.renderer.FPS))));

		if(c.isMoving() && c.movement.inProgress === false) {
			if(c.orientation === Orientations.LEFT) {
				c.movement.start(this.game.currentTime,
								 function(x) {
									c.x = x;
									c.hasMoved();
								 },
								 function() {
									c.x = c.movement.endValue;
									c.hasMoved();
									c.nextStep();
								 },
								 c.x - tick,
								 c.x - 16,
								 c.moveSpeed);
			}
			else if(c.orientation === Orientations.RIGHT) {
				c.movement.start(this.game.currentTime,
								 function(x) {
									c.x = x;
									c.hasMoved();
								 },
								 function() {
									c.x = c.movement.endValue;
									c.hasMoved();
									c.nextStep();
								 },
								 c.x + tick,
								 c.x + 16,
								 c.moveSpeed);
			}
			else if(c.orientation === Orientations.UP) {
				c.movement.start(this.game.currentTime,
								 function(y) {
									c.y = y;
									c.hasMoved();
								 },
								 function() {
									c.y = c.movement.endValue;
									c.hasMoved();
									c.nextStep();
								 },
								 c.y - tick,
								 c.y - 16,
								 c.moveSpeed);
			}
			else if(c.orientation === Orientations.DOWN) {
				c.movement.start(this.game.currentTime,
								 function(y) {
									c.y = y;
									c.hasMoved();
								 },
								 function() {
									c.y = c.movement.endValue;
									c.hasMoved();
									c.nextStep();
								 },
								 c.y + tick,
								 c.y + 16,
								 c.moveSpeed);
			}
		}
	}
	*/



	public orientation: any
	public attackers: {[id: number]: Character}
	public hitpoints: number
	public maxHitpoints: number

	private regenerationFraction: number
}