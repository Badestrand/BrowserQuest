import * as $ from 'jquery'

import log from '../log'
import Animation from './animation'
import sprites from './sprites'




export default class Sprite {
	constructor(name, scale) {
		this.name = name;
		this.scale = scale;
		this.isLoaded = false;
		this.offsetX = 0;
		this.offsetY = 0;
		this.resolver = null
		this.promise = new Promise((resolve, reject) => this.resolver=resolve)
		this.loadJSON(sprites[name]);

	}
	
	loadJSON(data) {
		this.id = data.id;
		this.filepath = "img/" + this.scale + "/" + this.id + ".png";
		this.animationData = data.animations;
		this.width = data.width;
		this.height = data.height;
		this.offsetX = (data.offset_x !== undefined) ? data.offset_x : -16;
		this.offsetY = (data.offset_y !== undefined) ? data.offset_y : -16;
		this.load();
	}

	load() {
		var self = this;

		this.image = new Image();
		this.image.src = this.filepath;

		this.image.onload = () => {
			self.isLoaded = true;
			this.resolver()
		};
	}

	createAnimations() {
		var animations = {};
	
		for(var name in this.animationData) {
			var a = this.animationData[name];
			animations[name] = new Animation(name, a.length, a.row, this.width, this.height);
		}
	
		return animations;
	}

	createHurtSprite() {
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			width = this.image.width,
			height = this.image.height,
			spriteData, data;

		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(this.image, 0, 0, width, height);
		
		try {
			spriteData = ctx.getImageData(0, 0, width, height);

			data = spriteData.data;

			for(var i=0; i < data.length; i += 4) {
				data[i] = 255;
				data[i+1] = data[i+2] = 75;
			}
			const newData = new ImageData(data, width, height)

			ctx.putImageData(newData, 0, 0);

			this.whiteSprite = { 
				image: canvas,
				isLoaded: true,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				width: this.width,
				height: this.height
			};
		} catch(e) {
			log.error("Error creating hurt sprite "+this.name+": "+e.message);
		}
	}

	getHurtSprite() {
		return this.whiteSprite;
	}

	createSilhouette() {
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			width = this.image.width,
			height = this.image.height,
			spriteData, finalData, data;
	
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(this.image, 0, 0, width, height);
		data = ctx.getImageData(0, 0, width, height).data;
		finalData = ctx.getImageData(0, 0, width, height);
		let fdata = finalData.data;
	
		var getIndex = function(x, y) {
			return ((width * (y-1)) + x - 1) * 4;
		};
	
		var getPosition = function(i) {
			var x, y;
		
			i = (i / 4) + 1;
			x = i % width;
			y = ((i - x) / width) + 1;
		
			return { x: x, y: y };
		};
	
		var hasAdjacentPixel = function(i) {
			var pos = getPosition(i);
		
			if(pos.x < width && !isBlankPixel(getIndex(pos.x + 1, pos.y))) {
				return true;
			}
			if(pos.x > 1 && !isBlankPixel(getIndex(pos.x - 1, pos.y))) {
				return true;
			}
			if(pos.y < height && !isBlankPixel(getIndex(pos.x, pos.y + 1))) {
				return true;
			}
			if(pos.y > 1 && !isBlankPixel(getIndex(pos.x, pos.y - 1))) {
				return true;
			}
			return false;
		};
	
		var isBlankPixel = function(i) {
			if(i < 0 || i >= data.length) {
				return true;
			}
			return data[i] === 0 && data[i+1] === 0 && data[i+2] === 0 && data[i+3] === 0;
		};
	
		for(var i=0; i < data.length; i += 4) {
			if(isBlankPixel(i) && hasAdjacentPixel(i)) {
				fdata[i] = fdata[i+1] = 255;
				fdata[i+2] = 150;
				fdata[i+3] = 150;
			}
		}

		// finalData.data = fdata;
		const finalData2 = new ImageData(fdata, width, height)
		ctx.putImageData(finalData2, 0, 0);
	
		this.silhouetteSprite = { 
			image: canvas,
			isLoaded: true,
			offsetX: this.offsetX,
			offsetY: this.offsetY,
			width: this.width,
			height: this.height
		};
	}
}