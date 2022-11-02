import * as log from './log'
import * as Messages from './message'
import * as Utils from './utils'
import Entity from './entity'
import * as Types from '../../shared/gametypes'




export default class Character extends Entity {
    constructor(id, type, kind, x, y) {
        super(id, type, kind, x, y);
        
        this.orientation = Utils.randomOrientation();
        this.attackers = {};
        this.target = null;
    }

    getState() {
        var basestate = this._getBaseState(),
            state = [];
        
        state.push(this.orientation);
        if(this.target) {
            state.push(this.target);
        }
        
        return basestate.concat(state);
    }
    
    resetHitPoints(maxHitpoints) {
        this.maxHitpoints = maxHitpoints;
        this.hitPoints = this.maxHitpoints;
    }
    
    regenHealthBy(value) {
        var hp = this.hitPoints,
            max = this.maxHitpoints;
            
        if(hp < max) {
            if(hp + value <= max) {
                this.hitPoints += value;
            }
            else {
                this.hitPoints = max;
            }
        }
    }
    
    hasFullHealth() {
        return this.hitPoints === this.maxHitpoints;
    }
    
    setTarget(entity) {
        this.target = entity.id;
    }
    
    clearTarget() {
        this.target = null;
    }
    
    hasTarget() {
        return this.target !== null;
    }
    
    attack() {
        return new Messages.Attack(this.id, this.target);
    }
    
    health() {
        return new Messages.Health(this.hitPoints, false);
    }
    
    regen() {
        return new Messages.Health(this.hitPoints, true);
    }
    
    addAttacker(entity) {
        if(entity) {
            this.attackers[entity.id] = entity;
        }
    }
    
    removeAttacker(entity) {
        if(entity && entity.id in this.attackers) {
            delete this.attackers[entity.id];
            log.debug(this.id +" REMOVED ATTACKER "+ entity.id);
        }
    }
    
    forEachAttacker(callback) {
        for(var id in this.attackers) {
            callback(this.attackers[id]);
        }
    }


    public orientation: any
    public attackers: any
    public target: any
    public hitPoints: any
    public maxHitpoints: any
}