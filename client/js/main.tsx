import * as _ from 'underscore'
// import * as $ from 'jquery'
import EventEmitter from 'eventemitter3'
import * as React from 'react'
import {useState, useEffect, useRef} from 'react'
import ReactDOM from 'react-dom/client'

import server from './server'
import log from './log'
import Game from './game'
import Renderer from './renderer'
import config from './config'
import * as Detect from './detect'
import CharacterScreen from './ui/CharacterScreen'
import {sleep, useForceUpdate} from './util'

import {AllCharacterClasses, getLevelFromExperience} from '../../shared/game'

import '../css/main.less'



type HeroAccessInfo = {
	ident: string
	secret: string
}




function NewCharacterScreen({onPlay, onHelp}: any) {
	const inputRef = useRef<HTMLInputElement>()
	const [charClass, setCharClass] = useState<CharacterClassInfo>(AllCharacterClasses[0])
	const [name, setName] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus()
			}
		}, 50)
	}, [])

	const isValidName = name !== ''

	const onSubmit = async () => {
		if (isValidName && !loading) {
			setLoading(true)
			try {
				const hero = await server.createPlayer(charClass.id, name)
				onPlay(hero)
				setLoading(false)
			}
			catch (err) {
				alert(err.message)
			}
		}
	}

	return (
		<article id="createcharacter">
			<h1>
				<span className="left-ornament"/>
				A Massively Multiplayer Adventure
				<span className="right-ornament"/>
			</h1>

			<div className="ribbon" onClick={onHelp}>
				<div className="top"/>
				<div className="bottom"/>
			</div>

			<ul className="charclasses">
				{AllCharacterClasses.map((cc) => (
				<li key={cc.id} className={(cc.isAvailable? '' : ' disabled')+(cc===charClass? ' selected' : '')} onClick={e => cc.isAvailable && setCharClass(cc)}>
					<div/>
					<p>
						{cc.name}
						{!cc.isAvailable && (<span><br/>(soon)</span>)}
					</p>
				</li>
				))}
			</ul>

			<form onSubmit={(event) => {event.preventDefault(); onSubmit(); return false}}>
				<input ref={inputRef} type="text" placeholder="Name your character" maxLength={15} value={name} onChange={e => setName(e.target.value)}/>
				<br/>
				<button type="submit" className={'play button'+(loading? ' loading' : '')} disabled={loading || !isValidName}>
					<div></div>
					{loading && (
					<img src="img/common/spinner.gif" alt=""/>
					)}
				</button>
			</form>
		</article>
	)
}




function LoadCharacterScreen({onPlay, onReset, onHelp, data}: any) {
	const loading = false
	const [img, setImg] = useState<string>(null)

	const onSubmit = (event) => {
		event.preventDefault()
		onPlay()
		return false
	}

	useEffect(() => {
		Renderer.getPlayerImage2(data.armorId, data.weaponId).then(setImg)
	}, [data.armor, data.weapon])

	return (
		<article id="loadcharacter">
			<h1>
				<span className="left-ornament"/>
				Load your character
				<span className="right-ornament"/>
			</h1>

			<div className="ribbon" onClick={onHelp}>
				<div className="top"/>
				<div className="bottom"/>
			</div>

			<img className="playerimage" src={img}/>
			<div className="playername stroke">
				{data.name} - {_.findWhere(AllCharacterClasses, {id: data.charClassId}).name} level {getLevelFromExperience(data.experience)}
			</div>

			<button type="button" className={'play button'+(loading? ' loading' : '')} onClick={onSubmit}>
				<div></div>
				{loading && (
				<img src="img/common/spinner.gif" alt=""/>
				)}
			</button>

			<div className="create-new">
				<span>or</span> <span className="text-link" onClick={onReset}>create a new character</span>
			</div>
		</article>
	)
}




function ResetCharacterScreen({onReset, onCancel}: any) {
	return (
		<article id="confirmation">
			<h1>
				<span className="left-ornament"/>
				Delete your character?
				<span className="right-ornament"/>
			</h1>

			<p>
				All your items and achievements will be lost.<br/>
				Are you sure you wish to continue?
			</p>

			<button type="button" className="delete button" onClick={onReset}/>

			<div>
				<span className="text-link" onClick={onCancel}>cancel</span>
			</div>
		</article>
	)
}




