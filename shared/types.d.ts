type ItemType = 'weapon' | 'shield' | 'helmet' | 'body-armor'




type MobVariantInfo = {
	kind: number
	key: string
	drops: {[itemKey: string]: number}
	hp: number
	armor: number
	weapon: number
	exp: number
}


type WeaponVariantInfo = {
	kind: number
	key: string
	name: string
	weaponLevel: number
}



type ArmorVariantInfo = {
	kind: number
	key: string
	name: string
	armorLevel: number
}



// type ItemVariantInfo = {
// 	type: string
// 	name: string
// 	requirements: {
// 		level?: number
// 		str?: number
// 		dex?: number
// 	}
// 	durability?: number
// 	rarity: 'Normal' | 'Exceptional' | 'Elite'
// 	storageWidth: number
// 	storageHeight: number
// 	imageUrl: string
// }


// type Item = {
// 	type: ItemType
// 	variant: ItemVariantInfo
// 	model: {
// 		mesh: THREE.Object3D
// 	}
// }


type HeroAccessInfo = {
	ident: string
	secret: string
}


type HeroInfo = {
	ident: string   // TODO: erase from here
	secret: string  // TODO: erase from here

	name: string
	armorKind: number
	weaponKind: number
	charClassId: string
	spentAttrPoints: {
		str: number
		dex: number
		vit: number
		ene: number
	}
	experience: number
}




// type ActiveObject = {
// 	tick(deltaTime: number): void

// 	mesh: THREE.Object3D
// }


// type ItemOnGround = {
// 	mesh: THREE.Object3D
// 	bagMesh: THREE.Mesh
// 	item: Item
// 	highlighted: boolean
// 	speed: THREE.Vector3
// 	removed: boolean
// 	// vr: number
// }





// type WeaponTypeName = 'spear-2h' | 'sword-1h' | 'sword-2h' | 'axe-1h' | 'axe-2h' | 'hammer-2h' | 'stick-1h' | 'bow'

// type WeaponVariantInfo = ItemVariantInfo & {
// 	type: WeaponTypeName
// 	hands: number
// 	damage?: {from: number, to: number}
// 	storageWidth: number
// 	storageHeight: number
// }




// type ArmorTypeName = 'helmet' | 'body-armor' | 'shield'

// type ArmorVariantInfo = ItemVariantInfo & {
// 	type: ArmorTypeName
// 	defense: {from: number, to: number}
// }


// type BodyArmorVariantInfo = ArmorVariantInfo & {
// 	power: 'Light' | 'Medium' | 'Heavy'
// }

// type HelmetVariantInfo = ArmorVariantInfo & {
// 	magicLevel?: number
// }

// type ShieldVariantInfo = ArmorVariantInfo & {
// 	blockChance: number
// 	power: 'Light' | 'Medium' | 'Heavy'
// }




type AttrPointsInfo = {
	str: number
	dex: number
	vit: number
	ene: number
}

type AttrShort = 'str'|'dex'|'vit'|'ene'

type SlotInfo = 'head' | 'left-hand' | 'right-hand' | 'torso'

type CharacterClassInfo = {
	id: string
	name: string
	isAvailable: boolean
	attributes: AttrPointsInfo
	life: number
	mana: number
	stam: number
	atr: number

	lifePerLevel: number
	manaPerLevel: number
	stamPerVit: number
	lifePerVit: number
	manaPerEne: number
}





type KeyName = 
	'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' |
	'Digit1' | 'Digit2' | 'Digit3' | 'Digit4' | 'Digit5' | 'Digit6' | 'Digit7' | 'Digit8' | 'Digit9' | 'Digit0' |
	'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' |
	'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ' |
	'Comma' | 'Period' | 'Slash' | 'Backquote' | 'BracketLeft' | 'BracketRight' | 'Backslash' | 'Semicolon' | 'Quote' |
	'Escape' | 'Space' | 'Enter' | 'Tab' | 'ShiftLeft' | 'ShiftRight' | 'ControlLeft' | 'AltLeft' | 'MetaLeft' | 'MetaRight' | 'AltRight'








/*interface MonsterModel {
	mesh: THREE.Object3D

	strike(targetBox: THREE.Box3): void
}


type MonsterInfoBase = {
	group: string
	name: string
	level: number
	experience: number
	immunities: []
	attack: Array<{
		melee?: {from: number, to: number}
		ranged?: {from: number, to: number}
		rating: number
	}>
	defense: number
	block: number
	drainEffectiveness: number
	chillEffectiveness: number
	resistances: {
		cold: number
		fire: number
		light: number
		magic: number
		physical: number
		poison: number
	},
}

type MonsterTypeInfo = MonsterInfoBase & {
	hitpoints: {from: number, to: number}
}

type MonsterInfo = MonsterInfoBase & {
	hitpoints: number
}
*/