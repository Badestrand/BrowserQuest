import * as _ from 'underscore'

import log from './log'
import Character from  './character'
import * as Exceptions from  './exceptions'
import {clone} from './util'
import * as Types from '../../shared/gametypes'
import {AllCharacterClasses, LEVEL_REQUIREMENTS, ATTR_POINTS_PER_LEVEL, getLevelFromExperience} from '../../shared/game'




export default class Player extends Character {
	constructor(id: any, hero: HeroInfo) {
		super(id, Types.Entities.WARRIOR)
	
		// Renderer
		this.nameOffsetY = -10
	
		// sprites
		this.spriteName = 'clotharmor'
		this.weaponName = 'sword1'
	
		// modes
		this.isLootMoving = false
		this.isSwitchingWeapon = true


		const characterClassID = hero.charClassId
		const charClass = _.findWhere(AllCharacterClasses, {id: characterClassID})
		if (!charClass) {
			throw new Error('Invalid character class '+characterClassID)
		}
		this.name = hero.name
		this.charClass = charClass
		this.experience = hero.experience
		this.spentAttrPoints = clone(hero.spentAttrPoints)
		this.maxMana = this.curMana = this.charClass.mana
		this.gold = 0
		// this.equipment = {}
		// this.storage = new ItemStorage(10, 5)
		this.updateMaxLifeAndMana()
		this.hitpoints = this.maxHitpoints
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
	// serialize(): any {
	// 	return {
	// 		weapon: this.getWeaponName(),
	// 		armor: this.getSpriteName(),
	// 		experience: this.experience,
	// 		level: this.level,
	// 		attrs: clone(this.spentAttrPoints),
	// 		unspentAttrPoints: this.unspentAttrPoints,
	// 	}
	// }

	// unserialize(data: any) {
	// 	this.setSpriteName(data.armor)
	// 	this.setWeaponName(data.weapon)
	// 	this.name = data.name
	// 	this.experience = data.experience
	// 	this.level = data.level
	// 	this.spentAttrPoints = clone(data.attrs)
	// 	this.unspentAttrPoints = data.unspentAttrPoints
	// 	console.log('loaded player:', this)
	// 	this.emit('update')
	// }

	getName(): string {
		return this.name
	}

	getClassName(): string {
		return this.charClass.name
	}

	getLevel(): number {
		return getLevelFromExperience(this.experience)
	}


	// EXPERIENCE
	gainExperience(experience: number): void {
		const oldLevel = getLevelFromExperience(this.experience)
		this.experience += experience
		const newLevel = getLevelFromExperience(this.experience)

		if (newLevel > oldLevel) {
			// this.unspentAttrPoints += ATTR_POINTS_PER_LEVEL
			// TODO: New life and mana should come from server
			// this.unspentSkillPoints += 1
			// this.updateMaxLifeAndMana()
			// this.curLife = this.maxHitpoints
			// this.curMana = this.maxMana
			this.emit('level-up')
		}
		this.emit('update')
	}

	getTotalExperience(): number {
		return this.experience
	}

	getExperienceProgressForThisLevel(): number {
		const level = getLevelFromExperience(this.experience)
		const levelStart = LEVEL_REQUIREMENTS[level-1]
		const levelEnd = LEVEL_REQUIREMENTS[level]
		const progress = (this.experience - levelStart) / (levelEnd - levelStart)
		return progress
	}

	getNextExperienceRequirement(): number {
		const level = getLevelFromExperience(this.experience)
		return LEVEL_REQUIREMENTS[level]
	}


	// ATTRIBUTES
	getUnspentAttrPoints(): number {
		const totalPoints = (getLevelFromExperience(this.experience) - 1) * ATTR_POINTS_PER_LEVEL
		const spentPoints = this.spentAttrPoints['str'] + this.spentAttrPoints['dex'] + this.spentAttrPoints['vit'] + this.spentAttrPoints['ene']
		return totalPoints - spentPoints
	}

	getSpentAttrPoints(attr: 'str'|'dex'|'vit'|'ene'): number {
		return this.spentAttrPoints[attr]
	}

	spendAttrPoint(attr: AttrShort): void {
		if (this.getUnspentAttrPoints() === 0) {
			throw new Error('No attribute points left')
		}
		this.spentAttrPoints[attr] += 1

		// re-calculate maxHitpoints and maxMana and make sure we don't lose life/mana from spending attribute points (because maxHitpoints/maxMana goes up and curLife/curMana doesn't)
		// const prevMaxLife = this.maxHitpoints
		// const prevMaxMana = this.maxMana
		// this.updateMaxLifeAndMana()
		// if (this.maxHitpoints !== prevMaxLife) {
		// 	this.hitpoints += this.maxHitpoints - prevMaxLife
		// }
		// if (this.maxMana !== prevMaxMana) {
		// 	this.curMana += this.maxMana - prevMaxMana
		// }
		// TODO: rely on server to update our life and mana

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
		const totalDex = this.getTotalAttrPoints('dex')
		const baseATR = this.charClass.atr + (totalDex - this.charClass.attributes.dex) * 5
		return baseATR
	}

	getDefenseRating(): number {
		// from https://d2.lc/AB/wiki/index8959.html?title=Defense
		const baseDef = this.getTotalAttrPoints('dex') / 4
		return baseDef
	}

	getResistance(source: 'fir'|'ice'|'lig'|'psn'): number {
		return 0
	}

	getTotalAttrPoints(attr: string): number {
		const modifierName = 'add'+attr[0].toUpperCase()+attr.substr(1)  // e.g. 'addDex' for 'dex'
		return this.spentAttrPoints[attr] + this.charClass.attributes[attr] + this.sumEquipmentModifier(modifierName)
	}


	private updateMaxLifeAndMana() {
		const level = getLevelFromExperience(this.experience)
		this.maxHitpoints = this.charClass.life + this.charClass.lifePerVit*this.getTotalAttrPoints('vit') + level*this.charClass.lifePerLevel + this.sumEquipmentModifier('addLife')
		this.maxMana = this.charClass.mana + this.charClass.manaPerEne*this.getTotalAttrPoints('ene') + level*this.charClass.manaPerLevel +this.sumEquipmentModifier('addMana')
	}


	private sumEquipmentModifier(prop): number {
		// TODO: Go through equipped items and sum up prop of the items
		return 0
	}


	// private name: string
	public charClass: CharacterClassInfo
	private experience: number
	private spentAttrPoints: {str: number, dex: number, vit: number, ene: number}
	private maxMana: number
	private curMana: number
	private gold: number
	// private equipment: {[slot: string]: Item}
}