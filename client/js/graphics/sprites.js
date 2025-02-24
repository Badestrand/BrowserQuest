const all = [
    require('../../sprites/sorcerer.json'),
    require('../../sprites/agent.json'),
    require('../../sprites/arrow.json'),
    require('../../sprites/axe.json'),
    require('../../sprites/bat.json'),
    require('../../sprites/beachnpc.json'),
    require('../../sprites/bluesword.json'),
    require('../../sprites/boss.json'),
    require('../../sprites/chest.json'),
    require('../../sprites/clotharmor.json'),
    require('../../sprites/coder.json'),
    require('../../sprites/crab.json'),
    require('../../sprites/death.json'),
    require('../../sprites/deathknight.json'),
    require('../../sprites/desertnpc.json'),
    require('../../sprites/eye.json'),
    require('../../sprites/firefox.json'),
    require('../../sprites/forestnpc.json'),
    require('../../sprites/goblin.json'),
    require('../../sprites/goldenarmor.json'),
    require('../../sprites/goldensword.json'),
    require('../../sprites/guard.json'),
    require('../../sprites/hand.json'),
    require('../../sprites/impact.json'),
    require('../../sprites/item-axe.json'),
    require('../../sprites/item-bluesword.json'),
    require('../../sprites/item-burger.json'),
    require('../../sprites/item-cake.json'),
    require('../../sprites/item-firepotion.json'),
    require('../../sprites/item-flask.json'),
    require('../../sprites/item-goldenarmor.json'),
    require('../../sprites/item-goldensword.json'),
    require('../../sprites/item-leatherarmor.json'),
    require('../../sprites/item-mailarmor.json'),
    require('../../sprites/item-morningstar.json'),
    require('../../sprites/item-platearmor.json'),
    require('../../sprites/item-redarmor.json'),
    require('../../sprites/item-redsword.json'),
    require('../../sprites/item-sword1.json'),
    require('../../sprites/item-sword2.json'),
    require('../../sprites/king.json'),
    require('../../sprites/lavanpc.json'),
    require('../../sprites/leatherarmor.json'),
    require('../../sprites/loot.json'),
    require('../../sprites/mailarmor.json'),
    require('../../sprites/morningstar.json'),
    require('../../sprites/nyan.json'),
    require('../../sprites/octocat.json'),
    require('../../sprites/ogre.json'),
    require('../../sprites/platearmor.json'),
    require('../../sprites/priest.json'),
    require('../../sprites/rat.json'),
    require('../../sprites/redarmor.json'),
    require('../../sprites/redsword.json'),
    require('../../sprites/rick.json'),
    require('../../sprites/scientist.json'),
    require('../../sprites/shadow16.json'),
    require('../../sprites/skeleton.json'),
    require('../../sprites/skeleton2.json'),
    require('../../sprites/snake.json'),
    require('../../sprites/sorcerer.json'),
    require('../../sprites/sparks.json'),
    require('../../sprites/spectre.json'),
    require('../../sprites/sword.json'),
    require('../../sprites/sword1.json'),
    require('../../sprites/sword2.json'),
    require('../../sprites/talk.json'),
    require('../../sprites/target.json'),
    require('../../sprites/villagegirl.json'),
    require('../../sprites/villager.json'),
    require('../../sprites/wizard.json'),
]

let sprites = {}
for (const entry of all) {
    sprites[entry.id] = entry
}


export default sprites