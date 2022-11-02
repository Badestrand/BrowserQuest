import * as _ from 'underscore'

import log from './log'
import Character from  './character'
import * as Exceptions from  './exceptions'
import {clone} from './util'
import * as Types from '../../shared/gametypes'
import {AllCharacterClasses, LEVEL_REQUIREMENTS, ATTR_POINTS_PER_LEVEL} from '../../shared/game'




export default class Player extends Character {
	constructor(id, name, kind) {
		super(id, kind);
	
		this.name = name
	
		// Renderer
		this.nameOffsetY = -10
	
		// sprites
		this.spriteName = 'clotharmor'
		this.weaponName = 'sword1'
	
		// modes
		this.isLootMoving = false
		this.isSwitchingWeapon = true


		const characterClassName = 'Barbarian'
		const classInfo = _.findWhere(AllCharacterClasses, {name: characterClassName})
		if (!classInfo) {
			throw new Error('Invalid character class name '+characterClassName)
		}
		// this.ident = makeIdent('player')
		// this.name = name
		this.classInfo = classInfo
		this.level = 1
		this.experience = 0
		this.unspentAttrPoints = 0
		this.unspentSkillPoints = 0
		this.attrPoints = clone(this.classInfo.attributes)
		// this.maxHitpoints = this.curLife = this.classInfo.life
		// this.maxHitpoints = this.hitPoints = 
		this.maxMana = this.curMana = this.classInfo.mana
		this.gold = 0
		// this.equipment = {}
		// this.storage = new ItemStorage(10, 5)
	}

	loot(item) {
		if(item) {
			var rank, currentRank, msg, currentArmorName;
		
			if(this.currentArmorSprite) {
				currentArmorName = this.currentArmorSprite.name;
			} else {
				currentArmorName = this.spriteName;
			}

			if(item.type === "armor") {
				rank = Types.getArmorRank(item.kind);
				currentRank = Types.getArmorRank(Types.getKindFromString(currentArmorName));
				msg = "You are wearing a better armor";
			} else if(item.type === "weapon") {
				rank = Types.getWeaponRank(item.kind);
				currentRank = Types.getWeaponRank(Types.getKindFromString(this.weaponName));
				msg = "You are wielding a better weapon";
			}

			if(rank && currentRank) {
				if(rank === currentRank) {
					throw new Exceptions.LootException("You already have this "+item.type);
				} else if(rank <= currentRank) {
					throw new Exceptions.LootException(msg);
				}
			}
		
			log.info('Player '+this.id+' has looted '+item.id);
			if(Types.isArmor(item.kind) && this.invincible) {
				this.stopInvincibility();
			}
			item.onLoot(this);
		}
	}

	/**
	 * Returns true if the character is currently walking towards an item in order to loot it.
	 */
	isMovingToLoot() {
		return this.isLootMoving;
	}

	getSpriteName() {
		return this.spriteName;
	}

	setSpriteName(name) {
		this.spriteName = name;
	}
	
	getArmorName() {
		var sprite = this.getArmorSprite();
		return sprite.id;
	}
	
	getArmorSprite() {
		if(this.invincible) {
			return this.currentArmorSprite;
		} else {
			return this.normalSprite;  // this.sprite might be the current hurt sprite..
		}
	}

	getWeaponName() {
		return this.weaponName;
	}

	setWeaponName(name) {
		this.weaponName = name;
	}

	hasWeapon() {
		return this.weaponName !== null;
	}

	switchWeapon(newWeaponName) {
		var count = 14, 
			value = false, 
			self = this;
	
		var toggle = function() {
			value = !value;
			return value;
		};
	
		if(newWeaponName !== this.getWeaponName()) {
			if(this.isSwitchingWeapon) {
				clearInterval(blanking);
			}
		
			this.switchingWeapon = true;
			var blanking = setInterval(function() {
				if(toggle()) {
					self.setWeaponName(newWeaponName);
				} else {
					self.setWeaponName(null);
				}

				count -= 1;
				if(count === 1) {
					clearInterval(blanking);
					self.switchingWeapon = false;
				
					if(self.switch_callback) {
						self.switch_callback();
					}
				}
			}, 90);
		}
	}

