import * as _ from 'underscore'
import * as fs from 'fs'
import crypto from 'crypto'

import {socketIOConnection} from './ws'
import * as log from './log'
import * as Messages from './message'
import * as Utils from './utils'
import Properties from './properties'
import Character from './character'
import Chest from './chest'
import World from './worldserver'
import * as Formulas from './formulas'
import check from './format'
import * as Types from '../../shared/gametypes'
import {AllCharacterClasses, getLevelFromExperience, ATTR_POINTS_PER_LEVEL} from '../../shared/game'




function getFilePath(ident: string): string {
	return process.cwd() + '/' + process.env.DATA_STORE_FOLDER + '/' + ident + '.json'
}


function createToken(prefix: string, length: number): string {
	return prefix + crypto.randomBytes(Math.ceil(length/2)).toString('hex')

	// let result = ''
	// const chars1 = 'abcdefghijklmnopqrstuvwxyz'
	// const chars2 = 'abcdefghijklmnopqrstuvwxyz0123456789'
	// result += chars1.charAt(Math.floor(Math.random() * chars1.length))
	// for (let i=1; i<length; i++) {
	// 	result += chars2.charAt(Math.floor(Math.random() * chars2.length))
	// }
	// return prefix+result
}


const INITIAL_ARMOR_ID = Types.getKindFromString('clotharmor')
const INITIAL_WEAPON_ID = Types.getKindFromString('sword1')




export default class Player extends Character {
	static create(charClassId: string, name: string): HeroInfo {
		const ident = createToken('player_', 10)
		const secret = createToken('secret_', 10)

		const cc = _.findWhere(AllCharacterClasses, {id: charClassId})
		if (!cc || !cc.isAvailable) {
			throw new Error('Invalid character class '+charClassId)
		}

		const cleanName = name === '' ? 'lorem ipsum' : Utils.sanitize(name).substr(0, 15)

		const data: HeroInfo = {
			ident: ident,
			secret: secret,
			name: cleanName,
			armorId: INITIAL_ARMOR_ID,
			weaponId: INITIAL_WEAPON_ID,
			charClassId,
			spentAttrPoints: {
				str: 0,
				dex: 0,
				vit: 0,
				ene: 0,
			},
			experience: 0,
		}
		fs.writeFileSync(getFilePath(ident), JSON.stringify(data, null, 4), 'utf8')
		return data

	}


