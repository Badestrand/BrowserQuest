import AllWeaponVariants from './content/weapons'
import AllArmorVariants from './content/armor'
import AllMobVariants from './content/mobs'
import {Entities, Orientations, Messages, LEVEL_REQUIREMENTS} from './constants'




var kinds = {
	warrior: [Entities.WARRIOR, "player"],
	
	rat: [Entities.RAT, "mob"],
	skeleton: [Entities.SKELETON , "mob"],
	goblin: [Entities.GOBLIN, "mob"],
	ogre: [Entities.OGRE, "mob"],
	spectre: [Entities.SPECTRE, "mob"],
	deathknight: [Entities.DEATHKNIGHT, "mob"],
	crab: [Entities.CRAB, "mob"],
	snake: [Entities.SNAKE, "mob"],
	bat: [Entities.BAT, "mob"],
	wizard: [Entities.WIZARD, "mob"],
	eye: [Entities.EYE, "mob"],
	skeleton2: [Entities.SKELETON2, "mob"],
	boss: [Entities.BOSS, "mob"],

	sword1: [Entities.SWORD1, "weapon"],
	sword2: [Entities.SWORD2, "weapon"],
	axe: [Entities.AXE, "weapon"],
	redsword: [Entities.REDSWORD, "weapon"],
	bluesword: [Entities.BLUESWORD, "weapon"],
	goldensword: [Entities.GOLDENSWORD, "weapon"],
	morningstar: [Entities.MORNINGSTAR, "weapon"],
	
	firefox: [Entities.FIREFOX, "armor"],
	clotharmor: [Entities.CLOTHARMOR, "armor"],
	leatherarmor: [Entities.LEATHERARMOR, "armor"],
	mailarmor: [Entities.MAILARMOR, "armor"],
	platearmor: [Entities.PLATEARMOR, "armor"],
	redarmor: [Entities.REDARMOR, "armor"],
	goldenarmor: [Entities.GOLDENARMOR, "armor"],

	flask: [Entities.FLASK, "object"],
	cake: [Entities.CAKE, "object"],
	burger: [Entities.BURGER, "object"],
	chest: [Entities.CHEST, "object"],
	firepotion: [Entities.FIREPOTION, "object"],

	guard: [Entities.GUARD, "npc"],
	villagegirl: [Entities.VILLAGEGIRL, "npc"],
	villager: [Entities.VILLAGER, "npc"],
	coder: [Entities.CODER, "npc"],
	scientist: [Entities.SCIENTIST, "npc"],
	priest: [Entities.PRIEST, "npc"],
	king: [Entities.KING, "npc"],
	rick: [Entities.RICK, "npc"],
	nyan: [Entities.NYAN, "npc"],
	sorcerer: [Entities.SORCERER, "npc"],
	agent: [Entities.AGENT, "npc"],
	octocat: [Entities.OCTOCAT, "npc"],
	beachnpc: [Entities.BEACHNPC, "npc"],
	forestnpc: [Entities.FORESTNPC, "npc"],
	desertnpc: [Entities.DESERTNPC, "npc"],
	lavanpc: [Entities.LAVANPC, "npc"],
	
	getType: function(kind) {
		return kinds[getKindAsString(kind)][1];
	}
}





export function getWeaponVariantByKind(kind: number): WeaponVariantInfo {
	for (const variant of AllWeaponVariants) {
		if (variant.kind === kind) {
			return variant
		}
	}
	throw new Error('Weapon variant '+kind+' not found')
}




export function getArmorVariantByKind(kind: number): ArmorVariantInfo {
	for (const variant of AllArmorVariants) {
		if (variant.kind === kind) {
			return variant
		}
	}
	throw new Error('Armor variant '+kind+' not found')
}




const rankedWeapons = [
	Entities.SWORD1,
	Entities.SWORD2,
	Entities.AXE,
	Entities.MORNINGSTAR,
	Entities.BLUESWORD,
	Entities.REDSWORD,
	Entities.GOLDENSWORD
];

const rankedArmors = [
	Entities.CLOTHARMOR,
	Entities.LEATHERARMOR,
	Entities.MAILARMOR,
	Entities.PLATEARMOR,
	Entities.REDARMOR,
	Entities.GOLDENARMOR
];

export function getWeaponRank(weaponKind) {
	return rankedWeapons.indexOf(weaponKind);
};

export function getArmorRank(armorKind) {
	return rankedArmors.indexOf(armorKind);
};

export function isPlayer(kind) {
	return kinds.getType(kind) === "player";
};

export function isMob(kind) {
	return kinds.getType(kind) === "mob";
};

export function isNpc(kind) {
	return kinds.getType(kind) === "npc";
};

export function isCharacter(kind) {
	return isMob(kind) || isNpc(kind) || isPlayer(kind);
};

export function isArmor(kind) {
	return kinds.getType(kind) === "armor";
};

export function isWeapon(kind) {
	return kinds.getType(kind) === "weapon";
};

export function isObject(kind) {
	return kinds.getType(kind) === "object";
};

export function isChest(kind) {
	return kind === Entities.CHEST;
};

