import Character from './character'




export default class Mob extends Character {
	constructor(id, variant) {
		super(id, variant.kind)

		this.moveSpeed = variant.moveSpeed
		this.setAttackRate(variant.attackCooldown)
	
		this.aggroRange = variant.behaviour.aggroRange
		this.isAggressive = variant.behaviour.isAggressive

		this.atkSpeed = variant.graphics.attackAnimationSpeed
		this.idleSpeed = variant.graphics.idleAnimationSpeed
		this.walkSpeed = variant.graphics.walkAnimationSpeed
		this.shadowOffsetY = variant.graphics.shadowOffsetY
	}
}
