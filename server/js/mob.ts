import * as _ from 'underscore'

import * as log from './log'
import * as Utils from './utils'
import * as Messages from './message'
import ChestArea from './chestarea'
import Character from './Character'
import Player from './Player'
import MobArea from './mobarea'
import * as Types from '../../shared/gametypes'
import WorldServer from './WorldServer'




export default class Mob extends Character {
	constructor(world: WorldServer, id: any, kind: number, x: number, y: number) {
		super(id, "mob", kind, x, y)
		this.variant = Types.getMobVariantByKind(kind)
		this.world = world
		
		this.updateHitpoints()
		this.spawningX = x
		this.spawningY = y
		this.hatelist = []
		this.respawnTimeout = null
		this.returnTimeout = null
		this.isDead = false
		this.attackTarget = null
	}


	destroy() {
		this.isDead = true;
		this.hatelist = [];
		this.clearTarget();
		this.updateHitpoints();
		this.resetPosition();
		
		this.handleRespawn();
	}


	receiveDamage(player: Player, points: number) {
		this.hitpoints -= points;

		if (this.attackTarget === null) {
			this.attack(player)
		}
	}


	attack(player: Player) {
		this.attackTarget = player
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


	getWeaponLevel(): number {
		return this.variant.weapon
	}


	tick(deltaTime: number) {
		super.tick(deltaTime)

		// TODO: 
		//   have currentAction (i.e. current animation) and currentPlan (e.g. attacking player xy) ?

		if (this.attackTarget) {
			if (this.isAdjacentNonDiagonal(this.attackTarget)) {
				if (!this.isOnAttackCooldown) {
					console.log('ok adjacent', this.id, this.x+'/'+this.y, 'target:', this.attackTarget.id, this.attackTarget.x+'/'+this.attackTarget.y)
					this.world.onMobHitsPlayer(this, this.attackTarget)
					this.isOnAttackCooldown = true
					setTimeout(() => {
						this.isOnAttackCooldown = false
					}, this.variant.attackCooldown)
				}
			}
		}

		// If mob has finished moving to a different tile in order to avoid stacking, attack again from the new position.
		/*if(this.previousTarget && !this.isMoving()) {
			const t = this.previousTarget
			if(!t.isDead) {
				this.previousTarget = null
				this.createAttackLink(this, t)
				this.removeTarget()
				this.engage(t)
				return
			}
		}

		if(this.isAttacking() && !this.previousTarget) {
			var isMoving = this.tryMovingToADifferentTile(this) // Don't let multiple mobs stack on the same tile when attacking a player.
			
			if(this.canAttack(time)) {
				if(!isMoving) { // don't hit target if moving to a different tile.
					if(this.hasTarget() && this.getOrientationTo(this.target) !== this.orientation) {
						this.lookAtTarget()
					}
					
					this.hit()
					
					if(this.id === this.playerId) {
						connection.sendHit(this.target)
					}
					
					if(this instanceof PlayerGeneral && this.camera.isVisible(this)) {
						this.audioManager.playSound("hit"+Math.floor(Math.random()*2+1))
					}
					
					if(this.player && this.target?.id===this.player.id && !this.player.invincible) {
						connection.sendHurt(this)
					}
				}
			} else {
				if(this.hasTarget() && this.isDiagonallyAdjacent(this.target) && this.target instanceof PlayerGeneral && !this.target.isMoving()) {
					this.follow(this.target)
				}
			}
		}*/

		// if (this.isAttacking() && 

		// TODO: if attack target and too far away, then fuck it go home

		// this.player.onCheckAggro(() => {
		// 	this.forEachMob((mob) => {
		// 		if(mob.isAggressive && !mob.isAttacking() && this.player.isNear(mob, mob.aggroRange)) {
		// 			this.player.aggro(mob);
		// 		}
		// 	})
		// })

		// this.player.onAggro((mob) => {
		// 	if(!mob.isWaitingToAttack(this.player) && !this.player.isAttackedBy(mob)) {
		// 		this.player.log_info("Aggroed by " + mob.id + " at ("+this.player.gridX+", "+this.player.gridY+")");
		// 		connection.sendAggro(mob);
		// 		mob.waitToAttack(this.player);
		// 	}
		// })
	}


	/*private isMobOnSameTile(mob, x=undefined, y=undefined) {
		var X = x ?? mob.gridX,
			Y = y ?? mob.gridY,
			list = this.entityGrid[Y][X],
			result = false;
		
		_.each(list, (entity) => {
			if(entity instanceof Mob && entity.id !== mob.id) {
				result = true;
			}
		});
		return result;
	}
	
	private getFreeAdjacentNonDiagonalPosition(entity) {
		var result = null;
		
		entity.forEachAdjacentNonDiagonalPosition((x, y, orientation) => {
			if(!result && !this.map.isColliding(x, y) && !this.isMobAt(x, y)) {
				result = {x: x, y: y, o: orientation};
			}
		});
		return result;
	}
	
	private tryMovingToADifferentTile(character) {
		var attacker = character,
			target = character.target;
		
		if(attacker && target && target instanceof PlayerGeneral) {
			if(!target.isMoving() && attacker.getDistanceToEntity(target) === 0) {
				var pos;
				
				switch(target.orientation) {
					case Orientations.UP:
						pos = {
							x: target.gridX,
							y: target.gridY - 1,
							o: target.orientation
						}
						break;
					case Orientations.DOWN:
						pos = {
							x: target.gridX,
							y: target.gridY + 1,
							o: target.orientation
						}
						break;
					case Orientations.LEFT:
						pos = {
							x: target.gridX - 1,
							y: target.gridY,
							o: target.orientation
						}
						break;
					case Orientations.RIGHT:
						pos = {
							x: target.gridX + 1,
							y: target.gridY,
							o: target.orientation
						}
						break;
				}
				if(pos) {
					attacker.previousTarget = target;
					attacker.disengage();
					attacker.idle();
					this.makeCharacterGoTo(attacker, pos.x, pos.y);
					target.adjacentTiles[pos.o] = true;
					return true;
				}
			}
		
			if(!target.isMoving() && attacker.isAdjacentNonDiagonal(target) && this.isMobOnSameTile(attacker)) {
				var pos = this.getFreeAdjacentNonDiagonalPosition(target);
		
				// avoid stacking mobs on the same tile next to a player
				// by making them go to adjacent tiles if they are available
				if(pos && !target.adjacentTiles[pos.o]) {
					if(this.player.target && attacker.id === this.player.target.id) {
						return false; // never unstack the player's target
					}
					
					attacker.previousTarget = target;
					attacker.disengage();
					attacker.idle();
					this.makeCharacterGoTo(attacker, pos.x, pos.y);
					target.adjacentTiles[pos.o] = true;
					
					return true;
				}
			}
		}
		return false;
	}*/


	isAttacking(): boolean {
		return this.attackTarget !== null
	}


	checkAggro(character: Player) {
		if (this.attackTarget!==null || !this.variant.behaviour.isAggressive) {
			return
		}
		const distance = this.getDistanceToEntity(character)
		if (distance <= this.variant.behaviour.aggroRange) {
			this.attackTarget = character
			console.log('aggro!')
		}
	}




	private variant: MobVariantInfo
	public spawningX: number
	public spawningY: number
	public hatelist: any
	public respawnTimeout: any
	public returnTimeout: any
	public isDead: boolean
	private previousTarget: any
	public area: MobArea
	public respawn_callback: any
	public move_callback: any

	private attackTarget: Player
	protected world: WorldServer
}