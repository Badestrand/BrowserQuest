import * as _ from 'underscore'

import * as log from './log'
import * as Utils from './utils'
import * as Types from '../../shared/gametypes'




class Message {
}


export class Spawn extends Message {
	constructor(entity) {
		super()
		this.entity = entity;
	}

	serialize() {
		var spawn = [Types.Messages.SPAWN];
		return spawn.concat(this.entity.getState());
	}

	public entity: any
}


export class Despawn extends Message {
	constructor(entityId) {
		super()
		this.entityId = entityId;
	}

	serialize() {
		return [Types.Messages.DESPAWN, this.entityId];
	}

	public entityId: any
}


export class Move extends Message {
	constructor(entity) {
		super()
		this.entity = entity;
	}

	serialize() {
		return [Types.Messages.MOVE,
				this.entity.id,
				this.entity.x,
				this.entity.y];
	}

	public entity: any
}


export class LootMove extends Message {
	constructor(entity, item) {
		super()
		this.entity = entity;
		this.item = item;
	}

	serialize() {
		return [Types.Messages.LOOTMOVE,
				this.entity.id,
				this.item.id];
	}

	public entity: any
	public item: any
}


export class Attack extends Message {
	constructor(attackerId, targetId) {
		super()
		this.attackerId = attackerId;
		this.targetId = targetId;
	}

	serialize() {
		return [Types.Messages.ATTACK,
				this.attackerId,
				this.targetId];
	}

	public attackerId: any
	public targetId: any
}


export class CurHitpoints extends Message {
	constructor(points, isRegen) {
		super()
		this.points = points;
		this.isRegen = isRegen;
	}

	serialize() {
		var health = [Types.Messages.HEALTH,
					  this.points];
		if(this.isRegen) {
			health.push(1);
		}
		return health;
	}

	public points: any
	public isRegen: any
}


export class MaxHitpoints extends Message {
	constructor(maxHitpoints) {
		super()
		this.maxHitpoints = maxHitpoints;
	}

	serialize() {
		return [Types.Messages.MAX_HITPOINTS, this.maxHitpoints];
	}

	public maxHitpoints: any
}


export class CurMana extends Message {
	constructor(points, isRegen) {
		super()
		this.points = points;
		this.isRegen = isRegen;
	}

	serialize() {
		var health = [Types.Messages.MANA,
					  this.points];
		if(this.isRegen) {
			health.push(1);
		}
		return health;
	}

	public points: any
	public isRegen: any
}


export class MaxMana extends Message {
	constructor(points) {
		super()
		this.points = points;
	}

	serialize() {
		return [Types.Messages.MAX_MANA, this.points];
	}

	public points: any
}


export class EquipItem extends Message {
	constructor(player, itemKind) {
		super()
		this.playerId = player.id;
		this.itemKind = itemKind;
	}

	serialize() {
		return [Types.Messages.EQUIP,
				this.playerId,
				this.itemKind];
	}

	public playerId: any
	public itemKind: any
}


export class Drop extends Message {
	constructor(mob, item) {
		super()
		this.mob = mob;
		this.item = item;
	}

	serialize() {
		var drop = [Types.Messages.DROP,
					this.mob.id,
					this.item.id,
					this.item.kind,
					_.pluck(this.mob.hatelist, "id")];

		return drop;
	}

	public mob: any
	public item: any
}


export class Chat extends Message {
	constructor(player, message) {
		super()
		this.playerId = player.id;
		this.message = message;
	}

	serialize() {
		return [Types.Messages.CHAT,
				this.playerId,
				this.message];
	}

	public playerId: any
	public message: any
}


export class Teleport extends Message {
	constructor(entity) {
		super()
		this.entity = entity;
	}

	serialize() {
		return [Types.Messages.TELEPORT,
				this.entity.id,
				this.entity.x,
				this.entity.y];
	}

	public entity: any
}


export class Damage extends Message {
	constructor(entity, points) {
		super()
		this.entity = entity;
		this.points = points;
	}

	serialize() {
		return [Types.Messages.DAMAGE,
				this.entity.id,
				this.points];
	}

	public entity: any
	public points: any
}


export class Population extends Message {
	constructor(world, total) {
		super()
		this.world = world;
		this.total = total;
	}

	serialize() {
		return [Types.Messages.POPULATION,
				this.world,
				this.total];
	}

	public world: any
	public total: any
}


export class Kill extends Message {
	constructor(mob, exp) {
		super()
		this.mob = mob;
		this.exp = exp;
	}

	serialize() {
		return [Types.Messages.KILL, this.mob.kind, this.exp];
	}

	public mob: any
	public exp: any
}


export class List extends Message {
	constructor(ids) {
		super()
		this.ids = ids;
	}

	serialize() {
		var list = this.ids;
		
		list.unshift(Types.Messages.LIST);
		return list;
	}

	public ids: any
}


export class Destroy extends Message {
	constructor(entity) {
		super()
		this.entity = entity;
	}

	serialize() {
		return [Types.Messages.DESTROY,
				this.entity.id];
	}

	public entity: any
}


export class Blink extends Message {
	constructor(item) {
		super()
		this.item = item;
	}

	serialize() {
		return [Types.Messages.BLINK,
				this.item.id];
	}

	public item: any
}
