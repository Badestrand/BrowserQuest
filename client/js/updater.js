import {Orientations} from '../../shared/constants'
import Character from './character'
import Timer from './timer'



export default class Updater {
    constructor(game) {
        this.game = game;
        this.playerAggroTimer = new Timer(1000);
    }

    update() {
        this.updateZoning();
        this.updateCharacters();
        this.updatePlayerAggro();
        this.updateTransitions();
        this.updateAnimations();
        this.updateAnimatedTiles();
        this.updateChatBubbles();
        this.updateInfos();
    }

    updateCharacters() {
        var self = this;
    
        this.game.forEachEntity(function(entity) {
            var isCharacter = entity instanceof Character;
        
            if(entity.isLoaded) {
                if(isCharacter) {
                    self.updateCharacter(entity);
                    self.game.onCharacterUpdate(entity);
                }
                self.updateEntityFading(entity);
            }
        });
    }
    
    updatePlayerAggro() {
        var t = this.game.currentTime,
            player = this.game.player;
        
        // Check player aggro every 1s when not moving nor attacking
        if(player && !player.isMoving() && !player.isAttacking()  && this.playerAggroTimer.isOver(t)) {
            player.checkAggro();
        }
    }

    updateEntityFading(entity) {
        if(entity && entity.isFading) {
            var duration = 1000,
                t = this.game.currentTime,
                dt = t - entity.startFadingTime;
        
            if(dt > duration) {
                this.isFading = false;
                entity.fadingAlpha = 1;
            } else {
                entity.fadingAlpha = dt / duration;
            }
        }
    }

    updateTransitions() {
        var self = this,
            m = null,
            z = this.game.currentZoning;

        // for (let key in this.game.entities) {
        //     if (this.game.entities[key] === undefined) {
        //         console.log('game entity undefined:', key)
        //     }
        // }

        this.game.forEachEntity(function(entity) {
            m = entity.movement;
            if(m) {
                if(m.inProgress) {
                    m.step(self.game.currentTime);
                }
            }
        });
    
        if(z) {
            if(z.inProgress) {
                z.step(this.game.currentTime);
            }
        }
    }

    updateZoning() {
        var g = this.game,
            c = g.camera,
            z = g.currentZoning,
            s = 3,
            ts = 16,
            speed = 500;
    
        if(z && z.inProgress === false) {
            var orientation = this.game.zoningOrientation,
                startValue = 0,
                endValue = 0,
                offset = 0,
                updateFunc = null,
                endFunc = null;
        
            if(orientation === Orientations.LEFT || orientation === Orientations.RIGHT) {
                offset = (c.gridW - 2) * ts;
                startValue = (orientation === Orientations.LEFT) ? c.x - ts : c.x + ts;
                endValue = (orientation === Orientations.LEFT) ? c.x - offset : c.x + offset;
                updateFunc = function(x) {
                    c.setPosition(x, c.y);
                    g.initAnimatedTiles();
                    g.renderer.renderStaticCanvases();
                }
                endFunc = function() {
                    c.setPosition(z.endValue, c.y);
                    g.endZoning();
                }
            } else if(orientation === Orientations.UP || orientation === Orientations.DOWN) {
                offset = (c.gridH - 2) * ts;
                startValue = (orientation === Orientations.UP) ? c.y - ts : c.y + ts;
                endValue = (orientation === Orientations.UP) ? c.y - offset : c.y + offset;
                updateFunc = function(y) { 
                    c.setPosition(c.x, y);
                    g.initAnimatedTiles();
                    g.renderer.renderStaticCanvases();
                }
                endFunc = function() {
                    c.setPosition(c.x, z.endValue);
                    g.endZoning();
                }
            }
        
            z.start(this.game.currentTime, updateFunc, endFunc, startValue, endValue, speed);
        }
    }

    updateCharacter(c) {
        var self = this;

        // Estimate of the movement distance for one update
        var tick = Math.round(16 / Math.round((c.moveSpeed / (1000 / this.game.renderer.FPS))));

        if(c.isMoving() && c.movement.inProgress === false) {
            if(c.orientation === Orientations.LEFT) {
                c.movement.start(this.game.currentTime,
                                 function(x) {
                                    c.x = x;
                                    c.hasMoved();
                                 },
                                 function() {
                                    c.x = c.movement.endValue;
                                    c.hasMoved();
                                    c.nextStep();
                                 },
                                 c.x - tick,
                                 c.x - 16,
                                 c.moveSpeed);
            }
            else if(c.orientation === Orientations.RIGHT) {
                c.movement.start(this.game.currentTime,
                                 function(x) {
                                    c.x = x;
                                    c.hasMoved();
                                 },
                                 function() {
                                    c.x = c.movement.endValue;
                                    c.hasMoved();
                                    c.nextStep();
                                 },
                                 c.x + tick,
                                 c.x + 16,
                                 c.moveSpeed);
            }
            else if(c.orientation === Orientations.UP) {
                c.movement.start(this.game.currentTime,
                                 function(y) {
                                    c.y = y;
                                    c.hasMoved();
                                 },
                                 function() {
                                    c.y = c.movement.endValue;
                                    c.hasMoved();
                                    c.nextStep();
                                 },
                                 c.y - tick,
                                 c.y - 16,
                                 c.moveSpeed);
            }
            else if(c.orientation === Orientations.DOWN) {
                c.movement.start(this.game.currentTime,
                                 function(y) {
                                    c.y = y;
                                    c.hasMoved();
                                 },
                                 function() {
                                    c.y = c.movement.endValue;
                                    c.hasMoved();
                                    c.nextStep();
                                 },
                                 c.y + tick,
                                 c.y + 16,
                                 c.moveSpeed);
            }
        }
    }

    updateAnimations() {
        var t = this.game.currentTime;

        this.game.forEachEntity(function(entity) {
            var anim = entity.currentAnimation;
            
            if(anim) {
                if(anim.update(t)) {
                    entity.setDirty();
                }
            }
        });
    
        var sparks = this.game.sparksAnimation;
        if(sparks) {
            sparks.update(t);
        }

        var target = this.game.targetAnimation;
        if(target) {
            target.update(t);
        }
    }

    updateAnimatedTiles() {
        var self = this,
            t = this.game.currentTime;
    
        this.game.forEachAnimatedTile(function (tile) {
            if(tile.animate(t)) {
                tile.isDirty = true;
                tile.dirtyRect = self.game.renderer.getTileBoundingRect(tile);

                if(self.game.renderer.mobile || self.game.renderer.tablet) {
                    self.game.checkOtherDirtyRects(tile.dirtyRect, tile, tile.x, tile.y);
                }
            }
        });
    }

    updateChatBubbles() {
        var t = this.game.currentTime;
    
        this.game.bubbleManager.update(t);
    }

    updateInfos() {
        var t = this.game.currentTime;
    
        this.game.infoManager.update(t);
    }
}