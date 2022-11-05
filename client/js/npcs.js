import Npc from './npc'
import {Entities} from '../../shared/constants'



export class Guard extends Npc {
    constructor(id) {
        super(id, Entities.GUARD, 1);
    }
}

export class King extends Npc {
    constructor(id) {
        super(id, Entities.KING, 1);
    }
}

export class Agent extends Npc {
    constructor(id) {
        super(id, Entities.AGENT, 1);
    }
}

export class Rick extends Npc {
    constructor(id) {
        super(id, Entities.RICK, 1);
    }
}

export class VillageGirl extends Npc {
    constructor(id) {
        super(id, Entities.VILLAGEGIRL, 1);
    }
}

export class Villager extends Npc {
    constructor(id) {
        super(id, Entities.VILLAGER, 1);
    }
}

export class Coder extends Npc {
    constructor(id) {
        super(id, Entities.CODER, 1);
    }
}

export class Scientist extends Npc {
    constructor(id) {
        super(id, Entities.SCIENTIST, 1);
    }
}

export class Nyan extends Npc {
    constructor(id) {
        super(id, Entities.NYAN, 1);
    }
}

export class Sorcerer extends Npc {
    constructor(id) {
        super(id, Entities.SORCERER, 1);
    }
}

export class Priest extends Npc {
    constructor(id) {
        super(id, Entities.PRIEST, 1);
    }
}

export class BeachNpc extends Npc {
    constructor(id) {
        super(id, Entities.BEACHNPC, 1);
    }
}

export class ForestNpc extends Npc {
    constructor(id) {
        super(id, Entities.FORESTNPC, 1);
    }
}

export class DesertNpc extends Npc {
    constructor(id) {
        super(id, Entities.DESERTNPC, 1);
    }
}

export class LavaNpc extends Npc {
    constructor(id) {
        super(id, Entities.LAVANPC, 1);
    }
}

export class Octocat extends Npc {
    constructor(id) {
        super(id, Entities.OCTOCAT, 1);
    }
}
