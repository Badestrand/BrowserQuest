import * as _ from 'underscore'
import * as $ from 'jquery'
import EventEmitter from 'eventemitter3'
import {io} from 'socket.io-client'

import server from './server'
import log from './log'
import Player from './player'
import EntityFactory from './entityfactory'
import * as Types from '../../shared/gametypes'



/*
	Currently this class runs on callbacks but I started to convert it to use a event emitter to make it leaner.

	I am not sure though yet on when I need to detach the listeners from here. Because with the callbacks there
	  always was only one but with the listeners it may crash things if there are some from old states.
*/


// TODO: Fuse this and ./server.ts
export default class GameClient extends EventEmitter {
	constructor() {
		super()
		// this.connection = null;

		this.handlers = [];
		// this.handlers[Types.Messages.WELCOME] = this.receiveWelcome;
		this.handlers[Types.Messages.MOVE] = this.receiveMove;
		this.handlers[Types.Messages.LOOTMOVE] = this.receiveLootMove;
		this.handlers[Types.Messages.ATTACK] = this.receiveAttack;
		this.handlers[Types.Messages.SPAWN] = this.receiveSpawn;
		this.handlers[Types.Messages.DESPAWN] = this.receiveDespawn;
		// this.handlers[Types.Messages.SPAWN_BATCH] = this.receiveSpawnBatch;
		this.handlers[Types.Messages.HEALTH] = this.receiveHealth;
		this.handlers[Types.Messages.CHAT] = this.receiveChat;
		this.handlers[Types.Messages.EQUIP] = this.receiveEquipItem;
		this.handlers[Types.Messages.DROP] = this.receiveDrop;
		this.handlers[Types.Messages.TELEPORT] = this.receiveTeleport;
		this.handlers[Types.Messages.DAMAGE] = this.receiveDamage;
		this.handlers[Types.Messages.POPULATION] = this.receivePopulation;
		this.handlers[Types.Messages.LIST] = this.receiveList;
		this.handlers[Types.Messages.DESTROY] = this.receiveDestroy;
		this.handlers[Types.Messages.KILL] = this.receiveKill;
		this.handlers[Types.Messages.HP] = this.receiveHitPoints;
		this.handlers[Types.Messages.BLINK] = this.receiveBlink;
		// this.handlers[Types.Messages.GAINEXP] = this.receiveExperience;
	
		this.enable();

		// this.connection = io(url, {
		// 	forceNew: true
		// })
		// this.connection.on('connect', (socket) => {
		// 	log.info("Connected to server " + url)
		// 	if(self.connected_callback) {
		// 		self.connected_callback()
		// 	}
		// });

		this.connection = server.connection()

		this.connection.on('message', (data) => {
			console.log('received message', data)
			if(data === 'timeout') {
				this.isTimeout = true
				return
			}
			this.receiveMessage(data)
		})

		/*this.connection.onerror = function(e) {
			log.error(e, true);
		};*/

		this.connection.on('disconnect', () => {
			log.debug("Connection closed")

			if(this.disconnected_callback) {
				if(this.isTimeout) {
					this.disconnected_callback("You have been disconnected for being inactive for too long.")
				} else {
					this.disconnected_callback("The connection to BrowserQuest has been lost.")
				}
			}
		})
	}


	enable() {
		this.isListening = true;
	}


	disable() {
		this.isListening = false;
	}


	sendMessage(json) {
		if(this.connection.connected) {
			this.connection.emit("message", json);
		}
	}


	receiveMessage(message) {
	
		if(this.isListening) {
   
			log.debug("data: " + message);

			if(message instanceof Array) {
				if(message[0] instanceof Array) {
					// Multiple actions received
					this.receiveActionBatch(message);
				} else {
					// Only one action received
					this.receiveAction(message);
				}
			}
		}
	}


	receiveAction(data) {
		var action = data[0];
		if(this.handlers[action] && _.isFunction(this.handlers[action])) {
			this.handlers[action].call(this, data);
		}
		else {
			log.error("Unknown action : " + action);
		}
	}


	receiveActionBatch(actions) {
		var self = this;

		_.each(actions, function(action) {
			self.receiveAction(action);
		});
	}


