import Entity from './entity'



export default class Npc extends Entity {
    constructor(id, kind, x, y) {
        super(id, "npc", kind, x, y);
    }
}