export function isItem(kind) {
	return isWeapon(kind) 
		|| isArmor(kind) 
		|| (isObject(kind) && !isChest(kind));
};

export function isHealingItem(kind) {
	return kind === Entities.FLASK 
		|| kind === Entities.BURGER;
};

export function isExpendableItem(kind) {
	return isHealingItem(kind)
		|| kind === Entities.FIREPOTION
		|| kind === Entities.CAKE;
};

export function getKindFromString(kind) {
	if(kind in kinds) {
		return kinds[kind][0];
	}
};

export function getKindAsString(kind) {
	for(var k in kinds) {
		if(kinds[k][0] === kind) {
			return k;
		}
	}
};

export function getDisplayName(kind) {
	const rawName = getKindAsString(kind)
	const mobNameMap = {
		'skeleton2': 'greater skeleton',
		'eye': 'evil eye',
		'deathknight': 'death knight',
	}
	if (typeof mobNameMap[rawName] !== 'undefined') {
		return mobNameMap[rawName]
	} else {
		return rawName
	}
}

export function forEachKind(callback) {
	for(var k in kinds) {
		callback(kinds[k][0], k);
	}
};

export function forEachArmor(callback) {
	forEachKind(function(kind, kindName) {
		if(isArmor(kind)) {
			callback(kind, kindName);
		}
	});
};

export function forEachMobOrNpcKind(callback) {
	forEachKind(function(kind, kindName) {
		if(isMob(kind) || isNpc(kind)) {
			callback(kind, kindName);
		}
	});
};

export function forEachArmorKind(callback) {
	forEachKind(function(kind, kindName) {
		if(isArmor(kind)) {
			callback(kind, kindName);
		}
	});
};

export function getOrientationAsString(orientation) {
	switch(orientation) {
		case Orientations.LEFT: return "left"; break;
		case Orientations.RIGHT: return "right"; break;
		case Orientations.UP: return "up"; break;
		case Orientations.DOWN: return "down"; break;
	}
};



export function getMessageTypeAsString(type) {
	var typeName;
	for (const name in Messages) {
		const value = Messages[name]
		if(value === type) {
			typeName = name;
		}
	}
	if(!typeName) {
		typeName = "UNKNOWN";
	}
	return typeName;
}




export function getMobVariantByKind(kind: number): MobVariantInfo {
	for (const variant of AllMobVariants) {
		if (variant.kind === kind) {
			return variant
		}
	}
	throw new Error('Mob variant '+kind+' not found')
}





function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}


export function calcDamage(weaponLevel: number, strength: number): [number, number] {
	const base = weaponLevel + strength
	return [base, base*2]
}


export function dmg(weaponLevel: number, strength: number, armorLevel: number): number {
	if (strength === null) {
		strength = weaponLevel * 5  // for mobs
	}

	const damageRange = calcDamage(weaponLevel, strength)
	const damageDealt = randomInt(damageRange[0], damageRange[1])

	const dealt = randomInt(damageRange[0], damageRange[1])  //weaponLevel * randomInt(5, 10),
	const absorbed = armorLevel * randomInt(1, 3)
	const dmg =  dealt - absorbed
	
	//console.log("abs: "+absorbed+"   dealt: "+ dealt+"   dmg: "+ (dealt - absorbed));
	if(dmg <= 0) {
		return randomInt(0, 3);
	} else {
		return dmg;
	}
}




export function getLevelFromExperience(exp: number): number {
	let level = 1
	while (level<LEVEL_REQUIREMENTS.length-1 && exp>=LEVEL_REQUIREMENTS[level]) {
		level += 1
	}
	return level
}
// for (const n of [0, 100, 500, 1000, 1500, 10000]) {
// 	console.log(n, getLevelFromExperience(n))
// }


export function getAttackRating(charClass: CharacterClassInfo, totalDex: number): number {
	// from https://d2.lc/AB/wiki/index49ee.html?title=Attack_Rating
	return (totalDex - 7) * 5 + charClass.atr
}


export function getDefenseRating(totalDex: number): number {
	// from https://d2.lc/AB/wiki/index8959.html?title=Defense
	return totalDex / 4
}


export function getChanceToHit(attackerLevel: number, attackerAttackRating: number, defenderLevel: number, defenderDefenseRating: number): number {  // returns [0..1]
	// from https://d2.lc/AB/wiki/indexd836.html?title=Attack#Chance_to_hit
	// % Chance to hit = 100 * 2 * (alvl / (alvl+dlvl) ) * (AR / (AR+DR) )
	// alvl=attacker level; dlvl=defender level; AR=attacker Attack Rating; DR=defender Defense rating.
	// Chance to hit has a 5% floor and 95% ceiling, so there is always at least 5% chance to hit, or miss. 
	// However, when a player character is running attacks always hit.
	const base = 2 * (attackerLevel / (attackerLevel + defenderLevel)) * (attackerAttackRating / (attackerAttackRating + defenderDefenseRating))
	return Math.max(0.05, Math.min(0.95, base))
}


export function getBlockChance(): number {
	// https://diablo2.diablowiki.net/Blocking
	// TODO
	throw new Error('Not implemented')
}




export {
	kinds,
}