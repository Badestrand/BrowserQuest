import * as _ from 'underscore'

import * as log from './log'
import Entity from './entity'
import Character from './character'
import Mob from './mob'
import Map from './map'
import Npc from './npc'
import Player from './player'
import Item from './item'
import MobArea from './mobarea'
import ChestArea from './chestarea'
import Chest from './chest'
import * as Messages from './message'
import * as Utils from './utils'
import * as Types from '../../shared/gametypes'
import {Entities} from '../../shared/constants'




export default class World {
	constructor(id, maxPlayers, websocketServer) {
		var self = this;

		this.id = id;
		this.maxPlayers = maxPlayers;
		this.server = websocketServer;
		this.ups = 50;
		
		this.map = null;
		
		this.entities = {};
		this.players = {};
		this.mobs = {};
		this.attackers = {};
		this.items = {};
		this.equipping = {};
		this.hurt = {};
		this.npcs = {};
		this.mobAreas = [];
		this.chestAreas = [];
		this.groups = {};
		
		this.outgoingQueues = {};
		
		this.itemCount = 0;
		
		this.zoneGroupsReady = false;

		// Called when an entity is attacked by another entity
		this.onEntityAttack(function(attacker) {
			var target = self.getEntityById(attacker.target);
			if(target && attacker.type === "mob") {
				var pos = self.findPositionNextTo(attacker, target);
				self.moveEntity(attacker, pos.x, pos.y);
			}
		});
		
		this.onRegenTick(function() {
			self.forEachCharacter(function(character) {
				if(!character.hasFullHealth()) {
					character.regenHealthBy(Math.floor(character.maxHitpoints / 100));
					if(character.type === 'player') {
						self.pushToPlayer(character, new Messages.CurHitpoints(character.hitpoints, true))
					}
				}
			})
		})
	}


	requestPosition(checkpoint) {
		if(checkpoint) {
			return checkpoint.getRandomPosition()
		} else {
			return this.map.getRandomStartingPosition()
		}
	}


	addPlayer(player) {
		log.info(player.name + " has joined world "+ this.id)

		var move_callback = (x, y) => {
			log.debug(player.name + " is moving to (" + x + ", " + y + ").");
			
			player.forEachAttacker((mob) => {
				var target = this.getEntityById(mob.target);
				if(target) {
					var pos = this.findPositionNextTo(mob, target);
					if(mob.distanceToSpawningPoint(pos.x, pos.y) > 50) {
						mob.clearTarget();
						mob.forgetEveryone();
						player.removeAttacker(mob);
					} else {
						this.moveEntity(mob, pos.x, pos.y);
					}
				}
			});
		};

		player.onMove(move_callback)
		player.onLootMove(move_callback)

		player.onZone(() => {
			var hasChangedGroups = this.handleEntityGroupMembership(player)

			if(hasChangedGroups) {
				this.pushToPreviousGroups(player, new Messages.Destroy(player))
				this.pushRelevantEntityListTo(player)
			}
		})

		player.onBroadcast((message, ignoreSelf) => {
			this.pushToAdjacentGroups(player.group, message, ignoreSelf ? player.id : null)
		})

		player.onBroadcastToZone((message, ignoreSelf) => {
			this.pushToGroup(player.group, message, ignoreSelf ? player.id : null)
		})

		player.onExit(() => {
			log.info(player.name + " has left the game.")
			this.removePlayer(player)
			this.updatePopulation()
			
			if(this.removed_callback) {
				this.removed_callback()
			}
		});
		
		if(this.added_callback) {
			this.added_callback()
		}

		this.addEntity(player)
		this.players[player.id] = player
		this.outgoingQueues[player.id] = []
		this.pushRelevantEntityListTo(player)

		// Number of players in this world and in the overall server world
		this.updatePopulation();
	}

	
	run(mapFilePath) {
		var self = this;
		this.map = new Map(mapFilePath);

		this.map.ready(function() {
			self.initZoneGroups();
			
			self.map.generateCollisionGrid();
			
			// Populate all mob "roaming" areas
			_.each(self.map.mobAreas, function(a) {
				var area = new MobArea(a.id, a.nb, a.type, a.x, a.y, a.width, a.height, self);
				area.spawnMobs();
				area.onEmpty(self.handleEmptyMobArea.bind(self, area));
				
				self.mobAreas.push(area);
			});
			
			// Create all chest areas
			_.each(self.map.chestAreas, function(a) {
				var area = new ChestArea(a.id, a.x, a.y, a.w, a.h, a.tx, a.ty, a.i, self);
				self.chestAreas.push(area);
				area.onEmpty(self.handleEmptyChestArea.bind(self, area));
			});
			
			// Spawn static chests
			_.each(self.map.staticChests, function(chest) {
				var c = self.createChest(chest.x, chest.y, chest.i);
				self.addStaticItem(c);
			});
			
			// Spawn static entities
			self.spawnStaticEntities();
			
			// Set maximum number of entities contained in each chest area
			_.each(self.chestAreas, function(area) {
				area.setNumberOfEntities(area.entities.length);
			});
		});
		
		var regenCount = this.ups * 2;
		var updateCount = 0;
		setInterval(function() {
			self.processGroups();
			self.processQueues();
			
			if(updateCount < regenCount) {
				updateCount += 1;
			} else {
				if(self.regen_callback) {
					self.regen_callback();
				}
				updateCount = 0;
			}
		}, 1000 / this.ups);
		
		log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
	}
	
