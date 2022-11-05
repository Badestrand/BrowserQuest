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



export default AllCharacterClasses
