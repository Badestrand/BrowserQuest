import * as _ from 'underscore'

import log from './log'
import Entity from './entity'
import Transition from './transition'
import Timer from './timer'
import * as Types from '../../shared/gametypes'
import {Orientations} from '../../shared/constants'
import {clone} from './util'




export default class Character extends Entity {
	constructor(id, kind) {
		super(id, kind);
		var self = this;
		
		// Position and orientation
		this.nextGridX = -1;
		this.nextGridY = -1;
		this.orientation = Orientations.DOWN;
	
		// Speeds
		this.atkSpeed = 50;
		this.moveSpeed = 120;
		this.walkSpeed = 100;
		this.idleSpeed = 450;
		this.setAttackRate(800);
	
		// Pathing
		this.movement = new Transition();
		this.path = null;
		this.newDestination = null;
		this.adjacentTiles = {};
	
		// Combat
		this.target = null;
		this.unconfirmedTarget = null;
		// this.attackers = {};
	
		// Health
		this.hitpoints = 0;
		this.maxHitpoints = 0;
	
		// Modes
		this.isDead = false;
		this.attackingMode = false;
		this.isFollowing = false;
	}


	// clean() {
	// 	this.forEachAttacker(function(attacker) {
	// 		attacker.disengage();
	// 		attacker.idle();
	// 	});
	// }


	getCurHitpoints() {
		return this.hitpoints
	}


	getMaxHitpoints() {
		return this.maxHitpoints
	}


	setMaxHitpoints(hp) {
		this.maxHitpoints = hp;
		this.hitpoints = hp;
	}


	setDefaultAnimation() {
		this.idle();
	}


	hasWeapon() {
		return false;
	}


	hasShadow() {
		return true;
	}


	animate(animation, speed, count=null, onEndCount=null) {
		var oriented = ['atk', 'walk', 'idle'];
		var o = this.orientation;
		
		if(!(this.currentAnimation && this.currentAnimation.name === "death")) { // don't change animation if the character is dying
			this.flipSpriteX = false;
			this.flipSpriteY = false;
	
			if(_.indexOf(oriented, animation) >= 0) {
				animation += "_" + (o === Orientations.LEFT ? "right" : Types.getOrientationAsString(o));
				this.flipSpriteX = (this.orientation === Orientations.LEFT) ? true : false;
			}

			this.setAnimation(animation, speed, count, onEndCount);
		}
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
		this.animate("idle", this.idleSpeed);
	}


	hit(orientation) {
		this.setOrientation(orientation);
		this.animate("atk", this.atkSpeed, 1);
	}


	walk(orientation) {
		this.setOrientation(orientation);
		this.animate("walk", this.walkSpeed);
	}