	setUpdatesPerSecond(ups) {
		this.ups = ups;
	}
	
	onInit(callback) {
		this.init_callback = callback;
	}

	onPlayerConnect(callback) {
		this.connect_callback = callback;
	}
	
	onPlayerAdded(callback) {
		this.added_callback = callback;
	}
	
	onPlayerRemoved(callback) {
		this.removed_callback = callback;
	}
	
	onRegenTick(callback) {
		this.regen_callback = callback;
	}
	
	pushRelevantEntityListTo(player) {
		var entities;
		
		if(player && (player.group in this.groups)) {
			entities = _.keys(this.groups[player.group].entities);
			entities = _.reject(entities, function(id) { return id == player.id; });
			entities = _.map(entities, function(id) { return parseInt(id); });
			if(entities) {
				this.pushToPlayer(player, new Messages.List(entities));
			}
		}
	}
	
	pushSpawnsToPlayer(player, ids) {
		var self = this;
		
		_.each(ids, function(id) {
			var entity = self.getEntityById(id);
			if(entity) {
				self.pushToPlayer(player, new Messages.Spawn(entity));
			}
		});
		
		log.debug("Pushed "+_.size(ids)+" new spawns to "+player.id);
	}
	
	pushToPlayer(player, message) {
		if(player && player.id in this.outgoingQueues) {
			this.outgoingQueues[player.id].push(message.serialize());
		} else {
			log.error("pushToPlayer: player was undefined");
		}
	}
	
	pushToGroup(groupId, message, ignoredPlayer=undefined) {
		var self = this,
			group = this.groups[groupId];
		
		if(group) {
			_.each(group.players, function(playerId) {
				if(playerId != ignoredPlayer) {
					self.pushToPlayer(self.getEntityById(playerId), message);
				}
			});
		} else {
			log.error("groupId: "+groupId+" is not a valid group");
		}
	}
	
	pushToAdjacentGroups(groupId, message, ignoredPlayer=undefined) {
		var self = this;
		self.map.forEachAdjacentGroup(groupId, function(id) {
			self.pushToGroup(id, message, ignoredPlayer);
		});
	}
	
	pushToPreviousGroups(player, message) {
		var self = this;
		
		// Push this message to all groups which are not going to be updated anymore,
		// since the player left them.
		_.each(player.recentlyLeftGroups, function(id) {
			self.pushToGroup(id, message, undefined);
		});
		player.recentlyLeftGroups = [];
	}
	
	pushBroadcast(message, ignoredPlayer) {
		for(var id in this.outgoingQueues) {
			if(id != ignoredPlayer) {
				this.outgoingQueues[id].push(message.serialize());
			}
		}
	}
	
	processQueues() {
		var self = this,
			connection;

		for(var id in this.outgoingQueues) {
			if(this.outgoingQueues[id].length > 0) {
				connection = this.server.getConnection(id);
				connection.send(this.outgoingQueues[id]);
				this.outgoingQueues[id] = [];
			}
		}
	}
	
	addEntity(entity) {
		this.entities[entity.id] = entity;
		this.handleEntityGroupMembership(entity);
	}
	
	removeEntity(entity) {
		if(entity.id in this.entities) {
			delete this.entities[entity.id];
		}
		if(entity.id in this.mobs) {
			delete this.mobs[entity.id];
		}
		if(entity.id in this.items) {
			delete this.items[entity.id];
		}
		
		if(entity.type === "mob") {
			this.clearMobAggroLink(entity);
			this.clearMobHateLinks(entity);
		}
		
		entity.destroy();
		this.removeFromGroups(entity);
		log.debug("Removed "+ Types.getKindAsString(entity.kind) +" : "+ entity.id);
	}


