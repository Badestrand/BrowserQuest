import * as fs from 'fs'
import * as _ from 'underscore'

import * as log from './log'
import * as Utils from './utils'
import Checkpoint from './checkpoint'




export default class Map {
    constructor(filepath) {
    	var self = this;
    
    	this.isLoaded = false;
    	if( fs.lstatSync(filepath).isFile() ) {
     
            fs.readFile(filepath, function(err, file) {
                var json = JSON.parse(file.toString());
            
                self.initMap(json);
            });
        }
        else
        {
            log.error(filepath + " doesn't exist.");
        }
    }

    initMap(map) {
        this.width = map.width;
        this.height = map.height;
        this.collisions = map.collisions;
        this.mobAreas = map.roamingAreas;
        this.chestAreas = map.chestAreas;
        this.staticChests = map.staticChests;
        this.staticEntities = map.staticEntities;
        this.isLoaded = true;
        
        // zone groups
    	this.zoneWidth = 28;
    	this.zoneHeight = 12;
    	this.groupWidth = Math.floor(this.width / this.zoneWidth);
        this.groupHeight = Math.floor(this.height / this.zoneHeight);
    
        this.initConnectedGroups(map.doors);
        this.initCheckpoints(map.checkpoints);
    
        if(this.ready_func) {
            this.ready_func();
        }
    }

    ready(f) {
    	this.ready_func = f;
    }

    tileIndexToGridPosition(tileNum) {
        var x = 0,
            y = 0;
        
        var getX = function(num, w) {
            if(num == 0) {
                return 0;
            }
            return (num % w == 0) ? w - 1 : (num % w) - 1;
        }
    
        tileNum -= 1;
        x = getX(tileNum + 1, this.width);
        y = Math.floor(tileNum / this.width);
    
        return { x: x, y: y };
    }

    GridPositionToTileIndex(x, y) {
        return (y * this.width) + x + 1;
    }

    generateCollisionGrid() {
        this.grid = [];
    
        if(this.isLoaded) {
            var tileIndex = 0;
            for(var	j, i = 0; i < this.height; i++) {
                this.grid[i] = [];
                for(j = 0; j < this.width; j++) {
                    if(_.include(this.collisions, tileIndex)) {
                        this.grid[i][j] = 1;
                    } else {
                        this.grid[i][j] = 0;
                    }
                    tileIndex += 1;
                }
            }
            //log.info("Collision grid generated.");
        }
    }

    isOutOfBounds(x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    }

    isColliding(x, y) {
        if(this.isOutOfBounds(x, y)) {
            return false;
        }
        return this.grid[y][x] === 1;
    }
    
    GroupIdToGroupPosition(id) {
        var posArray = id.split('-');
        
        return pos(parseInt(posArray[0]), parseInt(posArray[1]));
    }
    
    forEachGroup(callback) {
        var width = this.groupWidth,
            height = this.groupHeight;
        
        for(var x = 0; x < width; x += 1) {
            for(var y = 0; y < height; y += 1) {
                callback(x+'-'+y);
            }
        }
    }
    
    getGroupIdFromPosition(x, y) {
        var w = this.zoneWidth,
            h = this.zoneHeight,
            gx = Math.floor((x - 1) / w),
            gy = Math.floor((y - 1) / h);

        return gx+'-'+gy;
    }
    
    getAdjacentGroupPositions(id) {
        var self = this,
            position = this.GroupIdToGroupPosition(id),
            x = position.x,
            y = position.y,
            // surrounding groups
            list = [pos(x-1, y-1), pos(x, y-1), pos(x+1, y-1),
                    pos(x-1, y),   pos(x, y),   pos(x+1, y),
                    pos(x-1, y+1), pos(x, y+1), pos(x+1, y+1)];
        
        // groups connected via doors
        _.each(this.connectedGroups[id], function(position) {
            // don't add a connected group if it's already part of the surrounding ones.
            if(!_.any(list, function(groupPos) { return equalPositions(groupPos, position); })) {
                list.push(position);
            }
        });
        
        return _.reject(list, function(pos) { 
            return pos.x < 0 || pos.y < 0 || pos.x >= self.groupWidth || pos.y >= self.groupHeight;
        });
    }
    
    forEachAdjacentGroup(groupId, callback) {
        if(groupId) {
            _.each(this.getAdjacentGroupPositions(groupId), function(pos) {
                callback(pos.x+'-'+pos.y);
            });
        }
    }
    
    initConnectedGroups(doors) {
        var self = this;

        this.connectedGroups = {};
        _.each(doors, function(door) {
            var groupId = self.getGroupIdFromPosition(door.x, door.y),
                connectedGroupId = self.getGroupIdFromPosition(door.tx, door.ty),
                connectedPosition = self.GroupIdToGroupPosition(connectedGroupId);
            
            if(groupId in self.connectedGroups) {
                self.connectedGroups[groupId].push(connectedPosition);
            } else {
                self.connectedGroups[groupId] = [connectedPosition];
            }
        });
    }
    
    initCheckpoints(cpList) {
        var self = this;
        
        this.checkpoints = {};
        this.startingAreas = [];
        
        _.each(cpList, function(cp) {
            var checkpoint = new Checkpoint(cp.id, cp.x, cp.y, cp.w, cp.h);
            self.checkpoints[checkpoint.id] = checkpoint; 
            if(cp.s === 1) {
                self.startingAreas.push(checkpoint);
            }
        });
    }
    
    getCheckpoint(id) {
        return this.checkpoints[id];
    }
    
    getRandomStartingPosition() {
        var nbAreas = _.size(this.startingAreas),
            i = Utils.randomInt(0, nbAreas-1),
            area = this.startingAreas[i];
        
        return area.getRandomPosition();
    }


    public width: any
    public height: any
    public collisions: any
    public mobAreas: any
    public chestAreas: any
    public staticChests: any
    public staticEntities: any
    public isLoaded: any
    public zoneWidth: any
    public zoneHeight: any
    public groupWidth: any
    public groupHeight: any
    public ready_func: any
    public checkpoints: any
    public grid: any
    public connectedGroups: any
    public startingAreas: any
}




function pos(x, y) {
    return {x, y}
}

function equalPositions(pos1, pos2) {
    return pos1.x===pos2.x && pos2.y===pos2.y
}