	constructor(heroInfo: HeroInfo, connection: socketIOConnection, worldServer: World) {
		super(connection.id /*TODO: Should the player ID really be the connection id??*/, 'player', Types.Entities.WARRIOR, 0, 0)

		this.world = worldServer
		this.connection = connection
		this.hasEnteredGame = false
		this.isDead = false
		this.haters = {}
		this.lastCheckpoint = null
		this.disconnectTimeout = null

		// take over data
		this.ident = heroInfo.ident
		this.secret = heroInfo.secret
		this.name = heroInfo.name
		this.charClass = _.findWhere(AllCharacterClasses, {id: heroInfo.charClassId})
		this.spentAttrPoints = heroInfo.spentAttrPoints
		this.experience = heroInfo.experience
		this.armor = heroInfo.armorId
		this.weapon = heroInfo.weaponId

		// more initialization
		this.kind = Types.Entities.WARRIOR
		this.orientation = Utils.randomOrientation()
		this.updateHitPoints()
		this.updatePosition()

		// this.world.addPlayer(this)

		// this.send([Types.Messages.WELCOME, this.id, this.x, this.y])
		this.hasEnteredGame = true
		this.isDead = false


		this.connection.listen((message) => {
			var action = message[0]

			log.debug("Received: " + message);
			if(!check(message)) {
				this.connection.close("Invalid "+Types.getMessageTypeAsString(action)+" message format: "+message);
				return;
			}

			this.resetTimeout();

			if(action === Types.Messages.WHO) {
				message.shift();
				this.world.pushSpawnsToPlayer(this, message);
			}
			else if(action === Types.Messages.ZONE) {
				this.zone_callback();
			}
			else if(action === Types.Messages.CHAT) {
				var msg = Utils.sanitize(message[1]);
				
				// Sanitized messages may become empty. No need to broadcast empty chat messages.
				if(msg && msg !== "") {
					msg = msg.substr(0, 60); // Enforce maxlength of chat input
					this.broadcastToZone(new Messages.Chat(this, msg), false);
				}
			}
			else if(action === Types.Messages.MOVE) {
				if(this.move_callback) {
					var x = message[1],
						y = message[2];
					
					if(this.world.isValidPosition(x, y)) {
						this.setPosition(x, y);
						this.clearTarget();
						
						this.broadcast(new Messages.Move(this));
						this.move_callback(this.x, this.y);
					}
				}
			}
			else if(action === Types.Messages.LOOTMOVE) {
				if(this.lootmove_callback) {
					this.setPosition(message[1], message[2]);
					
					var item = this.world.getEntityById(message[3]);
					if(item) {
						this.clearTarget();

						this.broadcast(new Messages.LootMove(this, item));
						this.lootmove_callback(this.x, this.y);
					}
				}
			}
			else if(action === Types.Messages.AGGRO) {
				if(this.move_callback) {
					this.world.handleMobHate(message[1], this.id, 5);
				}
			}
			else if(action === Types.Messages.ATTACK) {
				var mob = this.world.getEntityById(message[1]);
				
				if(mob) {
					this.setTarget(mob);
					this.world.broadcastAttacker(this);
				}
			}
			else if(action === Types.Messages.HIT) {
				var mob = this.world.getEntityById(message[1]);

				if(mob) {
					var dmg = Formulas.dmg(Properties.getWeaponLevel(this.weapon), mob.armorLevel);
					
					if(dmg > 0) {
						mob.receiveDamage(dmg, this.id);
						this.world.handleMobHate(mob.id, this.id, dmg);
						this.world.handleHurtEntity(mob, this, dmg);
					}
				}
			}
			else if(action === Types.Messages.HURT) {
				var mob = this.world.getEntityById(message[1]);
				if(mob && this.hitpoints > 0) {
					this.hitpoints -= Formulas.dmg(mob.weaponLevel, Properties.getArmorLevel(this.armor));
					this.world.handleHurtEntity(this, mob);
					
					if(this.hitpoints <= 0) {
						this.isDead = true;
						if(this.firepotionTimeout) {
							clearTimeout(this.firepotionTimeout);
						}
					}
				}
			}
			else if(action === Types.Messages.LOOT) {
				var item = this.world.getEntityById(message[1]);
				
				if(item) {
					var kind = item.kind;
					
					if(Types.isItem(kind)) {
						this.broadcast(item.despawn());
						this.world.removeEntity(item);
						
						if(kind === Types.Entities.FIREPOTION) {
							this.updateHitPoints();
							this.broadcast(this.equip(Types.Entities.FIREFOX));
							this.firepotionTimeout = setTimeout(() => {
								this.broadcast(this.equip(this.armor)); // return to normal after 15 sec
								this.firepotionTimeout = null;
							}, 15000);
							this.send(new Messages.HitPoints(this.maxHitpoints).serialize());
						} else if(Types.isHealingItem(kind)) {
							var amount;
							
							switch(kind) {
								case Types.Entities.FLASK: 
									amount = 40;
									break;
								case Types.Entities.BURGER: 
									amount = 100;
									break;
							}
							
							if(!this.hasFullHealth()) {
								this.regenHealthBy(amount);
								this.world.pushToPlayer(this, this.health());
							}
						} else if(Types.isArmor(kind) || Types.isWeapon(kind)) {
							this.equipItem(item);
							this.broadcast(this.equip(kind));
						}
					}
				}
			}
			else if(action === Types.Messages.TELEPORT) {
				var x = message[1],
					y = message[2];
				
				if(this.world.isValidPosition(x, y)) {
					this.setPosition(x, y);
					this.clearTarget();
					
					this.broadcast(new Messages.Teleport(this));
					
					this.world.handlePlayerVanish(this);
					this.world.pushRelevantEntityListTo(this);
				}
			}
			else if(action === Types.Messages.OPEN) {
				var chest = this.world.getEntityById(message[1]);
				if(chest && chest instanceof Chest) {
					this.world.handleOpenedChest(chest, this);
				}
			}
			else if(action === Types.Messages.CHECK) {
				var checkpoint = this.world.map.getCheckpoint(message[1]);
				if(checkpoint) {
					this.lastCheckpoint = checkpoint;
				}
			}
			else if(action === Types.Messages.SPEND_ATTR) {
				const attr = message[1]
				if ((attr==='str' || attr==='dex' || attr==='vit' || attr==='ene') && this.getUnspentAttrPoints()>0) {
					this.spendAttrPoint(attr)
					this.world.pushToPlayer(this, this.health())
					this.send(new Messages.HitPoints(this.maxHitpoints).serialize())
				}
			}
			else {
				if(this.message_callback) {
					this.message_callback(message);
				}
			}
		})
		
		this.connection.onClose(() => {
			if(this.firepotionTimeout) {
				clearTimeout(this.firepotionTimeout);
			}
			clearTimeout(this.disconnectTimeout);
			if(this.exit_callback) {
				this.exit_callback();
			}
		});
	}