	removePlayer(player) {
		player.broadcast(new Messages.Despawn(player.id))
		this.removeEntity(player);
		delete this.players[player.id];
		delete this.outgoingQueues[player.id];
	}
	
	addMob(mob) {
		this.addEntity(mob);
		this.mobs[mob.id] = mob;
	}
	
	addNpc(kind, x, y) {
		var npc = new Npc('8'+x+''+y, kind, x, y);
		this.addEntity(npc);
		this.npcs[npc.id] = npc;
		
		return npc;
	}
	
	addItem(item) {
		this.addEntity(item);
		this.items[item.id] = item;
		
		return item;
	}

	createItem(kind, x, y) {
		var id = '9'+this.itemCount++,
			item = null;
		
		if(kind === Entities.CHEST) {
			item = new Chest(id, x, y);
		} else {
			item = new Item(id, kind, x, y);
		}
		return item;
	}

	createChest(x, y, items) {
		var chest = this.createItem(Entities.CHEST, x, y);
		chest.setItems(items);
		return chest;
	}
	
	addStaticItem(item) {
		item.isStatic = true;
		item.onRespawn(this.addStaticItem.bind(this, item));
		
		return this.addItem(item);
	}
	
	addItemFromChest(kind, x, y) {
		var item = this.createItem(kind, x, y);
		item.isFromChest = true;
		
		return this.addItem(item);
	}
	
	/**
	 * The mob will no longer be registered as an attacker of its current target.
	 */
	clearMobAggroLink(mob) {
		var player = null;
		if(mob.target) {
			player = this.getEntityById(mob.target);
			if(player) {
				player.removeAttacker(mob);
			}
		}
	}

	clearMobHateLinks(mob) {
		var self = this;
		if(mob) {
			_.each(mob.hatelist, function(obj) {
				var player = self.getEntityById(obj.id);
				if(player) {
					player.removeHater(mob);
				}
			});
		}
	}
	
	forEachEntity(callback) {
		for(var id in this.entities) {
			callback(this.entities[id]);
		}
	}
	
	forEachPlayer(callback) {
		for(var id in this.players) {
			callback(this.players[id]);
		}
	}
	
	forEachMob(callback) {
		for(var id in this.mobs) {
			callback(this.mobs[id]);
		}
	}
	
	forEachCharacter(callback) {
		this.forEachPlayer(callback);
		this.forEachMob(callback);
	}
	
	handleMobHate(mobId, playerId, hatePoints) {
		var mob = this.getEntityById(mobId),
			player = this.getEntityById(playerId),
			mostHated;
		
		if(player && mob) {
			mob.increaseHateFor(playerId, hatePoints);
			player.addHater(mob);
			
			if(mob.hitpoints > 0) { // only choose a target if still alive
				this.chooseMobTarget(mob, undefined);
			}
		}
	}
	
	chooseMobTarget(mob, hateRank) {
		var player = this.getEntityById(mob.getHatedPlayerId(hateRank));
		
		// If the mob is not already attacking the player, create an attack link between them.
		if(player && !(mob.id in player.attackers)) {
			this.clearMobAggroLink(mob);
			
			player.addAttacker(mob);
			mob.setTarget(player);
			
			this.broadcastAttacker(mob);
			log.debug(mob.id + " is now attacking " + player.id);
		}
	}
	
	onEntityAttack(callback) {
		this.attack_callback = callback;
	}
	
	getEntityById(id) {
		if(id in this.entities) {
			return this.entities[id];
		} else {
			log.error("Unknown entity : " + id);
		}
	}

	broadcastAttacker(character) {
		if(character) {
			const message = new Messages.Attack(character.id, character.target)
			this.pushToAdjacentGroups(character.group, message, character.id)
		}
		if(this.attack_callback) {
			this.attack_callback(character);
		}
	}
	
	handleHurtEntity(entity, attacker, damage) {
		var self = this;

		if(entity.type === 'player') {
			// A player is only aware of their own hitpoints
			this.pushToPlayer(entity, new Messages.CurHitpoints(entity.hitpoints, false))
		}
		
		if(entity.type === 'mob') {
			// Let the mob's attacker (player) know how much damage was inflicted
			this.pushToPlayer(attacker, new Messages.Damage(entity, damage));
		}

		// If the entity is about to die
		if(entity.hitpoints <= 0) {
			if(entity.type === "mob") {
				var mob = entity
				var item = this.getDroppedItem(mob)
				const exp = mob.variant.exp
				this.pushToPlayer(attacker, new Messages.Kill(mob, exp))
				attacker.addExperience(exp)
				this.pushToAdjacentGroups(mob.group, new Messages.Despawn(mob.id)) // Despawn must be enqueued before the item drop
				if(item) {
					this.pushToAdjacentGroups(mob.group, new Messages.Drop(mob, item))
					this.handleItemDespawn(item);
				}
			}
	
			if(entity.type === "player") {
				this.handlePlayerVanish(entity);
				this.pushToAdjacentGroups(entity.group, new Messages.Despawn(entity.id))
			}
	
			this.removeEntity(entity);
		}
	}
	