	switchArmor(newArmorSprite) {
		var count = 14, 
			value = false, 
			self = this;
	
		var toggle = function() {
			value = !value;
			return value;
		};
	
		if(newArmorSprite && newArmorSprite.id !== this.getSpriteName()) {
			if(this.isSwitchingArmor) {
				clearInterval(blanking);
			}
		
			this.isSwitchingArmor = true;
			self.setSprite(newArmorSprite);
			self.setSpriteName(newArmorSprite.id);
			var blanking = setInterval(function() {
				self.setVisible(toggle());

				count -= 1;
				if(count === 1) {
					clearInterval(blanking);
					self.isSwitchingArmor = false;
				
					if(self.switch_callback) {
						self.switch_callback();
					}
				}
			}, 90);
		}
	}
	
	onArmorLoot(callback) {
		this.armorloot_callback = callback;
	}

	onSwitchItem(callback) {
		this.switch_callback = callback;
	}
	
	onInvincible(callback) {
		this.invincible_callback = callback;
	}

	startInvincibility() {
		var self = this;
	
		if(!this.invincible) {
			this.currentArmorSprite = this.getSprite();
			this.invincible = true;
			this.invincible_callback();      
		} else {
			// If the player already has invincibility, just reset its duration.
			if(this.invincibleTimeout) {
				clearTimeout(this.invincibleTimeout);
			}
		}
	
		this.invincibleTimeout = setTimeout(function() {
			self.stopInvincibility();
			self.idle();
		}, 15000);
	}

	stopInvincibility() {
		this.invincible_callback();
		this.invincible = false;
	
		if(this.currentArmorSprite) {
			this.setSprite(this.currentArmorSprite);
			this.setSpriteName(this.currentArmorSprite.id);
			this.currentArmorSprite = null;
		}
		if(this.invincibleTimeout) {
			clearTimeout(this.invincibleTimeout);
		}
	}

	public invincible: boolean
	public invincible_callback: any
	public invincibleTimeout: any
	public currentArmorSprite: any
	public armorloot_callback: any
	public switch_callback: any
	public isSwitchingArmor: boolean
	public isSwitchingWeapon: boolean
	public switchingWeapon: any
	public weaponName: string
	public spriteName: string
	public isLootMoving: boolean
	public nameOffsetY: number








	static getMaxLevel(): number {
		return 99
	}


	// ...
	serialize(): any {
		return {
			weapon: this.getWeaponName(),
			armor: this.getSpriteName(),
			experience: this.experience,
			level: this.level,
			attrs: clone(this.attrPoints),
			unspentAttrPoints: this.unspentAttrPoints,
		}
	}

	unserialize(data: any) {
		this.setSpriteName(data.armor)
		this.setWeaponName(data.weapon)
		this.name = data.name
		this.experience = data.experience
		this.level = data.level
		this.attrPoints = clone(data.attrs)
		this.unspentAttrPoints = data.unspentAttrPoints
		console.log('loaded player:', this)
		this.emit('update')
	}

	getName(): string {
		return this.name
	}

	getClassName(): string {
		return this.classInfo.name
	}

	getLevel(): number {
		return this.level
	}


	// EXPERIENCE
	gainExperience(experience: number): void {
		this.experience += experience

		while (this.experience>=LEVEL_REQUIREMENTS[this.level] && this.level<Player.getMaxLevel()) {
			this.level += 1
			this.unspentAttrPoints += ATTR_POINTS_PER_LEVEL
			this.unspentSkillPoints += 1
			this.updateLifeAndMana()
			// this.curLife = this.maxHitpoints
			this.curMana = this.maxMana
			this.emit('level-up')
		}
		this.emit('update')
	}