	destroy() {
		this.forEachAttacker(function(mob) {
			mob.clearTarget();
		});
		this.attackers = {};
		
		this.forEachHater(function(mob) {
			mob.forgetPlayer(this.id);
		});
		this.haters = {};
	}


	getState() {
		var basestate = this._getBaseState(),
			state = [this.name, this.orientation, this.armor, this.weapon];

		if(this.target) {
			state.push(this.target);
		}
		
		return basestate.concat(state);
	}


	send(message) {
		this.connection.send(message);
	}


	broadcast(message, ignoreSelf=true) {
		if(this.broadcast_callback) {
			this.broadcast_callback(message, ignoreSelf);
		}
	}


	broadcastToZone(message, ignoreSelf=true) {
		if(this.broadcastzone_callback) {
			this.broadcastzone_callback(message, ignoreSelf);
		}
	}


	onExit(callback) {
		this.exit_callback = callback;
	}


	onMove(callback) {
		this.move_callback = callback;
	}


	onLootMove(callback) {
		this.lootmove_callback = callback;
	}


	onZone(callback) {
		this.zone_callback = callback;
	}


	onMessage(callback) {
		this.message_callback = callback;
	}


	onBroadcast(callback) {
		this.broadcast_callback = callback;
	}


	onBroadcastToZone(callback) {
		this.broadcastzone_callback = callback;
	}


	equip(item) {
		return new Messages.EquipItem(this, item);
	}


	addHater(mob) {
		if(mob) {
			if(!(mob.id in this.haters)) {
				this.haters[mob.id] = mob;
			}
		}
	}


	removeHater(mob) {
		if(mob && mob.id in this.haters) {
			delete this.haters[mob.id];
		}
	}


	forEachHater(callback) {
		_.each(this.haters, function(mob) {
			callback(mob);
		});
	}


	equipArmor(kind) {
		this.armor = kind
		this.saveToFile()
	}


	equipWeapon(kind) {
		this.weapon = kind
		this.saveToFile()
	}


	equipItem(item) {
		if(item) {
			log.debug(this.name + " equips " + Types.getKindAsString(item.kind));
			
			if(Types.isArmor(item.kind)) {
				this.equipArmor(item.kind);
			} else if(Types.isWeapon(item.kind)) {
				this.equipWeapon(item.kind);
			}
		}
	}


	updateHitPoints() {
		const level = this.getLevel()
		const totalVit = this.charClass.attributes.vit + this.spentAttrPoints.vit
		const totalHitpoints = this.charClass.life + level * this.charClass.lifePerLevel + this.charClass.lifePerVit * totalVit
		// this.resetHitPoints(baseHitpoints)
		this.maxHitpoints = totalHitpoints
        this.hitpoints = totalHitpoints
	}