	receiveWelcome(data) {
		var id = data[1],
			x = data[2],
			y = data[3]
	
		if(this.welcome_callback) {
			this.welcome_callback(id, x, y);
		}
	}


	receiveMove(data) {
		var id = data[1],
			x = data[2],
			y = data[3];
	
		if(this.move_callback) {
			this.move_callback(id, x, y);
		}
	}


	receiveLootMove(data) {
		var id = data[1], 
			item = data[2];
	
		if(this.lootmove_callback) {
			this.lootmove_callback(id, item);
		}
	}


	receiveAttack(data) {
		var attacker = data[1], 
			target = data[2];
	
		if(this.attack_callback) {
			this.attack_callback(attacker, target);
		}
	}


	receiveSpawn(data) {
		var id = data[1],
			kind = data[2],
			x = data[3],
			y = data[4];
	
		if(Types.isItem(kind)) {
			var item = EntityFactory.createEntity(kind, id);
		
			if(this.spawn_item_callback) {
				this.spawn_item_callback(item, x, y);
			}
		} else if(Types.isChest(kind)) {
			var item = EntityFactory.createEntity(kind, id);
		
			if(this.spawn_chest_callback) {
				this.spawn_chest_callback(item, x, y);
			}
		} else {
			var name, orientation, target, weapon, armor;
		
			if(Types.isPlayer(kind)) {
				name = data[5];
				orientation = data[6];
				armor = data[7];
				weapon = data[8];
				if(data.length > 9) {
					target = data[9];
				}
			}
			else if(Types.isMob(kind)) {
				orientation = data[5];
				if(data.length > 6) {
					target = data[6];
				}
			}

			var character = EntityFactory.createEntity(kind, id, name);
		
			if(character instanceof Player) {
				character.weaponName = Types.getKindAsString(weapon);
				character.spriteName = Types.getKindAsString(armor);
			}
		
			if(this.spawn_character_callback) {
				this.spawn_character_callback(character, x, y, orientation, target);
			}
		}
	}


	receiveDespawn(data) {
		var id = data[1];
	
		if(this.despawn_callback) {
			this.despawn_callback(id);
		}
	}


	receiveHealth(data) {
		var points = data[1],
			isRegen = false;
	
		if(data[2]) {
			isRegen = true;
		}
	
		if(this.health_callback) {
			this.health_callback(points, isRegen);
		}
	}


	receiveChat(data) {
		var id = data[1],
			text = data[2];
	
		if(this.chat_callback) {
			this.chat_callback(id, text);
		}
	}


	receiveEquipItem(data) {
		var id = data[1],
			itemKind = data[2];
	
		if(this.equip_callback) {
			this.equip_callback(id, itemKind);
		}
	}


	receiveDrop(data) {
		var mobId = data[1],
			id = data[2],
			kind = data[3];
	
		var item = EntityFactory.createEntity(kind, id);
		item.wasDropped = true;
		item.playersInvolved = data[4];
	
		if(this.drop_callback) {
			this.drop_callback(item, mobId);
		}
	}


	receiveTeleport(data) {
		var id = data[1],
			x = data[2],
			y = data[3];
	
		if(this.teleport_callback) {
			this.teleport_callback(id, x, y);
		}
	}


	receiveDamage(data) {
		var id = data[1],
			dmg = data[2];
	
		if(this.dmg_callback) {
			this.dmg_callback(id, dmg);
		}
	}


	receivePopulation(data) {
		var worldPlayers = data[1],
			totalPlayers = data[2];
	
		if(this.population_callback) {
			this.population_callback(worldPlayers, totalPlayers);
		}
	}


	receiveKill(data) {
		const mobKind = data[1]
		const exp = data[2]
	
		if(this.kill_callback) {
			this.kill_callback(mobKind, exp)
		}
	}


	receiveList(data) {
		data.shift();
	
		if(this.list_callback) {
			this.list_callback(data);
		}
	}


	receiveDestroy(data) {
		var id = data[1];
	
		if(this.destroy_callback) {
			this.destroy_callback(id);
		}
	}


	receiveHitPoints(data) {
		var maxHp = data[1];
	
		if(this.hp_callback) {
			this.hp_callback(maxHp);
		}
	}


	receiveBlink(data) {
		var id = data[1];
		this.emit(Types.Messages.BLINK, id)
	}



