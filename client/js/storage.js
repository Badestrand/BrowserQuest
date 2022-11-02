import * as _ from 'underscore'

import Player from './player'
import {clone} from './util'
import {AllCharacterClasses} from '../../shared/game'



/* 
	TODO: This should probably support versioning and also use Character.serialize/unserialize
	TODO: This should also not really hold the game state
*/

export default class Storage {
	constructor() {
		if(this.hasLocalStorage() && localStorage.data) {
			this.data = JSON.parse(localStorage.data);
		} else {
			this.resetData();
		}
	}

	resetData() {
		const classInfo = _.findWhere(AllCharacterClasses, {name: 'Barbarian'})
		this.data = {
			hasAlreadyPlayed: false,
			player: {  // TODO: should come from empty player?
				name: '',
				weapon: '',
				armor: '',
				image: '',
				exp: 0,
				level: 1,
				attrs: clone(classInfo.attributes),
			},
			achievements: {
				unlocked: [],
				ratCount: 0,
				skeletonCount: 0,
				totalKills: 0,
				totalDmg: 0,
				totalRevives: 0
			}
		};
	}

	hasLocalStorage() {
		try {
			localStorage.setItem('bq-test', 123)
			localStorage.removeItem('test')
			return true
		} catch (exception) {
			return false
		}
	}

	save() {
		if(this.hasLocalStorage()) {
			localStorage.data = JSON.stringify(this.data)
		}
	}

	clear() {
		if(this.hasLocalStorage()) {
			localStorage.data = ''
			this.resetData()
		}
	}


	// PLAYER
	hasAlreadyPlayed() {
		return this.data.hasAlreadyPlayed;
	}

	initPlayer(name) {
		this.data.hasAlreadyPlayed = true;
		this.setPlayerName(name);
	}

	setPlayerName(name) {
		this.data.player.name = name;
		this.save();
	}

	savePlayer(img, player) {
		this.data.player.image = img
		this.data.player = {
			...this.data.player,
			...player.serialize(),
		}
		this.save()
	}


	// ACHIEVEMENTS
	hasUnlockedAchievement(id) {
		return _.include(this.data.achievements.unlocked, id);
	}

	unlockAchievement(id) {
		if(!this.hasUnlockedAchievement(id)) {
			this.data.achievements.unlocked.push(id);
			this.save();
			return true;
		}
		return false;
	}

	getAchievementCount() {
		return _.size(this.data.achievements.unlocked);
	}

	// Angry rats
	getRatCount() {
		return this.data.achievements.ratCount;
	}

	incrementRatCount() {
		if(this.data.achievements.ratCount < 10) {
			this.data.achievements.ratCount++;
			this.save();
		}
	}
	
	// Skull Collector
	getSkeletonCount() {
		return this.data.achievements.skeletonCount;
	}

	incrementSkeletonCount() {
		if(this.data.achievements.skeletonCount < 10) {
			this.data.achievements.skeletonCount++;
			this.save();
		}
	}

	// Meatshield
	getTotalDamageTaken() {
		return this.data.achievements.totalDmg;
	}

	addDamage(damage) {
		if(this.data.achievements.totalDmg < 5000) {
			this.data.achievements.totalDmg += damage;
			this.save();
		}
	}
	
	// Hunter
	getTotalKills() {
		return this.data.achievements.totalKills;
	}

	incrementTotalKills() {
		if(this.data.achievements.totalKills < 50) {
			this.data.achievements.totalKills++;
			this.save();
		}
	}

	// Still Alive
	getTotalRevives() {
		return this.data.achievements.totalRevives;
	}

	incrementRevives() {
		if(this.data.achievements.totalRevives < 5) {
			this.data.achievements.totalRevives++;
			this.save();
		}
	}
}