	despawn(entity) {
		this.pushToAdjacentGroups(entity.group, new Messages.Despawn(entity.id))

		if(entity.id in this.entities) {
			this.removeEntity(entity);
		}
	}
	
	spawnStaticEntities() {
		var self = this,
			count = 0;
		
		_.each(this.map.staticEntities, function(kindName, tid) {
			var kind = Types.getKindFromString(kindName),
				pos = self.map.tileIndexToGridPosition(tid);
			
			if(Types.isNpc(kind)) {
				self.addNpc(kind, pos.x + 1, pos.y);
			}
			if(Types.isMob(kind)) {
				var mob = new Mob('7' + kind + count++, kind, pos.x + 1, pos.y);
				mob.onRespawn(function() {
					mob.isDead = false;
					self.addMob(mob);
					if(mob.area && mob.area instanceof ChestArea) {
						mob.area.addToArea(mob);
					}
				});
				mob.onMove(self.onMobMoveCallback.bind(self));
				self.addMob(mob);
				self.tryAddingMobToChestArea(mob);
			}
			if(Types.isItem(kind)) {
				self.addStaticItem(self.createItem(kind, pos.x + 1, pos.y));
			}
		});
	}

	isValidPosition(x, y) {
		if(this.map && _.isNumber(x) && _.isNumber(y) && !this.map.isOutOfBounds(x, y) && !this.map.isColliding(x, y)) {
			return true;
		}
		return false;
	}
	
	handlePlayerVanish(player) {
		var self = this,
			previousAttackers = [];
		
		// When a player dies or teleports, all of his attackers go and attack their second most hated player.
		player.forEachAttacker(function(mob) {
			previousAttackers.push(mob);
			self.chooseMobTarget(mob, 2);
		});
		
		_.each(previousAttackers, function(mob) {
			player.removeAttacker(mob);
			mob.clearTarget();
			mob.forgetPlayer(player.id, 1000);
		});
		
		this.handleEntityGroupMembership(player);
	}
	
	
	getDroppedItem(mob) {
		var v = Utils.random(100),
			p = 0,
			item = null;

		for(var itemName in mob.variant.drops) {
			const percentage = mob.variant.drops[itemName]
			p += percentage;
			if(v <= p) {
				item = this.addItem(this.createItem(Types.getKindFromString(itemName), mob.x, mob.y));
				break;
			}
		}
		
		return item;
	}
	
	onMobMoveCallback(mob) {
		this.pushToAdjacentGroups(mob.group, new Messages.Move(mob));
		this.handleEntityGroupMembership(mob);
	}
	
	findPositionNextTo(entity, target) {
		var valid = false,
			pos;
		
		while(!valid) {
			pos = entity.getPositionNextTo(target);
			valid = this.isValidPosition(pos.x, pos.y);
		}
		return pos;
	}
	
	initZoneGroups() {
		var self = this;
		
		this.map.forEachGroup(function(id) {
			self.groups[id] = { entities: {},
								players: [],
								incoming: []};
		});
		this.zoneGroupsReady = true;
	}
	
	removeFromGroups(entity) {
		var self = this,
			oldGroups = [];
		
		if(entity && entity.group) {
			
			var group = this.groups[entity.group];
			if(entity instanceof Player) {
				group.players = _.reject(group.players, function(id) { return id === entity.id; });
			}
			
			this.map.forEachAdjacentGroup(entity.group, function(id) {
				if(entity.id in self.groups[id].entities) {
					delete self.groups[id].entities[entity.id];
					oldGroups.push(id);
				}
			});
			entity.group = null;
		}
		return oldGroups;
	}
	
	/**
	 * Registers an entity as "incoming" into several groups, meaning that it just entered them.
	 * All players inside these groups will receive a Spawn message when WorldServer.processGroups is called.
	 */
	addAsIncomingToGroup(entity, groupId) {
		var self = this,
			isChest = entity && entity instanceof Chest,
			isItem = entity && entity instanceof Item,
			isDroppedItem =  entity && isItem && !entity.isStatic && !entity.isFromChest;
		
		if(entity && groupId) {
			this.map.forEachAdjacentGroup(groupId, function(id) {
				var group = self.groups[id];
				
				if(group) {
					if(!_.include(group.entities, entity.id)
					//  Items dropped off of mobs are handled differently via DROP messages. See handleHurtEntity.
					&& (!isItem || isChest || (isItem && !isDroppedItem))) {
						group.incoming.push(entity);
					}
				}
			});
		}
	}
	
