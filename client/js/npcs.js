import Npc from './npc'
import * as Types from '../../shared/gametypes'



export class Guard extends Npc {
    constructor(id) {
        super(id, Types.Entities.GUARD, 1);
    }
}

export class King extends Npc {
    constructor(id) {
        super(id, Types.Entities.KING, 1);
    }
}

export class Agent extends Npc {
    constructor(id) {
        super(id, Types.Entities.AGENT, 1);
    }
}

export class Rick extends Npc {
    constructor(id) {
        super(id, Types.Entities.RICK, 1);
    }
}

export class VillageGirl extends Npc {
    constructor(id) {
        super(id, Types.Entities.VILLAGEGIRL, 1);
    }
}

export class Villager extends Npc {
    constructor(id) {
        super(id, Types.Entities.VILLAGER, 1);
    }
}

export class Coder extends Npc {
    constructor(id) {
        super(id, Types.Entities.CODER, 1);
    }
}

export class Scientist extends Npc {
    constructor(id) {
        super(id, Types.Entities.SCIENTIST, 1);
    }
}

export class Nyan extends Npc {
    constructor(id) {
        super(id, Types.Entities.NYAN, 1);
    }
}

export class Sorcerer extends Npc {
    constructor(id) {
        super(id, Types.Entities.SORCERER, 1);
    }
}

export class Priest extends Npc {
    constructor(id) {
        super(id, Types.Entities.PRIEST, 1);
    }
}

export class BeachNpc extends Npc {
    constructor(id) {
        super(id, Types.Entities.BEACHNPC, 1);
    }
}

export class ForestNpc extends Npc {
    constructor(id) {
        super(id, Types.Entities.FORESTNPC, 1);
    }
}

export class DesertNpc extends Npc {
    constructor(id) {
        super(id, Types.Entities.DESERTNPC, 1);
    }
}

export class LavaNpc extends Npc {
    constructor(id) {
        super(id, Types.Entities.LAVANPC, 1);
    }
}

export class Octocat extends Npc {
    constructor(id) {
        super(id, Types.Entities.OCTOCAT, 1);
    }
}
