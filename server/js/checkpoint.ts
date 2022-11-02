import * as _ from 'underscore'

import * as Utils from './utils'
import * as Types from '../../shared/gametypes'




export default class Checkpoint {
    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    getRandomPosition() {
        var pos: any = {};
        
        pos.x = this.x + Utils.randomInt(0, this.width - 1);
        pos.y = this.y + Utils.randomInt(0, this.height - 1);
        return pos;
    }

    public id: any
    public x: any
    public y: any
    public width: any
    public height: any
}