	private moveTo_(x, y) {
		this.destination = { gridX: x, gridY: y };
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


	onRequestPath(callback) {
		this.request_path_callback = callback;
	}


	onStartPathing(callback) {
		this.start_pathing_callback = callback;
	}


	onStopPathing(callback) {
		this.stop_pathing_callback = callback;
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
		this.newDestination = { x: x, y: y };
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


	private updatePositionOnGrid() {
		this.setGridPosition(this.path[this.step][0], this.path[this.step][1]);
	}


	nextStep() {
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
	}


	onBeforeStep(callback) {
		this.before_step_callback = callback;
	}


	onStep(callback) {
		this.step_callback = callback;
	}


	isMoving() {
		return !(this.path === null);
	}


	hasNextStep() {
		return (this.path.length - 1 > this.step);
	}


	hasChangedItsPath() {
		return !(this.newDestination === null);
	}


	isNear(character, distance) {
		const dx = Math.abs(this.gridX - character.gridX)
		const dy = Math.abs(this.gridY - character.gridY)
		return dx<=distance && dy<=distance
	}


	// onAggro(callback) {
	// 	this.aggro_callback = callback;
	// }

	
	// onCheckAggro(callback) {
	// 	this.checkaggro_callback = callback;
	// }


	// checkAggro() {
	// 	if(this.checkaggro_callback) {
	// 		this.checkaggro_callback();
	// 	}
	// }
	

	// aggro(character) {
	// 	if(this.aggro_callback) {
	// 		this.aggro_callback(character);
	// 	}
	// }


	onDeath(callback) {
		this.death_callback = callback;
	}


	lookAtTarget() {
		if(this.target) {
			this.turnTo(this.getOrientationTo(this.target));
		}
	}


	go(x, y) {
		if(this.isAttacking()) {
			this.disengage();
		}
		else if(this.isFollowing) {
			this.isFollowing = false;
			this.target = null;
		}
		this.moveTo_(x, y);
	}


	follow(entity) {
		if(entity) {
			this.isFollowing = true;
			this.moveTo_(entity.gridX, entity.gridY);
		}
	}


	stop() {
		if(this.isMoving()) {
			this.interrupted = true;
		}
	}


	engage(character) {
		this.attackingMode = true;
		this.setTarget(character);
		this.follow(character);
	}


	disengage() {
		this.attackingMode = false;
		this.isFollowing = false;
		this.removeTarget();
	}


	isAttacking() {
		return this.attackingMode;
	}
	

	/**
	 * Gets the right orientation to face a target character from the current position.
	 * Note:
	 * In order to work properly, this method should be used in the following
	 * situation :
	 *    S
	 *  S T S
	 *    S
	 * (where S is self, T is target character)
	 * 
	 * @param {Character} character The character to face.
	 * @returns {String} The orientation.
	 */
	getOrientationTo(character) {
		if(this.gridX < character.gridX) {
			return Orientations.RIGHT;
		} else if(this.gridX > character.gridX) {
			return Orientations.LEFT;
		} else if(this.gridY > character.gridY) {
			return Orientations.UP;
		} else {
			return Orientations.DOWN;
		}
	}


	// isAttackedBy(character: Character) {
	// 	return (character.id in this.attackers);
	// }


	// addAttacker(character: Character) {
	// 	if(!this.isAttackedBy(character)) {
	// 		this.attackers[character.id] = character;
	// 	} else {
	// 		log.error(this.id + " is already attacked by " + character.id);
	// 	}
	// }


	// removeAttacker(character: Character) {
	// 	if(this.isAttackedBy(character)) {
	// 		delete this.attackers[character.id];
	// 	} else {
	// 		log.error(this.id + " is not attacked by " + character.id);
	// 	}
	// }


	// forEachAttacker(callback) {
	// 	_.each(this.attackers, function(attacker) {
	// 		callback(attacker);
	// 	})
	// }


	setTarget(character: Character) {
		if(character !== this.target) {
			if(this.hasTarget()) {
				this.removeTarget()
			}
			this.unconfirmedTarget = null
			this.target = character
		} else {
			log.debug(character.id + " is already the target of " + this.id)
		}
	}

	removeTarget() {
		if(this.target) {
			// if(this.target instanceof Character) {
			// 	this.target.removeAttacker(this)
			// }
			this.target = null
		}
	}

	hasTarget(): boolean {
		return this.target !== null
	}


	/**
	 * Marks this character as waiting to attack a target.
	 * By sending an "attack" message, the server will later confirm (or not)
	 * that this character is allowed to acquire this target.
	 *
	 * @param {Character} character The target character
	 */
	// waitToAttack(character) {
	// 	this.unconfirmedTarget = character;
	// }

	/**
	 * Returns true if this character is currently waiting to attack the target character.
	 * @param {Character} character The target character.
	 * @returns {Boolean} Whether this character is waiting to attack.
	 */
	// isWaitingToAttack(character) {
	// 	return (this.unconfirmedTarget === character);
	// }


	canAttack(time) {
		if(this.canReachTarget() && this.attackCooldown.isOver(time)) {
			return true;
		}
		return false;
	}
	

	canReachTarget() {
		if(this.hasTarget() && this.isAdjacentNonDiagonal(this.target)) {
			return true;
		}
		return false;
	}


	setCurHitpoints(points: number) {
		const isHurt = points < this.hitpoints
		this.hitpoints = points
		if(isHurt) {
			this.hurt()
		}
		if(this.hitpoints <= 0) {
			this.die()
		}
		this.emit('update')
	}


	die(isDisconnected: boolean=false) {
		this.removeTarget();
		this.isDead = true;
	
		if(this.death_callback) {
			this.death_callback(isDisconnected);
		}
	}


	onHasMoved(callback) {
		this.hasmoved_callback = callback;
	}


	hasMoved() {
		this.setDirty();
		if(this.hasmoved_callback) {
			this.hasmoved_callback(this);
		}
	}


	hurt() {
		this.stopHurting()
		this.sprite = this.hurtSprite
		this.hurting = setTimeout(this.stopHurting.bind(this), 75)
	}


	stopHurting() {
		this.sprite = this.normalSprite;
		clearTimeout(this.hurting);
	}


	setAttackRate(rate) {
		this.attackCooldown = new Timer(rate);
	}


	public previousTarget: any
	public attackCooldown: Timer
	public sprite: any
	public hurting: any
	public hasmoved_callback: any
	public death_callback: any
	// public aggro_callback: any
	// public checkaggro_callback: any
	public step_callback: any
	public before_step_callback: any
	public request_path_callback: any
	public start_pathing_callback: any
	public stop_pathing_callback: any
	public isDead: boolean
	public target: any
	public unconfirmedTarget: any
	// public attackers: any
	public attackingMode: any
	public isFollowing: any
	public interrupted: any
	public step: any
	public nextGridX: number
	public nextGridY: number
	public path: Array<[number, number]>
	public newDestination: any
	public adjacentTiles: any
	public destination: any
	public walkSpeed: any
	public atkSpeed: any
	public moveSpeed: any
	public idleSpeed: any
	public orientation: any
	public hitpoints: any
	public maxHitpoints: any
	public movement: any
	public isDying: any
}