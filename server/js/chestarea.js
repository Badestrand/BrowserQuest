import * as _ from 'underscore'

import Area from './area.js'
import Types from '../../shared/js/gametypes.js'




export default class ChestArea extends Area {
    constructor(id, x, y, width, height, cx, cy, items, world) {
        super(id, x, y, width, height, world);
        this.items = items;
        this.chestX = cx;
        this.chestY = cy;
    }
    
    contains(entity) {
        if(entity) {
            return entity.x >= this.x
                && entity.y >= this.y
                && entity.x < this.x + this.width
                && entity.y < this.y + this.height;
        } else {
            return false;
        }
    }
}