	getTotalExperience(): number {
		return this.experience
	}

	getExperienceProgressForThisLevel(): number {
		const levelStart = LEVEL_REQUIREMENTS[this.level-1]
		const levelEnd = LEVEL_REQUIREMENTS[this.level]
		const progress = (this.experience - levelStart) / (levelEnd - levelStart)
		return progress
	}

	getNextExperienceRequirement(): number {
		return LEVEL_REQUIREMENTS[this.level]
	}


	// ATTRIBUTES
	getUnspentAttrPoints(): number {
		return this.unspentAttrPoints
	}

	getFixedAttrPoints(attr: 'str'|'dex'|'vit'|'ene'): number {
		return this.attrPoints[attr]
	}

	spendAttrPoint(attr: AttrShort): void {
		if (this.unspentAttrPoints === 0) {
			throw new Error('No attribute points left')
		}
		this.attrPoints[attr] += 1
		this.unspentAttrPoints -= 1

		// re-calculate maxHitpoints and maxMana and make sure we don't lose life/mana from spending attribute points (because maxHitpoints/maxMana goes up and curLife/curMana doesn't)
		const prevMaxLife = this.maxHitpoints
		const prevMaxMana = this.maxMana
		this.updateLifeAndMana()
		if (this.maxHitpoints !== prevMaxLife) {
			this.hitPoints += this.maxHitpoints - prevMaxLife
		}
		if (this.maxMana !== prevMaxMana) {
			this.curMana += this.maxMana - prevMaxMana
		}
		this.emit('update')
	}


	// MISC
	getMaxMana(): number {
		return this.maxMana
	}

	getCurMana(): number {
		return this.curMana
	}

	getAttackDamage(): [number, number] {
		// TODO
		return [1, 2]
	}

	getAttackRating(): number {
		// from https://d2.lc/AB/wiki/index49ee.html?title=Attack_Rating
		const totalDex = this.getTotalAttr('dex')
		const baseATR = this.classInfo.atr + (totalDex - this.classInfo.attributes.dex) * 5
		return baseATR
	}

	getDefenseRating(): number {
		// from https://d2.lc/AB/wiki/index8959.html?title=Defense
		const baseDef = this.getTotalAttr('dex') / 4
		return baseDef
	}

	getResistance(source: 'fir'|'ice'|'lig'|'psn'): number {
		return 0
	}

	getTotalAttr(attr: string): number {
		const modifierName = 'add'+attr[0].toUpperCase()+attr.substr(1)  // e.g. 'addDex' for 'dex'
		return this.attrPoints[attr] + this.sumEquipmentModifier(modifierName)
	}


	private updateLifeAndMana() {
		const totalVit = this.attrPoints.vit - this.classInfo.attributes.vit + this.sumEquipmentModifier('addVit')
		this.maxHitpoints = this.classInfo.life + this.classInfo.lifePerVit*totalVit + this.level*this.classInfo.lifePerLevel + this.sumEquipmentModifier('addLife')

		const totalEne = this.attrPoints.ene - this.classInfo.attributes.ene + this.sumEquipmentModifier('addEne')
		this.maxMana = this.classInfo.mana + this.classInfo.manaPerEne*totalEne + this.level*this.classInfo.manaPerLevel +this.sumEquipmentModifier('addMana')
	}


	private sumEquipmentModifier(prop): number {
		// TODO: Go through equipped items and sum up prop of the items
		return 0
	}


	// private name: string
	private classInfo: CharacterClassInfo
	private level: number
	private experience: number
	private unspentAttrPoints: number
	private unspentSkillPoints: number
	private attrPoints: {str: number, dex: number, vit: number, ene: number}
	private maxMana: number
	private curMana: number
	private gold: number
	// private equipment: {[slot: string]: Item}
	// private task: CharacterTaskInfo
}