	// receiveExperience(data) {
	// 	const exp = data[0]
	// 	this.emit(Types.Messages.GAINEXP, exp)
	// }

	onDispatched(callback) {
		this.dispatched_callback = callback;
	}

	// onConnected(callback) {
	// 	this.connected_callback = callback;
	// }
	
	onDisconnected(callback) {
		this.disconnected_callback = callback;
	}

	onWelcome(callback) {
		this.welcome_callback = callback;
	}

	onSpawnCharacter(callback) {
		this.spawn_character_callback = callback;
	}

	onSpawnItem(callback) {
		this.spawn_item_callback = callback;
	}

	onSpawnChest(callback) {
		this.spawn_chest_callback = callback;
	}

	onDespawnEntity(callback) {
		this.despawn_callback = callback;
	}

	onEntityMove(callback) {
		this.move_callback = callback;
	}

	onEntityAttack(callback) {
		this.attack_callback = callback;
	}

	onPlayerChangeHealth(callback) {
		this.health_callback = callback;
	}

	onPlayerEquipItem(callback) {
		this.equip_callback = callback;
	}

	onPlayerMoveToItem(callback) {
		this.lootmove_callback = callback;
	}

	onPlayerTeleport(callback) {
		this.teleport_callback = callback;
	}

	onChatMessage(callback) {
		this.chat_callback = callback;
	}

	onDropItem(callback) {
		this.drop_callback = callback;
	}

	onPlayerDamageMob(callback) {
		this.dmg_callback = callback;
	}

	onPlayerKillMob(callback) {
		this.kill_callback = callback;
	}

	onPopulationChange(callback) {
		this.population_callback = callback;
	}

	onEntityList(callback) {
		this.list_callback = callback;
	}

	onEntityDestroy(callback) {
		this.destroy_callback = callback;
	}

	onPlayerChangeMaxHitPoints(callback) {
		this.hp_callback = callback;
	}



	sendMove(x, y) {
		this.sendMessage([Types.Messages.MOVE, x, y]);
	}

	sendLootMove(item, x, y) {
		this.sendMessage([Types.Messages.LOOTMOVE, x, y, item.id]);
	}

	sendAggro(mob) {
		this.sendMessage([Types.Messages.AGGRO, mob.id]);
	}

	sendAttack(mob) {
		this.sendMessage([Types.Messages.ATTACK, mob.id]);
	}

	sendHit(mob) {
		this.sendMessage([Types.Messages.HIT, mob.id]);
	}

	sendHurt(mob) {
		this.sendMessage([Types.Messages.HURT, mob.id]);
	}

	sendChat(text) {
		this.sendMessage([Types.Messages.CHAT, text]);
	}

	sendLoot(item) {
		this.sendMessage([Types.Messages.LOOT, item.id]);
	}

	sendTeleport(x, y) {
		this.sendMessage([Types.Messages.TELEPORT, x, y]);
	}

	sendWho(ids) {
		this.sendMessage([Types.Messages.WHO, ...ids]);
	}

	sendZone() {
		this.sendMessage([Types.Messages.ZONE]);
	}

	sendOpen(chest) {
		this.sendMessage([Types.Messages.OPEN, chest.id]);
	}

	sendCheck(id) {
		this.sendMessage([Types.Messages.CHECK, id]);
	}

	sendSpendAttr(attr: 'str'|'dex'|'vit'|'ene') {
		this.sendMessage([Types.Messages.SPEND_ATTR, attr])
	}



	public connection: any
	// public connected_callback: any
	public spawn_callback: any
	public movement_callback: any
	public despawn_callback: any
	public health_callback: any
	public chat_callback: any
	public spawn_character_callback: any
	public handlers: any
	public isListening: boolean
	public dispatched_callback: any
	public disconnected_callback: any
	public welcome_callback: any
	public move_callback: any
	public lootmove_callback: any
	public attack_callback: any
	public spawn_item_callback: any
	public spawn_chest_callback: any
	public equip_callback: any
	public drop_callback: any
	public teleport_callback: any
	public population_callback: any
	public dmg_callback: any
	public kill_callback: any
	public list_callback: any
	public hp_callback: any
	public destroy_callback: any
	public isTimeout: boolean
}