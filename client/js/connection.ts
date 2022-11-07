import * as _ from 'underscore'
import * as $ from 'jquery'
import EventEmitter from 'eventemitter3'
import {io} from 'socket.io-client'
import {JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer} from 'json-rpc-2.0'

import config from './config'
import log from './log'
import Player from './player'
import PlayerGeneral from './player-general'
import EntityFactory from './entityfactory'
import {Messages} from '../../shared/constants'
import * as Types from '../../shared/gametypes'




class Connection extends EventEmitter {
	constructor(host: string, port: number) {
		super()
		this._conn = io('http://'+host+':'+port+'/')
		this._rpc = null
		this._connected = false
		this._err = null

		this._connPromise = new Promise((resolve, reject) => {
			this._conn.on('connect', (socket) => {
				this._connected = true
				console.log('connected!')

				this._rpc = new JSONRPCServerAndClient(
					new JSONRPCServer(),
					new JSONRPCClient(async (request) => {
						try {
							console.log('sending', JSON.stringify(request))
							this._conn.emit('rpc', JSON.stringify(request))
						}
						catch (error) {
							// ?
							// return new Promise.reject(error)
						}
					})
				)
				resolve()
			})
		})

		this._conn.on('disconnect', () => {
			console.log('Server.DISCONNECT')
			// does it automatically try to reconnect?
			// this._connected = false
			// this._conn = null
		})

		this._conn.on('err', (err: Error) => {
			console.log('Server.ERR', err)
			// this._connected = false
			// this._err = err
			// this._conn = null
		})

		this._conn.on('rpc', (message) => {
			console.log('RPC received', message)
			this._rpc.receiveAndSend(JSON.parse(message))
		})


		this.handlers = [];
		this.handlers[Messages.MOVE] = this.receiveMove;
		this.handlers[Messages.LOOTMOVE] = this.receiveLootMove;
		this.handlers[Messages.ATTACK] = this.receiveAttack;
		this.handlers[Messages.SPAWN] = this.receiveSpawn;
		this.handlers[Messages.DESPAWN] = this.receiveDespawn;
		this.handlers[Messages.HEALTH] = this.receiveHealth;
		this.handlers[Messages.CHAT] = this.receiveChat;
		this.handlers[Messages.EQUIP] = this.receiveEquipItem;
		this.handlers[Messages.DROP] = this.receiveDrop;
		this.handlers[Messages.TELEPORT] = this.receiveTeleport;
		this.handlers[Messages.DAMAGE] = this.receiveDamage;
		this.handlers[Messages.POPULATION] = this.receivePopulation;
		this.handlers[Messages.LIST] = this.receiveList;
		this.handlers[Messages.DESTROY] = this.receiveDestroy;
		this.handlers[Messages.KILL] = this.receiveKill;
		this.handlers[Messages.MANA] = this.receiveMana;
		this.handlers[Messages.BLINK] = this.receiveBlink;
	
		this.enable();

		this._conn.on('message', (data) => {
			if(data === 'timeout') {
				this.isTimeout = true
				return
			}
			console.log('Received:', JSON.stringify(data))
			this.receiveMessage(data)
		})

		/*this._conn.onerror = function(e) {
			log.error(e, true);
		};*/

		this._conn.on('disconnect', () => {
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


	async connect(): Promise<void> {
		if (this._err) {
			throw this._err
		}
		if (this._connected) {
			return
		}
		return this._connPromise
	}


	isConnected(): boolean {
		return this._connected
	}


	error(): Error {
		return this._err
	}


	enable() {
		this.isListening = true;
	}


	disable() {
		this.isListening = false;
	}


	sendMessage(json) {
		if(this._conn.connected) {
			this._conn.emit("message", json);
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

			if(character instanceof PlayerGeneral) {
				character.weaponName = Types.getKindAsString(weapon);
				character.armorName = Types.getKindAsString(armor);
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


	// receiveMaxHitpoints(data) {
	// 	if(this.max_hitpoints_callback) {
	// 		this.max_hitpoints_callback(data[1])
	// 	}
	// }

	// receiveMaxMana(data) {
	// 	if(this.max_mana_callback) {
	// 		this.max_mana_callback(data[1])
	// 	}
	// }

	receiveMana(data) {
		if(this.mana_callback) {
			this.mana_callback(data[1], Boolean(data[2]))
		}
	}


	receiveBlink(data) {
		if (this.blink_callback) {
			this.blink_callback(data[1])
		}
	}



	// receiveExperience(data) {
	// 	const exp = data[0]
	// 	this.emit(Messages.GAINEXP, exp)
	// }

	onReceiveBlink(callback) {
		this.blink_callback = callback
	}

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

	onPlayerChangeCurMana(callback) {
		this.mana_callback = callback;
	}



	sendMove(x, y) {
		this.sendMessage([Messages.MOVE, x, y]);
	}

	sendLootMove(item, x, y) {
		this.sendMessage([Messages.LOOTMOVE, x, y, item.id]);
	}

	sendAggro(mob) {
		this.sendMessage([Messages.AGGRO, mob.id]);
	}

	// sendAttack(mob) {
	// 	this.sendMessage([Messages.ATTACK, mob.id]);
	// }

	sendHit(mob) {
		this.sendMessage([Messages.HIT, mob.id]);
	}

	sendHurt(mob) {
		this.sendMessage([Messages.HURT, mob.id]);
	}

	sendChat(text) {
		this.sendMessage([Messages.CHAT, text]);
	}

	sendLoot(item) {
		this.sendMessage([Messages.LOOT, item.id]);
	}

	sendTeleport(x, y) {
		this.sendMessage([Messages.TELEPORT, x, y]);
	}

	sendWho(ids) {
		this.sendMessage([Messages.WHO, ...ids]);
	}

	sendZone() {
		this.sendMessage([Messages.ZONE]);
	}

	sendOpen(chest) {
		this.sendMessage([Messages.OPEN, chest.id]);
	}

	sendCheck(id) {
		this.sendMessage([Messages.CHECK, id]);
	}

	sendSpendAttr(attr: 'str'|'dex'|'vit'|'ene') {
		this.sendMessage([Messages.SPEND_ATTR, attr])
	}





	async previewPlayer(ident: string, secret: string): Promise<HeroInfo> {
		await this._connPromise
		if (this._err) {
			throw this._err
		}
		if (!this._connected) {
			throw new Error('Not connected to server')
		}

		return await this._rpc.request('previewPlayer', {ident, secret})
	}


	async createPlayer(charClassId: string, name: string): Promise<HeroInfo> {
		await this._connPromise
		return await this._rpc.request('createPlayer', {charClassId, name})
	}


	async enter({ident, secret}: {ident: string, secret: string}): Promise<{hero: HeroInfo, id: number, x: number, y: number}> {
		await this._connPromise
		return await this._rpc.request('enter', {ident, secret})
	}


	private _conn: any
	// private _ws: WebSocket
	private _rpc: any
	private _err: Error
	private _connected: boolean
	private _connPromise: Promise<void>

	private spawn_callback: any
	private movement_callback: any
	private despawn_callback: any
	private health_callback: any
	private chat_callback: any
	private spawn_character_callback: any
	private handlers: any
	private isListening: boolean
	private dispatched_callback: any
	private disconnected_callback: any
	private welcome_callback: any
	private move_callback: any
	private lootmove_callback: any
	private attack_callback: any
	private spawn_item_callback: any
	private spawn_chest_callback: any
	private equip_callback: any
	private drop_callback: any
	private teleport_callback: any
	private population_callback: any
	private dmg_callback: any
	private kill_callback: any
	private list_callback: any
	private mana_callback: any
	private blink_callback: any
	private destroy_callback: any
	private isTimeout: boolean
}





const connection = new Connection(config.host, config.port)
export default connection
