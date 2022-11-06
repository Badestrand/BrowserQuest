import * as _ from 'underscore'
import * as React from 'react'
import {useState, useEffect, useRef} from 'react'

import CharacterScreen from './CharacterScreen'
import Game from '../game'
import {showPopup, closePopup, showParchment, hideParchment} from './utils'




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




export default class ActionBar extends React.Component<any, any> {
	constructor(props) {
		super(props)
		const {game} = props
		this.state = {
			achievementsPopup: null,
			characterPopup: null,
			helpPopup: null,
			showPopulation: false,
			worldPlayers: game.population.worldPlayers,
			totalPlayers: game.population.totalPlayers,
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
			console.log('ActionBar, on population change', worldPlayers, totalPlayers)
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