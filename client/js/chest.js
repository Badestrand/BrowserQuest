import Entity from './entity'
import {Entities} from '../../shared/constants'



export default class Chest extends Entity {
    constructor(id, kind) {
	    super(id, Entities.CHEST);
    }

    getSpriteName() {
        return "chest";
    }

    isMoving() {
        return false;
    }

    open() {
        if(this.open_callback) {
            this.open_callback();
        }
    }

    onOpen(callback) {
        this.open_callback = callback;
    }
}