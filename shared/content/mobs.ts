import {Entities} from '../constants'




const AllMobVariants: Array<MobVariantInfo> = [{
	kind: Entities.RAT,
	key: 'rat',
	drops: {
		flask: 40,
		burger: 10,
		firepotion: 5
	},
	hp: 25,
	armor: 1,
	weapon: 1,
	exp: 25,
	moveSpeed: 350,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 50,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 700,
		shadowOffsetY: -2,
	},
	behaviour: {
		isAggressive: false,
		aggroRange: 1,
	},
}, {
	kind: Entities.CRAB,
	key: 'crab',
	drops: {
		flask: 50,
		axe: 20,
		leatherarmor: 10,
		firepotion: 5
	},
	hp: 60,
	armor: 2,
	weapon: 1,
	exp: 60,
	moveSpeed: 200,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 40,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 500,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.BAT,
	key: 'bat',
	drops: {
		flask: 50,
		axe: 10,
		firepotion: 5
	},
	hp: 80,
	armor: 2,
	weapon: 1,
	exp: 80,
	moveSpeed: 120,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 90,
		walkAnimationSpeed: 85,
		idleAnimationSpeed: 90,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: false,
		aggroRange: 1,
	},
}, {
	kind: Entities.GOBLIN,
	key: 'goblin',
	drops: {
		flask: 50,
		leatherarmor: 20,
		axe: 10,
		firepotion: 5
	},
	hp: 90,
	armor: 2,
	weapon: 1,
	exp: 90,
	moveSpeed: 150,
	attackCooldown: 700,
	graphics: {
		attackAnimationSpeed: 60,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 600,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.WIZARD,
	key: 'wizard',
	drops: {
		flask: 50,
		platearmor: 20,
		firepotion: 5
	},
	hp: 100,
	armor: 2,
	weapon: 6,
	exp: 100,
	moveSpeed: 200,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 100,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 150,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.SKELETON,
	key: 'skeleton',
	drops: {
		flask: 40,
		mailarmor: 10,
		axe: 20,
		firepotion: 5
	},
	hp: 110,
	armor: 2,
	weapon: 2,
	exp: 110,
	moveSpeed: 350,
	attackCooldown: 1300,
	graphics: {
		attackAnimationSpeed: 100,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 800,
		shadowOffsetY: 1,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.SNAKE,
	key: 'snake',
	drops: {
		flask: 50,
		mailarmor: 10,
		morningstar: 10,
		firepotion: 5
	},
	hp: 150,
	armor: 3,
	weapon: 2,
	exp: 150,
	moveSpeed: 200,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 40,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 250,
		shadowOffsetY: -4,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.OGRE,
	key: 'ogre',
	drops: {
		burger: 10,
		flask: 50,
		platearmor: 20,
		morningstar: 20,
		firepotion: 5
	},
	hp: 200,
	armor: 3,
	weapon: 2,
	exp: 200,
	moveSpeed: 300,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 100,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 600,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.SKELETON2,
	key: 'skeleton2',
	drops: {
		flask: 60,
		platearmor: 15,
		bluesword: 15,
		firepotion: 5
	},
	hp: 200,
	armor: 3,
	weapon: 3,
	exp: 200,
	moveSpeed: 200,
	attackCooldown: 1300,
	graphics: {
		attackAnimationSpeed: 100,
		walkAnimationSpeed: 200,
		idleAnimationSpeed: 800,
		shadowOffsetY: 1,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.EYE,
	key: 'eye',
	drops: {
		flask: 50,
		redarmor: 20,
		redsword: 10,
		firepotion: 5
	},
	hp: 200,
	armor: 3,
	weapon: 3,
	exp: 200,
	moveSpeed: 200,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 40,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 50,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.SPECTRE,
	key: 'spectre',
	drops: {
		flask: 30,
		redarmor: 40,
		redsword: 30,
		firepotion: 5
	},
	hp: 250,
	armor: 2,
	weapon: 4,
	exp: 250,
	moveSpeed: 150,
	attackCooldown: 900,
	graphics: {
		attackAnimationSpeed: 50,
		walkAnimationSpeed: 200,
		idleAnimationSpeed: 200,
		shadowOffsetY: 1,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 1,
	},
}, {
	kind: Entities.DEATHKNIGHT,
	key: 'deathknight',
	drops: {
		burger: 95,
		firepotion: 5
	},
	hp: 250,
	armor: 3,
	weapon: 3,
	exp: 250,
	moveSpeed: 220,
	attackCooldown: 800,
	graphics: {
		attackAnimationSpeed: 50,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 450,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 3,
	},
}, {
	kind: Entities.BOSS,
	key: 'boss',
	drops: {
		goldensword: 100
	},
	hp: 700,
	armor: 6,
	weapon: 7,
	exp: 700,
	moveSpeed: 300,
	attackCooldown: 2000,
	graphics: {
		attackAnimationSpeed: 50,
		walkAnimationSpeed: 100,
		idleAnimationSpeed: 400,
		shadowOffsetY: 0,
	},
	behaviour: {
		isAggressive: true,
		aggroRange: 3,
	},
}]


export default AllMobVariants
