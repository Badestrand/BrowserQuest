// From https://d2.lc/AB/wiki/indexce93.html?title=Class, atr
const AllCharacterClasses: Array<CharacterClassInfo> = [{
	id: 'barbarian',
	name: 'Barbarian',
	isAvailable: true,
	attributes: {
		str: 30,
		dex: 20,
		vit: 25,
		ene: 10,
	},
	life: 55,
	mana: 10,
	stam: 92,
	atr: 20,
	// atr: 85,

	lifePerLevel: 2.0,
	manaPerLevel: 1.0,
	stamPerVit: 1.0,
	lifePerVit: 4.0,
	manaPerEne: 1.0,
}, {
	id: 'amazon',
	name: 'Amazon',
	isAvailable: false,
	attributes: {
		str: 20,
		dex: 25,
		vit: 20,
		ene: 15,
	},
	life: 50,
	mana: 15,
	stam: 84,
	atr: 5,
	// atr: 95,

	lifePerLevel: 1.0,
	manaPerLevel: 1.5,
	stamPerVit: 1.0,
	lifePerVit: 3.0,
	manaPerEne: 1.5,
}, {
	id: 'name',
	name: 'Sorceress',
	isAvailable: false,
	attributes: {
		str: 10,
		dex: 25,
		vit: 10,
		ene: 35,
	},
	life: 40,
	mana: 35,
	stam: 74,
	atr: -15,
	// atr: 75,

	lifePerLevel: 1.0,
	manaPerLevel: 2.0,
	stamPerVit: 1.0,
	lifePerVit: 2.0,
	manaPerEne: 2.0,
}]


const LEVEL_REQUIREMENTS = [
	0, 500, 1500, 3750, 7875, 14175, 22680, 32886, 44396, 57715, 72144, 
	90180, 112725, 140906, 176132, 220165, 275207, 344008, 430010, 537513, 671891, 839864, 
	1049830, 1312287, 1640359, 2050449, 2563061, 3203826, 3902260, 4663553, 5493363, 6397855, 7383755, 
	8458379, 9629723, 10906488, 12298162, 13815086, 15468534, 17270791, 19235252, 21376515, 23710491, 26254525, 
	29027522, 32050088, 35344686, 38935798, 42850109, 47116709, 51767302, 56836449, 62361819, 68384473, 74949165, 
	82104680, 89904191, 98405658, 107672256, 117772849, 128782495, 140783010, 153863570, 168121381, 183662396, 200602101, 
	219066380, 239192444, 261129853, 285041630, 311105466, 339515048, 370481492, 404234916, 441026148, 481128591, 524840254, 
	572485967, 624419793, 681027665, 742730244, 809986056, 883294891, 963201521, 1050299747, 1145236814, 1248718217, 1361512946, 
	1484459201, 1618470619, 1764543065, 1923762030, 2097310703, 2286478756, 2492671933, 2717422497, 2962400612, 3229426756, 3520485254
]


const ATTR_POINTS_PER_LEVEL = 5


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
	AllCharacterClasses,
	LEVEL_REQUIREMENTS,
	ATTR_POINTS_PER_LEVEL,
}