function AboutScreen({onClose}: any) {
	return (
		<article id="about">
			<h1>
				<span className="left-ornament"/>
				<span className="title">What is BrowserQuest?</span>
				<span className="right-ornament"/>
			</h1>

			<p id="game-desc">
				BrowserQuest is a multiplayer game inviting you to explore a world of adventure.<br/>
				<br/>
				It originated at <a href="https://github.com/mozilla/BrowserQuest" target="_blank">Mozilla</a> and is free to play, so dive right in!<br/>
				<br/>
				This version is developed and maintained by <a href="https://www.instagram.com/michelrichel/" target="_blank">Michel</a>.
			</p>

			<button type="button" className="button-red" onClick={onClose}>
				Close
			</button>
		</article>
	)
}




function DeathInfo({onRevive}: any) {
	return (
		<article id="death">
			<p>You are dead...</p>
			<button type="button" id="respawn" className="button" onClick={onRevive}/>
		</article>
	)
}


function DisconnectInfo({message, onReload}: any) {
	return (
		<article id="disconnected">
			<p>{message}</p>
			<button type="button" className="button-red" onClick={onReload}>Reload</button>
		</article>
	)
}




/*function IntroScreen({hero, onStartNewGame, onLoadGame}: any) {
	const [mode, setMode] = useState<string>(hero? 'load' : 'create')
	const [next, setNext] = useState<string>(null)
	const [trans, setTrans] = useState<string>(null)

	useEffect(() => {
		if (hero === null) {
			setMode('create')
		} else {
			setMode('load')
		}
	}, [Boolean(hero)])

	const transitionTo = (newMode: string, nextMode: string=null) => {
		const TRANSITION_DURATION = 0.5

		setMode(null)
		setTrans('confirm')
		setNext(nextMode)

		setTimeout(() => {
			setMode(newMode)
			setTrans(null)
		}, TRANSITION_DURATION * 1000)
	}

	const onReset = () => {
		deleteSavedHeroAccess()
		transitionTo('create')
	}

	return (
		<>
			<h1 id="logo">
				<span id="logosparks"/>
			</h1>

			<section id="parchment" className={trans? 'animate' : ''}>
				<div className="parchment-left"/>

				<div className="parchment-middle">
					{mode === 'create'? (
					<NewCharacterScreen
						onPlay={onStartNewGame}
						onHelp={() => transitionTo('about', 'create')}
					/>
					)
					: mode === 'load'? (
					<LoadCharacterScreen
						onPlay={() => onLoadGame()}
						onReset={() => transitionTo('confirm')}
						onHelp={() => transitionTo('about', 'load')}
						data={hero}
					/>
					)
					: mode === 'confirm'? (
					<ResetCharacterScreen
						onCancel={() => transitionTo('load')}
						onReset={onReset}
					/>
					)
					: mode === 'about'? (
					<AboutScreen
						onClose={() => transitionTo(next)}
					/>
					)
					: null}
				</div>

				<div className="parchment-right"/>
			</section>
		</>
	)
}*/





