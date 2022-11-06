import * as _ from 'underscore'

import log from './log'
import PlayerGeneral from  './player-general'
import {clone} from './util'
import * as Types from '../../shared/gametypes'
import connection from './connection'
import {AllCharacterClasses} from '../../shared/content'
import {getLevelFromExperience, getAttackRating, getDefenseRating} from '../../shared/gametypes'
import {Entities, LEVEL_REQUIREMENTS, ATTR_POINTS_PER_LEVEL, INITIAL_ARMOR_KIND, INITIAL_WEAPON_KIND} from '../../shared/constants'




export default class Player extends PlayerGeneral {
	constructor(id: any, hero: HeroInfo) {
		super(id, hero.name, Entities.WARRIOR)
	
		this.nameOffsetY = -10
		this.isLootMoving = false
		this.isSwitchingWeapon = true
	
		// sprites
		this.armorName = Types.getKindAsString(hero.armorKind)
		this.weaponName = Types.getKindAsString(hero.weaponKind)
	
		const characterClassID = hero.charClassId
		const charClass = _.findWhere(AllCharacterClasses, {id: characterClassID})
		if (!charClass) {
			throw new Error('Invalid character class '+characterClassID)
		}
		this.charClass = charClass
		this.experience = hero.experience
		this.spentAttrPoints = clone(hero.spentAttrPoints)
		this.hitpoints = this.getMaxHitpoints()
		this.mana = this.getMaxMana()
		this.gold = 0
		// this.equipment = {}
		// this.storage = new ItemStorage(10, 5)
	}





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
		connection.sendSpendAttr(attr as AttrShort)
		this.emit('update')
	}


	// MISC
	getMaxHitpoints() {
		const level = getLevelFromExperience(this.experience)
		return this.charClass.life + this.charClass.lifePerVit*this.getTotalAttrPoints('vit') + level*this.charClass.lifePerLevel + this.sumEquipmentModifier('addLife')
	}

	getMaxMana(): number {
		const level = getLevelFromExperience(this.experience)
		return this.charClass.mana + this.charClass.manaPerEne*this.getTotalAttrPoints('ene') + level*this.charClass.manaPerLevel +this.sumEquipmentModifier('addMana')
	}

	setCurMana(points: number) {
		this.mana = points
		this.emit('update')
	}

	getCurMana(): number {
		return this.mana
	}

	getAttackDamage(): [number, number] {
		const weapon = Types.getWeaponVariantByKind(Types.getKindFromString(this.weaponName))
		return Types.calcDamage(weapon.weaponLevel, this.getTotalAttrPoints('str'))
	}

	getAttackRating(): number {
		return getAttackRating(this.charClass, this.getTotalAttrPoints('dex'))
	}

	getDefenseRating(): number {
		return getDefenseRating(this.getTotalAttrPoints('dex'))
	}

	getResistance(source: 'fir'|'ice'|'lig'|'psn'): number {
		return 0
	}

	getTotalAttrPoints(attr: string): number {
		const modifierName = 'add'+attr[0].toUpperCase()+attr.substr(1)  // e.g. 'addDex' for 'dex'
		return this.spentAttrPoints[attr] + this.charClass.attributes[attr] + this.sumEquipmentModifier(modifierName)
	}


	private sumEquipmentModifier(prop): number {
		// TODO: Go through equipped items and sum up prop of the items
		return 0
	}


	// private name: string
	public charClass: CharacterClassInfo
	private experience: number
	private spentAttrPoints: {str: number, dex: number, vit: number, ene: number}
	private mana: number
	private gold: number
	// private equipment: {[slot: string]: Item}
}