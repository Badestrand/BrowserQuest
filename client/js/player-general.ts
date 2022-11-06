import log from './log'
import Character from  './character'
import * as Exceptions from  './exceptions'
import * as Types from '../../shared/gametypes'
import {INITIAL_ARMOR_KIND, INITIAL_WEAPON_KIND} from '../../shared/constants'




export default class PlayerGeneral extends Character {
	constructor(id: number, name: string, kind: number) {
		super(id, kind)

		this.name = name
		this.weaponName = Types.getKindAsString(INITIAL_WEAPON_KIND)
		this.armorName = Types.getKindAsString(INITIAL_ARMOR_KIND)
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


	getSpriteName() {
		return this.armorName;
	}

	setSpriteName(name) {
		this.armorName = name;
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


	loot(item) {
		if(item) {
			var rank, currentRank, msg, currentArmorName;
		
			if(this.currentArmorSprite) {
				currentArmorName = this.currentArmorSprite.name;
			} else {
				currentArmorName = this.armorName;
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




	public weaponName: string
	public armorName: string
	public currentArmorSprite: any
	public lastCheckpoint: any
	public invincible: boolean
	public invincible_callback: any
	public invincibleTimeout: any
	public isSwitchingArmor: boolean
	public isSwitchingWeapon: boolean
	public switchingWeapon: any
	public isLootMoving: boolean
	public nameOffsetY: number
	public isOnPlateau: boolean
	public switch_callback: any
	public armorloot_callback: any
}