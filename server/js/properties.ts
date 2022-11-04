import * as log from './log'
import * as Types from "../../shared/gametypes"



var Properties: any = {
	rat: {
		drops: {
			flask: 40,
			burger: 10,
			firepotion: 5
		},
		hp: 25,
		armor: 1,
		weapon: 1,
		exp: 25,
	},
	crab: {
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
	},
	bat: {
		drops: {
			flask: 50,
			axe: 10,
			firepotion: 5
		},
		hp: 80,
		armor: 2,
		weapon: 1,
		exp: 80,
	},
	goblin: {
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
	},
	wizard: {
		drops: {
			flask: 50,
			platearmor: 20,
			firepotion: 5
		},
		hp: 100,
		armor: 2,
		weapon: 6,
		exp: 100,
	},
	skeleton: {
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
	},
	snake: {
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
	},
	ogre: {
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
	},
	skeleton2: {
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
	},
	eye: {
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
	},
	spectre: {
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
	},
	deathknight: {
		drops: {
			burger: 95,
			firepotion: 5
		},
		hp: 250,
		armor: 3,
		weapon: 3,
		exp: 250,
	},
	boss: {
		drops: {
			goldensword: 100
		},
		hp: 700,
		armor: 6,
		weapon: 7,
		exp: 700,
	}
};

Properties.getArmorLevel = function(kind) {
	try {
		if(Types.isMob(kind)) {
			return Properties[Types.getKindAsString(kind)].armor;
		} else {
			return Types.getArmorRank(kind) + 1;
		}
	} catch(e) {
		log.error("No level found for armor: "+Types.getKindAsString(kind));
	}
};

Properties.getWeaponLevel = function(kind) {
	try {
		if(Types.isMob(kind)) {
			return Properties[Types.getKindAsString(kind)].weapon;
		} else {
			return Types.getWeaponRank(kind) + 1;
		}
	} catch(e) {
		log.error("No level found for weapon: "+Types.getKindAsString(kind));
	}
};

Properties.getMobExperience = function(kind) {
	return Properties[Types.getKindAsString(kind)].exp
}

Properties.getHitpoints = function(kind) {
	return Properties[Types.getKindAsString(kind)].hp;
};



export default Properties