	addToGroup(entity, groupId) {
		var self = this,
			newGroups = [];
		
		if(entity && groupId && (groupId in this.groups)) {
			this.map.forEachAdjacentGroup(groupId, function(id) {
				self.groups[id].entities[entity.id] = entity;
				newGroups.push(id);
			});
			entity.group = groupId;
			
			if(entity instanceof Player) {
				this.groups[groupId].players.push(entity.id);
			}
		}
		return newGroups;
	}
	
	logGroupPlayers(groupId) {
		log.debug("Players inside group "+groupId+":");
		_.each(this.groups[groupId].players, function(id) {
			log.debug("- player "+id);
		});
	}
	
	handleEntityGroupMembership(entity) {
		var hasChangedGroups = false;
		if(entity) {
			var groupId = this.map.getGroupIdFromPosition(entity.x, entity.y);
			if(!entity.group || (entity.group && entity.group !== groupId)) {
				hasChangedGroups = true;
				this.addAsIncomingToGroup(entity, groupId);
				var oldGroups = this.removeFromGroups(entity);
				var newGroups = this.addToGroup(entity, groupId);
				
				if(_.size(oldGroups) > 0) {
					entity.recentlyLeftGroups = _.difference(oldGroups, newGroups);
					log.debug("group diff: " + entity.recentlyLeftGroups);
				}
			}
		}
		return hasChangedGroups;
	}
	
	processGroups() {
		var self = this;
		
		if(this.zoneGroupsReady) {
			this.map.forEachGroup(function(id) {
				var spawns = [];
				if(self.groups[id].incoming.length > 0) {
					spawns = _.each(self.groups[id].incoming, function(entity) {
						if(entity instanceof Player) {
							self.pushToGroup(id, new Messages.Spawn(entity), entity.id);
						} else {
							self.pushToGroup(id, new Messages.Spawn(entity));
						}
					});
					self.groups[id].incoming = [];
				}
			});
		}
	}
	
	moveEntity(entity, x, y) {
		if(entity) {
			entity.setPosition(x, y);
			this.handleEntityGroupMembership(entity);
		}
	}
	
	handleItemDespawn(item) {
		var self = this;
		
		if(item) {
			item.handleDespawn({
				beforeBlinkDelay: 10000,
				blinkCallback() {
					self.pushToAdjacentGroups(item.group, new Messages.Blink(item));
				},
				blinkingDuration: 4000,
				despawnCallback() {
					self.pushToAdjacentGroups(item.group, new Messages.Destroy(item));
					self.removeEntity(item);
				}
			});
		}
	}
	
	handleEmptyMobArea(area) {

	}
	
	handleEmptyChestArea(area) {
		if(area) {
			var chest = this.addItem(this.createChest(area.chestX, area.chestY, area.items));
			this.handleItemDespawn(chest);
		}
	}
	
	handleOpenedChest(chest, player) {
		this.pushToAdjacentGroups(chest.group, new Messages.Despawn(chest.id))
		this.removeEntity(chest);
		
		var kind = chest.getRandomItem();
		if(kind) {
			var item = this.addItemFromChest(kind, chest.x, chest.y);
			this.handleItemDespawn(item);
		}
	}
	
	tryAddingMobToChestArea(mob) {
		_.each(this.chestAreas, function(area) {
			if(area.contains(mob)) {
				area.addToArea(mob);
			}
		});
	}


	getPlayerCount(): number {
		return Object.values(this.players).length
	}


	updatePopulation() {
		const worldPlayers = this.getPlayerCount()
		const totalPlayers = this.server.connectionsCount();
		this.pushBroadcast(new Messages.Population(worldPlayers, totalPlayers), undefined);
	}


	public id: any
	public maxPlayers: any
	public server: any
	public ups: any
	public map: any
	public entities: any
	public players: any
	public mobs: any
	public attackers: any
	public items: any
	public equipping: any
	public hurt: any
	public npcs: any
	public mobAreas: any
	public chestAreas: any
	public groups: any
	public outgoingQueues: any
	public itemCount: any
	public zoneGroupsReady: any
	public removed_callback: any
	public added_callback: any
	public regen_callback: any
	public init_callback: any
	public connect_callback: any
	public attack_callback: any
}