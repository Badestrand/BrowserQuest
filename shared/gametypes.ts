const Messages = {
	SPAWN: 'SPAWN',
	DESPAWN: 'DESPAWN',
	MOVE: 'MOVE',
	LOOTMOVE: 'LOOTMOVE',
	AGGRO: 'AGGRO',
	ATTACK: 'ATTACK',
	HIT: 'HIT',
	HURT: 'HURT',
	HEALTH: 'HEALTH',
	MAX_HITPOINTS: 'MAX_HITPOINTS',
	CHAT: 'CHAT',
	LOOT: 'LOOT',
	EQUIP: 'EQUIP',
	DROP: 'DROP',
	TELEPORT: 'TELEPORT',
	DAMAGE: 'DAMAGE',
	POPULATION: 'POPULATION',
	KILL: 'KILL',
	LIST: 'LIST',
	WHO: 'WHO',
	ZONE: 'ZONE',
	DESTROY: 'DESTROY',
	MANA: 'MANA',
	MAX_MANA: 'MAX_MANA',
	BLINK: 'BLINK',
	OPEN: 'OPEN',
	CHECK: 'CHECK',
	SPEND_ATTR: 'SPEND_ATTR',
}
	
const Entities = {
	WARRIOR: 1,
	
	// Mobs
	RAT: 2,
	SKELETON: 3,
	GOBLIN: 4,
	OGRE: 5,
	SPECTRE: 6,
	CRAB: 7,
	BAT: 8,
	WIZARD: 9,
	EYE: 10,
	SNAKE: 11,
	SKELETON2: 12,
	BOSS: 13,
	DEATHKNIGHT: 14,
	
	// Armors
	FIREFOX: 20,
	CLOTHARMOR: 21,
	LEATHERARMOR: 22,
	MAILARMOR: 23,
	PLATEARMOR: 24,
	REDARMOR: 25,
	GOLDENARMOR: 26,
	
	// Objects
	FLASK: 35,
	BURGER: 36,
	CHEST: 37,
	FIREPOTION: 38,
	CAKE: 39,
	
	// NPCs
	GUARD: 40,
	KING: 41,
	OCTOCAT: 42,
	VILLAGEGIRL: 43,
	VILLAGER: 44,
	PRIEST: 45,
	SCIENTIST: 46,
	AGENT: 47,
	RICK: 48,
	NYAN: 49,
	SORCERER: 50,
	BEACHNPC: 51,
	FORESTNPC: 52,
	DESERTNPC: 53,
	LAVANPC: 54,
	CODER: 55,
	
	// Weapons
	SWORD1: 60,
	SWORD2: 61,
	REDSWORD: 62,
	GOLDENSWORD: 63,
	MORNINGSTAR: 64,
	AXE: 65,
	BLUESWORD: 66
}

const Orientations = {
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
}


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

// getRandomItemKind = function(item) {
//     var all = this.rankedWeapons.concat(this.rankedArmors)
//     var forbidden = [Entities.SWORD1, Entities.CLOTHARMOR],
//     var itemKinds = _.difference(all, forbidden),
//     var i = Math.floor(Math.random() * itemKinds.length);
	
//     return itemKinds[i];
// };

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
};


export {
	Messages,
	Entities,
	Orientations,
	kinds,
	rankedWeapons,
	rankedArmors,
}