import Types from '../../shared/js/gametypes'
import Player from './player'



export default class Warrior extends Player {
    constructor(id, name) {
        super(id, name, Types.Entities.WARRIOR)
    }
}