import * as _ from 'underscore'
import * as $ from 'jquery'
import * as React from 'react'
import {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'

import log from './log'
import Storage from './storage'
import {TRANSITIONEND} from './util'
import CharacterScreen from './ui/CharacterScreen'
import Parchment from './ui/Parchment'
import Game from './game'




export default class UI {
	private currentPage: number
	private blinkInterval: any
	private previousState: any
	private isParchmentReady: any
	private ready: any
	private storage: Storage
	private $playButton: any
	private $playDiv: any
	private parchment: any
	private game: Game
	private isMobile: any
	private isTablet: any
	private isDesktop: any
	private supportsWorkers: any
	private config: any
	private charScreen: any
	private messageTimer: any


	constructor() {
		this.currentPage = 1;
		this.blinkInterval = null;
		this.previousState = null;
		this.isParchmentReady = true;
		this.ready = false;
		this.storage = new Storage();
		this.$playButton = $('.play')
		this.$playDiv = $('.play div')


		const container = document.createElement('div')
		document.body.appendChild(container)
		this.parchment = ReactDOM.createRoot(container)
		this.parchment.render(<Parchment/>)
	}

	setGame(game) {
		this.game = game;
		this.isMobile = this.game.renderer.mobile;
		this.isTablet = this.game.renderer.tablet;
		this.isDesktop = !(this.isMobile || this.isTablet);
		this.supportsWorkers = !!window.Worker;
		this.ready = true;

		this.updateFromPlayer()

		this.game.player.on('update', this.updateFromPlayer.bind(this))
	}

	updateFromPlayer() {
		const expBar = document.getElementById('experience-meter').children[0] as HTMLElement
		expBar.style.width = this.game.player.getExperienceProgressForThisLevel()*100+'%'

		const charScreenButton = document.getElementById('characterbutton')
		if (this.game.player.getUnspentAttrPoints() > 0) {
			charScreenButton.classList.add('emphasized')
		} else {
			charScreenButton.classList.remove('emphasized')
		}
	}

	center() {
		window.scrollTo(0, 1);
	}

	canStartGame() {
		if(this.isDesktop) {
			return (this.game && this.game.map && this.game.map.isLoaded);
		} else {
			return this.game;
		}
	}

	tryStartingGame(username, starting_callback) {
		var self = this,
			$play = this.$playButton;
		
		if(username !== '') {
			if(!this.ready || !this.canStartGame()) {
				if(!this.isMobile) {
					// on desktop and tablets, add a spinner to the play button
					$play.addClass('loading');
				}
				this.$playDiv.unbind('click');
				var watchCanStart = setInterval(function() {
					log.debug("waiting...");
					if(self.canStartGame()) {
						setTimeout(function() {
							if(!self.isMobile) {
								$play.removeClass('loading');
							}
						}, 1500);
						clearInterval(watchCanStart);
						self.startGame(username, starting_callback);
					}
				}, 100);
			} else {
				this.$playDiv.unbind('click');
				this.startGame(username, starting_callback);
			}      
		}
	}

	startGame(username, starting_callback) {
		var self = this;
		
		if(starting_callback) {
			starting_callback();
		}
		this.hideIntro(function() {
			if(!self.isDesktop) {
				// On mobile and tablet we load the map after the player has clicked
				// on the PLAY button instead of loading it in a web worker.
				self.game.loadMap();
			}
			self.start(username);
		});
	}

	start(username) {
		var self = this,
			firstTimePlaying = !self.storage.hasAlreadyPlayed();
		
		if(username && !this.game.started) {
			var optionsSet = false,
				config = this.config;

			//>>includeStart("devHost", pragmas.devHost);
			if(config.local) {
				log.debug("Starting game with local dev config.");
				this.game.setServerOptions(config.local.host, config.local.port);
			} else {
				log.debug("Starting game with default dev config.");
				this.game.setServerOptions(config.dev.host, config.dev.port);
			}
			optionsSet = true;
			//>>includeEnd("devHost");
			
			//>>includeStart("prodHost", pragmas.prodHost);
			if(!optionsSet) {
				log.debug("Starting game with build config.");
				this.game.setServerOptions(config.build.host, config.build.port);
			}
			//>>includeEnd("prodHost");

			this.center();
			this.game.run(function() {
				$('body').addClass('started');
				if(firstTimePlaying) {
					self.toggleInstructions();
				}
			});
		}
	}

	setMouseCoordinates(event) {
		var gamePos = $('#container').offset(),
			scale = this.game.renderer.getScaleFactor(),
			width = this.game.renderer.getWidth(),
			height = this.game.renderer.getHeight(),
			mouse = this.game.mouse;

		mouse.x = event.pageX - gamePos.left - (this.isMobile ? 0 : 5 * scale);
		mouse.y = event.pageY - gamePos.top - (this.isMobile ? 0 : 7 * scale);

		if(mouse.x <= 0) {
			mouse.x = 0;
		} else if(mouse.x >= width) {
			mouse.x = width - 1;
		}

		if(mouse.y <= 0) {
			mouse.y = 0;
		} else if(mouse.y >= height) {
			mouse.y = height - 1;
		}
	}

	initHealthBar() {
		var scale = this.game.renderer.getScaleFactor(),
			healthMaxWidth = 174 //$("#healthbar").width() - (12 * scale);

		this.game.onPlayerHealthChange(function(hp, maxHp) {
			var barWidth = Math.round((healthMaxWidth / maxHp) * (hp > 0 ? hp : 0));
			$("#hitpoints").css('width', barWidth + "px");
		});

		this.game.onPlayerHurt(this.blinkHealthBar.bind(this));
	}

	blinkHealthBar() {
		var $hitpoints = $('#hitpoints');

		$hitpoints.addClass('white');
		setTimeout(function() {
			$hitpoints.removeClass('white');
		}, 500)
	}

	hideIntro(hidden_callback) {
		$('body').removeClass('intro');
		setTimeout(function() {
			$('body').addClass('game');
			hidden_callback();
		}, 1000);
	}

	showChat() {
		if(this.game.started) {
			$('#chatbox').addClass('active');
			$('#chatinput').focus();
			$('#chatbutton').addClass('active');
		}
	}

	hideChat() {
		if(this.game.started) {
			$('#chatbox').removeClass('active');
			$('#chatinput').blur();
			$('#chatbutton').removeClass('active');
		}
	}

	toggleInstructions() {
		if($('#achievements').hasClass('active')) {
			this.toggleAchievements();
			$('#achievementsbutton').removeClass('active');
		}
		$('#instructions').toggleClass('active');
	}

	toggleAchievements() {
		if($('#instructions').hasClass('active')) {
			this.toggleInstructions();
			$('#helpbutton').removeClass('active');
		}
		this.resetPage();
		$('#achievements').toggleClass('active');
	}


	toggleCharacterScreen() {
		const btn = document.getElementById('characterbutton')
		if (this.charScreen) {
			this.charScreen.unmount()
			this.charScreen = null
			btn.classList.remove('active')
		} else {
			const container = document.createElement('div')
			document.body.appendChild(container)
			this.charScreen = ReactDOM.createRoot(container)
			this.charScreen.render(<CharacterScreen player={this.game.player} onClose={() => this.toggleCharacterScreen()}/>)
		}
	}


	resetPage() {
		var self = this,
			$achievements = $('#achievements');

		if($achievements.hasClass('active')) {
			$achievements.bind(TRANSITIONEND, function() {
				$achievements.removeClass('page' + self.currentPage).addClass('page1');
				self.currentPage = 1;
				$achievements.unbind(TRANSITIONEND);
			});
		}
	}

	initEquipmentIcons() {
		var scale = this.game.renderer.getScaleFactor();
		var getIconPath = function(spriteName) {
				return 'img/'+ scale +'/item-' + spriteName + '.png';
			},
			weapon = this.game.player.getWeaponName(),
			armor = this.game.player.getSpriteName(),
			weaponPath = getIconPath(weapon),
			armorPath = getIconPath(armor);

		$('#weapon').css('background-image', 'url("' + weaponPath + '")');
		if(armor !== 'firefox') {
			$('#armor').css('background-image', 'url("' + armorPath + '")');
		}
	}

	hideWindows() {
		if($('#achievements').hasClass('active')) {
			this.toggleAchievements();
			$('#achievementsbutton').removeClass('active');
		}
		if($('#instructions').hasClass('active')) {
			this.toggleInstructions();
			$('#helpbutton').removeClass('active');
		}
		// if($('body').hasClass('credits')) {
		// 	this.closeInGameCredits();
		// }
		// if($('body').hasClass('about')) {
		// 	this.closeInGameAbout();
		// }
	}

	showAchievementNotification(id, name) {
		var $notif = $('#achievement-notification'),
			$name = $notif.find('.name'),
			$button = $('#achievementsbutton');

		$notif.removeClass().addClass('active achievement' + id);
		$name.text(name);
		if(this.game.storage.getAchievementCount() === 1) {
			this.blinkInterval = setInterval(function() {
				$button.toggleClass('blink');
			}, 500);
		}
		setTimeout(function() {
			$notif.removeClass('active');
			$button.removeClass('blink');
		}, 5000);
	}

	displayUnlockedAchievement(id) {
		var $achievement = $('#achievements li.achievement' + id);

		var achievement = this.game.getAchievementById(id);
		if(achievement && achievement.hidden) {
			this.setAchievementData($achievement, achievement.name, achievement.desc);
		}
		$achievement.addClass('unlocked');
	}

	unlockAchievement(id, name) {
		this.showAchievementNotification(id, name);
		this.displayUnlockedAchievement(id);

		var nb = parseInt($('#unlocked-achievements').text());
		$('#unlocked-achievements').text(nb + 1);
	}

	initAchievementList(achievements) {
		var self = this,
			$lists = $('#lists'),
			$page = $('#page-tmpl'),
			$achievement = $('#achievement-tmpl'),
			page = 0,
			count = 0,
			$p = null;

		_.each(achievements, function(achievement) {
			count++;

			var $a = $achievement.clone();
			$a.removeAttr('id');
			$a.addClass('achievement'+count);
			if(!achievement.hidden) {
				self.setAchievementData($a, achievement.name, achievement.desc);
			}
			$a.find('.twitter').attr('href', 'http://twitter.com/share?url=http%3A%2F%2Fbrowserquest.mozilla.org&text=I%20unlocked%20the%20%27'+ achievement.name +'%27%20achievement%20on%20Mozilla%27s%20%23BrowserQuest%21&related=glecollinet:Creators%20of%20BrowserQuest%2Cwhatthefranck');
			$a.show();
			$a.find('a').click(function() {
				 var url = $(this).attr('href');

				self.openPopup('twitter', url);
				return false;
			});

			if((count - 1) % 4 === 0) {
				page++;
				$p = $page.clone();
				$p.attr('id', 'page'+page);
				$p.show();
				$lists.append($p);
			}
			$p.append($a);
		});

		$('#total-achievements').text($('#achievements').find('li').length);
	}

	initUnlockedAchievements(ids) {
		var self = this;
		
		_.each(ids, function(id) {
			self.displayUnlockedAchievement(id);
		});
		$('#unlocked-achievements').text(ids.length);
	}

	setAchievementData($el, name, desc) {
		$el.find('.achievement-name').html(name);
		$el.find('.achievement-description').html(desc);
	}

	/*toggleCredits() {
		var currentState = $('#parchment').attr('class');

		if(this.game.started) {
			$('#parchment').removeClass().addClass('credits');
			
			$('body').toggleClass('credits');
				
			if(!this.game.player) {
				$('body').toggleClass('death');
			}
			if($('body').hasClass('about')) {
				this.closeInGameAbout();
				$('#helpbutton').removeClass('active');
			}
		} else {
			if(currentState !== 'animate') {
				if(currentState === 'credits') {
					this.animateParchment(currentState, this.previousState);
				} else {
					this.animateParchment(currentState, 'credits');
					this.previousState = currentState;
				}
			}
		}
	}*/
	
	/*toggleAbout() {
		var currentState = $('#parchment').attr('class');

		if(this.game.started) {
			$('#parchment').removeClass().addClass('about');
			$('body').toggleClass('about');
			if(!this.game.player) {
				$('body').toggleClass('death');
			}
			if($('body').hasClass('credits')) {
				this.closeInGameCredits();
			}
		} else {
			if(currentState !== 'animate') {
				if(currentState === 'about') {
					if(localStorage && localStorage.data) {
						this.animateParchment(currentState, 'loadcharacter');
					} else {
						this.animateParchment(currentState, 'createcharacter');
					}
				} else {
					this.animateParchment(currentState, 'about');
					this.previousState = currentState;
				}
			}
		}
	}

	closeInGameCredits() {
		$('body').removeClass('credits');
		$('#parchment').removeClass('credits');
		if(!this.game.player) {
			$('body').addClass('death');
		}
	}
	
	closeInGameAbout() {
		$('body').removeClass('about');
		$('#parchment').removeClass('about');
		if(!this.game.player) {
			$('body').addClass('death');
		}
		$('#helpbutton').removeClass('active');
	}*/
	
	togglePopulationInfo() {
		$('#population').toggleClass('visible');
	}

	openPopup(type, url) {
		var h = $(window).height(),
			w = $(window).width(),
			popupHeight,
			popupWidth,
			top,
			left;

		switch(type) {
			case 'twitter':
				popupHeight = 450;
				popupWidth = 550;
				break;
			case 'facebook':
				popupHeight = 400;
				popupWidth = 580;
				break;
		}

		top = (h / 2) - (popupHeight / 2);
		left = (w / 2) - (popupWidth / 2);

		const newwindow = window.open(url,'name','height=' + popupHeight + ',width=' + popupWidth + ',top=' + top + ',left=' + left);
		if (window.focus) {newwindow.focus()}
	}

	animateMessages() {
		var $messages = $('#notifications div');

		$messages.addClass('top');
	}

	resetMessagesPosition() {
		var message = $('#message2').text();

		$('#notifications div').removeClass('top');
		$('#message2').text('');
		$('#message1').text(message);
	}

	showMessage(message) {
		var $wrapper = $('#notifications div'),
			$message = $('#notifications #message2');

		this.animateMessages();
		$message.text(message);
		if(this.messageTimer) {
			this.resetMessageTimer();
		}

		this.messageTimer = setTimeout(function() {
				$wrapper.addClass('top');
		}, 5000);
	}

	resetMessageTimer() {
		clearTimeout(this.messageTimer);
	}
	
	resizeUi() {
		if(this.game) {
			if(this.game.started) {
				this.game.resize();
				this.initHealthBar();
				this.game.updateBars();
			} else {
				var newScale = this.game.renderer.getScaleFactor();
				this.game.renderer.rescale(newScale);
			}
		} 
	}
}