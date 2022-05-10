import * as Utils from './utils.js'
import Item from './item.js'
import Types from '../../shared/js/gametypes.js'




export default class Chest extends Item {
    constructor(id, x, y) {
        super(id, Types.Entities.CHEST, x, y);
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
}