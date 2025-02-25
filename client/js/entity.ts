import EventEmitter from 'eventemitter3'

import log from './log'

import * as Types from '../../shared/gametypes'
import {Orientations} from '../../shared/constants'



export default class Entity extends EventEmitter {
	constructor(id, kind) {
		super()
		var self = this;
	
		this.id = id;
		this.kind = kind;

		// Renderer
		this.sprite = null;
		this.flipSpriteX = false;
		this.flipSpriteY = false;
		this.animations = null;
		this.currentAnimation = null;
		this.shadowOffsetY = 0;
	
		// Position
		this.setGridPosition(0, 0);
	
		// Modes
		this.isLoaded = false;
		this.isHighlighted = false;
		this.visible = true;
		this.isFading = false;

		this.isDirty = undefined
		this.dirty_callback = undefined
		this.dirtyRect = undefined
		this.setDirty();
	}

	setName(name) {
		this.name = name;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	setGridPosition(x, y) {
		this.gridX = x;
		this.gridY = y;
	
		this.setPosition(x * 16, y * 16);
	}

	setSprite(sprite) {
		if(!sprite) {
			log.error(this.id + " : sprite is null", true);
			throw "Error";
		}
	
		if(this.sprite && this.sprite.name === sprite.name) {
			return;
		}
		this.sprite = sprite;
		this.normalSprite = this.sprite;
	
		if(Types.isMob(this.kind) || Types.isPlayer(this.kind)) {
			this.hurtSprite = sprite.getHurtSprite();
		}
	
		this.animations = sprite.createAnimations();
	
		this.isLoaded = true;
		if(this.ready_callback) {
			this.ready_callback();
		}
	}

	getSprite() {
		return this.sprite;
	}

	getSpriteName() {
		return Types.getKindAsString(this.kind);
	}

	getAnimationByName(name) {
		var animation = null;
	
		if(name in this.animations) {
			animation = this.animations[name];
		}
		else {
			log.error("No animation called "+ name);
		}
		return animation;
	}

	setAnimation(name, speed, count, onEndCount) {
		var self = this;
	
		if(this.isLoaded) {
			if(this.currentAnimation && this.currentAnimation.name === name) {
				return;
			}
		
			var s = this.sprite,
				a = this.getAnimationByName(name);
	
			if(a) {
				this.currentAnimation = a;
				if(name.substr(0, 3) === "atk") {
					this.currentAnimation.reset();
				}
				this.currentAnimation.setSpeed(speed);
				this.currentAnimation.setCount(count ? count : 0, onEndCount || function() {
					if ((self as any).idle) {
						(self as any).idle();
					}
				});
			}
		}
		else {
			this.log_error("Not ready for animation");
		}
	}

	hasShadow() {
		return false;
	}

	ready(f) {
		this.ready_callback = f;
	}

	clean() {
		this.stopBlinking();
	}

	log_info(message) {
		log.info("["+this.id+"] " + message);
	}

	log_error(message) {
		log.error("["+this.id+"] " + message);
	}

	setHighlight(value) {
		if(value === true) {
			this.sprite = this.sprite.silhouetteSprite;
			this.isHighlighted = true;
		}
		else {
			this.sprite = this.normalSprite;
			this.isHighlighted = false;
		}
	}

	setVisible(value) {
		this.visible = value;
	}

	isVisible() {
		return this.visible;
	}

	toggleVisibility() {
		if(this.visible) {
			this.setVisible(false);
		} else {
			this.setVisible(true);
		}
	}

	/**
	 * 
	 */
	getDistanceToEntity(entity) {
		var distX = Math.abs(entity.gridX - this.gridX);
		var distY = Math.abs(entity.gridY - this.gridY);

		return (distX > distY) ? distX : distY;
	}

	isCloseTo(entity) {
		var dx, dy, d, close = false;
		if(entity) {
			dx = Math.abs(entity.gridX - this.gridX);
			dy = Math.abs(entity.gridY - this.gridY);
		
			if(dx < 30 && dy < 14) {
				close = true;
			}
		}
		return close;
	}

	/**
	 * Returns true if the entity is adjacent to the given one.
	 * @returns {Boolean} Whether these two entities are adjacent.
	 */
	isAdjacent(entity) {
		var adjacent = false;
	
		if(entity) {
			adjacent = this.getDistanceToEntity(entity) > 1 ? false : true;
		}
		return adjacent;
	}

	/**
	 * 
	 */
	isAdjacentNonDiagonal(entity) {
		var result = false;

		if(this.isAdjacent(entity) && !(this.gridX !== entity.gridX && this.gridY !== entity.gridY)) {
			result = true;
		}
	
		return result;
	}
	
	isDiagonallyAdjacent(entity) {
		return this.isAdjacent(entity) && !this.isAdjacentNonDiagonal(entity);
	}
	
	forEachAdjacentNonDiagonalPosition(callback) {
		callback(this.gridX - 1, this.gridY, Orientations.LEFT);
		callback(this.gridX, this.gridY - 1, Orientations.UP);
		callback(this.gridX + 1, this.gridY, Orientations.RIGHT);
		callback(this.gridX, this.gridY + 1, Orientations.DOWN);
	}

	fadeIn(currentTime) {
		this.isFading = true;
		this.startFadingTime = currentTime;
	}

	blink(speed, callback) {
		var self = this;
	
		this.blinking = setInterval(function() {
			self.toggleVisibility();
		}, speed);
	}

	stopBlinking() {
		if(this.blinking) {
			clearInterval(this.blinking);
		}
		this.setVisible(true);
	}
	
	setDirty() {
		this.isDirty = true;
		if(this.dirty_callback) {
			this.dirty_callback(this);
		}
	}
	
	onDirty(dirty_callback) {
		this.dirty_callback = dirty_callback;
	}




	public id: number
	public kind: number
	public isLoaded: boolean
	public isHighlighted: boolean
	public visible: boolean
	public name: string
	public x: number
	public y: number

	public gridX: number
	public gridY: number
	protected sprite: any
	private blinking: any
	public isFading: boolean
	private startFadingTime: number
	protected normalSprite: any
	protected hurtSprite: any
	protected flipSpriteX: boolean
	protected flipSpriteY: boolean
	private animations: any
	protected currentAnimation: any
	protected shadowOffsetY: number
	private isDirty: boolean
	private ready_callback: any
	private dirty_callback: any
	public dirtyRect: any

}