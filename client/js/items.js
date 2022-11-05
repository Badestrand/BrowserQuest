import Item from './item'
import {Entities} from '../../shared/constants'



export class Sword2 extends Item {
    constructor(id) {
        super(id, Entities.SWORD2, "weapon");
        this.lootMessage = "You pick up a steel sword";
    }
}

export class Axe extends Item {
    constructor(id) {
        super(id, Entities.AXE, "weapon");
        this.lootMessage = "You pick up an axe";
    }
}

export class RedSword extends Item {
    constructor(id) {
        super(id, Entities.REDSWORD, "weapon");
        this.lootMessage = "You pick up a blazing sword";
    }
}

export class BlueSword extends Item {
    constructor(id) {
        super(id, Entities.BLUESWORD, "weapon");
        this.lootMessage = "You pick up a magic sword";
    }
}

export class GoldenSword extends Item {
    constructor(id) {
        super(id, Entities.GOLDENSWORD, "weapon");
        this.lootMessage = "You pick up the ultimate sword";
    }
}

export class MorningStar extends Item {
    constructor(id) {
        super(id, Entities.MORNINGSTAR, "weapon");
        this.lootMessage = "You pick up a morning star";
    }
}

export class LeatherArmor extends Item {
    constructor(id) {
        super(id, Entities.LEATHERARMOR, "armor");
        this.lootMessage = "You equip a leather armor";
    }
}

export class MailArmor extends Item {
    constructor(id) {
        super(id, Entities.MAILARMOR, "armor");
        this.lootMessage = "You equip a mail armor";
    }
}

export class PlateArmor extends Item {
    constructor(id) {
        super(id, Entities.PLATEARMOR, "armor");
        this.lootMessage = "You equip a plate armor";
    }
}

export class RedArmor extends Item {
    constructor(id) {
        super(id, Entities.REDARMOR, "armor");
        this.lootMessage = "You equip a ruby armor";
    }
}

export class GoldenArmor extends Item {
    constructor(id) {
        super(id, Entities.GOLDENARMOR, "armor");
        this.lootMessage = "You equip a golden armor";
    }
}

export class Flask extends Item {
    constructor(id) {
        super(id, Entities.FLASK, "object");
        this.lootMessage = "You drink a health potion";
    }
}

export class Cake extends Item {
    constructor(id) {
        super(id, Entities.CAKE, "object");
        this.lootMessage = "You eat a cake";
    }
}

export class Burger extends Item {
    constructor(id) {
        super(id, Entities.BURGER, "object");
        this.lootMessage = "You can haz rat burger";
    }
}

export class FirePotion extends Item {
    constructor(id) {
        super(id, Entities.FIREPOTION, "object");
        this.lootMessage = "You feel the power of Firefox!";
    }

    onLoot(player) {
        player.startInvincibility();
    }
}