function IntroScreen2({onStart}: {onStart: (hero: HeroInfo)=>void}) {
	const [loading, setLoading] = useState<boolean>(false)
	const [hero, setHero] = useState<HeroInfo>(null)
	const [mode, setMode] = useState<string>('create')
	const [next, setNext] = useState<string>(null)
	const [trans, setTrans] = useState<string>(null)


	const transitionTo = (newMode: string, nextMode: string=null) => {
		const TRANSITION_DURATION = 0.5

		setMode(null)
		setTrans('confirm')
		setNext(nextMode)

		setTimeout(() => {
			setMode(newMode)
			setTrans(null)
		}, TRANSITION_DURATION * 1000)
	}


	useEffect(() => {
		const heroAccess = getSavedHeroAccess()
		if (heroAccess) {
			setLoading(true)
			server.previewPlayer(heroAccess.ident, heroAccess.secret)
				.then((hero) => {
					setHero(hero)
					setMode('load')
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}, [])


	return (
		<>
			<h1 id="logo">
				<span id="logosparks"/>
			</h1>

			<section id="parchment" className={trans? 'animate' : ''}>
				<div className="parchment-left"/>

				<div className="parchment-middle">
					{loading? (
						<p>Loading...</p>
					)
					: mode === 'create'? (
					<NewCharacterScreen
						onPlay={onStart}
						onHelp={() => transitionTo('about', 'create')}
					/>
					)
					: mode === 'load'? (
					<LoadCharacterScreen
						data={hero}
						onPlay={() => onStart(hero)}
						onReset={() => transitionTo('confirm')}
						onHelp={() => transitionTo('about', 'load')}
					/>
					)
					: mode === 'confirm'? (
					<ResetCharacterScreen
						onCancel={() => transitionTo('load')}
						onReset={() => {
							deleteSavedHeroAccess()
							setHero(null)
							transitionTo('create')
						}}
					/>
					)
					: mode === 'about'? (
					<AboutScreen
						onClose={() => transitionTo(next)}
					/>
					)
					: null}
				</div>

				<div className="parchment-right"/>
			</section>
		</>
	)
}





function InstructionsScreen({onClose}: any) {
	return (
		<article id="instructions">
			<div className="close-screen" onClick={onClose}/>
			<h1>
				<span className="left-ornament"/>
				How to play
				<span className="right-ornament"/>
			</h1>
			<ul>
				<li><span className="icon"></span>Left click or tap to move, attack and pick up items.</li>
				<li><span className="icon"></span>Press ENTER to chat.</li>
				<li><span className="icon"></span>Your character is automatically saved as you play.</li>
			</ul>
			<button type="button" className="button-red" onClick={onClose}>Close</button>
		</article>
	)
}




function AchievementsScreen({achievements, onClose}: any) {
	const [page, setPage] = useState<number>(0)

	const PAGE_SIZE = 4
	const maxPage = Math.ceil(achievements.length / PAGE_SIZE) - 1
	const completed = achievements.filter(a => a.isCompleted())

	return (
		<article id="achievements" className="page1 clickable active">
			<div className="close-screen" onClick={onClose}/>
			<div id="achievements-wrapper">
				<div id="lists">
					<ul>
						{achievements.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE).map((achievement, achievementIndex) => (
						<li key={achievement.name} className={'achievement'+(achievementIndex+page*PAGE_SIZE+1)+(_.contains(completed, achievement)? ' unlocked' : '')}>
							<div className="coin"/>
							<span className="achievement-name">{achievement.name}</span>
							<span className="achievement-description">{achievement.desc}</span>
						</li>
						))}
					</ul>
				</div>
			</div>

			<div id="achievements-count" className="stroke">
				Completed&nbsp;
				<div>
					<span id="unlocked-achievements">{completed.length}</span>
					/
					<span id="total-achievements">{achievements.length}</span>
				</div>
			</div>

			<nav className={'page'+(page+1)}>
				<button type="button" className="previous" onClick={e => setPage(page-1)} disabled={page===0}/>
				<button type="button" className="next" onClick={e => setPage(page+1)} disabled={page===maxPage}/>
			</nav>
		</article>
	)
}



function showPopup(inner) {
	const div = document.createElement('div')
	div.classList.add('popup')
	document.body.appendChild(div)
	const root = ReactDOM.createRoot(div)
	root.render(inner)

	setTimeout(() => {
		div.classList.add('visible')
	}, 50)

	return {root, div}
}


function closePopup({root, div}) {
	div.classList.remove('visible')
	setTimeout(() => {
		root.unmount()
		document.body.removeChild(div)
	}, 500)
}





function Parchment({children, events, introduce}: any) {
	const [animating, setAnimating] = useState<boolean>(introduce)

	useEffect(() => {
		setTimeout(() => {
			setAnimating(false)
		}, 500)

		const onClose = () => {
			setAnimating(true)
		}
		events.on('close', onClose)
		return () => {
			events.removeListener('close', onClose)
		}
	}, [])

	return (
		<section id="parchment" className={animating? 'animate' : ''}>
			<div className="parchment-left"/>
			<div className="parchment-middle">
				{children}
			</div>
			<div className="parchment-right"/>
		</section>
	)
}


let parchmentMaster = new EventEmitter()
let parchmentPopup: any = null

function showParchment(inner) {
	parchmentPopup = showPopup(<Parchment introduce={true} events={parchmentMaster}>{inner}</Parchment>)
}

function hideParchment() {
	parchmentMaster.emit('close')
	closePopup(parchmentPopup)
	parchmentPopup = null
}





function NotificationsElement({game}: any) {
	const [message, setMessage] = useState<string>(null)
	const [timer, setTimer] = useState<any>(null)

	game.onNotification((message) => {
		if (timer) {
			clearTimeout(timer)
		}
		setMessage(message)
		setTimer(setTimeout(() => {
			setMessage(null)
			setTimer(null)
		}, 3000))
	})

	return (
		<div id="notifications">
			<p className={message? 'has-msg' : ''}>{message}</p>
		</div>
	)
}



class ActionBar extends React.Component<any, any> {
	constructor(props) {
		super(props)
		this.state = {
			achievementsPopup: null,
			characterPopup: null,
			helpPopup: null,
			showPopulation: false,
			worldPlayers: 1,
			totalPlayers: 1,
			healthBlinking: false,
			isChatActive: false,
			newAchievement: null,
		}
		this.chatboxInputRef = React.createRef()
		this.onGlobalKeyDown = this.onGlobalKeyDown.bind(this)
		this.forceUpdate = this.forceUpdate.bind(this)
	}


	componentDidMount() {
		const {game} = this.props

		game.onPlayerEquipmentChange(() => {
			this.forceUpdate()
		})
		game.onPlayerInvincible(() => {
			this.forceUpdate()
		})
		game.onGameStart(() => {
			this.forceUpdate()
		})
		game.onNbPlayersChange((worldPlayers, totalPlayers) => {
			this.setState({worldPlayers, totalPlayers})
		})
		game.onPlayerHealthChange((hp, maxHp) => {
			this.forceUpdate()
		})
		game.onPlayerHurt(() => {
			this.setState({healthBlinking: true})
			setTimeout(() => {
				this.setState({healthBlinking: false})
			}, 500)
		})
		game.onAchievementUnlock((id: any, name: string, description: string) => {
			this.setState({
				newAchievement: {id, name, description}
			})
			setTimeout(() => {
				this.setState({
					newAchievement: null
				})
			}, 3000)
		})

		window.addEventListener('keydown', this.onGlobalKeyDown)
		game.player.on('update', this.forceUpdate)
	}


	componentWillUnmount() {
		const {game} = this.props

		document.removeEventListener('keydown', this.onGlobalKeyDown)
		game.player.off('update', this.forceUpdate)
	}


	onGlobalKeyDown(event) {
		const {isChatActive, achievementsPopup, characterPopup} = this.state

		switch (event.code) {
			case 'Enter':
				if (isChatActive) {
					this.onSubmitChat(null)
				}
				else {
					setTimeout(() => {
						this.toggleChat(null)
					}, 50)
				}
				break

			case 'Escape':
				if (achievementsPopup) {
					this.toggleAchievements(null)
				}
				else if (characterPopup) {
					this.toggleCharacter(null)
				}
				else if (isChatActive) {
					this.toggleChat(null)
				}
				break
		}
	}


	toggleAchievements(event) {
		const {game} = this.props
		const {achievementsPopup} = this.state

		if (achievementsPopup) {
			closePopup(achievementsPopup)
			this.setState({achievementsPopup: null})
		} else {
			let x: any = {}
			const popup = showPopup(<AchievementsScreen achievements={Object.values(game.achievements)} onClose={() => {
				closePopup(x.popup)
				this.setState({achievementsPopup: null})
			}}/>)
			x.popup = popup
			this.setState({achievementsPopup: popup})
		}
	}


	toggleCharacter(event) {
		const {game} = this.props
		const {characterPopup} = this.state

		if (characterPopup) {
			closePopup(characterPopup)
			this.setState({characterPopup: null})
		} else {
			let x: any = {}
			const popup = showPopup(<CharacterScreen game={game} player={game.player} onClose={() => {
				closePopup(x.popup)
				this.setState({characterPopup: null})
			}}/>)
			x.popup = popup
			this.setState({characterPopup: popup})
		}
	}


	toggleHelp(event) {
		const {game} = this.props
		const {helpPopup} = this.state

		if (helpPopup) {
			hideParchment()
			this.setState({helpPopup: null})
		} else {
			showParchment(<InstructionsScreen onClose={() => {
				hideParchment()
				this.setState({helpPopup: null})
			}}/>)
			this.setState({helpPopup: true})
		}
	}


	toggleChat(event) {
		const {isChatActive} = this.state

		if (isChatActive) {
			document.getElementById('foreground').focus()
		}
		else if (this.chatboxInputRef.current) {
			this.chatboxInputRef.current.focus()
			this.chatboxInputRef.current.value = ''
		}
		this.setState({isChatActive: !isChatActive})
	}


	onSubmitChat(event) {
		const {game} = this.props
		const {isChatActive} = this.state

		if (event) {
			event.preventDefault()
		}

		if (isChatActive) {
			const text = this.chatboxInputRef.current.value.replace(/\s/g, '')
			if (text.length) {
				if(game.player) {
					game.say(text)
				}
			}
			this.chatboxInputRef.current.value = ''
			document.body.focus()
			this.setState({isChatActive: false})
		}

		return false
	}


	togglePopulation(event) {
		const {showPopulation} = this.state

		this.setState({showPopulation: !showPopulation})
	}


	toggleAudio(event) {
		const {game} = this.props

		game.audioManager.toggle()
		this.forceUpdate()
	}


	render() {
		const {game} = this.props
		const {showPopulation, isChatActive, healthBlinking, worldPlayers, totalPlayers, achievementsPopup, characterPopup, newAchievement} = this.state

		const HEALTH_BAR_WIDTH = 174

		return (
			<>
			<div id="bottom-bar">
				<div id="experience-meter">
					<div style={{width: game.player.getExperienceProgressForThisLevel()*100+'%'}}/>
				</div>

				<div id="healthbar"/>
				<div
					id="hitpoints"
					className={game.player.invincible? 'invincible' : ''+(healthBlinking? ' white' : '')}
					style={{width: Math.round((HEALTH_BAR_WIDTH / game.player.getMaxHitpoints()) * Math.max(0, game.player.getCurHitpoints()))}}
				/>

				<div id="weapon" style={{backgroundImage: 'url(/img/2/item-'+game.player.getWeaponName()+'.png)'}}/>
				<div id="armor" style={{backgroundImage: 'url(/img/2/item-'+game.player.getSpriteName()+'.png)'}}/>

				<NotificationsElement game={game}/>

				<div className="playercount" onClick={this.togglePopulation.bind(this)}>
					<span>{worldPlayers}</span> <span>player{worldPlayers!==1? 's' : ''}</span>
				</div>

				<div id="chatbutton" className="barbutton" onClick={this.toggleChat.bind(this)}/>
				<div id="achievementsbutton" className={'barbutton'+(achievementsPopup? ' active' : '')} onClick={this.toggleAchievements.bind(this)}/>
				<div id="characterbutton" className={'barbutton'+(game.player.getUnspentAttrPoints()>0? ' emphasized' : '')+(characterPopup? ' active' : '')} onClick={this.toggleCharacter.bind(this)}/>
				<div id="inventorybutton" className="barbutton" onClick={e => 'TODO'}/>
				<div id="helpbutton" className="barbutton" onClick={this.toggleHelp.bind(this)}/>
				<div id="mutebutton" className={'barbutton'+(game.audioManager?.enabled? ' active' : '')} onClick={this.toggleAudio.bind(this)}/>
			</div>

			<div id="chatbox" className={isChatActive? 'active' : ''}>
				<form onSubmit={this.onSubmitChat.bind(this)}>
					<input ref={this.chatboxInputRef} type="text" maxLength={60}/>
				</form>
			</div>

			<div id="achievement-notification" className={newAchievement? 'active achievement'+newAchievement.id : ''}>
				<div className="coin">
					<div id="coinsparks"></div>
				</div>
				<div id="achievement-info">
					<div className="title">New Achievement Unlocked!</div>
					<div className="name">{newAchievement?.name}</div>
				</div>
			</div>

			<div id="population" className={showPopulation? 'visible' : ''} onClick={this.togglePopulation.bind(this)}>
				<div>
					<span>{worldPlayers}</span> <span>player{worldPlayers!==1? 's' : ''}</span> in this world
				</div>
				<div>
					<span>{totalPlayers}</span> <span>player{totalPlayers!==1? 's' : ''}</span> total
				</div>
			</div>
			</>
		)
	}


	private chatboxInputRef: any
}




function GameScreen({hero}: {hero: HeroInfo}) {
	const [game, setGame] = useState<Game>(null)


	useEffect(() => {
		const newGame = new Game(
			'#bubbles',
			document.getElementById("entities"),
			document.getElementById("background"),
			document.getElementById("foreground")
		)

		newGame.readyPromise.then(() => {
			newGame.enter(hero).then(() => {
				setGame(newGame)
			})
		})

		newGame.onPlayerDeath(() => {
			showParchment(<DeathInfo onRevive={() => {
				newGame.audioManager.playSound("revive")
				newGame.restart(hero)
				hideParchment()
			}}/>)
		})

		newGame.onDisconnect((message) => {
			showParchment(<DisconnectInfo message={message} onReload={() => {
				window.location.reload()
			}}/>)
		})

		const setMouseCoordinates = (event) => {
			const gamePos = document.getElementById('foreground').getBoundingClientRect()
			const scale = newGame.renderer.getScaleFactor()
			const width = newGame.renderer.getWidth()
			const height = newGame.renderer.getHeight()
			const x = event.pageX - gamePos.left - (newGame.renderer.mobile ? 0 : 5 * scale)
			const y = event.pageY - gamePos.top - (newGame.renderer.mobile ? 0 : 7 * scale)
			newGame.mouse.x = Math.max(0, Math.min(width-1, x))
			newGame.mouse.y = Math.max(0, Math.min(height-1, y))
			newGame.movecursor()
		}
		const onMouseMove = (event) => {
			setMouseCoordinates(event)
		}
		const onTouchStart = (event) => {
			setMouseCoordinates(event.originalEvent.touches[0])
			newGame.click()
		}
		const onClick = (event) => {
			setMouseCoordinates(event)
			newGame.click()
		}

		const canvas = document.getElementById('foreground')
		canvas.addEventListener('mousemove', onMouseMove)
		canvas.addEventListener('touchstart', onTouchStart)
		canvas.addEventListener('click', onClick)

		return () => {
			canvas.removeEventListener('mousemove', onMouseMove)
			canvas.removeEventListener('touchstart', onTouchStart)
			canvas.removeEventListener('click', onClick)
		}
	}, [])


	return (
		<div id="container">
			<div id="canvasborder">
				<div id="canvas">
					<canvas id="background"/>
					<canvas id="entities"/>
					<canvas id="foreground"></canvas>
				</div>

				<div id="bubbles"></div>

				{Boolean(game) && (
				<ActionBar game={game}/>
				)}
			</div>
		</div>
	)
}



function getSavedHeroAccess(): HeroAccessInfo|null {
	try {
		const {ident, secret} = JSON.parse(window.localStorage.hero)
		if (typeof ident!=='string' || typeof secret!=='string') {
			return null
		}
		return {ident, secret}
	}
	catch (err) {
		return null
	}
}

function deleteSavedHeroAccess() {
	window.localStorage.removeItem('hero')
}

function saveHeroAccess(data: HeroAccessInfo) {
	window.localStorage.hero = JSON.stringify(data)
}





function Everything() {
	const [hero, setHero] = useState<HeroInfo>(null)

	return (
		<div>
			{hero===null? (
				<IntroScreen2 onStart={(newHero) => {
					setHero(newHero)
					saveHeroAccess({
						ident: newHero.ident,
						secret: newHero.secret
					})
				}}/>
			) : (
				<GameScreen hero={hero}/>
			)}
		</div>
	)
}





const container = document.createElement('div')
document.body.appendChild(container)
const root = ReactDOM.createRoot(container)
root.render(<Everything/>)
