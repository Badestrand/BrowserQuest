import * as _ from 'underscore'

import * as Utils from './utils'
import Item from './item'
import {Entities} from '../../shared/constants'




export default class Chest extends Item {
    constructor(id, x, y) {
        super(id, Entities.CHEST, x, y);
    }
    
    setItems(items) {
        this.items = items;
    }
    
    getRandomItem() {
        var nbItems = _.size(this.items),
            item = null;

        if(nbItems > 0) {
            item = this.items[Utils.random(nbItems)];
        }
        return item;
    }


    public items: any
}