	updatePosition() {
		const pos = this.world.requestPosition(this.lastCheckpoint)
		this.setPosition(pos.x, pos.y)
	}


	onRequestPosition(callback) {
		this.requestpos_callback = callback;
	}


	resetTimeout() {
		clearTimeout(this.disconnectTimeout);
		this.disconnectTimeout = setTimeout(this.timeout.bind(this), 1000 * 60 * 15); // 15 min.
	}


	timeout() {
		this.connection.sendUTF8("timeout");
		this.connection.close("Player was idle for too long");
	}






	saveToFile() {
		const data: HeroInfo = {
			ident: this.ident,
			secret: this.secret,
			name: this.name,
			charClassId: this.charClass.id,
			spentAttrPoints: this.spentAttrPoints,
			experience: this.experience,
			armorId: this.armor,
			weaponId: this.weapon,
		}
		fs.writeFileSync(getFilePath(this.ident), JSON.stringify(data, null, 4), 'utf8')
	}


	static tryLoad(ident: string, secret: string): HeroInfo {
		const data = JSON.parse(fs.readFileSync(getFilePath(ident), 'utf8'))
		if (secret !== data.secret) {
			return null
		}
		return {
			ident,
			secret,
			name: data.name,
			armorId: data.armorId,
			weaponId: data.weaponId,
			charClassId: data.charClassId,
			spentAttrPoints: data.spentAttrPoints,
			experience: data.experience,
		}
	}


	// serialize(): HeroInfo {
	// 	return {
	// 		ident: this.ident,
	// 		secret: this.secret,
	// 		name: this.name,
	// 		armorId: this.armor,
	// 		weaponId: this.weapon,
	// 		charClassId: this.charClass.id,
	// 		spentAttrPoints: this.spentAttrPoints,
	// 		experience: this.experience,
	// 	}
	// }


	getLevel(): number {
		return getLevelFromExperience(this.experience)
	}


	addExperience(exp: number) {
		this.experience += exp
		this.saveToFile()
	}


	getUnspentAttrPoints(): number {
		const totalAvailablePoints = getLevelFromExperience(this.experience) * ATTR_POINTS_PER_LEVEL
		const totalSpentPoints = this.spentAttrPoints['str'] + this.spentAttrPoints['dex'] + this.spentAttrPoints['vit'] + this.spentAttrPoints['ene']
		return totalAvailablePoints - totalSpentPoints
	}


	spendAttrPoint(attr: AttrShort) {
		if (this.getUnspentAttrPoints() === 0) {
			throw new Error('No attribute points left')
		}
		this.spentAttrPoints[attr] += 1

		// re-calculate maxHitpoints and maxMana and make sure we don't lose life/mana from spending attribute points (because maxHitpoints/maxMana goes up and curLife/curMana doesn't)
		const prevMaxLife = this.maxHitpoints
		// console.log('prevMaxLife', prevMaxLife)
		// const prevMaxMana = this.maxMana
		this.updateHitPoints()
		// console.log('newMaxLife', this.maxHitpoints)
		if (this.maxHitpoints !== prevMaxLife) {
			// console.log('adjusting', this.maxHitpoints - prevMaxLife)
			this.hitpoints += this.maxHitpoints - prevMaxLife
		}
		// if (this.maxMana !== prevMaxMana) {
		// 	this.curMana += this.maxMana - prevMaxMana
		// }

		this.saveToFile()
	}


	public lootmove_callback: any
	public move_callback: any
	public zone_callback: any
	public exit_callback: any
	public broadcast_callback: any
	public broadcastzone_callback: any
	public message_callback: any
	public requestpos_callback: any
	public firepotionTimeout: any
	public name: any
	public armor: any
	public weapon: any
	public world: any
	public connection: any
	public hasEnteredGame: any
	public isDead: any
	public haters: any
	public lastCheckpoint: any
	public disconnectTimeout: any

	private ident: string
	private secret: string
	private charClass: CharacterClassInfo
	private spentAttrPoints: AttrPointsInfo
	private experience: number
}