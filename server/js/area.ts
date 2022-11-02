import * as _ from 'underscore'

import * as Utils from './utils'
import Mob from './mob'
import * as Types from '../../shared/gametypes'



export default class Area {
    constructor(id, x, y, width, height, world) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.world = world;
        this.entities = [];
        this.hasCompletelyRespawned = true;
    }
    
    _getRandomPositionInsideArea() {
        var pos: any = {},
            valid = false;
        
        while(!valid) {
            pos.x = this.x + Utils.random(this.width + 1);
            pos.y = this.y + Utils.random(this.height + 1);
            valid = this.world.isValidPosition(pos.x, pos.y);
        }
        return pos;
    }

    removeFromArea(entity) {
        var i = _.indexOf(_.pluck(this.entities, 'id'), entity.id);
        this.entities.splice(i, 1);
        
        if(this.isEmpty() && this.hasCompletelyRespawned && this.empty_callback) {
            this.hasCompletelyRespawned = false;
            this.empty_callback();
        }
    }

    addToArea(entity) {
        if(entity) {
            this.entities.push(entity);
            entity.area = this;
            if(entity instanceof Mob) {
                this.world.addMob(entity);
            }
        }
        
        if(this.isFull()) {
            this.hasCompletelyRespawned = true;
        }
    }

    setNumberOfEntities(nb) {
        this.nbEntities = nb;
    }
    
    isEmpty() {
        return !_.any(this.entities, function(entity) { return !entity.isDead });
    }

    isFull() {
        return !this.isEmpty() && (this.nbEntities === _.size(this.entities));
    }

    onEmpty(callback) {
        this.empty_callback = callback;
    }


    
    public id: any
    public x: any
    public y: any
    public width: any
    public height: any
    public world: any
    public entities: any
    public hasCompletelyRespawned: any
    public empty_callback: any
    public nbEntities: any
}