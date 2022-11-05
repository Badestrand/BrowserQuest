import * as _ from 'underscore'
import * as fs from 'fs'
import crypto from 'crypto'

import {socketIOConnection} from './ws'
import * as log from './log'
import * as Messages2 from './message'
import * as Utils from './utils'
import Character from './character'
import Chest from './chest'
import World from './worldserver'
import check from './format'
import * as Types from '../../shared/gametypes'
import {getLevelFromExperience} from '../../shared/gametypes'
import {AllCharacterClasses} from '../../shared/content'
import {Entities, Messages, ATTR_POINTS_PER_LEVEL, INITIAL_ARMOR_KIND, INITIAL_WEAPON_KIND} from '../../shared/constants'




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




class Weapon {
	constructor(variant: WeaponVariantInfo) {
		this.variant = variant
	}

	public variant: WeaponVariantInfo
}




class Armor {
	constructor(variant: ArmorVariantInfo) {
		this.variant = variant
	}

	public variant: ArmorVariantInfo
}




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
			armorKind: INITIAL_ARMOR_KIND,
			weaponKind: INITIAL_WEAPON_KIND,
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
		super(connection.id /*TODO: Should the player ID really be the connection id??*/, 'player', Entities.WARRIOR, 0, 0)

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
		this.armor = new Armor(Types.getArmorVariantByKind(heroInfo.armorKind))
		this.weapon = new Weapon(Types.getWeaponVariantByKind(heroInfo.weaponKind))

		// more initialization
		this.kind = Entities.WARRIOR
		this.orientation = Utils.randomOrientation()
		this.updateMaxLifeAndMana()
		this.hitpoints = this.maxHitpoints
		this.mana = this.maxMana
		this.updatePosition()

		this.hasEnteredGame = true
		this.isDead = false


		this.connection.listen((message) => {
			var action = message[0]

			if(!check(message)) {
				this.connection.close("Invalid "+Types.getMessageTypeAsString(action)+" message format: "+message);
				return;
			}

			this.resetTimeout();

			if(action === Messages.WHO) {
				message.shift();
				this.world.pushSpawnsToPlayer(this, message);
			}
			else if (action === Messages.ZONE) {
				this.zone_callback();
			}
			else if (action === Messages.CHAT) {
				var msg = Utils.sanitize(message[1]);
				
				// Sanitized messages may become empty. No need to broadcast empty chat messages.
				if(msg && msg !== "") {
					msg = msg.substr(0, 60); // Enforce maxlength of chat input
					this.broadcastToZone(new Messages2.Chat(this, msg), false);
				}
			}
			else if (action === Messages.MOVE) {
				if(this.move_callback) {
					var x = message[1],
						y = message[2];
					
					if(this.world.isValidPosition(x, y)) {
						this.setPosition(x, y);
						this.clearTarget();
						
						this.broadcast(new Messages2.Move(this));
						this.move_callback(this.x, this.y);
					}
				}
			}
			else if (action === Messages.LOOTMOVE) {
				if(this.lootmove_callback) {
					this.setPosition(message[1], message[2]);
					
					var item = this.world.getEntityById(message[3]);
					if(item) {
						this.clearTarget();

						this.broadcast(new Messages2.LootMove(this, item));
						this.lootmove_callback(this.x, this.y);
					}
				}
			}
			else if (action === Messages.AGGRO) {
				if(this.move_callback) {
					this.world.handleMobHate(message[1], this.id, 5);
				}
			}
			else if (action === Messages.ATTACK) {
				var mob = this.world.getEntityById(message[1]);
				
				if(mob) {
					this.setTarget(mob);
					this.world.broadcastAttacker(this);
				}
			}
			else if (action === Messages.HIT) {
				var mob = this.world.getEntityById(message[1]);

				if(mob) {
					const dmg = Types.dmg(this.weapon.variant.weaponLevel, this.getTotalAttrPoints('str'), mob.variant.armor)
					if(dmg > 0) {
						mob.receiveDamage(dmg, this.id);
						this.world.handleMobHate(mob.id, this.id, dmg);
						this.world.handleHurtEntity(mob, this, dmg);
					}
				}
			}
			else if (action === Messages.HURT) {
				var mob = this.world.getEntityById(message[1]);
				if(mob && this.hitpoints > 0) {
					const dmg = Types.dmg(mob.variant.weapon, null, this.armor.variant.armorLevel);
					this.hitpoints -= dmg
					this.world.handleHurtEntity(this, mob);
					if(this.hitpoints <= 0) {
						this.isDead = true;
						if(this.firepotionTimeout) {
							clearTimeout(this.firepotionTimeout);
						}
					}
				}
			}
			else if (action === Messages.LOOT) {
				var item = this.world.getEntityById(message[1]);
				
				if(item) {
					var kind = item.kind;
					
					if(Types.isItem(kind)) {
						this.broadcast(item.despawn());
						this.world.removeEntity(item);
						
						if(kind === Entities.FIREPOTION) {
							this.hitpoints = this.maxHitpoints
							this.broadcast(this.equip(Entities.FIREFOX))
							this.firepotionTimeout = setTimeout(() => {
								this.broadcast(this.equip(this.armor.variant.kind)) // return to normal after 15 sec
								this.firepotionTimeout = null
							}, 15000)
							this.send(new Messages2.MaxHitpoints(this.maxHitpoints))
						}
						else if(Types.isHealingItem(kind)) {
							var amount;
							
							switch(kind) {
								case Entities.FLASK: 
									amount = 40;
									break;
								case Entities.BURGER: 
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
							this.send(this.equip(kind));
						}
					}
				}
			}
			else if (action === Messages.TELEPORT) {
				var x = message[1],
					y = message[2];
				
				if(this.world.isValidPosition(x, y)) {
					this.setPosition(x, y);
					this.clearTarget();
					
					this.broadcast(new Messages2.Teleport(this));
					
					this.world.handlePlayerVanish(this);
					this.world.pushRelevantEntityListTo(this);
				}
			}
			else if (action === Messages.OPEN) {
				var chest = this.world.getEntityById(message[1]);
				if(chest && chest instanceof Chest) {
					this.world.handleOpenedChest(chest, this);
				}
			}
			else if (action === Messages.CHECK) {
				var checkpoint = this.world.map.getCheckpoint(message[1]);
				if(checkpoint) {
					this.lastCheckpoint = checkpoint;
				}
			}
			else if (action === Messages.SPEND_ATTR) {
				const attr = message[1]
				if (!(attr==='str' || attr==='dex' || attr==='vit' || attr==='ene')) {
					throw new Error('Invalid attribute '+attr)
				}
				if (this.getUnspentAttrPoints() === 0) {
					throw new Error('No attribute points left')
				}

				this.spentAttrPoints[attr] += 1

				const before = {
					hitpoints: this.hitpoints,
					maxHitpoints: this.maxHitpoints,
					mana: this.mana,
					maxMana: this.maxMana,
				}

				// re-calculate maxHitpoints and maxMana and make sure we don't lose life/mana from spending attribute points (because maxHitpoints/maxMana goes up and curLife/curMana doesn't)
				this.updateMaxLifeAndMana()
				if (this.maxHitpoints !== before.maxHitpoints) {
					this.hitpoints += this.maxHitpoints - before.maxHitpoints
				}
				if (this.maxMana !== before.maxMana) {
					this.mana += this.maxMana - before.maxMana
				}

				// send updates
				if (this.maxHitpoints !== before.maxHitpoints) {
					this.send(new Messages2.MaxHitpoints(this.maxHitpoints))
				}
				if (this.maxMana !== before.maxMana) {
					this.send(new Messages2.MaxMana(this.maxMana))
				}
				if (this.hitpoints !== before.hitpoints) {
					this.send(new Messages2.CurHitpoints(this.hitpoints, false))
				}
				if (this.mana !== before.mana) {
					this.send(new Messages2.CurMana(this.mana, false))
				}

				// update storage
				this.saveToFile()
			}
			else {
				if (this.message_callback) {
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
		this.forEachAttacker((mob) => {
			mob.clearTarget();
		});
		this.attackers = {};
		
		this.forEachHater((mob) => {
			mob.forgetPlayer(this.id);
		});
		this.haters = {};
	}


	getState() {
		var basestate = this._getBaseState(),
			state = [this.name, this.orientation, this.armor.variant.kind, this.weapon.variant.kind];

		if(this.target) {
			state.push(this.target);
		}
		
		return basestate.concat(state);
	}


	send(message) {
		this.connection.send(message.serialize())
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
		return new Messages2.EquipItem(this, item);
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
		_.each(this.haters, (mob) => {
			callback(mob);
		});
	}


	equipArmor(kind) {
		this.armor = new Armor(Types.getArmorVariantByKind(kind))
		this.saveToFile()
	}


	equipWeapon(kind) {
		this.weapon = new Weapon(Types.getWeaponVariantByKind(kind))
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


	updateMaxLifeAndMana() {
		const level = getLevelFromExperience(this.experience)
		this.maxHitpoints = this.charClass.life + this.charClass.lifePerVit*this.getTotalAttrPoints('vit') + level*this.charClass.lifePerLevel + this.sumEquipmentModifier('addLife')
		this.maxMana = this.charClass.mana + this.charClass.manaPerEne*this.getTotalAttrPoints('ene') + level*this.charClass.manaPerLevel +this.sumEquipmentModifier('addMana')
	}

	getTotalAttrPoints(attr: string): number {
		const modifierName = 'add'+attr[0].toUpperCase()+attr.substr(1)  // e.g. 'addDex' for 'dex'
		return this.spentAttrPoints[attr] + this.charClass.attributes[attr] + this.sumEquipmentModifier(modifierName)
	}

	sumEquipmentModifier(prop): number {
		// TODO: Go through equipped items and sum up prop of the items
		return 0
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
			armorKind: this.armor.variant.kind,
			weaponKind: this.weapon.variant.kind,
		}
		fs.writeFileSync(getFilePath(this.ident), JSON.stringify(data, null, 4), 'utf8')
	}


	static tryLoad(ident: string, secret: string): HeroInfo {
		const data = JSON.parse(fs.readFileSync(getFilePath(ident), 'utf8'))
		if (secret !== data.secret) {
			return null
		}
		return data
	}



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
	public armor: Armor
	public weapon: Weapon
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
	private mana: number
	private maxMana: number
}